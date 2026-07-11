import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ExamTimer } from './ExamTimer'

const BASE = new Date('2026-07-11T00:00:00Z')
const at = (secondsFromBase: number) =>
    new Date(BASE.getTime() + secondsFromBase * 1000).toISOString()

describe('ExamTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(BASE)
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('displays remaining time as M:SS derived from the deadline', () => {
        render(<ExamTimer serverDeadlineAt={at(90)} onExpire={() => {}} />)
        expect(screen.getByRole('timer')).toHaveTextContent('1:30')
    })

    it('ticks down each second, recomputing from the deadline (not an accumulator)', () => {
        render(<ExamTimer serverDeadlineAt={at(90)} onExpire={() => {}} />)
        act(() => vi.advanceTimersByTime(1000))
        expect(screen.getByRole('timer')).toHaveTextContent('1:29')
        act(() => vi.advanceTimersByTime(5000))
        expect(screen.getByRole('timer')).toHaveTextContent('1:24')
    })

    it('stays correct after a gap (recompute-from-deadline survives throttled ticks)', () => {
        render(<ExamTimer serverDeadlineAt={at(90)} onExpire={() => {}} />)
        // Simulate the tab being backgrounded: jump the wall clock forward
        // and let a single tick fire. Only one interval callback runs, so a
        // decrement-accumulator would read ~1:29 (90 − 1); recompute reads
        // the true remaining (deadline − now = 90 − 31 = 59s).
        act(() => {
            vi.setSystemTime(new Date(BASE.getTime() + 30_000))
            vi.advanceTimersByTime(1000)
        })
        expect(screen.getByRole('timer')).toHaveTextContent('0:59')
    })

    it('fires onExpire exactly once when the deadline passes, and keeps showing 0:00', () => {
        const onExpire = vi.fn()
        render(<ExamTimer serverDeadlineAt={at(3)} onExpire={onExpire} />)
        expect(onExpire).not.toHaveBeenCalled()
        act(() => vi.advanceTimersByTime(3000))
        expect(onExpire).toHaveBeenCalledTimes(1)
        // Keeps ticking past zero but never re-fires.
        act(() => vi.advanceTimersByTime(5000))
        expect(onExpire).toHaveBeenCalledTimes(1)
        expect(screen.getByRole('timer')).toHaveTextContent('0:00')
    })

    it('fires onExpire on mount when the deadline is already past', () => {
        const onExpire = vi.fn()
        render(<ExamTimer serverDeadlineAt={at(-60)} onExpire={onExpire} />)
        expect(onExpire).toHaveBeenCalledTimes(1)
        expect(screen.getByRole('timer')).toHaveTextContent('0:00')
    })
})
