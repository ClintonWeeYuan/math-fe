import { WeeklyPlanOptIn } from '@/components/diagnostic/WeeklyPlanOptIn.tsx'

/**
 * The weekly plan ask on My results, which is also where a student turns it
 * off. Whether to show it at all is the backend's call (`available`): the
 * email is switched on and the student is sitting in January.
 */
export function WeeklyPlanCard() {
    return <WeeklyPlanOptIn source="my_results" />
}
