import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useMemo, useState } from 'react'
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
import { LoadingButton } from '@/components/common/LoadingButton.tsx'
import useUpdateQuestionMutation from '@/hooks/useUpdateQuestionMutation.ts'
import type { Difficulty } from '@/lib/types.ts'
import { DifficultyList } from '@/components/questionBank/questions.ts'
import type { TopicByLevel } from '@/components/questionManager/UploadQuestion.tsx'
import { MultiSelectGroup } from '@/components/ui/multi-select-group.tsx'
import type { QuestionResponse } from '@/client'

type Props = {
    currentQuestion: QuestionResponse
    paperInstanceId: string
    topicsByLevel: Record<string, TopicByLevel>
}

const formSchema = z.object({
    topicIds: z.array(z.string()),
    number: z.coerce.number(),
    difficulty: z.string(),
    marks: z.coerce.number().optional(),
})

export const UpdateQuestionDialog = ({
    currentQuestion,
    paperInstanceId,
    topicsByLevel,
}: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync, isPending } = useUpdateQuestionMutation({
        questionId: currentQuestion.id,
        paperInstanceId,
    })

    const formattedTopics = useMemo(() => {
        return Object.values(topicsByLevel).flatMap((topicLevel) =>
            topicLevel.topics.map((topic) => ({
                value: topic.id,
                label: topic.name,
                group: topic.level?.name ?? 'No Group',
            }))
        )
    }, [topicsByLevel])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            topicIds: currentQuestion.topics.map((topic) => topic.id),
            number: currentQuestion.number,
            difficulty: currentQuestion.difficulty,
            marks: currentQuestion.marks ?? undefined,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await mutateAsync({
            number: values.number,
            topicIds: values.topicIds,
            difficulty: values.difficulty as Difficulty,
            marks: values.marks != undefined ? values.marks : null,
        })

        form.reset({
            number: values.number,
            topicIds: values.topicIds,
            difficulty: values.difficulty as Difficulty,
            marks: values.marks,
        })
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
                                    name="topicIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Topics</FormLabel>
                                            <FormControl>
                                                <MultiSelectGroup
                                                    className="mb-4"
                                                    options={formattedTopics}
                                                    onValueChange={(e) =>
                                                        field.onChange(e)
                                                    }
                                                    values={field.value ?? []}
                                                    placeholder="Select topics"
                                                    variant="inverted"
                                                    maxCount={3}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="difficulty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Difficulty</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value ?? ''}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a difficulty" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>
                                                            Difficulty
                                                        </SelectLabel>
                                                        {DifficultyList.map(
                                                            (item) => (
                                                                <SelectItem
                                                                    key={
                                                                        item.value
                                                                    }
                                                                    value={
                                                                        item.value
                                                                    }
                                                                >
                                                                    {item.label}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Question Number
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Question number within the paper
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="marks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Marks Allocated
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Marks allocated for this
                                                question
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
