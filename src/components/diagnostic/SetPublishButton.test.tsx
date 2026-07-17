import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SetPublishButton } from './SetPublishButton'
import type { DiagnosticSetResponse } from '@/client'

const mockMutate = vi.fn()
vi.mock('@/hooks/diagnostic/useUpdateDiagnosticSetMutation.ts', () => ({
    default: () => ({ mutate: mockMutate, isPending: false }),
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

function set(over: Partial<DiagnosticSetResponse> = {}): DiagnosticSetResponse {
    return {
        id: 'set-1',
        title: 'ESAT Maths II — Set A',
        description: null,
        timeLimitMinutes: 40,
        questionIds: ['q1'],
        isFree: true,
        status: 'draft',
        subject: 'ESAT Maths II',
        createdAt: '2026-07-13T00:00:00Z',
        ...over,
    }
}

describe('SetPublishButton', () => {
    beforeEach(() => mockMutate.mockReset())
    afterEach(() => vi.unstubAllGlobals())

    it('publishes a draft set without a confirmation prompt', () => {
        const confirmSpy = vi.fn(() => true)
        vi.stubGlobal('confirm', confirmSpy)
        render(<SetPublishButton set={set({ status: 'draft' })} />)

        fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
        // Publishing is recoverable (just unpublish), so it isn't gated.
        expect(confirmSpy).not.toHaveBeenCalled()
        expect(mockMutate.mock.calls[0][0]).toEqual({ status: 'published' })
    })

    it('confirms before unpublishing — it can strand a live attempt', () => {
        vi.stubGlobal('confirm', vi.fn(() => true))
        render(<SetPublishButton set={set({ status: 'published' })} />)

        fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }))
        expect(mockMutate.mock.calls[0][0]).toEqual({ status: 'draft' })
    })

    it('does not unpublish when the confirmation is declined', () => {
        vi.stubGlobal('confirm', vi.fn(() => false))
        render(<SetPublishButton set={set({ status: 'published' })} />)

        fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }))
        expect(mockMutate).not.toHaveBeenCalled()
    })
})
