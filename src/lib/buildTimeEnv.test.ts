import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every VITE_ variable the source reads must be declared as an ARG in the
 * Dockerfile.
 *
 * Vite inlines these at build time, and the build happens inside the image.
 * Railway passes service variables to the Docker build, but only an ARG
 * declared in the Dockerfile can receive one. Miss that and the variable is
 * set in Railway, absent from the build, and the feature it controls is
 * simply not in the bundle — no error, no warning, a deploy that looks
 * entirely successful and a button nobody can see.
 *
 * That is exactly how Microsoft sign-in shipped configured-but-invisible: the
 * variable was added to Railway, the service redeployed, and the built bundle
 * had the whole component tree-shaken out of it because the build could not
 * see the value. It took reading the deployed JavaScript to work out why.
 *
 * Asserting over the whole source tree rather than a list kept by hand is the
 * point: the failure is a *new* variable added without its ARG, and only
 * something that enumerates what the code reads can catch a variable that
 * does not exist yet.
 */

const ROOT = join(import.meta.dirname, '../..')
const READS_VITE_VAR = /import\.meta\.env\.(VITE_[A-Z0-9_]+)/g
const DECLARES_ARG = /^ARG\s+(VITE_[A-Z0-9_]+)/gm

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
        const path = join(dir, entry)
        if (statSync(path).isDirectory()) return sourceFiles(path)
        return /\.(ts|tsx|mjs)$/.test(entry) ? [path] : []
    })
}

function variablesTheSourceReads(): Map<string, string[]> {
    const found = new Map<string, string[]>()
    for (const dir of ['src', 'scripts']) {
        for (const file of sourceFiles(join(ROOT, dir))) {
            // The type declaration lists what *may* exist; it does not read
            // anything, so it cannot be what puts a variable on this list.
            if (file.endsWith('vite-env.d.ts')) continue
            const text = readFileSync(file, 'utf8')
            for (const [, name] of text.matchAll(READS_VITE_VAR)) {
                found.set(name, [...(found.get(name) ?? []), file.slice(ROOT.length + 1)])
            }
        }
    }
    return found
}

function argsTheDockerfileDeclares(): Set<string> {
    const text = readFileSync(join(ROOT, 'Dockerfile'), 'utf8')
    return new Set([...text.matchAll(DECLARES_ARG)].map(([, name]) => name))
}

describe('build-time environment variables', () => {
    it('declares an ARG for every VITE_ variable the source reads', () => {
        const read = variablesTheSourceReads()
        const declared = argsTheDockerfileDeclares()

        const missing = [...read.entries()]
            .filter(([name]) => !declared.has(name))
            .map(([name, files]) => `${name} (read in ${files.join(', ')})`)

        expect(
            missing,
            'These variables are read at build time but the Docker build ' +
                'cannot see them, so they will be undefined in the bundle ' +
                'however they are set in Railway. Add to the Dockerfile:\n' +
                missing
                    .map((m) => {
                        const name = m.split(' ')[0]
                        return `  ARG ${name}\n  ENV ${name}=$${name}`
                    })
                    .join('\n') +
                '\n\nIf the variable is no longer used, delete the read instead.'
        ).toEqual([])
    })

    it('finds the variables at all, so a broken matcher cannot pass silently', () => {
        // Without this, a regex that stopped matching would make the test
        // above trivially true and the guard would quietly stop guarding.
        const read = variablesTheSourceReads()
        expect(read.size).toBeGreaterThan(0)
        expect([...read.keys()]).toContain('VITE_GOOGLE_CLIENT_ID')
        expect([...read.keys()]).toContain('VITE_MICROSOFT_CLIENT_ID')
    })

    it('reads the Dockerfile ARGs at all, for the same reason', () => {
        expect(argsTheDockerfileDeclares().size).toBeGreaterThan(0)
    })
})

/**
 * The Microsoft sign-in popup is returned to a blank page, not to the app.
 *
 * Whatever sits at the redirect URI gets loaded in full before MSAL can read
 * the result out of it. Pointing it at the site root meant the browser booted
 * a second copy of the entire application inside the popup — 3.8MB, homepage,
 * header, signed-in name — purely to hand one value back to its opener, while
 * the button sat on "Signing in…" waiting for it.
 *
 * Two things have to stay true, and neither is visible from the component:
 * the file has to exist, and serve.json must not rewrite its path to
 * index.html — which is exactly what would happen anywhere under /auth/.
 */
