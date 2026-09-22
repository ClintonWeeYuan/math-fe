import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PaperRating } from './PaperRating'

const mockTrack = vi.fn()
vi.mock('@/lib/analytics.ts', () => ({
    trackEvent: (...args: unknown[]) => mockTrack(...args),
}))

const show = (props: Partial<Parameters<typeof PaperRating>[0]> = {}) =>
    render(
        <PaperRating
            attemptId="attempt-1"
            subject="ESAT Physics"
            isMini={false}
            {...props}
        />
    )

describe('PaperRating', () => {
    beforeEach(() => {
        mockTrack.mockReset()
        localStorage.clear()
    })

    it('asks how the paper felt, then how it compared with past papers', () => {
        show()
        expect(screen.getByText('How did this paper feel?')).toBeInTheDocument()
        expect(screen.queryByText(/past papers/)).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Too easy' }))
        expect(mockTrack).toHaveBeenCalledWith('paper_rated', {
            attemptId: 'attempt-1',
            metadata: {
                question: 'feel',
                answer: 'too_easy',
                subject: 'ESAT Physics',
                format: 'full',
            },
        })
        expect(
            screen.getByText('Compared with real ESAT past papers, was it…')
        ).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Easier' }))
        expect(mockTrack).toHaveBeenLastCalledWith(
            'paper_rated',
            expect.objectContaining({
                metadata: expect.objectContaining({
                    question: 'vs_past_papers',
                    answer: 'easier',
                }),
            })
        )
        expect(screen.getByText(/Thank you!/)).toBeInTheDocument()
    })

    it('calls a mini test a mini test', () => {
        show({ isMini: true, subject: 'TMUA Paper 1' })
        expect(screen.getByText('How did this mini test feel?')).toBeInTheDocument()
    })

    it('remembers the answers when the report is reopened', () => {
        const { unmount } = show()
        fireEvent.click(screen.getByRole('button', { name: 'Too hard' }))
        fireEvent.click(screen.getByRole('button', { name: 'Harder' }))
        unmount()

        show()
        expect(screen.getByRole('button', { name: 'Too hard' })).toHaveAttribute(
            'aria-pressed',
            'true'
        )
        expect(screen.getByText(/Thank you!/)).toBeInTheDocument()
    })
})
