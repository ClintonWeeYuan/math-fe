import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import useEsatModules from './useEsatModules'

const mockFetch = vi.fn()
const mockSave = vi.fn()

vi.mock('@/lib/esatModules.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/esatModules.ts')>()),
    fetchMyEsatModules: () => mockFetch(),
    saveMyEsatModules: (m: unknown) => mockSave(m),
}))

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const KEY = 'jomexam:esat-modules'

beforeEach(() => {
    mockFetch.mockReset()
    mockSave.mockReset()
    mockSave.mockImplementation(async (m) => m)
    localStorage.clear()
})

describe('useEsatModules', () => {
    it('reads the account for a signed-in student', async () => {
        mockFetch.mockResolvedValue(['maths_1', 'maths_2', 'physics'])
        const { result } = renderHook(
            () => useEsatModules({ enabled: true, signedIn: true }), { wrapper })
        await waitFor(() => expect(result.current.modules).toEqual(['maths_1', 'maths_2', 'physics']))
    })

    it('saves a choice to the account and the device', async () => {
        mockFetch.mockResolvedValue(['maths_1', 'maths_2', 'physics'])
        const { result } = renderHook(
            () => useEsatModules({ enabled: true, signedIn: true }), { wrapper })
        await waitFor(() => expect(result.current.isLoading).toBe(false))
        act(() => result.current.choose(['maths_1', 'chemistry']))
        await waitFor(() => expect(mockSave).toHaveBeenCalledWith(['maths_1', 'chemistry']))
        expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['maths_1', 'chemistry'])
        await waitFor(() => expect(result.current.modules).toEqual(['maths_1', 'chemistry']))
    })

    it('keeps a signed-out choice on the device only', () => {
        const { result } = renderHook(
            () => useEsatModules({ enabled: true, signedIn: false }), { wrapper })
        expect(result.current.modules).toBeNull()
        act(() => result.current.choose(['maths_1', 'biology']))
        expect(result.current.modules).toEqual(['maths_1', 'biology'])
        expect(mockFetch).not.toHaveBeenCalled()
        expect(mockSave).not.toHaveBeenCalled()
    })

    it('copies a signed-out choice to the account once they sign in', async () => {
        localStorage.setItem(KEY, JSON.stringify(['maths_1', 'physics']))
        mockFetch.mockResolvedValue(null)
        renderHook(() => useEsatModules({ enabled: true, signedIn: true }), { wrapper })
        await waitFor(() => expect(mockSave).toHaveBeenCalledWith(['maths_1', 'physics']))
        expect(mockSave).toHaveBeenCalledTimes(1)
    })

    it('lets the account win over the device', async () => {
        localStorage.setItem(KEY, JSON.stringify(['maths_1', 'physics']))
        mockFetch.mockResolvedValue(['maths_1', 'chemistry', 'biology'])
        const { result } = renderHook(
            () => useEsatModules({ enabled: true, signedIn: true }), { wrapper })
        await waitFor(() => expect(result.current.modules).toEqual(['maths_1', 'chemistry', 'biology']))
        expect(mockSave).not.toHaveBeenCalled()
    })

    it('ignores a corrupt saved choice', () => {
        localStorage.setItem(KEY, '["physics"]')
        const { result } = renderHook(
            () => useEsatModules({ enabled: true, signedIn: false }), { wrapper })
        expect(result.current.modules).toBeNull()
    })
})
