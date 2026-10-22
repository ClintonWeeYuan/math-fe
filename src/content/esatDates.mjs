/**
 * Content for the ESAT dates and registration guide.
 *
 * The canonical home for everything time-sensitive about the ESAT. Dates,
 * booking deadlines and fees were previously restated on three different
 * pages, which meant three places to update each cycle and three chances to
 * leave a stale deadline live. Every other guide now links here instead.
 *
 * This is also the one page on the site with a genuine reason to change
 * twice a year, which is a freshness signal the rest of the guides cannot
 * honestly produce — and "esat dates 2026" and "esat registration deadline"
 * are queries the old pages only half-answered.
 *
 * Update it twice a cycle and bump updatedAt each time. Every fact below is
 * repeated from UAT-UK and the page tells readers to confirm against them,
 * because these move and we are not the authority.
 */

export const GUIDE = {
    path: '/guides/esat-dates',
    title: 'ESAT Dates, Deadlines and Registration 2026–27 | JomExam',
    description:
        'ESAT test dates for 2026–27 entry, booking deadlines, fees, and how to register — one page, kept current each cycle.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free ESAT paper →',
    h1: 'ESAT dates and registration',
    standfirst:
        'Everything time-sensitive about the ESAT lives on this page, and nowhere else on this site. Dates move each cycle — confirm anything you are about to rely on against the official source.',
    publishedAt: '2026-08-16',
    updatedAt: '2026-10-22',
    sections: [
        {
            id: 'sittings',
            h2: 'Sittings for 2026–27 entry',
            paras: [
                'The October 2026 sitting has finished. The next, and last, sitting for 2026–27 entry is 4–8 January 2027. Booking opens on 26 October 2026 at 3pm UK time and closes on 21 December 2026 at 6pm. Seats are allocated by test centre and the popular ones fill, so book early.',
                'If you need access arrangements, such as extra time, request them first: for January, requests close on 7 December 2026 at 6pm UK time, two weeks before booking does.',
                'January counts only where your course accepts it. Oxford and Cambridge required the October sitting. Imperial, which uses the ESAT for eight departments, says you can choose to sit the test in either October or January. Check each of your other universities before you book.',
                'Starting early, for 2027–28 entry? UAT-UK publishes the next cycle’s dates; check there before planning around them.',
            ],
            table: {
                caption:
                    'ESAT test windows, booking deadlines and eligibility for 2026–27 entry',
                head: ['', 'October sitting (finished)', 'January sitting (next)'],
                rows: [
                    ['Test window', '12–16 October 2026', '4–8 January 2027'],
                    ['Booking opens', '—', '26 October 2026, 3pm UK time'],
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
                        'Oxford and Cambridge applicants',
                        'Other courses, where accepted',
                    ],
                    [
                        'China, Hong Kong, Macau',
                        '12 or 13 October only',
                        '6 January only',
                    ],
                ],
            },
        },
        {
            id: 'how-to-register',
            h2: 'How to register',
            paras: [
                'You register yourself; your school will not do it for you.',
                'Create a UAT-UK account, then book a seat at a Pearson VUE test centre through that account. If you are in the UK and cannot find a test within 40 miles of your postcode, contact Pearson Customer Services.',
            ],
        },
        {
            id: 'fees',
            h2: 'Fees',
            paras: [
                '£78 at test centres in the UK and the Republic of Ireland; £133 elsewhere. The fee follows the test centre’s location, not your nationality.',
            ],
        },
    ],
    faq: [
        {
            q: 'Can my school register me for the ESAT?',
            a: 'No — ESAT registration is done by the candidate, through a UAT-UK account and a Pearson booking. Do not wait for a teacher to arrange it.',
        },
        {
            q: 'Is the ESAT different in different countries?',
            a: 'The test itself is identical everywhere. What differs by location: the available days within each window (restricted in China, Hong Kong and Macau), the fee, and seat availability.',
        },
        {
            q: 'Which sitting should I take?',
            a: 'For 2026–27 entry, January 2027 is the only sitting left, and it counts only for courses that accept it — Oxford and Cambridge required October. Check what each of your courses accepts before you book. If you are applying for 2027–28 entry, check UAT-UK for that cycle’s sittings and which one your universities require.',
            link: {
                label: 'Official ESAT dates and registration (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
            },
        },
    ],
    sources: [
        {
            label: 'Official ESAT dates and registration (UAT-UK)',
            url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
        },
        {
            label: 'ESAT preparation materials (UAT-UK)',
            url: 'https://esat-tmua.ac.uk/prepare/',
        },
        {
            label: 'ESAT at Imperial: courses, modules and dates',
            url: 'https://www.imperial.ac.uk/study/apply/undergraduate/process/admissions-tests/esat/',
        },
    ],
}
