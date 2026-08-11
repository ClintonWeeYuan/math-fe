import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { GUIDES } from '@/content/guides.mjs'

const ROOT = join(__dirname, '..', '..')
const DIST = join(ROOT, 'dist')
const NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'

/**
 * These read dist/, so they only mean anything after a build. Skipped rather
 * than failed when it is absent, so `pnpm test` on a clean checkout does not
 * report a problem that is not one.
 */
const built = existsSync(join(DIST, 'sitemap.xml'))
const whenBuilt = built ? describe : describe.skip

function read(name: string) {
    return readFileSync(join(DIST, name), 'utf8')
}

whenBuilt('the sitemap index', () => {
    it('points at both children and lists no URLs of its own', () => {
        const xml = read('sitemap.xml')
        expect(xml).toContain('<sitemapindex')
        expect(xml).toContain('/sitemap-core.xml')
        expect(xml).toContain('/sitemap-spm.xml')
        expect(xml).not.toContain('<url>')
    })

    it.each(['sitemap.xml', 'sitemap-core.xml', 'sitemap-spm.xml'])(
        '%s declares the sitemaps.org namespace and starts without a BOM',
        (name) => {
            const raw = readFileSync(join(DIST, name))
            // A BOM makes some validators reject the file outright, and it is
            // invisible in every editor that would show you the problem.
            expect(raw[0]).not.toBe(0xef)
            const xml = raw.toString('utf8')
            expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
            expect(xml).toContain(NS)
        }
    )

    it('splits every submitted URL into exactly one child', () => {
        const core = read('sitemap-core.xml').match(/<loc>/g) ?? []
        const spm = read('sitemap-spm.xml').match(/<loc>/g) ?? []
        expect(core.length).toBeGreaterThan(0)
        expect(spm.length).toBeGreaterThan(0)

        const locs = (xml: string) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])
        const overlap = locs(read('sitemap-core.xml')).filter((l) =>
            locs(read('sitemap-spm.xml')).includes(l)
        )
        // A URL in two sitemaps is a URL Search Console cannot attribute to
        // either, which defeats the only reason for splitting them.
        expect(overlap).toEqual([])
    })

    it('puts the guides in core, not with the SPM pages', () => {
        const core = read('sitemap-core.xml')
        for (const guide of GUIDES) expect(core).toContain(guide.path)
        expect(read('sitemap-spm.xml')).not.toContain('/guides/')
    })

    it('never emits priority or changefreq', () => {
        // Google ignores both, and they invite arguments about numbers that
        // change nothing.
        for (const name of ['sitemap-core.xml', 'sitemap-spm.xml']) {
            expect(read(name)).not.toContain('<priority>')
            expect(read(name)).not.toContain('<changefreq>')
        }
    })

    it('claims lastmod only where a real date exists', () => {
        // The SPM pages come from the questions table, which has created_at
        // and no updated_at — editing a question through the admin would
        // never move the date. A lastmod that lies teaches Google to ignore
        // the field site-wide, so those pages carry none.
        expect(read('sitemap-spm.xml')).not.toContain('<lastmod>')

        const dated = [...read('sitemap-core.xml').matchAll(/<lastmod>(.*?)<\/lastmod>/g)]
        expect(dated).toHaveLength(GUIDES.length)
        for (const [, value] of dated) expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
})

/**
 * Which content module each guide comes from, discovered rather than listed.
 *
 * This was a hand-written map, and adding five guides broke it immediately —
 * exactly the bookkeeping that gets forgotten, in a test whose job is to
 * notice things being forgotten.
 */
const CONTENT_MODULES = import.meta.glob('/src/content/*.mjs', { eager: true })

function contentFileFor(path: string) {
    for (const [file, mod] of Object.entries(CONTENT_MODULES)) {
        const guide = (mod as { GUIDE?: { path?: string } }).GUIDE
        if (guide?.path === path) return file.replace(/^\//, '')
    }
    return undefined
}

describe('guide dates are maintained, not decorative', () => {
    it('finds the content module behind every guide', () => {
        // If this cannot map a guide to its file, the check below silently
        // has nothing to check.
        for (const guide of GUIDES) {
            expect(
                contentFileFor(guide.path),
                `no content module found for ${guide.path}`
            ).toBeDefined()
        }
    })

    it.each(GUIDES.map((g) => [g.path, g] as const))(
        '%s was updated no earlier than its content was last edited',
        (_path, guide) => {
            // The whole lastmod policy rests on an author remembering to move
            // this date when they revise the facts. This is what notices when
            // they do not: git knows when the file actually changed.
            const file = contentFileFor(guide.path)
            if (file === undefined) return

            let committed: string
            try {
                committed = execFileSync(
                    'git',
                    ['log', '-1', '--format=%cs', '--', file],
                    { cwd: ROOT, encoding: 'utf8' }
                ).trim()
            } catch {
                return // no git available (e.g. inside the built image)
            }
            if (committed === '') return // not yet committed

            expect(
                guide.updatedAt >= committed,
                `${file} was last committed ${committed} but the guide says it ` +
                    `was updated ${guide.updatedAt}. Move updatedAt when you ` +
                    `change the content, or the sitemap tells Google a date ` +
                    `that is not true.`
            ).toBe(true)
        }
    )
})
