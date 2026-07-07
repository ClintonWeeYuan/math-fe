import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Link, useNavigate } from 'react-router-dom'
import SubjectsPage from '@/pages/SubjectsPage.tsx'

export function LandingPage() {
    const navigate = useNavigate()

    return (
        <LandingLayout>

            {/* ── HERO ── */}
            <div className="px-4 md:px-[50px] xl:px-[150px] mt-4 md:mt-10 w-full">
                <div className="flex flex-col justify-center w-full">

                    {/* Eyebrow pill */}
                    <div className="mb-5">
                        <span className="inline-block bg-slate-100 text-slate-600 text-xs md:text-sm font-medium px-4 py-1.5 rounded-full border border-slate-200">
                            Free exam prep — no sign-up required
                        </span>
                    </div>

                    {/* Heading */}
                    <p className="text-3xl md:text-6xl font-bold mb-4 leading-tight">
                        Practise smarter.<br />
                        <span style={{ color: '#799ED1' }}>
                            Know where to focus.
                        </span>
                    </p>

                    {/* Subtext */}
                    <p className="text-sm md:text-lg text-slate-500 mb-6 md:mb-10 max-w-2xl">
                        Free diagnostic questions for SPM, ESAT and TMUA —
                        organised by topic and skill, so you drill exactly what
                        you need. Expert one-to-one tutoring also available.
                    </p>

                    {/* CTAs + illustration */}
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 md:pt-2">
                            <Button
                                className="xl:py-6 cursor-pointer"
                                onClick={() => navigate('subjects')}
                            >
                                Start practising free
                            </Button>
                            <Button
                                variant="outline"
                                className="xl:py-6 cursor-pointer"
                                onClick={() => navigate('/about')}
                            >
                                Work with Hazel ↗
                            </Button>
                        </div>
                        <img
                            className="md:w-[700px] xl:w-[900px]"
                            src="/hero.png"
                            alt="Student studying for exams"
                        />
                    </div>
                </div>
            </div>

            {/* ── CHOOSE YOUR TRACK ── */}
            <div className="px-4 md:px-[50px] xl:px-[150px] mt-12 md:mt-16 w-full">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Choose your track</h2>
                <div className="grid md:grid-cols-2 gap-6">

                    {/* SPM card */}
                    <Link to="/subjects">
                        <div className="h-full border border-slate-200 rounded-xl p-6 bg-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group">
                            <div className="text-3xl mb-4">📚</div>
                            <div className="flex items-center gap-3 mb-2">
                                <p className="text-xl font-bold">SPM</p>
                                <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200">
                                    Free forever
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                Free practice questions across Mathematics, Add
                                Maths, Science and more — organised by topic and
                                difficulty.
                            </p>
                            <div className="flex items-center text-slate-400 group-hover:text-slate-700 transition-colors text-sm font-medium">
                                Browse subjects →
                            </div>
                        </div>
                    </Link>

                    {/* ESAT & TMUA card */}
                    <Link to="/esat-tmua">
                        <div className="h-full border border-slate-200 rounded-xl p-6 bg-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group">
                            <div className="text-3xl mb-4">🎯</div>
                            <div className="flex items-center gap-3 mb-2">
                                <p className="text-xl font-bold">ESAT & TMUA</p>
                                <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                                    New
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                Diagnostic questions mapped to specific skills —
                                for students targeting Cambridge, Imperial, LSE
                                and beyond.
                            </p>
                            <div className="flex items-center text-slate-400 group-hover:text-slate-700 transition-colors text-sm font-medium">
                                Explore questions →
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* ── ESAT & TMUA SECTION ── */}
            <div className="px-4 md:px-[50px] xl:px-[150px] mt-12 md:mt-16 w-full">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 md:p-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                        ESAT & TMUA preparation
                    </h2>
                    <p className="text-slate-500 text-sm md:text-base mb-8 max-w-2xl leading-relaxed">
                        Free diagnostic questions built around the actual skills
                        these tests examine — not just past papers. Understand
                        exactly where you stand before you start preparing.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* ESAT */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <p className="text-lg font-bold mb-2">ESAT</p>
                            <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                Engineering and Science Admissions Test. Covers
                                Mathematics, Physics, Chemistry and Biology
                                modules.
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                                Cambridge · Imperial · and others
                            </p>
                        </div>

                        {/* TMUA */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <p className="text-lg font-bold mb-2">TMUA</p>
                            <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                Test of Mathematics for University Admission.
                                Tests mathematical reasoning in novel
                                applications.
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                                Cambridge · LSE · Warwick · Durham
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="cursor-pointer"
                            onClick={() => navigate('/esat-tmua')}
                        >
                            Try free questions
                        </Button>
                        <Button
                            variant="ghost"
                            className="cursor-pointer"
                            onClick={() => navigate('/about')}
                        >
                            Get one-to-one tutoring →
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── HAZEL TUTORING STRIP ── */}
            <div className="px-4 md:px-[50px] xl:px-[150px] mt-12 md:mt-16 w-full">
                <div
                    className="rounded-2xl p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8"
                    style={{ backgroundColor: '#1a1f2e' }}
                >
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            One-to-one tutoring with Hazel
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6 max-w-xl">
                            Oxford-trained. 5,000+ hours of online teaching.
                            Diagnostic-first — every student starts with a
                            skills assessment so sessions target exactly the
                            right gaps.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'DPhil Engineering, Oxford',
                                'First Class, Engineering Science, Oxford',
                                'A-Level · IB · ESAT · TMUA',
                            ].map((pill) => (
                                <span
                                    key={pill}
                                    className="text-xs text-slate-300 border border-slate-600 px-3 py-1 rounded-full"
                                >
                                    {pill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <Button
                            className="bg-white text-slate-900 hover:bg-slate-100 cursor-pointer font-medium"
                            onClick={() => navigate('/about')}
                        >
                            Meet Hazel →
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── SPM SUBJECTS SECTION ── */}
            <div className="mt-12 md:mt-16 w-full">
                <div className="px-4 md:px-[50px] xl:px-[150px] mb-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        SPM Practice
                    </p>
                </div>
                <SubjectsPage embedded />
            </div>

        </LandingLayout>
    )
}
