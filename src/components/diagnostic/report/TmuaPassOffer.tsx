import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { SeasonChoice } from '@/components/billing/SeasonChoice.tsx'
import useListPublishedSetsQuery from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'
import { trackEvent } from '@/lib/analytics.ts'
import type { SeasonOffer } from '@/lib/billingApi.ts'
import { isSinglePaper } from '@/lib/singlePapers.ts'

/**
 * The TMUA Season Pass, offered on a TMUA mini's report.
 *
 * In October 2026 no TMUA pass had sold. The pass is offered on a free full
 * paper's report, but TMUA students mostly start with the mini, and only 11 of
 * 40 ever sat a free full paper, so most never saw the offer. This puts it,
 * once and quietly, where they are: after their first TMUA score, with the
 * January sitting ahead. It names what the pass holds for each paper, because
 * "every paper" means little to someone who has seen five questions.
 *
 * Not on ESAT minis: ESAT students reach the free full paper far more often,
 * and its report already makes the offer.
 */
export function TmuaPassOffer({
    attemptId,
    seasons,
    onChoose,
}: {
    attemptId: string
    /** The TMUA seasons on sale that the student does not already hold. */
    seasons: SeasonOffer[]
    onChoose: (seasonKey: string) => void
}) {
    const { data: sets } = useListPublishedSetsQuery('tmua')
    const paid = (sets ?? []).filter(
        (s) =>
            !s.isFree &&
            (s as { format?: string }).format !== 'mini' &&
            !isSinglePaper(s)
    )
    const perPaper = (paper: string) => paid.filter((s) => s.subject === paper).length
    const p1 = perPaper('TMUA Paper 1')
    const p2 = perPaper('TMUA Paper 2')
    const season = seasons[0]?.key

    useEffect(() => {
        if (season) {
            trackEvent('paywall_shown', {
                attemptId,
                metadata: { source: 'mini_report', season },
            })
        }
    }, [attemptId, season])

    if (seasons.length === 0 || paid.length === 0) return null

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-xl font-medium">Preparing for the January TMUA?</h2>
            <Card className="border-[#4E77B4]/30 bg-[#F3F7FC]">
                <CardContent className="flex flex-col gap-3 pt-6">
                    <p className="text-sm text-slate-700">
                        Set A of each paper is free. The TMUA Season Pass opens{' '}
                        {paid.length} more full papers
                        {p1 > 0 && p2 > 0
                            ? `, ${p1} for Paper 1 and ${p2} for Paper 2,`
                            : ''}{' '}
                        each at the real paper&apos;s length and pace, with the
                        skill-by-skill report on every one.
                    </p>
                    <SeasonChoice
                        seasons={seasons}
                        compact
                        onChoose={(key) => {
                            trackEvent('unlock_clicked', {
                                attemptId,
                                metadata: { source: 'mini_report', season: key },
                            })
                            onChoose(key)
                        }}
                    />
                </CardContent>
            </Card>
        </section>
    )
}
