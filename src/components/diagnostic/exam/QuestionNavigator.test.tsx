import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionNavigator } from './QuestionNavigator'
import type {
    DiagnosticResponseState,
    StudentDiagnosticQuestionResponse,
} from '@/client'

function q(id: string): StudentDiagnosticQuestionResponse {
    return { id, stem: `stem ${id}`, options: [{ label: 'A', text: 'x' }] }
}

function resp(
    questionId: string,
    over: Partial<DiagnosticResponseState> = {}
): DiagnosticResponseState {
    return {
        questionId,
        questionOrderIndex: 0,
        selectedOption: null,
        isFlagged: false,
        viewCount: 0,
        ...over,
    }
}

const QUESTIONS = [q('qa'), q('qb'), q('qc')]

describe('QuestionNavigator', () => {
    it('colours each cell straight from the responses array (answered vs unanswered), no fetch', () => {
        render(
            <QuestionNavigator
                questions={QUESTIONS}
                responses={[resp('qa', { selectedOption: 'A' })]}
                currentIndex={0}
                onJump={() => {}}
            />
        )
        // qa answered, qb/qc not — reflected in aria-labels derived purely
        // from the shared responses.
        expect(
            screen.getByRole('button', { name: /Question 1, answered/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Question 2, unanswered/i })
        ).toBeInTheDocument()
    })

    it('marks a flagged question as flagged even when unanswered', () => {
        render(
            <QuestionNavigator
                questions={QUESTIONS}
                responses={[resp('qc', { isFlagged: true })]}
                currentIndex={0}
                onJump={() => {}}
            />
        )
        expect(
            screen.getByRole('button', { name: /Question 3, unanswered, flagged/i })
        ).toBeInTheDocument()
    })

    it('re-colours synchronously when the responses prop changes (no refetch)', () => {
        const { rerender } = render(
            <QuestionNavigator
                questions={QUESTIONS}
                responses={[]}
                currentIndex={0}
                onJump={() => {}}
            />
        )
        expect(
            screen.getByRole('button', { name: /Question 1, unanswered/i })
        ).toBeInTheDocument()

        // Simulate the optimistic cache patch flowing back in as a new prop.
        rerender(
            <QuestionNavigator
                questions={QUESTIONS}
                responses={[resp('qa', { selectedOption: 'A' })]}
                currentIndex={0}
                onJump={() => {}}
            />
        )
        expect(
            screen.getByRole('button', { name: /Question 1, answered/i })
        ).toBeInTheDocument()
    })

    it('jumps directly to any question on click (free navigation)', () => {
        const onJump = vi.fn()
        render(
            <QuestionNavigator
                questions={QUESTIONS}
                responses={[]}
                currentIndex={0}
                onJump={onJump}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: /Question 3/i }))
        expect(onJump).toHaveBeenCalledWith(2)
    })
})
