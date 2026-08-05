import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TopicsTable } from './TopicsTable'

function topic(id: string, name: string, sortOrder: number) {
    return { id, name, sortOrder, level: { id: 'l4', name: 'Form 4' } }
}

function renderTable(topics: unknown[]) {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    render(
        <QueryClientProvider client={client}>
            <MemoryRouter>
                <TopicsTable
                    isLoading={false}
                    topics={topics as never}
                    subjectId="s1"
                    levels={[]}
                />
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('TopicsTable', () => {
    it('states how many topics there are', () => {
        // The box scrolls after about four rows with nothing to say so, and
        // seven imported chapters read as four missing ones.
        renderTable(
            Array.from({ length: 7 }, (_, i) => topic(`t${i}`, `C0${i + 1}`, i + 1))
        )

        expect(screen.getByText('7 topics for this subject')).toBeInTheDocument()
    })

    it('renders every topic, however many there are', () => {
        renderTable(
            Array.from({ length: 7 }, (_, i) => topic(`t${i}`, `Chapter ${i + 1}`, i + 1))
        )

        for (let i = 1; i <= 7; i++) {
            expect(screen.getByText(`Chapter ${i}`)).toBeInTheDocument()
        }
    })

    it('says so when there are none', () => {
        renderTable([])
        expect(screen.getByText('No topics yet.')).toBeInTheDocument()
    })
})
