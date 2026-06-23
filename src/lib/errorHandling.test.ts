import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { extractErrorMessage } from './errorHandling'

function makeAxiosErrorWithResponse(data: unknown, status = 422): AxiosError {
    return new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
            data,
            status,
            statusText: 'Error',
            headers: {},
            config: { headers: new AxiosHeaders() },
        }
    )
}

describe('extractErrorMessage', () => {
    it('returns the backend detail when the response matches the expected shape', () => {
        const error = makeAxiosErrorWithResponse({ detail: 'Email already exists' })
        expect(extractErrorMessage(error)).toBe('Email already exists')
    })

    it('falls back to error.message (not undefined) when the response body does not match the expected shape', () => {
        // Regression: previously this branch fell through with no return,
        // so the function returned `undefined` instead of a usable string.
        const error = makeAxiosErrorWithResponse([{ msg: 'validation error' }])
        const result = extractErrorMessage(error)
        expect(result).toBeTypeOf('string')
        expect(result).toBe(error.message)
    })

    it('falls back to error.message for a non-axios error', () => {
        const error = new Error('Network down')
        expect(extractErrorMessage(error)).toBe('Network down')
    })
})
