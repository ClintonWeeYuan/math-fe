import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { GUIDES } from '@/content/guides.mjs'
import { GUIDE_LINKS } from '@/content/guideLinks.mjs'

const DIST = join(__dirname, '..', '..', 'dist')

/**
 * Reads the built HTML, so it only means anything after a build. What it
 * checks is the thing that is easy to get wrong and impossible to see: a
 * link rendered by React exists for a reader and may not exist for a
 * crawler, because the crawlable copy is written separately by
 * scripts/prerender.mjs.
 */
const built = existsSync(join(DIST, 'index.html'))
const whenBuilt = built ? describe : describe.skip

function staticHtml(route: string) {
    const file = route === '/' ? 'index.html' : `${route.slice(1)}/index.html`
    return readFileSync(join(DIST, file), 'utf8')
}

/** Real <a href> elements only — the sole kind Google is certain to follow. */
function linkedGuides(html: string) {
    return GUIDES.map((g) => g.path).filter((path) =>
        html.includes(`href="${path}"`)
    )
}

whenBuilt('the guides are reachable without running JavaScript', () => {
    it('puts every guide one click from the homepage', () => {
        // The brief's central ask: direct links, not just a link to the hub
        // that lists them.
        expect(linkedGuides(staticHtml('/')).sort()).toEqual(
            GUIDES.map((g) => g.path).sort()
        )
    })

    it.each(['/admissions', '/spm/chemistry', '/spm/chemistry/rate-of-reaction'])(
        '%s links the guides',
        (route) => {
            expect(linkedGuides(staticHtml(route)).length).toBeGreaterThan(0)
        }
    )

    it('links the matching guide from each diagnostics page', () => {
        expect(staticHtml('/diagnostics/esat')).toContain(
            'href="/guides/esat-practice-tests"'
        )
        expect(staticHtml('/diagnostics/tmua')).toContain(
            'href="/guides/tmua-practice-tests"'
        )
    })

    it('reaches the past-papers guide from far more than one page', () => {
        // It launched with a single inbound link, from /guides — which is the
        // exact problem identified for the practice guide.
        const files = ['/', '/admissions', '/diagnostics/esat', '/spm/chemistry']
        for (const route of files) {
            expect(
                staticHtml(route),
                `${route} does not link the past-papers guide`
            ).toContain('href="/guides/esat-past-papers"')
        }
    })

    it('never uses anchor text that says nothing', () => {
        // Anchor text is one of the few signals telling Google what the
        // target is about; "read more" spends it on nothing.
        for (const link of GUIDE_LINKS) {
            expect(link.anchor.toLowerCase()).not.toMatch(
                /^(read more|click here|learn more|here)$/
            )
            expect(link.anchor.length).toBeGreaterThan(8)
        }
    })

    it('describes each guide by its own name', () => {
        const html = staticHtml('/spm/chemistry')
        for (const link of GUIDE_LINKS) {
            expect(html).toContain(`>${link.anchor}</a>`)
        }
    })
})
