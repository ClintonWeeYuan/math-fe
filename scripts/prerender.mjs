/**
 * Post-build prerender for the public marketing routes.
 *
 * The app is a client-rendered SPA, so a crawler fetching /diagnostics/tmua
 * received an empty <div id="root"> and the generic site-wide <title> — every
 * page looked identical, and only Google (sometimes) ran the JavaScript to
 * find out otherwise. Bing and every social-preview crawler saw nothing.
 *
 * This writes one static HTML file per public route, each carrying its own
 * title, description, canonical and Open Graph tags, plus real readable
 * content inside #root. React's createRoot() replaces the container's
 * children on mount, so the prerendered markup is a first paint for humans
 * and the whole page for crawlers — with no hydration mismatch to manage.
 *
 * Diagnostic listings are baked from the live API at build time, so the
 * catalogue pages carry actual set names. If the API is unreachable the
 * build still succeeds with the static copy only — SEO is never a reason to
 * fail a deploy.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GUIDE as ESAT_GUIDE } from '../src/content/esatPracticeGuide.mjs'
import { GUIDE as TMUA_GUIDE } from '../src/content/tmuaPracticeGuide.mjs'

/** Every search-facing guide, rendered from the same modules the React
 * pages use. Adding one here and in App.tsx is the whole job. */
const GUIDES = [ESAT_GUIDE, TMUA_GUIDE]

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SITE = 'https://www.jomexam.com'
const API = 'https://joyful-vitality-production.up.railway.app'

const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Fetch published sets for a test, or null if the API can't be reached. */
async function fetchSets(test) {
    const url = test
        ? `${API}/diagnostic/sets/published?test=${test}`
        : `${API}/diagnostic/sets/published`
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return await res.json()
    } catch (error) {
        console.warn(`  ! could not fetch ${url}: ${error.message} — using static copy only`)
        return null
    }
}

/** Catalogue sets as a readable list a crawler can index. */
function setsMarkup(sets) {
    if (!sets || sets.length === 0) return ''
    const bySubject = new Map()
    for (const s of sets) {
        const key = s.subject ?? 'Other'
        if (!bySubject.has(key)) bySubject.set(key, [])
        bySubject.get(key).push(s)
    }
    return [...bySubject.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
            ([subject, group]) =>
                `<section><h2>${esc(subject)}</h2><ul>` +
                group
                    .map(
                        (s) =>
                            `<li><a href="/diagnostic/sets/${esc(s.id)}"><strong>${esc(s.title)}</strong></a>` +
                            ` — ${esc(s.questionCount)} questions, ${esc(s.timeLimitMinutes)} minutes` +
                            `${s.isFree ? ', free to sit' : ', Season Pass'}</li>`
                    )
                    .join('') +
                '</ul></section>'
        )
        .join('')
}


/** The guide, rendered from the same content module the React page uses, so
 * the static copy and the live page can never disagree. */
function guideMarkup(GUIDE) {
    const sections = GUIDE.sections
        .map((section) => {
            const paras = section.paras.map((p) => `<p>${esc(p)}</p>`).join('')
            const table = section.table
                ? `<table><caption>${esc(section.table.caption)}</caption><thead><tr>` +
                  section.table.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('') +
                  '</tr></thead><tbody>' +
                  section.table.rows
                      .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
                      .join('') +
                  '</tbody></table>'
                : ''
            return `<section id="${esc(section.id)}"><h2>${esc(section.h2)}</h2>${paras}${table}</section>`
        })
        .join('')
    const faq =
        '<section><h2>Common questions</h2><dl>' +
        GUIDE.faq
            .map((f) => {
                const link = f.link
                    ? ` <a href="${esc(f.link.url)}" rel="noopener">${esc(f.link.label)}</a>`
                    : ''
                return `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}${link}</dd>`
            })
            .join('') +
        '</dl></section>'
    return (
        `<h1>${esc(GUIDE.h1)}</h1><p>${esc(GUIDE.standfirst)}</p>` +
        sections +
        faq +
        `<p><a href="${esc(GUIDE.ctaPath)}">${esc(GUIDE.ctaLabel)}</a></p>`
    )
}

