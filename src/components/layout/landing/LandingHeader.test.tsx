import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LandingHeader } from './LandingHeader'

const mockLogout = vi.fn()
let mockUser: { name: string; email: string } | null = null

vi.mock('@/components/auth/AuthContext.tsx', () => ({
    useAuth: () => ({ user: mockUser, logout: mockLogout }),
}))

function renderHeader() {
    return render(
        <MemoryRouter>
            <LandingHeader />
        </MemoryRouter>
    )
}

describe('LandingHeader', () => {
    beforeEach(() => {
        mockLogout.mockReset()
        mockUser = null
    })

    it('offers sign up / login to a visitor', () => {
        renderHeader()
        expect(
            screen.getByRole('button', { name: /sign up\/ login/i })
        ).toBeInTheDocument()
    })

    it('lets a signed-in student sign out', async () => {
        // The name used to be a button with no click handler: it looked like
        // a menu and did nothing, so on every page but the SPM banks there
        // was no way to sign out at all.
        mockUser = { name: 'A Student', email: 'student@example.com' }
        renderHeader()

        await userEvent.click(screen.getByRole('button', { name: 'A Student' }))
        await userEvent.click(screen.getByRole('button', { name: /sign out/i }))

        expect(mockLogout).toHaveBeenCalledTimes(1)
    })

    it('shows which account is signed in', () => {
        // Two students sharing a laptop is the case that matters — signing
        // out is only useful if you can tell whose session you are in.
        mockUser = { name: 'A Student', email: 'student@example.com' }
        renderHeader()

        expect(
            screen.getByRole('button', { name: 'A Student' })
        ).toBeInTheDocument()
    })
})
