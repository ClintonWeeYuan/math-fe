import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiagnosticReportView } from './DiagnosticReportView'

/**
 * A mini test's report shows no Skills Radar — and, more importantly, must not
 * show the Season Pass paywall in its place.
 *
 * The paywall says "pay and you get this". On a mini that is false however
 * much a student pays: ten questions rest most axes on one or two items. So
 * the empty radar has to be distinguishable from a withheld one, and these
 * tests are mostly about the mini NOT looking like a sales pitch.
 */

const BASE = {
    attempt: {
        id: '11111111-1111-1111-1111-111111111111',
        diagnosticSetId: '22222222-2222-2222-2222-222222222222',
        status: 'submitted',
        startedAt: '2026-08-16T10:00:00Z',
        serverDeadlineAt: '2026-08-16T10:15:00Z',
        submittedAt: '2026-08-16T10:12:00Z',
        agreedToTerms: true,
        totalScore: 7,
    },
    subject: 'ESAT Physics',
    answeredCount: 10,
    flaggedNeverRevisited: [],
    perQuestionTime: [
        {
            questionId: '33333333-3333-3333-3333-333333333333',
            questionOrderIndex: 0,
            totalTimeSeconds: 95,
            viewCount: 1,
        },
    ],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const report = (over: Record<string, unknown>) => ({ ...BASE, ...over }) as any

describe('a mini test report', () => {
    it('does not offer to sell a radar it can never produce', () => {
        // The free-student case, which is the one that would take money for
        // something undeliverable.
        render(
            <DiagnosticReportView
                report={report({
                    format: 'mini',
                    skillsRadar: [],
                    hasPass: false,
                    upsell: null,
                })}
                onUnlock={() => {}}
            />
        )

        expect(
            screen.queryByText(/unlock your skill-by-skill/i)
        ).not.toBeInTheDocument()
        expect(screen.getByText(/needs a full paper/i)).toBeInTheDocument()
    })

    it('says a longer paper is what is needed, not a payment', () => {
        render(
            <DiagnosticReportView
                report={report({
                    format: 'mini',
                    skillsRadar: [],
                    hasPass: false,
                })}
            />
        )

        expect(
            screen.getByText(/27 questions resolve every axis/i)
        ).toBeInTheDocument()
    })

    it('shows the same panel to a pass holder — this is not about entitlement', () => {
        render(
            <DiagnosticReportView
                report={report({
                    format: 'mini',
                    skillsRadar: [],
                    hasPass: true,
                })}
            />
        )

        expect(screen.getByText(/needs a full paper/i)).toBeInTheDocument()
    })

    it('keeps everything ten questions can actually measure', () => {
        render(
            <DiagnosticReportView
                report={report({
                    format: 'mini',
                    skillsRadar: [],
                    hasPass: false,
                })}
                questionCount={10}
            />
        )

        expect(screen.getByText('7/10 correct')).toBeInTheDocument()
    })

    it('draws no verdict from an empty radar', () => {
        // "Where you stand" and "Your next steps" are both radar-derived. On a
        // mini the radar is empty for everyone, so rendering them would state
        // "no standout strengths" on the basis of nothing at all.
        render(
            <DiagnosticReportView
                report={report({
                    format: 'mini',
                    skillsRadar: [],
                    hasPass: true,
                })}
            />
        )

        expect(screen.queryByText(/where you stand/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/your next steps/i)).not.toBeInTheDocument()
    })
})

describe('a full paper report is unchanged', () => {
    it('still paywalls a free student', () => {
        render(
            <DiagnosticReportView
                report={report({
                    format: 'full',
                    skillsRadar: [],
                    hasPass: false,
                })}
                onUnlock={() => {}}
            />
        )

        expect(
            screen.getByText(/unlock your skill-by-skill/i)
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/needs a full paper/i)
        ).not.toBeInTheDocument()
    })

    it('treats a response with no format at all as a full paper', () => {
        // Pre-mini responses, and the admin view, carry no format. Reading
        // that as 'mini' would silently strip the radar from every one.
        render(
            <DiagnosticReportView
                report={report({ skillsRadar: [], hasPass: false })}
                onUnlock={() => {}}
            />
        )

        expect(
            screen.getByText(/unlock your skill-by-skill/i)
        ).toBeInTheDocument()
    })
})
