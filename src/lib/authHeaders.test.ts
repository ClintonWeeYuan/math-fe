import { afterEach, describe, expect, it } from 'vitest'
import { getAuthHeaders } from './authHeaders'

describe('getAuthHeaders', () => {
    afterEach(() => {
        localStorage.clear()
    })

    it('returns a Bearer header built from the stored token', () => {
        localStorage.setItem('token', 'abc123')
        expect(getAuthHeaders()).toEqual({ Authorization: 'Bearer abc123' })
    })

    it('returns an empty Bearer header when no token is stored, not a crash', () => {
        expect(getAuthHeaders()).toEqual({ Authorization: 'Bearer ' })
    })
})
