import { Link, useNavigate } from 'react-router-dom'
import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Seo } from '@/components/Seo.tsx'
import { GUIDE } from '@/content/esatPracticeGuide.mjs'

const PERIWINKLE = '#799ED1'

/**
 * The ESAT practice-tests guide — the first content page written to be found
 * in search rather than navigated to. Its copy lives in
 * content/esatPracticeGuide.mjs so the build-time prerenderer renders exactly
 * what a reader sees; a static copy that drifted from the page would be worse
 * than none.
 */
export function EsatPracticeGuidePage() {
    const navigate = useNavigate()

    return (
        <LandingLayout>
            <Seo
                title={GUIDE.title}
                description={GUIDE.description}
                path={GUIDE.path}
            />
            <article className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-16 max-w-3xl">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    ESAT guide
                </p>
                <h1 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
                    {GUIDE.h1}
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    {GUIDE.standfirst}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-12">
                    <Button
                        className="cursor-pointer"
                        onClick={() => navigate('/diagnostics/esat')}
                    >
                        Sit a free ESAT diagnostic →
                    </Button>
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => navigate('/diagnostics/tmua')}
                    >
                        TMUA diagnostics
                    </Button>
                </div>

                {GUIDE.sections.map((section) => (
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
                                            {section.table.head.map((h) => (
                                                <th
                                                    key={h}
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
                                                <td className="px-4 py-2 border-b border-slate-100 align-top">
                                                    {row[0]}
                                                </td>
                                                <td className="px-4 py-2 border-b border-slate-100 align-top text-slate-600">
                                                    {row[1]}
                                                </td>
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
                        {GUIDE.faq.map((item) => (
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
                        Set A of every ESAT module is free to sit — 27
                        questions, 40 minutes, no calculator, exactly like the
                        real thing. You get a skills report naming what to work
                        on, not just a score.
                    </p>
                    <Button
                        className="bg-white text-slate-900 hover:bg-slate-100 cursor-pointer font-medium"
                        onClick={() => navigate('/diagnostics/esat')}
                    >
                        Start a free diagnostic →
                    </Button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                    Test format, dates and course requirements verified against{' '}
                    {GUIDE.sources.map((s, i) => (
                        <span key={s.url}>
                            <a
                                href={s.url}
                                className="underline underline-offset-2"
                                style={{ color: PERIWINKLE }}
                                rel="noopener"
                            >
                                {s.label}
                            </a>
                            {i < GUIDE.sources.length - 2
                                ? ', '
                                : i === GUIDE.sources.length - 2
                                  ? ' and '
                                  : ''}
                        </span>
                    ))}
                    . Dates change each admissions cycle — always confirm on the
                    official site before registering.{' '}
                    <Link to="/about" className="underline underline-offset-2">
                        About JomExam
                    </Link>
                    .
                </p>
            </article>
        </LandingLayout>
    )
}
