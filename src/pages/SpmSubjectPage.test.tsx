import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SpmSubjectPage } from './SpmSubjectPage'

const mockSlugQuery = vi.fn()
vi.mock('@/hooks/useGetSubjectBySlugQuery.ts', () => ({
    default: () => mockSlugQuery(),
}))
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<object>('react-router-dom')
    return { ...actual, useParams: () => ({ slug: 'chemistry' }) }
})
vi.mock('@/components/questionBank/QuestionBank.tsx', () => ({
    QuestionBank: ({ subjectId }: { subjectId: string }) => (
        <div>bank for {subjectId}</div>
    ),
}))
vi.mock('@/components/layout/UserLayout.tsx', () => ({
    UserLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('@/components/Seo.tsx', () => ({
    Seo: ({ title, path }: { title: string; path: string }) => (
        <div data-testid="seo" data-title={title} data-path={path} />
    ),
}))

function renderPage() {
    render(
        <MemoryRouter>
            <SpmSubjectPage />
        </MemoryRouter>
    )
}

describe('SpmSubjectPage', () => {
    beforeEach(() => mockSlugQuery.mockReset())

    it('renders the bank for the subject the slug resolves to', () => {
        mockSlugQuery.mockReturnValue({
            data: { id: 'chem-uuid', name: 'SPM Chemistry' },
            isLoading: false,
            isError: false,
        })
        renderPage()

        expect(screen.getByText('bank for chem-uuid')).toBeInTheDocument()
    })

    it('gives the page its own title and canonical path', () => {
        // The URLs this replaces served the homepage's metadata, canonical
        // included, so all three subject pages declared themselves duplicates
        // of the front page.
        mockSlugQuery.mockReturnValue({
            data: { id: 'chem-uuid', name: 'SPM Chemistry' },
            isLoading: false,
            isError: false,
        })
        renderPage()

        const seo = screen.getByTestId('seo')
        expect(seo.dataset.title).toBe('SPM Chemistry Practice Questions | JomExam')
        expect(seo.dataset.path).toBe('/spm/chemistry')
    })

    it('says so for a slug that does not exist', () => {
        mockSlugQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        })
        renderPage()

        expect(screen.getByText('No such subject')).toBeInTheDocument()
        expect(screen.queryByText(/^bank for/)).not.toBeInTheDocument()
    })

    it('does not ask for a bank before the subject resolves', () => {
        // Rendering early would fire a request for subject "undefined".
        mockSlugQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })
        renderPage()

        expect(screen.queryByText(/^bank for/)).not.toBeInTheDocument()
    })
})
