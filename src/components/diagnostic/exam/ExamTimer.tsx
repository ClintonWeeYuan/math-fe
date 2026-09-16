import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils.ts'

type Props = {
    serverDeadlineAt: string
    onExpire: () => void
    /**
     * When the student is on a rest break the server stops the clock: the
     * deadline stays put and is moved forward by the length of the break when
     * they resume. The display freezes at the time they had left when they
     * paused, and onExpire cannot fire — a paused attempt is never late.
     */
    pausedAt?: string | null
}

function formatRemaining(ms: number): string {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Always-visible, non-hideable countdown (§2). Displays only — the server
 * is the source of truth for actual expiry (§1); if the client wall clock
 * is skewed, the display is off by that skew but the server still enforces
 * the real deadline.
 *
 * Deliberately recomputes remaining = deadline − now() on every tick,
 * never decrements an accumulator: browsers throttle/pause setInterval in
 * backgrounded tabs, so an accumulator would drift, but a recompute is
 * always correct whenever it runs — and it also fires on
 * visibilitychange→visible, so it snaps right the instant the tab is
 * refocused.
 *
 * Fires onExpire exactly once when it crosses zero (the ref guard), even
 * though it keeps ticking at 0. onExpire is held in a ref so a new inline
 * callback from the parent doesn't tear down and rebuild the interval each
 * render.
 */
export function ExamTimer({ serverDeadlineAt, onExpire, pausedAt }: Props) {
    const deadlineMs = new Date(serverDeadlineAt).getTime()
    const pausedAtMs = pausedAt ? new Date(pausedAt).getTime() : null
    const [remainingMs, setRemainingMs] = useState(() => deadlineMs - Date.now())

    const onExpireRef = useRef(onExpire)
    onExpireRef.current = onExpire
    const expiredRef = useRef(false)

    useEffect(() => {
        if (pausedAtMs !== null) {
            // Frozen: what was left at the moment the break started. No
            // interval, and no expiry — the clock is the server's, and the
            // server has stopped it.
            setRemainingMs(deadlineMs - pausedAtMs)
            return
        }
        function tick() {
            const remaining = deadlineMs - Date.now()
            setRemainingMs(remaining)
            if (remaining <= 0 && !expiredRef.current) {
                expiredRef.current = true
                onExpireRef.current()
            }
        }
        tick() // immediate, so an already-past deadline expires on mount
        const intervalId = setInterval(tick, 1000)
        const onVisibility = () => {
            if (document.visibilityState === 'visible') tick()
        }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            clearInterval(intervalId)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [deadlineMs, pausedAtMs])

    const paused = pausedAtMs !== null
    const urgent = !paused && remainingMs <= 60_000

    return (
        <div
            role="timer"
            aria-label="Time remaining"
            className={cn(
                'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-lg tabular-nums',
                urgent
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : paused
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-gray-200 bg-white text-gray-800'
            )}
        >
            <span className="text-xs font-sans uppercase tracking-wide text-gray-400">
                {paused ? 'Clock stopped' : 'Time left'}
            </span>
            {formatRemaining(remainingMs)}
        </div>
    )
}
