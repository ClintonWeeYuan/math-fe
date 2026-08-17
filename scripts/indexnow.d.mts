export type SitemapEntry = { loc: string; lastmod: string | null }

/** The key from the {key}.txt file served at the site root. */
export declare function findKey(dir?: string): string

/** Every <url> entry across the built sitemaps. */
export declare function readSitemaps(dir?: string): SitemapEntry[]

/** Which URLs to submit: changed on or after `since`, or everything. */
export declare function selectUrls(
    entries: SitemapEntry[],
    options?: { since?: string; all?: boolean }
): string[]

/** Block until the live sitemap reports the lastmods this build expects. */
export declare function awaitLive(
    expected: SitemapEntry[],
    options?: {
        timeoutMs?: number
        intervalMs?: number
        fetchImpl?: typeof fetch
    }
): Promise<boolean>
