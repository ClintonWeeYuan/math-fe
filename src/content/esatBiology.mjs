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
    standfirst: 'ESAT Biology surprises people by being quantitative. It is not the essay-and-recall paper A-level Biology trains you for: expect ratios, probabilities and data interpretation, at the same 90 seconds a question as every other module.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11',
    sections: [
        {
            id: 'what-it-covers',
            h2: 'What Biology covers',
            paras: [
                'ESAT Biology covers the standard ground — cells and cell transport, biological molecules and enzymes, genetics and inheritance, physiology including gas exchange and circulation, and ecology.',
                'What differs from A-level habits is the form. Questions tend to give you numbers or a described scenario and ask for a deduction, rather than asking you to reproduce a process.',
                'The official content specification is the authority on scope, and is revised between cycles.',
            ],
        },
        {
            id: 'where-marks-go',
            h2: 'Where the marks actually go',
            paras: [
                'The most common loss is treating a genetics question as a diagram exercise. A full Punnett square is often unnecessary: the ratio is usually all you need, and it is faster.',
                'Next is arithmetic done in the wrong order — probabilities multiplied when they should be added, or a proportion applied to the wrong total.',
                'And finally, answers that describe rather than deduce. A question giving figures wants a figure back.',
            ],
        },
        {
            id: 'worked-examples',
            h2: 'Biology questions, worked through',
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
                'Our Biology diagnostics are full timed papers in the real format, and the report afterwards names the skills that went wrong rather than handing you a number. Set A is free to sit.',
            ],
        },
    ],
    workedExamples: [
        {
            id: 'dihybrid-ratio',
            module: 'Biology',
            question: 'Two plants heterozygous for both of two independently assorting genes (PpTt) are crossed. Of 320 offspring, how many would be expected to show both recessive phenotypes?',
            steps: [
                'Each gene segregates independently, so treat them separately.',
                'For one gene, Pp × Pp gives a ¼ chance of the recessive homozygote pp; the same is true of Tt × Tt for tt.',
                'Independent assortment means the probabilities multiply: ¼ × ¼ = 1/16.',
                'Expected number = 320 × 1/16.',
            ],
            answer: '20 offspring',
            takeaway: 'Multiplying the two single-gene probabilities gets there in one line; a 16-cell Punnett square gets the same answer and costs a minute you do not have. The word to look for is "independently".',
        },
        {
            id: 'surface-area-volume',
            module: 'Biology',
            question: 'A cube-shaped organism has sides of 2 mm. Calculate its surface area to volume ratio, and state what happens to that ratio if the sides double to 4 mm.',
            steps: [
                'Surface area = 6 × 2² = 24 mm²; volume = 2³ = 8 mm³, so the ratio is 24 ÷ 8 = 3 mm⁻¹.',
                'With sides of 4 mm: surface area = 6 × 4² = 96 mm²; volume = 4³ = 64 mm³.',
                'The ratio becomes 96 ÷ 64 = 1.5 mm⁻¹.',
            ],
            answer: '3 mm⁻¹, halving to 1.5 mm⁻¹ when the sides double',
            takeaway: 'Area scales with the square and volume with the cube, so the ratio falls as size rises — which is the whole reason large organisms need specialised exchange surfaces. Recognising it as a scaling question means you can predict the direction before calculating.',
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
            q: 'Is ESAT Biology just A-level Biology?',
            a: 'The content overlaps, but the form does not. Expect ratios, probabilities and data interpretation under time pressure rather than extended written answers, and practise accordingly.',
        },
        {
            q: 'How much maths is in ESAT Biology?',
            a: 'More than candidates expect. Probability in genetics, ratios and percentages in physiology and ecology, all calculator-free — being slow at the arithmetic costs Biology marks directly.',
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
