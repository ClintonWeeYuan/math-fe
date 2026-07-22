import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Seo } from '@/components/Seo.tsx'

/**
 * Step 1 of the revision track: pick your curriculum. Only SPM is live —
 * A-Level and IB are signposted as coming soon so the catalogue reads as a
 * roadmap, not a gap. New curricula are added here, never as new doors on
 * the landing fork.
 */
export function RevisionPickerPage() {
    const navigate = useNavigate()

    return (
        <LandingLayout>
            <Seo
                title="Choose Your Exam | JomExam Revision"
                description="Pick your curriculum — SPM live now with Mathematics and Add Maths, A-Level and IB Maths coming soon. Practice scoped to your exact exam, organised by topic."
                path="/revision"
            />
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-5xl">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Revision · step 1 of 2
                </p>

                <p className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                    Which exam are you revising for?
                </p>

                <p className="text-sm md:text-lg text-slate-500 mb-10 max-w-2xl">
                    Everything after this — subjects, topics, progress — is
                    scoped to your exam.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* SPM — live */}
                    <div className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col hover:shadow-xl hover:scale-[1.02] transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <p className="text-lg font-bold">SPM</p>
                            <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200">
                                Live
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                            Malaysian secondary, Form 4–5. Mathematics and
                            Additional Mathematics live now; sciences on the
                            way.
                        </p>
                        <Button
                            className="cursor-pointer w-full"
                            onClick={() => navigate('/subjects')}
                        >
                            Enter SPM →
                        </Button>
                    </div>

                    {/* A-Level — coming soon */}
                    <div className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col opacity-70">
                        <div className="flex items-center gap-3 mb-2">
                            <p className="text-lg font-bold">A-Level</p>
                            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                                Coming soon
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                            Cambridge, Edexcel and AQA STEM subjects —
                            Mathematics first, in development now.
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                            In development
                        </p>
                    </div>

                    {/* IB — coming soon */}
                    <div className="border border-slate-200 rounded-xl p-6 bg-white flex flex-col opacity-70">
                        <div className="flex items-center gap-3 mb-2">
                            <p className="text-lg font-bold">IB Diploma</p>
                            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                                Coming soon
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                            Math AA and AI at SL and HL — planned after A-Level
                            Mathematics.
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                            Planned
                        </p>
                    </div>
                </div>

                <p className="text-sm text-slate-500 mt-10">
                    Preparing for university admissions instead?{' '}
                    <Link
                        to="/admissions"
                        className="font-semibold underline underline-offset-4"
                        style={{ color: '#4E77B4' }}
                    >
                        Switch to admissions tests →
                    </Link>
                </p>
            </div>
        </LandingLayout>
    )
}
