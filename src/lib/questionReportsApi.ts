import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * "Report a problem" with a question, and the admin inbox for those reports.
 *
 * Hand-written against the generic client for the same reason billingApi.ts
 * is: regenerating the SDK rewrites all of it. The endpoints are in the
 * committed openapi.json.
 */

export type ReportCategory =
    | 'typo'
    | 'question_error'
    | 'wrong_answer'
    | 'solution_error'
    | 'diagram'
    | 'other'

export type ReportStatus = 'open' | 'fixed' | 'dismissed'

/** In the order a student sees them. `afterSubmit` ones need the answer to
 *  judge, so they are not offered mid-exam — the backend refuses them too. */
export const REPORT_CATEGORIES: {
    value: ReportCategory
    label: string
    afterSubmit?: boolean
}[] = [
    { value: 'typo', label: 'Typo or unclear wording' },
    { value: 'question_error', label: 'Mistake in the question' },
    { value: 'wrong_answer', label: 'The marked answer is wrong', afterSubmit: true },
    { value: 'solution_error', label: 'Mistake in the worked solution', afterSubmit: true },
    { value: 'diagram', label: 'Diagram missing or wrong' },
    { value: 'other', label: 'Something else' },
]

export function categoryLabel(value: string): string {
    return REPORT_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

export async function submitQuestionReport(input: {
    attemptId: string
    questionId: string
    category: ReportCategory
    message?: string
}): Promise<string> {
    const result = await client.post({
        url: `/diagnostic/attempts/${input.attemptId}/questions/${input.questionId}/report`,
        body: { category: input.category, message: input.message || null },
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not send your report. Please try again.')
    }
    return (result.data as { message: string }).message
}

export type AdminQuestionReport = {
    id: string
    questionId: string
    attemptId: string | null
    source: 'exam' | 'review'
    category: ReportCategory
    message: string | null
    selectedOption: string | null
    status: ReportStatus
    adminNote: string | null
    createdAt: string
    resolvedAt: string | null
    reporterEmail: string | null
    reporterIsInternal: boolean
}

export type ReportedQuestion = {
    questionId: string
    stem: string | null
    correctOption: string | null
    topicCode: string | null
    questionStatus: string | null
    placements: string[]
    reports: AdminQuestionReport[]
}

export async function fetchQuestionReports(
    status: ReportStatus
): Promise<ReportedQuestion[]> {
    const result = await client.get({
        url: '/admin/question-reports',
        query: { status },
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not load question reports.')
    }
    return (result.data as { questions: ReportedQuestion[] }).questions
}

export async function updateQuestionReport(input: {
    id: string
    status: ReportStatus
    adminNote?: string
}): Promise<AdminQuestionReport> {
    const result = await client.patch({
        url: `/admin/question-reports/${input.id}`,
        body: { status: input.status, adminNote: input.adminNote || null },
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not update the report.')
    }
    return result.data as AdminQuestionReport
}
