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
import { GUIDES } from '../src/content/guides.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SITE = 'https://www.jomexam.com'
// Overridable so a build can be pointed at a local API to check what these
// pages will actually contain, rather than finding out after deploying.
const API =
    process.env.PRERENDER_API ?? 'https://joyful-vitality-production.up.railway.app'

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

/** Published subjects, or null if the API can't be reached. */
async function fetchSubjects() {
    try {
        const res = await fetch(`${API}/subjects`, { signal: AbortSignal.timeout(15000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return await res.json()
    } catch (error) {
        console.warn(`  ! could not fetch subjects: ${error.message} — skipping subject pages`)
        return null
    }
}

/**
 * A page per published SPM subject.
 *
 * Built from the API rather than a hand-written list, so a subject reaches
 * search by being published — the same rule the catalogue follows. The pages
 * these replace served the prerendered homepage, canonical tag and all, which
 * told Google all three were duplicates of the front page.
 */
function subjectRoutes(subjects, topicPathsBySubject = new Map()) {
    return (subjects ?? [])
        .filter((s) => s.slug)
        .map((s) => ({
            path: `/spm/${s.slug}`,
            title: `${s.name} Practice Questions | JomExam`,
            description:
                `Practise ${s.name} by topic and difficulty — ${s.questionCount} exam-style SPM questions across ${s.topicCount} topics, free to work through at your own pace.`,
            body: `<h1>${esc(s.name)} practice questions</h1>
<p>${esc(String(s.questionCount))} exam-style questions across ${esc(String(s.topicCount))} topics, filterable by topic and difficulty. Free to work through at your own pace.</p>
<p><a href="/subjects">All SPM subjects</a></p>
${topicListMarkup(topicPathsBySubject.get(s.slug))}`,
        }))
}

/**
 * Links from a subject page to its topic pages.
 *
 * Only topics that actually got a page — linking to one that was skipped for
 * having nothing to show would send a crawler to the bare SPA shell.
 */
function topicListMarkup(topics) {
    const listed = (topics ?? []).filter((t) => t.name)
    if (listed.length === 0) return ''
    return `<h2>Practise by topic</h2><ul>${listed
        .map((t) => `<li><a href="${t.path}">${esc(t.name)}</a></li>`)
        .join('')}</ul>`
}

/** One subject with its topics, or null if the API can't be reached. */
async function fetchSubjectDetail(slug) {
    try {
        const res = await fetch(`${API}/subjects/by-slug/${slug}`, {
            signal: AbortSignal.timeout(15000),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return await res.json()
    } catch (error) {
        console.warn(`  ! could not fetch subject ${slug}: ${error.message}`)
        return null
    }
}

/** Published questions for one topic — what a crawler will actually read. */
async function fetchTopicQuestions(subjectId, topicId) {
    try {
        const res = await fetch(
            `${API}/questions/subject/paginated/${subjectId}?topics=${topicId}&size=6`,
            { signal: AbortSignal.timeout(15000) }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const page = await res.json()
        return page
    } catch (error) {
        console.warn(`  ! could not fetch questions for topic ${topicId}: ${error.message}`)
        return null
    }
}

// A topic page earns its place by having real questions to show. Below this,
// the page would be a heading and a count — and eighty of those across the
// site is the doorway-page pattern search engines penalise, not an SEO win.
const MIN_QUESTIONS_FOR_A_TOPIC_PAGE = 3

/**
 * A page per topic that has published questions with text.
 *
 * Deliberately not one per topic: the Mathematics banks are converted images
 * with no stem at all, so their topic pages would have nothing to say. They
 * still work as routes for students — they're just not worth indexing until
 * they hold something a search engine can read.
 */
async function topicRoutes(subject) {
    if (!subject?.slug) return []
    const routes = []
    for (const topic of subject.topics ?? []) {
        if (!topic.slug) continue
        const page = await fetchTopicQuestions(subject.id, topic.id)
        const items = (page?.items ?? []).filter((q) => q.stem)
        if (items.length < MIN_QUESTIONS_FOR_A_TOPIC_PAGE) continue

        const total = page.total
        routes.push({
            path: `/spm/${subject.slug}/${topic.slug}`,
            title: `${topic.name} — ${subject.name} Questions | JomExam`,
            description: `Practise ${topic.name} for ${subject.name}: ${total} exam-style questions with answers, filterable by difficulty.`,
            body: `<h1>${esc(topic.name)} — ${esc(subject.name)} questions</h1>
<p>${esc(String(total))} exam-style questions on ${esc(topic.name.toLowerCase())}, with answers. Free to work through at your own pace.</p>
<ul>${items
                .slice(0, 5)
                .map((q) => `<li>${esc(q.stem)}</li>`)
                .join('')}</ul>
<p><a href="/spm/${esc(subject.slug)}">All ${esc(subject.name)} topics</a></p>`,
        })
    }
    return routes
}

/** The subject catalogue as links a crawler can follow. */
function subjectsMarkup(subjects) {
    const listed = (subjects ?? []).filter((s) => s.slug)
    if (listed.length === 0) return ''
    return `<ul>${listed
        .map(
            (s) =>
                `<li><a href="/spm/${esc(s.slug)}">${esc(s.name)}</a> — ${esc(String(s.questionCount))} questions across ${esc(String(s.topicCount))} topics</li>`
        )
        .join('')}</ul>`
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
        `<p><a href="${esc(GUIDE.ctaPath)}">${esc(GUIDE.ctaLabel)}</a></p>` +
        '<section><h2>More guides</h2><ul>' +
        GUIDES.filter((g) => g.path !== GUIDE.path)
            .map((g) => `<li><a href="${esc(g.path)}">${esc(g.h1)}</a> — ${esc(g.description)}</li>`)
            .join('') +
        '</ul></section>'
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

const GUIDES_INDEX = {
    path: '/guides',
    title: 'ESAT & TMUA Guides | JomExam',
    description:
        'Straight answers on the ESAT and TMUA — what each test asks of you, the format, how results are reported, and how to use a practice paper properly.',
    body:
        '<h1>ESAT &amp; TMUA, explained.</h1>' +
        '<p>What each test actually asks of you, how it is scored, and how to get something useful out of a practice paper.</p>' +
        '<ul>' +
        GUIDES.map(
            (g) => `<li><a href="${esc(g.path)}"><strong>${esc(g.h1)}</strong></a> — ${esc(g.description)}</li>`
        ).join('') +
        '</ul>',
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
<li><a href="/guides">Guides — the ESAT and TMUA explained</a></li>
</ul></nav>`,
    },
    {
        path: '/admissions',
        title: 'Choose Your Test | JomExam Admissions',
        description:
            'Pick your admissions test — all five ESAT modules and both TMUA papers are live. Timed papers with a skills report, not just a score, and Set A of every paper free to sit.',
        body: `<h1>Which test are you preparing for?</h1>
<p>Each test gets its own diagnostics, skills report and catalogue.</p>
<ul>
<li><a href="/diagnostics/esat"><strong>ESAT</strong></a> — Engineering and Science Admissions Test, for Cambridge, Imperial and others. All five modules are live: Mathematics 1, Mathematics 2, Physics, Chemistry and Biology.</li>
<li><a href="/diagnostics/tmua"><strong>TMUA</strong></a> — Test of Mathematics for University Admission, for Cambridge, LSE, Warwick, Durham and others. Both papers are live: Paper 1 (Applications) and Paper 2 (Reasoning).</li>
</ul>
<p>Not sure what these tests involve? <a href="/guides">Read the ESAT and TMUA guides</a>.</p>`,
    },
    {
        path: '/diagnostics',
        test: null,
        title: 'Diagnostic Tests | JomExam',
        description:
            'Sit a timed ESAT or TMUA diagnostic and get a report mapped to specific skills, so you know exactly where you stand before you start prepping.',
        body: `<h1>Timed diagnostics.</h1>
<p>Sit a timed diagnostic and get a report mapped to specific skills — so you know exactly where to focus. Set A of every subject is free to sit.</p>
<p><a href="/guides">New to these tests? Read the guides</a></p>`,
    },
    {
        path: '/diagnostics/esat',
        test: 'esat',
        title: 'ESAT Practice Tests & Diagnostics | JomExam',
        description:
            'Timed ESAT diagnostics for Mathematics 1, Mathematics 2, Physics, Chemistry and Biology. Sit a paper under exam conditions and get a skills report showing exactly where to focus.',
        body: `<h1>ESAT diagnostics.</h1>
<p>Timed ESAT papers — Mathematics 1, Mathematics 2, Physics, Chemistry and Biology — each mapped to the skills the test examines. Set A of every subject is free to sit.</p>
<p><a href="/guides/esat-practice-tests">New to the ESAT? Read the ESAT practice guide</a></p>`,
    },
    {
        path: '/diagnostics/tmua',
        test: 'tmua',
        title: 'TMUA Practice Tests & Diagnostics | JomExam',
        description:
            'Timed TMUA diagnostics for Paper 1 and Paper 2. Sit a paper under exam conditions and get a skills report showing exactly where to focus.',
        body: `<h1>TMUA diagnostics.</h1>
<p>Timed TMUA papers — Paper 1 (Applications of Mathematical Knowledge) and Paper 2 (Mathematical Reasoning) — mapped to the skills each paper examines. Set A of each paper is free to sit.</p>
<p><a href="/guides/tmua-practice-tests">New to the TMUA? Read the TMUA practice guide</a></p>`,
    },
    {
        path: '/esat-tmua',
        title: 'ESAT & TMUA Preparation | JomExam',
        description:
            'Prepare for the ESAT and TMUA with timed diagnostics mapped to the skills each test examines — all five ESAT modules and both TMUA papers are live. Sit a paper, get a skills report, and know exactly where to focus.',
        body: `<h1>ESAT &amp; TMUA preparation.</h1>
<p>ESAT diagnostics are live for all five modules — Mathematics 1, Mathematics 2, Physics, Chemistry and Biology — as are TMUA Paper 1 and Paper 2. Timed papers mapped to specific skills, with Set A of every paper free to sit.</p>
<h2>How a diagnostic works</h2>
<ol>
<li><strong>Sit a timed paper</strong> — a real, timed set of questions under exam conditions.</li>
<li><strong>Get a skills report</strong> — a breakdown by the specific skills the test examines, with your timing on each question.</li>
<li><strong>Focus where it counts</strong> — see your strengths and the areas to drill first.</li>
</ol>
<p><a href="/diagnostics/esat">Start a free ESAT diagnostic</a> · <a href="/diagnostics/tmua">Start a free TMUA diagnostic</a></p>
<p><a href="/guides">Read the ESAT and TMUA guides</a></p>`,
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
<p>One-to-one tutoring is available with Hazel — Oxford DPhil in Engineering, with over 5,000 hours teaching maths, physics and chemistry online.</p>
<p><a href="/guides">Guides to the ESAT and TMUA</a></p>`,
    },
].concat([GUIDES_INDEX], GUIDE_ROUTES)

async function main() {
    // The template is dist/index.html — which this script also *writes*, as
    // the '/' route. A second run therefore reads a template whose #root is
    // already full, the empty-div replace below silently no-ops, and every
    // page ends up with the homepage's body while its title and canonical
    // look perfectly correct. Emptying #root here makes a re-run produce the
    // same output as a first run, so verifying locally means something.
    // Anchored on </body>, not on a following <script>: Vite emits its module
    // scripts in <head>, so #root is the last thing in the body and nothing
    // follows it. Greedy, so it reaches the root's own closing tag rather than
    // the first nested one.
    const template = (await readFile(join(DIST, 'index.html'), 'utf8')).replace(
        /<div id="root">[\s\S]*<\/div>(\s*<\/body>)/,
        '<div id="root"></div>$1'
    )
    let written = 0

    // Fetched once, not per route: every subject page comes from this list,
    // and so does the sitemap.
    const subjects = await fetchSubjects()

    // Topic pages need each subject's topic list and a sample of its
    // questions, so the detail is fetched once per subject and reused for
    // both the topic routes and the links from the subject page.
    const details = []
    for (const s of subjects ?? []) {
        if (!s.slug) continue
        const detail = await fetchSubjectDetail(s.slug)
        if (detail) details.push({ ...detail, questionCount: s.questionCount })
    }

    const topicPages = []
    for (const detail of details) {
        topicPages.push(...(await topicRoutes(detail)))
    }
    const topicPathsBySubject = new Map(
        details.map((d) => [
            d.slug,
            topicPages
                .filter((r) => r.path.startsWith(`/spm/${d.slug}/`))
                .map((r) => ({
                    path: r.path,
                    name: (d.topics ?? []).find(
                        (t) => r.path.endsWith(`/${t.slug}`)
                    )?.name,
                })),
        ])
    )

    const routes = [
        ...ROUTES,
        ...subjectRoutes(subjects, topicPathsBySubject),
        ...topicPages,
    ]

    for (const route of routes) {
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
        // Without these, the subject pages are reachable only from the
        // sitemap — no page on the site links to them, which is a weak signal
        // and a slow discovery path.
        if (route.path === '/subjects') {
            body += subjectsMarkup(subjects)
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
        // The prerendered copy is what a crawler reads, so a link that
        // exists only in the React tree does not count. Warn loudly rather
        // than let a page quietly lose its route to the guides.
        // /subjects and the SPM subject pages serve SPM students, for whom
        // the ESAT and TMUA guides are not relevant — linking them there would
        // be noise, not help.
        const exempt = ['/subjects']
        if (
            !route.path.startsWith('/guides') &&
            !route.path.startsWith('/spm/') &&
            !exempt.includes(route.path) &&
            !body.includes('href="/guides')
        ) {
            console.warn(`  ! ${route.path} has no link to the guides`)
        }
        console.log(`  prerendered ${route.path}`)
        written++
    }
    // The sitemap is generated from the same list that was just written, so
    // it cannot drift from what actually exists. It used to be a static file
    // in public/, which meant every new page needed someone to remember.
    const sitemap =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        routes
            .map((route) => `  <url>\n    <loc>${SITE}${route.path === '/' ? '/' : route.path}</loc>\n  </url>`)
            .join('\n') +
        '\n</urlset>\n'
    await writeFile(join(DIST, 'sitemap.xml'), sitemap)
    console.log(`prerender: ${written} routes, sitemap: ${routes.length} urls`)
}

main().catch((error) => {
    // A prerender failure must not break a deploy: the SPA still works, it
    // just loses the static copy until the next build.
    console.error('prerender failed (continuing):', error)
})
