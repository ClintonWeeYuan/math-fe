import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { GuideArticle } from '@/components/guides/GuideArticle.tsx'
import { GUIDE } from '@/content/esatImperialJanuary.mjs'

/** The ESAT for Imperial applicants sitting in January 2027. */
export function EsatImperialJanuaryPage() {
    return (
        <LandingLayout>
            <GuideArticle guide={GUIDE} />
        </LandingLayout>
    )
}
