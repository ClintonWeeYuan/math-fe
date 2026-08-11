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
    standfirst: 'ESAT Chemistry is a calculation paper more than a recall paper. Most questions come down to moles and a balanced equation, done quickly and without a calculator — which makes the balancing, not the chemistry, the step that decides the mark.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11',
    sections: [
        {
            id: 'what-it-covers',
            h2: 'What Chemistry covers',
            paras: [
                'ESAT Chemistry spans the familiar A-level ground: atomic structure and bonding, the mole and reacting quantities, energetics, rates and equilibria, redox, the periodic table, and introductory organic chemistry.',
                'The emphasis is applied. A question will usually give you masses, volumes or concentrations and expect a quantitative answer, rather than asking you to describe a mechanism in words.',
                'Scope is set by the official content specification, which is revised between cycles.',
            ],
        },
        {
            id: 'where-marks-go',
            h2: 'Where the marks actually go',
            paras: [
                'The single biggest cost is an unbalanced or half-remembered equation. Every mole calculation downstream inherits the error, and the arithmetic can be flawless while the answer is wrong.',
                'Close behind is assuming a one-to-one ratio in a titration when the acid is diprotic — the numbers still work out neatly, which is what makes it dangerous.',
                'Then units: cm³ against dm³, and grams against moles. None of it is difficult, and all of it is easy at speed.',
            ],
        },
        {
            id: 'worked-examples',
            h2: 'Chemistry questions, worked through',
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
                'Our Chemistry diagnostics are full timed papers in the real format, and the report afterwards names the skills that went wrong rather than handing you a number. Set A is free to sit.',
            ],
        },
    ],
    workedExamples: [
        {
            id: 'diprotic-titration',
            module: 'Chemistry',
            question: '25.0 cm³ of 0.100 mol dm⁻³ sodium hydroxide is exactly neutralised by 20.0 cm³ of sulfuric acid. Calculate the concentration of the acid.',
            steps: [
                'Moles of NaOH = 0.0250 dm³ × 0.100 mol dm⁻³ = 2.50 × 10⁻³ mol.',
                'The equation is H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O, so the acid reacts in a 1:2 ratio with the hydroxide.',
                'Moles of H₂SO₄ = 2.50 × 10⁻³ ÷ 2 = 1.25 × 10⁻³ mol.',
                'Concentration = 1.25 × 10⁻³ mol ÷ 0.0200 dm³.',
            ],
            answer: '0.0625 mol dm⁻³',
            takeaway: 'Sulfuric acid is diprotic, and assuming 1:1 gives 0.125 — exactly double, and a perfectly reasonable-looking number. Writing the balanced equation before touching the arithmetic is what stops it.',
        },
        {
            id: 'combustion-volume',
            module: 'Chemistry',
            question: 'What volume of oxygen, measured at room temperature and pressure, is needed to burn 0.20 mol of propane completely? (Molar gas volume at RTP = 24 dm³ mol⁻¹)',
            steps: [
                'Balance the combustion: C₃H₈ + 5O₂ → 3CO₂ + 4H₂O.',
                'So each mole of propane needs 5 moles of oxygen: 0.20 × 5 = 1.0 mol of O₂.',
                'Volume = 1.0 mol × 24 dm³ mol⁻¹.',
            ],
            answer: '24 dm³',
            takeaway: 'The whole question is the 5. Balancing hydrocarbon combustion is mechanical — carbons, then hydrogens, then oxygens last — and getting it wrong makes every later step irrelevant however carefully you do it.',
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
            q: 'Is a periodic table provided in the ESAT?',
            a: 'Check the official preparation material before the day rather than relying on what worked at A-level, and practise as though relative atomic masses need to be recognised quickly either way.',
        },
        {
            q: 'How much organic chemistry is in ESAT Chemistry?',
            a: 'Introductory, and applied rather than mechanistic. Expect to use formulae, reacting quantities and simple reaction types rather than to draw extended mechanisms — but confirm the scope in the content specification.',
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
