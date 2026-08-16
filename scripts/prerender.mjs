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
import { GUIDES, relatedTo } from '../src/content/guides.mjs'
import {
    ESAT_GUIDE_LINKS,
    GUIDE_LINKS_HEADING,
    PRIMARY_GUIDE_LINKS,
} from '../src/content/guideLinks.mjs'
import { AUTHOR } from '../src/content/author.mjs'
import { guideJsonLd, jsonLdText } from '../src/content/structuredData.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SITE = 'https://www.jomexam.com'
// Overridable so a build can be pointed at a local API to check what these
// pages will actually contain, rather than finding out after deploying.
const API =
    process.env.PRERENDER_API ??
    'https://joyful-vitality-production.up.railway.app'

const esc = (s) =>
    String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

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
        FAILURES.push(`diagnostic sets: ${error.message}`)
        console.warn(`  ! could not fetch ${url}: ${error.message}`)
        return null
    }
}

/**
 * Every API call that did not come back.
 *
 * Each fetch below degrades to null so one bad response cannot take out the
 * whole run — but degrading quietly is how a build ships the SPA shell with
 * no static pages and a sitemap to match, and reports success. These are
 * collected so the end of the run can refuse.
 */
const FAILURES = []

/** Published subjects, or null if the API can't be reached. */
async function fetchSubjects() {
    try {
        const res = await fetch(`${API}/subjects`, {
            signal: AbortSignal.timeout(15000),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return await res.json()
    } catch (error) {
        FAILURES.push(`subject list: ${error.message}`)
        console.warn(`  ! could not fetch subjects: ${error.message}`)
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
            description: `Practise ${s.name} by topic and difficulty — ${s.questionCount} exam-style SPM questions across ${s.topicCount} topics, free to work through at your own pace.`,
            body: `<h1>${esc(s.name)} practice questions</h1>
<p>${esc(String(s.questionCount))} exam-style questions across ${esc(String(s.topicCount))} topics, filterable by topic and difficulty. Free to work through at your own pace.</p>
<p><a href="/subjects">All SPM subjects</a></p>
${topicListMarkup(topicPathsBySubject.get(s.slug))}
${guideLinksMarkup()}`,
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
        FAILURES.push(`subject ${slug}: ${error.message}`)
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
        FAILURES.push(`questions for topic ${topicId}: ${error.message}`)
        console.warn(
            `  ! could not fetch questions for topic ${topicId}: ${error.message}`
        )
        return null
    }
}

// A topic page is worth *indexing* only if it has real questions to show.
// Below this it would be a heading and a count, and eighty of those across
// the site is the doorway-page pattern search engines penalise.
const MIN_QUESTIONS_TO_INDEX_A_TOPIC = 3

/**
 * A page for every topic — but only the ones with real text are indexable.
 *
 * Every topic gets a file, because /spm/** is deliberately not rewritten in
 * serve.json (a rewrite would shadow the prerendered pages, which was the
 * original bug), so a topic without a file is a hard 404 for a student who
 * clicks its link. That is what happened to all 69 Mathematics topics.
 *
 * The Mathematics banks are converted images with no stem at all, so their
 * topic pages have nothing a search engine can read. Those are written with
 * noindex and left out of the sitemap: the route works, and the thin page
 * isn't offered up for indexing. They become indexable on their own if the
 * subject ever gains text-based questions.
 */
async function topicRoutes(subject) {
    if (!subject?.slug) return []
    const routes = []
    for (const topic of subject.topics ?? []) {
        if (!topic.slug) continue
        const page = await fetchTopicQuestions(subject.id, topic.id)
        // stem for a question authored as text; searchText for one converted
        // from LaTeX, whose wording lives in a storage file the page loads
        // into an iframe and no crawler ever sees.
        const items = (page?.items ?? [])
            .map((q) => ({ ...q, text: q.stem ?? q.searchText }))
            .filter((q) => q.text)
        const total = page?.total ?? 0
        const indexable = items.length >= MIN_QUESTIONS_TO_INDEX_A_TOPIC

        routes.push({
            path: `/spm/${subject.slug}/${topic.slug}`,
            indexable,
            title: `${topic.name} — ${subject.name} Questions | JomExam`,
            description: `Practise ${topic.name} for ${subject.name}: ${total} exam-style questions with answers, filterable by difficulty.`,
            body: `<h1>${esc(topic.name)} — ${esc(subject.name)} questions</h1>
<p>${esc(String(total))} exam-style questions on ${esc(topic.name.toLowerCase())}, with answers. Free to work through at your own pace.</p>
${
    items.length > 0
        ? `<ul>${items
              .slice(0, 5)
              .map((q) => `<li>${esc(q.text)}</li>`)
              .join('')}</ul>`
        : ''
}
<p><a href="/spm/${esc(subject.slug)}">All ${esc(subject.name)} topics</a></p>
${guideLinksMarkup()}`,
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

/**
 * Links to the guides, for the foot of another page.
 *
 * Real <a href> elements in the static HTML, which is the only kind Google
 * is certain to follow — a router push or a link that appears after
 * hydration does not count. Rendered from the same list as the React
 * component so the two cannot disagree.
 */
function guideLinksMarkup(links = PRIMARY_GUIDE_LINKS) {
    return (
        `<section><h2>${esc(GUIDE_LINKS_HEADING)}</h2><ul>` +
        links
            .map(
                (link) =>
                    `<li><a href="${esc(link.path)}">${esc(link.anchor)}</a></li>`
            )
            .join('') +
        '</ul></section>'
    )
}

/** The guide, rendered from the same content module the React page uses, so
 * the static copy and the live page can never disagree. */
function guideMarkup(GUIDE) {
    const sections = GUIDE.sections
        .map((section) => {
            const paras = section.paras.map((p) => `<p>${esc(p)}</p>`).join('')
            // Where a fact this page gave up now lives. A real <a> in the
            // static HTML, because the whole point of moving a fact to a
            // canonical home is the internal link that replaces it — one that
            // only appeared after hydration would not be a link to a crawler.
            const links = (section.links ?? [])
                .map(
                    (l) =>
                        `<p><a href="${esc(l.path)}">${esc(l.label)}</a> — ${esc(l.note)}</p>`
                )
                .join('')
            const table = section.table
                ? `<table><caption>${esc(section.table.caption)}</caption><thead><tr>` +
                  section.table.head
                      .map((h) => `<th scope="col">${esc(h)}</th>`)
                      .join('') +
                  '</tr></thead><tbody>' +
                  section.table.rows
                      .map(
                          (r) =>
                              `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`
                      )
                      .join('') +
                  '</tbody></table>'
                : ''
            // The questions belong under the heading that introduces
            // them, not after every section — same note as GuideArticle.
            // Marked here and filled below, because `examples` is built
            // after this map.
            const here =
                section.id === 'worked-examples' ? '<!--JX_EXAMPLES-->' : ''
            return `<section id="${esc(section.id)}"><h2>${esc(section.h2)}</h2>${paras}${links}${table}${here}</section>`
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
    // Everything a crawler needs to see without running JavaScript: the
    // byline and dates that make the page answerable to somebody, the
    // breadcrumb trail, and the worked solutions that are the reason the
    // page is worth ranking. All of it authored in the content module, so
    // the static copy and the React page cannot drift apart.
    const breadcrumb =
        '<nav aria-label="Breadcrumb"><ol>' +
        '<li><a href="/">Home</a></li>' +
        '<li><a href="/guides">Guides</a></li>' +
        `<li>${esc(GUIDE.h1)}</li>` +
        '</ol></nav>'

    const byline =
        `<p>By <a href="${esc(AUTHOR.path)}">${esc(AUTHOR.name)}</a>, ` +
        `${esc(AUTHOR.credential)}. Published ` +
        `<time datetime="${esc(GUIDE.publishedAt)}">${esc(GUIDE.publishedAt)}</time>` +
        (GUIDE.updatedAt !== GUIDE.publishedAt
            ? `, updated <time datetime="${esc(GUIDE.updatedAt)}">${esc(GUIDE.updatedAt)}</time>`
            : '') +
        '.</p>'

    // The crawlable copy of each worked example. Options and their
    // misconceptions are emitted in full here, exactly as the React component
    // renders them: the interactive version only ever toggles `hidden`, so
    // what a reader can reach by clicking and what a crawler reads without
    // clicking must be the same text. These pages are supposed to rank on
    // having worked solutions — emitting the question and withholding the
    // reasoning would rank them on nothing.
    const examples = (GUIDE.workedExamples ?? [])
        .map(
            (example) =>
                `<article id="${esc(example.id)}"><p>${esc(example.module)}</p>` +
                `<p>${esc(example.question)}</p>` +
                (example.options
                    ? '<ul>' +
                      example.options
                          .map(
                              (option) =>
                                  `<li>${esc(option.letter)} ${esc(option.text)}` +
                                  (option.misconception
                                      ? ` — ${esc(option.misconception)}`
                                      : '') +
                                  '</li>'
                          )
                          .join('') +
                      '</ul>'
                    : '') +
                '<ol>' +
                example.steps.map((step) => `<li>${esc(step)}</li>`).join('') +
                `</ol><p>Answer: ${esc(example.answer)}</p>` +
                `<p>${esc(example.takeaway)}</p></article>`
        )
        .join('')

    return (
        breadcrumb +
        `<h1>${esc(GUIDE.h1)}</h1><p>${esc(GUIDE.standfirst)}</p>` +
        byline +
        sections.replace('<!--JX_EXAMPLES-->', examples) +
        faq +
        `<p><a href="${esc(GUIDE.ctaPath)}">${esc(GUIDE.ctaLabel)}</a></p>` +
        '<section><h2>More guides</h2><ul>' +
        relatedTo(GUIDE)
            .map(
                ({ guide, blurb }) =>
                    `<li><a href="${esc(guide.path)}">${esc(guide.h1)}</a> — ${esc(blurb)}</li>`
            )
            .join('') +
        '</ul></section>'
    )
}

/**
 * Article, BreadcrumbList and FAQPage for a guide, in one script.
 *
 * Built from src/content/structuredData.mjs, which the React page reads too,
 * so the two describe the page identically. This replaced a local FAQPage
 * builder — briefly the page carried FAQPage twice, once from each, which
 * is the sort of thing that gets a site's structured data discounted rather
 * than doubled.
 */
function guideStructuredData(GUIDE) {
    return `<script type="application/ld+json">${jsonLdText(guideJsonLd(GUIDE, SITE))}</script>`
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
            (g) =>
                `<li><a href="${esc(g.path)}"><strong>${esc(g.h1)}</strong></a> — ${esc(g.description)}</li>`
        ).join('') +
        '</ul>',
}

const GUIDE_ROUTES = GUIDES.map((g) => ({
    path: g.path,
    title: g.title,
    description: g.description,
    jsonLd: guideStructuredData(g),
    body: guideMarkup(g),
    // The date the author last checked this guide's facts. Genuinely
    // per-page and genuinely maintained, so it is worth telling Google
    // about; see sitemapFor() for why most pages carry no lastmod at all.
    lastmod: g.updatedAt,
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
</ul></nav>
${guideLinksMarkup()}`,
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
<p>Not sure what these tests involve? <a href="/guides">Read the ESAT and TMUA guides</a>.</p>
${guideLinksMarkup()}`,
    },
    {
        path: '/diagnostics',
        test: null,
        title: 'Diagnostic Tests | JomExam',
        description:
            'Sit a timed ESAT or TMUA diagnostic and get a report mapped to specific skills, so you know exactly where you stand before you start prepping.',
        body: `<h1>Timed diagnostics.</h1>
<p>Sit a timed diagnostic and get a report mapped to specific skills — so you know exactly where to focus. Set A of every subject is free to sit.</p>
<p><a href="/guides">New to these tests? Read the guides</a></p>
${guideLinksMarkup()}`,
    },
    {
        path: '/diagnostics/esat',
        test: 'esat',
        title: 'ESAT Practice Tests & Diagnostics | JomExam',
        description:
            'Timed ESAT diagnostics for Mathematics 1, Mathematics 2, Physics, Chemistry and Biology. Sit a paper under exam conditions and get a skills report showing exactly where to focus.',
        body: `<h1>ESAT diagnostics.</h1>
<p>Timed ESAT papers — Mathematics 1, Mathematics 2, Physics, Chemistry and Biology — each mapped to the skills the test examines. Set A of every subject is free to sit.</p>
<p><a href="/guides/esat-practice-tests">New to the ESAT? Read the ESAT practice guide</a></p>
${guideLinksMarkup(ESAT_GUIDE_LINKS)}`,
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

/**
 * One <urlset> for a group of routes.
 *
 * <lastmod> is emitted only where a route genuinely knows when it changed —
 * in practice the guides, which carry a date their author maintains. Nothing
 * else does: the SPM pages are built from the questions table, which records
 * created_at and no updated_at, so a date there would be silently wrong the
 * moment anyone edited a question through the admin. A lastmod that lies is
 * worse than none, because Google learns to disregard the field across the
 * whole site rather than for the one page.
 *
 * No <priority> or <changefreq> — Google ignores both.
 */
function sitemapFor(routes) {
    const submitted = routes.filter((route) => route.indexable !== false)
    const xml =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        submitted
            .map((route) => {
                const loc = `${SITE}${route.path === '/' ? '/' : route.path}`
                const lastmod = route.lastmod
                    ? `\n    <lastmod>${esc(route.lastmod)}</lastmod>`
                    : ''
                return `  <url>\n    <loc>${esc(loc)}</loc>${lastmod}\n  </url>`
            })
            .join('\n') +
        '\n</urlset>\n'
    return { xml, count: submitted.length }
}

/** The index that points at the children. */
function sitemapIndex(files) {
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        files
            .map(
                (file) =>
                    `  <sitemap>\n    <loc>${SITE}/${file}</loc>\n  </sitemap>`
            )
            .join('\n') +
        '\n</sitemapindex>\n'
    )
}

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
                .filter(
                    (r) => r.indexable && r.path.startsWith(`/spm/${d.slug}/`)
                )
                .map((r) => ({
                    path: r.path,
                    name: (d.topics ?? []).find((t) =>
                        r.path.endsWith(`/${t.slug}`)
                    )?.name,
                })),
        ])
    )

    // Two groups, kept apart from here on. The split is what makes Search
    // Console able to say *which* group is going uncrawled: one flat sitemap
    // reports "11 of 88 indexed" and leaves you guessing which 11.
    const coreRoutes = ROUTES
    const spmRoutes = [
        ...subjectRoutes(subjects, topicPathsBySubject),
        ...topicPages,
    ]
    const routes = [...coreRoutes, ...spmRoutes]

    for (const route of routes) {
        const url = `${SITE}${route.path}`
        let html = template

        // Per-route metadata. The template's own tags are replaced rather than
        // appended, so a crawler never sees two competing titles.
        html = html.replace(
            /<title>[\s\S]*?<\/title>/,
            `<title>${esc(route.title)}</title>`
        )
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
        // The page exists so the route works; it just isn't offered for
        // indexing until it has something to say.
        //
        // The template already carries a robots tag, so this replaces it
        // rather than adding a second — two robots tags is ambiguous, and
        // appending left the permissive one first and apparently winning.
        if (route.indexable === false) {
            html = html.replace(
                /<meta name="robots" content="[^"]*"\s*\/?>/,
                '<meta name="robots" content="noindex, follow"/>'
            )
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
            !exempt.includes(route.path) &&
            !body.includes('href="/guides')
        ) {
            console.warn(`  ! ${route.path} has no link to the guides`)
        }
        console.log(`  prerendered ${route.path}`)
        written++
    }
    // Generated from the same lists that were just written, so a sitemap
    // cannot drift from what actually exists. It used to be a static file in
    // public/, which meant every new page needed someone to remember.
    //
    // Split into an index and two children. Google does not work through a
    // sitemap in order, so this does not let new pages "jump the queue" —
    // what it buys is a per-sitemap indexed count in Search Console, which
    // turns "11 of 88 indexed" into a statement about which group is going
    // uncrawled. That is the question actually worth answering.
    const coreSubmitted = sitemapFor(coreRoutes)
    const spmSubmitted = sitemapFor(spmRoutes)
    await writeFile(join(DIST, 'sitemap-core.xml'), coreSubmitted.xml)
    await writeFile(join(DIST, 'sitemap-spm.xml'), spmSubmitted.xml)
    await writeFile(
        join(DIST, 'sitemap.xml'),
        sitemapIndex(['sitemap-core.xml', 'sitemap-spm.xml'])
    )

    const submitted = coreSubmitted.count + spmSubmitted.count
    console.log(
        `prerender: ${written} pages written, ${submitted} in the sitemaps ` +
            `(${coreSubmitted.count} core, ${spmSubmitted.count} SPM, ` +
            `${routes.length - submitted} deliberately noindex)`
    )

    if (FAILURES.length > 0) {
        throw new Error(
            `${FAILURES.length} API call(s) failed, so this build is missing ` +
                `pages it should have:\n  ${FAILURES.join('\n  ')}`
        )
    }
    if (submitted === 0) {
        throw new Error(
            'the sitemap came out empty — nothing would be submitted'
        )
    }
}

main().catch((error) => {
    // Fail the build. This used to continue, on the reasoning that the SPA
    // still works without its static copy — but a deploy that quietly drops
    // every prerendered page and shrinks the sitemap is worse than no deploy
    // at all, and it announces nothing. A failed build leaves the previous
    // bundle serving, which is the safe state to be in while someone looks.
    console.error('prerender failed:', error.message)
    process.exitCode = 1
})
