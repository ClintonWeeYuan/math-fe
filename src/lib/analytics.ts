import { client } from '@/client/client.gen'

/**
 * Product analytics: one call, two destinations.
 *
 * Umami already counts page views, and will keep doing so — this does not
 * replace it. What Umami cannot answer is anything that needs to be joined to
 * a student, an attempt or a question ("which guide page produced someone who
 * finished a paper"), because it holds no such keys. So every event goes to
 * our own table, where it can be joined, AND is mirrored to Umami as a custom
 * event, where it sits alongside the page views it should be measured
 * against. Per-page conversion is a ratio of two Umami numbers; everything
 * else is SQL.
 *
 * Transport is modelled on useEventCapture, which already solved this for the
 * exam's timing log: buffer in memory, flush on a timer, flush with keepalive
 * when the tab goes away. The differences are that this one is app-wide
 * rather than attempt-scoped, is a plain module rather than a hook (guide
 * CTAs and the signup form are not always inside a React tree that owns an
 * attempt), and drops rather than retries a 4xx.
 */

/** Every event the backend will accept — mirrors the Literal on
 *  app/models/analytics.py. Hand-written rather than imported from the
 *  generated client because regenerating that client rewrites all ~1500 lines
 *  of it, which is a change of its own; move to the generated union the next
 *  time it is regenerated. */
export type AnalyticsEventName =
    // Attempt lifecycle and the two history-dependent starts. All emitted
    // server-side — they are state transitions the server owns, and the moment
    // a student abandons is the moment their tab closes. Listed here anyway
    // because this type mirrors the backend's Literal, not just what the
    // browser sends.
    | 'diagnostic_started'
    | 'question_answered'
    | 'diagnostic_submitted'
    | 'diagnostic_timed_out'
    | 'retake_started'
    | 'second_subject_started'
    // Client-driven: the server cannot tell a fetch from a read, and a CTA
    // click never reaches it at all.
    | 'report_viewed'
    | 'diagnostic_cta_clicked'
    // The results dashboard. Things a student does with a page; the server
    // sees only the fetches underneath them.
    | 'dashboard_viewed'
    | 'report_reopened'
    | 'resume_clicked'
    | 'retake_clicked'

export type AnalyticsPayload = {
    attemptId?: string
    questionId?: string
    /** Anything event-specific: position, source path, format. */
    metadata?: Record<string, unknown>
}

type QueuedEvent = AnalyticsPayload & { eventName: AnalyticsEventName }

const FLUSH_INTERVAL_MS = 5000
/** The server rejects a batch over 100. Flush at the same number rather than
 *  discovering the limit as a 422. */
const MAX_BATCH = 100

let buffer: QueuedEvent[] = []
let timer: ReturnType<typeof setInterval> | undefined
let flushing = false

/** Umami is injected in production only (see App.tsx), so this is undefined in
 *  development and in tests. Mirroring is best-effort by design: analytics
 *  must never be able to throw into a caller. */
type UmamiWindow = Window & {
    umami?: { track?: (name: string, data?: Record<string, unknown>) => void }
}

function mirrorToUmami(event: QueuedEvent): void {
    if (typeof window === 'undefined') return
    const umami = (window as UmamiWindow).umami
    if (typeof umami?.track !== 'function') return
    try {
        umami.track(event.eventName, {
            ...(event.attemptId ? { attemptId: event.attemptId } : {}),
            ...(event.questionId ? { questionId: event.questionId } : {}),
            ...event.metadata,
        })
    } catch {
        // A broken or blocked analytics script is not the caller's problem.
    }
}

function authHeader(): Record<string, string> {
    if (typeof localStorage === 'undefined') return {}
    const token = localStorage.getItem('token')
    // Deliberately omitted when absent, rather than sent empty: the endpoint
    // accepts anonymous events, and "Bearer " with no token would be a
    // malformed credential rather than no credential.
    return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Send what is buffered.
 *
 * A 4xx is dropped, not retried. The endpoint returns 4xx only for things a
 * retry cannot fix — an unknown event name, an over-long batch, an attempt
 * that is not this caller's — so re-queueing would loop forever on a client
 * bug and take the rest of the buffer down with it. Transport failures and
 * 5xx are re-queued at the front, the same at-least-once choice useEventCapture
 * makes: a lost event defeats the point, a rare duplicate does not.
 */
export async function flushEvents(opts?: { keepalive?: boolean }): Promise<void> {
    if (buffer.length === 0) return
    if (flushing && !opts?.keepalive) return

    const snapshot = buffer.splice(0, MAX_BATCH)
    flushing = true
    try {
        const response = await client.post({
            url: '/analytics/events',
            body: { events: snapshot },
            headers: authHeader(),
            ...(opts?.keepalive ? { keepalive: true } : {}),
        })
        const status = response.response?.status ?? 0
        const retryable = status === 0 || status >= 500
        if (response.error !== undefined && retryable) {
            buffer.unshift(...snapshot)
        }
    } catch {
        buffer.unshift(...snapshot)
    } finally {
        flushing = false
    }
}

function startFlushing(): void {
    if (timer !== undefined || typeof window === 'undefined') return

    timer = setInterval(() => void flushEvents(), FLUSH_INTERVAL_MS)

    // A closing tab is exactly when the interesting events happen — the ones
    // that say someone left. keepalive lets the request outlive the document.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            void flushEvents({ keepalive: true })
        }
    })
    window.addEventListener('pagehide', () => {
        void flushEvents({ keepalive: true })
    })
}

/**
 * Record one event. Never throws, never awaits, never blocks the caller —
 * this sits on click handlers in the exam player, so it must be free.
 */
export function trackEvent(
    name: AnalyticsEventName,
    payload: AnalyticsPayload = {}
): void {
    const event: QueuedEvent = { eventName: name, ...payload }
    mirrorToUmami(event)
    buffer.push(event)
    startFlushing()
}

/** Test seam: drop anything buffered and stop the timer. Not used by the app —
 *  a module-level buffer would otherwise leak between test cases. */
export function resetAnalyticsForTests(): void {
    buffer = []
    if (timer !== undefined) clearInterval(timer)
    timer = undefined
    flushing = false
}
