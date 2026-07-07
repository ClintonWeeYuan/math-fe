import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export function EsatTmuaPage() {
    const navigate = useNavigate()

    useEffect(() => {
        document.title = 'ESAT & TMUA | JomExam — Free Admissions Test Prep'
    }, [])

    return (
        <LandingLayout>
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-4xl">

                {/* Eyebrow */}
                <div className="mb-5">
                    <span className="inline-block bg-amber-50 text-amber-700 text-xs md:text-sm font-medium px-4 py-1.5 rounded-full border border-amber-200">
                        Coming soon
                    </span>
                </div>

                <p className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    ESAT & TMUA{' '}
                    <span style={{ color: '#799ED1' }}>preparation.</span>
                </p>

                <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl">
                    Free diagnostic questions for the Engineering and Science
                    Admissions Test (ESAT) and the Test of Mathematics for
                    University Admission (TMUA) — mapped to specific skills, so
                    you know exactly where to focus.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                        <p className="text-lg font-bold mb-2">ESAT</p>
                        <p className="text-slate-500 text-sm leading-relaxed mb-3">
                            Engineering and Science Admissions Test. Required
                            for Engineering, Natural Sciences, Chemical
                            Engineering, and Veterinary Medicine at Cambridge,
                            and for Engineering at Imperial.
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                            Cambridge · Imperial · and others
                        </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                        <p className="text-lg font-bold mb-2">TMUA</p>
                        <p className="text-slate-500 text-sm leading-relaxed mb-3">
                            Test of Mathematics for University Admission. Tests
                            mathematical reasoning in novel contexts — not just
                            A-Level content recall.
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
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
