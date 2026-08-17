import { GUIDE as esatMaths1 } from './esatMaths1.mjs'
import { GUIDE as esatMaths2 } from './esatMaths2.mjs'
import { GUIDE as esatPhysics } from './esatPhysics.mjs'
import { GUIDE as esatChemistry } from './esatChemistry.mjs'
import { GUIDE as esatBiology } from './esatBiology.mjs'
import { frameworkFor } from '../lib/diagnosticSkillFrameworks.ts'

/**
 * The subject practice-test landing pages — the product surface for each
 * subject's diagnostic.
 *
 * These exist to catch "esat physics practice test" and "esat physics practice
 * questions", which the guides do not: a guide answers "what does this module
 * ask of me", and someone typing "practice test" wants the paper. The H1 and
 * title therefore match the query exactly; that phrasing is the point of the
 * page, not a stylistic choice.
 *
 * Built from one shape rather than five near-identical files. The rollout
 * calls for cloning the Physics template per subject "swapping the subject
 * name, the guide links, the widget question, and the sample-paper link" —
 * which is a function, not a copy-paste, and a copy-paste is how five pages
 * end up with four different versions of the same sentence.
 *
 * Two per-subject facts are read from where they already live rather than
 * restated here: the skills come from the real skill framework, and the
 * embedded question from that subject's guide. Nothing is authored twice.
 */

const SUBJECTS = [
    {
        guide: esatMaths1,
        subject: 'Mathematics 1',
        short: 'Maths 1',
        slug: 'esat-maths-1-practice-test',
        diagnosticSubject: 'ESAT Math 1',
        miniSetId: 'bc592d4f-f122-437d-b552-d32ede57e8c7',
        pdf: 'jomexam_esat_maths1_sample_paper.pdf',
        exampleId: 'reverse-percentages',
    },
    {
        guide: esatMaths2,
        subject: 'Mathematics 2',
        short: 'Maths 2',
        slug: 'esat-maths-2-practice-test',
        diagnosticSubject: 'ESAT Math 2',
        miniSetId: 'b984cef2-7411-4ef8-93e5-f9a69f88dc7c',
        pdf: 'jomexam_esat_maths2_sample_paper.pdf',
        exampleId: 'circle-in-disguise',
    },
    {
        guide: esatPhysics,
        subject: 'Physics',
        short: 'Physics',
        slug: 'esat-physics-practice-test',
        diagnosticSubject: 'ESAT Physics',
        miniSetId: '9fa1dcad-bf4e-4d90-8fa9-5597b33aacdd',
        pdf: 'jomexam_esat_physics_sample_paper.pdf',
        exampleId: 'terminal-velocity',
    },
    {
        guide: esatChemistry,
        subject: 'Chemistry',
        short: 'Chemistry',
        slug: 'esat-chemistry-practice-test',
        diagnosticSubject: 'ESAT Chemistry',
        miniSetId: 'f50d8b42-6ee8-492a-bc73-4fd3fd10b200',
        pdf: 'jomexam_esat_chemistry_sample_paper.pdf',
        exampleId: 'dilution',
    },
    {
        guide: esatBiology,
        subject: 'Biology',
        short: 'Biology',
        slug: 'esat-biology-practice-test',
        diagnosticSubject: 'ESAT Biology',
        miniSetId: '0627f52e-8cf1-4249-a04b-6c9e193185cf',
        pdf: 'jomexam_esat_biology_sample_paper.pdf',
        exampleId: 'magnification',
    },
]

/** The first few skills this subject's report is built on, named as the
 *  report names them — read from the framework rather than restated, so a
 *  renamed axis cannot leave this page describing one that no longer
 *  exists. */
function skillPhrase(diagnosticSubject) {
    const names = Object.values(frameworkFor(diagnosticSubject) ?? {})
    if (names.length === 0) return 'the skills the report is built on'
    return (
        names
            .slice(0, 4)
            .map((n) => n.toLowerCase())
            .join(', ') +
        ', and the rest of the framework the report is built on'
    )
}

