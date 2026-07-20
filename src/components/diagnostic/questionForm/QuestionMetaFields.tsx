import { Controller, useFormContext } from 'react-hook-form'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx'
import { Combobox } from '@/components/ui/combobox.tsx'
import {
    CORE_SKILLS,
    DIFFICULTY_TAGS,
    type DiagnosticQuestionFormValues,
} from './types.ts'

type Props = {
    /** Topic codes already in use, offered in the combobox (a new one can
     * always be typed). */
    topicCodeOptions?: string[]
}

/** The question's metadata grid: topic code, status, primary/secondary core
 * skill, and difficulty. All Controller-bound to the shared form context. */
export function QuestionMetaFields({ topicCodeOptions = [] }: Props) {
    const { control } = useFormContext<DiagnosticQuestionFormValues>()

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="topic-code">
                    Topic code
                </label>
                <Controller
                    control={control}
                    name="topicCode"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <Combobox
                            id="topic-code"
                            value={field.value || null}
                            onChange={(v) => field.onChange(v ?? '')}
                            options={topicCodeOptions}
                            placeholder="e.g. MM1.6"
                            searchPlaceholder="Search or type a new topic code…"
                        />
                    )}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Status</label>
                <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">
                                        Published
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Core skill (primary)</label>
                <Controller
                    control={control}
                    name="coreSkillPrimary"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {CORE_SKILLS.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Core skill (secondary)</label>
                <Controller
                    control={control}
                    name="coreSkillSecondary"
                    render={({ field }) => (
                        <Select
                            onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                            value={field.value ?? 'none'}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="none">None</SelectItem>
                                    {CORE_SKILLS.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Difficulty tag</label>
                <Controller
                    control={control}
                    name="difficultyTag"
                    render={({ field }) => (
                        <Select
                            onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                            value={field.value ?? 'none'}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="none">None</SelectItem>
                                    {DIFFICULTY_TAGS.map((tag) => (
                                        <SelectItem key={tag} value={tag}>
                                            {tag}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
        </div>
    )
}
