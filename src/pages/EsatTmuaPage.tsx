import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/Seo.tsx'

export function EsatTmuaPage() {
    const navigate = useNavigate()

    return (
        <LandingLayout>
            <Seo
                title="ESAT & TMUA Preparation | JomExam"
                description="Prepare for the ESAT and TMUA with timed diagnostics mapped to the skills each test examines — all five ESAT modules and both TMUA papers are live. Sit a paper, get a skills report, and know exactly where to focus."
                path="/esat-tmua"
            />
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-4xl">

                {/* Eyebrow */}
                <div className="mb-5">
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-xs md:text-sm font-medium px-4 py-1.5 rounded-full border border-emerald-200">
                        ESAT diagnostics — now live
                    </span>
                </div>

                <p className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    ESAT & TMUA{' '}
                    <span style={{ color: '#799ED1' }}>preparation.</span>
                </p>

                <p className="text-lg md:text-xl text-slate-500 mb-8 leading-relaxed max-w-2xl">
                    <span className="font-medium text-slate-600">ESAT</span>{' '}
                    diagnostics are live for all five modules — Mathematics 1,
                    Mathematics 2, Physics, Chemistry and Biology — as are{' '}
                    <span className="font-medium text-slate-600">TMUA</span>{' '}
                    Paper 1 and Paper 2. Timed papers mapped to specific
                    skills, with Set A of every paper free to sit.
                </p>

                <div className="mb-12">
                    <Button
                        className="cursor-pointer font-medium"
                        onClick={() => navigate('/diagnostics/esat')}
                    >
                        Start a free ESAT diagnostic →
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-lg font-bold">ESAT</p>
                            <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                                Available now
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-3">
                            Engineering and Science Admissions Test. Required
                            for Engineering, Natural Sciences, Chemical
                            Engineering and Veterinary Medicine at Cambridge,
                            and for engineering courses at Imperial. All five
                            modules are live: Mathematics 1, Mathematics 2,
                            Physics, Chemistry and Biology.
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                            Cambridge · Imperial · and others
                        </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-lg font-bold">TMUA</p>
                            <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                                Available now
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-3">
                            Test of Mathematics for University Admission. Tests
                            mathematical reasoning in novel contexts — not just
                            curriculum recall. Paper 1 &amp; Paper 2, in the
                            same timed-diagnostic + skills-report format as our
                            ESAT sets.
                        </p>
                        <p className="text-xs text-slate-400 font-medium mb-4">
                            Cambridge · LSE · Warwick · Durham · Bath
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-8 mb-12">
                    <p className="text-xl font-bold text-white mb-2">
                        Want to get started now?
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        While we're building out the question bank, Hazel offers
                        one-to-one tutoring for ESAT and TMUA — diagnostic-first,
                        with a personalised study plan from the very first session.
                    </p>
                    <Button
                        className="bg-white text-slate-900 hover:bg-slate-100 cursor-pointer font-medium"
                        onClick={() => navigate('/about')}
                    >
                        Work with Hazel →
                    </Button>
                </div>

                <div className="border-t border-slate-100 pt-10 text-center">
                    <p className="text-slate-500 text-sm mb-4">
                        In the meantime, try our free SPM question bank.
                    </p>
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => navigate('/subjects')}
                    >
                        Browse SPM questions →
                    </Button>
                </div>
            </div>
        </LandingLayout>
    )
}
