import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form.tsx'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useCreatePaperMutation from '@/hooks/useCreatePaperMutation.ts'

type Props = {
    subjectId: string
}

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters.',
    }),
})

export const CreatePaperDialog = ({ subjectId }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync } = useCreatePaperMutation({ subjectId })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log({ values })
        await mutateAsync({
            name: values.name,
        })

        form.reset()
        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button className="w-full" onClick={() => setDialogOpen(true)}>
                Create Paper
            </Button>
            <DialogContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <DialogHeader>
                            <DialogTitle>Create Paper</DialogTitle>
                            <DialogDescription>
                                Papers associated with this particular subject
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Paper 1"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => setDialogOpen(false)}
                                variant="outline"
                            >
                                Cancel
                            </Button>

                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
