import { useMemo } from 'react'
import type { TopicByLevel } from '@/components/questionManager/UploadQuestion.tsx'
import type { BaseSubject } from '@/client'

type Props = {
    subject: BaseSubject | undefined
}

export function useTopicByLevels({ subject }: Props) {
    return useMemo(
        () =>
            subject?.topics.reduce(
                (acc, topic) => {
                    const level = topic.level?.name ?? 'No Level'

                    if (acc[level] == undefined) {
                        acc[level] = {
                            title: level,
                            topics: [{ ...topic }],
                        }
                    } else {
                        acc[level].topics.push({ ...topic })
                    }

                    return acc
                },
                {} as Record<string, TopicByLevel>
            ) ?? {},
        [subject?.topics]
    )
}
