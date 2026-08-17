import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { GuideArticle } from '@/components/guides/GuideArticle.tsx'
import type { Guide } from '@/content/guideTypes.ts'

/** A subject practice-test landing page. Same rendering as a guide — the
 *  content shape is identical — but these are product surfaces rather than
 *  guides, so they are registered separately and stay off the /guides index. */
export function EsatPracticeTestLandingPage({ page }: { page: Guide }) {
    return (
        <LandingLayout>
            <GuideArticle guide={page} />
        </LandingLayout>
    )
}
