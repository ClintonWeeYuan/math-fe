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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, LogIn, User2 } from 'lucide-react'
import { z } from 'zod'
import { useSignupMutation } from '@/components/auth/useSignupMutation.ts'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormErrorMessage } from '@/components/common/FormErrorMessage.tsx'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form.tsx'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx'
import type { UserSignup } from '@/client'
import { Link } from 'react-router-dom'

const USER_CATEGORIES = [
    'PARENT',
    'TEACHER',
    'STUDENT',
] as const satisfies UserSignup['category'][]

const SCHEMA = z.object({
    name: z.string(),
    email: z.string().email('Please enter a valid email'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(50, 'Password must be less than 50 characters'),
    category: z.enum(USER_CATEGORIES),
})

type Schema = z.infer<typeof SCHEMA>

export const SignupPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [success, setSuccess] = useState<null | string>(null)
    const [error, setError] = useState<string | null>(null)
    const { mutate: signup, isPending } = useSignupMutation({
        onSuccess: (data) => {
            if (data !== undefined && data.isSuccess) {
                setError(null)
                setSuccess(data.message)
            } else {
                setSuccess(null)
            }
        },
        onError: (err) => {
            setSuccess(null)
            setError(err.message)
        },
    })

    const form = useForm({
        resolver: zodResolver(SCHEMA),
    })

    const {
        handleSubmit,
        formState: { errors },
        register,
    } = form

    const onSubmit = (data: Schema) => {
        signup(data)
    }

    return (
        <Form {...form}>
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
                                Sign up here to start your learning journey!
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {error !== null && (
                                <Alert
                                    variant="destructive"
                                    className="animate-in fade-in-0 slide-in-from-top-1"
                                >
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success !== null && (
                                <Alert className="bg-green-50 text-green-900 border-green-200 animate-in fade-in-0 slide-in-from-top-1">
                                    <AlertDescription>
                                        {success}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem className="flex">
                                            <Label>You are a...</Label>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue placeholder="Select your role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {USER_CATEGORIES.map(
                                                        (category) => (
                                                            <SelectItem
                                                                value={category}
                                                            >
                                                                {category}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <div className="relative">
                                    <Input
                                        {...register('name')}
                                        disabled={isPending}
                                        className="pl-10 pr-10"
                                    />
                                    <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                <FormErrorMessage errors={errors} name="name" />
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
                                        <span>Sign up</span>
                                    </div>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </Form>
    )
}
