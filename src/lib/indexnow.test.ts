import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { selectUrls, findKey, readSitemaps } from '../../scripts/indexnow.mjs'

/**
 * IndexNow submission.
 *
 * The risk here is not failing to submit — it is submitting things that did
 * not change. The protocol exists to say "this page is different now", and a
 * host that says it about everything on every deploy is asking to be ignored.
 * So most of these tests are about what gets left out.
 */

const ENTRIES = [
    {
        loc: 'https://www.jomexam.com/guides/esat-physics',
        lastmod: '2026-08-17',
    },
    { loc: 'https://www.jomexam.com/guides/esat-dates', lastmod: '2026-08-16' },
    {
        loc: 'https://www.jomexam.com/guides/tmua-practice-tests',
        lastmod: '2026-08-11',
    },
    // SPM pages carry no lastmod: nothing records when a question changed.
    { loc: 'https://www.jomexam.com/spm/chemistry/polymers', lastmod: null },
]

describe('choosing what to submit', () => {
    it('submits only what changed on or after the date given', () => {
        expect(selectUrls(ENTRIES, { since: '2026-08-16' })).toEqual([
            'https://www.jomexam.com/guides/esat-physics',
            'https://www.jomexam.com/guides/esat-dates',
        ])
    })

    it('leaves out a page with no lastmod rather than guessing', () => {
        // Announcing a change we cannot evidence is the one thing IndexNow
        // asks hosts not to do.
        const picked = selectUrls(ENTRIES, { since: '2000-01-01' })
        expect(picked).not.toContain(
            'https://www.jomexam.com/spm/chemistry/polymers'
        )
    })

    it('submits nothing when nothing changed', () => {
        expect(selectUrls(ENTRIES, { since: '2026-12-01' })).toEqual([])
    })

    it('--all includes the undated pages, since that is an explicit choice', () => {
        expect(selectUrls(ENTRIES, { all: true })).toHaveLength(ENTRIES.length)
    })
})

describe('against the real build output', () => {
    const built = readdirSync('dist')

    it('serves a key file whose contents are the key', () => {
        // This file IS the proof of ownership; a mismatch is a 403 from the
        // API rather than anything visible on the site.
        const key = findKey('dist')
        expect(readFileSync(`dist/${key}.txt`, 'utf8').trim()).toBe(key)
        expect(key).toMatch(/^[0-9a-f]{8,128}$/)
    })

    it('the key file is at the site root, where the protocol requires it', () => {
        const key = findKey('dist')
        expect(built).toContain(`${key}.txt`)
    })

    it('reads real URLs out of the sitemaps', () => {
        const entries = readSitemaps('dist')
        expect(entries.length).toBeGreaterThan(50)
        expect(
            entries.every((e) => e.loc.startsWith('https://www.jomexam.com/'))
        ).toBe(true)
    })

    it('does not mistake the sitemap index for a page', () => {
        // The index lists <sitemap> children, not <url> entries. Submitting
        // sitemap-core.xml as though it were a page would be nonsense.
        const locs = readSitemaps('dist').map((e) => e.loc)
        expect(locs.some((l) => l.endsWith('.xml'))).toBe(false)
    })
})

/**
 * Group robots.txt the way a crawler does: consecutive User-agent lines share
 * one rule set, and a new group starts at the first User-agent line that
 * FOLLOWS a rule. Splitting on every User-agent line instead — the obvious
 * thing — breaks a multi-agent group into fragments with no rules, which is
 * how you end up asserting nothing while looking thorough.
 */
function parseGroups(robots: string) {
    const groups: { agents: string[]; rules: string[] }[] = []
    let current: { agents: string[]; rules: string[] } | null = null
    let seenRule = false

    for (const raw of robots.split('\n')) {
        const line = raw.replace(/#.*$/, '').trim()
        if (line === '') continue
        const [field, ...rest] = line.split(':')
        const key = field.trim().toLowerCase()
        const value = rest.join(':').trim()

        if (key === 'user-agent') {
            if (current === null || seenRule) {
                current = { agents: [], rules: [] }
                groups.push(current)
                seenRule = false
            }
            current.agents.push(value)
        } else if (key === 'allow' || key === 'disallow') {
            if (current === null) continue
            current.rules.push(`${key}:${value}`)
            seenRule = true
        }
    }
    return groups
}

describe('robots.txt', () => {
    const robots = readFileSync('dist/robots.txt', 'utf8')
    const groups = parseGroups(robots)
    const groupFor = (agent: string) =>
        groups.find((g) => g.agents.includes(agent))

    it('lets retrieval bots in, since they cite and send readers', () => {
        for (const bot of [
            'OAI-SearchBot',
            'ChatGPT-User',
            'PerplexityBot',
            'Claude-SearchBot',
        ]) {
            const group = groupFor(bot)
            expect(group, `${bot} has no group`).toBeDefined()
            expect(group!.rules, bot).toContain('allow:/')
        }
    })

    it('keeps training bots out', () => {
        for (const bot of ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot']) {
            const group = groupFor(bot)
            expect(group, `${bot} has no group`).toBeDefined()
            expect(group!.rules, bot).toContain('disallow:/')
            expect(group!.rules, bot).not.toContain('allow:/')
        }
    })

    it('repeats the private paths in every group that allows anything', () => {
        // The rule that catches people out: a crawler obeys the most specific
        // group matching it and ignores "*" entirely. A group saying only
        // "Allow: /" therefore hands that bot /admin and /diagnostic.
        for (const group of groups.filter((g) => g.rules.includes('allow:/'))) {
            for (const path of ['/admin', '/auth/', '/diagnostic/']) {
                expect(
                    group.rules,
                    `${group.agents.join(', ')} must disallow ${path}`
                ).toContain(`disallow:${path}`)
            }
        }
    })

    it('still points at the sitemap index', () => {
        expect(robots).toContain('Sitemap: https://www.jomexam.com/sitemap.xml')
    })
})
