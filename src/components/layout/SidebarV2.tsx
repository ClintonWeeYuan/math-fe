import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'

import { ChevronDown, HomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useGetSubjectQuery from '@/hooks/useGetSubjectQuery.ts'
import { useMemo } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx'

const ITEMS = [
    {
        title: 'Home',
        url: '/admin',
        icon: HomeIcon,
    },
]

type TopicByLevel = Record<string, { topicName: string; topicId: string }[]>

export function SidebarV2() {
    const { topicId } = useParams()

    const { data } = useGetSubjectQuery({
        subjectId: '00246712-44e0-415e-aa87-d0e8c70e94d9',
    })

    const topicsByLevel = useMemo(() => {
        return data?.topics.reduce((acc, curr) => {
            const currentLevel = curr.level?.name
            if (currentLevel === undefined) {
                return acc
            }

            if (acc[currentLevel] !== undefined) {
                acc[currentLevel].push({
                    topicName: curr.name,
                    topicId: curr.id,
                })
            } else {
                acc[currentLevel] = [{ topicName: curr.name, topicId: curr.id }]
            }

            return acc
        }, {} as TopicByLevel)
    }, [data?.topics])

    const navigate = useNavigate()
    return (
        <Sidebar className="bg-orange-300 border-orange-300 py-4">
            <SidebarHeader className="bg-orange-300 py-0">
                <div className="flex items-center">
                    <img
                        src="/logo-without-background.png"
                        alt="Logo"
                        height={40}
                        width={50}
                    />{' '}
                    <span className="text-xl font-bold py-3">HazMat Suit</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-orange-300 no-scrollbar">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {ITEMS.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        className="hover:bg-orange-100"
                                        asChild
                                    >
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
                {Object.entries(topicsByLevel ?? {}).map(([key, value]) => {
                    return (
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarGroup>
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger className="mb-2">
                                        <span className="text-lg font-semibold">
                                            {key}
                                        </span>

                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent className="bg-orange-200 rounded-lg p-2">
                                        <SidebarMenu>
                                            {value.map((topic) => (
                                                <SidebarMenuItem
                                                    key={topic.topicName}
                                                >
                                                    <SidebarMenuButton
                                                        className={`
                                                            hover:bg-orange-100 ${topic.topicId === topicId && 'bg-orange-100'}
                                                        `}
                                                        asChild
                                                    >
                                                        <Link
                                                            to={`/v2/${topic.topicId}`}
                                                        >
                                                            <span>
                                                                {
                                                                    topic.topicName
                                                                }
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    )
                })}
            </SidebarContent>
            <SidebarFooter className="bg-orange-300">
                <Button
                    variant="destructive"
                    onClick={() => {
                        localStorage.removeItem('token')
                        navigate('/admin/login')
                    }}
                >
                    Logout
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}
