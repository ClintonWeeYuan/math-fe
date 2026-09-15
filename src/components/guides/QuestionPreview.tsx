import { Link } from 'react-router-dom'
import type { QuestionPreview as Preview } from '@/content/guideTypes.ts'

/**
 * One question to try, with the worked solution a link away.
 *
 * Deliberately not interactive and deliberately without the working: the
 * subject guide already carries this question worked through, with the trap
 * behind every wrong option, and repeating that here is what made the landing
 * page and the guide compete for the same searches.
 */
export function QuestionPreview({ preview }: { preview: Preview }) {
    return (
        <article className="mb-6 rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                {preview.module}
            </p>
            <p className="font-medium text-slate-900 leading-relaxed mb-4">
                {preview.question}
            </p>
            <ul className="mb-4 flex flex-col gap-2">
                {preview.options.map((option) => (
                    <li
                        key={option.letter}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700"
                    >
                        <span className="font-semibold mr-2">{option.letter}</span>
                        {option.text}
                    </li>
                ))}
            </ul>
            <Link
                to={preview.solutionPath}
                className="font-semibold underline underline-offset-4"
                style={{ color: '#799ED1' }}
            >
                See it worked through, with the trap behind each wrong answer →
            </Link>
        </article>
    )
}
