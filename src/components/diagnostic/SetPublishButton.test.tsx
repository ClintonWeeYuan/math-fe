import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SetPublishButton } from './SetPublishButton'
import type { DiagnosticSetResponse } from '@/client'

const mockUpdate = vi.fn()
const mockBulkPublish = vi.fn()
vi.mock('@/hooks/diagnostic/useUpdateDiagnosticSetMutation.ts', () => ({
    default: () => ({ mutate: mockUpdate, isPending: false }),
}))
vi.mock('@/hooks/diagnostic/useBulkSetQuestionStatusMutation.ts', () => ({
    default: () => ({ mutateAsync: mockBulkPublish, isPending: false }),
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

function set(over: Partial<DiagnosticSetResponse> = {}): DiagnosticSetResponse {
    return {
        id: 'set-1',
        title: 'ESAT Physics — Set A',
        description: null,
        timeLimitMinutes: 40,
        questionIds: ['q1', 'q2'],
        isFree: false,
        status: 'draft',
        subject: 'ESAT Physics',
        createdAt: '2026-07-13T00:00:00Z',
        ...over,
    }
}

/** An error like the ones the mutation hook throws. */
function apiError(status: number, message: string) {
    const e = new Error(message) as Error & { status?: number }
    e.status = status
    return e
}

describe('SetPublishButton', () => {
    beforeEach(() => {
        mockUpdate.mockReset()
        mockBulkPublish.mockReset()
    })
    afterEach(() => vi.unstubAllGlobals())

    it('publishes a draft set directly when the gate passes', () => {
        mockUpdate.mockImplementation((_body, opts) => opts.onSuccess?.())
        render(<SetPublishButton set={set()} />)
        fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
        expect(mockUpdate.mock.calls[0][0]).toEqual({ status: 'published' })
    })

    it('on the draft-questions 409, offers to publish the questions then retries', async () => {
        vi.stubGlobal('confirm', vi.fn(() => true))
        // First publish fails with the draft-questions 409; bulk-publish then
        // succeeds; the retried publish succeeds.
        mockUpdate
            .mockImplementationOnce((_b, opts) =>
                opts.onError?.(apiError(409, 'Can’t publish: these questions are still draft'))
            )
            .mockImplementationOnce((_b, opts) => opts.onSuccess?.())
        mockBulkPublish.mockResolvedValue({ updatedCount: 2 })

        render(<SetPublishButton set={set()} />)
        fireEvent.click(screen.getByRole('button', { name: 'Publish' }))

        await waitFor(() =>
            expect(mockBulkPublish).toHaveBeenCalledWith({
                questionIds: ['q1', 'q2'],
                status: 'published',
            })
        )
        // Retried the set publish after the bulk-publish.
        await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(2))
    })

    it('does not bulk-publish if the admin declines the confirm', async () => {
        vi.stubGlobal('confirm', vi.fn(() => false))
        mockUpdate.mockImplementationOnce((_b, opts) =>
            opts.onError?.(apiError(409, 'still draft'))
        )
        render(<SetPublishButton set={set()} />)
        fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
        await waitFor(() => expect(mockBulkPublish).not.toHaveBeenCalled())
    })

    it('does not offer the retry for an empty-set 409 (no questions to publish)', async () => {
        vi.stubGlobal('confirm', vi.fn(() => true))
        mockUpdate.mockImplementationOnce((_b, opts) =>
            opts.onError?.(apiError(409, 'Can’t publish a set with no questions.'))
        )
        render(<SetPublishButton set={set({ questionIds: [] })} />)
        fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
        await waitFor(() => expect(mockBulkPublish).not.toHaveBeenCalled())
    })

    it('confirms before unpublishing', () => {
        vi.stubGlobal('confirm', vi.fn(() => true))
        mockUpdate.mockImplementation((_b, opts) => opts.onSuccess?.())
        render(<SetPublishButton set={set({ status: 'published' })} />)
        fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }))
        expect(mockUpdate.mock.calls[0][0]).toEqual({ status: 'draft' })
    })
})
