import { useQuery } from '@tanstack/react-query'
import { previewDiagnosticSetDiagnosticSetsSetIdPreviewGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    setId: string
    enabled?: boolean
}

/**
 * The landing/instructions screen (§2), before an attempt exists — title,
 * description, time limit, question count only. A draft or nonexistent set
 * 404s identically here (the backend never confirms a draft set's
 * existence to a non-admin), so the caller treats a failed query as
 * "not available."
 */
export default function useGetSetPreviewQuery({ setId, enabled = true }: Props) {
    return useQuery({
        queryKey: ['diagnostic-set-preview', setId],
        queryFn: async () =>
            (
                await previewDiagnosticSetDiagnosticSetsSetIdPreviewGet({
                    path: { set_id: setId },
                    headers: getAuthHeaders(),
                })
            ).data,
        enabled: enabled && setId !== '',
    })
}
