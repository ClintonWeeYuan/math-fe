import { GUIDE as esatMaths1 } from './esatMaths1.mjs'
import { GUIDE as esatMaths2 } from './esatMaths2.mjs'
import { GUIDE as esatPhysics } from './esatPhysics.mjs'
import { GUIDE as esatChemistry } from './esatChemistry.mjs'
import { GUIDE as esatBiology } from './esatBiology.mjs'
import { GUIDE as tmuaPracticeGuide } from './tmuaPracticeGuide.mjs'
import { frameworkFor } from '../lib/diagnosticSkillFrameworks.ts'

/**
 * The practice-test landing pages — the product surface for each paper's
 * diagnostic.
 *
 * These exist to catch "esat physics practice test" and "tmua paper 2
 * practice test", which the guides do not: a guide answers "what does this
 * paper ask of me", and someone typing "practice test" wants the paper. The H1
 * and title therefore match the query exactly; that phrasing is the point of
 * the page, not a stylistic choice.
 *
 * Built from one shape rather than seven near-identical files, so seven pages
 * cannot end up with six versions of the same sentence.
 *
 * Per-paper facts are read from where they already live rather than restated
 * here: the skills from the real skill framework, and the question preview from
 * that subject's guide. Nothing is authored twice.
 *
 * The preview shows the question and its options only. These pages used to
 * embed the guide's full worked example, which made a third of each one a copy
 * of its guide — and Search Console showed the two competing for the same
 * queries, with the guide winning. The working now stays on the guide, and the
 * landing page links to it.
 */

/** What differs between the tests, as opposed to between papers. */
const TESTS = {
    esat: {
        name: 'ESAT',
        questions: 27,
        minutes: 40,
        paceSeconds: 90,
        ctaPath: '/diagnostics/esat',
        parent: { path: '/diagnostics/esat', label: 'ESAT diagnostics' },
        formatGuide: '/guides/esat-practice-tests',
        pastPapersGuide: '/guides/esat-past-papers',
        officialUrl: 'https://esat-tmua.ac.uk/prepare/',
    },
    tmua: {
        name: 'TMUA',
        questions: 20,
        minutes: 75,
        paceSeconds: 225,
        ctaPath: '/diagnostics/tmua',
        parent: { path: '/diagnostics/tmua', label: 'TMUA diagnostics' },
        formatGuide: '/guides/tmua-practice-tests',
        pastPapersGuide: '/guides/tmua-past-papers',
        officialUrl: 'https://esat-tmua.ac.uk/prepare/',
    },
}

const PAPERS = [
    {
        test: 'esat',
        guide: esatMaths1,
        subject: 'Mathematics 1',
        short: 'Maths 1',
        slug: 'esat-maths-1-practice-test',
        diagnosticSubject: 'ESAT Math 1',
        miniSetId: 'bc592d4f-f122-437d-b552-d32ede57e8c7',
        mini: { questions: 'ten', minutes: 'fifteen' },
        pdf: 'jomexam_esat_maths1_sample_paper.pdf',
        exampleId: 'reverse-percentages',
    },
    {
        test: 'esat',
        guide: esatMaths2,
        subject: 'Mathematics 2',
        short: 'Maths 2',
        slug: 'esat-maths-2-practice-test',
        diagnosticSubject: 'ESAT Math 2',
        miniSetId: 'b984cef2-7411-4ef8-93e5-f9a69f88dc7c',
        mini: { questions: 'ten', minutes: 'fifteen' },
        pdf: 'jomexam_esat_maths2_sample_paper.pdf',
        exampleId: 'circle-in-disguise',
    },
    {
        test: 'esat',
        guide: esatPhysics,
        subject: 'Physics',
        short: 'Physics',
        slug: 'esat-physics-practice-test',
        diagnosticSubject: 'ESAT Physics',
        miniSetId: '9fa1dcad-bf4e-4d90-8fa9-5597b33aacdd',
        mini: { questions: 'ten', minutes: 'fifteen' },
        pdf: 'jomexam_esat_physics_sample_paper.pdf',
        exampleId: 'terminal-velocity',
    },
    {
        test: 'esat',
        guide: esatChemistry,
        subject: 'Chemistry',
        short: 'Chemistry',
        slug: 'esat-chemistry-practice-test',
        diagnosticSubject: 'ESAT Chemistry',
        miniSetId: 'f50d8b42-6ee8-492a-bc73-4fd3fd10b200',
        mini: { questions: 'ten', minutes: 'fifteen' },
        pdf: 'jomexam_esat_chemistry_sample_paper.pdf',
        exampleId: 'dilution',
    },
    {
        test: 'esat',
        guide: esatBiology,
        subject: 'Biology',
        short: 'Biology',
        slug: 'esat-biology-practice-test',
        diagnosticSubject: 'ESAT Biology',
        miniSetId: '0627f52e-8cf1-4249-a04b-6c9e193185cf',
        mini: { questions: 'ten', minutes: 'fifteen' },
        pdf: 'jomexam_esat_biology_sample_paper.pdf',
        exampleId: 'magnification',
    },
    // TMUA has no sample PDF and its guide has no worked examples yet, so
    // neither page carries a download or a question preview. Both appear by
    // adding `pdf` / `exampleId` here once the material exists.
    {
        test: 'tmua',
        guide: tmuaPracticeGuide,
        subject: 'Paper 1',
        short: 'Paper 1',
        slug: 'tmua-paper-1-practice-test',
        diagnosticSubject: 'TMUA Paper 1',
        miniSetId: '6b74e135-a384-4e9e-b466-a88163999abf',
        mini: { questions: 'five', minutes: 'nineteen' },
        paperNote:
            'Paper 1 asks you to use maths you already know, mostly AS-level, in questions that look unfamiliar at first. The real skill is spotting which idea a question needs, and timed practice builds that instinct faster than you might expect.',
        hardness:
            'Written to the real standard: AS-level content in unfamiliar settings, no calculator, about 3¾ minutes a question. If it feels stretching, that is exactly right. It is preparing you for the real thing.',
    },
    {
        test: 'tmua',
        guide: tmuaPracticeGuide,
        subject: 'Paper 2',
        short: 'Paper 2',
        slug: 'tmua-paper-2-practice-test',
        diagnosticSubject: 'TMUA Paper 2',
        miniSetId: '846321b8-f25f-4305-94bf-31c55142d3ab',
        mini: { questions: 'five', minutes: 'nineteen' },
        paperNote:
            'Paper 2 is about mathematical reasoning: logic, proof, and spotting the flawed step in an argument. The maths is often simpler than Paper 1, but the formats are new to most students, so it is normal for it to feel strange at first. With a little focused practice, it clicks.',
        hardness:
            'Written to the real standard: familiar maths wrapped in logic and proof, no calculator, about 3¾ minutes a question. If the formats feel odd at first, that is completely normal, and it is exactly what practice fixes.',
    },
]