/** FAQPage structured data — makes the answers eligible for rich results. */
function faqJsonLd(GUIDE) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: GUIDE.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.link ? `${f.a} See: ${f.link.url}` : f.a,
            },
        })),
    }
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

const GUIDE_ROUTES = GUIDES.map((g) => ({
    path: g.path,
    title: g.title,
    description: g.description,
    jsonLd: faqJsonLd(g),
    body: guideMarkup(g),
}))

const ROUTES = [
    {
        path: '/',
        title: 'JomExam — ESAT & TMUA Diagnostics · SPM Practice',
        description:
            'Timed ESAT and TMUA diagnostics mapped to real exam skills, with a skills report — plus SPM Mathematics and Add Maths practice by topic. Set A of every subject is free to sit.',
        body: `<h1>Every step of STEM, up to admissions.</h1>
<p>Timed ESAT and TMUA diagnostics mapped to real exam skills — the admissions tests for the world's top STEM courses — plus free SPM practice.</p>
<nav><ul>
<li><a href="/subjects">Revise my exams — SPM Mathematics and Additional Mathematics</a></li>
<li><a href="/admissions">Get into a top university — ESAT and TMUA admissions tests</a></li>
</ul></nav>`,
    },
    {
        path: '/admissions',
        title: 'Choose Your Test | JomExam Admissions',
        description:
            'Pick your admissions test — ESAT and TMUA diagnostics both live, with Paper 1 and Paper 2 for TMUA. Timed papers with a skills report, not just a score.',
        body: `<h1>Which test are you preparing for?</h1>
<p>Each test gets its own diagnostics, skills report and catalogue.</p>
<ul>
<li><a href="/diagnostics/esat"><strong>ESAT</strong></a> — Engineering and Science Admissions Test, for Cambridge, Imperial and others. Mathematics 1, Mathematics 2, Physics, Chemistry and Biology.</li>
<li><a href="/diagnostics/tmua"><strong>TMUA</strong></a> — Test of Mathematics for University Admission, for Cambridge, LSE, Warwick, Durham and Bath. Paper 1 and Paper 2.</li>
<li><strong>ESAT Chemistry</strong> — further diagnostics in development.</li>
</ul>`,
    },
    {
        path: '/diagnostics',
        test: null,
        title: 'Diagnostic Tests | JomExam',
        description:
            'Sit a timed ESAT or TMUA diagnostic and get a report mapped to specific skills, so you know exactly where you stand before you start prepping.',
        body: `<h1>Timed diagnostics.</h1>
<p>Sit a timed diagnostic and get a report mapped to specific skills — so you know exactly where to focus. Set A of every subject is free to sit.</p>`,
    },
    {
        path: '/diagnostics/esat',
        test: 'esat',
        title: 'ESAT Practice Tests & Diagnostics | JomExam',
        description:
            'Timed ESAT diagnostics for Mathematics 1, Mathematics 2, Physics, Chemistry and Biology. Sit a paper under exam conditions and get a skills report showing exactly where to focus.',
        body: `<h1>ESAT diagnostics.</h1>
<p>Timed ESAT papers — Mathematics 1, Mathematics 2, Physics, Chemistry and Biology — each mapped to the skills the test examines. Set A of every subject is free to sit.</p>`,
    },
    {
        path: '/diagnostics/tmua',
        test: 'tmua',
        title: 'TMUA Practice Tests & Diagnostics | JomExam',
        description:
            'Timed TMUA diagnostics for Paper 1 and Paper 2. Sit a paper under exam conditions and get a skills report showing exactly where to focus.',
        body: `<h1>TMUA diagnostics.</h1>
<p>Timed TMUA papers — Paper 1 (Applications of Mathematical Knowledge) and Paper 2 (Mathematical Reasoning) — mapped to the skills each paper examines. Set A of each paper is free to sit.</p>`,
    },
    {
        path: '/esat-tmua',
        title: 'ESAT & TMUA Preparation | JomExam',
        description:
            'Prepare for the ESAT and TMUA with timed diagnostics mapped to the skills the tests examine — ESAT and TMUA Paper 1 & 2 all live. Sit a paper, get a skills report, and know exactly where to focus.',
        body: `<h1>ESAT &amp; TMUA preparation.</h1>
<p>ESAT diagnostics are live now — timed papers mapped to specific skills, so you know exactly where to focus. TMUA Paper 1 and Paper 2 diagnostics are live too.</p>
<h2>How a diagnostic works</h2>
<ol>
<li><strong>Sit a timed paper</strong> — a real, timed set of questions under exam conditions.</li>
<li><strong>Get a skills report</strong> — a breakdown by the specific skills the test examines, with your timing on each question.</li>
<li><strong>Focus where it counts</strong> — see your strengths and the areas to drill first.</li>
</ol>
<p><a href="/diagnostics/esat">Start an ESAT diagnostic</a></p>`,
    },
    {
        path: '/subjects',
        title: 'SPM Practice by Subject | JomExam',
        description:
            'Practise SPM Mathematics and Additional Mathematics by topic and difficulty — real exam-style questions for Malaysian Form 4–5 students, with more STEM subjects on the way.',
        body: `<h1>SPM practice, at your own pace.</h1>
<p>Work through Mathematics and Additional Mathematics questions organised by topic — with Physics, Chemistry and Biology on the way. Start straight away; signing in just saves your progress.</p>`,
    },
    {
        path: '/about',
        title: 'About | JomExam — Oxford-Trained, Diagnostic-First STEM Prep',
        description:
            'JomExam is built by Hazel — Oxford DPhil in Engineering, 5,000+ hours taught across A-Level, IB, ESAT and TMUA — on one idea: find the gap before you drill.',
        body: `<h1>About JomExam</h1>
<p>JomExam began in Malaysia as SPM practice, and now builds timed diagnostics for the ESAT and TMUA admissions tests. Every diagnostic produces a skills report naming the specific gaps to work on.</p>
<p>One-to-one tutoring is available with Hazel — Oxford DPhil in Engineering, with over 5,000 hours teaching maths, physics and chemistry online.</p>`,
    },
].concat(GUIDE_ROUTES)

