import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BulkImportDialog } from './BulkImportDialog'

const mockMutate = vi.fn()

vi.mock('@/hooks/diagnostic/useBulkImportDiagnosticQuestionsMutation.ts', () => ({
    default: () => ({
        mutate: mockMutate,
        isPending: false,
    }),
}))

function makeJsonFile(content: string) {
    return new File([content], 'import.json', { type: 'application/json' })
}

describe('BulkImportDialog', () => {
    it('shows a parse error and never calls the mutation when the file is not valid JSON', async () => {
        mockMutate.mockClear()
        render(<BulkImportDialog open={true} onOpenChange={() => {}} />)

        const input = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement
        fireEvent.change(input, {
            target: { files: [makeJsonFile('{not valid json')] },
        })
        fireEvent.click(screen.getByText('Import'))

        await waitFor(() =>
            expect(
                screen.getByText(/not valid json/i)
            ).toBeInTheDocument()
        )
        expect(mockMutate).not.toHaveBeenCalled()
    })

    it('parses valid JSON and passes the parsed object to the mutation, not the raw file', async () => {
        mockMutate.mockClear()
        render(<BulkImportDialog open={true} onOpenChange={() => {}} />)

        const payload = {
            diagnosticSet: { title: 'Test Set', timeLimitMinutes: 10, questionOrder: [] },
            questions: [],
        }
        const input = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement
        fireEvent.change(input, {
            target: { files: [makeJsonFile(JSON.stringify(payload))] },
        })
        fireEvent.click(screen.getByText('Import'))

        await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1))
        expect(mockMutate.mock.calls[0][0]).toEqual(payload)
    })
})
