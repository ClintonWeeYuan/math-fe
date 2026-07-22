import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'

const PERIWINKLE = '#799ED1'

/**
 * The front door is a goal fork, not an exam list: a visitor tells us where
 * they're headed (curriculum revision vs university admissions) and every
 * screen after is scoped to that goal. New exams join the pickers behind
 * these two doors — the fork itself never grows.
 */
export function LandingPage() {
    useEffect(() => {
        document.title =
            'JomExam — STEM Exam Prep, from SPM to University Admissions'
    }, [])

    return (
        <LandingLayout>
            <div className="px-4 md:px-[50px] xl:px-[150px] py-10 md:py-16 w-full">
                {/* Eyebrow */}
                <div className="mb-5">
                    <span className="inline-block bg-slate-100 text-slate-600 text-xs md:text-sm font-medium px-4 py-1.5 rounded-full border border-slate-200">
                        STEM exam prep — pick your goal
                    </span>
                </div>

                {/* Heading */}
                <p className="text-3xl md:text-6xl font-bold mb-4 leading-tight">
                    Every step of STEM,
                    <br />
                    <span style={{ color: PERIWINKLE }}>up to admissions.</span>
                </p>

                <p className="text-sm md:text-lg text-slate-500 mb-8 md:mb-12 max-w-2xl">
                    From SPM revision to A-Level and IB practice, to the
                    admissions tests for the world&apos;s top STEM courses.
                    Pick your goal — everything you see after is scoped to it.
                </p>

                {/* The two doors */}
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
                    <Link to="/revision">
                        <div className="h-full border border-slate-200 rounded-xl bg-white overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group">
                            <div className="h-1 bg-green-600" />
                            <div className="p-6 md:p-8 flex flex-col h-full">
                                <p className="text-xl md:text-2xl font-bold mb-1">
                                    Revise my exams
                                </p>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">
                                    Curriculum · SPM / A-Level / IB
                                </p>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Master your syllabus topic by topic, with a
                                    question bank scoped to your exact exam.
                                </p>
                                <ul className="text-sm text-slate-600 flex flex-col gap-2 mb-6">
                                    <li className="flex gap-2">
                                        <span className="text-green-600">→</span>
                                        SPM Maths &amp; Add Maths — live now
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-600">→</span>
                                        A-Level &amp; IB Maths — coming soon
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-600">→</span>
                                        Practise by topic, at your own pace
                                    </li>
                                </ul>
                                <div className="mt-auto flex items-center text-green-700 group-hover:translate-x-1 transition-transform text-sm font-semibold">
                                    Choose your exam →
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admissions">
                        <div className="h-full border border-slate-200 rounded-xl bg-white overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group">
                            <div
                                className="h-1"
                                style={{ backgroundColor: PERIWINKLE }}
                            />
                            <div className="p-6 md:p-8 flex flex-col h-full">
                                <p className="text-xl md:text-2xl font-bold mb-1">
                                    Get into a top university
                                </p>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">
                                    Admissions tests · ESAT / TMUA
                                </p>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Timed diagnostics mapped to the exact skills
                                    these tests examine — sit one and see
                                    precisely where you stand.
                                </p>
                                <ul className="text-sm text-slate-600 flex flex-col gap-2 mb-6">
                                    <li className="flex gap-2">
                                        <span style={{ color: PERIWINKLE }}>
                                            →
                                        </span>
                                        For Cambridge, Imperial, LSE, Warwick
                                        &amp; more
                                    </li>
                                    <li className="flex gap-2">
                                        <span style={{ color: PERIWINKLE }}>
                                            →
                                        </span>
                                        Skills report, not just a score
                                    </li>
                                    <li className="flex gap-2">
                                        <span style={{ color: PERIWINKLE }}>
                                            →
                                        </span>
                                        One-to-one tutoring with an Oxford DPhil
                                    </li>
                                </ul>
                                <div
                                    className="mt-auto flex items-center group-hover:translate-x-1 transition-transform text-sm font-semibold"
                                    style={{ color: PERIWINKLE }}
                                >
                                    Choose your test →
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Undecided escape hatch */}
                <p className="text-sm text-slate-500 mt-8">
                    Not sure yet?{' '}
                    <Link
                        to="/esat-tmua"
                        className="font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-900"
                    >
                        See how diagnostics work
                    </Link>{' '}
                    or{' '}
                    <Link
                        to="/revision"
                        className="font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-900"
                    >
                        browse revision exams
                    </Link>
                    .
                </p>
            </div>
        </LandingLayout>
    )
}
