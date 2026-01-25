import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Building, LogIn } from 'lucide-react'
import { FormErrorMessage } from '@/components/common/FormErrorMessage.tsx'
import { Button } from '@/components/ui/button.tsx'
import { z } from 'zod'
import { useMoreInformationMutation } from '@/components/auth/useMoreInformationMutation.ts'
import { useNavigate } from 'react-router-dom'
import type { UserMoreInfoForm } from '@/client'
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
import useGetLevelsQuery from '@/hooks/useGetLevelsQuery.ts'
import { toast } from 'sonner'

const MALAYSIA_STATES = [
    'SARAWAK',
    'SABAH',
    'TERRENGGANU',
    'KEDAH',
    'KELANTAN',
    'SELANGOR',
    'JOHOR',
    'MELAKA',
    'NEGERI SEMBILAN',
    'PENANG',
    'PERAK',
    'PAHANG',
    'PERLIS',
] as const satisfies UserMoreInfoForm['state'][]

const SCHEMA = z.object({
    school: z.string(),
    state: z.enum(MALAYSIA_STATES),
    level: z.string(),
})

type Schema = z.infer<typeof SCHEMA>

export function MoreInfoFormPage() {
    const { data: levels } = useGetLevelsQuery()
    const navigate = useNavigate()

    const { mutate: signup, isPending } = useMoreInformationMutation({
        onSuccess: () => {
            toast.success(
                'Additional information successfully submitted! Redirecting to main page...'
            )
            navigate('/')
        },
        onError: () => {
            toast.error('Something went wrong...')
        },
    })

    const form = useForm({
        resolver: zodResolver(SCHEMA),
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
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
                            <CardTitle className="text-2xl font-bold text-center">
                                Tell us more about you!
                            </CardTitle>
                            <CardDescription className="text-center">
                                We just need some additional information about
                                you to help personalize your educational
                                journey!
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="level"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Educational level</Label>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Which form are you in school?" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {levels?.map((level) => (
                                                    <SelectItem
                                                        value={level.id}
                                                    >
                                                        {level.name} (
                                                        {level.syllabus.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>State</Label>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Which state are you in?" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {MALAYSIA_STATES?.map(
                                                    (state) => (
                                                        <SelectItem
                                                            value={state}
                                                        >
                                                            {state}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="school">School</Label>
                                <div className="relative">
                                    <Input
                                        {...register('school')}
                                        placeholder="SMK Sungai Maong"
                                        disabled={isPending}
                                        className="pl-10 pr-10"
                                    />
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                <FormErrorMessage errors={errors} name="name" />
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
                                        <span>Submit</span>
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
