import { describe, expect, it } from 'vitest'
import { GUIDES } from './guides.mjs'
import { guideJsonLd, jsonLdText } from './structuredData.mjs'
import { AUTHOR } from './author.mjs'

const SITE = 'https://www.jomexam.com'

/**
 * Structured data is only worth emitting if it describes the page honestly.
 * Nothing here checks that it looks nice — it checks the claims are ones the
 * page actually backs up.
 */
describe.each(GUIDES.map((guide) => [guide.h1, guide] as const))(
    '%s',
    (_name, guide) => {
        const blocks = guideJsonLd(guide, SITE)
        const typeOf = (type: string) =>
            blocks.find((b) => (b as { '@type': string })['@type'] === type)

        it('describes itself as an Article with a real author', () => {
            const article = typeOf('Article') as Record<string, never>
            expect(article).toBeDefined()
            expect((article.author as unknown as { name: string }).name).toBe(
                AUTHOR.name
            )
        })

        it('states when it was published and last checked', () => {
            const article = typeOf('Article') as unknown as {
                datePublished: string
                dateModified: string
            }
            // A guide to a test whose dates move every cycle is worth little
            // undated, and Google will not invent one.
            expect(article.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/)
            expect(article.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
            expect(
                new Date(article.dateModified) >= new Date(article.datePublished)
            ).toBe(true)
        })

        it('points its canonical identity at its own URL', () => {
            const article = typeOf('Article') as unknown as {
                mainEntityOfPage: { '@id': string }
            }
            expect(article.mainEntityOfPage['@id']).toBe(`${SITE}${guide.path}`)
        })

        it('claims exactly the questions the page answers', () => {
            const faq = typeOf('FAQPage') as unknown as {
                mainEntity: { name: string }[]
            }
            // Marking up Q&A a reader cannot see is the classic way to have
            // structured data ignored across a whole site.
            expect(faq.mainEntity.map((q) => q.name)).toEqual(
                guide.faq.map((f) => f.q)
            )
        })

        it('emits FAQPage once, not once per builder', () => {
            const faqBlocks = blocks.filter(
                (b) => (b as { '@type': string })['@type'] === 'FAQPage'
            )
            expect(faqBlocks).toHaveLength(1)
        })

        it('leads a crawler back up the site through the breadcrumb', () => {
            const crumbs = typeOf('BreadcrumbList') as unknown as {
                itemListElement: { position: number; item: string }[]
            }
            expect(crumbs.itemListElement.map((c) => c.item)).toEqual([
                SITE,
                `${SITE}/guides`,
                `${SITE}${guide.path}`,
            ])
        })
    }
)

describe('jsonLdText', () => {
    it('cannot be broken out of by the content it carries', () => {
        // A guide that mentions a closing script tag in its prose would
        // otherwise end the block early and spill the rest onto the page.
        const hostile = {
            ...GUIDES[0],
            h1: 'Mind the </script> tag',
            faq: [],
        }
        const text = jsonLdText(guideJsonLd(hostile, SITE))

        expect(text).not.toContain('</script>')
        expect(JSON.parse(text)).toBeInstanceOf(Array)
    })
})

describe('worked examples', () => {
    const withExamples = GUIDES.filter((g) => g.workedExamples !== undefined)

    it('are present on the past-papers guide', () => {
        expect(withExamples.length).toBeGreaterThan(0)
    })

    it.each(withExamples.flatMap((g) => g.workedExamples ?? []))(
        'shows its reasoning and its answer: $id',
        (example) => {
            // The point of these pages is the working, not the answer. A
            // worked example with no steps is a thin page with extra words.
            expect(example.steps.length).toBeGreaterThanOrEqual(2)
            expect(example.answer.trim()).not.toBe('')
            expect(example.takeaway.trim()).not.toBe('')
        }
    )
})
