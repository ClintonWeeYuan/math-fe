import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { GuideArticle } from '@/components/guides/GuideArticle.tsx'
import { GUIDE } from '@/content/esatPastPapers.mjs'

/** The ESAT past-papers guide. Words live in the content module; layout is
 *  shared with every other guide via GuideArticle. */
export function EsatPastPapersPage() {
    return (
        <LandingLayout>
            <GuideArticle guide={GUIDE} />
        </LandingLayout>
    )
}
