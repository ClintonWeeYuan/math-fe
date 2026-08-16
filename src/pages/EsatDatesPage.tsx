import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { GuideArticle } from '@/components/guides/GuideArticle.tsx'
import { GUIDE } from '@/content/esatDates.mjs'

/** ESAT dates, deadlines and registration — the canonical home for everything
 *  time-sensitive, so no other guide has to restate a date that moves. */
export function EsatDatesPage() {
    return (
        <LandingLayout>
            <GuideArticle guide={GUIDE} />
        </LandingLayout>
    )
}
