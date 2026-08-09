import React, { useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormErrorMessage } from '@/components/common/FormErrorMessage.tsx'
import { useLoginMutation } from '@/components/auth/useLoginMutation.ts'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton.tsx'

const SCHEMA = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().max(50, 'Password must be less than 50 characters'),
})

type Schema = z.infer<typeof SCHEMA>

export const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
    const { login: handleLogin } = useAuth()
    const { mutate: login, isPending } = useLoginMutation({
        onSuccess: (data) => {
            if (data !== undefined) {
                handleLogin({
                    user: data.user,
                    token: data.token,
                    callback: () => {
                        toast.success('Login successful!')
                        navigate(from, { replace: true })
                    },
                })
            }
        },
        onError: (err) => {
            toast.error(err.message)
        },
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(SCHEMA),
    })

    const onSubmit = (data: Schema) => {
        login(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="space-y-1">
                        <div className="flex justify-center">
                            <Link to="/">
                                <img
                                    src="/logo-1.png"
                                    alt="Logo"
                                    height={80}
                                    width={90}
                                />
                            </Link>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            Welcome!
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <GoogleSignInButton />

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Input
                                    {...register('email')}
                                    disabled={isPending}
                                    className="pl-10 pr-10"
                                />
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            <FormErrorMessage errors={errors} name="email" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    disabled={isPending}
                                    className="pl-10 pr-10"
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <FormErrorMessage errors={errors} name="password" />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <div className="flex items-center space-x-2">
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <LogIn className="h-4 w-4" />
                                    <span>Login</span>
                                </div>
                            )}
                        </Button>

                        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?{' '}
                            <Button
                                variant="link"
                                className="px-0 font-semibold text-primary"
                                onClick={() => navigate('/auth/signup')}
                                disabled={isPending}
                            >
                                Sign up
                            </Button>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </form>
    )
}
