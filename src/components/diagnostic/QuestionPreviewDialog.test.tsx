import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionPreviewDialog } from './QuestionPreviewDialog'
import type { DiagnosticQuestionResponse } from '@/client'

vi.mock('@/components/diagnostic/LatexText.tsx', () => ({
    LatexText: ({ text }: { text: string }) => <span>{text}</span>,
}))

function q(over: Partial<DiagnosticQuestionResponse>): DiagnosticQuestionResponse {
    return {
        id: 'id',
        topicCode: 'P6.3',
        coreSkillPrimary: 'S1',
        stem: 'a stem',
        options: [
            { label: 'A', text: 'first option', isCorrect: true, misconception: 'the trap' },
            { label: 'B', text: 'second option', isCorrect: false },
        ],
        correctOption: 'A',
        status: 'draft',
        createdAt: '2026-07-13T00:00:00Z',
        ...over,
    }
}

describe('QuestionPreviewDialog', () => {
    it('shows the stem and options but NOT the answer key or misconception', () => {
        render(
            <QuestionPreviewDialog questions={[q({})]} open onOpenChange={vi.fn()} />
        )
        expect(screen.getByText('a stem')).toBeInTheDocument()
        expect(screen.getByText('first option')).toBeInTheDocument()
        expect(screen.getByText('second option')).toBeInTheDocument()
        // The student view must not leak which option is correct, nor the
        // misconception note.
        expect(screen.queryByText(/correct/i)).not.toBeInTheDocument()
        expect(screen.queryByText('the trap')).not.toBeInTheDocument()
    })

    it('steps through multiple questions with Previous/Next', () => {
        const questions = [
            q({ id: 'a', stem: 'question one' }),
            q({ id: 'b', stem: 'question two' }),
        ]
        render(<QuestionPreviewDialog questions={questions} open onOpenChange={vi.fn()} />)

        expect(screen.getByText('1 of 2')).toBeInTheDocument()
        expect(screen.getByText('question one')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /next/i }))
        expect(screen.getByText('2 of 2')).toBeInTheDocument()
        expect(screen.getByText('question two')).toBeInTheDocument()
        // Next is disabled at the end.
        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
    })

    it('shows no navigation for a single question', () => {
        render(<QuestionPreviewDialog questions={[q({})]} open onOpenChange={vi.fn()} />)
        expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
        expect(screen.queryByText(/of 1/)).not.toBeInTheDocument()
    })
})
