import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every route must be reachable on a hard refresh. The production server
 * (`serve dist`) resolves real files first — which is what makes the
 * prerendered marketing pages work — and only then applies the rewrites in
 * public/serve.json. A route that is neither prerendered nor rewritten
 * returns a 404 to a student refreshing the page, so this test pins the
 * coverage rather than trusting anyone to remember.
 */
const ROOT = join(__dirname, '..', '..')

/** Children of <Route path="/auth">, so their real URLs are /auth/login
 * etc. and the /auth/** rewrite covers them. */
const NESTED_UNDER_AUTH = new Set(['login', 'signup', 'verify', 'more-info'])

const PRERENDERED = new Set([
    '',
    'about',
    'admissions',
    'diagnostics',
    'esat-tmua',
    'subjects',
    'guides',
    // One prerendered file per published subject, generated from the API at
    // build time. Deliberately *not* rewritten in serve.json: `serve` applies
    // rewrites before looking at disk, so a rewrite would serve the homepage
    // instead of the page — which is precisely the bug this replaced.
    'spm',
])

function routeSegments(): string[] {
    const app = readFileSync(join(ROOT, 'src', 'App.tsx'), 'utf8')
    const paths = [...app.matchAll(/path="([^"]+)"/g)].map((m) => m[1])
    return [
        ...new Set(
            paths
                .map((p) => p.replace(/^\//, '').split('/')[0])
                .filter((p) => p.length > 0)
        ),
    ]
}

function rewriteSources(): string[] {
    const json = JSON.parse(
        readFileSync(join(ROOT, 'public', 'serve.json'), 'utf8')
    )
    return json.rewrites.map((r: { source: string }) => r.source)
}

describe('serve.json rewrites', () => {
    it('covers every router segment that is not prerendered', () => {
        const sources = rewriteSources()
        const uncovered = routeSegments().filter((seg) => {
            if (PRERENDERED.has(seg)) return false
            if (NESTED_UNDER_AUTH.has(seg)) return false
            return !sources.some(
                (s) => s === `/${seg}` || s === `/${seg}/**`
            )
        })
        expect(uncovered).toEqual([])
    })

    it('has no catch-all, which would bypass the prerendered pages', () => {
        // serve applies rewrites before checking disk: "**" would send every
        // marketing URL to the generic shell and undo the prerender.
        expect(rewriteSources()).not.toContain('**')
        expect(rewriteSources()).not.toContain('/**')
    })
})
