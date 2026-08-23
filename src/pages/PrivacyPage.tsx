import type { ReactNode } from 'react'
import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Seo } from '@/components/Seo.tsx'
import { CONTACT_EMAIL, DATA_REGION, LAST_UPDATED, OPERATOR } from '@/content/legal.ts'

/**
 * The privacy notice.
 *
 * Mostly supplied copy, reproduced verbatim: the four bracketed values —
 * operator, last-updated date, hosting region (twice) and contact address —
 * are filled from src/content/legal.ts. The processor list and the
 * data-location section were then corrected against what the code actually
 * does, on instruction. Everything else is not ours to reword, so anything
 * that reads oddly is a question for whoever owns the text.
 *
 * Verified rather than assumed, before Resend was named: the dependency is in
 * pyproject.toml, EMAIL_API_KEY holds a real re_ key, app/services/email.py
 * calls resend.Emails.send from four reachable sites, and sixteen accounts
 * verified themselves by clicking a link we emailed. It is in use, not
 * leftover configuration. The Japanese region comes from the domain's own
 * DNS: send.jomexam.com bounces to feedback-smtp.ap-northeast-1.amazonses.com.
 * Where Resend stores its message logs is a separate question, unverifiable
 * from here, and so is not claimed.
 *
 * Supabase Auth is not used anywhere in this project — accounts live in
 * public.users behind our own JWTs — so there is no built-in mailer to fold
 * into the Supabase entry.
 *
 * Still outstanding: the notice describes JomExam as based in the United
 * Kingdom while naming Singapore as where data sits, and names no safeguard
 * for that transfer. See the comment at the end of "Where your data lives".
 * It also describes target universities and referral capture, which now exist,
 * and YouTube embeds, which do too — that gap has closed since it was written.
 *
 * Two gaps closed on 2026-08-23, both of the same kind: a thing the site had
 * been doing for a while that the notice had never caught up with. Google
 * sign-in had created six accounts without Google appearing anywhere in this
 * page, and Microsoft sign-in shipped the same day this was written. Railway
 * had always hosted both halves of the service and had never been named
 * either, though every request and every IP address passes through it.
 *
 * The lesson worth carrying: this page goes stale from features shipping, not
 * from anyone editing it. A new processor or a new sign-in route is a change
 * to this file too.
 */

/** One "**Lead.** rest of the sentence" paragraph, as the source formats them. */
function Item({ lead, children }: { lead: string; children: ReactNode }) {
    return (
        <p className="text-slate-600 leading-relaxed mb-4">
            <span className="font-semibold text-slate-900">{lead}</span>{' '}
            {children}
        </p>
    )
}

function H2({ children }: { children: ReactNode }) {
    return (
        <h2 className="text-xl md:text-2xl font-bold mb-3 mt-10">{children}</h2>
    )
}

function P({ children }: { children: ReactNode }) {
    return <p className="text-slate-600 leading-relaxed mb-4">{children}</p>
}

function Mail() {
    return (
        <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold underline underline-offset-4"
        >
            {CONTACT_EMAIL}
        </a>
    )
}

