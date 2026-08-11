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
    standfirst: 'Mathematics 1 is the one module every ESAT candidate sits, whatever course they are applying for, and it is the foundation the science modules lean on. It is also where speed matters most: the content is familiar, so the marks go to whoever finds the short route first.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11',
    sections: [
        {
            id: 'what-it-covers',
            h2: 'What Mathematics 1 covers',
            paras: [
                'Mathematics 1 covers the core pure mathematics of an A-level first year — algebra and functions, sequences and series, coordinate geometry, trigonometry, logarithms and exponentials, differentiation and integration of straightforward functions, and elementary probability and statistics.',
                'Because every candidate takes it, it is the module with the least room to specialise. There is no section you can safely be weak at.',
                'The definitive list is the official content specification, which is revised between cycles — check anything you are unsure about there rather than against a topic list on a prep site, this one included.',
            ],
        },
        {
            id: 'where-marks-go',
            h2: 'Where the marks actually go',
            paras: [
                'Almost nothing here is conceptually hard for a candidate who has done the A-level content. What separates scores is whether you spot the efficient route inside 90 seconds.',
                'The recurring losses are ordinary: domain restrictions dropped after taking logarithms, a discriminant condition solved the long way by substitution, sign errors in a rushed rearrangement, and geometric series treated as convergent without checking the common ratio.',
                'None of those are gaps in knowledge. They are what happens when a method is applied on autopilot, which is exactly what time pressure produces.',
            ],
        },
        {
            id: 'worked-examples',
            h2: 'Mathematics 1 questions, worked through',
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
                'Our Mathematics 1 diagnostics are full timed papers in the real format, and the report afterwards names the skills that went wrong rather than handing you a number. Set A is free to sit.',
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
                'Check both against the domain: log₂(−2) is undefined, so x = −2 is not a solution.',
            ],
            answer: 'x = 4',
            takeaway: 'Combining logarithms quietly widens the domain, so the algebra hands back a root the original equation never had. Checking each answer against the original expression is the whole difference between full marks and half.',
        },
        {
            id: 'divergent-series',
            module: 'Mathematics 1',
            question: 'The first three terms of a geometric series are 8, 12 and 18. Find the sum to infinity, or explain why it does not exist.',
            steps: [
                'Find the common ratio: r = 12 ÷ 8 = 1.5, and 18 ÷ 12 = 1.5 confirms it.',
                'A sum to infinity exists only when |r| < 1.',
                'Here |r| = 1.5, so the terms grow without limit and the series diverges.',
            ],
            answer: 'It does not exist — the series diverges because |r| = 1.5 ≥ 1',
            takeaway: 'Applying a ÷ (1 − r) regardless gives 8 ÷ (−0.5) = −16: a negative total for a series of positive terms. An answer that cannot be true is the signal the formula did not apply.',
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
            q: 'Is ESAT Maths 1 compulsory?',
            a: 'Yes — every candidate sits Mathematics 1 whatever course they are applying for. Which further modules you take depends on the course and university, so check the requirements for each of your choices on their own admissions pages.',
        },
        {
            q: 'Is ESAT Maths 1 harder than A-level maths?',
            a: 'The content is not harder; the constraint is. Questions are multi-step and calculator-free at under 90 seconds each, so what is tested is whether you can find the efficient route, not whether you could reach the answer eventually.',
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
