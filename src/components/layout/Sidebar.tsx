import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'

import {
    FlaskConical,
    FolderTree,
    Inbox,
    Layers,
    LucideCodesandbox,
    PencilIcon,
    Settings,
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'

const ITEMS = [
    {
        title: 'Question Bank',
        url: '/admin',
        icon: Inbox,
    },
    {
        title: 'Manager',
        url: '/syllabus',
        icon: Settings,
    },
    {
        title: 'Sandbox',
        url: '/sandbox',
        icon: LucideCodesandbox,
    },
    {
        title: 'Interactive',
        url: '/interactive',
        icon: PencilIcon,
    },
    {
        title: 'Diagnostic Questions',
        url: '/admin/questions',
        icon: FlaskConical,
    },
    {
        title: 'Diagnostic Sets',
        url: '/admin/sets',
        icon: Layers,
    },
    {
        title: 'Subjects',
        url: '/admin/subjects',
        icon: FolderTree,
    },
]

export function AppSidebar() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {ITEMS.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                            <SidebarMenuItem key="logout" className="">
                                <SidebarMenuButton asChild></SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Button
                    variant="destructive"
                    onClick={() => logout(() => navigate('/admin/login'))}
                >
                    Logout
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}
