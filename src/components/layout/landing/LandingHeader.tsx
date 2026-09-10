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
        <div className="flex px-2 md:px-6 lg:px-12 py-4 md:py-8 items-center justify-between">
            {/* shrink-0: the menu's words cannot wrap, so any shortfall in the
                header used to be taken out of this link alone — it collapsed
                below its own contents and the wordmark's glyphs painted over
                "Revision". The brand keeps its width; the gaps below give. */}
            <Link to="/" className="shrink-0">
                <div className="flex items-center gap-1 cursor-pointer">
                    <img
                        src="/logo-1.png"
                        alt="Logo"
                        className="w-[50px] xl:w-[70px]"
                    />
                    <span className="text-md md:text-xl font-bold whitespace-nowrap">
                        JomExam
                    </span>
                </div>
            </Link>
            <div className="flex items-center gap-4 lg:gap-6 xl:gap-8">
                {MENU_ITEMS.map((item) => (
                    <Link
                        key={item.text}
                        className="whitespace-nowrap hover:text-blue-700 hidden md:block"
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
                            {/* A name is arbitrary length, so cap it here:
                                otherwise a long one pushes the header wider
                                than the window and collides with the menu,
                                the same failure the brand's shrink-0 fixes.
                                The popover shows the name in full. */}
                            <Button className="hover:cursor-pointer max-w-[9rem] truncate">
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
                            {/* The only route to a student's own history —
                                without it the results page exists but cannot
                                be reached by anyone who has not bookmarked
                                it. */}
                            <Button
                                variant="outline"
                                className="mt-2 w-full hover:cursor-pointer"
                                onClick={() => navigate('/my-results')}
                            >
                                My results
                            </Button>
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
                        className="hover:cursor-pointer"
                        onClick={() => navigate('/auth/login')}
                    >
                        Sign up/ Login
                    </Button>
                )}
            </div>
        </div>
    )
}
