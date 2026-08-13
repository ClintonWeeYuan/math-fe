/**
 * Content for the ESAT Chemistry guide.
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
    path: '/guides/esat-chemistry',
    title: 'ESAT Chemistry Questions and Practice Papers | JomExam',
    description: 'What ESAT Chemistry asks of you, where candidates lose marks, and worked ESAT Chemistry questions with full solutions. Plus a free timed paper in the real format.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free Chemistry paper →',
    h1: 'ESAT Chemistry questions',
    standfirst: 'ESAT Chemistry is a calculation paper more than a recall paper. Most questions come down to moles and a balanced equation — which makes the balancing, not the chemistry, the step that decides the mark.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-12',
    sections: [
        {
            id: 'what-it-covers',
            h2: 'What Chemistry covers',
            paras: [
                'The familiar A-level ground: atomic structure and bonding, the mole and reacting quantities, energetics, rates and equilibria, redox, the periodic table, and introductory organic chemistry.',
                'The emphasis is quantitative. Expect masses, volumes or concentrations and a number back, rather than a mechanism described in words. The official content specification sets the scope.',
            ],
        },
        {
            id: 'where-marks-go',
            h2: 'Where the marks actually go',
            paras: [
                'The biggest cost is an unbalanced equation. Every mole calculation downstream inherits the error, and the arithmetic can be flawless while the answer is wrong.',
                'Close behind: assuming a 1:1 ratio in a titration when the acid is diprotic — the numbers still come out neatly, which is what makes it dangerous. Then units, cm³ against dm³.',
            ],
        },
        {
            id: 'worked-examples',
            h2: 'Chemistry questions, worked through',
            paras: [
                'Written in the style of the test, not copied from an official paper. Give each one 90 seconds before reading the working.',
            ],
        },
        {
            id: 'after-the-papers',
            h2: 'Once the official papers run out',
            paras: [
                'There is not much official material and it goes quickly. After that, a score out of 27 tells you the result of the problem, not its cause.',
                'Our Chemistry diagnostics are full timed papers in the real format, and the report names the skills that went wrong rather than handing you a number. Set A is free.',
            ],
        },
    ],
    workedExamples: [
        {
            id: 'diprotic-titration',
            module: 'Chemistry',
            question: '25.0 cm³ of 0.100 mol dm⁻³ sodium hydroxide is exactly neutralised by 20.0 cm³ of sulfuric acid. Calculate the concentration of the acid.',
            steps: [
                'Moles of NaOH = 0.0250 × 0.100 = 2.50 × 10⁻³ mol.',
                'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O, so the acid reacts 1:2 with the hydroxide.',
                'Moles of H₂SO₄ = 2.50 × 10⁻³ ÷ 2 = 1.25 × 10⁻³ mol.',
                'Concentration = 1.25 × 10⁻³ ÷ 0.0200.',
            ],
            answer: '0.0625 mol dm⁻³',
            takeaway: 'Sulfuric acid is diprotic; assuming 1:1 gives 0.125 — exactly double, and a perfectly reasonable-looking number. Write the equation before the arithmetic.',
        },
        {
            id: 'combustion-volume',
            module: 'Chemistry',
            question: 'What volume of oxygen at room temperature and pressure is needed to burn 0.20 mol of propane completely? (Molar gas volume at RTP = 24 dm³ mol⁻¹)',
            steps: [
                'Balance it: C₃H₈ + 5O₂ → 3CO₂ + 4H₂O.',
                'Each mole of propane needs 5 of oxygen: 0.20 × 5 = 1.0 mol.',
                'Volume = 1.0 × 24.',
            ],
            answer: '24 dm³',
            takeaway: 'The whole question is the 5. Balance carbons, then hydrogens, then oxygens last — get it wrong and every later step is irrelevant.',
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
            q: 'Is a periodic table provided in the ESAT?',
            a: 'Check the official preparation material rather than assuming what worked at A-level, and practise as though relative atomic masses need to be recognised quickly.',
        },
        {
            q: 'How much organic chemistry is in ESAT Chemistry?',
            a: 'Introductory and applied rather than mechanistic — formulae, reacting quantities and simple reaction types. Confirm the scope in the content specification.',
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
