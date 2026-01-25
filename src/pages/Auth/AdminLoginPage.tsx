import React, { useEffect, useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import { useLoginMutation } from '@/components/auth/useLoginMutation.ts'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface LoginFormData {
    email: string
    password: string
    rememberMe: boolean
}

export const AdminLoginPage: React.FC = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false,
    })

    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()
    const { login: handleLogin } = useAuth()

    const { mutate: login, isPending } = useLoginMutation({
        onSuccess: (data) => {
            if (data === undefined) {
                return
            }

            handleLogin({
                user: data.user,
                token: data.token,
                callback: () => {
                    setSuccess(true)

                    navigate('/admin')
                },
            })
        },
        onError: (err) => {
            toast.error(err.message)
        },
    })
    const { isAdmin } = useAuth()

    useEffect(() => {
        if (isAdmin) {
            navigate('/admin')
        }
    }, [navigate, isAdmin])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        setError('')
    }

    const validateForm = (): boolean => {
        if (!formData.email) {
            setError('Email is required')
            return false
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address')
            return false
        }

        if (!formData.password) {
            setError('Password is required')
            return false
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return false
        }

        return true
    }

    const handleSubmit = () => {
        if (!validateForm()) {
            return
        }

        setError('')
        login({ email: formData.email, password: formData.password })
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Welcome!
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <Alert
                            variant="destructive"
                            className="animate-in fade-in-0 slide-in-from-top-1"
                        >
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="bg-green-50 text-green-900 border-green-200 animate-in fade-in-0 slide-in-from-top-1">
                            <AlertDescription>
                                Login successful! Redirecting...
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                className="pl-10"
                                disabled={isPending}
                            />
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                className="pl-10 pr-10"
                                disabled={isPending}
                            />
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
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
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        onClick={handleSubmit}
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
                                <span>Sign in</span>
                            </div>
                        )}
                    </Button>

                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                        Don't have an account?{' '}
                        <Button
                            variant="link"
                            className="px-0 font-semibold text-primary"
                            disabled={isPending}
                        >
                            Sign up
                        </Button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
