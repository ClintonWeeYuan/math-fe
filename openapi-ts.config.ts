import { defineConfig } from '@hey-api/openapi-ts'

const LOCAL_URL = 'http://localhost:8000'
const PROD_URL = 'https://joyful-vitality-production.up.railway.app'

export default defineConfig({
    input: 'http://localhost:8000/openapi.json', // sign up at app.heyapi.dev
    output: 'src/client',
    plugins: [
        {
            baseUrl: PROD_URL,
            name: '@hey-api/client-fetch',
        },
    ],
})
