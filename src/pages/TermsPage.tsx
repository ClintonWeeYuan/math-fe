import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Seo } from '@/components/Seo.tsx'
import { CONTACT_EMAIL, LAST_UPDATED } from '@/content/legal.ts'

/**
 * Terms of Use, v2.
 *
 * Supplied copy, reproduced close to verbatim from the v2 draft. Four kinds of
 * change were made, and none of them to the substance:
 *
 * 1. The bracketed placeholders were filled with the values agreed on
 *    2026-09-03 — 48 hours of outage, 30 days to report a charge, 12 months of
 *    report access, 2 working days to acknowledge a complaint and 14 to
 *    resolve one.
 *
 * 2. The draft's VAT line was a note-to-self ("to be confirmed with your
 *    accountant") and is omitted rather than guessed at. A wrong VAT statement
 *    in a contract is worse than no statement; adding one later is a one-line
 *    change.
 *
 * 3. The draft named "Sets B to G across all five ESAT papers". Only B to E
 *    exist today. Naming letters makes a promise with a delivery date attached,
 *    so it says "all paid sets for that test, plus any further sets we add
 *    during the season" — true at B–E and still true at G.
 *
 * 4. The draft was written for a single ESAT pass with TMUA "sold separately"
 *    under a future agreement. Both passes now exist in the code at the same
 *    price and end date, so this covers both rather than needing rewriting the
 *    week TMUA goes on sale.
 *
 * One addition with no counterpart in the draft: the paragraph separating the
 * cancellation waiver, the refund promises and the 30-day reporting window.
 * Those are three different things and the draft left them adjacent but
 * unrelated, which reads as though ticking the box gives up the lot. It does
 * not, and a student who believes it does has been misled by our own page.
 *
 * Klarna is deliberately unmentioned: it is being switched off in Stripe.
 * Alipay and WeChat Pay are named because they are genuinely enabled. If the
 * enabled set changes, this list is part of that change.
 *
 * Do not edit the payment, cancellation or liability sections without legal
 * sign-off. The rest is not ours to reword either — anything that reads oddly
 * is a question for whoever owns the text.
 */

function H2({ children }: { children: ReactNode }) {
    return (
        <h2 className="text-xl md:text-2xl font-bold mb-3 mt-10">{children}</h2>
    )
}

function H3({ children }: { children: ReactNode }) {
    return <h3 className="text-lg font-semibold mb-2 mt-6">{children}</h3>
}

function P({ children }: { children: ReactNode }) {
    return <p className="text-slate-600 leading-relaxed mb-4">{children}</p>
}

function Mail() {
    return (
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
        </a>
    )
}

