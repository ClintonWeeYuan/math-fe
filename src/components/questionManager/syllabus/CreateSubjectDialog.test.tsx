import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateSubjectDialog } from './CreateSubjectDialog'

const mockMutateAsync = vi.fn()
vi.mock('@/hooks/useCreateSubjectMutation.ts', () => ({
    default: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))
const mockToastError = vi.fn()
vi.mock('sonner', () => ({
    toast: { error: (...args: unknown[]) => mockToastError(...args) },
}))

async function openDialog() {
    render(<CreateSubjectDialog syllabusId="syl-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'Create Subject' }))
}

describe('CreateSubjectDialog', () => {
    beforeEach(() => {
        mockMutateAsync.mockReset()
        mockToastError.mockReset()
    })

    it('creates a subject with the name and code entered', async () => {
        mockMutateAsync.mockResolvedValue({})
        await openDialog()

        await userEvent.type(screen.getByLabelText('Name'), 'SPM Chemistry')
        await userEvent.type(screen.getByLabelText('Code'), 'SPMCHEM')
        await userEvent.click(screen.getByRole('button', { name: 'Create' }))

        expect(mockMutateAsync).toHaveBeenCalledWith({
            name: 'SPM Chemistry',
            code: 'SPMCHEM',
        })
    })

    it('trims whitespace, since bulk import matches the subject name exactly', async () => {
        mockMutateAsync.mockResolvedValue({})
        await openDialog()

        await userEvent.type(screen.getByLabelText('Name'), '  SPM Chemistry  ')
        await userEvent.type(screen.getByLabelText('Code'), ' SPMCHEM ')
        await userEvent.click(screen.getByRole('button', { name: 'Create' }))

        expect(mockMutateAsync).toHaveBeenCalledWith({
            name: 'SPM Chemistry',
            code: 'SPMCHEM',
        })
    })

    it('cannot submit until both fields have a value', async () => {
        await openDialog()

        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
        await userEvent.type(screen.getByLabelText('Name'), 'SPM Chemistry')
        expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
        await userEvent.type(screen.getByLabelText('Code'), 'SPMCHEM')
        expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled()
    })

    it('keeps the dialog open and reports the failure when the create fails', async () => {
        // A closed dialog reads as success; the subject would not exist and
        // nothing would have said so.
        mockMutateAsync.mockRejectedValue(new Error('duplicate key value'))
        await openDialog()

        await userEvent.type(screen.getByLabelText('Name'), 'SPM Chemistry')
        await userEvent.type(screen.getByLabelText('Code'), 'SPMCHEM')
        await userEvent.click(screen.getByRole('button', { name: 'Create' }))

        expect(mockToastError).toHaveBeenCalledWith('duplicate key value')
        expect(screen.getByLabelText('Name')).toHaveValue('SPM Chemistry')
    })
})
