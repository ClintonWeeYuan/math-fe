import { client } from '@/client/client.gen'
import type { UserLoginResponse } from '@/client'

/**
 * The two email-code endpoints, written by hand rather than taken from
 * `@/client`.
 *
 * `pnpm generate-api` reads the schema from a running backend, and the
 * installed generator emits a different client shape than the one committed
 * in src/client — so regenerating to pick up two endpoints would rewrite all
 * ~1500 lines of it and bury this change. These call the same underlying
 * `client` the generated functions do, with the same options, so behaviour is
 * identical.
 *
 * When src/client is next regenerated deliberately, this file can be deleted
 * in favour of the generated `requestEmailLoginCodeUsersEmailCodePost` and
 * `signInWithEmailCodeUsersEmailCodeVerifyPost`.
 */

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * The response is the same sentence for every address — whether it has an
 * account, has none, or has asked too many times already — so there is
 * nothing here worth branching on.
 */
export type EmailCodeRequestResponse = { message: string }

export const requestEmailLoginCode = (body: { email: string }) =>
    // The status-keyed shape is what the client's RequestResult unwraps to
    // get `data`; handing it the payload type directly yields a union of that
    // type's own fields instead.
    client.post<{ 200: EmailCodeRequestResponse }>({
        url: '/users/email-code',
        body,
        headers: JSON_HEADERS,
    })

export const signInWithEmailCode = (body: { email: string; code: string }) =>
    client.post<{ 200: UserLoginResponse }>({
        url: '/users/email-code/verify',
        body,
        headers: JSON_HEADERS,
    })
