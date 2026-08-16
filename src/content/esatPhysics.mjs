/**
 * Content for the ESAT Physics guide.
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
    path: '/guides/esat-physics',
    title: 'ESAT Physics Questions and Practice Papers | JomExam',
    description:
        'What ESAT Physics asks of you, the topics that quietly cost marks, and worked ESAT Physics questions with full solutions. Plus a free timed paper in the real format.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free Physics paper →',
    h1: 'ESAT Physics questions',
    standfirst:
        'ESAT Physics rewards picking the right conserved quantity and committing to it. The content is A-level; the difficulty is that every question is two or three steps with no calculator.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-16',
    sections: [
        {
            id: 'what-it-covers',
            h2: 'What Physics covers',
            paras: [
                'The standard A-level areas — mechanics and motion, energy and momentum, electricity and circuits, waves, and materials — applied rather than recalled.',
                'Questions rarely ask for a definition. They give a situation and expect you to notice which principle makes it tractable, which is a different skill from knowing the principle. The official content specification sets the scope.',
            ],
        },
        {
            id: 'where-marks-go',
            h2: 'Where the marks actually go',
            paras: [
                'The characteristic loss is a valid method that takes four minutes when a one-line method existed. Conservation of energy or momentum usually beats working through the kinematics.',
                'The other is dropping a case: speed does not tell you direction, a square root has two signs, and a quantity equal at two moments usually is equal at two moments.',
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
            h2: 'Physics questions, worked through',
            paras: [
                'Written in the style of the test, not copied from an official paper. Give each one 90 seconds before reading the working.',
            ],
        },
        {
            id: 'after-the-papers',
            h2: 'Once the official papers run out',
            paras: [
                'There is not much official material and it goes quickly. After that, a score out of 27 tells you the result of the problem, not its cause.',
                'Our Physics diagnostics are full timed papers in the real format, and the report names the skills that went wrong rather than handing you a number. Set A is free.',
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
                    path: '/diagnostic/sets/9fa1dcad-bf4e-4d90-8fa9-5597b33aacdd',
                    label: 'Try a mini Physics test',
                    note: 'Ten questions in fifteen minutes, free.',
                },
                {
                    path: '/diagnostics/esat',
                    label: 'Sit the full free paper',
                    note: 'Set A of the 27-question Physics paper, with the full skills report.',
                },
            ],
        },
    ],
    workedExamples: [
        {
            id: 'parallel-resistors',
            module: 'Physics',
            question:
                'A 6.0 Ω resistor and a 3.0 Ω resistor are connected in parallel across a 12 V supply of negligible internal resistance. Find the total current drawn.',
            steps: [
                'In parallel, 1/R = 1/6 + 1/3 = 3/6.',
                'So R = 2.0 Ω — smaller than either resistor, as a parallel combination always is.',
                'Then I = V/R = 12 ÷ 2.0.',
            ],
            answer: '6.0 A',
            takeaway:
                'A parallel combination is always less resistive than its smallest branch, so adding to get 9 Ω should look wrong before you finish the arithmetic.',
        },
        {
            id: 'inelastic-collision',
            module: 'Physics',
            question:
                'A 2.0 kg trolley moving at 3.0 m s⁻¹ collides with a stationary 4.0 kg trolley, and the two move off together. Find their common speed and the kinetic energy lost.',
            steps: [
                'Momentum is conserved: 2.0 × 3.0 = 6.0, and (2.0 + 4.0)v after.',
                'So v = 1.0 m s⁻¹.',
                'Kinetic energy before = ½ × 2.0 × 3.0² = 9.0 J.',
                'After = ½ × 6.0 × 1.0² = 3.0 J, so 6.0 J was lost.',
            ],
            answer: '1.0 m s⁻¹, with 6.0 J of kinetic energy lost',
            takeaway:
                '"Move off together" tells you momentum is conserved and kinetic energy is not — trying to conserve both gives inconsistent equations.',
        },
        {
            id: 'terminal-velocity',
            module: 'Physics',
            question:
                'A falling ball reaches terminal velocity when air resistance balances its weight. For this ball, air resistance is proportional to the square of its speed. A second ball is identical except that its weight is four times as large. What is its terminal velocity, as a multiple of the first ball’s?',
            steps: [
                'At terminal velocity, resistance equals weight: kv² = W.',
                'So v = √(W/k): terminal velocity scales with the square root of the weight.',
                'Four times the weight gives √4 = 2 times the terminal velocity.',
            ],
            answer: '2×',
            takeaway:
                'The trap is 4×, from carrying the proportionality straight across. "Proportional to the square" means the speed grows like the square root — inverting the relationship is half the marks in the proportionality questions.',
        },
        {
            id: 'waves-at-a-boundary',
            module: 'Physics',
            question:
                'Water waves of wavelength 2.5 cm travel at 20 cm s⁻¹ in the deep part of a tank, then cross into a shallow region where they travel at 12 cm s⁻¹. What is their wavelength in the shallow region?',
            steps: [
                'Frequency is set by the source and cannot change at the boundary: f = v/λ = 20/2.5 = 8 Hz.',
                'In the shallow region the same 8 Hz travels at 12 cm s⁻¹: λ = 12/8.',
            ],
            answer: '1.5 cm',
            takeaway:
                'The boundary conserves frequency, not wavelength — waves cannot pile up or vanish at the line. If you held λ fixed and changed f, you inverted the one thing the boundary keeps.',
        },
    ],
    faq: [
        {
            q: 'Is a formula sheet given in ESAT Physics?',
            a: 'Do not plan around one. Assume the standard relationships need to be at your fingertips, and confirm what is provided in the official preparation material.',
        },
        {
            q: 'How much maths is in ESAT Physics?',
            a: 'Enough that Maths 1 fluency matters — rearranging, ratios, powers and roots, all without a calculator. Slow algebra costs Physics marks.',
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
            path: '/guides/esat-maths-1',
            blurb: 'the fluency Physics leans on.',
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
