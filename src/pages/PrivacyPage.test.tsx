import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The privacy notice has to name every sign-in provider the site offers.
 *
 * This page does not go stale because somebody edits it badly. It goes stale
 * because a feature ships and nobody thinks of it: Google sign-in ran for
 * weeks and created six accounts while the word "Google" appeared nowhere in
 * the notice, and Microsoft sign-in shipped the same day this test was
 * written. Both are things we tell students we do not do — hand their address
 * to a third party — without having said we do.
 *
 * Derived from the components that exist rather than a list kept by hand,
 * because the failure is always a *new* provider, and a hand-kept list is the
 * thing that gets forgotten in exactly the same way the notice does.
 */

const ROOT = join(import.meta.dirname, '../..')
const AUTH = join(ROOT, 'src/components/auth')
const PROVIDER_BUTTON = /^([A-Z][a-z]+)SignInButton\.tsx$/

function providersWithASignInButton(): string[] {
    return readdirSync(AUTH)
        .map((file) => PROVIDER_BUTTON.exec(file)?.[1])
        .filter((name): name is string => name !== undefined)
}

describe('the privacy notice', () => {
    const notice = readFileSync(join(ROOT, 'src/pages/PrivacyPage.tsx'), 'utf8')

    /**
     * The notice with its commentary removed — what a reader actually sees.
     *
     * The file explains at length which sentences are deliberately absent and
     * why, naming them. Matching against the raw text finds those explanations
     * and reads them as the copy they exist to rule out.
     */
    const copy = notice
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')

    it('finds the sign-in buttons at all', () => {
        // Without this, a rename would empty the list and make the test below
        // trivially true — the guard would stop guarding and say nothing.
        const providers = providersWithASignInButton()
        expect(providers).toContain('Google')
        expect(providers).toContain('Microsoft')
    })

    it('names every sign-in provider the site offers', () => {
        const missing = providersWithASignInButton().filter(
            (provider) => !copy.includes(provider)
        )

        expect(
            missing,
            'These providers receive or confirm a student’s email ' +
                'address and are not mentioned in the privacy notice. Add ' +
                'them to "Who handles your data", saying what they get:\n' +
                missing.map((p) => `  - ${p}`).join('\n')
        ).toEqual([])
    })

    it('names who hosts the service', () => {
        // Every request and every IP address passes through the host. It went
        // unnamed for as long as the sign-in providers did.
        expect(copy).toContain('Railway')
    })

    it('still names the processors that were already there', () => {
        for (const processor of ['Supabase', 'Umami', 'Resend', 'YouTube']) {
            expect(copy).toContain(processor)
        }
    })

    it('does not claim a transfer safeguard that is not in place', () => {
        // Deliberately absent until the Supabase and Resend processing
        // agreements are confirmed signed. Claiming a mechanism we have not
        // put in place would be worse than the current silence, so this fails
        // if the sentence appears without that confirmation being recorded.
        expect(copy).not.toMatch(/standard contractual clauses/i)
    })
})
