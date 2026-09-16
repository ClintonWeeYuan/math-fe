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
import { Eye, EyeOff, Mail, Lock, LogIn, KeyRound } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormErrorMessage } from '@/components/common/FormErrorMessage.tsx'
import { useLoginMutation } from '@/components/auth/useLoginMutation.ts'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
    trackAuthFailed,
    trackAuthPageViewed,
    trackAuthSucceeded,
} from '@/lib/authFunnel.ts'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import {
    ProviderSignIn,
    isProviderSignInConfigured,
    providerNames,
} from '@/components/auth/ProviderSignIn.tsx'
import { EmailCodeSignIn } from '@/components/auth/EmailCodeSignIn.tsx'
import type { UserLoginResponse } from '@/client'

const SCHEMA = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().max(50, 'Password must be less than 50 characters'),
})

type Schema = z.infer<typeof SCHEMA>

export const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false)
    // Which proof the student is offering. Both end in the same session — an
    // emailed code is another way to prove who you are, not a second kind of
    // account.
    const [mode, setMode] = useState<'password' | 'code'>('password')
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
    const { login: handleLogin } = useAuth()

    const completeSignIn = (data: UserLoginResponse) => {
        handleLogin({
            user: data.user,
            token: data.token,
            callback: () => {
                toast.success('Login successful!')
                navigate(from, { replace: true })
            },
        })
    }

    // Once per visit to the page, with where the visitor came from (a paper's
    // "Sign in to start", or the header) so the two routes can be compared.
    useEffect(() => {
        trackAuthPageViewed('login', from)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const { mutate: login, isPending } = useLoginMutation({
        onSuccess: (data) => {
            if (data !== undefined) {
                trackAuthSucceeded('password', 'login')
                completeSignIn(data)
            }
        },
        onError: (err) => {
            trackAuthFailed('password', 'login', err)
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
                    {/* Most visitors arrive here from a paper's "Sign in to
                        start" with no account yet. Google, Microsoft and the
                        emailed code all create one on the spot, so this page
                        is the sign-up page for everyone but password users,
                        and says so; "Welcome! Enter your credentials" read
                        as a door for existing accounts only. */}
                    <CardTitle className="text-2xl font-bold text-center">
                        Sign in or create a free account
                    </CardTitle>
                    <CardDescription className="text-center">
                        {mode === 'code'
                            ? "We'll email you a code. New here? It creates your free account too."
                            : isProviderSignInConfigured
                              ? `New here? Continue with ${providerNames}, or get an emailed code, and your free account is made in one step. No password needed.`
                              : 'New here? Get an emailed code and your free account is made in one step. No password needed.'}
                    </CardDescription>
                </CardHeader>

                {mode === 'code' ? (
                    <>
                        <EmailCodeSignIn
                            onSignedIn={completeSignIn}
                            onUsePassword={() => setMode('password')}
                        />
                        <div className="px-6 pb-6">
                            <NewAccountNotice />
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <ProviderSignIn />

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setMode('code')}
                                disabled={isPending}
                            >
                                <KeyRound className="h-4 w-4 mr-2" />
                                Email me a sign-in code
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        Or sign in with a password
                                    </span>
                                </div>
                            </div>

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
                                <FormErrorMessage
                                    errors={errors}
                                    name="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        {...register('password')}
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
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
                                <FormErrorMessage
                                    errors={errors}
                                    name="password"
                                />
                                {/* There is no password reset flow. A code sent to
                                the address proves the same thing a reset link
                                would, so this is the way back in rather than a
                                dead end. */}
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Forgotten it? Use{' '}
                                    <span className="font-medium">
                                        Email me a sign-in code
                                    </span>{' '}
                                    above.
                                </p>
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
                                        <span>Sign in</span>
                                    </div>
                                )}
                            </Button>

                            {/* Standing hint, shown to everyone. The API used to
                            answer "This account signs in with Google" when a
                            Google account tried a password — helpful, but it
                            confirmed to anyone asking that a given address is
                            a real account here. Saying it once, to everybody,
                            helps the same person and singles out nobody.

                            Worded for whichever providers are switched on, so
                            it never points at a button that isn't there. */}
                            <NewAccountNotice />

                            {isProviderSignInConfigured && (
                                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                    Signed up with {providerNames}? Use the
                                    button above.
                                </p>
                            )}

                            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                                Rather use a password for a new account?{' '}
                                {/* The state goes with them, so a student who
                                    came from a paper is taken back to it after
                                    signing up with Google on that page. */}
                                <Button
                                    variant="link"
                                    className="px-0 font-semibold text-primary"
                                    onClick={() =>
                                        navigate('/auth/signup', {
                                            state: location.state,
                                        })
                                    }
                                    disabled={isPending}
                                >
                                    Create one
                                </Button>
                            </p>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    )
}

/**
 * The notice the sign-up page carries, because this page creates accounts
 * too: Google, Microsoft and an emailed code all make one for a new address.
 * Keep the wording in step with SignupPage.
 */
function NewAccountNotice() {
    return (
        <p className="text-xs leading-relaxed text-gray-500">
            New to JomExam? By creating an account you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-2">
                Terms of Use
            </Link>{' '}
            and acknowledge our{' '}
            <Link to="/privacy" className="underline underline-offset-2">
                Privacy Notice
            </Link>
            . We store your account details and diagnostic results to provide
            your reports, and record how you use JomExam — pages visited,
            questions answered, time spent — to improve it. We don&apos;t sell
            your data.
        </p>
    )
}
