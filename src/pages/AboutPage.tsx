import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { useEffect } from 'react'

export function AboutPage() {
    const navigate = useNavigate()

    useEffect(() => {
        document.title = 'About | JomExam — Free SPM Practice Questions'
    }, [])

    return (
        <LandingLayout>
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-4xl">

                {/* Hero statement */}
                <p className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    SPM practice,{' '}
                    <span style={{ color: '#799ED1' }}>
                        anywhere. Free.
                    </span>
                </p>
                <p className="text-lg md:text-xl text-slate-500 mb-12 leading-relaxed">
                    Every student deserves access to quality exam practice —
                    not just those who can afford tuition centres or thick
                    revision books. JomExam puts real past paper questions in
                    your pocket, organised by topic and difficulty, so you can
                    drill exactly what you need, whenever you need it.
                </p>

                {/* Mission block */}
                <div className="bg-slate-50 rounded-2xl p-8 mb-12 border border-slate-100">
                    <p className="text-2xl font-bold mb-3">Our mission</p>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        Make SPM revision simple, structured, and accessible
                        to every student in Malaysia — regardless of where
                        they study or what they can afford.
                    </p>
                </div>

                {/* Founders */}
                <p className="text-2xl font-bold mb-6">Who we are</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="rounded-2xl border border-slate-100 p-8 bg-white shadow-sm">
                        <p className="text-4xl mb-4">✏️</p>
                        <p className="text-xl font-bold mb-1">Hazel</p>
                        <p className="text-slate-500 text-sm mb-3 uppercase tracking-wide font-medium">Content</p>
                        <p className="text-slate-600 leading-relaxed">
                            Curates and structures the questions — making sure
                            every topic is covered, every difficulty level is
                            right, and the experience feels like a real exam
                            without the stress.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-8 bg-white shadow-sm">
                        <p className="text-4xl mb-4">⚙️</p>
                        <p className="text-xl font-bold mb-1">Clinton</p>
                        <p className="text-slate-500 text-sm mb-3 uppercase tracking-wide font-medium">Engineering</p>
                        <p className="text-slate-600 leading-relaxed">
                            Built the platform from the ground up — the fast,
                            reliable backend and the clean interface you're
                            using right now.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center py-10 border-t border-slate-100">
                    <p className="text-2xl font-bold mb-3">Ready to start?</p>
                    <p className="text-slate-500 mb-6">
                        Pick a subject and go. No sign-up required to browse.
                    </p>
                    <Button
                        className="xl:py-6 px-8 cursor-pointer text-base"
                        onClick={() => navigate('/subjects')}
                    >
                        Start practising now
                    </Button>
                </div>
            </div>
        </LandingLayout>
    )
}
