/**
 * Content for the ESAT Biology guide.
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
    path: '/guides/esat-biology',
    title: 'ESAT Biology Questions and Practice Papers | JomExam',
    description:
        'What ESAT Biology asks of you, where candidates lose marks, and worked ESAT Biology questions with full solutions. Plus a free timed paper in the real format.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free Biology paper →',
    h1: 'ESAT Biology questions',
    standfirst:
        'ESAT Biology is more quantitative than candidates expect. Not the essay-and-recall paper A-level trains you for: ratios, probabilities and data, at 90 seconds a question.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-17',
    sections: [
        {
            id: 'what-it-covers',
            h2: 'What Biology covers',
            paras: [
                'The standard ground — cells and transport, biological molecules and enzymes, genetics and inheritance, physiology including gas exchange and circulation, and ecology.',
                'What differs from A-level habits is the form: questions give you numbers or a scenario and ask for a deduction, rather than asking you to reproduce a process. The official content specification sets the scope.',
            ],
        },
        {
            id: 'where-marks-go',
            h2: 'Where the marks actually go',
            paras: [
                'The commonest loss is treating genetics as a diagram exercise. A full Punnett square is usually unnecessary — the ratio is all you need, and it is faster.',
                'Then arithmetic in the wrong order: probabilities multiplied when they should be added, or a proportion applied to the wrong total. And answers that describe when the question gave you figures and wanted one back.',
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
            h2: 'Biology questions, worked through',
            paras: [
                'Written in the style of the test, not copied from an official paper. Give each one 90 seconds before reading the working.',
            ],
        },
        {
            id: 'after-the-papers',
            h2: 'Once the official papers run out',
            paras: [
                'There is not much official material and it goes quickly. After that, a score out of 27 tells you the result of the problem, not its cause.',
                'Our Biology diagnostics are full timed papers in the real format, and the report names the skills that went wrong rather than handing you a number. Set A is free.',
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
                    path: '/diagnostic/sets/0627f52e-8cf1-4249-a04b-6c9e193185cf',
                    label: 'Try a mini Biology test',
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
            id: 'magnification',
            module: 'Biology',
            question:
                'A drawing of a cell measures 5 mm across. The real cell is 20 μm across. What is the magnification of the drawing?',
            options: [
                {
                    letter: 'A',
                    text: '×0.25',
                    misconception:
                        'Divides 5 by 20 with no unit conversion — a drawing two hundred times smaller than its cell.',
                },
                {
                    letter: 'B',
                    text: '×4',
                    misconception:
                        'Converts correctly, then divides real by image.',
                },
                {
                    letter: 'C',
                    text: '×250',
                    isCorrect: true,
                },
                {
                    letter: 'D',
                    text: '×2500',
                    misconception:
                        'An extra factor of ten in the mm-to-μm conversion.',
                },
                {
                    letter: 'E',
                    text: '×25',
                    misconception:
                        'Converts millimetres as hundreds of micrometres.',
                },
            ],
            steps: [
                'Convert to the same units first: 5 mm = 5 000 μm.',
                'Magnification = image ÷ real = 5 000 ÷ 20.',
            ],
            answer: '×250',
            takeaway:
                'Dividing 5 by 20 gives ×0.25 — a drawing two hundred times smaller than the cell, which should fail the sense check before it fails the mark scheme. Convert first, divide second.',
        },
        {
            id: 'cross-that-is-not-3-1',
            module: 'Biology',
            question:
                'Cystic-fibrosis-style inheritance: the allele is recessive. A carrier parent has children with an affected parent. What fraction of their children is expected to be affected?',
            options: [
                {
                    letter: 'A',
                    text: '1/4',
                    misconception:
                        'The carrier × carrier answer, transplanted from the cross every textbook drills.',
                },
                {
                    letter: 'B',
                    text: '1/2',
                    isCorrect: true,
                },
                {
                    letter: 'C',
                    text: '2/3',
                    misconception:
                        'The conditional answer to a different question — carriers among the unaffected.',
                },
                {
                    letter: 'D',
                    text: '3/4',
                    misconception:
                        'The unaffected fraction of the drilled cross, inverted into this one.',
                },
                {
                    letter: 'E',
                    text: '1/3',
                    misconception:
                        'A conditional fraction imported where no condition was set.',
                },
            ],
            steps: [
                'Write the genotypes: carrier Aa × affected aa.',
                'The cross gives 1 Aa : 1 aa.',
            ],
            answer: '1/2',
            takeaway:
                'The reflex answer is 1/4, transplanted from the carrier × carrier cross that every textbook drills. The question is testing whether you build the Punnett square in front of you or the one in your memory.',
        },
        {
            id: 'surface-area-to-volume',
            module: 'Biology',
            question:
                'A cubic cell has sides of 2 μm. What is its surface-area-to-volume ratio?',
            options: [
                {
                    letter: 'A',
                    text: '1/3',
                    misconception:
                        'The ratio inverted: volume over surface area.',
                },
                {
                    letter: 'B',
                    text: '24',
                    misconception:
                        'The surface area alone, the division never done.',
                },
                {
                    letter: 'C',
                    text: '0.5',
                    misconception: 'Counts one face instead of six.',
                },
                {
                    letter: 'D',
                    text: '3 (i.e. 3 : 1)',
                    isCorrect: true,
                },
                {
                    letter: 'E',
                    text: '8',
                    misconception: 'The volume alone, reported as the ratio.',
                },
            ],
            steps: [
                'Surface area = 6 × 2² = 24 μm².',
                'Volume = 2³ = 8 μm³.',
                'Ratio = 24 ÷ 8.',
            ],
            answer: '3 (i.e. 3 : 1)',
            takeaway:
                'Two casualties here: counting one face instead of six, and inverting the ratio. The follow-up idea is the one examiners actually care about — double the side and the ratio halves, which is why cells stay small.',
        },
        {
            id: 'cardiac-output',
            module: 'Biology',
            question:
                'A heart beats 75 times per minute with a stroke volume of 70 cm³. What is the cardiac output in dm³ per minute?',
            options: [
                {
                    letter: 'A',
                    text: '5.25 dm³ min⁻¹',
                    isCorrect: true,
                },
                {
                    letter: 'B',
                    text: '5 250 dm³ min⁻¹',
                    misconception:
                        'The right number in the wrong currency: cm³ reported as dm³.',
                },
                {
                    letter: 'C',
                    text: '0.525 dm³ min⁻¹',
                    misconception: 'Divides by 10 000 in the conversion.',
                },
                {
                    letter: 'D',
                    text: '52.5 dm³ min⁻¹',
                    misconception: 'Divides by 100 in the conversion.',
                },
                {
                    letter: 'E',
                    text: '145 dm³ min⁻¹',
                    misconception: 'Adds the two given numbers.',
                },
            ],
            steps: [
                'Cardiac output = stroke volume × heart rate = 70 × 75 = 5 250 cm³ per minute.',
                'Convert: 5 250 cm³ = 5.25 dm³.',
            ],
            answer: '5.25 dm³ min⁻¹',
            takeaway:
                'The multiplication is trivial; the mark lives in the unit conversion the question quietly demands in its final three words. An answer of 5 250 is right in the wrong currency.',
        },
    ],
    faq: [
        {
            q: 'Is ESAT Biology just A-level Biology?',
            a: 'The content overlaps; the form does not. Expect ratios, probabilities and data interpretation under time pressure rather than extended written answers.',
        },
        {
            q: 'How much maths is in ESAT Biology?',
            a: 'More than candidates expect — probability in genetics, ratios and percentages elsewhere, all calculator-free. Slow arithmetic costs Biology marks directly.',
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
            path: '/guides/esat-chemistry',
            blurb: 'the other life-sciences module.',
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
