/**
 * Content for the ESAT practice-tests guide.
 *
 * Plain data in .mjs, not JSX, so the React page and the build-time
 * prerenderer can share one source: a guide whose static HTML disagreed with
 * what a reader sees would be worse than having no static copy at all.
 *
 * Every factual claim here comes from UAT-UK (the body that runs the test)
 * or the Cambridge and Imperial admissions pages, checked August 2026: the
 * 1-9 reporting scale, 27 questions per 40-minute module, no calculator, no
 * negative marking, the October and January windows, the fees, and which
 * courses need which modules. Deliberately absent are the "average is 4.5"
 * and "aim for 7.0" figures that circulate on prep-company sites — UAT-UK
 * does not publish them, so this page does not repeat them as fact.
 * Re-check everything each admissions cycle; the dates move every year.
 */

export const GUIDE = {
    path: '/guides/esat-practice-tests',
    title: 'ESAT Practice Tests — Free Diagnostics for Every Module | JomExam',
    description:
        'Free ESAT practice tests for every module in the real format — plus the format, scoring and modules-by-course reference, kept current on this page.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free ESAT diagnostic →',
    h1: 'ESAT practice tests',
    standfirst:
        'Start with the official specimen papers — then the problem becomes what to do next, because the ESAT is new and the back catalogue is shallow. This guide gives you the format you are practising for, and a timed paper for every module: free, with a report naming the specific skills to fix rather than just a mark.',
    // When the page went live, and when it last changed. updatedAt drives
    // <lastmod>, which sitemaps.org defines as the modification date of the
    // page — not "when someone last re-read the facts". It moved to the 11th
    // because that is when the page gained its byline and dates, which is a
    // change a reader can see.
    publishedAt: '2026-08-01',
    updatedAt: '2026-08-16',
    sections: [
        {
            id: 'format',
            h2: 'The format you are practising for',
            paras: [
                'The ESAT is computer-based and sat at a Pearson VUE test centre. It is built from separate 40-minute modules, each containing 27 multiple-choice questions, and you sit your modules back to back on the day.',
                'Everyone takes Mathematics 1. Which further modules you take depends on the course you have applied to, and you will normally sit two or three modules in total — so around 80 to 120 minutes of testing.',
                'There is no calculator and no dictionary. There is also no negative marking: you do not lose marks for a wrong answer, so leaving a question blank is never better than guessing.',
                'Each module is scored separately and reported on a scale from 1 (low) to 9 (high), to one decimal place. There is no pass mark and no published cut-off — universities read the score alongside the rest of your application.',
            ],
            // Dates, deadlines and fees now live on one page that is updated
            // each cycle, rather than on three that drift apart.
            links: [
                {
                    path: '/guides/esat-dates',
                    label: 'ESAT dates and registration',
                    note: 'Test dates, booking deadlines, fees and registration steps, updated each cycle.',
                },
            ],
            table: {
                caption: 'Modules by course (2026 entry)',
                head: ['Course', 'Modules'],
                rows: [
                    ['Cambridge — Engineering', 'Maths 1, Maths 2, Physics'],
                    [
                        'Cambridge — Natural Sciences, Chemical Engineering & Biotechnology, Veterinary Medicine',
                        'Maths 1, plus two from Biology, Chemistry, Physics, Maths 2',
                    ],
                    [
                        'Imperial — Engineering (Aeronautics, Civil & Environmental, Electrical & Electronic, Mechanical) and Physics',
                        'Maths 1, Maths 2, Physics',
                    ],
                    [
                        'Imperial — Engineering (Chemical, Design)',
                        'Maths 1, Maths 2',
                    ],
                    ['Imperial — Life Sciences', 'Maths 1, Chemistry, Biology'],
                ],
            },
        },
        {
            id: 'how-to-use',
            h2: 'How to use a practice test properly',
            paras: [
                'Sitting a paper and marking it out of 27 tells you almost nothing you can act on. A score of 15 does not tell you whether you are losing marks to shaky algebra, to misreading multi-step questions, or simply to running out of time.',
                'The more useful approach is to treat the first paper as a diagnostic rather than a rehearsal. Sit it under real conditions, then look at the pattern: which skills the wrong answers cluster around, and how long you spent on the questions you got wrong.',
                'Every JomExam diagnostic produces exactly that — a per-skill breakdown with your timing on each question, and for each wrong answer the specific misconception that answer represents. Not "you found mechanics hard", but the particular faulty step you took.',
            ],
        },
        {
            id: 'mini-tests',
            h2: 'Short on time? Start with a mini test',
            paras: [
                'Not everyone has 40 uninterrupted minutes on a Tuesday. Each subject has a mini test: ten questions in fifteen minutes, at the same 90-seconds-a-question pace as the real thing, with an indicative skills report at the end.',
                'Be clear about what ten questions can and cannot tell you. They will show you the pace, and they will usually surface your weakest skill. They cannot resolve every skill the way a full paper does — so treat the mini as the thermometer and the full diagnostic as the examination.',
            ],
        },
        {
            id: 'per-module',
            h2: 'Practice by module',
            paras: [
                'Mathematics 1 is compulsory for every candidate and is the foundation the other modules lean on, so it is the sensible place to start. Mathematics 2 goes further into calculus, trigonometry, and exponentials and logarithms. Physics, Chemistry and Biology each test applied, multi-step reasoning rather than recall.',
                'Set A of every module is free to sit. There is no trick to it: sit one, read the report, and you will know where you stand before you spend months revising.',
            ],
        },
    ],
    // Five questions, down from seven. The how-long / calculator /
    // negative-marking answers were cut because the format section three
    // paragraphs above IS the canonical answer, and an FAQ restating it is
    // the same duplication in a smaller font. The dates FAQ moved wholesale
    // to the dates page.
    faq: [
        {
            q: 'Are there official ESAT past papers?',
            a: 'Yes — and you should use them before anything written by a prep company, ours included. What exists, what each kind of paper is for, and what to do when they run out is on the ESAT past papers and specimen papers guide.',
            link: {
                label: 'Official ESAT preparation materials (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/prepare/',
            },
        },
        {
            q: 'What score do I need to pass the ESAT?',
            a: 'There is no pass mark, and no university publishes a cut-off. A score is only meaningful relative to everyone else who sat that year, so a figure that was competitive one cycle may not be the next. Because there is no threshold to clear, the useful question is not "what score do I need" but "which modules am I losing marks in, and why" — which is what a diagnostic answers and a raw score does not.',
            link: {
                label: 'How ESAT results are reported (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
            },
        },
        {
            q: 'When is the ESAT sat?',
            a: 'Two sittings a year, October and January, with Oxford and Cambridge applicants required to sit October. Dates, deadlines and fees are on the ESAT dates and registration page, which is updated each cycle.',
        },
        {
            q: "I don't have 40 minutes — is there a shorter test?",
            a: 'Yes: each subject has a mini test of ten questions in fifteen minutes, at the real pace, with a short report. It is the right first step if you are new to the format; the full paper is the right second one.',
        },
        {
            q: 'Are the JomExam ESAT practice tests free?',
            a: 'Set A of every module is free to sit, including the full skills report. Further sets are part of the Season Pass.',
        },
    ],
    // Three contextual links rather than every other guide: what a reader of
    // this page most plausibly wants next.
    related: [
        {
            path: '/guides/esat-past-papers',
            blurb: 'what official material exists and what each paper is for.',
        },
        {
            path: '/guides/esat-dates',
            blurb: 'sittings, deadlines and fees, updated each cycle.',
        },
        {
            path: '/guides/esat-maths-1',
            blurb: 'the compulsory module, with worked questions.',
        },
    ],
    /** Verified against these primary sources; re-check each cycle. */
    sources: [
        {
            label: 'UAT-UK (the official ESAT body)',
            url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
        },
        {
            label: 'University of Cambridge — ESAT',
            url: 'https://www.undergraduate.study.cam.ac.uk/apply/how/science-engineering-admission-test',
        },
        {
            label: 'Imperial College London — ESAT',
            url: 'https://www.imperial.ac.uk/study/apply/undergraduate/process/admissions-tests/esat/',
        },
    ],
}
