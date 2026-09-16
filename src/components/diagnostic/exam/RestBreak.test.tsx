import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExamTimer } from '@/components/diagnostic/exam/ExamTimer.tsx'
import { RestBreakPanel } from '@/components/diagnostic/exam/RestBreakPanel.tsx'
import { formatAllowance, formatClock } from '@/lib/restBreak.ts'
import { RestBreakOverlay } from '@/components/diagnostic/exam/RestBreakOverlay.tsx'

describe('the clock during a rest break', () => {
    it('freezes at the time left when the break started, and cannot expire', () => {
        vi.useFakeTimers()
        const onExpire = vi.fn()
        // Deadline two minutes away, paused one minute ago: a student who
        // paused with 3:00 left still has 3:00 left, however long they are away.
        const deadline = new Date(Date.now() + 2 * 60_000).toISOString()
        const pausedAt = new Date(Date.now() - 60_000).toISOString()
        render(<ExamTimer serverDeadlineAt={deadline} onExpire={onExpire} pausedAt={pausedAt} />)

        expect(screen.getByRole('timer')).toHaveTextContent('3:00')
        expect(screen.getByText('Clock stopped')).toBeInTheDocument()

        vi.advanceTimersByTime(10 * 60_000)
        expect(onExpire).not.toHaveBeenCalled()
        expect(screen.getByRole('timer')).toHaveTextContent('3:00')
        vi.useRealTimers()
    })

    it('still expires normally when no break is running', () => {
        vi.useFakeTimers()
        const onExpire = vi.fn()
        render(
            <ExamTimer
                serverDeadlineAt={new Date(Date.now() - 1000).toISOString()}
                onExpire={onExpire}
            />
        )
        expect(onExpire).toHaveBeenCalledTimes(1)
        vi.useRealTimers()
    })
})

describe('the break control', () => {
    it('is hidden from students with no allowance', () => {
        const { container } = render(
            <RestBreakPanel
                breakSecondsRemaining={0}
                isPaused={false}
                onStart={vi.fn()}
                isStarting={false}
            />
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('offers the break and states what is left', async () => {
        const onStart = vi.fn()
        render(
            <RestBreakPanel
                breakSecondsRemaining={600}
                isPaused={false}
                onStart={onStart}
                isStarting={false}
            />
        )
        expect(screen.getByText(/10 minutes of break time left/)).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Take a break' }))
        expect(onStart).toHaveBeenCalledTimes(1)
    })

    it('is hidden while a break is already running', () => {
        const { container } = render(
            <RestBreakPanel
                breakSecondsRemaining={600}
                isPaused
                onStart={vi.fn()}
                isStarting={false}
            />
        )
        expect(container).toBeEmptyDOMElement()
    })
})

describe('the break screen', () => {
    const ago = (ms: number) => new Date(Date.now() - ms).toISOString()
    // Exam deadline 25 minutes after the moment the break started.
    const deadlineAfter = (pausedAt: string, ms: number) =>
        new Date(new Date(pausedAt).getTime() + ms).toISOString()

    function renderOverlay({
        pausedAgoMs,
        allowanceSeconds = 600,
        onResume = vi.fn(),
    }: {
        pausedAgoMs: number
        allowanceSeconds?: number
        onResume?: () => void
    }) {
        const pausedAt = ago(pausedAgoMs)
        render(
            <RestBreakOverlay
                pausedAt={pausedAt}
                breakSecondsRemaining={allowanceSeconds}
                serverDeadlineAt={deadlineAfter(pausedAt, 25 * 60_000)}
                onResume={onResume}
                isResuming={false}
            />
        )
        return onResume
    }

    it('shows a running clock of break time left', () => {
        renderOverlay({ pausedAgoMs: 2 * 60_000 })
        // Eight of the ten minutes are left after two minutes away.
        expect(screen.getByRole('timer', { name: 'Break time left' })).toHaveTextContent('8:00')
    })

    it('ticks down while the student is away', () => {
        vi.useFakeTimers()
        renderOverlay({ pausedAgoMs: 0 })
        expect(screen.getByRole('timer', { name: 'Break time left' })).toHaveTextContent('10:00')
        act(() => vi.advanceTimersByTime(90_000))
        expect(screen.getByRole('timer', { name: 'Break time left' })).toHaveTextContent('8:30')
        vi.useRealTimers()
    })

    it('shows the exam time waiting for them, frozen', () => {
        vi.useFakeTimers()
        renderOverlay({ pausedAgoMs: 0 })
        expect(screen.getByText('25:00')).toBeInTheDocument()
        act(() => vi.advanceTimersByTime(5 * 60_000))
        // Five minutes on a break has not cost any exam time.
        expect(screen.getByText('25:00')).toBeInTheDocument()
        vi.useRealTimers()
    })

    it('stays quiet until the last minute', () => {
        renderOverlay({ pausedAgoMs: 2 * 60_000 })
        expect(screen.queryByText(/Less than a minute left/)).not.toBeInTheDocument()
    })

    it('warns in the last minute', () => {
        renderOverlay({ pausedAgoMs: 9 * 60_000 + 30_000 })
        expect(screen.getByRole('timer', { name: 'Break time left' })).toHaveTextContent('0:30')
        expect(screen.getByText(/Less than a minute left/)).toBeInTheDocument()
    })

    it('resumes on request', async () => {
        const onResume = renderOverlay({ pausedAgoMs: 2 * 60_000 })
        await userEvent.click(screen.getByRole('button', { name: 'Resume the exam' }))
        expect(onResume).toHaveBeenCalledTimes(1)
    })

    it('resumes by itself when the allowance runs out, without waiting to be dismissed', () => {
        // The server restarts the exam clock the instant the allowance is
        // spent. A student left looking at a frozen break screen would be
        // losing real exam time, so the screen ends the break itself.
        const onResume = renderOverlay({ pausedAgoMs: 20 * 60_000 })
        expect(onResume).toHaveBeenCalledTimes(1)
        expect(
            screen.getByText(/break time is up — the clock has restarted/)
        ).toBeInTheDocument()
    })

    it('resumes by itself at the moment the allowance runs out', () => {
        vi.useFakeTimers()
        const onResume = renderOverlay({ pausedAgoMs: 0, allowanceSeconds: 120 })
        act(() => vi.advanceTimersByTime(119_000))
        expect(onResume).not.toHaveBeenCalled()
        act(() => vi.advanceTimersByTime(1_000))
        expect(onResume).toHaveBeenCalledTimes(1)
        vi.useRealTimers()
    })
})

describe('formatAllowance', () => {
    it.each([
        [600, '10 minutes'],
        [60, '1 minute'],
        [90, '1 min 30 s'],
        [45, '45 seconds'],
    ])('%i seconds reads as %s', (seconds, expected) => {
        expect(formatAllowance(seconds)).toBe(expected)
    })
})

describe('formatClock', () => {
    it.each([
        [600_000, '10:00'],
        [90_000, '1:30'],
        [500, '0:01'],
        [0, '0:00'],
        [-5_000, '0:00'],
    ])('%i ms reads as %s', (ms, expected) => {
        expect(formatClock(ms)).toBe(expected)
    })
})
