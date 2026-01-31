import { Button } from '@/components/ui/button.tsx'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthContext.tsx'

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
        <div className="flex px-12 py-8 items-center justify-between">
            <div className="flex items-center">
                <img src="/logo-1.png" alt="Logo" height={60} width={70} />{' '}
                <span className="text-xl font-bold">JomExam</span>
            </div>
            <div className="flex justify-between items-center">
                {MENU_ITEMS.map((item) => (
                    <Link className="mx-8 hover:text-blue-700" to={item.link}>
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
