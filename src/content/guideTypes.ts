/** Shared shape for guide content modules (the .mjs files in this folder).
 * They are plain data so the Node prerenderer and the React page can import
 * the same module; these types give the page real checking back. */
export type GuideSection = {
    id: string
    h2: string
    paras: string[]
    /** Optional table. The first column of each row acts as its row header. */
    table?: { caption: string; head: string[]; rows: string[][] }
}

export type GuideFaqItem = {
    q: string
    a: string
    /** An official source backing the answer, rendered after it. */
    link?: { label: string; url: string }
}

/**
 * A question written to the style of the test, with its reasoning shown.
 *
 * Deliberately not pulled from the diagnostic bank: those are the scored
 * instrument, and publishing them with answers would mean students meet them
 * before they sit them. These are written for the page.
 */
export type WorkedExample = {
    id: string
    /** Which module's style this is written to, e.g. "Mathematics 1". */
    module: string
    question: string
    /** One step per line, in the order you would actually work. */
    steps: string[]
    answer: string
    /** What the question was really testing — the reason it is here. */
    takeaway: string
}

export type Guide = {
    path: string
    title: string
    description: string
    h1: string
    standfirst: string
    /** Label above the title, e.g. "ESAT guide". */
    eyebrow: string
    /** Where the primary CTA sends the reader. */
    ctaPath: string
    ctaLabel: string
    sections: GuideSection[]
    /** ISO dates. Shown to readers and emitted as Article metadata; a guide
     *  about a test whose dates move every year is worth nothing undated. */
    publishedAt: string
    updatedAt: string
    workedExamples?: WorkedExample[]
    faq: GuideFaqItem[]
    sources: { label: string; url: string }[]
}