async function main() {
    const template = await readFile(join(DIST, 'index.html'), 'utf8')
    let written = 0

    for (const route of ROUTES) {
        const url = `${SITE}${route.path}`
        let html = template

        // Per-route metadata. The template's own tags are replaced rather than
        // appended, so a crawler never sees two competing titles.
        html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`)
        html = html.replace(
            /<meta name="description" content="[\s\S]*?"\/>/,
            `<meta name="description" content="${esc(route.description)}"/>`
        )
        html = html.replace(
            /<link rel="canonical" href="[\s\S]*?"\/>/,
            `<link rel="canonical" href="${url}"/>`
        )
        html = html.replace(
            /<meta property="og:title" content="[\s\S]*?"\/>/,
            `<meta property="og:title" content="${esc(route.title)}"/>`
        )
        html = html.replace(
            /<meta property="og:description" content="[\s\S]*?"\/>/,
            `<meta property="og:description" content="${esc(route.description)}"/>`
        )
        html = html.replace(
            /<meta property="og:url" content="[\s\S]*?"\/>/,
            `<meta property="og:url" content="${url}"/>`
        )

        // Real content inside #root. React replaces these children on mount.
        let body = route.body
        if ('test' in route) {
            body += setsMarkup(await fetchSets(route.test))
        }
        html = html.replace(
            '<div id="root"></div>',
            `<div id="root">${body}</div>`
        )
        if (route.jsonLd) {
            html = html.replace('</head>', `${route.jsonLd}</head>`)
        }

        const outDir = route.path === '/' ? DIST : join(DIST, route.path)
        await mkdir(outDir, { recursive: true })
        await writeFile(join(outDir, 'index.html'), html)
        console.log(`  prerendered ${route.path}`)
        written++
    }
    console.log(`prerender: ${written} routes`)
}

main().catch((error) => {
    // A prerender failure must not break a deploy: the SPA still works, it
    // just loses the static copy until the next build.
    console.error('prerender failed (continuing):', error)
})
