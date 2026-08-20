/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string
    /**
     * Google OAuth *web client id*. Public by design — it identifies the app
     * to Google and is checked server-side as the token's audience. There is
     * no Google secret in the frontend. Unset means the Google button simply
     * doesn't render.
     */
    readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

/** ISO date (YYYY-MM-DD) of the build, injected by vite.config.ts. Read by the
 *  legal pages, which must state when they last changed. */
declare const __BUILD_DATE__: string
