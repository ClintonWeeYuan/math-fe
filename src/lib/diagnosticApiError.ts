export type DiagnosticApiError = Error & { status?: number }

/**
 * Turns a hey-api client result into a thrown Error for a react-query
 * mutation. The generated client does NOT throw on HTTP errors — it resolves
 * with { data: undefined, error } — so a mutation that returns `.data`
 * blindly reports a failure as success (a 401 shows a success toast while
 * nothing changed; found live during the sets-admin work). Every diagnostic
 * mutation should `if (result.error !== undefined) throw toDiagnosticApiError(...)`.
 *
 * The message prefers the backend's own `detail` when it's a string —
 * FastAPI's HTTPException detail — so the actionable 409s from PR C (a
 * publish gate naming the still-draft questions, a delete blocked by the
 * sets holding the question) reach the user verbatim instead of a generic
 * "something failed".
 */
export function toDiagnosticApiError(
    result: { error?: unknown; response?: { status?: number } },
    fallback: string
): DiagnosticApiError {
    const detail = (result.error as { detail?: unknown } | undefined)?.detail
    const err = new Error(
        typeof detail === 'string' && detail.trim() !== '' ? detail : fallback
    ) as DiagnosticApiError
    err.status = result.response?.status
    return err
}
