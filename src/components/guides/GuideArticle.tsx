import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Seo } from '@/components/Seo.tsx'
import type { Guide } from '@/content/guideTypes.ts'

const PERIWINKLE = '#799ED1'

/**
 * Renders a guide from its content module — the shared layout for every
 * search-facing guide page, so a new one is a data file plus a route.
 *
 * The same content modules are read by scripts/prerender.mjs at build time,
 * which is what makes these pages readable by crawlers; keeping the layout
 * here and the words there means the static copy cannot drift from the page.
 */
export function GuideArticle({ guide }: { guide: Guide }) {
    const navigate = useNavigate()

    return (
        <>
            <Seo
                title={guide.title}
                description={guide.description}
                path={guide.path}
            />
            <article className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-16 max-w-3xl">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    {guide.eyebrow}
                </p>
                <h1 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
                    {guide.h1}
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    {guide.standfirst}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-12">
                    <Button
                        className="cursor-pointer"
                        onClick={() => navigate(guide.ctaPath)}
                    >
                        {guide.ctaLabel}
                    </Button>
                </div>

                {guide.sections.map((section) => (
                    <section key={section.id} id={section.id} className="mb-10">
                        <h2 className="text-xl md:text-2xl font-bold mb-3">
                            {section.h2}
                        </h2>
                        {section.paras.map((para, i) => (
                            <p
                                key={i}
                                className="text-slate-600 leading-relaxed mb-3"
                            >
                                {para}
                            </p>
                        ))}
                        {section.table && (
                            <div className="overflow-x-auto mt-5">
                                <table className="w-full text-sm border border-slate-200 rounded-lg">
                                    <caption className="sr-only">
                                        {section.table.caption}
                                    </caption>
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {section.table.head.map((h, i) => (
                                                <th
                                                    key={i}
                                                    scope="col"
                                                    className="text-left font-semibold px-4 py-2 border-b border-slate-200"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {section.table.rows.map((row) => (
                                            <tr key={row[0]}>
                                                {row.map((cell, i) => (
                                                    <td
                                                        key={i}
                                                        className={`px-4 py-2 border-b border-slate-100 align-top ${
                                                            i === 0
                                                                ? 'font-medium'
                                                                : 'text-slate-600'
                                                        }`}
                                                    >
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                ))}

                <section className="mb-10">
                    <h2 className="text-xl md:text-2xl font-bold mb-4">
                        Common questions
                    </h2>
                    <dl>
                        {guide.faq.map((item) => (
                            <div key={item.q} className="mb-5">
                                <dt className="font-semibold text-slate-900 mb-1">
                                    {item.q}
                                </dt>
                                <dd className="text-slate-600 leading-relaxed">
                                    {item.a}
                                    {item.link && (
                                        <>
                                            {' '}
                                            <a
                                                href={item.link.url}
                                                className="underline underline-offset-2"
                                                style={{ color: PERIWINKLE }}
                                                rel="noopener"
                                            >
                                                {item.link.label}
                                            </a>
                                        </>
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <div
                    className="rounded-2xl p-8 mb-10"
                    style={{ backgroundColor: '#1a1f2e' }}
                >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                        Find out where you stand
                    </h2>
                    <p className="text-slate-400 leading-relaxed mb-6">
                        Set A of every paper is free to sit, written to the real
                        format. You get a skills report naming what to work on,
                        not just a score.
                    </p>
                    <Button
                        className="bg-white text-slate-900 hover:bg-slate-100 cursor-pointer font-medium"
                        onClick={() => navigate(guide.ctaPath)}
                    >
                        {guide.ctaLabel}
                    </Button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                    Test format, dates and requirements verified against{' '}
                    {guide.sources.map((s, i) => (
                        <span key={s.url}>
                            <a
                                href={s.url}
                                className="underline underline-offset-2"
                                style={{ color: PERIWINKLE }}
                                rel="noopener"
                            >
                                {s.label}
                            </a>
                            {i < guide.sources.length - 2
                                ? ', '
                                : i === guide.sources.length - 2
                                  ? ' and '
                                  : ''}
                        </span>
                    ))}
                    . Dates and course requirements change each admissions cycle
                    — always confirm on the official site before registering.{' '}
                    <Link to="/about" className="underline underline-offset-2">
                        About JomExam
                    </Link>
                    .
                </p>
            </article>
        </>
    )
}
