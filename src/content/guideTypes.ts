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
    faq: GuideFaqItem[]
    sources: { label: string; url: string }[]
}
