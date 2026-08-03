import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpmBulkImportDialog } from './SpmBulkImportDialog'

const mockMutate = vi.fn()
vi.mock('@/hooks/useBulkImportSpmQuestionsMutation.ts', () => ({
    default: () => ({ mutate: mockMutate, isPending: false }),
}))
vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}))

const FILE = {
    questionBank: {
        title: 'SPM Chemistry — Paper 1 (Batch 5)',
        subject: 'SPM Chemistry',
        questionOrder: ['chem-p1-b5-q1'],
    },
    questions: [
        {
            sourceRef: 'chem-p1-b5-q1',
            chapter: 'C06',
            topicCode: '6.1.1',
            stem: 'What is an acid?',
            options: [{ label: 'A', text: 'A proton donor' }],
            correctOption: 'A',
        },
    ],
}

function makeFile() {
    return new File([JSON.stringify(FILE)], 'batch5.json', {
        type: 'application/json',
    })
}

async function uploadFile() {
    const input = document.querySelector(
        'input[type="file"]'
    ) as HTMLInputElement
    await userEvent.upload(input, makeFile())
}

describe('SpmBulkImportDialog', () => {
    beforeEach(() => mockMutate.mockReset())

    it('checks the file before it can be imported', async () => {
        render(<SpmBulkImportDialog open onOpenChange={() => {}} />)
        await uploadFile()

        // Import stays disabled until the file has been checked: the point of
        // the two-step flow is that nothing is written before the report.
        expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled()

        await userEvent.click(
            screen.getByRole('button', { name: 'Check file' })
        )
        expect(mockMutate).toHaveBeenCalledTimes(1)
        expect(mockMutate.mock.calls[0][0].dryRun).toBe(true)
    })

    it('lists every problem the dry run found and blocks the import', async () => {
        mockMutate.mockImplementation((_body, opts) =>
            opts?.onSuccess?.({
                isSuccess: false,
                message: 'Validated 55 question(s): 2 problem(s).',
                dryRun: true,
                createdCount: 0,
                updatedCount: 0,
                questionIds: [],
                unknownTopicCodes: [],
                problems: [
                    { sourceRef: 'chem-p1-b5-q4', problem: "correctOption 'Z' isn't an option." },
                    { sourceRef: 'chem-p1-b5-q9', problem: 'Duplicate sourceRef.' },
                ],
            })
        )
        render(<SpmBulkImportDialog open onOpenChange={() => {}} />)
        await uploadFile()
        await userEvent.click(
            screen.getByRole('button', { name: 'Check file' })
        )

        expect(screen.getByText(/chem-p1-b5-q4/)).toBeInTheDocument()
        expect(screen.getByText(/chem-p1-b5-q9/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled()
    })

    it('enables the import once the file checks out, and reports new topics', async () => {
        mockMutate.mockImplementation((_body, opts) =>
            opts?.onSuccess?.({
                isSuccess: true,
                message: 'Validated 55 question(s): 0 problem(s).',
                dryRun: true,
                createdCount: 0,
                updatedCount: 0,
                questionIds: [],
                unknownTopicCodes: ['6.1.1', '6.1.2'],
                problems: [],
            })
        )
        render(<SpmBulkImportDialog open onOpenChange={() => {}} />)
        await uploadFile()
        await userEvent.click(
            screen.getByRole('button', { name: 'Check file' })
        )

        expect(screen.getByText(/2 new topics will be created/)).toBeInTheDocument()
        await waitFor(() =>
            expect(
                screen.getByRole('button', { name: 'Import' })
            ).toBeEnabled()
        )
    })

    it('sends the paper instance id when importing into one', async () => {
        render(
            <SpmBulkImportDialog
                open
                onOpenChange={() => {}}
                paperInstanceId="pi-1"
            />
        )
        await uploadFile()
        await userEvent.click(
            screen.getByRole('button', { name: 'Check file' })
        )

        expect(mockMutate.mock.calls[0][0].paperInstanceId).toBe('pi-1')
    })

    it('sends a null paper instance id for a topic-generated batch', async () => {
        render(<SpmBulkImportDialog open onOpenChange={() => {}} />)
        await uploadFile()
        await userEvent.click(
            screen.getByRole('button', { name: 'Check file' })
        )

        expect(mockMutate.mock.calls[0][0].paperInstanceId).toBeNull()
    })

    it('rejects a file that is not JSON without calling the API', async () => {
        render(<SpmBulkImportDialog open onOpenChange={() => {}} />)
        const input = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement
        await userEvent.upload(
            input,
            new File(['not json'], 'bad.json', { type: 'application/json' })
        )
        await userEvent.click(
            screen.getByRole('button', { name: 'Check file' })
        )

        expect(
            await screen.findByText('That file is not valid JSON.')
        ).toBeInTheDocument()
        expect(mockMutate).not.toHaveBeenCalled()
    })
})
