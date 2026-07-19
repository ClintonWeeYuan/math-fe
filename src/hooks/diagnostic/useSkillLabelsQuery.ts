import { useQuery } from '@tanstack/react-query'
import { getSkillLabelsDiagnosticSkillLabelsGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * The label dictionary for one subject — the per-(subject, skill) names an
 * admin edits on the Skills screen. Admin-only. Disabled when no subject is
 * selected yet; an unlabelled subject just comes back with an empty list.
 */
export default function useSkillLabelsQuery(subject: string | null) {
    return useQuery({
        queryKey: ['diagnostic-skill-labels', subject],
        enabled: !!subject,
        queryFn: async () =>
            (
                await getSkillLabelsDiagnosticSkillLabelsGet({
                    query: { subject: subject as string },
                    headers: getAuthHeaders(),
                })
            ).data,
    })
}
