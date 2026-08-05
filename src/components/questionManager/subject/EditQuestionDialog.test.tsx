import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditQuestionDialog } from './EditQuestionDialog'

const mockMutateAsync = vi.fn()
const mockOptions = vi.fn()
vi.mock('@/hooks/useEditQuestionMutation.ts', () => ({
    default: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))
vi.mock('@/hooks/questionOptions/useGetQuestionOptionsQuery.ts', () => ({
    default: () => mockOptions(),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const QUESTION = {
    id: 'q1',
    stem: 'What is an acid?',
    difficulty: 'easy',
    chapter: 'C06',
    topicCode: '6.1.1',
    archetype: 'Recall / concept',
    correctOption: 'A',
    topics: [],
    createdAt: '2026-08-04T00:00:00Z',
    marks: null,
    type: 'multiple_choice',
} as never

function setOptions(rows: unknown[]) {
    mockOptions.mockReturnValue({ data: rows })
}

function renderDialog() {
    render(
        <EditQuestionDialog question={QUESTION} open onOpenChange={() => {}} />
    )
}

const BASE_OPTIONS = [
    { id: 'o1', label: 'A', value: 'A proton donor', position: 0, isCorrect: true, misconception: null },
    { id: 'o2', label: 'B', value: 'A proton acceptor', position: 1, isCorrect: false, misconception: 'Confuses base' },
]

describe('EditQuestionDialog', () => {
    beforeEach(() => {
        mockMutateAsync.mockReset()
        mockMutateAsync.mockResolvedValue({})
        mockOptions.mockReset()
        setOptions(BASE_OPTIONS)
    })

    it('seeds from the question and its existing options', () => {
        renderDialog()
        expect(screen.getByLabelText('Question')).toHaveValue('What is an acid?')
        expect(screen.getByLabelText('Option 1 text')).toHaveValue('A proton donor')
        expect(screen.getByLabelText('Option 2 misconception')).toHaveValue('Confuses base')
    })

    it('saves the stem, classification, options and answer together', async () => {
        renderDialog()
        const stem = screen.getByLabelText('Question')
        await userEvent.clear(stem)
        await userEvent.type(stem, 'Corrected stem')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))

        const body = mockMutateAsync.mock.calls[0][0]
        expect(body.stem).toBe('Corrected stem')
        expect(body.chapter).toBe('C06')
        expect(body.correctOption).toBe('A')
        expect(body.options).toEqual([
            { label: 'A', text: 'A proton donor', misconception: null },
            { label: 'B', text: 'A proton acceptor', misconception: 'Confuses base' },
        ])
    })

    it('sends null rather than an empty misconception', async () => {
        // The radar narrates these; an empty string would render as a blank
        // explanation rather than none.
        setOptions([{ ...BASE_OPTIONS[0], misconception: '' }])
        renderDialog()
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))

        expect(mockMutateAsync.mock.calls[0][0].options[0].misconception).toBeNull()
    })

    it('never sends isCorrect — the answer is stated once', async () => {
        renderDialog()
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))

        const body = mockMutateAsync.mock.calls[0][0]
        expect(body.options.every((o: object) => !('isCorrect' in o))).toBe(true)
    })

    it('changes which option is correct', async () => {
        renderDialog()
        await userEvent.click(screen.getAllByRole('radio')[1])
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))

        expect(mockMutateAsync.mock.calls[0][0].correctOption).toBe('B')
    })

    it('cannot be saved with an empty question', async () => {
        renderDialog()
        await userEvent.clear(screen.getByLabelText('Question'))
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('cannot be saved when the answer is not one of the options', async () => {
        renderDialog()
        const label = screen.getByLabelText('Option 1 label')
        await userEvent.clear(label)
        await userEvent.type(label, 'Z')

        expect(screen.getByText('Choose which option is correct.')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })
})
