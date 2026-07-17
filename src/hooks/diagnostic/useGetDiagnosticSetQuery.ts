import { useQuery } from '@tanstack/react-query'
import { getDiagnosticSetDiagnosticSetsSetIdGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    setId: string
    enabled?: boolean
}

/**
 * One admin diagnostic set with its full metadata + ordered question_ids —
 * for the membership-editing screen. Admin-only, distinct from the
 * student-facing preview (which serves only a published set's summary).
 */
export default function useGetDiagnosticSetQuery({ setId, enabled = true }: Props) {
    return useQuery({
        queryKey: ['diagnostic-set', setId],
        queryFn: async () =>
            (
                await getDiagnosticSetDiagnosticSetsSetIdGet({
                    path: { set_id: setId },
                    headers: getAuthHeaders(),
                })
            ).data,
        enabled: enabled && setId !== '',
    })
}
