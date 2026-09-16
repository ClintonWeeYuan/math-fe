import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockTrack = vi.fn()
vi.mock('@/lib/analytics.ts', () => ({ trackEvent: (...a: unknown[]) => mockTrack(...a) }))

import {
    authPageFromPath,
    trackAuthFailed,
    trackAuthPageViewed,
    trackAuthSucceeded,
} from '@/lib/authFunnel.ts'

beforeEach(() => mockTrack.mockReset())

describe('the sign-in wall events', () => {
    it('tells the sign-up page from the login page', () => {
        expect(authPageFromPath('/auth/signup')).toBe('signup')
        expect(authPageFromPath('/auth/login')).toBe('login')
        // Anywhere else a provider button appears counts as login.
        expect(authPageFromPath('/')).toBe('login')
    })

    it('records where a visitor came from when the page is shown', () => {
        trackAuthPageViewed('login', '/diagnostic/sets/abc')
        expect(mockTrack).toHaveBeenCalledWith('auth_page_viewed', {
            metadata: { page: 'login', from: '/diagnostic/sets/abc' },
        })
    })

    it('leaves "from" out rather than sending it empty', () => {
        trackAuthPageViewed('signup')
        expect(mockTrack).toHaveBeenCalledWith('auth_page_viewed', {
            metadata: { page: 'signup' },
        })
    })

    it('records how a sign-in worked', () => {
        trackAuthSucceeded('google', 'signup')
        expect(mockTrack).toHaveBeenCalledWith('auth_succeeded', {
            metadata: { method: 'google', page: 'signup' },
        })
    })

    it('records the reason a sign-in failed, cut short', () => {
        trackAuthFailed('password', 'login', new Error('x'.repeat(200)))
        const reason = mockTrack.mock.calls[0][1].metadata.reason as string
        expect(reason).toHaveLength(80)
    })

    it('never sends an empty reason', () => {
        trackAuthFailed('google', 'login', undefined)
        expect(mockTrack.mock.calls[0][1].metadata.reason).toBe('unknown')
    })
})
