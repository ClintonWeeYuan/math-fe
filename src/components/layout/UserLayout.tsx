import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import { Avatar } from '../ui/avatar'
import { AvatarFallback } from '@/components/ui/avatar.tsx'

type Props = {
    children: ReactNode
}

export function UserLayout({ children }: Props) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="w-full px-4 grow flex flex-col">{children}</main>
        </div>
    )
}

const Header = () => {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    return (
        <header className="sticky top-0 z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-md">
            <div className="bg-neutral px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    {/* The logo is how people expect to get home, and here
                        it was a plain div — so from a question bank the only
                        way back was the browser's back button. The landing
                        header has always linked it; this matches. */}
                    <Link to="/" aria-label="JomExam home">
                        <div className="flex items-center cursor-pointer">
                            <img
                                src="/logo-1.png"
                                alt="Logo"
                                height={60}
                                width={70}
                            />{' '}
                            <span className="text-xl font-bold">JomExam</span>
                        </div>
                    </Link>
                    <div className="flex gap-2">
                        {user !== null ? (
                            <div className="flex space-x-2 items-center">
                                <Avatar>
                                    <AvatarFallback>
                                        {user.name
                                            .split(' ')
                                            .map((word) => word.substring(0, 1))
                                            .join('')
                                            .substring(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="destructive"
                                    className="cursor-pointer"
                                    onClick={() =>
                                        logout(() => navigate('/auth/login'))
                                    }
                                >
                                    Sign out
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button
                                    className="cursor-pointer"
                                    onClick={() => navigate('/auth/signup')}
                                >
                                    Sign Up
                                </Button>
                                <Button
                                    className="cursor-pointer"
                                    onClick={() => navigate('/auth/login')}
                                    variant="outline"
                                >
                                    Login
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
