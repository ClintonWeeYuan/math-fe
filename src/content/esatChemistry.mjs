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
    description:
        'What ESAT Chemistry asks of you, where candidates lose marks, and worked ESAT Chemistry questions with full solutions. Plus a free timed paper in the real format.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free Chemistry paper →',
    h1: 'ESAT Chemistry questions',
    standfirst:
        'ESAT Chemistry is a calculation paper more than a recall paper. Most questions come down to moles and a balanced equation — which makes the balancing, not the chemistry, the step that decides the mark.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-17',
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
        {
            id: 'mini-test',
            h2: 'Fifteen minutes spare?',
            paras: [
                'The four questions above are a warm-up. A mini test is the next step: ten questions in fifteen minutes — the real test’s pace at a quarter of its length — with a short skills report at the end. When you are ready for the full picture, Set A of the complete 27-question paper is free, and its report names the skill behind every wrong answer.',
            ],
            links: [
                {
                    path: '/diagnostic/sets/f50d8b42-6ee8-492a-bc73-4fd3fd10b200',
                    label: 'Try a mini Chemistry test',
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
            id: 'counting-particles-not-grams',
            module: 'Chemistry',
            question:
                'What mass of water contains the same number of molecules as 22 g of carbon dioxide? (Mᵣ: CO₂ = 44, H₂O = 18)',
            options: [
                {
                    letter: 'A',
                    text: '11 g',
                    misconception:
                        'Halves the mass — matching masses, not molecules.',
                },
                {
                    letter: 'B',
                    text: '9.0 g',
                    isCorrect: true,
                },
                {
                    letter: 'C',
                    text: '22 g',
                    misconception:
                        'Equal masses taken as equal molecule counts.',
                },
                {
                    letter: 'D',
                    text: '18 g',
                    misconception: 'One full mole of water, the 0.50 lost.',
                },
                {
                    letter: 'E',
                    text: '4.5 g',
                    misconception:
                        'Halves twice — once for the moles and once again for luck.',
                },
            ],
            steps: [
                'Moles of CO₂ = 22 ÷ 44 = 0.50 mol.',
                'Equal numbers of molecules means equal moles: 0.50 mol of water.',
                'Mass = 0.50 × 18.',
            ],
            answer: '9.0 g',
            takeaway:
                'The trap is matching the masses — half of 22 is 11, and 11 g is wrong. "Same number of molecules" is a statement about moles, and moles care about Mᵣ, not about the mass you started from.',
        },
        {
            id: 'dilution',
            module: 'Chemistry',
            question:
                '25 cm³ of sodium hydroxide solution of concentration 0.80 mol dm⁻³ is diluted with water to a total volume of 200 cm³. What is the new concentration?',
            options: [
                {
                    letter: 'A',
                    text: '0.80 mol dm⁻³',
                    misconception:
                        'Dilution ignored: the moles are unchanged, but the volume is not.',
                },
                {
                    letter: 'B',
                    text: '6.4 mol dm⁻³',
                    misconception:
                        'Multiplies by the volume factor instead of dividing.',
                },
                {
                    letter: 'C',
                    text: '0.64 mol dm⁻³',
                    misconception:
                        'Multiplies the concentration by the volume ratio the wrong way up.',
                },
                {
                    letter: 'D',
                    text: '0.10 mol dm⁻³',
                    isCorrect: true,
                },
                {
                    letter: 'E',
                    text: '0.20 mol dm⁻³',
                    misconception: 'Uses 100 cm³ as the final volume.',
                },
            ],
            steps: [
                'Dilution changes the volume, not the moles: n = 0.025 × 0.80 = 0.020 mol.',
                'New concentration = 0.020 ÷ 0.200.',
            ],
            answer: '0.10 mol dm⁻³',
            takeaway:
                'The volume grew by a factor of 8, so the concentration fell by a factor of 8 — writing that sentence first makes the arithmetic a check rather than a hope. Multiplying by 8 instead of dividing is the standard casualty.',
        },
        {
            id: 'gas-volumes-with-an-excess',
            module: 'Chemistry',
            question:
                '50 cm³ of methane is burned in 200 cm³ of oxygen: CH₄ + 2O₂ → CO₂ + 2H₂O. After cooling to room temperature, what volume of gas remains?',
            options: [
                {
                    letter: 'A',
                    text: '150 cm³',
                    isCorrect: true,
                },
                {
                    letter: 'B',
                    text: '50 cm³',
                    misconception:
                        'Counts the CO₂ and forgets the 100 cm³ of oxygen that never reacted.',
                },
                {
                    letter: 'C',
                    text: '250 cm³',
                    misconception:
                        'Counts the steam — but "after cooling" made the water liquid.',
                },
                {
                    letter: 'D',
                    text: '100 cm³',
                    misconception:
                        'Counts the leftover oxygen and forgets the CO₂ produced.',
                },
                {
                    letter: 'E',
                    text: '0 cm³',
                    misconception:
                        'Assumes complete combustion consumes every gas present.',
                },
            ],
            steps: [
                '50 cm³ of methane uses 2 × 50 = 100 cm³ of oxygen and makes 50 cm³ of CO₂.',
                'Oxygen left over: 200 − 100 = 100 cm³.',
                'The water is liquid after cooling — it contributes nothing.',
            ],
            answer: '150 cm³',
            takeaway:
                'Two traps share this question: forgetting the oxygen that never reacted, and counting the steam. "After cooling" is doing quiet work — it removes the water from the count.',
        },
        {
            id: 'bond-energies',
            module: 'Chemistry',
            question:
                'For H₂ + Cl₂ → 2HCl, the bond energies are H–H 436, Cl–Cl 243 and H–Cl 432 kJ mol⁻¹. Find the enthalpy change of the reaction.',
            options: [
                {
                    letter: 'A',
                    text: '+185 kJ mol⁻¹',
                    misconception:
                        'Formed minus broken: the subtraction inverted, the sign with it.',
                },
                {
                    letter: 'B',
                    text: '+247 kJ mol⁻¹',
                    misconception:
                        'Drops the 2 on HCl — 679 − 432 — and inherits the wrong sign from it.',
                },
                {
                    letter: 'C',
                    text: '−247 kJ mol⁻¹',
                    misconception:
                        'The same dropped 2, with the sign patched by instinct rather than arithmetic.',
                },
                {
                    letter: 'D',
                    text: '−1543 kJ mol⁻¹',
                    misconception:
                        'Adds all three bond energies with a uniform sign, building no cycle.',
                },
                {
                    letter: 'E',
                    text: '−185 kJ mol⁻¹',
                    isCorrect: true,
                },
            ],
            steps: [
                'Bonds broken (energy in): 436 + 243 = 679 kJ.',
                'Bonds formed (energy out): 2 × 432 = 864 kJ — the 2 in the equation is a 2 in the arithmetic.',
                'ΔH = broken − formed = 679 − 864.',
            ],
            answer: '−185 kJ mol⁻¹',
            takeaway:
                'Dropping the 2 on HCl gives +247 and the wrong sign — a double casualty from one invisible ratio. Broken minus formed, and every coefficient counts.',
        },
    ],
    faq: [
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
    related: [
        {
            path: '/guides/esat-practice-tests',
            blurb: 'the format, scoring, and a free timed paper for every module.',
        },
        {
            path: '/guides/esat-biology',
            blurb: 'the other life-sciences module.',
        },
        {
            path: '/esat-chemistry-practice-test',
            blurb: 'the free timed paper, a mini test, and a sample paper to download.',
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
