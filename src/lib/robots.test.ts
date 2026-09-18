import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * The crawler policy in public/robots.txt.
 *
 * A crawler obeys only the most specific group naming it, so every group that
 * allows crawling must repeat every private path. Missing one in a single group
 * hands that path to every bot in the group, and nothing else would notice.
 */

const PRIVATE = ['/admin', '/auth/', '/my-results', '/billing/']

function groups(text: string): string[][] {
    const out: string[][] = []
    let current: string[] | null = null
    let inAgents = false
    for (const raw of text.split('\n')) {
        const line = raw.replace(/#.*/, '').trim()
        if (!line) continue
        if (/^user-agent:/i.test(line)) {
            if (!inAgents) out.push((current = []))
            inAgents = true
        } else {
            inAgents = false
            current?.push(line)
        }
    }
    return out
}

describe('robots.txt', () => {
    it('withholds every private path from every group that allows crawling', () => {
        const all = groups(readFileSync('public/robots.txt', 'utf8'))
        const allowing = all.filter((rules) => !rules.includes('Disallow: /'))
        expect(allowing.length).toBeGreaterThan(0)
        for (const rules of allowing) {
            for (const path of PRIVATE) {
                expect(rules, `a group is missing ${path}`).toContain(
                    `Disallow: ${path}`
                )
            }
        }
    })

    it('lets crawlers reach /diagnostic/, so they can read its noindex', () => {
        // Blocking it would let a linked paper be indexed as a bare URL,
        // because the crawler could never see the tag keeping it out.
        const text = readFileSync('public/robots.txt', 'utf8')
        expect(text).not.toMatch(/^Disallow: \/diagnostic/m)
        const serve = JSON.parse(readFileSync('public/serve.json', 'utf8'))
        const rewrite = serve.rewrites.find(
            (r: { source: string }) => r.source === '/diagnostic/**'
        )
        expect(rewrite.destination).toBe('/app-shell.html')
        const shellHeaders = serve.headers.find(
            (h: { source: string }) => h.source === 'app-shell.html'
        )
        expect(shellHeaders.headers).toContainEqual({
            key: 'X-Robots-Tag',
            value: 'noindex',
        })
    })
})
