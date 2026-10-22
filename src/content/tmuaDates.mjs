/**
 * Content for the TMUA dates and registration guide.
 *
 * The canonical home for everything time-sensitive about the TMUA, and a
 * separate page from the ESAT one rather than a shared "admissions dates"
 * page — the two tests share a booking system and a fee but not their
 * restricted days: ESAT candidates in China, Hong Kong and Macau sit on
 * 12 or 13 October, TMUA candidates on 15 or 16. A merged page would put two
 * conflicting rows next to each other and invite reading the wrong one.
 *
 * Update twice a cycle and bump updatedAt each time. Every fact here is
 * repeated from UAT-UK and the page tells readers to confirm against them,
 * because these move and we are not the authority.
 */

export const GUIDE = {
    path: '/guides/tmua-dates',
    title: 'TMUA Dates, Deadlines and Registration 2026–27 | JomExam',
    description:
        'TMUA test dates for 2026–27 entry, booking deadlines, fees, and how to register — one page, kept current each cycle.',
    eyebrow: 'TMUA guide',
    ctaPath: '/diagnostics/tmua',
    ctaLabel: 'Sit a free TMUA paper →',
    h1: 'TMUA dates and registration',
    standfirst:
        'Everything time-sensitive about the TMUA lives on this page, and nowhere else on this site. Dates move each cycle — confirm anything you are about to rely on against the official source.',
    publishedAt: '2026-08-17',
    updatedAt: '2026-10-22',
    sections: [
        {
            id: 'sittings',
            h2: 'Sittings for 2026–27 entry',
            paras: [
                'The October 2026 sitting has finished. The next, and last, sitting for 2026–27 entry is 4–8 January 2027. Booking opens on 26 October 2026 at 3pm UK time and closes on 21 December 2026 at 6pm.',
                'January is for courses that accept it. Imperial and LSE both say either sitting is acceptable. Oxford and Cambridge required October, except for two narrow groups who can sit in January: mature applicants to a Cambridge mature college with a January admissions deadline, and Oxford Astrophoria Foundation Year applicants.',
                'Note the deadline that comes before the deadline: access arrangements must be requested through UAT-UK before you book. For January, requests close on 7 December 2026 at 6pm UK time, two weeks before booking does.',
                'Starting early, for 2027–28 entry? UAT-UK publishes the next cycle’s dates; check there before planning around them.',
            ],
            table: {
                caption:
                    'TMUA test windows, booking deadlines and eligibility for 2026–27 entry',
                head: ['', 'October sitting (finished)', 'January sitting (next)'],
                rows: [
                    ['Test window', '12–16 October 2026', '4–8 January 2027'],
                    ['Booking opens', '20 July 2026, 3pm', '26 October 2026, 3pm UK time'],
                    [
                        'Access arrangements requested by',
                        '14 September 2026, 6pm',
                        '7 December 2026, 6pm UK time',
                    ],
                    [
                        'Booking deadline',
                        '28 September 2026, 6pm BST',
                        '21 December 2026, 6pm GMT',
                    ],
                    [
                        'Who must take it',
                        'Oxford and Cambridge applicants, with two exceptions above',
                        'Other courses, where accepted',
                    ],
                    [
                        'China, Hong Kong, Macau',
                        '15 or 16 October only',
                        '8 January only',
                    ],
                ],
            },
        },
        {
            id: 'how-to-register',
            h2: 'How to register',
            paras: [
                'You register yourself; your school will not do it for you.',
                'Create a UAT-UK account and select the TMUA to generate your Test Card. Then book a seat at a Pearson VUE test centre through that account. Seats are allocated by centre, so the popular ones fill well before the deadline.',
                'Enter your name, date of birth and UCAS ID exactly as they appear in your UCAS Hub. Your score is matched to your application by those details.',
            ],
        },
        {
            id: 'fees',
            h2: 'Fees',
            paras: [
                '£78 at test centres in the UK and the Republic of Ireland; £133 elsewhere. The fee follows the test centre’s location, not your nationality. Eligible UK candidates can apply for a full-fee bursary, which must be approved before booking.',
            ],
        },
    ],
    faq: [
        {
            q: 'Can my school register me for the TMUA?',
            a: 'No — TMUA registration is done by the candidate, through a UAT-UK account and a Pearson booking. Do not wait for a teacher to arrange it.',
        },
        {
            q: 'I sit my school exams with extra time — does that carry over?',
            a: 'Not automatically. Access arrangements must be applied for through UAT-UK with evidence, and their deadline comes before the booking deadline — for the January sitting it is 7 December 2026, a fortnight before booking closes, which is the gap that catches people.',
        },
        {
            q: 'Which sitting should I take?',
            a: 'For 2026–27 entry, January 2027 is the only sitting left, and it counts only for courses that accept it — Oxford and Cambridge required October, with the two exceptions above. Check what each of your courses accepts before you book. If you are applying for 2027–28 entry, check UAT-UK for that cycle’s sittings.',
            link: {
                label: 'Official TMUA dates and deadlines (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/',
            },
        },
    ],
    related: [
        {
            path: '/guides/tmua-practice-tests',
            blurb: 'the format, scoring, and free timed practice.',
        },
        {
            path: '/guides/esat-dates',
            blurb: 'the equivalent page for the ESAT, with its own restricted days.',
        },
    ],
    sources: [
        {
            label: 'Official TMUA dates and deadlines (UAT-UK)',
            url: 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/',
        },
        {
            label: 'UAT-UK registration',
            url: 'https://esat-tmua.ac.uk/register/',
        },
        {
            label: 'TMUA at Imperial: courses and dates',
            url: 'https://www.imperial.ac.uk/study/apply/undergraduate/process/admissions-tests/tmua',
        },
        {
            label: 'TMUA at LSE: programmes and dates',
            url: 'https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/How-to-Apply/Test-of-Mathematics-for-University-Admission-TMUA',
        },
    ],
}