describe('the Microsoft sign-in callback page', () => {
    const CALLBACK = 'msal-callback.html'

    it('exists as a build entry, not a file in public/', () => {
        // It has to be built, because it has to run MSAL. A copy in public/
        // would be shipped verbatim with an unresolved module path and would
        // silently do nothing — which is the failure it exists to fix.
        expect(() => readFileSync(join(ROOT, CALLBACK), 'utf8')).not.toThrow()
        expect(() =>
            readFileSync(join(ROOT, 'public', CALLBACK), 'utf8')
        ).toThrow()

        const vite = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8')
        expect(vite).toContain(CALLBACK)
    })

    it('runs MSAL, because a page that does not never returns the sign-in', () => {
        // MSAL v5 relays the result from this page to the one that opened it
        // over a BroadcastChannel. Earlier versions had the opener poll the
        // popup's URL, so a blank page worked; under v5 a page that does not
        // load MSAL posts nothing and the opener waits until it times out.
        const page = readFileSync(join(ROOT, CALLBACK), 'utf8')
        expect(page).toContain('src/msalCallback.ts')

        const script = readFileSync(join(ROOT, 'src/msalCallback.ts'), 'utf8')
        expect(script).toContain('handleRedirectPromise')
    })

    it('shares one MSAL configuration with the button', () => {
        // MSAL pairs the popup with its callback by configuration. A clientId
        // or redirectUri that differed between them would start a sign-in that
        // never comes back, and each file would look correct on its own.
        for (const file of [
            'src/msalCallback.ts',
            'src/components/auth/MicrosoftSignInButton.tsx',
        ]) {
            expect(readFileSync(join(ROOT, file), 'utf8')).toContain(
                'msalConfig'
            )
        }
    })

    it('is requested at the URL the server actually answers', () => {
        // `serve` answers /msal-callback from this file but 301s
        // /msal-callback.html to it. MSAL sends the redirect URI to Microsoft
        // to start the sign-in and again to redeem the code, so it has to be
        // the URL that exists rather than one that redirects to it.
        const body = readFileSync(join(ROOT, 'src/lib/msalConfig.ts'), 'utf8')
            // Comments explain the .html file this is served from; only the
            // code is under test.
            .replace(/\/\*\*[\s\S]*?\*\//g, '')
        expect(body).toContain('/msal-callback`')
        expect(body).not.toContain('msal-callback.html')
    })

    it('is the page the sign-in actually points at', () => {
        const config = readFileSync(join(ROOT, 'src/lib/msalConfig.ts'), 'utf8')
        expect(config).toMatch(/redirectUri:\s*msalRedirectUri\(\)/)
        // The bug this replaces: redirectUri was the site origin alone, so
        // Microsoft returned the popup to the application.
        expect(config).not.toMatch(
            /redirectUri:\s*window\.location\.origin\s*,/
        )
    })

    it('loads MSAL and nothing else — no React, no router, no app', () => {
        const page = readFileSync(join(ROOT, CALLBACK), 'utf8')
        // Exactly one script: the relay. Pulling in the application here
        // would put back the 3.8MB second copy this replaced.
        expect(page.match(/<script/gi)).toHaveLength(1)
        expect(page).not.toMatch(/<link[^>]+stylesheet/i)
        expect(page.length).toBeLessThan(4000)

        const script = readFileSync(join(ROOT, 'src/msalCallback.ts'), 'utf8')
        expect(script).not.toMatch(/from 'react|react-dom|react-router/)
    })

    it('is not shadowed by a serve.json rewrite', () => {
        // Under /auth/** it would be rewritten to index.html and quietly
        // become the app again, reintroducing the bug with the fix in place.
        const rewrites: { source: string }[] = JSON.parse(
            readFileSync(join(ROOT, 'public', 'serve.json'), 'utf8')
        ).rewrites
        const shadowed = rewrites.filter(({ source }) => {
            const prefix = source.replace(/\*+$/, '')
            return '/msal-callback'.startsWith(prefix) && prefix !== '/'
        })
        expect(shadowed).toEqual([])
    })
})
