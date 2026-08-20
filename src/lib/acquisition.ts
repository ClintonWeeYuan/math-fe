/**
 * How a visitor arrived, captured on their first page and held until they
 * sign up.
 *
 * The timing is the whole problem this solves. A campaign link lands on a
 * guide; the account gets created three pages later, or tomorrow, from a URL
 * that carries none of the original parameters. Reading UTMs at the point of
 * signup would therefore attribute almost every account to nothing, and the
 * handful it did attribute would be the unrepresentative few who signed up
 * from the landing page itself.
 *
 * sessionStorage rather than a cookie: this is never sent to a third party,
 * never read by the server except when explicitly attached to a signup, and
 * dying with the tab is the correct lifetime — a visit is what is being
 * attributed, not a person. It also keeps the privacy notice's account of this
 * simple, which matters more than squeezing out attribution across sessions.
 */

const KEY = 'jomexam.acquisition'

export type Acquisition = {
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    referrer?: string
    landingPath?: string
}

/** Bounded to match the server's own limits, so a hostile or malformed URL
 *  cannot make a signup fail validation on a field nobody typed. */
function trim(value: string | null, max: number): string | undefined {
    if (!value) return undefined
    const cleaned = value.trim().slice(0, max)
    return cleaned.length > 0 ? cleaned : undefined
}

/**
 * Record how this visit began, once per session.
 *
 * First write wins, deliberately. A visitor who arrives from a campaign and
 * then navigates to a page with no parameters has still arrived from that
 * campaign, and letting the second page overwrite the first would erase the
 * only interesting thing about the visit.
 */
export function captureAcquisition(): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
        return
    }
    try {
        if (sessionStorage.getItem(KEY) !== null) return

        const params = new URLSearchParams(window.location.search)
        const captured: Acquisition = {
            utmSource: trim(params.get('utm_source'), 200),
            utmMedium: trim(params.get('utm_medium'), 200),
            utmCampaign: trim(params.get('utm_campaign'), 200),
            // Only an external referrer is worth recording. Our own pages
            // referring each other says nothing about how anyone found us, and
            // would overwrite the answer with noise on the second page view —
            // except that the first-write-wins guard above already stops that,
            // so this is really about not storing a useless value on a direct
            // visit that happens to be an internal navigation.
            referrer: sameOrigin(document.referrer)
                ? undefined
                : trim(document.referrer, 500),
            landingPath: trim(window.location.pathname, 500),
        }

        sessionStorage.setItem(KEY, JSON.stringify(captured))
    } catch {
        // Private browsing, a full quota, a blocked storage API. Attribution
        // is worth nothing next to the page rendering.
    }
}

function sameOrigin(referrer: string): boolean {
    if (!referrer) return false
    try {
        return new URL(referrer).origin === window.location.origin
    } catch {
        return false
    }
}

/** What was captured this session, if anything. */
export function storedAcquisition(): Acquisition | undefined {
    if (typeof sessionStorage === 'undefined') return undefined
    try {
        const raw = sessionStorage.getItem(KEY)
        if (raw === null) return undefined
        const parsed = JSON.parse(raw) as Acquisition
        // An object whose every field is undefined is a visit with nothing to
        // report; sending it would write an empty record where the column's
        // null means "we never captured this".
        return Object.values(parsed).some((v) => v !== undefined)
            ? parsed
            : undefined
    } catch {
        return undefined
    }
}

const AGENT_KEY = 'jomexam.agentCode'

/**
 * A referral code from ?ref=AGENT1, held the same way and for the same reason.
 *
 * Separate from the acquisition object because it means something different:
 * acquisition is what a campaign URL said, this is a person claiming a
 * referral, and it is stored against the account under its own column. Same
 * first-write-wins rule — the first agent to send someone keeps them.
 */
export function captureAgentCode(): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
        return
    }
    try {
        if (sessionStorage.getItem(AGENT_KEY) !== null) return
        const code = trim(new URLSearchParams(window.location.search).get('ref'), 64)
        if (code) sessionStorage.setItem(AGENT_KEY, code)
    } catch {
        // As above.
    }
}

export function storedAgentCode(): string | undefined {
    if (typeof sessionStorage === 'undefined') return undefined
    try {
        return sessionStorage.getItem(AGENT_KEY) ?? undefined
    } catch {
        return undefined
    }
}
