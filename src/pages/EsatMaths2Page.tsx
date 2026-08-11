import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { GuideArticle } from '@/components/guides/GuideArticle.tsx'
import { GUIDE } from '@/content/esatMaths2.mjs'

/** The ESAT maths 2 guide. Words live in the content module; layout is
 *  shared with every other guide via GuideArticle. */
export function EsatMaths2Page() {
    return (
        <LandingLayout>
            <GuideArticle guide={GUIDE} />
        </LandingLayout>
    )
}
