import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { GuideArticle } from '@/components/guides/GuideArticle.tsx'
import { GUIDE } from '@/content/tmuaJanuary.mjs'

/** The TMUA for students sitting in January 2027 (Imperial, LSE and others). */
export function TmuaJanuaryPage() {
    return (
        <LandingLayout>
            <GuideArticle guide={GUIDE} />
        </LandingLayout>
    )
}
