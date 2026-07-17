import { useMemo } from 'react'
import useListDiagnosticQuestionsQuery from './useListDiagnosticQuestionsQuery.ts'

/**
 * The distinct topic codes already in use, for the question form's
 * topic-code combobox. Derived from the existing questions rather than a
 * separate endpoint or a hardcoded list: the codes in use *are* the list,
 * and it stays correct as content grows without anything to maintain.
 */
export default function useTopicCodeOptions(): string[] {
    const { data: questions } = useListDiagnosticQuestionsQuery()

    return useMemo(() => {
        const codes = (questions ?? [])
            .map((q) => q.topicCode)
            .filter((c): c is string => !!c)
        return [...new Set(codes)].sort()
    }, [questions])
}