/** The first few skills this paper's report is built on, named as the report
 *  names them — read from the framework rather than restated, so a renamed
 *  axis cannot leave this page describing one that no longer exists. */
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

/** "90 seconds" or "3 minutes 45 seconds" — seconds under two minutes, the
 *  way the ESAT's pace is always quoted. */
function paceWords(seconds) {
    if (seconds < 120) return `${seconds} seconds`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s === 0 ? `${m} minutes` : `${m} minutes ${s} seconds`
}

/** The guide's worked example, as a question to try — no working, no
 *  misconceptions, and a link to the guide for both. */
function previewFor(entry) {
    if (!entry.exampleId) return undefined
    const example = entry.guide.workedExamples?.find(
        (e) => e.id === entry.exampleId
    )
    if (example === undefined || !example.options) {
        throw new Error(
            `${entry.slug}: no answerable worked example "${entry.exampleId}" on ` +
                `${entry.guide.path} — the previewed question must come from that ` +
                `subject's guide, not be written here.`
        )
    }
    return {
        module: example.module,
        question: example.question,
        options: example.options.map(({ letter, text }) => ({ letter, text })),
        solutionPath: `${entry.guide.path}#${example.id}`,
    }
}

function landingPage(entry) {
    const { guide, subject, short, slug, miniSetId, mini, pdf } = entry
    const t = TESTS[entry.test]
    const format = `${t.questions} questions, ${t.minutes} minutes`
    const preview = previewFor(entry)
    // "ESAT Physics paper", but "TMUA Paper 2" — not "Paper 2 paper".
    const paper = entry.test === 'tmua' ? short : `${short} paper`

    const sections = [
        {
            id: 'what-it-measures',
            h2: 'What the paper measures',
            paras: [
                ...(entry.paperNote ? [entry.paperNote] : []),
                `Every question is tagged twice: by topic, and by the skill that decides the mark — ${skillPhrase(entry.diagnosticSubject)}. A wrong answer does not just cost a mark; it tells the report which faulty step produced it, because every wrong option encodes a specific misconception.`,
                `The result is a report you can act on: not "you found this hard", but the particular inversion or dropped case that cost you each question — with your time on every question read against the real pace of ${paceWords(t.paceSeconds)} per question.`,
            ],
            // One sentence of format above, and the canonical home for the
            // rest — restating scoring here would be the duplication the
            // canonical-home rule exists to stop.
            links: [
                {
                    path: t.formatGuide,
                    label: `${t.name} practice tests guide`,
                    note: 'The full format and scoring, stated once and kept current there.',
                },
            ],
        },
        {
            id: 'short-on-time',
            h2: 'Short on time?',
            paras: [
                `The mini test is ${mini.questions} questions in ${mini.minutes} minutes — the real pace at a quarter of the length — with an indicative report at the end. It is the right first step if you are new to the format.`,
            ],
            links: [
                {
                    path: `/diagnostic/sets/${miniSetId}`,
                    label: `Try the mini ${short} test`,
                    note: `${mini.questions[0].toUpperCase()}${mini.questions.slice(1)} questions in ${mini.minutes} minutes, free.`,
                },
            ],
        },
    ]
    if (preview) {
        sections.push({
            id: 'question-preview',
            h2: 'Try a question now',
            paras: [
                `One question in the style of the paper. Give it ${paceWords(t.paceSeconds)}, then check your answer against the full working.`,
            ],
        })
    }
    if (pdf) {
        sections.push({
            id: 'sample-paper',
            h2: 'Download a sample paper',
            paras: [
                `${t.name}-style ${subject} questions with worked solutions and the trap named in each. Printable, and free to share with attribution.`,
            ],
            downloads: [
                {
                    path: `/sample-papers/${pdf}`,
                    label: `Download the JomExam ${t.name} ${subject} sample paper (PDF)`,
                    note: 'Free, no sign-up.',
                },
            ],
        })
    }

    return {
        path: `/${slug}`,
        // Kept inside the ~60 characters Google shows. "& Skills Report" cut
        // every one of these mid-word in results; the description carries it.
        title: `${t.name} ${subject} Practice Test — Free Timed Paper | JomExam`,
        description: `A free ${t.name} ${subject} practice test in the real format — ${format} — with a report naming the skill behind every wrong answer. Plus a free mini test${pdf ? ' and a downloadable sample paper' : ''}.`,
        parent: t.parent,
        eyebrow: `${t.name} practice test`,
        ctaPath: t.ctaPath,
        ctaLabel: `Sit the free ${paper} →`,
        h1: `${t.name} ${subject} practice test`,
        standfirst: `A full ${t.name} ${entry.test === 'tmua' ? subject : `${subject} paper`} in the real format — ${format}, no calculator — with a report that names the skill behind every wrong answer, not just a score. Set A is free.`,
        publishedAt: entry.test === 'esat' ? '2026-08-17' : '2026-09-15',
        updatedAt: '2026-09-15',
        sections,
        questionPreview: preview,
        faq: [
            {
                q: `Are there free ${t.name} ${subject} practice tests?`,
                a: `Yes — Set A of the JomExam ${subject} diagnostic is free to sit in full, report included, and the mini test is free too. Use the official UAT-UK material as well; what exists and what each paper is for is on the ${t.name} past papers guide.`,
                link: {
                    label: `Official ${t.name} preparation materials (UAT-UK)`,
                    url: t.officialUrl,
                },
            },
            {
                q: 'How hard are the questions?',
                a:
                    entry.test === 'esat'
                        ? 'Calibrated to the real test: A-level content, two or three steps, no calculator, 90 seconds each. If a practice paper feels comfortably easy, it is not preparing you for this test.'
                        : entry.hardness,
            },
            {
                q: `What is the format of ${t.name} ${subject}?`,
                a:
                    entry.test === 'esat'
                        ? `${format}, one of the modules chosen alongside compulsory Mathematics 1. The full format and scoring live on the ESAT practice tests guide.`
                        : `${format}, no calculator. Paper 1 and Paper 2 are sat together and scored separately; the full format and scoring live on the TMUA practice tests guide.`,
            },
        ],
        related: [
            {
                path: guide.path,
                blurb:
                    entry.test === 'esat'
                        ? 'what the module asks, with four worked questions and the traps named.'
                        : 'what each paper tests, and why Paper 2 catches people out.',
            },
            entry.test === 'esat'
                ? {
                      path: t.formatGuide,
                      blurb: 'the format, scoring, and free papers for every module.',
                  }
                : {
                      path: '/guides/tmua-dates',
                      blurb: 'sittings, deadlines and fees, updated each cycle.',
                  },
            {
                path: t.pastPapersGuide,
                blurb: 'what official material exists.',
            },
        ],
        sources: [
            {
                label: `${t.name} content specification (UAT-UK)`,
                url: t.officialUrl,
            },
        ],
    }
}

export const LANDING_PAGES = PAPERS.map(landingPage)

/**
 * The landing page for a subject guide, so each guide can link to its own.
 *
 * ESAT only: those are one guide per module, one landing page each. The TMUA
 * guide covers both papers, so it links to both landing pages from its body
 * instead of claiming one of them as "its" page.
 */
export const LANDING_PAGE_FOR = Object.fromEntries(
    PAPERS.map((e, i) => [e, LANDING_PAGES[i]])
        .filter(([e]) => e.test === 'esat')
        .map(([e, page]) => [e.guide.path, page.path])
)
