import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), viteCommonjs()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
