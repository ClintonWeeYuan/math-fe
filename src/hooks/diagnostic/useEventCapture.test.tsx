import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useEventCapture from './useEventCapture'

const mockIngest = vi.fn()
vi.mock('@/client', () => ({
    ingestDiagnosticEventsDiagnosticAttemptsAttemptIdEventsPost: (...args: unknown[]) =>
        mockIngest(...args),
}))

const ATTEMPT_ID = 'att-1'

function ok() {
    return { data: { acceptedCount: 1 }, error: undefined, response: { status: 200, ok: true } }
}
function fail() {
    return { data: undefined, error: { detail: 'boom' }, response: { status: 500, ok: false } }
}

describe('useEventCapture', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        mockIngest.mockReset()
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('buffers events and flushes them as a batch on the periodic interval', async () => {
        mockIngest.mockResolvedValue(ok())
        const { result } = renderHook(() =>
            useEventCapture({ attemptId: ATTEMPT_ID, currentQuestionId: 'q1' })
        )
        act(() => {
            result.current.recordEvent('q1', 'enter')
            result.current.recordEvent('q1', 'answer_change')
        })
        // Nothing sent until the flush fires.
        expect(mockIngest).not.toHaveBeenCalled()

        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000)
        })

        expect(mockIngest).toHaveBeenCalledTimes(1)
        const body = mockIngest.mock.calls[0][0].body
        expect(body.events.map((e: { eventType: string }) => e.eventType)).toEqual([
            'enter',
            'answer_change',
        ])
        // Each event carries a clientTs captured at record time.
        expect(body.events[0].clientTs).toBeTruthy()
        expect(mockIngest.mock.calls[0][0].path).toEqual({ attempt_id: ATTEMPT_ID })
    })

    it('empties the buffer on a successful flush (no re-send next tick)', async () => {
        mockIngest.mockResolvedValue(ok())
        const { result } = renderHook(() =>
            useEventCapture({ attemptId: ATTEMPT_ID, currentQuestionId: 'q1' })
        )
        act(() => result.current.recordEvent('q1', 'enter'))
        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000)
        })
        expect(mockIngest).toHaveBeenCalledTimes(1)
        // Next tick with an empty buffer sends nothing.
        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000)
        })
        expect(mockIngest).toHaveBeenCalledTimes(1)
    })

    it('re-queues events on a failed flush (at-least-once) so the next flush retries them', async () => {
        mockIngest.mockResolvedValueOnce(fail()).mockResolvedValueOnce(ok())
        const { result } = renderHook(() =>
            useEventCapture({ attemptId: ATTEMPT_ID, currentQuestionId: 'q1' })
        )
        act(() => result.current.recordEvent('q1', 'answer_change'))

        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000)
        })
        expect(mockIngest).toHaveBeenCalledTimes(1) // first, failed

        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000)
        })
        expect(mockIngest).toHaveBeenCalledTimes(2) // retried
        // The retry carries the same event, not a dropped one.
        expect(mockIngest.mock.calls[1][0].body.events[0].eventType).toBe('answer_change')
    })

    it('passes keepalive on a forced keepalive flush (unload path)', async () => {
        mockIngest.mockResolvedValue(ok())
        const { result } = renderHook(() =>
            useEventCapture({ attemptId: ATTEMPT_ID, currentQuestionId: 'q1' })
        )
        act(() => result.current.recordEvent('q1', 'exit'))
        await act(async () => {
            await result.current.flush({ keepalive: true, force: true })
        })
        expect(mockIngest.mock.calls[0][0].keepalive).toBe(true)
    })

    it('records blur on tab-hide (with a keepalive flush) and focus on tab-show', async () => {
        mockIngest.mockResolvedValue(ok())
        const visibility = vi.spyOn(document, 'visibilityState', 'get')
        renderHook(() =>
            useEventCapture({ attemptId: ATTEMPT_ID, currentQuestionId: 'q7' })
        )

        visibility.mockReturnValue('hidden')
        await act(async () => {
            document.dispatchEvent(new Event('visibilitychange'))
            // Let the flush's promise settle (avoid waitFor, which polls on
            // real timers and would deadlock against the fake ones).
            await vi.advanceTimersByTimeAsync(0)
        })
        // A blur event was sent with keepalive on hide.
        expect(mockIngest).toHaveBeenCalled()
        const hideBody = mockIngest.mock.calls[0][0]
        expect(hideBody.body.events[0]).toMatchObject({ questionId: 'q7', eventType: 'blur' })
        expect(hideBody.keepalive).toBe(true)

        // On show, a focus event is buffered (flushed on the next tick).
        mockIngest.mockClear()
        visibility.mockReturnValue('visible')
        act(() => document.dispatchEvent(new Event('visibilitychange')))
        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000)
        })
        expect(mockIngest.mock.calls[0][0].body.events[0]).toMatchObject({
            questionId: 'q7',
            eventType: 'focus',
        })
        visibility.mockRestore()
    })
})
