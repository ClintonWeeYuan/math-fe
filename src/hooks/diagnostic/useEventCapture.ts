import { useCallback, useEffect, useRef } from 'react'
import {
    ingestDiagnosticEventsDiagnosticAttemptsAttemptIdEventsPost,
    type DiagnosticQuestionEvent,
} from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type EventType = DiagnosticQuestionEvent['eventType']

const FLUSH_INTERVAL_MS = 5000

type FlushOptions = {
    /** Use fetch keepalive so the request survives tab-close/unload. */
    keepalive?: boolean
    /** Bypass the single-in-flight guard — for the final/unload flush,
     *  where guaranteeing the tail lands matters more than avoiding a
     *  rare concurrent request. */
    force?: boolean
}

/**
 * Client-side capture of the timing/flagging event log (§4). Owns the
 * buffer (a ref — no re-render per event), the transport, and the
 * automatic flush triggers (periodic, tab-hidden, unload). The caller
 * (ExamPage) drives the semantic events — enter/exit on navigation,
 * answer_change, flag/unflag — via recordEvent, and the final flush via
 * flush(); blur/focus are captured here against the current question.
 *
 * Delivery is at-least-once, deliberately: a flush snapshots-and-removes
 * the buffer, and re-queues the snapshot on failure. The event log exists
 * to reconstruct what happened, so a lost event defeats its purpose,
 * whereas a rare duplicate (only if the server processed a request the
 * client saw as failed) is tolerable and could be deduped later. A single
 * in-flight guard prevents concurrent flushes from sending overlapping
 * batches.
 */
export default function useEventCapture({
    attemptId,
    currentQuestionId,
}: {
    attemptId: string
    currentQuestionId: string | undefined
}) {
    const bufferRef = useRef<DiagnosticQuestionEvent[]>([])
    const flushingRef = useRef(false)
    const attemptIdRef = useRef(attemptId)
    attemptIdRef.current = attemptId
    const currentQuestionIdRef = useRef(currentQuestionId)
    currentQuestionIdRef.current = currentQuestionId

    const recordEvent = useCallback((questionId: string, eventType: EventType) => {
        // clientTs is captured now, when the event happened — not at flush
        // time. The server stamps its own server_ts per batch; clientTs
        // preserves the real per-event moment (§4, never trusted alone).
        bufferRef.current.push({
            questionId,
            eventType,
            clientTs: new Date().toISOString(),
        })
    }, [])

    const flush = useCallback(async (opts?: FlushOptions) => {
        if (bufferRef.current.length === 0) return
        if (flushingRef.current && !opts?.force) return

        // Snapshot-and-remove: take the current events out atomically so a
        // concurrent flush can't re-grab them and new events accumulate
        // separately.
        const snapshot = bufferRef.current.splice(0, bufferRef.current.length)
        flushingRef.current = true
        try {
            const result =
                await ingestDiagnosticEventsDiagnosticAttemptsAttemptIdEventsPost({
                    path: { attempt_id: attemptIdRef.current },
                    body: { events: snapshot },
                    headers: getAuthHeaders(),
                    ...(opts?.keepalive ? { keepalive: true } : {}),
                })
            if (result.error !== undefined) {
                // Re-queue at the front to retry on the next flush.
                bufferRef.current.unshift(...snapshot)
            }
        } catch {
            bufferRef.current.unshift(...snapshot)
        } finally {
            flushingRef.current = false
        }
    }, [])

    // Periodic flush — every few seconds (§4).
    useEffect(() => {
        const id = setInterval(() => void flush(), FLUSH_INTERVAL_MS)
        return () => clearInterval(id)
    }, [flush])

    // Tab-hidden/visible: blur/focus against the question being viewed
    // (which is what makes "stuck for 3 min" distinguishable from "tabbed
    // away for 3 min", §4), plus a keepalive flush on hide so a
    // backgrounded/closing tab doesn't strand the buffer. Independent of
    // the timer's own visibilitychange listener — addEventListener stacks,
    // neither overrides the other.
    useEffect(() => {
        const onVisibility = () => {
            const qid = currentQuestionIdRef.current
            if (qid === undefined) return
            if (document.visibilityState === 'hidden') {
                recordEvent(qid, 'blur')
                void flush({ keepalive: true, force: true })
            } else {
                recordEvent(qid, 'focus')
            }
        }
        document.addEventListener('visibilitychange', onVisibility)
        return () => document.removeEventListener('visibilitychange', onVisibility)
    }, [flush, recordEvent])

    // pagehide: the definitive unload signal — force a keepalive flush of
    // whatever remains (visibilitychange→hidden covers most backgrounding,
    // pagehide covers the actual close/navigation-away).
    useEffect(() => {
        const onPageHide = () => void flush({ keepalive: true, force: true })
        window.addEventListener('pagehide', onPageHide)
        return () => window.removeEventListener('pagehide', onPageHide)
    }, [flush])

    return { recordEvent, flush }
}
