import { Button } from '@/components/ui/button.tsx'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@radix-ui/react-navigation-menu'

const MENU_ITEMS: { text: string; link: string }[] = [
    {
        text: 'About',
        link: '/',
    },
    {
        text: 'Plans',
        link: '/',
    },
    {
        text: 'Page',
        link: '/',
    },
]

export function LandingHeader() {
    const navigate = useNavigate()
    const { user } = useAuth()

    return (
        <div className="flex px-2 md:px-12 py-4 md:py-8 items-center justify-between">
            <div className="flex items-center">
                <img
                    src="/logo-1.png"
                    alt="Logo"
                    className="w-[50px] xl:w-[70px]"
                />{' '}
                <span className="text-md md:text-xl font-bold">JomExam</span>
            </div>
            <div className="flex justify-between items-center">
                {MENU_ITEMS.map((item) => (
                    <Link
                        className="mx-8 hover:text-blue-700 hidden md:block"
                        to={item.link}
                    >
                        {item.text}
                    </Link>
                ))}
                {user !== null ? (
                    <Button className="ml-4">{user.name}</Button>
                ) : (
                    <Button
                        className="ml-4 hover:cursor-pointer"
                        onClick={() => navigate('/auth/login')}
                    >
                        Sign up/ Login
                    </Button>
                )}
            </div>
        </div>
    )
}

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link to={href}>
                    <div className="flex flex-col gap-1 text-sm">
                        <div className="leading-none font-medium">{title}</div>
                        <div className="text-muted-foreground line-clamp-2">
                            {children}
                        </div>
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}
