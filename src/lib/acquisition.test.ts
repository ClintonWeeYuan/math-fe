import { beforeEach, describe, expect, it } from 'vitest'
import {
    captureAcquisition,
    captureAgentCode,
    storedAcquisition,
    storedAgentCode,
} from './acquisition'

/**
 * The rule that matters is first-write-wins. A visitor arrives from a campaign
 * and then clicks through to a page carrying no parameters; if the second page
 * overwrote the first, every campaign would attribute to nothing, which is the
 * exact failure reading UTMs at signup would have produced.
 */

function land(url: string, referrer = '') {
    window.history.replaceState({}, '', url)
    Object.defineProperty(document, 'referrer', {
        value: referrer,
        configurable: true,
    })
}

beforeEach(() => {
    sessionStorage.clear()
    land('/')
})

describe('capturing how a visit began', () => {
    it('records the campaign parameters from the landing URL', () => {
        land('/guides/esat-practice-tests?utm_source=google&utm_medium=cpc&utm_campaign=esat-aug')
        captureAcquisition()

        expect(storedAcquisition()).toEqual({
            utmSource: 'google',
            utmMedium: 'cpc',
            utmCampaign: 'esat-aug',
            landingPath: '/guides/esat-practice-tests',
        })
    })

    it('does not let a later page overwrite the campaign that brought them', () => {
        land('/?utm_source=google')
        captureAcquisition()

        land('/diagnostics/esat')
        captureAcquisition()

        expect(storedAcquisition()?.utmSource).toBe('google')
        expect(storedAcquisition()?.landingPath).toBe('/')
    })

    it('keeps an external referrer', () => {
        land('/guides', 'https://www.google.com/search?q=esat')
        captureAcquisition()

        expect(storedAcquisition()?.referrer).toBe(
            'https://www.google.com/search?q=esat'
        )
    })

    it('ignores our own pages as a referrer — that is not how anyone found us', () => {
        land('/guides', `${window.location.origin}/about`)
        captureAcquisition()

        expect(storedAcquisition()?.referrer).toBeUndefined()
    })

    it('reports nothing for a visit that carried nothing', () => {
        // landingPath alone is not attribution, but it is still recorded — so
        // this asserts the shape rather than emptiness.
        land('/')
        captureAcquisition()

        const stored = storedAcquisition()
        expect(stored?.utmSource).toBeUndefined()
        expect(stored?.referrer).toBeUndefined()
        expect(stored?.landingPath).toBe('/')
    })

    it('survives storage being unavailable', () => {
        // Private browsing and blocked-storage extensions both throw here.
        // Attribution is worth nothing next to the page rendering.
        const original = Storage.prototype.setItem
        Storage.prototype.setItem = () => {
            throw new Error('blocked')
        }
        expect(() => captureAcquisition()).not.toThrow()
        Storage.prototype.setItem = original
    })
})

describe('capturing a referral code', () => {
    it('reads ?ref= and holds it for the session', () => {
        land('/?ref=AGENT1')
        captureAgentCode()
        expect(storedAgentCode()).toBe('AGENT1')
    })

    it('keeps the first agent who sent them', () => {
        land('/?ref=AGENT1')
        captureAgentCode()
        land('/?ref=AGENT2')
        captureAgentCode()
        expect(storedAgentCode()).toBe('AGENT1')
    })

    it('stores nothing when there is no code', () => {
        land('/')
        captureAgentCode()
        expect(storedAgentCode()).toBeUndefined()
    })
})
