import type { ReactNode } from 'react'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar.tsx'
import { AppSidebar } from './Sidebar.tsx'

type Props = {
    children: ReactNode
}

export function AdminLayout({ children }: Props) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full px-4 relative min-h-screen">
                <SidebarTrigger className="absolute top-0 left-2" />
                {children}
            </main>
        </SidebarProvider>
    )
}
