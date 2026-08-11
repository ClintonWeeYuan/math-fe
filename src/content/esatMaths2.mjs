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
    standfirst: 'Mathematics 2 goes past the compulsory module into the material that separates a strong mathematician from a competent one: further calculus, logic and proof. It is the module most often required by the courses with the highest competition.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11',
    sections: [
        {
            id: 'what-it-covers',
            h2: 'What Mathematics 2 covers',
            paras: [
                'Mathematics 2 builds on Mathematics 1 with further pure content — more demanding differentiation and integration, sequences and series pushed further, and, distinctively, questions that ask you to reason about a mathematical statement rather than only compute with it.',
                'Proof and logical structure are the part candidates are least prepared for, because school mathematics rewards executing a method and this module also rewards justifying one.',
                'As with every module, the official content specification is the authority on what is examinable, and it changes between cycles.',
            ],
        },
        {
            id: 'where-marks-go',
            h2: 'Where the marks actually go',
            paras: [
                'Two failure modes dominate. The first is stopping at a stationary point without establishing its nature, because the question said "find" and the mark scheme wanted "and determine".',
                'The second is proof: writing a demonstration that the statement holds for a few cases and treating that as an argument. A general proof needs a general object — an arbitrary n, not 2, 4 and 6.',
                'Both are habits rather than gaps, and both are cheap to fix once you have seen them named.',
            ],
        },
        {
            id: 'worked-examples',
            h2: 'Mathematics 2 questions, worked through',
            paras: [
                'These are written to the style of the test rather than copied from an official paper. Each is the kind of multi-step, calculator-free question the ESAT favours: the arithmetic stays clean, and the difficulty is in choosing the route.',
                'Give each one 90 seconds before reading the working.',
            ],
        },
        {
            id: 'after-the-papers',
            h2: 'Once the official papers run out',
            paras: [
                'There is not much official ESAT material and it goes quickly. At that point a score out of 27 stops being useful — it tells you the result of the problem, not its cause.',
                'Our Mathematics 2 diagnostics are full timed papers in the real format, and the report afterwards names the skills that went wrong rather than handing you a number. Set A is free to sit.',
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
                'Set it to zero: 3(x² − 4x + 3) = 3(x − 1)(x − 3) = 0, so x = 1 and x = 3.',
                'Differentiate again for the nature: d²y/dx² = 6x − 12.',
                'At x = 1, d²y/dx² = −6, which is negative, so it is a maximum. At x = 3 it is +6, positive, so a minimum.',
            ],
            answer: 'x = 1 is a maximum; x = 3 is a minimum',
            takeaway: 'The second derivative is one line and answers the half of the question that carries the marks. Stopping at "x = 1 and x = 3" is the most common way to lose half a question you had entirely right.',
        },
        {
            id: 'consecutive-even-proof',
            module: 'Mathematics 2',
            question: 'Prove that the product of any two consecutive even integers is divisible by 8.',
            steps: [
                'Write the integers generally: any two consecutive even integers are 2n and 2n + 2 for some integer n.',
                'Their product is 2n × 2(n + 1) = 4n(n + 1).',
                'n and n + 1 are consecutive integers, so exactly one of them is even; write n(n + 1) = 2k for some integer k.',
                'Then the product is 4 × 2k = 8k, which is divisible by 8.',
            ],
            answer: 'Proved: the product equals 8k for some integer k',
            takeaway: 'The proof turns on n(n + 1) always being even, which is worth stating rather than assuming. Testing 2 × 4, 4 × 6 and 6 × 8 shows the claim is plausible and proves nothing — a general statement needs a general n.',
        },
    ],
    faq: [
        {
            q: 'How long is the module, and is there negative marking?',
            a: '27 questions in 40 minutes, no calculator, no negative marking — the same as every other ESAT module. That is under 90 seconds a question, which is why untimed practice tells you so little, and why leaving anything blank is a straightforward loss.',
            link: {
                label: 'How ESAT results are reported (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
            },
        },
        {
            q: 'Do I need ESAT Maths 2?',
            a: 'It depends on the course and the university, and the requirements differ between them. Check each of your choices on their own admissions pages rather than assuming the modules are the same everywhere.',
        },
        {
            q: 'What is the difference between ESAT Maths 1 and Maths 2?',
            a: 'Mathematics 1 is the compulsory core — the pure mathematics every candidate is expected to have. Mathematics 2 goes further, into more demanding calculus and into logic and proof, where you are asked to justify a statement rather than only compute with it.',
        },
        {
            q: 'Where is the official list of topics?',
            a: 'In the ESAT content specification published by UAT-UK. It is the authority on what can be assessed, it is revised between cycles, and it should be what you check against — not a topic list on a prep site, this one included.',
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