export function TermsPage() {
    return (
        <LandingLayout>
            <Seo
                title="Terms of Use | JomExam"
                description="The terms you agree to when you use JomExam — what the service is, what a Season Pass covers, payment and refunds, and the rules on diagnostic content."
                path="/terms"
            />
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-3xl">
                <p className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
                    Terms of Use
                </p>
                <p className="text-sm text-slate-500 mb-8">
                    Version 2 · Last updated {LAST_UPDATED}
                </p>

                <P>
                    These are the terms you agree to when you use JomExam. They
                    are written in plain English on purpose. If something here
                    matters to you and isn&apos;t covered, please ask.
                </P>

                <H2>Who we are</H2>
                <P>
                    JomExam is run by Hazel Wee Ling, trading as JomExam, a sole
                    trader based in the United Kingdom. Contact: <Mail />.
                </P>
                <P>
                    JomExam is independent. It is not connected with, endorsed
                    by, or affiliated to UAT-UK, Cambridge University Press
                    &amp; Assessment, the University of Cambridge, Imperial
                    College London, the Malaysian Ministry of Education, or any
                    other exam board or university. ESAT, TMUA and SPM are the
                    names of tests set by other organisations; the questions,
                    reports and guides on JomExam are our own practice material,
                    written to those organisations&apos; published
                    specifications.
                </P>

                <H2>What JomExam is</H2>
                <P>
                    JomExam is an exam preparation service. It provides timed
                    diagnostic tests for university admissions tests (currently
                    the ESAT and the TMUA), practice questions for SPM subjects,
                    and written guides. After a diagnostic, it produces a report
                    describing your performance against the skills that test
                    examines. That report is our assessment of your answers on
                    the day, not a prediction of your result and not advice
                    about which course or university to apply to. Using JomExam
                    does not guarantee any score, grade, interview or offer.
                </P>
                <P>
                    Tutoring is arranged separately and is not covered by these
                    terms.
                </P>

                <H2>Who can use JomExam</H2>
                <P>
                    You need to be at least 13 to create an account. If you are
                    under 18, a parent or guardian must buy any Season Pass for
                    you or agree to your buying it; by paying they accept these
                    terms on your behalf. If you are 18 or over, you accept
                    these terms yourself.
                </P>

                <H2>Acceptable use</H2>
                <P>Use JomExam for your own preparation. Please don&apos;t:</P>
                <ul className="text-slate-600 leading-relaxed mb-4 list-disc pl-6 flex flex-col gap-2">
                    <li>
                        share your account, or sit a diagnostic on someone
                        else&apos;s behalf — the reports are only meaningful if
                        the answers are yours;
                    </li>
                    <li>
                        attempt to access another person&apos;s attempts,
                        reports or account;
                    </li>
                    <li>scrape, bulk-download or automate access to the site;</li>
                    <li>
                        interfere with the service, or attempt to get around its
                        timing, access or security controls.
                    </li>
                </ul>

                <H2>Diagnostic content and our rights in it</H2>
                <P>
                    The questions, answers, explanations, diagrams, reports and
                    guides on JomExam, and the site itself, belong to us, and a
                    small number of people write them. You get a personal,
                    non-transferable licence to view and attempt that material
                    on JomExam for your own preparation, for as long as you have
                    access. You do not get any other rights in it.
                </P>
                <P>
                    Before each diagnostic you are asked to agree not to
                    reproduce, share, or distribute any of that
                    diagnostic&apos;s content. That agreement applies to
                    everything you see while sitting a paper and everything in
                    the report afterwards. You may share your own Skills Radar
                    report with your parent or tutor.
                </P>
                <P>
                    The reason is practical rather than legalistic: a diagnostic
                    only works if the person sitting it has not seen the
                    questions before. Passing them on doesn&apos;t just cost us
                    the material, it makes the next student&apos;s report wrong.
                </P>

                <H2>Your account</H2>
                <P>
                    You are responsible for keeping your sign-in details to
                    yourself. Tell us if you think someone else has access to
                    your account. We may suspend an account that is being used
                    in breach of these terms, and we will tell you why. If the
                    breach is serious — sharing a paid pass, or copying and
                    redistributing diagnostic content — we may end your access
                    without a refund.
                </P>

                <H2>Season Passes, payment and refunds</H2>
                <P>
                    This section applies if you buy a Season Pass or redeem a
                    code for one.
                </P>

                <H3>What a Season Pass is</H3>
                <P>
                    A Season Pass gives one named account access to the paid
                    diagnostic sets for one admissions test, and their Skills
                    Radar reports, for a fixed season. There are two, sold
                    separately: an <strong>ESAT Season Pass</strong> and a{' '}
                    <strong>TMUA Season Pass</strong>. Each covers all paid sets
                    for that test, plus any further sets we add during the
                    season at no extra charge.
                </P>
                <P>
                    Each pass runs from the date of purchase until 31 January
                    2027, so it covers preparation for both the October 2026 and
                    January 2027 sittings at a single fixed price. The price is
                    the same whenever you buy during the season; buying later
                    does not extend the end date. Set A of every subject remains
                    free and is not part of any Season Pass.
                </P>
                <P>
                    The two passes do not cover each other. An ESAT Season Pass
                    does not open TMUA papers, and a TMUA Season Pass does not
                    open ESAT papers. If you are sitting both tests you need
                    both passes.
                </P>
                <P>
                    A Season Pass is a licence to use the content on JomExam. It
                    does not transfer ownership of any material to you, and it
                    does not include tutoring, marking by a person, or any
                    guarantee of a particular test result.
                </P>

                <H3>Price and payment</H3>
                <P>
                    The price is shown on the checkout page before you pay and
                    is stated in GBP. Payments are processed by Stripe; we do
                    not see or store your card details. Where you pay through
                    Alipay or WeChat Pay, the amount charged in your local
                    currency is set by the payment provider&apos;s exchange rate
                    at the time of payment, and any conversion fee is between
                    you and your provider. Stripe, Alipay and WeChat Pay have
                    their own terms, which apply to the payment itself.
                </P>
                <P>
                    Prices may change between seasons. A price change does not
                    affect a Season Pass you have already bought.
                </P>

                <H3>Immediate access and your right to cancel</H3>
                <P>
                    A Season Pass is digital content that is available
                    immediately after payment. Under UK consumer law you
                    normally have 14 days to cancel a purchase of digital
                    content, but that right is lost once you ask for the content
                    to be supplied straight away and acknowledge this.
                </P>
                <P>
                    At checkout you will be asked to confirm that you want
                    immediate access and understand that, by doing so, you give
                    up your 14-day right to cancel. If you would rather keep the
                    cancellation right, do not tick that box; contact us instead
                    and we will supply access after the 14-day period has
                    passed.
                </P>
                <P>
                    <strong>
                        Ticking that box does not give up everything.
                    </strong>{' '}
                    It gives up the right to cancel because you changed your
                    mind, and nothing else. The refunds below still apply, the
                    30-day window for querying a charge still applies, and your
                    legal rights over digital content that is faulty or not as
                    described are unaffected.
                </P>

                <H3>Refunds</H3>
                <P>
                    Because access is immediate and the sets can be completed
                    within days, we do not offer refunds for change of mind, for
                    not using the pass, or because the exam sitting was missed,
                    moved or cancelled by the exam board.
                </P>
                <P>We will refund you in full if:</P>
                <ul className="text-slate-600 leading-relaxed mb-4 list-disc pl-6 flex flex-col gap-2">
                    <li>you were charged more than once for the same pass;</li>
                    <li>
                        the platform is unavailable for more than 48 consecutive
                        hours during your season through a fault on our side and
                        you have not yet started any paid set; or
                    </li>
                    <li>
                        we withdraw the Season Pass or materially reduce what it
                        covers during your season.
                    </li>
                </ul>
                <P>
                    Refunds go back to the original payment method. If you think
                    a charge is wrong, email <Mail /> within 30 days of the
                    charge with the email address on your account and the
                    approximate date of payment.
                </P>

                <H3>One person, one account</H3>
                <P>
                    A Season Pass is for the personal use of the account holder.
                    You may not share your login, resell or transfer the pass,
                    or copy questions, diagrams or reports out of the platform
                    for use elsewhere. If we find an account being shared or
                    content being redistributed, we may suspend the pass without
                    a refund.
                </P>

                <H3>Changes to content during the season</H3>
                <P>
                    We may correct, replace or add questions and reports during
                    a season, including where the exam board updates its
                    specification. We will not remove a whole set from a Season
                    Pass you have already bought without offering a refund for
                    that season.
                </P>

                <H3>When the season ends</H3>
                <P>
                    Access to the paid sets ends on the season end date. Your
                    account, your past attempts and your Skills Radar reports
                    remain available to view for at least 12 months after that,
                    unless you delete your account. A new season requires a new
                    pass.
                </P>

                <H2>What you need to use JomExam</H2>
                <P>
                    JomExam runs in a current version of Chrome, Safari, Firefox
                    or Edge on a computer, tablet or phone, and needs an
                    internet connection throughout a timed diagnostic. Nothing
                    is downloaded or installed. Mathematics is rendered in the
                    browser. If your browser is out of date or your connection
                    drops during a paper, the timer keeps running; tell us and
                    we will sort out your attempt.
                </P>

                <H2>Availability</H2>
                <P>
                    We try to keep JomExam working and available, but we
                    can&apos;t promise it will never be down or that everything
                    on it is free of mistakes. If you hit a problem during a
                    timed diagnostic, tell us and we will sort out your attempt.
                    We may change or withdraw parts of the service; if we
                    withdraw something you have paid for, the refund rules above
                    apply.
                </P>

                <H2>Our responsibility to you</H2>
                <P>
                    If we break these terms, we are responsible for loss you
                    suffer that is a foreseeable result of that breach, up to
                    the amount you paid us in the season in which it happened.
                    We are not responsible for loss that is not foreseeable, for
                    loss of a test score, place or offer, or for problems caused
                    by your own device, connection or browser.
                </P>
                <P>
                    Nothing in these terms limits or excludes our liability for
                    death or personal injury caused by our negligence, for
                    fraud, or for anything else that the law does not allow us
                    to limit. If you are a consumer, you have legal rights in
                    relation to digital content that is faulty or not as
                    described; nothing in these terms affects those rights.
                </P>

                <H2>Privacy</H2>
                <P>
                    How we handle your personal data, including your attempts
                    and reports, is set out in our{' '}
                    <Link className="underline" to="/privacy">
                        Privacy Notice
                    </Link>
                    , which forms part of these terms.
                </P>

                <H2>Complaints</H2>
                <P>
                    If something has gone wrong, email <Mail /> with
                    &quot;Complaint&quot; in the subject line. We will
                    acknowledge within 2 working days and aim to resolve the
                    matter within 14 days. If you are not satisfied, you retain
                    the right to take the matter to the courts or to a consumer
                    body in your own country.
                </P>

                <H2>Changes to these terms</H2>
                <P>
                    We will update this page when the terms change, and move the
                    date and version at the top. Significant changes will be
                    flagged on the site rather than left for you to notice.
                    Changes do not apply to a Season Pass you bought before the
                    change, unless the change is required by law or is in your
                    favour.
                </P>

                <H2>Governing law</H2>
                <P>
                    These terms are governed by the law of England and Wales,
                    and the courts of England and Wales can hear any dispute
                    about them. If you live elsewhere, you keep any protections
                    that the law of your own country gives you and that cannot
                    be excluded by agreement, and you may bring a claim in your
                    own courts.
                </P>

                <H2>The small print</H2>
                <P>
                    If any part of these terms is found to be invalid, the rest
                    still applies. If we don&apos;t enforce a term on one
                    occasion, we can still enforce it later. We are not
                    responsible for delay or failure caused by events outside
                    our reasonable control. These terms, together with the
                    Privacy Notice and the diagnostic content agreement you
                    accept before each paper, are the whole agreement between
                    you and us about JomExam.
                </P>

                <H2>Contact</H2>
                <P>
                    Questions about these terms? Email us at <Mail />.
                </P>
            </div>
        </LandingLayout>
    )
}
