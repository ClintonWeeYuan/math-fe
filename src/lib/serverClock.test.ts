import { afterEach, describe, expect, it, vi } from 'vitest'
import { clockOffsetMs, serverNowMs } from './serverClock'

describe('clockOffsetMs', () => {
    it('measures the server clock against the midpoint of the request', () => {
        // Sent at 1000 and received at 1400 on the device; the server said
        // 4:00.000 past the epoch's 1200 ms mark, i.e. it is 240 s ahead.
        const server = new Date(1200 + 240_000).toISOString()
        expect(clockOffsetMs(server, 1000, 1400)).toBe(240_000)
    })

    it('is negative when the device clock is fast', () => {
        const server = new Date(10_000).toISOString()
        expect(clockOffsetMs(server, 250_000, 250_000)).toBe(-240_000)
    })

    it('is zero when the server time is missing or unreadable, so the timer behaves as before', () => {
        expect(clockOffsetMs(undefined, 1000, 1200)).toBe(0)
        expect(clockOffsetMs(null, 1000, 1200)).toBe(0)
        expect(clockOffsetMs('not a time', 1000, 1200)).toBe(0)
    })
})

describe('serverNowMs', () => {
    afterEach(() => vi.useRealTimers())
    it('is the device time corrected by the offset', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(50_000))
        expect(serverNowMs(-20_000)).toBe(30_000)
        expect(serverNowMs(undefined)).toBe(50_000)
    })
})
