import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { LANDING_PAGES, LANDING_PAGE_FOR } from '@/content/landingPages.mjs'
import { GUIDES } from '@/content/guides.mjs'

/**
 * The practice-test landing pages.
 *
 * These exist to catch "esat physics practice test" and "tmua paper 2 practice
 * test", which the guides do not: a guide answers "what does this paper ask of
 * me", and someone typing "practice test" wants the paper. So the tests that
 * matter are the ones about the page still being that — the query phrasing
 * intact, the paper and the mini promoted — and about it staying a different
 * page from its guide, which is what keeps the two from competing.
 */

const DIST_BUILT = existsSync('dist/sitemap.xml')
const whenBuilt = DIST_BUILT ? describe : describe.skip
const built = (path: string) => readFileSync(`dist${path}/index.html`, 'utf8')
const decode = (s: string) =>
    s
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')

const esat = LANDING_PAGES.filter((p) => p.path.startsWith('/esat-'))
const tmua = LANDING_PAGES.filter((p) => p.path.startsWith('/tmua-'))

describe('every paper has one', () => {
    it('covers all five ESAT subjects and both TMUA papers', () => {
        expect(LANDING_PAGES).toHaveLength(7)
        for (const subject of [
            'Mathematics 1',
            'Mathematics 2',
            'Physics',
            'Chemistry',
            'Biology',
        ]) {
            expect(esat.some((p) => p.h1 === `ESAT ${subject} practice test`)).toBe(
                true
            )
        }
        for (const paper of ['Paper 1', 'Paper 2']) {
            expect(tmua.some((p) => p.h1 === `TMUA ${paper} practice test`)).toBe(
                true
            )
        }
    })

    it('keeps the query phrasing in the h1 and the title', () => {
        // The whole reason these pages exist. Reworded to something more
        // elegant, they stop matching what students type.
        for (const page of LANDING_PAGES) {
            expect(page.h1).toMatch(/^(ESAT|TMUA) .+ practice test$/)
            expect(page.title).toMatch(/^(ESAT|TMUA) .+ Practice Test —/)
        }
    })

    it('keeps the title short enough not to be cut off in results', () => {
        for (const page of LANDING_PAGES) {
            expect(page.title.length, page.title).toBeLessThanOrEqual(65)
        }
    })

    it('is not listed among the guides', () => {
        // Same content shape, different job: a product surface on the /guides
        // index would dilute a list of explanatory pages.
        const guidePaths = GUIDES.map((g) => g.path)
        for (const page of LANDING_PAGES) {
            expect(guidePaths).not.toContain(page.path)
        }
    })
})

describe('what each page promotes', () => {
    it('offers the full paper and the mini, for its own test', () => {
        for (const page of LANDING_PAGES) {
            const links = page.sections.flatMap((s) => s.links ?? [])
            expect(
                links.some((l) => l.path.startsWith('/diagnostic/sets/'))
            ).toBe(true)
            const test = page.path.startsWith('/tmua-') ? 'tmua' : 'esat'
            expect(page.ctaPath).toBe(`/diagnostics/${test}`)
        }
    })

    it('carries no worked solution — that is the guide’s job', () => {
        // Embedding the guide's worked example made a third of each landing
        // page a copy of its guide, and the two competed for the same searches.
        for (const page of LANDING_PAGES) {
            expect(page.workedExamples ?? []).toHaveLength(0)
        }
    })

    it('previews a question from the subject guide, and links to its working', () => {
        for (const page of esat) {
            const preview = page.questionPreview
            expect(preview, `${page.path} has no question`).toBeDefined()
            const [guidePath, anchor] = preview!.solutionPath.split('#')
            const guide = GUIDES.find((g) => g.path === guidePath)
            const example = guide?.workedExamples?.find((e) => e.id === anchor)
            expect(example, `${preview!.solutionPath} points at nothing`).toBeDefined()
            expect(preview!.question).toBe(example!.question)
            expect(page.sections.map((s) => s.id)).toContain('question-preview')
        }
    })

    it('links each ESAT subject guide to its own landing page', () => {
        for (const [guidePath, landingPath] of Object.entries(
            LANDING_PAGE_FOR
        )) {
            const guide = GUIDES.find((g) => g.path === guidePath)
            expect(
                guide?.related?.map((r) => r.path),
                `${guidePath} tail`
            ).toContain(landingPath)
            expect(
                guide?.related,
                `${guidePath} keeps three links`
            ).toHaveLength(3)
        }
    })

    it('links the TMUA guide to both paper pages', () => {
        const guide = GUIDES.find((g) => g.path === '/guides/tmua-practice-tests')
        const links = guide!.sections.flatMap((s) => s.links ?? []).map((l) => l.path)
        for (const page of tmua) expect(links).toContain(page.path)
    })

    it('no longer titles a module guide as "practice papers"', () => {
        // That is the landing page's search. Two titles targeting it is the
        // self-competition these pages were split to stop.
        for (const path of Object.keys(LANDING_PAGE_FOR)) {
            const guide = GUIDES.find((g) => g.path === path)
            expect(guide!.title).not.toMatch(/practice (papers?|tests?)/i)
        }
    })
})

whenBuilt('the built pages', () => {
    it('serves each sample paper it links to', () => {
        for (const page of esat) {
            const download = page.sections.flatMap((s) => s.downloads ?? [])[0]
            expect(download, `${page.path} has no sample paper`).toBeDefined()
            expect(
                existsSync(`dist${download.path}`),
                `${download.path} is linked but not built`
            ).toBe(true)
        }
    })

    it('shows the question and options without JS, but not the working', () => {
        for (const page of esat) {
            const html = decode(built(page.path))
            const preview = page.questionPreview!
            expect(html).toContain(preview.question)
            for (const o of preview.options) expect(html).toContain(o.text)
            expect(html).toContain(`href="${preview.solutionPath}"`)

            const [guidePath, anchor] = preview.solutionPath.split('#')
            const example = GUIDES.find((g) => g.path === guidePath)!
                .workedExamples!.find((e) => e.id === anchor)!
            for (const text of [
                example.takeaway,
                ...example.steps,
                ...example.options!.filter((o) => o.misconception).map((o) => o.misconception!),
            ]) {
                expect(html, `${page.path} repeats "${text.slice(0, 40)}"`).not.toContain(
                    text
                )
            }
        }
    })

    it('is actually linked from its guide, not just listed in the data', () => {
        // The guides named these pages in `related` from the start, and the
        // renderer dropped every one because it only resolved guides. The
        // content-level check above passed throughout; only the HTML can say
        // whether a crawler has a link to follow.
        for (const [guidePath, landingPath] of Object.entries(LANDING_PAGE_FOR)) {
            expect(built(guidePath), `${guidePath} → ${landingPath}`).toContain(
                `href="${landingPath}"`
            )
        }
    })

    it('keeps the full working on the guide the preview links to', () => {
        for (const page of esat) {
            const [guidePath, anchor] = page.questionPreview!.solutionPath.split('#')
            const html = decode(built(guidePath))
            expect(html).toContain(`id="${anchor}"`)
        }
    })

    it('states the format once and links for the rest', () => {
        // A product surface may say what the paper is; it may not become a
        // second home for scoring, which is what the canonical rule stops.
        for (const page of LANDING_PAGES) {
            const html = built(page.path)
            const guide = page.path.startsWith('/tmua-')
                ? '/guides/tmua-practice-tests'
                : '/guides/esat-practice-tests'
            expect(html).toContain(`href="${guide}"`)
        }
    })
})
