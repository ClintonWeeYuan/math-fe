import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiagnosticReportView } from './DiagnosticReportView'

/**
 * The headline score, and what it is out of.
 *
 * It reads out of the whole paper, not out of the questions the student
 * reached. Scoring 15 of the 15 you attempted on a 27-question paper is not
 * full marks, and a report that says "15/15 correct" tells a student they
 * aced a paper they left half-finished — the one number on the page they are
 * most likely to remember, and the one it would be worst to flatter.
 */

const BASE = {
    attempt: {
        id: '11111111-1111-1111-1111-111111111111',
        diagnosticSetId: '22222222-2222-2222-2222-222222222222',
        status: 'submitted',
        startedAt: '2026-08-16T10:00:00Z',
        serverDeadlineAt: '2026-08-16T11:15:00Z',
        submittedAt: '2026-08-16T11:12:00Z',
        agreedToTerms: true,
        totalScore: 15,
    },
    subject: 'ESAT Physics',
    answeredCount: 15,
    questionCount: 27,
    skillsRadar: [],
    flaggedNeverRevisited: [],
    perQuestionTime: [],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const report = (over: Record<string, unknown> = {}) => ({ ...BASE, ...over }) as any

describe('the headline score', () => {
    it('scores out of the whole paper, not out of what was attempted', () => {
        render(<DiagnosticReportView report={report()} />)
        expect(screen.getByText('15/27 correct')).toBeInTheDocument()
        // The old behaviour, which read as full marks on a half-finished paper.
        expect(screen.queryByText('15/15 correct')).not.toBeInTheDocument()
    })

    it('names the unanswered questions, so the score is explained', () => {
        render(<DiagnosticReportView report={report()} />)
        // Twelve questions, not twelve mistakes — the distinction the
        // denominator alone does not make.
        expect(
            screen.getByText('15 of 27 attempted · 12 left unanswered')
        ).toBeInTheDocument()
    })

    it('says so plainly when the whole paper was attempted', () => {
        render(
            <DiagnosticReportView
                report={report({
                    answeredCount: 27,
                    attempt: { ...BASE.attempt, totalScore: 20 },
                })}
            />
        )
        expect(screen.getByText('20/27 correct')).toBeInTheDocument()
        expect(screen.getByText('all 27 attempted')).toBeInTheDocument()
    })

    it('still scores out of the paper when nothing was answered', () => {
        render(
            <DiagnosticReportView
                report={report({
                    answeredCount: 0,
                    attempt: { ...BASE.attempt, totalScore: 0 },
                })}
            />
        )
        // Not "No questions answered": zero out of twenty-seven is the
        // student's actual result, and the sub-line explains why.
        expect(screen.getByText('0/27 correct')).toBeInTheDocument()
        expect(
            screen.getByText('0 of 27 attempted · 27 left unanswered')
        ).toBeInTheDocument()
    })

    it('takes the total from the report, not the separately-fetched prop', () => {
        // The two arrive in different requests. Preferring the report's own
        // figure is what stops the score rendering against one total and then
        // changing under the reader when the preview lands.
        render(<DiagnosticReportView report={report()} questionCount={99} />)
        expect(screen.getByText('15/27 correct')).toBeInTheDocument()
    })

    it('falls back to the prop for a report without the field', () => {
        // An older cached response, or an admin read against a backend not
        // yet carrying question_count.
        render(
            <DiagnosticReportView
                report={report({ questionCount: undefined })}
                questionCount={27}
            />
        )
        expect(screen.getByText('15/27 correct')).toBeInTheDocument()
    })

    it('invents no denominator when neither source has one', () => {
        render(<DiagnosticReportView report={report({ questionCount: undefined })} />)
        // Says what it knows rather than falling back to "/15", which would
        // be the flattering reading this change exists to remove.
        expect(screen.getByText('15 correct')).toBeInTheDocument()
        expect(screen.queryByText('15/15 correct')).not.toBeInTheDocument()
    })
})
