import { Button } from '@/components/ui/button.tsx'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover.tsx'

/**
 * Public-site header. The menu mirrors the goal fork on the landing page —
 * one entry per track (Revision, Admissions) plus About — so a visitor can
 * jump straight to their track's exam picker from anywhere.
 */
const MENU_ITEMS: { text: string; link: string }[] = [
    {
        text: 'Revision',
        link: '/revision',
    },
    {
        text: 'Admissions',
        link: '/admissions',
    },
    {
        text: 'Guides',
        link: '/guides',
    },
    {
        text: 'About',
        link: '/about',
    },
]

export function LandingHeader() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    return (
        <div className="flex px-2 md:px-12 py-4 md:py-8 items-center justify-between">
            <Link to="/">
                <div className="flex items-center cursor-pointer">
                    <img
                        src="/logo-1.png"
                        alt="Logo"
                        className="w-[50px] xl:w-[70px]"
                    />{' '}
                    <span className="text-md md:text-xl font-bold">
                        JomExam
                    </span>
                </div>
            </Link>
            <div className="flex justify-between items-center">
                {MENU_ITEMS.map((item) => (
                    <Link
                        key={item.text}
                        className="mx-8 hover:text-blue-700 hidden md:block"
                        to={item.link}
                    >
                        {item.text}
                    </Link>
                ))}
                {user !== null ? (
                    // This used to be a plain button showing the name with no
                    // click handler — it looked like a menu and did nothing,
                    // so on every page but the SPM banks there was no way to
                    // sign out at all.
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button className="ml-4 hover:cursor-pointer">
                                {user.name}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-56 p-2">
                            <div className="px-2 py-1.5">
                                <p className="text-sm font-medium truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {user.email}
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                className="mt-2 w-full hover:cursor-pointer"
                                onClick={() => logout(() => navigate('/'))}
                            >
                                Sign out
                            </Button>
                        </PopoverContent>
                    </Popover>
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
