import {
    AlertCircle,
    CheckCircle,
    File as FileIcon,
    Upload,
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx'
import { DifficultyList } from '@/components/questionBank/questions.ts'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { MultiSelectGroup } from '@/components/ui/multi-select-group.tsx'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import type { Difficulty } from '@/lib/types.ts'
import { BACKEND_URL, cn } from '@/lib/utils.ts'
import axios from 'axios'
import { useQueryClient } from '@tanstack/react-query'
import Dropzone from 'react-dropzone'
import type { PaperInstance, BaseTopic, QuestionResponse } from '@/client'

type Inputs = {
    file: FileList
    difficulty: Difficulty
    topicIds: string[]
    number: number
    marks: number | undefined
    questionType: QuestionResponse['type']
}

export type TopicByLevel = {
    title: string
    topics: BaseTopic[]
}

type Props = {
    paperInstance: PaperInstance | undefined
    topicsByLevel: Record<string, TopicByLevel>
}

const generateTitle = (paperInstance: PaperInstance, number: number) =>
    `${paperInstance.variant.name}-${paperInstance.variant.year}-${paperInstance.paper.name}-Q${number}`

export const UploadQuestion = ({ paperInstance, topicsByLevel }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<null | string>(null)

    const queryClient = useQueryClient()

    const formattedTopics = useMemo(() => {
        return Object.values(topicsByLevel).flatMap((topicLevel) =>
            topicLevel.topics.map((topic) => ({
                value: topic.id,
                label: topic.name,
                group: topic.level?.name ?? 'No Group',
            }))
        )
    }, [topicsByLevel])

    const form = useForm<Inputs>({
        defaultValues: {
            file: undefined,
            difficulty: undefined,
            topicIds: [],
            number: undefined,
            marks: undefined,
            questionType: 'default',
        },
    })

    const watchedFile = form.watch('file')

    const onSubmit = async (data: Inputs) => {
        setIsSubmitting(true)
        setSubmitStatus(null)

        const formData = new FormData()
        formData.append('file', data.file[0])
        formData.append('difficulty', data.difficulty)
        data.topicIds.forEach((topicId) => formData.append('topics', topicId))

        const title = paperInstance
            ? generateTitle(paperInstance, data.number)
            : ''

        formData.append('title', title)
        formData.append('number', data.number.toString())
        formData.append('question_type', data.questionType)

        if (data.marks != undefined) {
            formData.append('marks', data.marks.toString())
        }

        formData.append('paper_instance_id', paperInstance?.id ?? '')

        try {
            // Simulate API call
            await axios.post(`${BACKEND_URL}/converter`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60_000,
            })

            await queryClient.invalidateQueries({
                queryKey: ['question', paperInstance?.id],
            })
            form.reset()
            setSubmitStatus('success')
        } catch {
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="rounded-lg p-6">
                    <div className="text-center mb-8">
                        <Upload className="mx-auto h-12 w-12 text-blue-500" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            Upload File
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Add a title and select a file to upload
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Number Input */}
                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Number of the question within the
                                            paper
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="questionType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Type</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(e) =>
                                                    field.onChange(e)
                                                }
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="default">
                                                            Default
                                                        </SelectItem>
                                                        <SelectItem value="multiple_choice">
                                                            Multiple Choice
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Marks allocated for this question
                                            (not required)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Marks Allocated Input */}
                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="marks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marks Allocated</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Marks allocated for this question
                                            (not required)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Topic Input */}
                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="topicIds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Topic</FormLabel>
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
                        </div>

                        {/* Difficulty */}
                        <div className="col-span-1">
                            <label
                                htmlFor="difficulty"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Difficulty
                            </label>
                            <FormField
                                control={form.control}
                                name="difficulty"
                                render={({ field }) => (
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
                                                {DifficultyList.map((item) => (
                                                    <SelectItem
                                                        key={item.value}
                                                        value={item.value}
                                                    >
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            ></FormField>
                            {form.formState.errors.difficulty && (
                                <p className="mt-1 text-sm text-red-600">
                                    {form.formState.errors.difficulty.message}
                                </p>
                            )}
                        </div>

                        {/* File Upload */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                File
                            </label>

                            <Controller
                                control={form.control}
                                name="file"
                                rules={{
                                    required: {
                                        value: true,
                                        message: 'This field is required',
                                    },
                                }}
                                render={({
                                    field: { onChange, onBlur },
                                    fieldState,
                                }) => (
                                    <Dropzone
                                        onDrop={(acceptedFiles) => {
                                            form.setValue(
                                                'file',
                                                acceptedFiles as unknown as FileList,
                                                {
                                                    shouldValidate: true,
                                                }
                                            )
                                        }}
                                    >
                                        {({
                                            getRootProps,
                                            getInputProps,
                                            isDragActive,
                                        }) => (
                                            <div>
                                                <div
                                                    className={cn(
                                                        'flex flex-col items-center py-6 rounded-lg border border-2 border-dashed',
                                                        isDragActive
                                                            ? 'bg-blue-200 border-blue-500'
                                                            : 'bg-transparent border-gray-300'
                                                    )}
                                                    style={{
                                                        borderColor:
                                                            isDragActive
                                                                ? 'blue'
                                                                : 'gray',
                                                    }}
                                                    {...getRootProps()}
                                                >
                                                    <input
                                                        {...getInputProps({
                                                            id: 'spreadsheet',
                                                            onChange,
                                                            onBlur,
                                                        })}
                                                    />

                                                    <div className="text-center">
                                                        {watchedFile &&
                                                        watchedFile.length >
                                                            0 ? (
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <FileIcon className="h-8 w-8 text-green-500" />
                                                                <span className="text-sm text-gray-900">
                                                                    {
                                                                        watchedFile[0]
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                                <p className="mt-2 text-sm text-gray-600">
                                                                    <span className="font-medium text-blue-600 hover:text-blue-500">
                                                                        Click to
                                                                        upload
                                                                    </span>{' '}
                                                                    or drag and
                                                                    drop
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    PNG, JPG,
                                                                    PDF up to
                                                                    10MB
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div>
                                                        {fieldState.error && (
                                                            <span role="alert">
                                                                {
                                                                    fieldState
                                                                        .error
                                                                        .message
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Dropzone>
                                )}
                            />
                            {form.formState.errors.file && (
                                <p className="mt-1 text-sm text-red-600">
                                    {form.formState.errors.file.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`col-span-2 mt-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                'Upload File'
                            )}
                        </button>
                    </div>

                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                <p className="text-sm text-green-800">
                                    File uploaded successfully!
                                </p>
                            </div>
                        </div>
                    )}

                    {submitStatus === 'error' && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                <p className="text-sm text-red-800">
                                    Upload failed. Please try again.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </Form>
    )
}
