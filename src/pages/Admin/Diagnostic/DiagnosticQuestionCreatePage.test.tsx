import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DiagnosticQuestionCreatePage } from './DiagnosticQuestionCreatePage'

const mockNavigate = vi.fn()
const mockCreateMutate = vi.fn()
const mockUploadAsync = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>(
            'react-router-dom'
        )
    return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/hooks/diagnostic/useCreateDiagnosticQuestionMutation.ts', () => ({
    default: () => ({
        mutate: mockCreateMutate,
        isPending: false,
    }),
}))

vi.mock('@/hooks/diagnostic/useUploadDiagnosticQuestionDiagramMutation.ts', () => ({
    default: () => ({
        mutateAsync: mockUploadAsync,
        isPending: false,
    }),
}))

function renderCreatePage() {
    return render(
        <MemoryRouter initialEntries={['/admin/questions/new']}>
            <Routes>
                <Route
                    path="/admin/questions/new"
                    element={<DiagnosticQuestionCreatePage />}
                />
            </Routes>
        </MemoryRouter>
    )
}

function fillRequiredFields() {
    fireEvent.change(screen.getByPlaceholderText(/e.g. MM1.6/i), {
        target: { value: 'MM1.1' },
    })
    const combo = screen
        .getAllByRole('combobox')
        .find((c) => c.textContent?.includes('Select a skill'))!
    fireEvent.click(combo)
    const option = screen.getByText('S1', { selector: '[role="option"] *' })
    fireEvent.pointerDown(option)
    fireEvent.pointerUp(option)
    fireEvent.click(option)
    fireEvent.change(screen.getByPlaceholderText(/Given that/i), {
        target: { value: 'stem' },
    })
    const optionTexts = screen.getAllByPlaceholderText(
        'Option text, LaTeX allowed'
    )
    fireEvent.change(optionTexts[0], { target: { value: 'A text' } })
    fireEvent.change(optionTexts[1], { target: { value: 'B text' } })
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

describe('DiagnosticQuestionCreatePage — two-step diagram upload failure handling', () => {
    beforeEach(() => {
        mockNavigate.mockClear()
        mockCreateMutate.mockClear()
        mockUploadAsync.mockClear()
    })

    it('redirects to the new row\'s own edit page (not back to a blank create form) with the error attached, when the diagram upload fails after a successful create', async () => {
        mockCreateMutate.mockImplementation((_body, { onSuccess }) =>
            onSuccess({ id: 'new-question-id' })
        )
        mockUploadAsync.mockRejectedValue(new Error('upload exploded'))

        renderCreatePage()
        fillRequiredFields()
        attachDiagramFile()
        fireEvent.click(screen.getByText('Create question'))

        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith(
                '/admin/questions/new-question-id',
                { state: { diagramUploadError: 'upload exploded' } }
            )
        )
        // Specifically not a second call to create — resubmitting create
        // would produce a duplicate row, which is exactly what redirecting
        // to edit instead of staying on this form avoids.
        expect(mockCreateMutate).toHaveBeenCalledTimes(1)
    })

    it('navigates to the plain list page on full success (create + upload both succeed)', async () => {
        mockCreateMutate.mockImplementation((_body, { onSuccess }) =>
            onSuccess({ id: 'new-question-id' })
        )
        mockUploadAsync.mockResolvedValue(undefined)

        renderCreatePage()
        fillRequiredFields()
        attachDiagramFile()
        fireEvent.click(screen.getByText('Create question'))

        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith('/admin/questions')
        )
    })
})