function landingPage(entry) {
    const { guide, subject, short, slug, miniSetId, pdf, exampleId } = entry
    const example = guide.workedExamples?.find((e) => e.id === exampleId)
    if (example === undefined) {
        throw new Error(
            `${slug}: no worked example "${exampleId}" on ${guide.path} — the ` +
                `embedded question must come from that subject's guide, not be written here.`
        )
    }

    return {
        path: `/${slug}`,
        title: `ESAT ${subject} Practice Test — Free Timed Paper & Skills Report | JomExam`,
        description: `A free ESAT ${subject} practice test in the real format — 27 questions, 40 minutes — with a report naming the skill behind every wrong answer. Plus a free mini test and a downloadable sample paper.`,
        parent: { path: '/diagnostics/esat', label: 'ESAT diagnostics' },
        eyebrow: 'ESAT practice test',
        ctaPath: '/diagnostics/esat',
        ctaLabel: `Sit the free ${short} paper →`,
        h1: `ESAT ${subject} practice test`,
        standfirst: `A full ESAT ${subject} paper in the real format — 27 questions, 40 minutes, no calculator — with a report that names the skill behind every wrong answer, not just a score. Set A is free.`,
        publishedAt: '2026-08-17',
        updatedAt: '2026-08-17',
        sections: [
            {
                id: 'what-it-measures',
                h2: 'What the paper measures',
                paras: [
                    `Every question is tagged twice: by topic, and by the skill that decides the mark — ${skillPhrase(entry.diagnosticSubject)}. A wrong answer does not just cost a mark; it tells the report which faulty step produced it, because every wrong option encodes a specific misconception.`,
                    'The result is a report you can act on: not "you found this hard", but the particular inversion or dropped case that cost you each question — with your time on every question read against the real 90-seconds-per-question pace.',
                ],
                // One sentence of format above, and the canonical home for the
                // rest. The §2 grep is over /guides/*, which these are not,
                // but restating scoring here would still be the duplication
                // the canonical-home rule exists to stop.
                links: [
                    {
                        path: '/guides/esat-practice-tests',
                        label: 'ESAT practice tests guide',
                        note: 'The full format and scoring, stated once and kept current there.',
                    },
                ],
            },
            {
                id: 'short-on-time',
                h2: 'Short on time?',
                paras: [
                    'The mini test is ten questions in fifteen minutes — the real pace at a quarter of the length — with an indicative report at the end. It is the right first step if you are new to the format.',
                ],
                links: [
                    {
                        path: `/diagnostic/sets/${miniSetId}`,
                        label: `Try the mini ${short} test`,
                        note: 'Ten questions in fifteen minutes, free.',
                    },
                ],
            },
            {
                id: 'worked-examples',
                h2: 'Try a question now',
                paras: [
                    `One question in the style of the paper. Give it 90 seconds before reading the working.`,
                ],
            },
            {
                id: 'sample-paper',
                h2: 'Download a sample paper',
                paras: [
                    `ESAT-style ${subject} questions with worked solutions and the trap named in each. Printable, and free to share with attribution.`,
                ],
                downloads: [
                    {
                        path: `/sample-papers/${pdf}`,
                        label: `Download the JomExam ESAT ${subject} sample paper (PDF)`,
                        note: 'Free, no sign-up.',
                    },
                ],
            },
        ],
        // Exactly one, per the rollout: this page's job is the paper, not a
        // warm-up set.
        workedExamples: [example],
        faq: [
            {
                q: `Are there free ESAT ${subject} practice tests?`,
                a: `Yes — Set A of the JomExam ${subject} diagnostic is free to sit in full, report included, and the ten-question mini test is free too. Use the official UAT-UK specimen material as well; what exists and what each paper is for is on the ESAT past papers guide.`,
                link: {
                    label: 'Official ESAT preparation materials (UAT-UK)',
                    url: 'https://esat-tmua.ac.uk/prepare/',
                },
            },
            {
                q: 'How hard are the questions?',
                a: 'Calibrated to the real test: A-level content, two or three steps, no calculator, 90 seconds each. If a practice paper feels comfortably easy, it is not preparing you for this test.',
            },
            {
                q: `What is the format of ESAT ${subject}?`,
                a: `27 questions in 40 minutes, one of the modules chosen alongside compulsory Mathematics 1. The full format and scoring live on the ESAT practice tests guide.`,
            },
        ],
        related: [
            {
                path: guide.path,
                blurb: 'what the module asks, with four worked questions and the traps named.',
            },
            {
                path: '/guides/esat-practice-tests',
                blurb: 'the format, scoring, and free papers for every module.',
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
        ],
    }
}

export const LANDING_PAGES = SUBJECTS.map(landingPage)

/** The landing page for a subject guide, so each guide can link to its own. */
export const LANDING_PAGE_FOR = Object.fromEntries(
    SUBJECTS.map((e, i) => [e.guide.path, LANDING_PAGES[i].path])
)
