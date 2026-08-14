import { describe, expect, it, vi, beforeEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'

const requestCode = vi.fn()
const signIn = vi.fn()
let onRequest: { onSuccess: (d: { message: string }) => void }
let onSignIn: { onError: (e: Error) => void }

vi.mock('@/components/auth/useEmailCodeMutations.ts', () => ({
    useRequestEmailCodeMutation: (props: never) => {
        onRequest = props
        return { mutate: requestCode, isPending: false }
    },
    useEmailCodeSignInMutation: (props: never) => {
        onSignIn = props
        return { mutate: signIn, isPending: false }
    },
}))

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}))

import { EmailCodeSignIn } from './EmailCodeSignIn'

function renderIt() {
    return render(
        <EmailCodeSignIn onSignedIn={vi.fn()} onUsePassword={vi.fn()} />
    )
}

function askForACode(email = 'student@example.com') {
    fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: email },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Email me a code' }))
}

function codeArrives() {
    act(() => onRequest.onSuccess({ message: 'On its way.' }))
}

function type(code: string) {
    fireEvent.change(screen.getByLabelText(/enter your code/i), {
        target: { value: code },
    })
}

describe('EmailCodeSignIn', () => {
    beforeEach(() => {
        requestCode.mockClear()
        signIn.mockClear()
    })

    it('asks for a code, then asks for the code', () => {
        renderIt()
        askForACode()
        expect(requestCode).toHaveBeenCalledWith('student@example.com')

        codeArrives()
        expect(screen.getByLabelText(/enter your code/i)).toBeInTheDocument()
    })

    it('does not call the API for an address that cannot be one', () => {
        renderIt()
        askForACode('not-an-email')

        expect(requestCode).not.toHaveBeenCalled()
        expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })

    it('keeps only digits, and only six of them', () => {
        renderIt()
        askForACode()
        codeArrives()

        type('12ab34-56789')
        expect(screen.getByLabelText(/enter your code/i)).toHaveValue('123456')
    })

    it('will not submit a partial code', () => {
        renderIt()
        askForACode()
        codeArrives()

        type('1234')
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()

        type('123456')
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
    })

    it('sends the code with the address it was sent to', () => {
        renderIt()
        askForACode('Student@Example.com')
        codeArrives()
        type('123456')
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

        expect(signIn).toHaveBeenCalledWith({
            email: 'Student@Example.com',
            code: '123456',
        })
    })

    it('clears a rejected code rather than inviting an edit of it', () => {
        // A refused code is dead server-side — it was wrong, expired, or
        // already spent. Leaving the digits in the box invites tweaking one
        // of them, which cannot work and burns an attempt against the cap.
        renderIt()
        askForACode()
        codeArrives()
        type('123456')
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

        act(() => onSignIn.onError(new Error('That code is not valid.')))
        expect(screen.getByLabelText(/enter your code/i)).toHaveValue('')
    })

    it('can request a fresh code without going back a step', () => {
        renderIt()
        askForACode()
        codeArrives()

        fireEvent.click(screen.getByRole('button', { name: /resend code/i }))
        expect(requestCode).toHaveBeenCalledTimes(2)
        expect(screen.getByLabelText(/enter your code/i)).toBeInTheDocument()
    })

    it('offers a way back to a different address', () => {
        renderIt()
        askForACode()
        codeArrives()

        fireEvent.click(
            screen.getByRole('button', { name: /use a different email/i })
        )
        expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    })
})
