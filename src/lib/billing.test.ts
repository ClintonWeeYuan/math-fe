import { describe, expect, it } from 'vitest'
import { formatSeasonEnd, formatSeasonPrice } from './billing'

describe('formatSeasonEnd', () => {
    it('renders the backend date in the form a student reads', () => {
        expect(formatSeasonEnd('2026-10-16')).toBe('16 October 2026')
    })

    it('does not let a timezone move the calendar date', () => {
        // A bare YYYY-MM-DD parsed as local time lands at midnight, which is
        // the previous day for anyone west of Greenwich — so a student in
        // London or New York would be told the pass ends on the 15th.
        const original = process.env.TZ
        process.env.TZ = 'America/New_York'
        try {
            expect(formatSeasonEnd('2026-10-16')).toBe('16 October 2026')
        } finally {
            process.env.TZ = original
        }
    })

    it('falls back to the raw value rather than printing "Invalid Date"', () => {
        expect(formatSeasonEnd('nonsense')).toBe('nonsense')
    })
})

describe('formatSeasonPrice', () => {
    it('renders Stripe minor units as money', () => {
        expect(formatSeasonPrice(9900, 'MYR')).toMatch(/RM\s?99\.00/)
    })

    it('returns null when Stripe would not give us a price', () => {
        // The button still works and Stripe's own page shows the real number,
        // so a lookup failure costs a label rather than a sale.
        expect(formatSeasonPrice(null, 'MYR')).toBeNull()
        expect(formatSeasonPrice(9900, null)).toBeNull()
    })

    it('falls back rather than throwing on a malformed currency code', () => {
        // Intl handles an unknown-but-well-formed code itself (it just uses
        // the code as the symbol); it throws a RangeError on a malformed one,
        // which without the catch would blank the whole card.
        expect(formatSeasonPrice(9900, 'X')).toBe('X 99.00')
    })
})
