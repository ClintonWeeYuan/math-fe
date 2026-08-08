import { useQuery } from '@tanstack/react-query'
import { getSubjectBySlugSubjectsBySlugSlugGet } from '@/client'

/**
 * Resolve a subject from its public URL segment: /spm/{slug}.
 *
 * One request rather than fetching the whole catalogue to look one up, and it
 * distinguishes "no such subject" from "couldn't ask" — the page renders a
 * real not-found for the first and an error for the second.
 */
export default function useGetSubjectBySlugQuery({ slug }: { slug: string }) {
    return useQuery({
        queryKey: ['subject-by-slug', slug],
        enabled: slug.length > 0,
        retry: false,
        queryFn: async () => {
            const result = await getSubjectBySlugSubjectsBySlugSlugGet({
                path: { slug },
            })
            if (result.error !== undefined || result.data === undefined) {
                // The generated client resolves { data: undefined, error }
                // rather than throwing, so returning `.data` would render an
                // empty bank for a subject that simply doesn't exist.
                throw new Error('not-found')
            }
            return result.data
        },
    })
}
