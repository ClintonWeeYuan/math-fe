/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

// https://vite.dev/config/
export default defineConfig({
    // The legal pages carry a "Last updated" date, and it has to come from the
    // build rather than from a string someone remembers to edit. Computed once
    // per build, in UTC, so the same commit built either side of midnight in
    // Kuala Lumpur does not produce two different dates.
    define: {
        __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    },
    build: {
        rollupOptions: {
            input: {
                // The application.
                main: path.resolve(__dirname, 'index.html'),
                // Where Microsoft returns the sign-in popup. A second entry
                // rather than a file in public/, because it has to be built:
                // it runs MSAL, and MSAL v5 relays the result from this page
                // to the one that opened it. See src/msalCallback.ts.
                //
                // prerender.mjs only reads and writes dist/index.html, so it
                // is unaffected by a second output.
                msalCallback: path.resolve(__dirname, 'msal-callback.html'),
            },
        },
    },
    plugins: [react(), tailwindcss(), viteCommonjs()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: './src/test/setup.ts',
    },
})
