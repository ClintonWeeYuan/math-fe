import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QuestionReportsPage } from './QuestionReportsPage'
import { client } from '@/client/client.gen'

vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const get = vi.spyOn(client, 'get')
const patch = vi.spyOn(client, 'patch')

const report = (over: object) => ({
    id: 'r1', questionId: 'q1', attemptId: 'a1', source: 'review', category: 'wrong_answer',
    message: 'B is right', selectedOption: 'B', status: 'open', adminNote: null,
    createdAt: '2026-09-15T10:00:00Z', resolvedAt: null, reporterEmail: 's@x.com',
    reporterIsInternal: false, ...over,
})

function renderPage() {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <QuestionReportsPage />
            </MemoryRouter>
        </QueryClientProvider>
    )
}

beforeEach(() => {
    get.mockReset()
    patch.mockReset()
    get.mockResolvedValue({
        data: {
            questions: [
                {
                    questionId: 'q1', stem: 'What is 2+2?', correctOption: 'C', topicCode: 'MM1.3',
                    questionStatus: 'published', placements: ['ESAT Math 2 — Diagnostic Set A (question 4)'],
                    reports: [report({}), report({ id: 'r2', source: 'exam', category: 'typo', message: null, selectedOption: null })],
                },
            ],
        },
    } as never)
    patch.mockResolvedValue({ data: report({ status: 'fixed' }) } as never)
})

describe('QuestionReportsPage', () => {
    it('groups reports under their question, with a way into the editor', async () => {
        renderPage()
        expect(await screen.findByText('2 reports')).toBeInTheDocument()
        expect(screen.getByText('ESAT Math 2 — Diagnostic Set A (question 4)')).toBeInTheDocument()
        expect(screen.getByText('The marked answer is wrong')).toBeInTheDocument()
        expect(screen.getByText(/picked B \(marked answer is C\)/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Edit question' })).toHaveAttribute('href', '/admin/questions/q1')
        expect(get.mock.calls[0][0]).toMatchObject({ url: '/admin/question-reports', query: { status: 'open' } })
    })

    it('marks every report on a question fixed, with the note', async () => {
        renderPage()
        await screen.findByText('2 reports')
        await userEvent.type(screen.getByPlaceholderText(/note/i), 'Corrected the key')
        await userEvent.click(screen.getByRole('button', { name: 'Mark all fixed' }))
        expect(patch).toHaveBeenCalledTimes(2)
        expect(patch.mock.calls[0][0]).toMatchObject({
            url: '/admin/question-reports/r1',
            body: { status: 'fixed', adminNote: 'Corrected the key' },
        })
    })

    it('switches to the fixed reports', async () => {
        renderPage()
        await screen.findByText('2 reports')
        await userEvent.click(within(screen.getByText('Fixed').closest('div')!).getByRole('button', { name: 'Fixed' }))
        expect(get.mock.calls[get.mock.calls.length - 1][0]).toMatchObject({ query: { status: 'fixed' } })
    })
})
