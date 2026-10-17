import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import { trackEvent } from '@/lib/analytics.ts'
import { paceLabel, paceStatus } from '@/lib/paceGuide.ts'
import { spokenDuration } from '@/lib/clockStory.ts'
import { serverNowMs } from '@/lib/serverClock.ts'

type Props = {
    attemptId: string
    startedAt: string
    serverDeadlineAt: string
    breakBudgetSeconds?: number
    breakSecondsRemaining?: number
    isPaused: boolean
    questionCount: number
    answered: number
    /** How far the server's clock is ahead of this device's. */
    clockOffsetMs?: number
}

const STORAGE_KEY = 'jomexam.paceGuide'

function readHidden(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'hidden'
    } catch {
        return false
    }
}

function writeHidden(hidden: boolean): void {
    try {
        if (hidden) localStorage.setItem(STORAGE_KEY, 'hidden')
        else localStorage.removeItem(STORAGE_KEY)
    } catch {
        // Not remembered on this device; it still works for this paper.
    }
}

/**
 * Ahead of, on, or behind the pace that finishes in time, under the timer.
 *
 * In October 2026 a third of full papers ran out of time with most questions
 * answered, and the timer alone does not tell a student whether the time left
 * is enough for the questions left. This does, in one word or two.
 *
 * On by default, because the students who need it are the ones who would not
 * think to switch it on. One tap hides it, and that is remembered on the
 * device, for a student who wants to practise with only what the real exam
 * shows. Hidden while on a rest break, when the clock is stopped.
 */
export function PaceGuide({
    attemptId,
    startedAt,
    serverDeadlineAt,
    breakBudgetSeconds,
    breakSecondsRemaining,
    isPaused,
    questionCount,
    answered,
    clockOffsetMs = 0,
}: Props) {
    const [hidden, setHidden] = useState(readHidden)
    const [now, setNow] = useState(() => serverNowMs(clockOffsetMs))

    useEffect(() => {
        if (hidden || isPaused) return
        const id = setInterval(() => setNow(serverNowMs(clockOffsetMs)), 5000)
        return () => clearInterval(id)
    }, [hidden, isPaused, clockOffsetMs])

    function toggle(nextHidden: boolean) {
        setHidden(nextHidden)
        writeHidden(nextHidden)
        setNow(serverNowMs(clockOffsetMs))
        trackEvent('pace_guide_toggled', {
            attemptId,
            metadata: { shown: !nextHidden },
        })
    }

    if (isPaused) return null

    if (hidden) {
        return (
            <button
                type="button"
                onClick={() => toggle(false)}
                className="self-start text-xs text-gray-400 underline underline-offset-4 hover:text-gray-600"
            >
                Show pace guide
            </button>
        )
    }

    const status = paceStatus({
        startedAt,
        serverDeadlineAt,
        breakBudgetSeconds,
        breakSecondsRemaining,
        questionCount,
        answered,
        nowMs: now,
    })
    if (status === null) return null

    return (
        <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
            <div className="flex items-baseline justify-between gap-2">
                <p
                    role="status"
                    className={cn(
                        'text-sm font-medium',
                        status.kind === 'behind'
                            ? 'text-amber-700'
                            : status.kind === 'ahead' || status.kind === 'done'
                              ? 'text-emerald-700'
                              : 'text-gray-700'
                    )}
                >
                    <span className="text-xs font-normal uppercase tracking-wide text-gray-400">
                        Pace{' '}
                    </span>
                    {paceLabel(status)}
                </p>
                <button
                    type="button"
                    onClick={() => toggle(true)}
                    className="text-xs text-gray-400 underline underline-offset-4 hover:text-gray-600"
                >
                    Hide
                </button>
            </div>
            {status.kind !== 'done' && (
                <p className="mt-0.5 text-xs text-gray-500">
                    {answered} of {questionCount} answered · about{' '}
                    {spokenDuration(status.allowanceSeconds)} a question
                </p>
            )}
        </div>
    )
}
