import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
    MemoryRouter,
    Route,
    Routes,
    Link,
    useLocation,
} from 'react-router-dom'

/**
 * Where editing a question sends you afterwards.
 *
 * Reached from a set's review screen, saving used to land on the questions
 * list — which loses the set you were working through, so an admin fixing 27
 * questions navigated back 27 times. Reached from the questions list, that
 * list is still the right destination.
 *
 * These exercise the routing contract (state carried on the link, read on
 * arrival) rather than the edit form itself, which needs the whole API.
 */

function Origin({ to, state }: { to: string; state?: unknown }) {
    return (
        <Link to={to} state={state}>
            Edit
        </Link>
    )
}

function EditStub() {
    const location = useLocation()
    const returnTo =
        (location.state as { returnTo?: string } | null)?.returnTo ??
        '/admin/questions'
    return <div data-testid="returns-to">{returnTo}</div>
}

function renderFrom(from: string, state?: unknown) {
    render(
        <MemoryRouter initialEntries={[from]}>
            <Routes>
                <Route
                    path="/admin/questions"
                    element={<Origin to="/admin/questions/q1" />}
                />
                <Route
                    path="/admin/sets/:setId/preview"
                    element={<Origin to="/admin/questions/q1" state={state} />}
                />
                <Route
                    path="/admin/questions/:questionId"
                    element={<EditStub />}
                />
            </Routes>
        </MemoryRouter>
    )
}

describe('where saving a question returns to', () => {
    it('goes back to the set when the edit came from a set', async () => {
        renderFrom('/admin/sets/set-42/preview', {
            returnTo: '/admin/sets/set-42/preview',
        })
        screen.getByText('Edit').click()
        expect(await screen.findByTestId('returns-to')).toHaveTextContent(
            '/admin/sets/set-42/preview'
        )
    })

    it('goes back to the questions list when the edit came from there', async () => {
        renderFrom('/admin/questions')
        screen.getByText('Edit').click()
        expect(await screen.findByTestId('returns-to')).toHaveTextContent(
            '/admin/questions'
        )
    })

    it('falls back to the list on a direct visit or refresh', async () => {
        // A bookmark or a hard refresh has no router state at all; landing
        // somewhere is better than landing nowhere.
        render(
            <MemoryRouter initialEntries={['/admin/questions/q1']}>
                <Routes>
                    <Route
                        path="/admin/questions/:questionId"
                        element={<EditStub />}
                    />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByTestId('returns-to')).toHaveTextContent(
            '/admin/questions'
        )
    })
})
