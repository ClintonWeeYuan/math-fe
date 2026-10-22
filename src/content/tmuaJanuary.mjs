/**
 * The TMUA for students sitting in January 2027.
 *
 * Written on 22 October 2026, after the October sittings. Oxford and
 * Cambridge required October, so the January TMUA is for Imperial (Computing,
 * Mathematics, and Economics, Finance and Data Science) and LSE (Economics and
 * Econometrics & Mathematical Economics, plus eight programmes where it is
 * recommended), among others. Both say either sitting is acceptable.
 *
 * Every fact is from Imperial's or LSE's own TMUA page or UAT-UK (see
 * sources), as at 22 October 2026. UAT-UK lists further universities that use
 * the TMUA; their course pages were not checked, so the page names them only
 * as "check your course page". Update or retire this page after the January
 * sitting.
 */

export const GUIDE = {
    path: '/guides/tmua-january',
    title: 'TMUA in January 2027: Imperial, LSE and the Dates | JomExam',
    description:
        'Sitting the TMUA in January 2027? Which Imperial and LSE courses need it, the January dates and deadlines, and a plan for the weeks before the test.',
    eyebrow: 'TMUA guide',
    ctaPath: '/diagnostics/tmua',
    ctaLabel: 'Sit a free TMUA paper →',
    h1: 'The TMUA in January 2027',
    standfirst:
        'The October sitting is over. For Imperial and LSE, January is still open: both say either sitting is acceptable. This page covers which courses need the TMUA, the January dates, and how to use the weeks before the test.',
    publishedAt: '2026-10-22',
    updatedAt: '2026-10-22',
    sections: [
        {
            id: 'who',
            h2: 'Who sits the TMUA in January',
            paras: [
                'Imperial requires the TMUA for its Department of Computing (including joint Mathematics and Computer Science), its Department of Mathematics, and BSc Economics, Finance and Data Science. Imperial says you can choose to sit the test in either October or January.',
                'LSE requires the TMUA for BSc Economics and BSc Econometrics and Mathematical Economics, and recommends it for eight further programmes: Mathematics and Economics, Mathematics with Economics, Financial Mathematics and Statistics, Mathematics with Data Science, Mathematics, Statistics and Business, Data Science, Economics and Data Science, and Actuarial Science. LSE says either sitting is acceptable.',
                'Other universities use the TMUA for some courses too. If yours is not Imperial or LSE, check your course page for whether it accepts the January sitting.',
                'Oxford and Cambridge required October, apart from two narrow groups: mature applicants to a Cambridge mature college with a January deadline, and Oxford Astrophoria Foundation Year applicants.',
                'You sit the TMUA once in a cycle: only your first test score is considered, and January 2027 is the last chance to sit it for 2027 entry.',
            ],
        },
        {
            id: 'dates',
            h2: 'The January 2027 dates',
            paras: [
                'If you need access arrangements, such as extra time, request them first: those requests close two weeks before booking does. UK candidates applying for a bursary must apply and have it confirmed before booking.',
            ],
            table: {
                caption: 'TMUA January 2027 sitting: key dates (UK time)',
                head: ['What', 'When'],
                rows: [
                    ['Booking opens', '26 October 2026, 3pm'],
                    ['Access arrangement requests close', '7 December 2026, 6pm'],
                    ['Booking closes', '21 December 2026, 6pm'],
                    ['Test window', '4–8 January 2027'],
                    ['China, Hong Kong and Macau', '8 January 2027 only'],
                    ['Results', 'About six weeks after your test'],
                ],
            },
            links: [
                {
                    path: '/guides/tmua-dates',
                    label: 'TMUA dates and registration',
                    note: 'Both sittings, fees and how to register.',
                },
            ],
        },
        {
            id: 'plan',
            h2: 'A plan for the weeks before the test',
            paras: [
                'From late October there are about ten weeks. The TMUA is two papers of 20 questions in 75 minutes each, and they test different things: Paper 1 asks you to apply mathematics you know, Paper 2 asks you to reason about it. Plan for both from the start.',
                'Weeks 1–2: start with the short mini test for each paper, then one full paper of each, timed. Read the reports: which topics cost you marks on Paper 1, and which kinds of reasoning on Paper 2.',
                'Weeks 3–8: alternate the papers, one or two a week. After each, read the worked solution to every question you got wrong or found slow, and try them again a day or two later without notes. For Paper 2, the logic itself (conditions, quantifiers, spotting the flaw in an argument) improves fastest with practice.',
                'Weeks 9–10: both papers back to back, timed, as on the day. There is no negative marking, so practise moving on: when a question is taking too long, pick your best answer, flag it and come back if there is time.',
                'JomExam’s mini test and Set A of each paper are free, with a report that names the skill to work on first. The TMUA Season Pass opens every paper until the end of January.',
            ],
        },
    ],
    faq: [
        {
            q: 'Do Imperial and LSE accept the January TMUA?',
            a: 'Yes. Imperial says you can choose to sit the test in either October or January, and LSE says either sitting is acceptable for applicants to LSE. Only your first test score counts.',
        },
        {
            q: 'Is January my last chance?',
            a: 'Yes for 2027 entry: Imperial’s page says the last chance to sit the test for 2027 entry is January 2027. Book before 21 December.',
        },
        {
            q: 'Which LSE courses need the TMUA?',
            a: 'It is required for BSc Economics and BSc Econometrics and Mathematical Economics, and recommended but not required for eight further programmes, listed above.',
        },
    ],
    related: [
        { path: '/guides/tmua-dates', blurb: 'both sittings, fees and how to register.' },
        { path: '/guides/tmua-practice-tests', blurb: 'the format, scoring, and free timed practice.' },
        { path: '/guides/tmua-past-papers', blurb: 'how to use the official past papers.' },
    ],
    sources: [
        {
            label: 'TMUA at Imperial: courses and dates',
            url: 'https://www.imperial.ac.uk/study/apply/undergraduate/process/admissions-tests/tmua',
        },
        {
            label: 'TMUA at LSE: programmes and dates',
            url: 'https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/How-to-Apply/Test-of-Mathematics-for-University-Admission-TMUA',
        },
        {
            label: 'Official TMUA information (UAT-UK)',
            url: 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/',
        },
    ],
}
