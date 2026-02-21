import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { CalculatorIcon } from 'lucide-react'
import useGetSubjectQuery from '@/hooks/useGetSubjectQuery'
import { useMemo } from 'react'
import { type BaseLevel, type BaseTopic } from '@/client'
import { LandingLayout } from '@/components/layout/landing/LandingLayout'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SelectTopics } from '@/components/questionBank/v3/SelectTopics.tsx'

type TopicsByLevel = Record<string, BaseTopic[]>

export function QuizGeneratorPage() {
    const { subjectId } = useParams()

    const { data: subject } = useGetSubjectQuery({ subjectId: subjectId ?? '' })
    const topicsByLevel = useMemo<TopicsByLevel>(() => {
        return (
            subject?.topics.reduce((acc, curr) => {
                if (curr.level == undefined) {
                    return acc
                }
                if (!(curr.level?.id in acc)) {
                    acc[curr.level.id] = []
                }

                acc[curr.level.id].push(curr)
                return acc
            }, {} as TopicsByLevel) ?? {}
        )
    }, [subject])

    const levels = useMemo(() => {
        return Object.values(topicsByLevel)
            .map((topics) => {
                return topics[0]?.level
            })
            .filter((level): level is BaseLevel => level !== undefined)
            .sort((levelA, levelB) => levelA.name.localeCompare(levelB?.name))
    }, [topicsByLevel])

    const [topics, setTopics] = useState<Set<string>>(new Set([]))
    const [level, setLevel] = useState<string | null>(null)
    const availableTopics = useMemo(() => {
        if (topicsByLevel == null || level == null) {
            return []
        }

        return topicsByLevel[level] ?? []
    }, [topicsByLevel, level])

    const navigate = useNavigate()

    const startQuiz = () => {
        const params = new URLSearchParams()
        const topicsArray = Array.from(topics)
        if (topicsArray.length > 0) {
            params.set('topics', topicsArray.join(','))
        }
        const url = `/questions/v2/${subject?.id}/quiz?${params.toString()}`
        navigate(url)
    }

    return (
        <LandingLayout>
            <div className="min-h-screen px-10">
                <div className="flex space-x-2 mb-4">
                    <div
                        className={`h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500  flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                        <CalculatorIcon className="h-12 w-12 text-white" />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <span className="text-3xl font-semibold">
                            SPM Mathematics
                        </span>
                        <span className="text-gray-500">
                            Choose a topic and difficulty level to start
                            practising
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <span className="block text-2xl font-semibold mb-4">
                        Select level
                    </span>
                    <div>
                        <Select onValueChange={(val) => setLevel(val)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {levels.map((level) => (
                                        <SelectItem value={level.id}>
                                            {level.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {level !== null && (
                    <div className="mb-6">
                        <div className="block  mb-4">
                            <span className="text-2xl font-semibold mr-4">
                                Select topic
                            </span>

                            {topics.size > 0 && (
                                <span>({topics.size} topics selected)</span>
                            )}
                        </div>
                        <SelectTopics
                            availableTopics={availableTopics}
                            selectedTopics={topics}
                            setTopics={setTopics}
                        />
                    </div>
                )}
                <div className="w-full flex justify-center">
                    <Button
                        size="lg"
                        className="text-xl px-8 py-6 cursor-pointer"
                        onClick={startQuiz}
                    >
                        Start Quiz
                    </Button>
                </div>
            </div>
        </LandingLayout>
    )
}
