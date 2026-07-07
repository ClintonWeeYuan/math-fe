import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { useEffect } from 'react'

export function AboutPage() {
    const navigate = useNavigate()

    useEffect(() => {
        document.title = 'About | JomExam — Free SPM & ESAT Practice'
    }, [])

    return (
        <LandingLayout>
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-5xl">

                {/* Hero */}
                <p className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    Exam prep that{' '}
                    <span style={{ color: '#799ED1' }}>
                        actually works.
                    </span>
                </p>
                <p className="text-lg md:text-xl text-slate-500 mb-12 leading-relaxed max-w-3xl">
                    JomExam started as free SPM practice for Malaysian students.
                    It's grown into a full diagnostic platform — covering SPM,
                    ESAT, and TMUA — built around one idea: understand where
                    you're weak before you waste time drilling what you already
                    know.
                </p>

                {/* Mission */}
                <div className="bg-slate-50 rounded-2xl p-8 mb-16 border border-slate-100">
                    <p className="text-2xl font-bold mb-3">Our mission</p>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        Make high-quality exam practice free and accessible —
                        for every SPM student in Malaysia, and every A-Level or
                        IB student aiming for a top UK university.
                    </p>
                </div>

                {/* Team */}
                <p className="text-2xl font-bold mb-8">Who we are</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

                    {/* Hazel */}
                    <div className="rounded-2xl border border-slate-100 p-8 bg-white shadow-sm">
                        <p className="text-4xl mb-4">✏️</p>
                        <p className="text-xl font-bold mb-1">Hazel</p>
                        <p className="text-slate-400 text-xs mb-4 uppercase tracking-widest font-medium">
                            Content & Tutoring
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {[
                                'DPhil Engineering, Oxford',
                                'First Class, Engineering Science, Oxford',
                            ].map((cred) => (
                                <span
                                    key={cred}
                                    className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200"
                                >
                                    {cred}
                                </span>
                            ))}
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Oxford DPhil graduate in Engineering. I've taught
                            5,000+ hours online — A-Level, IB, ESAT, and TMUA
                            — and curated and organised real SPM past paper
                            questions by topic and skill so students can drill
                            exactly what they need. My teaching is diagnostic
                            first: find the gap, fix the gap, move on.
                        </p>
                    </div>

                    {/* Clinton */}
                    <div className="rounded-2xl border border-slate-100 p-8 bg-white shadow-sm">
                        <p className="text-4xl mb-4">⚙️</p>
                        <p className="text-xl font-bold mb-1">Clinton</p>
                        <p className="text-slate-400 text-xs mb-4 uppercase tracking-widest font-medium">
                            Software Engineer · Advisor
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Software engineer who architected and built the
                            original JomExam platform — the backend, the quiz
                            engine, and the interface you're using now. Now
                            advises on technical direction as the platform
                            continues to evolve.
                        </p>
                    </div>
                </div>

                {/* Tutoring section */}
                <div
                    className="rounded-2xl p-8 md:p-12 mb-16"
                    style={{ backgroundColor: '#1a1f2e' }}
                >
                    <p className="text-2xl md:text-3xl font-bold text-white mb-3">
                        One-to-one tutoring with Hazel
                    </p>
                    <p className="text-slate-400 leading-relaxed mb-6 max-w-2xl">
                        The platform gives you the questions. Tutoring sessions
                        go deeper — a full skills diagnostic, a personalised
                        study plan, and weekly sessions that target your
                        specific gaps. Ideal for students targeting ESAT, TMUA,
                        or A-Level results that open doors.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {[
                            'A-Level Mathematics & Further Maths',
                            'A-Level Physics & Chemistry',
                            'IB Mathematics',
                            'IB Physics & Chemistry',
                            'ESAT preparation',
                            'TMUA preparation',
                        ].map((s) => (
                            <span
                                key={s}
                                className="text-xs text-slate-300 border border-slate-600 px-3 py-1 rounded-full"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                    <a
                        href="mailto:hazelweeling@gmail.com"
                        className="inline-block"
                    >
                        <Button className="bg-white text-slate-900 hover:bg-slate-100 cursor-pointer font-medium">
                            Get in touch →
                        </Button>
                    </a>
                </div>

                {/* CTA */}
                <div className="text-center py-10 border-t border-slate-100">
                    <p className="text-2xl font-bold mb-3">Start practising</p>
                    <p className="text-slate-500 mb-6">
                        Free for everyone. No sign-up needed to browse questions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            className="xl:py-6 px-8 cursor-pointer text-base"
                            onClick={() => navigate('/subjects')}
                        >
                            SPM practice →
                        </Button>
                        <Button
                            variant="outline"
                            className="xl:py-6 px-8 cursor-pointer text-base"
                            onClick={() => navigate('/esat-tmua')}
                        >
                            ESAT & TMUA →
                        </Button>
                    </div>
                </div>
            </div>
        </LandingLayout>
    )
}
