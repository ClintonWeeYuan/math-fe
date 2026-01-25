import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
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
import { useForm, useWatch } from 'react-hook-form'
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
import useCreatePaperInstanceMutation from '@/hooks/useCreatePaperInstanceMutation.ts'
import { LoadingButton } from '@/components/common/LoadingButton.tsx'
import type { Paper, PaperInstance, PaperVariant } from '@/client'

type Props = {
    papers: Paper[]
    paperVariants: PaperVariant[]
    existingPaperInstances: PaperInstance[]
    subjectId: string
}

const formSchema = z.object({
    paperId: z.string(),
    paperVariantId: z.string(),
})

export const CreatePaperInstanceDialog = ({
    papers,
    paperVariants,
    existingPaperInstances,
    subjectId,
}: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync, isPending } = useCreatePaperInstanceMutation({
        subjectId,
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            paperId: undefined,
            paperVariantId: undefined, // Correctly initializes the field
        },
    })

    const selectedPaperVariantId = useWatch({
        control: form.control,
        name: 'paperVariantId', // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
        defaultValue: undefined, // default value before the render
    })

    const paperOptions = useMemo(
        () =>
            papers.filter((paper) =>
                existingPaperInstances.every(
                    (paperInstance) =>
                        paperInstance.paper.id !== paper.id ||
                        paperInstance.variant.id !== selectedPaperVariantId
                )
            ),
        [existingPaperInstances, papers, selectedPaperVariantId]
    )

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await mutateAsync({
            paperId: values.paperId,
            paperVariantId: values.paperVariantId,
        })

        form.reset()
        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button className="w-full" onClick={() => setDialogOpen(true)}>
                Create Paper Instance
            </Button>
            <DialogContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <DialogHeader>
                            <DialogTitle>Create Paper Instance</DialogTitle>
                            <DialogDescription>
                                A Paper Instance is the initiation of a
                                particular Variant + Paper. <br />
                                E.g. main-2011 (the variant) Paper 2 (the paper)
                                <br />
                                <br />
                                You can add variants on the syllabus page, and
                                papers on the subject page.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <FormField
                                    control={form.control}
                                    name="paperVariantId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Variant</FormLabel>
                                            <FormControl>
                                                <Select
                                                    {...field}
                                                    onValueChange={(val) => {
                                                        field.onChange(val)
                                                        form.resetField(
                                                            'paperId'
                                                        )
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select a level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>
                                                                Levels
                                                            </SelectLabel>
                                                            {paperVariants.map(
                                                                (
                                                                    paperVariant
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            paperVariant.id
                                                                        }
                                                                        value={
                                                                            paperVariant.id
                                                                        }
                                                                    >
                                                                        {
                                                                            paperVariant.name
                                                                        }
                                                                        -
                                                                        {
                                                                            paperVariant.year
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
                                    disabled={
                                        selectedPaperVariantId == undefined ||
                                        paperOptions.length === 0
                                    }
                                    control={form.control}
                                    name="paperId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Paper</FormLabel>
                                            <FormControl>
                                                <Select
                                                    {...field}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select a paper" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>
                                                                Papers
                                                            </SelectLabel>
                                                            {paperOptions.map(
                                                                (paper) => (
                                                                    <SelectItem
                                                                        key={
                                                                            paper.id
                                                                        }
                                                                        value={
                                                                            paper.id
                                                                        }
                                                                    >
                                                                        {
                                                                            paper.name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                            {paperOptions.length == 0 && (
                                                <FormMessage>
                                                    All papers for this variant
                                                    have been created
                                                </FormMessage>
                                            )}
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
                                text="Create"
                            />
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
