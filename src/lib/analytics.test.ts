import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    flushEvents,
    resetAnalyticsForTests,
    trackEvent,
} from './analytics'
import { client } from '@/client/client.gen'

/**
 * The two properties that matter for an analytics helper: it must never be
 * able to hurt the caller (it sits on the exam player's answer handler), and
 * it must not lose events it could have kept — while also not retrying
 * forever on something a retry cannot fix.
 */

const post = vi.spyOn(client, 'post')

const ok = () => ({ data: { accepted: 1 }, response: { status: 200 } })
const failed = (status: number) => ({
    error: { detail: 'no' },
    response: { status },
})

beforeEach(() => {
    resetAnalyticsForTests()
    post.mockReset()
    post.mockResolvedValue(ok() as never)
    localStorage.clear()
})

afterEach(() => {
    resetAnalyticsForTests()
})

describe('trackEvent', () => {
    it('does not throw when the network is gone', () => {
        post.mockRejectedValue(new Error('offline'))
        expect(() => trackEvent('diagnostic_started')).not.toThrow()
    })

    it('does not send on every call — events are batched', async () => {
        trackEvent('diagnostic_started')
        trackEvent('question_answered', { metadata: { position: 1 } })
        expect(post).not.toHaveBeenCalled()

        await flushEvents()
        expect(post).toHaveBeenCalledTimes(1)
        expect(post.mock.calls[0][0].body).toEqual({
            events: [
                { eventName: 'diagnostic_started' },
                { eventName: 'question_answered', metadata: { position: 1 } },
            ],
        })
    })

    it('sends no Authorization header when signed out, rather than an empty one', async () => {
        trackEvent('diagnostic_started')
        await flushEvents()
        expect(post.mock.calls[0][0].headers).toEqual({})
    })

    it('sends the token when there is one', async () => {
        localStorage.setItem('token', 'tok')
        trackEvent('diagnostic_started')
        await flushEvents()
        expect(post.mock.calls[0][0].headers).toEqual({
            Authorization: 'Bearer tok',
        })
    })
})

describe('what happens when a flush fails', () => {
    it('keeps the events on a transport failure, so they go next time', async () => {
        post.mockRejectedValueOnce(new Error('offline'))
        trackEvent('diagnostic_started')

        await flushEvents()
        post.mockResolvedValue(ok() as never)
        await flushEvents()

        expect(post).toHaveBeenCalledTimes(2)
        expect(post.mock.calls[1][0].body).toEqual({
            events: [{ eventName: 'diagnostic_started' }],
        })
    })

    it('keeps the events on a 500 — the server may be back shortly', async () => {
        post.mockResolvedValueOnce(failed(503) as never)
        trackEvent('diagnostic_started')

        await flushEvents()
        post.mockResolvedValue(ok() as never)
        await flushEvents()

        expect(post).toHaveBeenCalledTimes(2)
    })

    it('drops the events on a 4xx rather than retrying forever', async () => {
        // 403 (an attempt that is not ours) and 422 (an unknown event name)
        // are client bugs. Re-queueing would loop on every flush and take the
        // rest of the buffer with it.
        post.mockResolvedValueOnce(failed(403) as never)
        trackEvent('diagnostic_started')

        await flushEvents()
        post.mockResolvedValue(ok() as never)
        await flushEvents()

        expect(post).toHaveBeenCalledTimes(1)
    })
})

describe('mirroring to Umami', () => {
    it('is silent when Umami is absent, which is every non-production build', () => {
        expect(
            (window as { umami?: unknown }).umami
        ).toBeUndefined()
        expect(() => trackEvent('diagnostic_started')).not.toThrow()
    })

    it('mirrors the event name and its keys when Umami is loaded', () => {
        const track = vi.fn()
        ;(window as { umami?: unknown }).umami = { track }

        trackEvent('question_answered', {
            attemptId: 'att-1',
            questionId: 'q-1',
            metadata: { position: 3 },
        })

        expect(track).toHaveBeenCalledWith('question_answered', {
            attemptId: 'att-1',
            questionId: 'q-1',
            position: 3,
        })
        delete (window as { umami?: unknown }).umami
    })

    it('survives an Umami script that throws', () => {
        ;(window as { umami?: unknown }).umami = {
            track: () => {
                throw new Error('blocked by an extension')
            },
        }

        expect(() => trackEvent('diagnostic_started')).not.toThrow()
        delete (window as { umami?: unknown }).umami
    })
})
