import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    forgetCheckoutPaper,
    peekCheckoutPaper,
    rememberCheckoutPaper,
    rememberCheckoutIntent,
    rememberReturnTo,
    takeCheckoutIntent,
    takeReturnTo,
} from '@/lib/checkoutIntent.ts'

afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
})

describe('checkout intent', () => {
    it('is taken once, by the page it was left on', () => {
        rememberCheckoutIntent('esat-2026-27', '/diagnostic/sets/abc')
        expect(takeCheckoutIntent('/diagnostic/sets/other')).toBeNull()
        expect(takeCheckoutIntent('/diagnostic/sets/abc')).toBe('esat-2026-27')
        expect(takeCheckoutIntent('/diagnostic/sets/abc')).toBeNull()
    })

    it('expires, so a stale intent never sends anyone to Stripe', () => {
        vi.useFakeTimers()
        rememberCheckoutIntent('esat-2026-27', '/diagnostic/sets/abc')
        vi.advanceTimersByTime(31 * 60_000)
        expect(takeCheckoutIntent('/diagnostic/sets/abc')).toBeNull()
    })

    it('also remembers where to return after a password sign-up', () => {
        rememberCheckoutIntent('tmua-2026-27', '/diagnostic/sets/xyz')
        expect(takeReturnTo()).toBe('/diagnostic/sets/xyz')
        expect(takeReturnTo()).toBeNull()
    })
})

describe('return path', () => {
    it.each(['//evil.example.com', 'https://evil.example.com', '/\\evil', '/auth/login'])(
        'refuses %s',
        (path) => {
            rememberReturnTo(path)
            expect(takeReturnTo()).toBeNull()
        }
    )
})

describe('the paper a checkout started from', () => {
    const id = '4ef96f83-c5ce-4062-80a7-92c7cf8aea57'

    it("is kept for a paper's start page, and read without being used up", () => {
        rememberCheckoutPaper(`/diagnostic/sets/${id}`)
        expect(peekCheckoutPaper()).toBe(id)
        expect(peekCheckoutPaper()).toBe(id)
        forgetCheckoutPaper()
        expect(peekCheckoutPaper()).toBeNull()
    })

    it('is not kept for anywhere that is not one paper', () => {
        rememberCheckoutPaper('/my-results')
        rememberCheckoutPaper(`/diagnostic/attempts/${id}/report`)
        rememberCheckoutPaper(undefined)
        expect(peekCheckoutPaper()).toBeNull()
    })

    it('expires after two hours', () => {
        vi.useFakeTimers()
        rememberCheckoutPaper(`/diagnostic/sets/${id}`)
        vi.advanceTimersByTime(2 * 60 * 60_000 + 1)
        expect(peekCheckoutPaper()).toBeNull()
        vi.useRealTimers()
    })
})
