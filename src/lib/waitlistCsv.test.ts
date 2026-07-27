import { describe, expect, it } from 'vitest'
import { waitlistToCsv } from './waitlistCsv'
import type { WaitlistEntry } from '@/client'

function entry(over: Partial<WaitlistEntry> = {}): WaitlistEntry {
    return {
        id: '1',
        email: 'a@b.com',
        product: 'tmua',
        createdAt: '2026-07-26T10:00:00Z',
        ...over,
    } as WaitlistEntry
}

describe('waitlistToCsv', () => {
    it('writes a header and one row per signup', () => {
        const csv = waitlistToCsv([
            entry(),
            entry({ email: 'c@d.com', product: 'esat-chemistry' }),
        ])
        const lines = csv.split('\n')
        expect(lines[0]).toBe('Email,Product,Signed up')
        expect(lines).toHaveLength(3)
        expect(lines[1]).toContain('a@b.com')
        expect(lines[2]).toContain('esat-chemistry')
    })

    it('escapes a comma in a field so columns cannot shift', () => {
        const csv = waitlistToCsv([entry({ email: 'weird,name@b.com' })])
        expect(csv).toContain('"weird,name@b.com"')
    })

    it('is just a header when there are no signups', () => {
        expect(waitlistToCsv([])).toBe('Email,Product,Signed up')
    })
})
