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
    updatedAt: '2026-08-16',
    sections: [
        {
            id: 'sittings',
            h2: 'Sittings for 2026–27 entry',
            paras: [
                'If you are applying to Oxford or Cambridge, the October window is not a choice — book it, and book early, because seats are allocated by test centre and they fill.',
            ],
            table: {
                caption:
                    'ESAT test windows, booking deadlines and eligibility for 2026–27 entry',
                head: ['', 'October sitting', 'January sitting'],
                rows: [
                    ['Test window', '12–16 October 2026', '4–8 January 2027'],
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
            a: 'October if Oxford or Cambridge is on your form — it is required. Otherwise check what your course accepts, and remember that an October sitting leaves January free as a fallback only where the course accepts January scores.',
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
    ],
}
