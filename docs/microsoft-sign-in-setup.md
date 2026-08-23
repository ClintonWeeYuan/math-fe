# Turning on Microsoft sign-in

The code is already deployed and inert. Both apps check for a client id and do
nothing without one — the frontend renders no button, and the build strips the
whole path out, so an unconfigured deployment carries zero bytes of it. Nothing
below changes any existing account or sign-in route.

There are four steps, and **step 3 is the one that must not be skipped.**
Without it every school account is refused.

## 1. Register the app

In the [Entra portal](https://entra.microsoft.com) → **App registrations** →
**New registration**:

- **Name**: JomExam
- **Supported account types**: *Accounts in any organisational directory and
  personal Microsoft accounts*. This is what lets both a school Microsoft 365
  login and a personal Outlook address sign in. Choosing an organisation-only
  option here silently locks out every personal account.
- **Redirect URI**: platform **Single-page application (SPA)**, value
  `https://www.jomexam.com/msal-callback.html`. Add
  `http://localhost:5173/msal-callback.html` as a second SPA redirect URI for
  local development.

  The path matters. Microsoft returns the sign-in popup to this URL and the
  browser loads whatever is there in full before MSAL can read the result, so
  pointing it at the site root booted a second copy of the entire application
  inside the popup — homepage, header, signed-in name — to hand one value back
  to the window that opened it. `msal-callback.html` is a blank page that
  exists for that hand-off and nothing else. Note the `www`: that is the host
  the site actually serves from, and a redirect URI that does not match the
  request exactly is refused with AADSTS50011.

Copy the **Application (client) ID** from the overview page. That is the only
value either app needs, and it is public — it goes in the frontend bundle by
design, the same way the Google client id already does. There is no client
secret in this flow and you should not create one.

## 2. Ask for the right permissions

Under **API permissions**, the defaults are usually enough: `openid`,
`profile`, `email`, `User.Read`. Add any that are missing. No admin consent is
needed — each student consents for themselves the first time they sign in.

## 3. Add the `xms_edov` optional claim — do not skip this

Under **Token configuration** → **Add optional claim** → **ID** → tick
**`email`**, and then, in the same list, **`xms_edov`**. Save.

**Why this matters.** A work or school account's `email` is a directory
attribute a tenant administrator types in. It is a claim about what somebody
wrote, not proof of anything: an administrator of any Microsoft tenant in the
world can put your Gmail address in their own user's mail attribute and receive
a genuine, correctly signed token asserting it. JomExam matches accounts by
email address, so believing that claim would hand existing accounts — and the
Season Passes on them — to anyone who runs a tenant.

`xms_edov` is Microsoft's answer: it is true only when the address's domain is
one the signing tenant has actually proven it owns. The backend trusts that
claim and nothing else. Personal Microsoft accounts skip the question entirely,
since they all live in one tenant Microsoft controls.

If the claim is missing, sign-in is refused with a message pointing the student
at the email-code route, which proves the same address without needing anything
from their school. Nobody gets stranded — but they also get a worse experience
than they should, which is why this step is worth doing carefully.

## 4. Set the environment variables

Frontend (`.env.local` locally, and the host's env in production):

```
VITE_MICROSOFT_CLIENT_ID=<the Application (client) ID>
```

Backend (Railway):

```
MICROSOFT_CLIENT_ID=<the same Application (client) ID>
```

Both default to the `common` tenant, meaning work, school and personal accounts
alike. `VITE_MICROSOFT_TENANT` and `MICROSOFT_TENANT` can narrow that to
`organizations` or `consumers`; set both or neither, because a frontend asking
one authority and a backend validating another rejects every sign-in.

A redeploy of each is needed — the frontend id is baked in at build time.

## Checking it worked

Sign in with a personal Outlook address first: it exercises the whole path
without depending on step 3. Then try a school account. If the school one is
refused with the "we can't confirm that Microsoft address belongs to your
school" message, `xms_edov` is missing from the token configuration — go back
to step 3.

In Supabase, new accounts will show `created_via = 'microsoft'`, which is also
how the signup funnel counts them separately from Google.
