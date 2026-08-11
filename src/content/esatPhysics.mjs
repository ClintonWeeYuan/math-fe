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
    description: 'What ESAT Physics asks of you, the topics that quietly cost marks, and worked ESAT Physics questions with full solutions. Plus a free timed paper in the real format.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free Physics paper →',
    h1: 'ESAT Physics questions',
    standfirst: 'ESAT Physics rewards candidates who can pick the right conserved quantity and commit to it in seconds. The content is A-level; the difficulty is that almost every question is two or three steps and there is no calculator to hide behind.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11',
    sections: [
        {
            id: 'what-it-covers',
            h2: 'What Physics covers',
            paras: [
                'ESAT Physics draws on the standard A-level areas — mechanics and motion, energy and momentum, electricity and circuits, waves, and materials — applied rather than recalled.',
                'Questions rarely ask you to state a definition. They give you a situation and expect you to notice which principle makes it tractable, which is a different skill from knowing the principle.',
                'The official content specification is the authority on scope, and it is revised between cycles.',
            ],
        },
        {
            id: 'where-marks-go',
            h2: 'Where the marks actually go',
            paras: [
                'The characteristic loss is choosing a valid method that takes four minutes when a one-line method existed. Conservation of energy or momentum will usually beat working through the kinematics.',
                'The other is dropping a case. Speed does not tell you direction, a square root has two signs, and a quantity that is equal at two moments usually is equal at two moments.',
                'Unit slips come third, and are mostly a symptom of rushing rather than of not knowing.',
            ],
        },
        {
            id: 'worked-examples',
            h2: 'Physics questions, worked through',
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
                'Our Physics diagnostics are full timed papers in the real format, and the report afterwards names the skills that went wrong rather than handing you a number. Set A is free to sit.',
            ],
        },
    ],
    workedExamples: [
        {
            id: 'parallel-resistors',
            module: 'Physics',
            question: 'A 6.0 Ω resistor and a 3.0 Ω resistor are connected in parallel across a 12 V supply of negligible internal resistance. Find the total current drawn from the supply.',
            steps: [
                'For resistors in parallel, 1/R = 1/6 + 1/3 = 1/6 + 2/6 = 3/6.',
                'So R = 2.0 Ω — smaller than either resistor, as a parallel combination always is.',
                'Then I = V/R = 12 ÷ 2.0.',
            ],
            answer: '6.0 A',
            takeaway: 'The check that catches the common error is the sanity one: a parallel combination is always less resistive than its smallest branch. Adding to get 9 Ω gives 1.3 A, and the answer being larger than either branch alone should look wrong immediately.',
        },
        {
            id: 'inelastic-collision',
            module: 'Physics',
            question: 'A 2.0 kg trolley moving at 3.0 m s⁻¹ collides with a stationary 4.0 kg trolley, and the two move off together. Find their common speed and the kinetic energy lost in the collision.',
            steps: [
                'Momentum is conserved: 2.0 × 3.0 = 6.0 kg m s⁻¹ before, and (2.0 + 4.0)v after.',
                'So v = 6.0 ÷ 6.0 = 1.0 m s⁻¹.',
                'Kinetic energy before = ½ × 2.0 × 3.0² = 9.0 J.',
                'Kinetic energy after = ½ × 6.0 × 1.0² = 3.0 J, so 6.0 J was lost.',
            ],
            answer: '1.0 m s⁻¹, with 6.0 J of kinetic energy lost',
            takeaway: 'Momentum is conserved here and kinetic energy is not — that is what "move off together" tells you. Trying to conserve both gives an inconsistent pair of equations, and the time is lost before you work out why.',
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
            q: 'Is a formula sheet given in ESAT Physics?',
            a: 'Do not plan around one. Work on the assumption that the standard relationships need to be at your fingertips, and confirm what is provided against the official preparation material before the day.',
        },
        {
            q: 'How much maths is in ESAT Physics?',
            a: 'Enough that Mathematics 1 fluency matters — rearranging, ratios, powers and roots, all without a calculator. Candidates who are slow at the algebra lose Physics marks for reasons that have nothing to do with physics.',
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
