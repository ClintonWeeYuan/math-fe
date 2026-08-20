/**
 * The handful of facts the legal pages state about us, in one place.
 *
 * Separated from the pages because these are the values most likely to change
 * for reasons that have nothing to do with the prose — a company gets
 * incorporated, a mailbox moves — and because a value stated on two pages must
 * never be able to disagree with itself.
 */

/** Monitored mailbox for privacy and terms enquiries. The domain receives mail
 *  through Microsoft 365; this is the address the legal pages publish, so it
 *  has to stay one somebody reads. */
export const CONTACT_EMAIL = 'hello@jomexam.com'

/** Who operates JomExam, as the privacy notice names them. A sole trader
 *  trades under their own name, so this stays correct through the registration
 *  currently in progress; it changes only if a limited company is incorporated
 *  later. */
export const OPERATOR = 'Hazel Wee Ling'

/** Where the Supabase database lives, from the project's region setting. The
 *  privacy notice states this twice — as the database's host and as where data
 *  is stored — so it is one constant rather than two chances to disagree.
 *
 *  Worth knowing when this is next revised: the notice describes JomExam as
 *  based in the United Kingdom while naming this as the storage region, and
 *  says nothing about the transfer that implies. Separately, the verification
 *  and sign-in-code emails leave this region entirely — Resend delivers them
 *  through an Amazon SES region in Japan, and the notice's processor list does
 *  not mention Resend at all. Both were raised rather than edited, because the
 *  wording is not ours to change. */
export const DATA_REGION = 'Singapore'

/**
 * The date the legal pages show as "Last updated", taken from the build.
 *
 * Injected by vite.config.ts rather than written here, so it cannot go stale
 * by being forgotten. The trade-off is that it moves on every deploy, whether
 * or not the text changed — a returning reader sees a fresh date on unchanged
 * copy. That is the behaviour that was asked for; the alternative is a
 * constant checked against git, which is how the guides date themselves.
 */
export const LAST_UPDATED = formatUkDate(__BUILD_DATE__)

/** "2026-08-20" -> "20 August 2026". Long form, British order: legal pages are
 *  read in more than one country and 08/09 is a different day depending on
 *  where the reader is. */
export function formatUkDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number)
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ]
    return `${day} ${months[month - 1]} ${year}`
}
