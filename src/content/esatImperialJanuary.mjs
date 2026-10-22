/**
 * The ESAT for Imperial applicants sitting in January 2027.
 *
 * Written on 22 October 2026, after the October sittings, when traffic to the
 * general guides had dropped away. Oxford and Cambridge applicants had to sit
 * in October, so the January ESAT is mostly Imperial's: eight departments use
 * it, and Imperial says you can sit in either window. Students searching now
 * are asking "can I still do this in January, what do I need, and when", and
 * no page here answered that directly.
 *
 * Every fact is from Imperial's own ESAT page or UAT-UK (see sources), as at
 * 22 October 2026. The module table is Imperial's for 2027 entry. Update or
 * retire this page after the January sitting.
 */

export const GUIDE = {
    path: '/guides/esat-imperial-january',
    title: 'ESAT for Imperial: the January 2027 Sitting | JomExam',
    description:
        'Sitting the ESAT in January for Imperial? Which departments use it, the modules each one needs, the January 2027 dates, and a plan for the weeks before the test.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free ESAT paper →',
    h1: 'ESAT for Imperial: the January 2027 sitting',
    standfirst:
        'The October sitting is over, but if you are applying to Imperial, January is still open: Imperial says you can sit the ESAT in either October or January. This page covers which Imperial courses need the ESAT, the modules each one asks for, the January dates, and how to use the weeks before the test.',
    publishedAt: '2026-10-22',
    updatedAt: '2026-10-22',
    sections: [
        {
            id: 'is-january-for-you',
            h2: 'Is January right for you?',
            paras: [
                'Imperial uses the ESAT for eight departments: Aeronautics, Chemical Engineering, Civil and Environmental Engineering, the Dyson School of Design Engineering, Electrical and Electronic Engineering, Life Sciences, Mechanical Engineering, and Physics. If you are applying to one of them, you must take the ESAT.',
                'Imperial says you can choose to sit the test in either October or January. Only your first test score is considered, so you sit it once in a cycle.',
                'If you are also applying to Oxford or Cambridge, they required the October sitting, so a January score will not count for them. For Imperial alone, January is a normal choice.',
            ],
        },
        {
            id: 'modules',
            h2: 'Which modules Imperial asks for',
            paras: [
                'Everyone sits Mathematics 1. The other modules depend on the department. You choose your modules when you book, and you cannot change them on test day, so check this before you book.',
            ],
            table: {
                caption: 'ESAT modules by Imperial department, 2027 entry',
                head: ['Department', 'Modules'],
                rows: [
                    ['Aeronautics', 'Maths 1, Maths 2, Physics'],
                    ['Chemical Engineering', 'Maths 1, Maths 2, Chemistry'],
                    ['Civil and Environmental Engineering', 'Maths 1, Maths 2, Physics'],
                    ['Dyson School of Design Engineering', 'Maths 1, Maths 2'],
                    ['Electrical and Electronic Engineering', 'Maths 1, Maths 2, Physics'],
                    ['Life Sciences', 'Maths 1, Chemistry, Biology'],
                    ['Mechanical Engineering', 'Maths 1, Maths 2, Physics'],
                    ['Physics', 'Maths 1, Maths 2, Physics'],
                ],
            },
        },
        {
            id: 'dates',
            h2: 'The January 2027 dates',
            paras: [
                'The order matters. If you need access arrangements, such as extra time, request them first: those requests close two weeks before booking does.',
            ],
            table: {
                caption: 'ESAT January 2027 sitting: key dates (UK time)',
                head: ['What', 'When'],
                rows: [
                    ['Booking opens', '26 October 2026, 3pm'],
                    ['Access arrangement requests close', '7 December 2026, 6pm'],
                    ['Booking closes', '21 December 2026, 6pm'],
                    ['Test window', '4–8 January 2027'],
                    ['China, Hong Kong and Macau', '6 January 2027 only'],
                    ['Results', 'About four weeks after your test'],
                ],
            },
            links: [
                {
                    path: '/guides/esat-dates',
                    label: 'ESAT dates and registration',
                    note: 'Both sittings, fees and how to register.',
                },
            ],
        },
        {
            id: 'plan',
            h2: 'A plan for the weeks before the test',
            paras: [
                'From late October there are about ten weeks. The aim is to find out early which module and which skills cost you marks, spend most of the time there, and practise at the real pace so the clock is not a surprise.',
                'Weeks 1–2: sit one full paper in each of your modules, timed. Each paper is 27 questions in 40 minutes. Read the report for each: the skills that cost you marks, and which questions took you longest.',
                'Weeks 3–8: one or two papers a week, mostly in your weakest module. After each, read the worked solution to every question you got wrong or found slow, then try those questions again a day or two later without notes.',
                'Weeks 9–10: full timed papers in all your modules, back to back as on the day. Practise moving on: there is no negative marking, so when a question is taking too long, pick your best answer, flag it and come back if there is time.',
                'JomExam’s Set A of every module is free, with a report that names the skill to work on first. The ESAT Season Pass opens every paper until the end of January.',
            ],
        },
    ],
    faq: [
        {
            q: 'Does Imperial prefer the October sitting?',
            a: 'Imperial’s ESAT page says you can choose to sit the test in either October or January, and does not say one is preferred. Only your first score is considered.',
        },
        {
            q: 'Can I sit the ESAT in October and again in January?',
            a: 'No: only your first test score is considered, so sitting it twice does not give you a second chance. If you sat in October, that is the score Imperial will see.',
        },
        {
            q: 'Which ESAT modules do I need for Imperial?',
            a: 'Maths 1 for everyone, then it depends on the department: most engineering courses and Physics add Maths 2 and Physics; Chemical Engineering adds Maths 2 and Chemistry; Design Engineering adds Maths 2 only; Life Sciences adds Chemistry and Biology. The table above has all eight.',
        },
    ],
    related: [
        { path: '/guides/esat-dates', blurb: 'both sittings, fees and how to register.' },
        { path: '/guides/esat-practice-tests', blurb: 'the format, scoring, and free timed practice.' },
        { path: '/guides/esat-maths-1', blurb: 'the module everyone sits.' },
        { path: '/guides/esat-physics', blurb: 'for most Imperial engineering courses.' },
    ],
    sources: [
        {
            label: 'ESAT at Imperial: courses, modules and dates',
            url: 'https://www.imperial.ac.uk/study/apply/undergraduate/process/admissions-tests/esat/',
        },
        {
            label: 'Official ESAT information (UAT-UK)',
            url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
        },
    ],
}
