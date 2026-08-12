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
    description: 'What ESAT Biology asks of you, where candidates lose marks, and worked ESAT Biology questions with full solutions. Plus a free timed paper in the real format.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free Biology paper →',
    h1: 'ESAT Biology questions',
    standfirst: 'ESAT Biology is more quantitative than candidates expect. Not the essay-and-recall paper A-level trains you for: ratios, probabilities and data, at 90 seconds a question.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11',
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
    ],
    workedExamples: [
        {
            id: 'dihybrid-ratio',
            module: 'Biology',
            question: 'Two plants heterozygous for both of two independently assorting genes (PpTt) are crossed. Of 320 offspring, how many would be expected to show both recessive phenotypes?',
            steps: [
                'The genes assort independently, so treat them separately.',
                'Pp × Pp gives a ¼ chance of pp; Tt × Tt gives a ¼ chance of tt.',
                'Independent means the probabilities multiply: ¼ × ¼ = 1/16.',
                'Expected number = 320 ÷ 16.',
            ],
            answer: '20 offspring',
            takeaway: 'Multiplying two single-gene probabilities takes one line; a 16-cell Punnett square gives the same answer and costs a minute. The word to look for is "independently".',
        },
        {
            id: 'surface-area-volume',
            module: 'Biology',
            question: 'A cube-shaped organism has sides of 2 mm. Calculate its surface area to volume ratio, and state what happens if the sides double to 4 mm.',
            steps: [
                'Surface area = 6 × 2² = 24 mm²; volume = 2³ = 8 mm³, so the ratio is 3 mm⁻¹.',
                'With 4 mm sides: area = 96 mm², volume = 64 mm³.',
                'The ratio becomes 1.5 mm⁻¹.',
            ],
            answer: '3 mm⁻¹, halving to 1.5 mm⁻¹ when the sides double',
            takeaway: 'Area scales with the square and volume with the cube, so the ratio falls as size rises — which is why large organisms need specialised exchange surfaces.',
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
