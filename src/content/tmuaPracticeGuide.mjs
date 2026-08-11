/**
 * Content for the TMUA practice-tests guide.
 *
 * Plain data in .mjs, not JSX, so the React page and the build-time
 * prerenderer share one source and the static copy cannot drift from what a
 * reader sees.
 *
 * Facts checked against UAT-UK (the body that runs the test) in August 2026:
 * two papers of 20 multiple-choice questions in 75 minutes each, 2h30 in
 * total, no calculator, no negative marking, results reported 1-9 to one
 * decimal place, no pass mark. Course-level requirements are deliberately
 * NOT listed: UAT-UK's own guidance is to check the course pages of the
 * universities you are applying to, and those requirements change yearly.
 * The "aim for X" score figures circulated by prep companies are omitted for
 * the same reason as on the ESAT guide — UAT-UK does not publish them.
 */

export const GUIDE = {
    path: '/guides/tmua-practice-tests',
    title: 'TMUA Practice Tests — Free Paper 1 & Paper 2 Diagnostics | JomExam',
    description:
        'Free TMUA practice tests for Paper 1 and Paper 2 — 20 questions in 75 minutes each, matching the real format. Sit one and get a skills report naming the specific reasoning gaps to fix.',
    eyebrow: 'TMUA guide',
    ctaPath: '/diagnostics/tmua',
    ctaLabel: 'Sit a free TMUA diagnostic →',
    h1: 'TMUA practice tests',
    standfirst:
        'The TMUA is two papers that feel like different exams: one asks you to apply mathematics you already know, the other asks you to reason about it. This guide explains what each paper actually tests, and gives you a timed paper for both — free, with a report naming the specific gaps rather than just a mark.',
    // When the page went live, and when it last changed. updatedAt drives
    // <lastmod>, which sitemaps.org defines as the modification date of the
    // page — not "when someone last re-read the facts". It moved to the 11th
    // because that is when the page gained its byline and dates, which is a
    // change a reader can see.
    publishedAt: '2026-08-01',
    updatedAt: '2026-08-11',
    sections: [
        {
            id: 'two-papers',
            h2: 'Paper 1 and Paper 2 are not the same test',
            paras: [
                'Paper 1 (Applications of Mathematical Knowledge) assesses your ability to apply mathematics you have already met to unfamiliar situations. The content rarely exceeds AS-level; the difficulty is in seeing which technique the question is really asking for.',
                'Paper 2 (Mathematical Reasoning) assesses mathematical reasoning and simple ideas from elementary logic. It is the paper students underestimate. The mathematics is often easier than Paper 1, but it is wrapped in a logical frame: necessary and sufficient conditions, quantifiers and negation, proof strategy, spotting the flawed step in a worked argument.',
                'They are scored separately, so it is entirely normal to be strong on one and weak on the other — and that pattern matters, because the fix for each is different. Grinding more algebra will not help a Paper 2 weakness in necessary-versus-sufficient conditions.',
            ],
            table: {
                caption: 'The two papers at a glance',
                head: ['', 'Paper 1', 'Paper 2'],
                rows: [
                    [
                        'Assesses',
                        'Applying mathematical knowledge in new situations',
                        'Mathematical reasoning and elementary logic',
                    ],
                    ['Questions', '20 multiple choice', '20 multiple choice'],
                    ['Time', '75 minutes', '75 minutes'],
                    [
                        'Typical difficulty',
                        'AS-level content, unfamiliar framing',
                        'Simpler content, harder logical frame',
                    ],
                ],
            },
        },
        {
            id: 'format',
            h2: 'The format you are practising for',
            paras: [
                'The TMUA is computer-based and sat at a Pearson VUE test centre. Each paper contains 20 multiple-choice questions and lasts 75 minutes, and the test runs 2 hours 30 minutes in total.',
                'There is no calculator and no dictionary. There is no negative marking either, so you should attempt every question — a guess costs nothing and a blank is a guaranteed zero.',
                'Each paper is reported separately on a scale from 1 (low) to 9 (high), to one decimal place. There is no pass mark. Universities read your scores alongside the rest of your application, so a score only means something relative to the cohort that sat it with you.',
            ],
        },
        {
            id: 'paper-2',
            h2: 'Why Paper 2 catches people out',
            paras: [
                'Paper 2 uses formats you will not have met in school mathematics. Questions frequently present three statements labelled I, II and III and ask which must be true, with answer options covering every combination. Others show a worked argument and ask which line first goes wrong.',
                'These reward precision about what has actually been proved. A statement that is sufficient is not automatically necessary; a claim true for every example you tried is not thereby proved; and a step that looks algebraically routine may quietly divide by something that could be zero.',
                'That is why practising Paper 2 by doing more Paper 1 questions does not work. You need questions written in the reasoning formats, with feedback that names the logical error you made — not just the fact that you were wrong.',
            ],
        },
        {
            id: 'how-to-use',
            h2: 'How to use a practice paper properly',
            paras: [
                'Marking a paper out of 20 tells you very little you can act on. It does not distinguish between running out of time, misreading what was asked, and genuinely not knowing the technique.',
                'Treat your first paper as a diagnostic rather than a rehearsal: sit it under real conditions, then look at where the wrong answers cluster and how long you spent on them.',
                'Every JomExam TMUA diagnostic is written to the real format — 20 questions in 75 minutes, no calculator — and produces a per-skill breakdown with your timing on each question. For each wrong answer it names the specific misconception that answer represents, which on Paper 2 is usually the whole point: not "you found logic hard", but that you treated a sufficient condition as a necessary one.',
            ],
        },
    ],
    faq: [
        {
            q: 'What is the difference between TMUA Paper 1 and Paper 2?',
            a: 'Paper 1 assesses your ability to apply mathematical knowledge in new situations. Paper 2 assesses mathematical reasoning and simple ideas from elementary logic — proof, necessary and sufficient conditions, quantifiers, and locating errors in an argument. Each is 20 multiple-choice questions in 75 minutes, and they are scored separately.',
            link: {
                label: 'Official TMUA test page (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/',
            },
        },
        {
            q: 'How long is the TMUA?',
            a: 'Two papers of 75 minutes each, 20 multiple-choice questions per paper, and 2 hours 30 minutes in total.',
        },
        {
            q: 'Can I use a calculator in the TMUA?',
            a: 'No. No calculator or dictionary is allowed, which is why every JomExam TMUA diagnostic is written to be answered without one.',
        },
        {
            q: 'Is there negative marking in the TMUA?',
            a: 'No. You do not lose marks for wrong answers, so it is worth attempting every question — an educated guess costs nothing, and a blank is a guaranteed zero.',
        },
        {
            q: 'What score do I need for the TMUA?',
            a: 'There is no pass mark. Each paper is reported on a scale from 1 (low) to 9 (high) to one decimal place, and universities read those scores alongside the rest of your application. No official threshold is published, and a score is only meaningful relative to the cohort that sat the test that year — so the useful question is not "what score do I need" but "which paper am I losing marks in, and why".',
            link: {
                label: 'How TMUA results are reported (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/',
            },
        },
        {
            q: 'Which universities require the TMUA?',
            a: 'Universities using the TMUA include Cambridge, Oxford, LSE, UCL, Warwick and Durham, and the list changes between admissions cycles. Requirements are set per course, not per university — the same institution may require it for one degree, recommend it for another and ignore it for a third. UAT-UK\'s own guidance is to check the course pages of the universities you are applying to.',
            link: {
                label: 'Universities using the TMUA (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/',
            },
        },
        {
            q: 'When is the TMUA sat, and does it differ for international students?',
            a: 'There are two sittings: 12–16 October 2026 and 4–8 January 2027. Applicants to Cambridge or Oxford must sit the October window. Booking for October closes 28 September 2026 (6pm BST) and for January on 21 December 2026 (6pm GMT), and you register yourself rather than through your school. The paper is identical wherever you sit it, but the fee is £78 at test centres in the UK and the Republic of Ireland and £133 elsewhere — set by the test centre\'s location, not your nationality — and candidates in China, Hong Kong and Macau are restricted to specific days within each window. Confirm the dates on the official site before relying on them; they move each cycle.',
            link: {
                label: 'Official dates and registration (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/register/',
            },
        },
        {
            q: 'Are the JomExam TMUA practice tests free?',
            a: 'Set A of both Paper 1 and Paper 2 is free to sit, including the full skills report. Further sets are part of the Season Pass.',
        },
    ],
    sources: [
        {
            label: 'UAT-UK — TMUA',
            url: 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/',
        },
        {
            label: 'UAT-UK — dates and registration',
            url: 'https://esat-tmua.ac.uk/register/',
        },
    ],
}
