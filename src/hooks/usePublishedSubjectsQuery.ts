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
            // The generated client resolves { data: undefined, error } instead
            // of throwing, so `result.data ?? []` would render an empty
            // catalogue for a failed request — a page saying "no subjects"
            // when the truth is "couldn't ask". Throwing puts the query in
            // isError, which the page reports honestly.
            if (result.error !== undefined || result.data === undefined) {
                throw new Error('Could not load subjects.')
            }
            return result.data
        },
    })
}
