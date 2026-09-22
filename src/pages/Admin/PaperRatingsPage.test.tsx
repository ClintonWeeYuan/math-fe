import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PaperRatingsPage } from './PaperRatingsPage'
import { client } from '@/client/client.gen'

vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const get = vi.spyOn(client, 'get')

const paper = (over: object) => ({
    setId: 's1',
    title: 'ESAT Physics — Diagnostic Set A',
    subject: 'ESAT Physics',
    format: 'full',
    ratedAttempts: 9,
    feel: { tooEasy: 6, aboutRight: 3, tooHard: 0 },
    vsPastPapers: { easier: 5, similar: 2, harder: 0, notTried: 2 },
    ...over,
})

function renderPage() {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <PaperRatingsPage />
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('PaperRatingsPage', () => {
    beforeEach(() => {
        get.mockReset()
        get.mockResolvedValue({
            data: {
                papers: [
                    paper({}),
                    paper({
                        setId: 's2',
                        title: 'TMUA Paper 1 — Mini Test',
                        subject: 'TMUA Paper 1',
                        format: 'mini',
                        ratedAttempts: 2,
                        feel: { tooEasy: 0, aboutRight: 1, tooHard: 1 },
                        vsPastPapers: { easier: 0, similar: 0, harder: 0, notTried: 0 },
                    }),
                ],
                totalRatedAttempts: 11,
            },
            request: new Request('http://x'),
            response: new Response(),
        } as never)
    })

    it('shows each paper with both splits', async () => {
        renderPage()
        expect(await screen.findByText('ESAT Physics — Diagnostic Set A')).toBeInTheDocument()
        expect(screen.getByText('Too easy 6 · About right 3')).toBeInTheDocument()
        expect(
            screen.getByText("Easier 5 · About the same 2 · Haven't tried any 2")
        ).toBeInTheDocument()
        expect(screen.getByText('11 rated sittings in all')).toBeInTheDocument()
    })

    it('marks papers with too few ratings to judge', async () => {
        renderPage()
        expect(await screen.findByText('2 ratings · too few to judge yet')).toBeInTheDocument()
        expect(screen.getByText('No answers yet')).toBeInTheDocument()
    })

    it('filters by test', async () => {
        renderPage()
        await screen.findByText('ESAT Physics — Diagnostic Set A')
        await userEvent.click(screen.getByRole('button', { name: 'TMUA' }))
        expect(screen.queryByText('ESAT Physics — Diagnostic Set A')).not.toBeInTheDocument()
        expect(screen.getByText('TMUA Paper 1 — Mini Test')).toBeInTheDocument()
    })
})
