/**
 * Content for the ESAT Mathematics 1 guide.
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
    path: '/guides/esat-maths-1',
    title: 'ESAT Maths 1 Questions and Practice Papers | JomExam',
    description: 'What ESAT Mathematics 1 asks of you, the topics that quietly cost marks, and worked ESAT Maths 1 questions with full solutions. Plus a free timed paper in the real format.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free Mathematics 1 paper →',
    h1: 'ESAT Mathematics 1 questions',
    standfirst: 'Every ESAT candidate sits Mathematics 1, whatever course they are applying for. The content is familiar A-level pure maths, so the marks go to whoever finds the short route first.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-12',
    sections: [
        {
            id: 'what-it-covers',
            h2: 'What Mathematics 1 covers',
            paras: [
                'Core pure mathematics from the first year of A-level: algebra and functions, sequences and series, coordinate geometry, trigonometry, logarithms and exponentials, straightforward differentiation and integration, and elementary probability.',
                'Every candidate takes it, so there is no section you can safely be weak at. The official content specification is the authority on scope and is revised between cycles.',
            ],
        },
        {
            id: 'where-marks-go',
            h2: 'Where the marks actually go',
            paras: [
                'Little of this is conceptually hard. What separates scores is spotting the efficient route inside 90 seconds.',
                'The recurring losses are ordinary: domains dropped after taking logarithms, discriminant conditions solved the long way, sign errors in a rushed rearrangement, geometric series assumed to converge. All habits under time pressure, not gaps in knowledge.',
            ],
        },
        {
            id: 'worked-examples',
            h2: 'Mathematics 1 questions, worked through',
            paras: [
                'Written in the style of the test, not copied from an official paper. Give each one 90 seconds before reading the working.',
            ],
        },
        {
            id: 'after-the-papers',
            h2: 'Once the official papers run out',
            paras: [
                'There is not much official material and it goes quickly. After that, a score out of 27 tells you the result of the problem, not its cause.',
                'Our Mathematics 1 diagnostics are full timed papers in the real format, and the report names the skills that went wrong rather than handing you a number. Set A is free.',
            ],
        },
    ],
    workedExamples: [
        {
            id: 'log-domain',
            module: 'Mathematics 1',
            question: 'Solve log₂(x) + log₂(x − 2) = 3.',
            steps: [
                'Combine the logarithms: log₂(x(x − 2)) = 3.',
                'So x(x − 2) = 2³ = 8, giving x² − 2x − 8 = 0.',
                'Factorise: (x − 4)(x + 2) = 0, so x = 4 or x = −2.',
                'Check the domain: log₂(−2) is undefined, so x = −2 is not a solution.',
            ],
            answer: 'x = 4',
            takeaway: 'Combining logarithms widens the domain, so the algebra hands back a root the original equation never had.',
        },
        {
            id: 'divergent-series',
            module: 'Mathematics 1',
            question: 'The first three terms of a geometric series are 8, 12 and 18. Find the sum to infinity, or explain why it does not exist.',
            steps: [
                'Common ratio: r = 12 ÷ 8 = 1.5, confirmed by 18 ÷ 12 = 1.5.',
                'A sum to infinity exists only when |r| < 1.',
                'Here |r| = 1.5, so the terms grow without limit.',
            ],
            answer: 'It does not exist — the series diverges because |r| = 1.5 ≥ 1',
            takeaway: 'Using a ÷ (1 − r) anyway gives −16: a negative total for positive terms, and an answer that cannot be true is the signal the formula did not apply.',
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
            q: 'Is ESAT Maths 1 compulsory?',
            a: 'Yes, for every candidate. Which further modules you need depends on the course and university, so check each of your choices on their own admissions pages.',
        },
        {
            q: 'Is ESAT Maths 1 harder than A-level maths?',
            a: 'The content is not harder; the constraint is. Multi-step and calculator-free at under 90 seconds a question, it tests whether you find the efficient route, not whether you could get there eventually.',
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
