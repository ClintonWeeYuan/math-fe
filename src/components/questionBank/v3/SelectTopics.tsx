import { Card, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import type { BaseTopic } from '@/client'
import type { Dispatch, SetStateAction } from 'react'

type Props = {
    availableTopics: BaseTopic[]
    setTopics: Dispatch<SetStateAction<Set<string>>>
    selectedTopics: Set<string>
}

export const SelectTopics = ({
    availableTopics,
    setTopics,
    selectedTopics,
}: Props) => {
    return (
        <div className="grid grid-cols-4 gap-x-4 gap-y-8">
            {availableTopics.map((topic) => {
                const isTopicActive = selectedTopics.has(topic.id)
                return (
                    <Card
                        onClick={() =>
                            setTopics((prev) => {
                                const newSet = new Set([...prev])
                                if (isTopicActive) {
                                    newSet.delete(topic.id)
                                } else {
                                    newSet.add(topic.id)
                                }

                                return newSet
                            })
                        }
                        className={`h-full cursor-pointer transition-all ${selectedTopics.has(topic.id) && 'border border-blue-400'} hover:shadow-xl hover:scale-105 group`}
                    >
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                {topic.name}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                )
            })}
        </div>
    )
}
