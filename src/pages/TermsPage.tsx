import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Seo } from '@/components/Seo.tsx'
import { CONTACT_EMAIL, LAST_UPDATED } from '@/content/legal.ts'

/**
 * Terms of Use, v1.
 *
 * Deliberately minimal and deliberately labelled as such. It exists because
 * the signup notice promises a page called Terms of Use, and a link to nothing
 * is worse than a short page — but it is a placeholder written to be replaced,
 * not a considered agreement, and saying so on the page is more honest than
 * letting its brevity imply completeness.
 *
 * The content-protection paragraph mirrors the checkbox on the diagnostic
 * start screen. That checkbox stays where it is: agreeing to it at the moment
 * you are handed the questions is a different act from having read the terms
 * once at signup, and it is the one with contractual force at the point it
 * matters.
 */
export function TermsPage() {
    return (
        <LandingLayout>
            <Seo
                title="Terms of Use | JomExam"
                description="The terms you agree to when you use JomExam — what the service is, acceptable use, and the rules on diagnostic content."
                path="/terms"
            />
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-3xl">
                <p className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
                    Terms of Use
                </p>
                <p className="text-sm text-slate-500 mb-2">
                    Version 1 · Last updated {LAST_UPDATED}
                </p>
                <p className="text-sm text-slate-500 mb-10 rounded-lg border border-slate-200 bg-slate-50 p-4 leading-relaxed">
                    This is a first version, kept short on purpose. It states
                    the essentials rather than everything, and will be replaced
                    with a fuller agreement. If something here matters to you
                    and isn&apos;t covered, please ask.
                </p>

                <h2 className="text-xl md:text-2xl font-bold mb-3">
                    What JomExam is
                </h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                    JomExam is an exam preparation service. It provides timed
                    diagnostic tests for university admissions tests (currently
                    the ESAT and the TMUA), practice questions for SPM subjects,
                    and written guides. After a diagnostic, it produces a report
                    describing your performance against the skills that test
                    examines. That report is our assessment of your answers on
                    the day, not a prediction of your result and not advice
                    about which course or university to apply to.
                </p>

                <h2 className="text-xl md:text-2xl font-bold mb-3">
                    Acceptable use
                </h2>
                <p className="text-slate-600 leading-relaxed mb-3">
                    Use JomExam for your own preparation. Please don&apos;t:
                </p>
                <ul className="text-slate-600 leading-relaxed mb-8 list-disc pl-6 flex flex-col gap-2">
                    <li>
                        share your account, or sit a diagnostic on someone
                        else&apos;s behalf — the reports are only meaningful if
                        the answers are yours;
                    </li>
                    <li>
                        attempt to access another person&apos;s attempts,
                        reports or account;
                    </li>
                    <li>
                        scrape, bulk-download or automate access to the site;
                    </li>
                    <li>
                        interfere with the service, or attempt to get around its
                        timing, access or security controls.
                    </li>
                </ul>

                <h2 className="text-xl md:text-2xl font-bold mb-3">
                    Diagnostic content
                </h2>
                <p className="text-slate-600 leading-relaxed mb-3">
                    The questions, answers, explanations and reports on JomExam
                    are ours, and a small number of people write them. Before
                    each diagnostic you are asked to agree not to reproduce,
                    share, or distribute any of that diagnostic&apos;s content.
                    That agreement applies to everything you see while sitting a
                    paper and everything in the report afterwards.
                </p>
                <p className="text-slate-600 leading-relaxed mb-8">
                    The reason is practical rather than legalistic: a diagnostic
                    only works if the person sitting it has not seen the
                    questions before. Passing them on doesn&apos;t just cost us
                    the material, it makes the next student&apos;s report wrong.
                </p>

                <h2 className="text-xl md:text-2xl font-bold mb-3">
                    Your account
                </h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                    You are responsible for keeping your sign-in details to
                    yourself. Tell us if you think someone else has access to
                    your account. We may suspend an account that is being used
                    in breach of these terms, and we will tell you why.
                </p>

                <h2 className="text-xl md:text-2xl font-bold mb-3">
                    Availability
                </h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                    We try to keep JomExam working and available, but we
                    can&apos;t promise it will never be down or that everything
                    on it is free of mistakes. If you hit a problem during a
                    timed diagnostic, tell us and we will sort out your attempt.
                </p>

                <h2 className="text-xl md:text-2xl font-bold mb-3">
                    Changes to these terms
                </h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                    We will update this page when the terms change, and move the
                    date at the top. Significant changes will be flagged on the
                    site rather than left for you to notice.
                </p>

                <h2 className="text-xl md:text-2xl font-bold mb-3">Contact</h2>
                <p className="text-slate-600 leading-relaxed">
                    Questions about these terms? Email us at{' '}
                    <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="font-semibold underline underline-offset-4"
                    >
                        {CONTACT_EMAIL}
                    </a>
                    .
                </p>
            </div>
        </LandingLayout>
    )
}
