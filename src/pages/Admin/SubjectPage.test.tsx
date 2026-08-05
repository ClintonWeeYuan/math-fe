import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SubjectPage } from './SubjectPage'

const mockSubject = vi.fn()
const mockInstances = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<object>('react-router-dom')
    return { ...actual, useParams: () => ({ subjectId: 's1', syllabusId: 'sy1' }) }
})
vi.mock('@/hooks/useGetSubjectQuery.ts', () => ({
    default: () => mockSubject(),
}))
vi.mock('@/hooks/useGetSyllabusQuery.ts', () => ({
    default: () => ({ data: { name: 'SPM', levels: [], paperVariants: [] } }),
}))
vi.mock('@/hooks/useGetPaperInstancesBySubjectQuery.ts', () => ({
    default: () => mockInstances(),
}))
vi.mock('@/components/questionManager/subject/SubjectQuestionsCard.tsx', () => ({
    SubjectQuestionsCard: () => <div>questions card</div>,
}))
vi.mock('@/components/questionManager/subject/PublishSubjectCard.tsx', () => ({
    PublishSubjectCard: () => <div>publish card</div>,
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function renderPage() {
    // The page mounts dialogs that own mutations, so it needs a real client
    // even though every data hook here is mocked.
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    render(
        <QueryClientProvider client={client}>
            <MemoryRouter>
                <SubjectPage />
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('SubjectPage past-paper sections', () => {
    beforeEach(() => {
        mockSubject.mockReset()
        mockInstances.mockReset()
    })

    it('hides them for a subject built from imported chapters', () => {
        // SPM Chemistry: topics and questions, but no papers — two permanently
        // empty tables are noise.
        mockSubject.mockReturnValue({
            data: { id: 's1', name: 'SPM Chemistry', topics: [], papers: [] },
            isLoading: false,
        })
        mockInstances.mockReturnValue({ data: [] })
        renderPage()

        expect(screen.queryByText('Paper Instances')).not.toBeInTheDocument()
        expect(screen.getByText(/No past papers/)).toBeInTheDocument()
    })

    it('still lets you set them up, so nothing is unreachable', async () => {
        mockSubject.mockReturnValue({
            data: { id: 's1', name: 'SPM Chemistry', topics: [], papers: [] },
            isLoading: false,
        })
        mockInstances.mockReturnValue({ data: [] })
        renderPage()

        await userEvent.click(
            screen.getByRole('button', { name: 'Set up past papers' })
        )

        expect(screen.getByText('Paper Instances')).toBeInTheDocument()
    })

    it('shows them for a subject that has papers', () => {
        mockSubject.mockReturnValue({
            data: {
                id: 's1',
                name: 'Additional Mathematics',
                topics: [],
                papers: [{ id: 'p1', name: 'P1' }],
            },
            isLoading: false,
        })
        mockInstances.mockReturnValue({ data: [] })
        renderPage()

        expect(screen.getByText('Paper Instances')).toBeInTheDocument()
        expect(screen.queryByText(/No past papers/)).not.toBeInTheDocument()
    })

    it('shows them when instances exist but papers have not loaded', () => {
        // Mid-setup is still "uses past papers" — hiding the section here
        // would strand the instances that already exist.
        mockSubject.mockReturnValue({
            data: { id: 's1', name: 'X', topics: [], papers: [] },
            isLoading: false,
        })
        mockInstances.mockReturnValue({ data: [{ id: 'pi1' }] })
        renderPage()

        expect(screen.getByText('Paper Instances')).toBeInTheDocument()
    })
})
