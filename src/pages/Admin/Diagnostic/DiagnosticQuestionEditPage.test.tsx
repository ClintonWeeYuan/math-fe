import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DiagnosticQuestionEditPage } from './DiagnosticQuestionEditPage'

const mockNavigate = vi.fn()
const mockUpdateMutate = vi.fn()
const mockUploadAsync = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>(
            'react-router-dom'
        )
    return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks/diagnostic/useGetDiagnosticQuestionQuery.ts', () => ({
    default: () => ({
        data: {
            id: 'q1',
            topicCode: 'MM1.1',
            coreSkillPrimary: 'S1',
            stem: 'stem',
            options: [
                { label: 'A', text: 'x', isCorrect: true },
                { label: 'B', text: 'y', isCorrect: false },
            ],
            correctOption: 'A',
            status: 'draft',
        },
        isLoading: false,
    }),
}))

vi.mock('@/hooks/diagnostic/useUpdateDiagnosticQuestionMutation.ts', () => ({
    default: () => ({
        mutate: mockUpdateMutate,
        isPending: false,
    }),
}))

vi.mock('@/hooks/diagnostic/useUploadDiagnosticQuestionDiagramMutation.ts', () => ({
    default: () => ({
        mutateAsync: mockUploadAsync,
        isPending: false,
    }),
}))

function renderEditPage() {
    return render(
        <MemoryRouter initialEntries={['/admin/questions/q1']}>
            <Routes>
                <Route
                    path="/admin/questions/:questionId"
                    element={<DiagnosticQuestionEditPage />}
                />
            </Routes>
        </MemoryRouter>
    )
}

function attachDiagramFile() {
    fireEvent.click(screen.getByText('Upload image'))
    const fileInput = document.querySelector(
        'input[type="file"]'
    ) as HTMLInputElement
    const file = new File(['<svg></svg>'], 'diagram.svg', {
        type: 'image/svg+xml',
    })
    fireEvent.change(fileInput, { target: { files: [file] } })
}

describe('DiagnosticQuestionEditPage — two-step diagram upload failure handling', () => {
    beforeEach(() => {
        mockNavigate.mockClear()
        mockUpdateMutate.mockClear()
        mockUploadAsync.mockClear()
    })

    it('does not navigate away, and shows an inline retry banner, when the diagram upload fails after the question itself saved successfully', async () => {
        mockUpdateMutate.mockImplementation((_body, { onSuccess }) =>
            onSuccess()
        )
        mockUploadAsync.mockRejectedValue(new Error('network blip'))

        renderEditPage()
        attachDiagramFile()
        fireEvent.click(screen.getByText('Save changes'))

        await waitFor(() =>
            expect(
                screen.getByText(/diagram upload failed: network blip/i)
            ).toBeInTheDocument()
        )
        expect(mockNavigate).not.toHaveBeenCalled()
        expect(screen.getByText('Retry upload')).toBeInTheDocument()
    })

    it('clicking Retry upload re-attempts the upload against the same file without resubmitting the form, and navigates away once it succeeds', async () => {
        mockUpdateMutate.mockImplementation((_body, { onSuccess }) =>
            onSuccess()
        )
        mockUploadAsync.mockRejectedValueOnce(new Error('first failure'))
        mockUploadAsync.mockResolvedValueOnce(undefined)

        renderEditPage()
        attachDiagramFile()
        fireEvent.click(screen.getByText('Save changes'))
        await waitFor(() =>
            expect(screen.getByText('Retry upload')).toBeInTheDocument()
        )

        // The primary update mutation should not fire again on retry — only
        // the upload call itself is re-attempted.
        mockUpdateMutate.mockClear()
        fireEvent.click(screen.getByText('Retry upload'))

        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith('/admin/questions')
        )
        expect(mockUpdateMutate).not.toHaveBeenCalled()
        expect(mockUploadAsync).toHaveBeenCalledTimes(2)
        expect(
            screen.queryByText(/diagram upload failed/i)
        ).not.toBeInTheDocument()
    })

    it('navigates immediately on a normal save with no diagram file involved (unaffected by the sequential-upload change)', async () => {
        mockUpdateMutate.mockImplementation((_body, { onSuccess }) =>
            onSuccess()
        )

        renderEditPage()
        fireEvent.click(screen.getByText('Save changes'))

        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith('/admin/questions')
        )
        expect(mockUploadAsync).not.toHaveBeenCalled()
    })
})