export function PrivacyPage() {
    return (
        <LandingLayout>
            <Seo
                title="Privacy Notice | JomExam"
                description="What information JomExam collects when you use the site, why we collect it, who handles it, and the choices you have."
                path="/privacy"
            />
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-3xl">
                <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
                    Privacy Notice
                </h1>
                <p className="text-sm font-semibold text-slate-500 mb-8">
                    Last updated: {LAST_UPDATED}
                </p>

                <P>
                    JomExam (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is an exam
                    preparation platform operated by {OPERATOR}, based in the
                    United Kingdom. This notice explains what information we
                    collect when you use jomexam.com, why we collect it, and the
                    choices you have. We&apos;ve tried to write it in plain
                    English.
                </P>

                <H2>What we collect</H2>
                <Item lead="Account details.">
                    Your email address, and the name your sign-in provider
                    gives us if you use one. If you set a password, it is
                    stored in encrypted form and we never see the password
                    itself. Most accounts have no password at all: signing in
                    with Google or Microsoft, or with an emailed code, proves
                    your address without creating one.
                </Item>
                <Item lead="Diagnostic answers and results.">
                    When you sit a diagnostic or practice test: the answers you
                    select, your scores, the skills report we generate, and
                    details of each attempt (when you started, how far you got,
                    how long you took).
                </Item>
                <Item lead="Usage information.">
                    How you use JomExam: pages visited, questions answered, time
                    spent, and actions such as opening a report or viewing a
                    solution. We also record how you found us (for example, a
                    search engine, a link from a guide, or a referral code) when
                    your browser provides this.
                </Item>
                <Item lead="Optional information you give us.">
                    If you choose to answer, we store your intended test sitting
                    and the universities you&apos;re targeting, so we can make
                    the site more relevant to you.
                </Item>
                <P>
                    We do not collect payment details at present. If we
                    introduce paid products, payments will be handled by a
                    specialist payment provider and we will update this notice
                    before that happens.
                </P>

                <H2>Why we collect it</H2>
                <P>
                    We use your account details and diagnostic results to
                    provide the service you signed up for: running your tests,
                    generating your reports, and showing you your own history
                    and progress.
                </P>
                <P>
                    We use usage information to understand what&apos;s working
                    and what isn&apos;t — for example, which questions students
                    find hardest or where a test is too long — so we can improve
                    the diagnostics and reports. Where we analyse this at scale,
                    we use it in aggregated form that doesn&apos;t identify you.
                </P>
                <P>
                    We will only send you marketing emails if you separately opt
                    in, and you can unsubscribe at any time.
                </P>
                <P>
                    We do not sell your personal information, and we do not show
                    advertising.
                </P>

                <H2>Who handles your data</H2>
                <P>
                    We use a small number of trusted services to run JomExam:
                </P>
                <ul className="text-slate-600 leading-relaxed mb-4 list-disc pl-6 flex flex-col gap-2">
                    <li>
                        <span className="font-semibold text-slate-900">
                            Supabase
                        </span>{' '}
                        hosts our database, where your account and results are
                        stored. Our database is hosted in {DATA_REGION}.
                    </li>
                    <li>
                        <span className="font-semibold text-slate-900">
                            Umami
                        </span>
                        , a privacy-focused analytics tool, helps us understand
                        site usage. It does not use advertising cookies.
                    </li>
                    <li>
                        <span className="font-semibold text-slate-900">
                            Resend
                        </span>{' '}
                        delivers our verification and sign-in emails. Messages
                        are sent through Amazon SES in Japan.
                    </li>
                    <li>
                        <span className="font-semibold text-slate-900">
                            Google and Microsoft
                        </span>{' '}
                        provide optional sign-in. If you choose one, they
                        confirm your email address to us and give us the name
                        on your account — nothing else — and they know you
                        signed in to JomExam. Neither is involved if you sign
                        in with a password or an emailed code.
                    </li>
                    <li>
                        <span className="font-semibold text-slate-900">
                            Railway
                        </span>{' '}
                        hosts the website and the service behind it, so every
                        request you make passes through it, including your IP
                        address.
                    </li>
                    <li>
                        <span className="font-semibold text-slate-900">
                            YouTube
                        </span>{' '}
                        provides some embedded solution videos. When you play
                        one, YouTube may collect viewing data under its own
                        privacy policy.
                    </li>
                </ul>

                <H2>Where your data lives</H2>
                <P>
                    Your data is stored in {DATA_REGION}. If you use JomExam
                    from outside that region — including from mainland China,
                    Hong Kong, or Malaysia — your information is transferred to
                    and stored there. By using JomExam, you understand your data
                    is handled as this notice describes.
                </P>
                <P>
                    One exception: the emails we send you — verification and
                    sign-in messages — are delivered through Amazon SES in
                    Japan, so your email address is processed there when we
                    send you one.
                </P>
                {/* No transfer-safeguard sentence here yet. Adding one means
                    naming a mechanism (standard contractual clauses or an
                    equivalent), and that is only true once the Supabase and
                    Resend data processing agreements are actually signed —
                    which has not been confirmed. Stating a safeguard that is
                    not in place would be worse than the current silence. */}

                <H2>How long we keep it</H2>
                <P>
                    We keep your account information and results while your
                    account is active, so your history and reports remain
                    available to you. If you ask us to delete your account, we
                    will remove your personal information within 30 days,
                    keeping only aggregated statistics that no longer identify
                    you.
                </P>

                <H2>If you&apos;re under 18</H2>
                <P>
                    Many of our users are school students. We collect only
                    what&apos;s needed to provide the service, and we don&apos;t
                    sell data or show ads. If you&apos;re a parent or guardian
                    and have questions about your child&apos;s information — or
                    want it corrected or deleted — contact us at the address
                    below and we&apos;ll help.
                </P>

                <H2>Your rights and choices</H2>
                <P>
                    You can ask us at any time to see the personal information
                    we hold about you, correct it, or delete it. Email us at{' '}
                    <Mail /> and we&apos;ll respond within 30 days. If
                    you&apos;re in the UK or EU, you also have the right to
                    complain to your data protection authority (in the UK, the
                    ICO).
                </P>

                <H2>Changes to this notice</H2>
                <P>
                    If we make meaningful changes — for example, when we
                    introduce payments — we&apos;ll update this page and the
                    date above, and flag significant changes on the site.
                </P>

                <P>
                    <span className="font-semibold text-slate-900">
                        Questions?
                    </span>{' '}
                    Email us at <Mail />.
                </P>
            </div>
        </LandingLayout>
    )
}
