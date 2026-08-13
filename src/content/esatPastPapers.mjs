/**
 * Content for the ESAT past-papers guide.
 *
 * Targets the words students actually search — "past papers", "specimen
 * papers", "sample papers" — rather than our own product vocabulary of
 * diagnostics and skills reports. Search Console shows every top query for
 * the existing ESAT guide is a "papers" or "questions" query.
 *
 * Factual claims match the ESAT practice guide and come from the same
 * sources: UAT-UK, Cambridge and Imperial, checked August 2026. Where that
 * guide and this one state the same fact, they must agree — a reader who
 * lands on both should not have to work out which is current.
 *
 * The worked examples are written for this page, in the style of the test.
 * They are deliberately not taken from the official papers (not ours to
 * republish) nor from our own diagnostic bank (that is the scored
 * instrument, and publishing it with solutions would spend it). Every
 * numerical answer below has been worked through by hand.
 */

export const GUIDE = {
    path: '/guides/esat-past-papers',
    title: 'ESAT Past Papers, Specimen Papers and Sample Questions | JomExam',
    description:
        'Every official ESAT past paper and specimen paper, where to find them, and what to do once you have worked through them. Includes worked ESAT questions with full solutions, and a free timed paper for each module.',
    eyebrow: 'ESAT guide',
    ctaPath: '/diagnostics/esat',
    ctaLabel: 'Sit a free ESAT paper →',
    h1: 'ESAT past papers and specimen papers',
    standfirst:
        'There is less official ESAT material than students expect, and it runs out quickly. This page sets out what exists, how to get the most from each paper, and what to do next — because the honest answer to "where are the rest" is that they do not exist yet.',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-12',
    sections: [
        {
            id: 'what-exists',
            h2: 'What official ESAT papers exist',
            paras: [
                'UAT-UK, the body that runs the test, publishes a content specification, an ESAT guide to the underlying maths and science, and specimen and practice tests through Pearson, alongside an archive of past papers.',
                'Work through those first, under timed conditions. They are the only material written by the people who write the real test.',
                'The catch is depth. The ESAT replaced the ENGAA and NSAA only recently, so there is no twenty-year back catalogue. Most candidates exhaust the official papers before October, and a paper you have already seen tells you nothing new about your timing.',
            ],
        },
        {
            id: 'papers-vs-questions',
            h2: 'Past papers, specimen papers and sample questions are not the same thing',
            paras: [
                'The terms get used interchangeably, and they are useful at different points.',
                'A specimen paper shows the format. A past paper was actually sat, so it also shows the real standard. Sample questions are single items — good for drilling one topic, useless for practising the thing the ESAT is hard at, which is finishing.',
            ],
            table: {
                caption:
                    'What each kind of ESAT material is good for and where it comes from',
                head: ['Material', 'Comes from', 'Best used for'],
                rows: [
                    [
                        'Specimen papers',
                        'UAT-UK, via Pearson',
                        'Learning the format before you spend a real paper on it',
                    ],
                    [
                        'Past papers',
                        'UAT-UK archive',
                        'Judging the genuine standard, under strict timing',
                    ],
                    [
                        'Sample questions',
                        'UAT-UK content specification and guide',
                        'Drilling one topic where you know you are weak',
                    ],
                    [
                        'ENGAA and NSAA papers',
                        'The predecessor tests',
                        'Extra material of a similar flavour, but not the same syllabus — check each question against the current specification',
                    ],
                ],
            },
        },
        {
            id: 'timing',
            h2: 'The constraint the papers are really testing',
            paras: [
                'Each module is 27 questions in 40 minutes: under 90 seconds each, no calculator, multi-step. Almost nobody fails because they could not eventually do the questions — they fail because they could not do them at that pace.',
                'So working slowly through a paper, checking as you go, tells you very little. Sitting it once, timed and uninterrupted, tells you nearly everything — including that a question you can solve in four minutes is worth zero to you.',
                'There is no negative marking. If you have not started a question with ten seconds left, answer it anyway.',
            ],
        },
        {
            id: 'worked-examples',
            h2: 'Three ESAT-style questions, worked through',
            paras: [
                'Written in the style of the test, not copied from an official paper. Try each in under 90 seconds before reading the working.',
            ],
        },
        {
            id: 'after-the-papers',
            h2: 'What to do once the official papers are gone',
            paras: [
                'The useful question stops being "what is my score" and becomes "which specific thing costs me marks". A total out of 27 tells you the result of the problem, not its cause.',
                'That is what our diagnostics are for: a full timed paper in the real format, and a report naming the skills that went wrong. Set A of every module is free.',
            ],
        },
    ],
    workedExamples: [
        {
            id: 'tangent-line',
            module: 'Mathematics 1',
            question:
                'The line y = 2x + c is a tangent to the curve y = x² + 3x + 5. Find the value of c.',
            steps: [
                'A tangent meets the curve exactly once, so set them equal and require a single root: x² + 3x + 5 = 2x + c.',
                'Rearrange to x² + x + (5 − c) = 0.',
                'One repeated root means the discriminant is zero: b² − 4ac = 1² − 4(1)(5 − c) = 0.',
                'So 1 − 20 + 4c = 0, giving 4c = 19.',
            ],
            answer: 'c = 19/4',
            takeaway:
                'The word "tangent" is the whole question: read it as "discriminant equals zero" and a curve-sketching problem becomes one line of algebra.',
        },
        {
            id: 'kinetic-energy-twice',
            module: 'Physics',
            question:
                'A ball of mass 0.50 kg is thrown vertically upwards at 20 m s⁻¹. Taking g = 10 m s⁻², how much time passes between the two moments at which its kinetic energy is 25 J? Ignore air resistance.',
            steps: [
                'Kinetic energy is ½mv², so 25 = ½ × 0.50 × v², giving v² = 100 and v = 10 m s⁻¹.',
                'Speed 10 m s⁻¹ happens twice: once going up, once coming back down.',
                'Using v = u − gt on the way up: 10 = 20 − 10t, so t = 1 s.',
                'On the way down the velocity is −10 m s⁻¹: −10 = 20 − 10t, so t = 3 s.',
            ],
            answer: '2 seconds',
            takeaway:
                'Energy is a scalar and cannot tell you direction — which is exactly why there are two answers. Stopping at 1 s is the trap.',
        },
        {
            id: 'combustion-formula',
            module: 'Chemistry',
            question:
                'Burning 0.25 mol of a hydrocarbon completely produces 22.0 g of carbon dioxide and 13.5 g of water. Determine its molecular formula. (Mr: CO₂ = 44, H₂O = 18)',
            steps: [
                'Moles of CO₂ = 22.0 ÷ 44 = 0.50 mol, and every carbon atom ends up in one CO₂, so there are 0.50 mol of carbon.',
                'Moles of H₂O = 13.5 ÷ 18 = 0.75 mol, and each water carries two hydrogens, so there are 1.50 mol of hydrogen.',
                'Divide through by the 0.25 mol of hydrocarbon burnt: 0.50 ÷ 0.25 = 2 carbons, 1.50 ÷ 0.25 = 6 hydrogens.',
            ],
            answer: 'C₂H₆ (ethane)',
            takeaway:
                'Divide by the moles burnt, not by the smallest number of moles. Reaching for the empirical formula out of habit gives CH₃, which is not a molecule.',
        },
    ],
    faq: [
        {
            q: 'Where can I download official ESAT past papers?',
            a: 'From UAT-UK, the body that runs the test. It publishes the content specification, an ESAT guide, and specimen and practice tests delivered through Pearson, alongside an archive of past papers. Use the official material before anything written by a prep company, ours included.',
            link: {
                label: 'Official ESAT preparation materials (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/prepare/',
            },
        },
        {
            q: 'How many ESAT past papers are there?',
            a: 'Far fewer than for an established A-level subject. The ESAT only replaced the ENGAA and NSAA recently, so there is no long back catalogue, and most candidates work through everything official well before the October sitting. Once you have sat a paper under timed conditions it is spent — you cannot un-see the questions.',
        },
        {
            q: 'Can I use ENGAA and NSAA past papers for ESAT practice?',
            a: 'They are worth using for extra material of a similar flavour, but they are not the same test and not the same syllabus. Check anything you attempt against the current ESAT content specification before assuming it is representative, particularly in Physics and Chemistry.',
            link: {
                label: 'Official ESAT preparation materials (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/prepare/',
            },
        },
        {
            q: 'Are ESAT specimen papers the same as past papers?',
            a: 'No. A specimen paper shows you the format and the style of question; a past paper is one that candidates actually sat, so it also shows you the real standard. Use a specimen paper first, so that you spend a past paper on a timed attempt rather than on learning what the answer sheet looks like.',
        },
        {
            q: 'How long is each ESAT module?',
            a: '27 questions in 40 minutes per module, with no calculator and no negative marking. That is under 90 seconds a question, which is why practising untimed tells you so little — and why leaving anything blank is a straightforward loss.',
            link: {
                label: 'How ESAT results are reported (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
            },
        },
        {
            q: 'When is the next ESAT sitting?',
            a: 'There are two: 12–16 October 2026 and 4–8 January 2027. Applicants to Cambridge and Oxford must sit the October window. Booking for October closes on 28 September 2026 at 6pm BST. You register yourself through a UAT-UK account and then book a seat with Pearson — your school will not do it for you. Confirm every date on the official site before relying on it, as they move each cycle.',
            link: {
                label: 'Official ESAT dates and registration (UAT-UK)',
                url: 'https://esat-tmua.ac.uk/register/',
            },
        },
    ],
    sources: [
        {
            label: 'UAT-UK (the official ESAT body)',
            url: 'https://esat-tmua.ac.uk/about-the-tests/esat-test/',
        },
        {
            label: 'University of Cambridge — ESAT',
            url: 'https://www.undergraduate.study.cam.ac.uk/apply/how/science-engineering-admission-test',
        },
        {
            label: 'Imperial College London — ESAT',
            url: 'https://www.imperial.ac.uk/study/apply/undergraduate/process/admissions-tests/esat/',
        },
    ],
}
