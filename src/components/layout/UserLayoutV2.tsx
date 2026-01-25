import type { ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar.tsx'

type Props = {
    children: ReactNode
}

export function UserLayoutV2({ children }: Props) {
    return (
        <SidebarProvider>
            <div className="h-screen w-screen">
                <main className="w-full h-full bg-orange-300 px-4 py-6 flex flex-row justify-between">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}
