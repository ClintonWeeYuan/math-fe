import { Navigate, useParams } from 'react-router-dom'
import useGetSubjectQuery from '@/hooks/useGetSubjectQuery.ts'

/**
 * /questions/{uuid} -> /spm/{slug}.
 *
 * These URLs have been shared and may be indexed, so they keep working. The
 * redirect is `replace` so the uuid doesn't sit in history behind the readable
 * URL, and a subject with no slug falls through to /subjects rather than
 * looping.
 */
export function LegacySubjectRedirect() {
    const { subjectId } = useParams()
    const { data: subject, isLoading, isError } = useGetSubjectQuery({
        subjectId: subjectId ?? '',
    })

    if (isLoading) return null
    if (isError || !subject?.slug) return <Navigate to="/subjects" replace />
    return <Navigate to={`/spm/${subject.slug}`} replace />
}
