import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * The crawler policy in public/robots.txt.
 *
 * A crawler obeys only the most specific group naming it, so every group that
 * allows crawling must repeat every private path. Missing one in a single group
 * hands that path to every bot in the group, and nothing else would notice.
 */

const PRIVATE = ['/admin', '/auth/', '/diagnostic/', '/my-results', '/billing/']

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
})
