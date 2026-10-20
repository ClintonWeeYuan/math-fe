import { useQuery } from '@tanstack/react-query'
import { WeeklyPlanOptIn } from '@/components/diagnostic/WeeklyPlanOptIn.tsx'
import {
    SURVEY_ANSWERS_QUERY_KEY,
    fetchSurveyAnswers,
    sittingIsOver,
} from '@/lib/testSitting.ts'

/**
 * The weekly plan ask on My results, which is also where a student turns it
 * off. Not shown once the student's sitting is over: the email stops then
 * anyway.
 */
export function WeeklyPlanCard() {
    const { data, isLoading } = useQuery({
        queryKey: SURVEY_ANSWERS_QUERY_KEY,
        queryFn: fetchSurveyAnswers,
        staleTime: 5 * 60_000,
        retry: false,
    })
    if (isLoading || sittingIsOver(data?.testSitting)) return null
    return <WeeklyPlanOptIn source="my_results" />
}
