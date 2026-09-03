import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/components/auth/AuthContext.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'
import { client } from '@/client/client.gen'
import { BACKEND_URL } from '@/lib/utils.ts'

/**
 * Point the generated client at the configured backend.
 *
 * `client.gen.ts` carries the production URL as a baked-in default, because
 * that is what the generator was told to write and regenerating rewrites all
 * ~1500 lines of it. Nothing overrode it, so every call made through the
 * generated SDK — which is most of the app, 144 files — went to production
 * regardless of VITE_BACKEND_URL. Locally that is silent and wrong in the
 * worst way: the pages that use the hand-written fetches talk to your laptop
 * while the pages that use the SDK talk to the live site, and both look fine.
 *
 * Found because the Season Pass button stayed "coming soon" locally: the
 * billing calls were 404ing against production, which has no /billing yet.
 *
 * Guarded on the value being set, so a build without VITE_BACKEND_URL keeps
 * the generated default rather than pointing at nothing.
 */
if (BACKEND_URL) {
    client.setConfig({ baseUrl: BACKEND_URL })
}

const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                    <Toaster />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
)
