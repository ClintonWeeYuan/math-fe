import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCheckoutSession, fetchBillingStatus } from './billingApi'
import { client } from '@/client/client.gen'
import type { DiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Hand-written calls against the generic client, so the things the generated
 * SDK would have guaranteed have to be asserted here instead: the right URL,
 * an auth header, and — the one that bites — throwing on an HTTP error rather
 * than returning undefined. The client resolves `{ data: undefined, error }`
 * instead of rejecting, so a call that returned `.data` blindly would report
 * a 402 as a successful purchase.
 */

const post = vi.spyOn(client, 'post')
const get = vi.spyOn(client, 'get')

beforeEach(() => {
    post.mockReset()
    get.mockReset()
    localStorage.clear()
    localStorage.setItem('token', 'tok')
})

describe('fetchBillingStatus', () => {
    it('asks the entitlements endpoint with the student token', async () => {
        get.mockResolvedValue({
            data: { hasPass: true, seasons: [] },
        } as never)

        await expect(fetchBillingStatus(true)).resolves.toEqual({
            hasPass: true,
            seasons: [],
        })
        expect(get.mock.calls[0][0]).toMatchObject({
            url: '/billing/me',
            headers: { Authorization: 'Bearer tok' },
        })
    })

    it('asks the public price list when signed out', async () => {
        // Which sittings exist and what they cost are what a visitor needs to
        // see before deciding to make an account. Withholding them showed
        // "coming soon" on papers that were, in fact, on sale.
        get.mockResolvedValue({ data: { hasPass: false, seasons: [] } } as never)

        await fetchBillingStatus(false)

        expect(get.mock.calls[0][0]).toMatchObject({ url: '/billing/seasons' })
        // No Authorization header at all, rather than an empty Bearer.
        expect(
            (get.mock.calls[0][0] as { headers?: unknown }).headers
        ).toBeUndefined()
    })

    it('throws rather than reporting a failure as "no pass"', async () => {
        get.mockResolvedValue({
            data: undefined,
            error: { detail: 'nope' },
            response: { status: 500 },
        } as never)

        await expect(fetchBillingStatus(true)).rejects.toThrow()
    })
})

describe('createCheckoutSession', () => {
    it('names the season and the return path', async () => {
        post.mockResolvedValue({
            data: { checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test' },
        } as never)

        await expect(
            createCheckoutSession('jan-2027', '/diagnostics/esat')
        ).resolves.toBe('https://checkout.stripe.com/c/pay/cs_test')
        expect(post.mock.calls[0][0]).toMatchObject({
            url: '/billing/checkout',
            // A key, never a price — the server looks it up against its own
            // list, so a client cannot name what it pays.
            body: { season: 'jan-2027', returnPath: '/diagnostics/esat' },
            headers: { Authorization: 'Bearer tok' },
        })
    })

    it('sends nulls rather than undefined when neither is given', async () => {
        post.mockResolvedValue({ data: { checkoutUrl: 'https://x' } } as never)
        await createCheckoutSession()
        // undefined would be dropped by JSON.stringify, leaving the backend to
        // read a body with no key at all — same result, but only by accident.
        const body = (
            post.mock.calls[0][0] as {
                body: { season: unknown; returnPath: unknown }
            }
        ).body
        expect(body.season).toBeNull()
        expect(body.returnPath).toBeNull()
    })

    it('carries the status so the caller can tell 409 from a real failure', async () => {
        post.mockResolvedValue({
            data: undefined,
            error: { detail: 'You already have the Season Pass.' },
            response: { status: 409 },
        } as never)

        await expect(createCheckoutSession()).rejects.toMatchObject({
            status: 409,
            // The backend's own wording reaches the student verbatim.
            message: 'You already have the Season Pass.',
        } satisfies Partial<DiagnosticApiError>)
    })
})
