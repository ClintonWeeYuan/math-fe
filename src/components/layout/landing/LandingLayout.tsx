import type { ReactNode } from 'react'
import { LandingHeader } from '@/components/layout/landing/LandingHeader.tsx'

interface Props {
    children: ReactNode
}

export function LandingLayout({ children }: Props) {
    return (
        <main className="w-screen">
            <LandingHeader />
            {children}
        </main>
    )
}
