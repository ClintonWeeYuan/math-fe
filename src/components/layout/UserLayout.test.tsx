import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UserLayout } from './UserLayout'

vi.mock('@/components/auth/AuthContext.tsx', () => ({
    useAuth: () => ({ user: null, logout: vi.fn() }),
}))

describe('UserLayout header', () => {
    it('links the logo to the homepage', () => {
        // Without this the only way out of a question bank was the browser's
        // back button — the landing header has always linked it.
        render(
            <MemoryRouter>
                <UserLayout>
                    <div>page</div>
                </UserLayout>
            </MemoryRouter>
        )

        expect(
            screen.getByRole('link', { name: 'JomExam home' })
        ).toHaveAttribute('href', '/')
    })
})
