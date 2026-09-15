/**
 * Content for the TMUA past-papers guide.
 *
 * The TMUA counterpart to /guides/esat-past-papers, and the same honest
 * answer to the same search: what official material exists, what it is good
 * for, and what to use once it runs out. It is not a page of papers — we do not
 * host official ones and must not read as if we do.
 *
 * The difference from the ESAT page is depth, and the tone leans into that:
 * the TMUA has a real back catalogue, which is good news for a student and
 * worth saying plainly.
 *
 * Facts checked against UAT-UK on 15 September 2026:
 *   - esat-tmua.ac.uk/tmua-preparation-materials/ lists Paper 1 and Paper 2
 *     for every year 2016–2023, plus early specimen papers 1 and 2, each with
 *     worked answers and an answer key.
 *   - The same page: "Although the TMUA is now computer-based, both the
 *     content specification and question style are unchanged".
 *   - esat-tmua.ac.uk/prepare/ links the specification, Notes on Logic and
 *     Proof for Paper 2, and specimen and practice tests via Pearson VUE.
 * No history beyond what those pages state (when the test began, who ran it
 * before UAT-UK) is claimed, because they do not state it.
 */

export const GUIDE = {
    path: '/guides/tmua-past-papers',
    title: 'TMUA Past Papers, Specimen Papers and Practice Papers | JomExam',
    description:
        'Every official TMUA past paper from 2016 to 2023, with worked answers — what each is for, whether the older papers still count now the test is computer-based, and free timed practice papers for when they run out.',
    eyebrow: 'TMUA guide',
    ctaPath: '/diagnostics/tmua',
    ctaLabel: 'Sit a free TMUA paper →',
    h1: 'TMUA past papers and specimen papers',
    standfirst:
        'Good news: the TMUA has a proper back catalogue. Every paper from 2016 to 2023 is free from UAT-UK, each with worked answers. Here is what is there, how to use it well, and what to try once you have worked through it.',
    publishedAt: '2026-09-15',
    updatedAt: '2026-09-15',
    sections: [
        {
            id: 'what-exists',
            h2: 'What official TMUA papers exist',
            paras: [
                'UAT-UK, which runs the test, publishes Paper 1 and Paper 2 from every year between 2016 and 2023, plus two early specimen papers. Each comes with an answer key and fully worked answers, so you can see not just what went wrong, but why.',
                'Pearson also offers specimen and practice tests in the on-screen format you will sit on the day. Start with the official material, and sit it timed: nothing else is written by the people who write the real test.',
            ],
            external: [
                {
                    url: 'https://esat-tmua.ac.uk/tmua-preparation-materials/',
                    label: 'TMUA past papers with worked answers (UAT-UK)',
                    note: 'Paper 1 and Paper 2 from 2016 to 2023, plus the early specimen papers.',
                },
                {
                    url: 'https://esat-tmua.ac.uk/prepare/',
                    label: 'Official TMUA preparation materials (UAT-UK)',
                    note: 'The content specification, Notes on Logic and Proof for Paper 2, and the practice tests.',
                },
                {
                    url: 'https://www.pearsonvue.com/us/en/uatuk.html',
                    label: 'Specimen and practice tests (Pearson VUE)',
                    note: 'Practise in the same on-screen format as the real test.',
                },
            ],
        },
        {
            id: 'why-more',
            h2: 'Why there is more TMUA material than ESAT',
            paras: [
                'TMUA papers go back to 2016, so there are eight years of real papers to learn from. The ESAT replaced the ENGAA and NSAA only recently, which is why its shelf is so much emptier.',
                'That is a genuine advantage: plenty of practice at exactly the right standard. It is not endless, though. Sixteen papers go quickly once you are sitting two at a time, so it pays to use them thoughtfully.',
            ],
        },
        {
            id: 'old-vs-new',
            h2: 'Do the older papers still count?',
            paras: [
                'Yes. The older papers were sat on paper, and today’s TMUA is taken on a computer, but UAT-UK confirms the content specification and question style have not changed. The archive is still excellent practice.',
                'The one thing worth adding is a practice test on screen before the day, so the format feels familiar and none of your attention goes on the interface.',
            ],
            links: [
                {
                    path: '/guides/tmua-practice-tests',
                    label: 'TMUA practice tests guide',
                    note: 'The current format and scoring, stated once and kept current there.',
                },
            ],
        },
        {
            id: 'which-paper-when',
            h2: 'Which papers to use, and when',
            paras: [
                'Begin with the early specimen papers, untimed, to learn how the questions work. Then sit the older years under real timing, 75 minutes per paper, and go through the worked answers carefully afterwards. That review is where most of the learning happens.',
                'Keep the two most recent years back for the final weeks. That way you still have a fresh, honest check on where you are when it matters most.',
            ],
            table: {
                caption: 'What each kind of TMUA material is good for and where it comes from',
                head: ['Material', 'Comes from', 'Best used for'],
                rows: [
                    [
                        'Early specimen papers',
                        'UAT-UK',
                        'Learning the question style, without the clock',
                    ],
                    [
                        'Past papers, 2016–2023',
                        'UAT-UK archive',
                        'Timed practice at the real standard, with worked answers to learn from',
                    ],
                    [
                        'Practice tests',
                        'Pearson VUE, for UAT-UK',
                        'Getting comfortable with the on-screen format',
                    ],
                ],
            },
        },
        {
            id: 'after-the-papers',
            h2: 'What to do once the official papers are gone',
            paras: [
                'By then, another score out of 20 will not tell you much. What helps is knowing which kind of question keeps costing you marks, so your last weeks go on exactly that.',
                'That is what our TMUA papers are for: the real format, a skills report, and the reasoning slip behind every wrong answer named. Set A of each paper is free.',
            ],
            links: [
                {
                    path: '/tmua-paper-1-practice-test',
                    label: 'TMUA Paper 1 practice test',
                    note: 'A free timed paper in the real format, with a skills report.',
                },
                {
                    path: '/tmua-paper-2-practice-test',
                    label: 'TMUA Paper 2 practice test',
                    note: 'The reasoning paper, free, with the logical error behind each wrong answer named.',
                },
            ],
        },
    ],
    faq: [
        {
            q: 'Where can I download official TMUA past papers?',
            a: 'Free from UAT-UK, which runs the test. Every paper from 2016 to 2023 is there, each with worked answers.',
            link: {
                label: 'TMUA past papers (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/tmua-preparation-materials/',
            },
        },
        {
            q: 'Are old TMUA papers still useful now the test is computer-based?',
            a: 'Yes. UAT-UK confirms the content specification and question style are unchanged, so the older papers are still great practice. Try one practice test on screen too, so the format feels familiar on the day.',
        },
        {
            q: 'How many TMUA past papers are there?',
            a: 'Sixteen from 2016 to 2023 (Paper 1 and Paper 2 for each year), plus two early specimen papers, all with worked answers.',
        },
    ],
    related: [
        {
            path: '/guides/tmua-practice-tests',
            blurb: 'what each paper tests, the format and a free timed paper for both.',
        },
        {
            path: '/guides/tmua-dates',
            blurb: 'sittings, deadlines and fees, updated each cycle.',
        },
        {
            path: '/guides/esat-past-papers',
            blurb: 'the equivalent for the ESAT, where far less exists.',
        },
    ],
    sources: [
        {
            label: 'UAT-UK — TMUA past papers',
            url: 'https://esat-tmua.ac.uk/tmua-preparation-materials/',
        },
        {
            label: 'UAT-UK — preparation materials',
            url: 'https://esat-tmua.ac.uk/prepare/',
        },
        {
            label: 'UAT-UK — TMUA',
            url: 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/',
        },
    ],
}
