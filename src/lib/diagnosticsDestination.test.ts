import { describe, expect, it } from 'vitest'
import { diagnosticsPathFor, unlockedLabel } from './diagnosticsDestination'

/**
 * Where a pass holder is sent to "browse the papers".
 *
 * Passes are sold per test. Sending everyone to the combined listing is the
 * bug this exists to stop: that page opens with the five ESAT subjects, so a
 * student who had just paid for TMUA landed on papers their pass does not
 * open — after checkout, and again from their results page.
 */
describe('diagnosticsPathFor', () => {
    it('sends a TMUA pass holder to the TMUA papers', () => {
        expect(diagnosticsPathFor(['tmua'])).toBe('/diagnostics/tmua')
    })

    it('sends an ESAT pass holder to the ESAT papers', () => {
        expect(diagnosticsPathFor(['esat'])).toBe('/diagnostics/esat')
    })

    it('keeps the combined listing for someone holding both', () => {
        // No single right answer, so narrowing would hide half of what they
        // have paid for.
        expect(diagnosticsPathFor(['esat', 'tmua'])).toBe('/diagnostics')
        expect(diagnosticsPathFor(['tmua', 'esat'])).toBe('/diagnostics')
    })

    it('keeps the combined listing for someone holding nothing', () => {
        expect(diagnosticsPathFor([])).toBe('/diagnostics')
    })

    it('survives the answer not having arrived yet', () => {
        // The billing query is in flight on first render; undefined must not
        // throw or invent a destination.
        expect(diagnosticsPathFor(undefined)).toBe('/diagnostics')
    })

    it('ignores products it does not have a page for', () => {
        // A comped legacy pass can report a test string this build knows
        // nothing about. Falling back beats routing to /diagnostics/undefined.
        expect(diagnosticsPathFor(['spm'])).toBe('/diagnostics')
        expect(diagnosticsPathFor(['spm', 'tmua'])).toBe('/diagnostics/tmua')
    })
})

describe('unlockedLabel', () => {
    it('names the test that was actually bought', () => {
        expect(unlockedLabel(['tmua'])).toBe('Every TMUA paper is open')
        expect(unlockedLabel(['esat'])).toBe('Every ESAT paper is open')
    })

    it('claims everything only when everything is covered', () => {
        // "Every paper is open" read as a promise the single-test pass does
        // not keep, immediately before the buyer met a locked ESAT paper.
        expect(unlockedLabel(['esat', 'tmua'])).toBe('Every paper is open')
        expect(unlockedLabel([])).toBe('Every paper is open')
        expect(unlockedLabel(undefined)).toBe('Every paper is open')
    })
})
