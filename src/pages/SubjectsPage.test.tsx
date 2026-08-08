import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SubjectsPage from './SubjectsPage'

const mockQuery = vi.fn()
vi.mock('@/hooks/usePublishedSubjectsQuery.ts', () => ({
    default: () => mockQuery(),
}))

function renderGrid() {
    render(
        <MemoryRouter>
            <SubjectsPage embedded />
        </MemoryRouter>
    )
}

describe('SubjectsPage', () => {
    it('lists whatever the API returns, not a hard-coded set', () => {
        // The bug this replaces: the list was two uuids in a TS array, so a
        // subject created afterwards had nothing linking to it.
        mockQuery.mockReturnValue({
            data: [
                { id: 'a', name: 'SPM Chemistry', code: 'CHEM', topicCount: 1, questionCount: 40 },
                { id: 'b', name: 'SPM Physics', code: 'PHY', topicCount: 3, questionCount: 90 },
            ],
            isLoading: false,
            isError: false,
        })
        renderGrid()

        expect(screen.getByText('SPM Chemistry')).toBeInTheDocument()
        expect(screen.getByText('SPM Physics')).toBeInTheDocument()
        expect(screen.getByText('40 questions')).toBeInTheDocument()
    })

    it('links each subject by its readable URL', () => {
        // Linking by uuid and letting the redirect rewrite it means the uuid
        // is what lands in the address bar.
        mockQuery.mockReturnValue({
            data: [{ id: 'chem-id', slug: 'chemistry', name: 'SPM Chemistry', code: 'CHEM', topicCount: 1, questionCount: 40 }],
            isLoading: false,
            isError: false,
        })
        renderGrid()

        expect(screen.getByRole('link')).toHaveAttribute('href', '/spm/chemistry')
    })

    it('still links a subject that has no slug, by id', () => {
        mockQuery.mockReturnValue({
            data: [{ id: 'old-id', name: 'Legacy Subject', code: 'X', topicCount: 1, questionCount: 2 }],
            isLoading: false,
            isError: false,
        })
        renderGrid()

        expect(screen.getByRole('link')).toHaveAttribute('href', '/questions/old-id')
    })

    it('renders a subject it has no styling for rather than dropping it', () => {
        // Presentation is keyed by name; an unknown subject must still appear,
        // since "not in the lookup" is exactly how the old bug hid things.
        mockQuery.mockReturnValue({
            data: [{ id: 'x', name: 'SPM Geography', code: 'GEO', topicCount: 2, questionCount: 7 }],
            isLoading: false,
            isError: false,
        })
        renderGrid()

        expect(screen.getByText('SPM Geography')).toBeInTheDocument()
        expect(screen.getByText('Practise by topic and difficulty')).toBeInTheDocument()
    })

    it('says so when the subjects cannot be loaded', () => {
        mockQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true })
        renderGrid()

        expect(screen.getByText(/Couldn't load subjects/)).toBeInTheDocument()
    })
})
