import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Seo } from '@/components/Seo.tsx'

/**
 * Step 1 of the admissions track: pick your test. ESAT is live; TMUA and
 * further tests are signposted as roadmap so the catalogue reads as
 * ambition, not absence. New tests are added here, never as new doors on
 * the landing fork.
 */
export function AdmissionsPickerPage() {
    const navigate = useNavigate()

    return (
        <LandingLayout>
            <Seo
                title="Choose Your Test | JomExam Admissions"
                description="Pick your admissions test — ESAT diagnostics live now for Cambridge and Imperial applicants; TMUA coming soon. Timed papers with a skills report, not just a score."
                path="/admissions"
            />
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-5xl">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Admissions · step 1 of 2
                </p>

                <p className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                    Which test are you preparing for?
                </p>

                <p className="text-sm md:text-lg text-slate-500 mb-10 max-w-2xl">
                    Each test gets its own diagnostics, skills report and
                    catalogue.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* ESAT — live */}
                    <div className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col hover:shadow-xl hover:scale-[1.02] transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <p className="text-lg font-bold">ESAT</p>
                            <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Live
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                            Engineering and Science Admissions Test — Cambridge,
                            Imperial and others. Diagnostics live now.
                        </p>
                        <Button
                            className="cursor-pointer w-full"
                            onClick={() => navigate('/esat-tmua')}
                        >
                            Enter ESAT →
                        </Button>
                    </div>

                    {/* TMUA — coming soon */}
                    <div className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col opacity-70">
                        <div className="flex items-center gap-3 mb-2">
                            <p className="text-lg font-bold">TMUA</p>
                            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                                Coming soon
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                            Test of Mathematics for University Admission —
                            Cambridge, LSE, Warwick, Durham, Bath.
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                            In development
                        </p>
                    </div>

                    {/* Roadmap */}
                    <div className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col opacity-70">
                        <div className="flex items-center gap-3 mb-2">
                            <p className="text-lg font-bold">More tests</p>
                            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                                Roadmap
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                            MAT, STEP and PAT are on the roadmap as the
                            diagnostic engine grows.
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                            Planned
                        </p>
                    </div>
                </div>

                <p className="text-sm text-slate-500 mt-10">
                    Just revising your curriculum?{' '}
                    <Link
                        to="/revision"
                        className="font-semibold text-green-700 underline underline-offset-4"
                    >
                        Switch to exam revision →
                    </Link>
                </p>
            </div>
        </LandingLayout>
    )
}
