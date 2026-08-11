import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { GuideArticle } from '@/components/guides/GuideArticle.tsx'
import { GUIDE } from '@/content/esatMaths1.mjs'

/** The ESAT maths 1 guide. Words live in the content module; layout is
 *  shared with every other guide via GuideArticle. */
export function EsatMaths1Page() {
    return (
        <LandingLayout>
            <GuideArticle guide={GUIDE} />
        </LandingLayout>
    )
}
