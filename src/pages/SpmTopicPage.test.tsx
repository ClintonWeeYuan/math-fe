import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SpmTopicPage } from './SpmTopicPage'

const mockSubject = vi.fn()
const mockSetSearchParams = vi.fn()
let currentParams = new URLSearchParams()

vi.mock('@/hooks/useGetSubjectBySlugQuery.ts', () => ({
    default: () => mockSubject(),
}))
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<object>('react-router-dom')
    return {
        ...actual,
        useParams: () => ({ slug: 'chemistry', topicSlug: 'acids-bases-and-salts' }),
        useSearchParams: () => [currentParams, mockSetSearchParams],
    }
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

const TOPIC = { id: 'topic-uuid', name: 'Acids, Bases and Salts', slug: 'acids-bases-and-salts' }
const SUBJECT = { id: 'chem-uuid', name: 'SPM Chemistry', topics: [TOPIC] }

function renderPage() {
    render(
        <MemoryRouter>
            <SpmTopicPage />
        </MemoryRouter>
    )
}

describe('SpmTopicPage', () => {
    beforeEach(() => {
        mockSubject.mockReset()
        mockSetSearchParams.mockReset()
        currentParams = new URLSearchParams()
    })

    it('filters the bank to the topic in the URL', () => {
        // The bank filters from the query string, so the page puts the topic
        // there rather than teaching the bank a second way to be filtered.
        mockSubject.mockReturnValue({ data: SUBJECT, isLoading: false, isError: false })
        renderPage()

        const next = mockSetSearchParams.mock.calls[0][0] as URLSearchParams
        expect(next.getAll('topics')).toEqual(['topic-uuid'])
        expect(mockSetSearchParams.mock.calls[0][1]).toEqual({ replace: true })
    })

    it('does not rewrite the URL once the filter is already set', () => {
        currentParams = new URLSearchParams([['topics', 'topic-uuid']])
        mockSubject.mockReturnValue({ data: SUBJECT, isLoading: false, isError: false })
        renderPage()

        expect(mockSetSearchParams).not.toHaveBeenCalled()
    })

    it('gives the page its own title and canonical', () => {
        mockSubject.mockReturnValue({ data: SUBJECT, isLoading: false, isError: false })
        renderPage()

        const seo = screen.getByTestId('seo')
        expect(seo.dataset.title).toBe(
            'Acids, Bases and Salts — SPM Chemistry Questions | JomExam'
        )
        expect(seo.dataset.path).toBe('/spm/chemistry/acids-bases-and-salts')
    })

    it('says so when the subject exists but the topic does not', () => {
        mockSubject.mockReturnValue({
            data: { ...SUBJECT, topics: [] },
            isLoading: false,
            isError: false,
        })
        renderPage()

        expect(screen.getByText('No such topic')).toBeInTheDocument()
        expect(screen.queryByText(/^bank for/)).not.toBeInTheDocument()
    })

    it('does not render a bank before the subject resolves', () => {
        mockSubject.mockReturnValue({ data: undefined, isLoading: true, isError: false })
        renderPage()

        expect(screen.queryByText(/^bank for/)).not.toBeInTheDocument()
    })
})
