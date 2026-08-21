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

/** A step line as authored: "3. Factorise: $x^2-1=(x-1)(x+1)$." */
const STEP = /^\d+\.\s+/

/**
 * A worked solution split into its steps.
 *
 * Authors write one operation per numbered line and finish with an
 * unnumbered "Answer: X". Rendering that as one paragraph runs the steps
 * together, which is the opposite of what a worked solution is for — the
 * point is that each line is a separate thing you can follow or lose.
 *
 * The manual "N. " prefix is stripped and the list numbers the items itself.
 * Otherwise a step inserted in the middle means renumbering every line after
 * it by hand, and the first time someone forgets, the solution has two step
 * fours.
 *
 * Anything that is not a numbered step — in practice the Answer line — is set
 * off beneath the list rather than smuggled in as a final step, because it is
 * not one: it is what the steps arrived at.
 */
export function SolutionSteps({ text }: { text: string }) {
    const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

    // A solution with no line breaks is a legacy plain one. Render it exactly
    // as before rather than making a one-item list of it.
    if (lines.length <= 1) {
        return <LatexText text={text} />
    }

    const steps = lines.filter((line) => STEP.test(line))
    const rest = lines.filter((line) => !STEP.test(line))

    // Every line is unnumbered prose — not the step format at all. Treat it as
    // a plain solution that happens to have paragraphs.
    if (steps.length === 0) {
        return (
            <>
                {rest.map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : undefined}>
                        <LatexText text={line} />
                    </p>
                ))}
            </>
        )
    }

    return (
        <>
            <ol className="list-decimal space-y-2 pl-5">
                {steps.map((line, i) => (
                    <li key={i}>
                        <LatexText text={line.replace(STEP, '')} />
                    </li>
                ))}
            </ol>
            {rest.map((line, i) => (
                <p
                    key={i}
                    className="mt-3 border-t border-slate-200 pt-3 font-medium text-slate-900"
                >
                    <LatexText text={line} />
                </p>
            ))}
        </>
    )
}

/**
 * A solution diagram as an <img> source.
 *
 * Rendered through an image rather than injected as markup, which is the same
 * shape the question diagrams already take — those live in the storage bucket
 * and arrive as a URL, so every diagram on the site ends up inside an <img>.
 * It matters beyond consistency: a browser will not run script inside an SVG
 * loaded via <img>, so this needs no sanitiser, and there is no sanitiser in
 * this codebase to reuse. The one place that does inject SVG as markup is the
 * admin form previewing what the admin has just pasted themselves.
 *
 * encodeURIComponent rather than base64: it survives the '#' characters that
 * appear in every fill colour, which a raw data URI would truncate at.
 */
function svgDataUri(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function SolutionBlock({
    questionId,
    solutionText,
    solutionVideoUrl,
    solutionDiagramSvg,
}: {
    questionId: string
    solutionText?: string | null
    solutionVideoUrl?: string | null
    solutionDiagramSvg?: string | null
}) {
    const [shown, setShown] = useState(false)
    const hasVideo = Boolean(solutionVideoUrl)
    const hasText = Boolean(solutionText)
    const hasDiagram = Boolean(solutionDiagramSvg)

    function reveal() {
        setShown(true)
        // Which format they actually looked at, so the value of making videos
        // can be compared against the cost of making them.
        // No solution_video_played alongside this, by decision: it needs the
        // YouTube iframe API and a listener per player, and "did they open the
        // solution, and was it a video" answers the question that prompted it.
        trackEvent('solution_viewed', {
            questionId,
            metadata: {
                format: hasVideo ? (hasText ? 'video+text' : 'video') : 'text',
            },
        })
    }

    if (!hasVideo && !hasText && !hasDiagram) {
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

            {hasDiagram && (
                <img
                    src={svgDataUri(solutionDiagramSvg as string)}
                    alt=""
                    className="mb-3 max-w-full rounded-md border border-slate-200 bg-white"
                />
            )}

            {hasText && (
                <div className="text-sm leading-relaxed text-slate-700">
                    <SolutionSteps text={solutionText as string} />
                </div>
            )}
        </div>
    )
}
