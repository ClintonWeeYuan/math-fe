import { Link } from 'react-router-dom'
import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Seo } from '@/components/Seo.tsx'
import { GUIDES } from '@/content/guides.mjs'

/**
 * The guides index. Exists so the guides are reachable from the site rather
 * than only from a search result: they were orphan pages, which is bad for a
 * reader who wants to browse and bad for crawling, since a page nothing links
 * to reads as unimportant.
 */
export function GuidesIndexPage() {
    return (
        <LandingLayout>
            <Seo
                title="ESAT & TMUA Guides | JomExam"
                description="Straight answers on the ESAT and TMUA — what each test asks of you, the format, how results are reported, and how to use a practice paper properly."
                path="/guides"
            />
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-4xl">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Guides
                </p>
                <h1 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
                    ESAT &amp; TMUA, explained.
                </h1>
                <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-2xl">
                    What each test actually asks of you, how it is scored, and
                    how to get something useful out of a practice paper. Written
                    against the official specifications and linked to their
                    sources.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {GUIDES.map((guide) => (
                        <Link key={guide.path} to={guide.path}>
                            <div className="h-full border border-slate-200 rounded-xl p-6 bg-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group flex flex-col">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                                    {guide.eyebrow}
                                </p>
                                <p className="text-xl font-bold mb-2">
                                    {guide.h1}
                                </p>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">
                                    {guide.description}
                                </p>
                                <span className="text-sm font-semibold text-slate-700 group-hover:translate-x-1 transition-transform">
                                    Read the guide →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </LandingLayout>
    )
}
