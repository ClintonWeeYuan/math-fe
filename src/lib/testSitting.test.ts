import { describe, expect, it } from 'vitest'
import { SITTING_OPTIONS } from './testSitting'
import { sittingLabel } from './adminStudentProfile'

describe('SITTING_OPTIONS', () => {
    it('offers January 2027 first, now that October 2026 has been sat', () => {
        expect(SITTING_OPTIONS[0].value).toBe('january_2027')
    })

    it('offers exactly the values the database accepts', () => {
        // user_info_test_sitting_known and the backend's TestSitting. A value
        // missing here cannot be chosen; one extra would be refused on save.
        expect(SITTING_OPTIONS.map((o) => o.value).sort()).toEqual(
            ['january_2027', 'later', 'october_2026', 'undecided'].sort()
        )
    })

    it('has an admin label for every option', () => {
        for (const option of SITTING_OPTIONS) {
            expect(sittingLabel(option.value)).not.toBe(option.value)
        }
    })
})

import { sittingIsOver } from './testSitting'

describe('sittingIsOver', () => {
    it('is over the day after the last day, as in the backend', () => {
        expect(sittingIsOver('october_2026', new Date('2026-10-16T12:00:00Z'))).toBe(false)
        expect(sittingIsOver('october_2026', new Date('2026-10-17T00:00:01Z'))).toBe(true)
        expect(sittingIsOver('january_2027', new Date('2026-10-20T09:00:00Z'))).toBe(false)
        expect(sittingIsOver('january_2027', new Date('2027-01-09T09:00:00Z'))).toBe(true)
    })

    it('is never over for later, undecided or blank', () => {
        for (const s of ['later', 'undecided', null, undefined] as const) {
            expect(sittingIsOver(s, new Date('2030-01-01T00:00:00Z'))).toBe(false)
        }
    })
})
