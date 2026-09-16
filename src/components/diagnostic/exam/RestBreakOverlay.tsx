import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import { BREAK_WARNING_MS, formatClock } from '@/lib/restBreak.ts'

type Props = {
    pausedAt: string
    breakSecondsRemaining: number
    /** The exam deadline as it stands while paused. With pausedAt it gives the
     *  exam time that will be waiting when the student comes back. */
    serverDeadlineAt: string
    onResume: () => void
    isResuming: boolean
}

/**
 * What a student sees while the clock is stopped. It covers the questions,
 * which is the whole point: a break during which the paper can still be read
 * is not a break, it is extra time nobody granted.
 *
 * Two numbers, deliberately different in weight. The break clock ticks down
 * and is the big one, because the decision in front of the student is "how
 * long can I stay away?". The exam time is shown frozen underneath, because a
 * student on a break should be able to see that it is not running.
 *
 * In the last minute the break clock turns amber and says so, so the end of a
 * break is never a surprise. At zero the server has already restarted the
 * exam clock, so the screen resumes by itself rather than waiting to be
 * dismissed.
 */
export function RestBreakOverlay({
    pausedAt,
    breakSecondsRemaining,
    serverDeadlineAt,
    onResume,
    isResuming,
}: Props) {
    const pausedAtMs = new Date(pausedAt).getTime()
    const endsAtMs = pausedAtMs + breakSecondsRemaining * 1000
    const examLeftMs = new Date(serverDeadlineAt).getTime() - pausedAtMs
    const [leftMs, setLeftMs] = useState(() => endsAtMs - Date.now())
    const endedRef = useRef(false)

    useEffect(() => {
        const tick = () => setLeftMs(endsAtMs - Date.now())
        tick()
        const id = setInterval(tick, 1000)
        // Browsers throttle timers in background tabs; recompute the moment
        // the student comes back to this one, as the exam timer does.
        const onVisible = () => {
            if (document.visibilityState === 'visible') tick()
        }
        document.addEventListener('visibilitychange', onVisible)
        return () => {
            clearInterval(id)
            document.removeEventListener('visibilitychange', onVisible)
        }
    }, [endsAtMs])

    // The server ends a break the moment its allowance is spent, and the exam
    // clock restarts there whether or not anyone is looking. So the screen
    // must not wait to be dismissed: it resumes by itself, which refetches the
    // attempt and puts the real, running clock back in front of the student.
    useEffect(() => {
        if (leftMs <= 0 && !endedRef.current) {
            endedRef.current = true
            onResume()
        }
    }, [leftMs, onResume])

    const spent = leftMs <= 0
    const warning = !spent && leftMs <= BREAK_WARNING_MS

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Rest break"
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4"
        >
            <div className="w-full max-w-md rounded-lg bg-white p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                    You are on a rest break
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Your exam clock is stopped, and your questions are hidden until you
                    come back.
                </p>

                <div
                    className={cn(
                        'mt-5 rounded-md border px-4 py-3',
                        warning
                            ? 'border-amber-300 bg-amber-50'
                            : 'border-gray-200 bg-gray-50'
                    )}
                >
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                        Break time left
                    </p>
                    <p
                        role="timer"
                        aria-label="Break time left"
                        className={cn(
                            'font-mono text-4xl tabular-nums',
                            warning ? 'text-amber-800' : 'text-gray-900'
                        )}
                    >
                        {formatClock(leftMs)}
                    </p>
                    {/* Announced once when it appears, not every second. */}
                    <p aria-live="polite" className="mt-1 min-h-[1.25rem] text-sm">
                        {spent ? (
                            <span className="text-gray-600">
                                Your break time is up — the clock has restarted.
                            </span>
                        ) : warning ? (
                            <span className="font-medium text-amber-800">
                                Less than a minute left. Get ready to carry on.
                            </span>
                        ) : null}
                    </p>
                </div>

                <p className="mt-4 text-sm text-gray-600">
                    Exam time waiting for you:{' '}
                    <span className="font-mono tabular-nums text-gray-900">
                        {formatClock(examLeftMs)}
                    </span>{' '}
                    <span className="text-gray-500">(paused)</span>
                </p>

                <Button
                    type="button"
                    className="mt-6 w-full"
                    onClick={onResume}
                    disabled={isResuming}
                >
                    {spent ? 'Back to the exam' : 'Resume the exam'}
                </Button>
            </div>
        </div>
    )
}
