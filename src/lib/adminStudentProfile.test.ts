import { describe, expect, it } from 'vitest'
import { sittingLabel, universitiesLabel } from './adminStudentProfile'

describe('sittingLabel', () => {
    it('reads the stored value back as a person would say it', () => {
        expect(sittingLabel('october_2026')).toBe('October 2026')
        expect(sittingLabel('january_2027')).toBe('January 2027')
        expect(sittingLabel('undecided')).toBe('Not decided')
    })

    it('dashes an unanswered survey', () => {
        expect(sittingLabel(null)).toBe('—')
        expect(sittingLabel(undefined)).toBe('—')
        expect(sittingLabel('')).toBe('—')
    })

    it('shows an unmapped sitting rather than hiding it', () => {
        // The database constraint is the authority on which sittings exist, so
        // a third window can be added there before this map catches up. Showing
        // the raw value is ugly; blanking it would delete a real answer from
        // the one screen that reports on answers.
        expect(sittingLabel('june_2027')).toBe('june_2027')
    })
})

describe('universitiesLabel', () => {
    it('joins the list into one cell', () => {
        expect(universitiesLabel(['Cambridge', 'Imperial'])).toBe(
            'Cambridge, Imperial'
        )
    })

    it('treats absent and empty the same', () => {
        // A student who reached the survey and picked nothing, and one who
        // never reached it, are not distinguishable to someone scanning a
        // column — and pretending otherwise would mean two kinds of blank.
        expect(universitiesLabel(null)).toBe('—')
        expect(universitiesLabel(undefined)).toBe('—')
        expect(universitiesLabel([])).toBe('—')
    })
})
