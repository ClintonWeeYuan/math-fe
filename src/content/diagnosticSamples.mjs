/**
 * Two sample questions per paper, shown before anyone signs in.
 *
 * Written for this page, in the style of the test. Deliberately NOT drawn
 * from the diagnostic bank: those 27 are the scored instrument, and putting
 * any of them on a public page would mean a student could meet them before
 * sitting them — and would hand a scraper the thing we are trying to protect.
 *
 * Answers are not shown. The purpose is to let someone judge the format and
 * the difficulty before committing 40 uninterrupted minutes, not to teach —
 * the guides do that, with full worked solutions.
 *
 * The distractors are the mistakes the question actually invites, so the
 * options look like the real thing rather than three obviously wrong numbers.
 * Every correct value has been worked by hand; the same questions appear
 * worked through in full on the matching guide.
 */

export const SAMPLES_BY_SUBJECT = {
    'ESAT Math 1': {
        guidePath: '/guides/esat-maths-1',
        questions: [
            {
                stem: 'Solve log₂(x) + log₂(x − 2) = 3.',
                options: ['x = −2', 'x = 4', 'x = 4 or x = −2', 'No real solution'],
            },
            {
                stem: 'The first three terms of a geometric series are 8, 12 and 18. What is the sum to infinity?',
                options: ['−16', '16', '48', 'It has none — the series diverges'],
            },
        ],
    },
    'ESAT Math 2': {
        guidePath: '/guides/esat-maths-2',
        questions: [
            {
                stem: 'The curve y = x³ − 6x² + 9x + 1 has stationary points at x = 1 and x = 3. What is their nature?',
                options: [
                    'Both are minima',
                    'x = 1 is a maximum, x = 3 is a minimum',
                    'x = 1 is a minimum, x = 3 is a maximum',
                    'Both are points of inflection',
                ],
            },
            {
                stem: 'Evaluate ∫₁² (3x² − 2x) dx.',
                options: ['2', '4', '6', '8'],
            },
        ],
    },
    'ESAT Physics': {
        guidePath: '/guides/esat-physics',
        questions: [
            {
                stem: 'A 2.0 kg trolley moving at 3.0 m s⁻¹ collides with a stationary 4.0 kg trolley, and the two move off together. What is their common speed?',
                options: ['0.5 m s⁻¹', '1.0 m s⁻¹', '1.5 m s⁻¹', '3.0 m s⁻¹'],
            },
            {
                stem: 'A 6.0 Ω and a 3.0 Ω resistor are connected in parallel across a 12 V supply of negligible internal resistance. What current is drawn?',
                options: ['1.3 A', '2.0 A', '6.0 A', '18 A'],
            },
        ],
    },
    'ESAT Chemistry': {
        guidePath: '/guides/esat-chemistry',
        questions: [
            {
                stem: '25.0 cm³ of 0.100 mol dm⁻³ sodium hydroxide is exactly neutralised by 20.0 cm³ of sulfuric acid. What is the concentration of the acid?',
                options: [
                    '0.0625 mol dm⁻³',
                    '0.0800 mol dm⁻³',
                    '0.125 mol dm⁻³',
                    '0.250 mol dm⁻³',
                ],
            },
            {
                stem: 'What volume of oxygen at RTP burns 0.20 mol of propane completely? (Molar gas volume = 24 dm³ mol⁻¹)',
                options: ['4.8 dm³', '9.6 dm³', '24 dm³', '120 dm³'],
            },
        ],
    },
    'ESAT Biology': {
        guidePath: '/guides/esat-biology',
        questions: [
            {
                stem: 'Two plants heterozygous for two independently assorting genes (PpTt) are crossed. Of 320 offspring, how many are expected to show both recessive phenotypes?',
                options: ['20', '40', '80', '120'],
            },
            {
                stem: 'A cube-shaped organism has sides of 2 mm. What is its surface area to volume ratio?',
                options: ['0.33 mm⁻¹', '1.5 mm⁻¹', '3 mm⁻¹', '24 mm⁻¹'],
            },
        ],
    },
}

/** The samples for a paper, or null if that paper has none yet. */
export function samplesFor(subject) {
    if (!subject) return null
    return SAMPLES_BY_SUBJECT[subject] ?? null
}
