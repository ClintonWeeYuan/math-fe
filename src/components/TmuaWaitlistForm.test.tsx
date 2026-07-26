import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TmuaWaitlistForm } from './TmuaWaitlistForm'

const mockJoin = vi.fn()
vi.mock('@/hooks/useJoinWaitlistMutation.ts', () => ({
    default: () => ({ mutate: mockJoin, isPending: false }),
}))

describe('TmuaWaitlistForm', () => {
    beforeEach(() => mockJoin.mockReset())

    it('rejects an invalid email without calling the API', () => {
        render(<TmuaWaitlistForm />)
        fireEvent.change(screen.getByLabelText('Email address'), {
            target: { value: 'not-an-email' },
        })
        fireEvent.click(screen.getByText('Join waitlist'))
        expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
        expect(mockJoin).not.toHaveBeenCalled()
    })

    it('posts a valid email with the product and shows success', async () => {
        mockJoin.mockImplementation((_body, opts) => opts?.onSuccess?.())
        render(<TmuaWaitlistForm />)
        fireEvent.change(screen.getByLabelText('Email address'), {
            target: { value: 'student@example.com' },
        })
        fireEvent.click(screen.getByText('Join waitlist'))
        await waitFor(() =>
            expect(screen.getByText(/on the list/i)).toBeInTheDocument()
        )
        expect(mockJoin.mock.calls[0][0]).toEqual({
            email: 'student@example.com',
            product: 'tmua',
        })
    })

    it('sends the product it was given', () => {
        mockJoin.mockImplementation(() => {})
        render(<TmuaWaitlistForm product="esat-chemistry" />)
        fireEvent.change(screen.getByLabelText('Email address'), {
            target: { value: 'a@b.com' },
        })
        fireEvent.click(screen.getByText('Join waitlist'))
        expect(mockJoin.mock.calls[0][0].product).toBe('esat-chemistry')
    })

    it('surfaces a backend error instead of a false success', async () => {
        mockJoin.mockImplementation((_body, opts) =>
            opts?.onError?.(new Error('Unknown product.'))
        )
        render(<TmuaWaitlistForm />)
        fireEvent.change(screen.getByLabelText('Email address'), {
            target: { value: 'a@b.com' },
        })
        fireEvent.click(screen.getByText('Join waitlist'))
        await waitFor(() =>
            expect(screen.getByText(/Unknown product/)).toBeInTheDocument()
        )
        expect(screen.queryByText(/on the list/i)).not.toBeInTheDocument()
    })
})
