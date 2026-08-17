/**
 * Tell the IndexNow engines a page changed, instead of waiting to be crawled.
 *
 * Run after a deploy. One POST carries every changed URL; the participating
 * engines share submissions with each other, so submitting once reaches all
 * of them.
 *
 * WHO ACTUALLY RECEIVES THIS: Bing, Yandex, Seznam, Naver and Yep. **Google
 * does not participate** — it trialled IndexNow and never adopted it. So this
 * speeds up Bing and the engines that follow it, and does nothing for the
 * Google indexing problem the sitemap split was aimed at. Worth being clear
 * about, because "submit to IndexNow" is often mistaken for a Google fix.
 *
 * Usage:
 *   node scripts/indexnow.mjs                  URLs whose lastmod is today
 *   node scripts/indexnow.mjs --since 2026-08-16
 *   node scripts/indexnow.mjs --all            every URL in the sitemaps
 *   node scripts/indexnow.mjs https://... ...  exactly these
 *   node scripts/indexnow.mjs --dry-run        print, submit nothing
 *
 * The default is deliberately narrow. IndexNow is for pages that genuinely
 * changed; resubmitting the whole site on every deploy is how a host earns
 * itself a reputation for crying wolf, and the protocol's own guidance is to
 * submit only real changes.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const HOST = 'www.jomexam.com'
const ENDPOINT = 'https://api.indexnow.org/indexnow'

/** The key is served publicly at /{key}.txt — that file IS the proof of
 *  ownership, so it is found rather than configured, and the two can never
 *  disagree. */
export function findKey(dir = DIST) {
    const key = readdirSync(dir)
        .filter((f) => /^[0-9a-f]{8,128}\.txt$/.test(f))
        .map((f) => f.replace(/\.txt$/, ''))
        .find((k) => readFileSync(join(dir, `${k}.txt`), 'utf8').trim() === k)
    if (!key) {
        throw new Error(
            `No IndexNow key file in ${dir}. Expected {key}.txt containing exactly that key.`
        )
    }
    return key
}

/** URL and lastmod for every entry across the sitemaps. */
export function readSitemaps(dir = DIST) {
    const entries = []
    for (const file of readdirSync(dir).filter((f) =>
        /^sitemap.*\.xml$/.test(f)
    )) {
        const xml = readFileSync(join(dir, file), 'utf8')
        // Only <url> entries; the index's <sitemap> children are not pages.
        for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
            const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]
            const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]
            if (loc) entries.push({ loc, lastmod: lastmod ?? null })
        }
    }
    return entries
}

/**
 * Which URLs to submit.
 *
 * A page with no <lastmod> is never picked up by `--since`: the SPM pages
 * carry none because nothing records when they changed, and guessing would
 * mean announcing a change that may not have happened. Use --all for those.
 */
export function selectUrls(entries, { since, all } = {}) {
    if (all) return entries.map((e) => e.loc)
    return entries
        .filter((e) => e.lastmod !== null && e.lastmod >= since)
        .map((e) => e.loc)
}

function today() {
    return new Date().toISOString().slice(0, 10)
}

async function main() {
    const args = process.argv.slice(2)
    const dryRun = args.includes('--dry-run')
    const all = args.includes('--all')
    const sinceFlag = args.indexOf('--since')
    const since = sinceFlag !== -1 ? args[sinceFlag + 1] : today()
    const explicit = args.filter((a) => a.startsWith('https://'))

    const key = findKey()
    const urlList = explicit.length
        ? explicit
        : selectUrls(readSitemaps(), { since, all })

    if (urlList.length === 0) {
        console.log(
            `Nothing to submit (no page has lastmod >= ${since}). ` +
                `Use --since or --all if that is not what you expected.`
        )
        return
    }

    const foreign = urlList.filter((u) => !u.startsWith(`https://${HOST}/`))
    if (foreign.length) {
        throw new Error(
            `These are not on ${HOST}, which IndexNow rejects with 422:\n  ` +
                foreign.join('\n  ')
        )
    }

    console.log(`${urlList.length} URL(s) to submit:`)
    for (const u of urlList) console.log(`  ${u}`)

    if (dryRun) {
        console.log('\n--dry-run: nothing sent.')
        return
    }

    const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
            host: HOST,
            key,
            keyLocation: `https://${HOST}/${key}.txt`,
            urlList,
        }),
    })

    // 200 accepted, 202 accepted but the key is still being validated.
    if (response.status === 200 || response.status === 202) {
        console.log(`\nSubmitted — HTTP ${response.status}.`)
        return
    }
    const explain = {
        400: 'Bad request — the JSON or the URL format was rejected.',
        403: `Key not valid. Check https://${HOST}/${key}.txt is reachable and contains exactly the key.`,
        422: 'URLs do not belong to the host, or the key does not match the host.',
        429: 'Too many requests — submitting far more often than pages change.',
    }[response.status]
    throw new Error(
        `IndexNow refused: HTTP ${response.status}. ${explain ?? ''}\n` +
            (await response.text().catch(() => ''))
    )
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error(error.message)
        process.exit(1)
    })
}
