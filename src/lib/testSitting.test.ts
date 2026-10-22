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
