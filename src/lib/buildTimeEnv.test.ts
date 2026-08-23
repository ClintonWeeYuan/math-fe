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

    it('exists as a real file that can be served', () => {
        expect(() =>
            readFileSync(join(ROOT, 'public', CALLBACK), 'utf8')
        ).not.toThrow()
    })

    it('is the page the button actually points at', () => {
        const source = readFileSync(
            join(ROOT, 'src/components/auth/MicrosoftSignInButton.tsx'),
            'utf8'
        )
        expect(source).toContain(`/${CALLBACK}`)
        // The bug this replaces: redirectUri was the origin alone.
        expect(source).not.toMatch(/redirectUri:\s*window\.location\.origin\s*,/)
    })

    it('loads nothing — no scripts, no stylesheets, no app', () => {
        const page = readFileSync(join(ROOT, 'public', CALLBACK), 'utf8')
        expect(page).not.toMatch(/<script/i)
        expect(page).not.toMatch(/<link[^>]+stylesheet/i)
        // The whole point is that it is small enough to load instantly.
        expect(page.length).toBeLessThan(4000)
    })

    it('is not shadowed by a serve.json rewrite', () => {
        // Under /auth/** it would be rewritten to index.html and quietly
        // become the app again, reintroducing the bug with the fix in place.
        const rewrites: { source: string }[] = JSON.parse(
            readFileSync(join(ROOT, 'public', 'serve.json'), 'utf8')
        ).rewrites
        const shadowed = rewrites.filter(({ source }) => {
            const prefix = source.replace(/\*+$/, '')
            return `/${CALLBACK}`.startsWith(prefix) && prefix !== '/'
        })
        expect(shadowed).toEqual([])
    })
})
