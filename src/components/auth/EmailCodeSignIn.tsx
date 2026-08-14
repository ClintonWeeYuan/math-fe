import React, { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, KeyRound, Mail, Send } from 'lucide-react'

import { CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { UserLoginResponse } from '@/client'
import {
    useEmailCodeSignInMutation,
    useRequestEmailCodeMutation,
} from '@/components/auth/useEmailCodeMutations.ts'

const CODE_LENGTH = 6
const EMAIL = z.string().email()

type Props = {
    onSignedIn: (data: UserLoginResponse) => void
    onUsePassword: () => void
}

/**
 * Signing in with a code emailed to the address, in two steps.
 *
 * Also the way back in for somebody who has forgotten their password: there
 * is no reset flow, and a code proves the same thing a reset link would.
 */
export const EmailCodeSignIn: React.FC<Props> = ({
    onSignedIn,
    onUsePassword,
}) => {
    const [step, setStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [emailError, setEmailError] = useState<string | undefined>()

    const { mutate: requestCode, isPending: isSending } =
        useRequestEmailCodeMutation({
            onSuccess: (data) => {
                setStep('code')
                setCode('')
                // The server's wording is deliberately the same for every
                // address, so it is safe to show verbatim and says the useful
                // part (how long the code lasts).
                toast.success(data.message)
            },
            onError: (error) => toast.error(error.message),
        })

    const { mutate: signIn, isPending: isVerifying } =
        useEmailCodeSignInMutation({
            onSuccess: onSignedIn,
            onError: (error) => {
                // Cleared rather than left in place: the next attempt needs a
                // fresh code from the inbox, not an edit of the failed one.
                setCode('')
                toast.error(error.message)
            },
        })

    const isPending = isSending || isVerifying

    const sendCode = () => {
        const parsed = EMAIL.safeParse(email.trim())
        if (!parsed.success) {
            setEmailError('Please enter a valid email')
            return
        }
        setEmailError(undefined)
        requestCode(parsed.data)
    }

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        if (step === 'email') {
            sendCode()
            return
        }
        if (code.length === CODE_LENGTH) {
            signIn({ email: email.trim(), code })
        }
    }

    return (
        // noValidate so our own message is the one shown. Left on, the
        // browser's native check on type="email" silently refuses to submit
        // and shows a bubble in its own styling — and the "Resend code"
        // button, which is not a submit, would skip that check entirely, so
        // the two paths would disagree about what counts as an address.
        <form onSubmit={onSubmit} noValidate>
            <CardContent className="space-y-4">
                {step === 'email' ? (
                    <div className="space-y-2">
                        <Label htmlFor="code-email">Email</Label>
                        <div className="relative">
                            <Input
                                id="code-email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isPending}
                                className="pl-10"
                            />
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {emailError !== undefined && (
                            <p className="text-sm text-red-500">{emailError}</p>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            We'll email you a {CODE_LENGTH}-digit code. No
                            password needed.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="code">Enter your code</Label>
                        <div className="relative">
                            <Input
                                id="code"
                                // A phone keyboard should open on digits, and
                                // iOS offers the code straight from the inbox
                                // when the field is named as a one-time code.
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                autoFocus
                                placeholder="000000"
                                value={code}
                                onChange={(e) =>
                                    setCode(
                                        e.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, CODE_LENGTH)
                                    )
                                }
                                disabled={isPending}
                                className="pl-10 tracking-[0.5em] font-mono text-lg"
                            />
                            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Sent to{' '}
                            <span className="font-medium">{email.trim()}</span>.
                            Check your spam folder if it hasn't arrived.
                        </p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <Button
                    type="submit"
                    className="w-full"
                    disabled={
                        isPending ||
                        (step === 'code' && code.length < CODE_LENGTH)
                    }
                >
                    {isPending ? (
                        <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>
                                {step === 'email'
                                    ? 'Sending...'
                                    : 'Signing in...'}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            {step === 'email' ? (
                                <Send className="h-4 w-4" />
                            ) : (
                                <KeyRound className="h-4 w-4" />
                            )}
                            <span>
                                {step === 'email'
                                    ? 'Email me a code'
                                    : 'Sign in'}
                            </span>
                        </div>
                    )}
                </Button>

                {step === 'code' && (
                    <div className="flex w-full justify-between text-sm">
                        <Button
                            type="button"
                            variant="link"
                            className="px-0"
                            onClick={() => {
                                setStep('email')
                                setCode('')
                            }}
                            disabled={isPending}
                        >
                            Use a different email
                        </Button>
                        <Button
                            type="button"
                            variant="link"
                            className="px-0"
                            onClick={sendCode}
                            disabled={isPending}
                        >
                            Resend code
                        </Button>
                    </div>
                )}

                <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={onUsePassword}
                    disabled={isPending}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Sign in with a password instead
                </Button>
            </CardFooter>
        </form>
    )
}
