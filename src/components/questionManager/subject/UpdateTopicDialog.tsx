import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx'
import { useForm } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form.tsx'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useUpdateTopicMutation from '@/hooks/useUpdateTopicMutation.ts'
import { LoadingButton } from '@/components/common/LoadingButton.tsx'
import type { BaseLevel, BaseTopic } from '@/client'

type Props = {
    levels: BaseLevel[]
    currentTopic: BaseTopic
}

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters.',
    }),
    levelId: z.string().optional(),
    sortOrder: z.coerce.number(),
})

export const UpdateTopicDialog = ({ levels, currentTopic }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync, isPending } = useUpdateTopicMutation({
        topicId: currentTopic.id,
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            levelId: currentTopic.level?.id,
            name: currentTopic.name,
            sortOrder: currentTopic.sortOrder,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await mutateAsync({
            name: values.name,
            levelId: values.levelId ?? null,
            sortOrder: values.sortOrder,
        })

        form.reset()
        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button className="" onClick={() => setDialogOpen(true)}>
                Update
            </Button>
            <DialogContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <DialogHeader>
                            <DialogTitle>Update Topic</DialogTitle>
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
                                                    placeholder="Simultaneous Equations"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="levelId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Level</FormLabel>
                                            <FormControl>
                                                <Select
                                                    {...field}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select a level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>
                                                                Levels
                                                            </SelectLabel>
                                                            {levels.map(
                                                                (level) => (
                                                                    <SelectItem
                                                                        key={
                                                                            level.id
                                                                        }
                                                                        value={
                                                                            level.id
                                                                        }
                                                                    >
                                                                        {
                                                                            level.name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sortOrder"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sort Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Determines order in which topics
                                                are displayed
                                            </FormDescription>
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

                            <LoadingButton
                                type="submit"
                                isLoading={isPending}
                                text="Confirm"
                            />
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
