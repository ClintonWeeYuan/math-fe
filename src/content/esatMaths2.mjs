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
    description:
        'What ESAT Mathematics 2 asks beyond Maths 1, where candidates lose marks, and worked ESAT Maths 2 questions with full solutions. Plus a free timed paper in the real format.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free Mathematics 2 paper →',
    h1: 'ESAT Mathematics 2 questions',
    standfirst:
        'Mathematics 2 goes past the compulsory module into further calculus, logic and proof. It is the module most often required by the courses with the highest competition.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-17',
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
            links: [
                {
                    path: '/guides/esat-practice-tests',
                    label: 'ESAT practice tests guide',
                    note: 'The format, scoring and timing, stated once and kept current there.',
                },
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
        {
            id: 'mini-test',
            h2: 'Fifteen minutes spare?',
            paras: [
                'The four questions above are a warm-up. A mini test is the next step: ten questions in fifteen minutes — the real test’s pace at a quarter of its length — with a short skills report at the end. When you are ready for the full picture, Set A of the complete 27-question paper is free, and its report names the skill behind every wrong answer.',
            ],
            links: [
                {
                    path: '/diagnostic/sets/b984cef2-7411-4ef8-93e5-f9a69f88dc7c',
                    label: 'Try a mini Maths 2 test',
                    note: 'Ten questions in fifteen minutes, free.',
                },
                {
                    path: '/diagnostics/esat',
                    label: 'Sit the full free paper',
                    note: 'Set A of the 27-question paper, with the full skills report.',
                },
            ],
        },
    ],
    workedExamples: [
        {
            id: 'integral-is-not-an-area',
            module: 'Mathematics 2',
            question:
                'Find the total area enclosed between the curve y = x² − 4x + 3 and the x-axis from x = 0 to x = 3.',
            options: [
                {
                    letter: 'A',
                    text: '0',
                    misconception:
                        'The signed integral from 0 to 3 — machinery perfect, the cancelling regions never separated.',
                },
                {
                    letter: 'B',
                    text: '4/3',
                    misconception: "One region's area, the other abandoned.",
                },
                {
                    letter: 'C',
                    text: '8/3',
                    isCorrect: true,
                },
                {
                    letter: 'D',
                    text: '4',
                    misconception:
                        'Drops the signs term by term instead of splitting at the roots.',
                },
                {
                    letter: 'E',
                    text: '9',
                    misconception:
                        'Evaluates the antiderivative at 3 and stops.',
                },
            ],
            steps: [
                'The curve crosses the axis where x² − 4x + 3 = (x − 1)(x − 3) = 0: at x = 1 and x = 3.',
                'From 0 to 1 the curve is above the axis: ∫₀¹ (x² − 4x + 3) dx = 1/3 − 2 + 3 = 4/3.',
                'From 1 to 3 it is below: the integral is −4/3, so that region contributes 4/3 of area.',
                'Total area = 4/3 + 4/3.',
            ],
            answer: '8/3',
            takeaway:
                'Integrating straight from 0 to 3 gives exactly 0 — machinery perfect, answer meaningless, because the signed regions cancel. "Area" means split at the roots and take sizes. A zero that arrives too neatly should be treated as an accusation.',
        },
        {
            id: 'circle-in-disguise',
            module: 'Mathematics 2',
            question:
                'A circle has equation x² + y² − 6x + 4y − 12 = 0. Find its centre and radius.',
            options: [
                {
                    letter: 'A',
                    text: 'centre (−3, 2), radius 5',
                    misconception:
                        "Reads the centre straight from the equation's signs — the brackets flip both.",
                },
                {
                    letter: 'B',
                    text: 'centre (3, −2), radius √12',
                    misconception:
                        'The completed square abandoned one line early: the −9 and −4 never crossed to the right.',
                },
                {
                    letter: 'C',
                    text: 'centre (3, −2), radius 5',
                    isCorrect: true,
                },
                {
                    letter: 'D',
                    text: 'centre (−3, 2), radius √12',
                    misconception: 'Both slips at once.',
                },
                {
                    letter: 'E',
                    text: 'centre (6, −4), radius 5',
                    misconception:
                        'Forgets to halve the coefficients when completing the square.',
                },
            ],
            steps: [
                'Complete the square in each variable: x² − 6x = (x − 3)² − 9, and y² + 4y = (y + 2)² − 4.',
                'The equation becomes (x − 3)² + (y + 2)² = 12 + 9 + 4 = 25.',
                'Read off: centre (3, −2), radius √25.',
            ],
            answer: 'centre (3, −2), radius 5',
            takeaway:
                'Two traps share this question. The centre is the sign-flip of the brackets — (3, −2), not (−3, 2) — and candidates who flip once usually flip both. And the radius is √25, not √12: the −9 and −4 must cross to the right-hand side before the radius is read.',
        },
        {
            id: 'division-that-eats-solutions',
            module: 'Mathematics 2',
            question:
                'How many solutions does sin 2x = cos x have for 0 ≤ x ≤ 2π?',
            options: [
                {
                    letter: 'A',
                    text: '2',
                    misconception:
                        'Divides both sides by cos x — quietly assuming cos x ≠ 0 and discarding the two values where it is.',
                },
                {
                    letter: 'B',
                    text: '3',
                    misconception:
                        'Finds cos x = 0 but loses one of the sin x = 1/2 pair.',
                },
                {
                    letter: 'C',
                    text: '5',
                    misconception: 'Counts a boundary value twice.',
                },
                {
                    letter: 'D',
                    text: '4',
                    isCorrect: true,
                },
                {
                    letter: 'E',
                    text: '6',
                    misconception: 'Doubles the count for the double angle.',
                },
            ],
            steps: [
                'Expand: 2 sin x cos x = cos x, and gather everything on one side: cos x (2 sin x − 1) = 0.',
                'cos x = 0 gives x = π/2 and 3π/2.',
                'sin x = 1/2 gives x = π/6 and 5π/6.',
            ],
            answer: '4',
            takeaway:
                'Dividing both sides by cos x at step one produces sin x = 1/2 and only two solutions — the division quietly assumed cos x ≠ 0 and threw away the two values where it is. Never divide by something that might be zero; factorise instead.',
        },
        {
            id: 'quadratic-in-disguise',
            module: 'Mathematics 2',
            question:
                'Solve 3²ˣ − 4·3ˣ + 3 = 0, and give the sum of the solutions.',
            options: [
                {
                    letter: 'A',
                    text: '1',
                    isCorrect: true,
                },
                {
                    letter: 'B',
                    text: '4',
                    misconception:
                        'The sum of the y-values, read off before translating back to x — the loan never repaid.',
                },
                {
                    letter: 'C',
                    text: '3',
                    misconception:
                        'The product of the y-values reported as the sum.',
                },
                {
                    letter: 'D',
                    text: '0',
                    misconception:
                        'Keeps only 3ˣ = 1 and discards the other root.',
                },
                {
                    letter: 'E',
                    text: '−1',
                    misconception:
                        'Translates 3ˣ = 1 to x = −1, a phantom logarithm.',
                },
            ],
            steps: [
                'Let y = 3ˣ: then y² − 4y + 3 = (y − 1)(y − 3) = 0, so y = 1 or y = 3.',
                'Translate back: 3ˣ = 1 gives x = 0; 3ˣ = 3 gives x = 1.',
            ],
            answer: '1',
            takeaway:
                'The trap is answering 4 — the sum of the y-values, read off before translating back to x. The substitution is a loan, and the question is not answered until it is repaid.',
        },
    ],
    faq: [
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
    related: [
        {
            path: '/guides/esat-practice-tests',
            blurb: 'the format, scoring, and a free timed paper for every module.',
        },
        {
            path: '/guides/esat-maths-1',
            blurb: 'the compulsory module this one builds on.',
        },
        {
            path: '/guides/esat-past-papers',
            blurb: 'what official material exists.',
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
