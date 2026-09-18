import { afterEach, describe, expect, it, vi } from 'vitest'
import {
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
