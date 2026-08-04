import { useQuery } from '@tanstack/react-query'
import { listPublishedSubjectsSubjectsGet } from '@/client'

/**
 * The subjects students are offered.
 *
 * Previously a hard-coded array of two uuids in SubjectsPage, which is why a
 * subject created afterwards was unreachable — nothing linked to it. Reading
 * it from the API means publishing a subject is what puts it on the site.
 */
export default function usePublishedSubjectsQuery() {
    return useQuery({
        queryKey: ['published-subjects'],
        queryFn: async () => {
            const result = await listPublishedSubjectsSubjectsGet()
            return result.data ?? []
        },
    })
}
