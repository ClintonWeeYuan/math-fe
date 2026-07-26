import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TmuaWaitlistForm } from './TmuaWaitlistForm'

describe('TmuaWaitlistForm', () => {
    it('rejects an invalid email with an error and no success state', () => {
        render(<TmuaWaitlistForm />)
        fireEvent.change(screen.getByLabelText('Email address'), {
            target: { value: 'not-an-email' },
        })
        fireEvent.click(screen.getByText('Join waitlist'))
        expect(
            screen.getByText(/valid email address/i)
        ).toBeInTheDocument()
        expect(screen.queryByText(/on the list/i)).not.toBeInTheDocument()
    })

    it('accepts a valid email and shows the success state', () => {
        render(<TmuaWaitlistForm />)
        fireEvent.change(screen.getByLabelText('Email address'), {
            target: { value: 'student@example.com' },
        })
        fireEvent.click(screen.getByText('Join waitlist'))
        expect(screen.getByText(/on the list/i)).toBeInTheDocument()
    })
})
