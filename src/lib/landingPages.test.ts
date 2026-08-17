import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { LANDING_PAGES, LANDING_PAGE_FOR } from '@/content/landingPages.mjs'
import { GUIDES } from '@/content/guides.mjs'

/**
 * The subject practice-test landing pages.
 *
 * These exist to catch "esat physics practice test", which the guides do not:
 * a guide answers "what does this module ask of me", and someone typing
 * "practice test" wants the paper. So the tests that matter are the ones about
 * the page still being that — the query phrasing intact, the paper and the
 * mini promoted and nothing else, and the solution readable without JS.
 */

const built = (path: string) => readFileSync(`dist${path}/index.html`, 'utf8')
const decode = (s: string) =>
    s
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')

describe('every subject has one', () => {
    it('covers all five ESAT subjects', () => {
        expect(LANDING_PAGES).toHaveLength(5)
        for (const subject of [
            'Mathematics 1',
            'Mathematics 2',
            'Physics',
            'Chemistry',
            'Biology',
        ]) {
            expect(
                LANDING_PAGES.some(
                    (p) => p.h1 === `ESAT ${subject} practice test`
                )
            ).toBe(true)
        }
    })

    it('keeps the query phrasing in the h1 and the title', () => {
        // The whole reason these pages exist. Reworded to something more
        // elegant, they stop matching what students type.
        for (const page of LANDING_PAGES) {
            expect(page.h1).toMatch(/^ESAT .+ practice test$/)
            expect(page.title).toMatch(/^ESAT .+ Practice Test —/)
        }
    })

    it('is not listed among the guides', () => {
        // Same content shape, different job: a product surface on the /guides
        // index would dilute a list of nine explanatory pages.
        const guidePaths = GUIDES.map((g) => g.path)
        for (const page of LANDING_PAGES) {
            expect(guidePaths).not.toContain(page.path)
        }
    })
})

describe('what each page promotes', () => {
    it('offers the full paper and the mini, and nothing else', () => {
        for (const page of LANDING_PAGES) {
            const links = page.sections.flatMap((s) => s.links ?? [])
            expect(
                links.some((l) => l.path.startsWith('/diagnostic/sets/'))
            ).toBe(true)
            expect(page.ctaPath).toBe('/diagnostics/esat')
        }
    })

    it('embeds exactly one question — this page is the paper, not a warm-up', () => {
        for (const page of LANDING_PAGES) {
            expect(page.workedExamples).toHaveLength(1)
        }
    })

    it('takes that question from the subject guide rather than inventing one', () => {
        for (const page of LANDING_PAGES) {
            const guidePath = page.related?.[0]?.path
            const guide = GUIDES.find((g) => g.path === guidePath)
            const ids = guide?.workedExamples?.map((e) => e.id) ?? []
            expect(ids).toContain(page.workedExamples![0].id)
        }
    })

    it('links each subject guide to its own landing page', () => {
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
})

describe('the built pages', () => {
    it('serves each sample paper it links to', () => {
        for (const page of LANDING_PAGES) {
            const download = page.sections.flatMap((s) => s.downloads ?? [])[0]
            expect(download, `${page.path} has no sample paper`).toBeDefined()
            expect(
                existsSync(`dist${download.path}`),
                `${download.path} is linked but not built`
            ).toBe(true)
        }
    })

    it('has the whole solution in the HTML, without JS', () => {
        for (const page of LANDING_PAGES) {
            const html = decode(built(page.path))
            const example = page.workedExamples![0]
            for (const text of [
                example.question,
                example.answer,
                example.takeaway,
                ...example.steps,
                ...example
                    .options!.filter((o) => o.misconception)
                    .map((o) => o.misconception!),
            ]) {
                expect(html, `${page.path}: "${text.slice(0, 40)}"`).toContain(
                    text
                )
            }
        }
    })

    it('states the format once and links for the rest', () => {
        // A product surface may say what the paper is; it may not become a
        // second home for scoring, which is what the canonical rule stops.
        for (const page of LANDING_PAGES) {
            const html = built(page.path)
            expect(html).toContain('href="/guides/esat-practice-tests"')
        }
    })
})
