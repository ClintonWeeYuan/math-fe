import { useState } from 'react'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import { trackEvent } from '@/lib/analytics.ts'

/**
 * The worked solution, behind a disclosure.
 *
 * Behind one because seeing the answer is not always what a student wants
 * first — the misconception note above it often settles the question, and a
 * solution that unfurls automatically removes the chance to think again.
 *
 * Four states, and the fourth is the one that matters: review mode ships now
 * and the solutions arrive over months, so a question with neither a video nor
 * text has to say so plainly rather than render an empty panel that looks
 * broken.
 */

/**
 * A YouTube watch/share URL turned into an embed URL.
 *
 * Accepts what an author will actually paste — a watch link, a youtu.be
 * share link, or an embed link already — rather than demanding one form and
 * silently rendering a broken iframe when they use another. Anything
 * unrecognised is returned as-is and rendered in the iframe regardless: the
 * URL came from an admin, not from a student.
 */
export function toEmbedUrl(url: string): string {
    try {
        const parsed = new URL(url)
        if (parsed.hostname === 'youtu.be') {
            return `https://www.youtube.com/embed${parsed.pathname}`
        }
        if (parsed.hostname.endsWith('youtube.com')) {
            if (parsed.pathname === '/watch') {
                const id = parsed.searchParams.get('v')
                if (id) return `https://www.youtube.com/embed/${id}`
            }
            return url
        }
        return url
    } catch {
        return url
    }
}

export function SolutionBlock({
    questionId,
    solutionText,
    solutionVideoUrl,
}: {
    questionId: string
    solutionText?: string | null
    solutionVideoUrl?: string | null
}) {
    const [shown, setShown] = useState(false)
    const hasVideo = Boolean(solutionVideoUrl)
    const hasText = Boolean(solutionText)

    function reveal() {
        setShown(true)
        // Which format they actually looked at, so the value of making videos
        // can be compared against the cost of making them.
        trackEvent('solution_viewed', {
            questionId,
            metadata: {
                format: hasVideo ? (hasText ? 'video+text' : 'video') : 'text',
            },
        })
    }

    if (!hasVideo && !hasText) {
        return (
            <p className="mt-3 text-sm text-slate-400">
                Worked solution coming soon.
            </p>
        )
    }

    if (!shown) {
        return (
            <button
                type="button"
                onClick={reveal}
                className="mt-3 text-sm font-medium underline underline-offset-4"
            >
                Show full solution
            </button>
        )
    }

    return (
        <div
            // Deterrence, not DRM — the agreement students make before sitting
            // a paper is what actually protects this. Making the solution
            // awkward to sweep into a clipboard is worth the two lines; making
            // it impossible is not achievable in a browser and pretending
            // otherwise would be theatre.
            className="mt-3 select-none rounded-lg border border-slate-200 bg-slate-50 p-4"
            onCopy={(event) => event.preventDefault()}
            onContextMenu={(event) => event.preventDefault()}
        >
            {hasVideo && (
                <div className="mb-3 aspect-video w-full overflow-hidden rounded-md">
                    {/* Only mounted once the disclosure is open, so a report
                        with twenty-seven questions does not fetch twenty-seven
                        players on load. */}
                    <iframe
                        src={toEmbedUrl(solutionVideoUrl as string)}
                        title="Worked solution"
                        loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full border-0"
                    />
                </div>
            )}

            {hasText && (
                <div className="text-sm leading-relaxed text-slate-700">
                    <LatexText text={solutionText as string} />
                </div>
            )}
        </div>
    )
}
