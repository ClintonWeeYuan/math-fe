/**
 * Content for the ESAT Mathematics 2 guide.
 *
 * Written in the vocabulary Search Console shows students using —
 * "questions", "papers" — rather than our own words for the same thing.
 *
 * What the module covers is described only to the level the official
 * content specification supports, with a link to it for the detail: the
 * specification is the authority and it is revised between cycles.
 *
 * The worked examples are written for this page in the style of the test.
 * Not taken from the official papers, which are not ours to republish, and
 * not from the diagnostic bank, which is the scored instrument — publishing
 * those with solutions would mean students meet them before they sit them.
 * Every numerical answer below has been worked by hand.
 */

export const GUIDE = {
    path: '/guides/esat-maths-2',
    title: 'ESAT Maths 2 Questions and Practice Papers | JomExam',
    description: 'What ESAT Mathematics 2 asks beyond Maths 1, where candidates lose marks, and worked ESAT Maths 2 questions with full solutions. Plus a free timed paper in the real format.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free Mathematics 2 paper →',
    h1: 'ESAT Mathematics 2 questions',
    standfirst: 'Mathematics 2 goes past the compulsory module into further calculus, logic and proof. It is the module most often required by the courses with the highest competition.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-12',
    sections: [
        {
            id: 'what-it-covers',
            h2: 'What Mathematics 2 covers',
            paras: [
                'Builds on Mathematics 1 with more demanding differentiation and integration, sequences and series pushed further, and — distinctively — questions that ask you to reason about a statement rather than only compute with it.',
                'Proof is the part candidates are least ready for: school maths rewards executing a method, and this module also rewards justifying one. Scope is set by the official content specification, which changes between cycles.',
            ],
        },
        {
            id: 'where-marks-go',
            h2: 'Where the marks actually go',
            paras: [
                'Two failures dominate. Stopping at a stationary point without establishing its nature, because the question said "find" and the marks were for "and determine".',
                'And proof by example: showing a statement holds for a few cases and treating that as an argument. A general proof needs a general object — an arbitrary n, not 2, 4 and 6.',
            ],
        },
        {
            id: 'worked-examples',
            h2: 'Mathematics 2 questions, worked through',
            paras: [
                'Written in the style of the test, not copied from an official paper. Give each one 90 seconds before reading the working.',
            ],
        },
        {
            id: 'after-the-papers',
            h2: 'Once the official papers run out',
            paras: [
                'There is not much official material and it goes quickly. After that, a score out of 27 tells you the result of the problem, not its cause.',
                'Our Mathematics 2 diagnostics are full timed papers in the real format, and the report names the skills that went wrong rather than handing you a number. Set A is free.',
            ],
        },
    ],
    workedExamples: [
        {
            id: 'stationary-points',
            module: 'Mathematics 2',
            question: 'Find the x-coordinates of the stationary points of y = x³ − 6x² + 9x + 1, and determine the nature of each.',
            steps: [
                'Differentiate: dy/dx = 3x² − 12x + 9.',
                'Set to zero: 3(x − 1)(x − 3) = 0, so x = 1 and x = 3.',
                'Differentiate again: d²y/dx² = 6x − 12.',
                'At x = 1 it is −6, so a maximum; at x = 3 it is +6, so a minimum.',
            ],
            answer: 'x = 1 is a maximum; x = 3 is a minimum',
            takeaway: 'The second derivative is one line and carries half the marks — stopping at the x-values is the commonest way to lose a question you had right.',
        },
        {
            id: 'consecutive-even-proof',
            module: 'Mathematics 2',
            question: 'Prove that the product of any two consecutive even integers is divisible by 8.',
            steps: [
                'Write them generally: 2n and 2n + 2, for some integer n.',
                'Their product is 2n × 2(n + 1) = 4n(n + 1).',
                'n and n + 1 are consecutive, so one of them is even: write n(n + 1) = 2k.',
                'The product is then 4 × 2k = 8k.',
            ],
            answer: 'Proved: the product equals 8k for some integer k',
            takeaway: 'It turns on n(n + 1) always being even, which is worth stating. Testing 2 × 4 and 4 × 6 shows the claim is plausible and proves nothing.',
        },
    ],
    faq: [
        {
            q: 'How long is the module, and is there negative marking?',
            a: '27 questions in 40 minutes, no calculator, no negative marking. That is under 90 seconds a question, so never leave one blank.',
            link: {
                label: 'How ESAT results are reported (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
            },
        },
        {
            q: 'Do I need ESAT Maths 2?',
            a: 'It depends on the course and university, and requirements differ between them. Check each of your choices on their own admissions pages.',
        },
        {
            q: 'What is the difference between ESAT Maths 1 and Maths 2?',
            a: 'Maths 1 is the compulsory pure core. Maths 2 goes further, into harder calculus and into logic and proof, where you justify a statement rather than only compute with it.',
        },
        {
            q: 'Where is the official list of topics?',
            a: 'In the ESAT content specification from UAT-UK. It is revised between cycles, so check it rather than any prep site — this one included.',
            link: {
                label: 'ESAT content specification (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/prepare/',
            },
        },
    ],
    sources: [
        {
            label: 'ESAT content specification (UAT-UK)',
            url: 'https://esat-tmua.ac.uk/prepare/',
        },
        {
            label: 'UAT-UK (the official ESAT body)',
            url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
        },
    ],
}
