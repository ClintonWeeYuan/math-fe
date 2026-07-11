/**
 * There's no global fetch/axios interceptor anywhere in this codebase that
 * attaches the auth token automatically (confirmed by checking how existing
 * authenticated calls do it, e.g. useGetCurrentUserQuery,
 * useUpdateQuestionStatusMutation — each reads localStorage.getItem('token')
 * and passes it as a header manually, per call). Every diagnostic_ hook is
 * gated by require_admin on the backend, so every one of them needs this —
 * the one place that reads it, rather than six copies of the same line.
 */
export function getAuthHeaders(): { Authorization: string } {
    const token = localStorage.getItem('token') ?? ''
    return { Authorization: `Bearer ${token}` }
}
