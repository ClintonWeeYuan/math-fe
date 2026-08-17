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
    description:
        'What ESAT Mathematics 1 asks of you, the topics that quietly cost marks, and worked ESAT Maths 1 questions with full solutions. Plus a free timed paper in the real format.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free Mathematics 1 paper →',
    h1: 'ESAT Mathematics 1 questions',
    standfirst:
        'Every ESAT candidate sits Mathematics 1, whatever course they are applying for. The content is familiar A-level pure maths, so the marks go to whoever finds the short route first.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-17',
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
        {
            id: 'mini-test',
            h2: 'Fifteen minutes spare?',
            paras: [
                'The four questions above are a warm-up. A mini test is the next step: ten questions in fifteen minutes — the real test’s pace at a quarter of its length — with a short skills report at the end. When you are ready for the full picture, Set A of the complete 27-question paper is free, and its report names the skill behind every wrong answer.',
            ],
            links: [
                {
                    path: '/diagnostic/sets/bc592d4f-f122-437d-b552-d32ede57e8c7',
                    label: 'Try a mini Maths 1 test',
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
            id: 'reverse-percentages',
            module: 'Mathematics 1',
            question:
                'A price rises by 20%, and then falls by k% back to exactly its original value. What is k?',
            options: [
                {
                    letter: 'A',
                    text: '10',
                    misconception:
                        'Averages the two changes; percentage changes are multiplicative, not additive.',
                },
                {
                    letter: 'B',
                    text: '20',
                    misconception:
                        'Undoes the 20% with 20% — but the fall acts on the raised price, a bigger base, so a smaller percentage suffices.',
                },
                {
                    letter: 'C',
                    text: '16⅔',
                    isCorrect: true,
                },
                {
                    letter: 'D',
                    text: '15',
                    misconception:
                        'Computes 1.2 × 0.85 ≈ 1.02 and rounds the residue away instead of solving exactly.',
                },
                {
                    letter: 'E',
                    text: '83⅓',
                    misconception:
                        'Inverts the fraction at the last step: 1 − 5/6 read on the wrong scale.',
                },
            ],
            steps: [
                'Rising 20% multiplies by 1.2; falling k% multiplies by (1 − k/100).',
                'Returning to the original means 1.2 × (1 − k/100) = 1.',
                'So 1 − k/100 = 5/6, giving k/100 = 1/6.',
            ],
            answer: '16⅔',
            takeaway:
                'The trap is 20: percentage changes do not undo symmetrically, because the second change acts on a different base. If you wrote 20 without calculating, that instinct will cost marks all through the ratio questions.',
        },
        {
            id: 'indices-without-a-calculator',
            module: 'Mathematics 1',
            question: 'Given that 4ˣ = 9, find the value of 8ˣ.',
            options: [
                {
                    letter: 'A',
                    text: '13.5',
                    misconception:
                        'Multiplies 9 by 3/2 instead of raising it to the power 3/2.',
                },
                {
                    letter: 'B',
                    text: '27',
                    isCorrect: true,
                },
                {
                    letter: 'C',
                    text: '81',
                    misconception:
                        'Squares the 9 — the exponent 2 used where 3/2 belongs.',
                },
                {
                    letter: 'D',
                    text: '18',
                    misconception:
                        'Doubles the 9 to account for the extra factor of 2 in the base.',
                },
                {
                    letter: 'E',
                    text: '36',
                    misconception:
                        'Multiplies by the base 4, treating the base change as a scaling.',
                },
            ],
            steps: [
                'Write both sides in base 2: 4ˣ = (2ˣ)² = 9, so 2ˣ = 3 (positive root, since 2ˣ > 0).',
                'Then 8ˣ = (2ˣ)³ = 3³.',
            ],
            answer: '27',
            takeaway:
                'Solving for x itself needs logarithms you do not have. The question is testing whether you treat 2ˣ as the unknown instead of x — the substitution IS the syllabus point.',
        },
        {
            id: 'nested-squares',
            module: 'Mathematics 1',
            question:
                "A square is inscribed in a circle, which is inscribed in a larger square. What fraction of the large square's area is the small square?",
            options: [
                {
                    letter: 'A',
                    text: '1/4',
                    misconception:
                        'Halves twice — once for each nesting — instead of tracking the diagonal.',
                },
                {
                    letter: 'B',
                    text: '1/√2',
                    misconception:
                        'Reports the ratio of the SIDES as the ratio of the areas.',
                },
                {
                    letter: 'C',
                    text: 'π/4',
                    misconception:
                        'The circle-to-square ratio, answering for the wrong pair of shapes.',
                },
                {
                    letter: 'D',
                    text: '1/2',
                    isCorrect: true,
                },
                {
                    letter: 'E',
                    text: '2/3',
                    misconception:
                        'A compromise between the halves and the visual impression.',
                },
            ],
            steps: [
                'Let the large square have side 2, so the circle has radius 1.',
                "The small square's diagonal is the circle's diameter, 2 — so its side is √2.",
                'Areas: small = 2, large = 4.',
            ],
            answer: '1/2',
            takeaway:
                'No lengths were given, and none were needed — set your own. Candidates who wait for numbers lose the 90 seconds; candidates who chase the diagonal relationship the wrong way get 1/4.',
        },
        {
            id: 'probability-by-complement',
            module: 'Mathematics 1',
            question:
                'Two fair dice are rolled. What is the probability that the product of the two scores is even?',
            options: [
                {
                    letter: 'A',
                    text: '3/4',
                    isCorrect: true,
                },
                {
                    letter: 'B',
                    text: '1/2',
                    misconception:
                        'The instinct that even and odd products balance — they do not, because one even die is enough.',
                },
                {
                    letter: 'C',
                    text: '1/4',
                    misconception:
                        'Reports the complement: the probability of an ODD product.',
                },
                {
                    letter: 'D',
                    text: '2/3',
                    misconception:
                        'Treats the three parity patterns (both even, mixed, both odd) as equally likely and takes two of them.',
                },
                {
                    letter: 'E',
                    text: '5/6',
                    misconception:
                        'Assembles P(at least one even) with an inclusion–exclusion slip.',
                },
            ],
            steps: [
                'The product is odd only when BOTH dice are odd: probability (1/2) × (1/2) = 1/4.',
                'Everything else gives an even product.',
            ],
            answer: '3/4',
            takeaway:
                'Counting the even products directly is a case swamp. "Odd is the rare event — count that instead" is the single most reusable probability move in the paper.',
        },
    ],
    faq: [
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
    related: [
        {
            path: '/guides/esat-practice-tests',
            blurb: 'the format, scoring, and a free timed paper for every module.',
        },
        {
            path: '/guides/esat-maths-2',
            blurb: 'what Maths 2 asks beyond this module.',
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
