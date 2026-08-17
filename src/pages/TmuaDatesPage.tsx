import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { GuideArticle } from '@/components/guides/GuideArticle.tsx'
import { GUIDE } from '@/content/tmuaDates.mjs'

/** TMUA dates, deadlines and registration — the canonical home for everything
 *  time-sensitive about the TMUA. Separate from the ESAT page because the
 *  restricted days differ between the two tests. */
export function TmuaDatesPage() {
    return (
        <LandingLayout>
            <GuideArticle guide={GUIDE} />
        </LandingLayout>
    )
}
