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
        'Free ESAT practice tests for Maths 1, Maths 2, Physics, Chemistry and Biology — 27 questions in 40 minutes, matching the real format. Sit one and get a skills report showing exactly what to work on.',
    h1: 'ESAT practice tests',
    standfirst:
        'Start with the official specimen papers — then the problem becomes what to do next, because the ESAT is new and the back catalogue is shallow. This guide explains what the test actually asks of you, and gives you a timed paper for every module: free, and with a report naming the specific skills to fix rather than just a mark.',
    sections: [
        {
            id: 'what-practice-exists',
            h2: 'What ESAT practice actually exists',
            paras: [
                'UAT-UK publishes official preparation material, and it should be the first thing you use: a content specification setting out exactly what can be assessed, an ESAT guide to the underlying maths and science, specimen and practice tests through Pearson, and an archive of past papers.',
                'What the ESAT does not have is depth. It replaced the older ENGAA and NSAA tests only recently, so there is nothing like the twenty-year back catalogue you would get with an A-level subject — and once you have sat the official papers under timed conditions, they are spent.',
                'That scarcity changes what good preparation looks like. Rather than hoarding papers to sit near the exam, the useful move early on is to find out which skills are actually weak, fix those, and keep a paper or two in reserve for timed rehearsal later.',
                'Every JomExam diagnostic is written to the real format — 27 multiple-choice questions in 40 minutes, no calculator — so the timing pressure you feel in practice is the timing pressure on the day.',
            ],
        },
        {
            id: 'format',
            h2: 'The format you are practising for',
            paras: [
                'The ESAT is computer-based and sat at a Pearson VUE test centre. It is built from separate 40-minute modules, each containing 27 multiple-choice questions, and you sit your modules back to back on the day.',
                'Everyone takes Mathematics 1. Which further modules you take depends on the course you have applied to, and you will normally sit two or three modules in total — so around 80 to 120 minutes of testing.',
                'There is no calculator and no dictionary. There is also no negative marking: you do not lose marks for a wrong answer, so leaving a question blank is never better than guessing.',
                'Each module is scored separately and reported on a scale from 1 (low) to 9 (high), to one decimal place. There is no pass mark and no published cut-off — universities read the score alongside the rest of your application.',
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
            id: 'per-module',
            h2: 'Practice by module',
            paras: [
                'Mathematics 1 is compulsory for every candidate and is the foundation the other modules lean on, so it is the sensible place to start. Mathematics 2 goes further into calculus, logic and proof. Physics, Chemistry and Biology each test applied, multi-step reasoning rather than recall.',
                'Set A of every module is free to sit. There is no trick to it: sit one, read the report, and you will know where you stand before you spend months revising.',
            ],
        },
    ],
    faq: [
        {
            q: 'Are there official ESAT past papers?',
            a: 'Yes — UAT-UK publishes a content specification, an ESAT guide, specimen and practice tests through Pearson, and an archive of past papers. Use them first. The catch is depth: the ESAT only replaced the ENGAA and NSAA recently, so there is no twenty-year back catalogue, and once you have sat the official papers under timed conditions you cannot un-see them.',
            link: {
                label: 'Official ESAT preparation materials (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/prepare/',
            },
        },
        {
            q: 'How long is the ESAT?',
            a: 'Each module is 40 minutes and contains 27 multiple-choice questions. You sit two or three modules depending on your course, so the test runs about 80 to 120 minutes in total.',
        },
        {
            q: 'Can I use a calculator in the ESAT?',
            a: 'No. No calculator or dictionary is allowed, which is why every JomExam diagnostic is written to be answered without one.',
        },
        {
            q: 'Is there negative marking in the ESAT?',
            a: 'No. You do not lose marks for a wrong answer, so you should never leave a question blank — an educated guess costs nothing.',
        },
        {
            q: 'What score do I need to pass the ESAT?',
            a: 'There is no pass mark, and no university publishes a cut-off. Each module is reported separately on a scale from 1 (low) to 9 (high), to one decimal place, and UAT-UK states that scores are used alongside the rest of your application — your predicted grades, personal statement and, at Cambridge, your interview. Two things follow. A score is only meaningful relative to everyone else who sat the test that year, so a figure that was competitive one cycle may not be the next. And because there is no threshold to clear, the useful question is not "what score do I need" but "which modules am I losing marks in, and why" — which is what a diagnostic answers and a raw score does not.',
            link: {
                label: 'How ESAT results are reported (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
            },
        },
        {
            q: 'When is the ESAT sat, and does it differ for international students?',
            a: 'There are two sittings: 12–16 October 2026 and 4–8 January 2027. If you are applying to Cambridge or Oxford you must sit the October window. Booking for October closes 28 September 2026 (6pm BST); the January deadline is 21 December 2026 (6pm GMT). You register yourself — create a UAT-UK account, then book a seat through Pearson — as your school will not do it for you. The test itself is identical wherever you sit it, but three things differ by location. Candidates in China, Hong Kong and Macau are restricted to specific days within each window (12 or 13 October, and 6 January). The fee is £78 at test centres in the UK and the Republic of Ireland and £133 elsewhere, and it is set by the test centre\'s location rather than your nationality. And while Pearson VUE has centres in over 180 countries, seats fill: book early, and if you are in the UK and cannot find a test within 40 miles of your postcode, contact Pearson Customer Services. Confirm every date on the official site before you rely on it — they move each cycle.',
            link: {
                label: 'Official ESAT dates and registration (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/register/',
            },
        },
        {
            q: 'Are the JomExam ESAT practice tests free?',
            a: 'Set A of every module is free to sit, including the full skills report. Further sets are part of the Season Pass.',
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
