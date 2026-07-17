import { describe, expect, it } from 'vitest'
import { toDiagnosticApiError } from './diagnosticApiError'

describe('toDiagnosticApiError', () => {
    it("uses the backend's detail string as the message", () => {
        const err = toDiagnosticApiError(
            { error: { detail: 'Publish these questions first: q1.' }, response: { status: 409 } },
            'fallback'
        )
        expect(err.message).toBe('Publish these questions first: q1.')
        expect(err.status).toBe(409)
    })

    it('falls back when detail is missing or not a string', () => {
        expect(toDiagnosticApiError({ error: {}, response: { status: 500 } }, 'fallback').message).toBe(
            'fallback'
        )
        // 422 validation detail is an array, not a user string -> fallback.
        expect(
            toDiagnosticApiError({ error: { detail: [{ msg: 'x' }] }, response: { status: 422 } }, 'fallback')
                .message
        ).toBe('fallback')
    })
})
