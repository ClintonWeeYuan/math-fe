import { UserLayoutV2 } from '@/components/layout/UserLayoutV2.tsx'
import { SidebarV2 } from '@/components/layout/SidebarV2.tsx'
import { useParams } from 'react-router-dom'
import useGetQuestionsByTopicQuery from '@/hooks/useGetQuestionsByTopicQuery.ts'
import { InteractiveQuestion } from '@/components/interactiveQuestion/InteractiveQuestion.tsx'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Chat } from '@/components/chat/Chat.tsx'

import { DefaultSpinner } from 'tldraw'

export function QuestionByTopicPage() {
    const { topicId } = useParams()
    const { data: questions } = useGetQuestionsByTopicQuery({
        topicId: topicId ?? '',
    })
    const [currentQuestionId, setCurrentQuestionId] = useState(0)
    const [currentQuestionHtml, setCurrentQuestionHtml] = useState<
        string | null
    >(null)
    const currentQuestion = questions?.[currentQuestionId]

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (currentQuestion?.questionUrl !== undefined) {
            setIsLoading(true)
            fetch(currentQuestion.questionUrl)
                .then((response) => response.text())
                .then((html) => {
                    const style =
                        '<style>html, body { background: transparent !important; color: inherit !important; }</style>'
                    let finalHtml = html
                    if (html.includes('</head>')) {
                        finalHtml = html.replace('</head>', `${style}</head>`)
                    } else {
                        finalHtml = style + html
                    }
                    setCurrentQuestionHtml(finalHtml)
                    setIsLoading(false)
                })
                .catch((error) => {
                    setIsLoading(false)
                    console.error('Error fetching HTML:', error)
                })
        } else {
            setCurrentQuestionHtml(null)
        }
    }, [currentQuestion?.questionUrl])

    return (
        <UserLayoutV2>
            <SidebarV2 />
            <div className="relative h-full w-[70%] mr-4 bg-white rounded-xl flex justify-between items-center">
                {isLoading && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-500 opacity-40 z-40 flex justify-center items-center">
                        <DefaultSpinner />
                    </div>
                )}
                <Button
                    variant="ghost"
                    className="z-20 cursor-pointer"
                    onClick={() =>
                        setCurrentQuestionId((prev) => Math.max(0, prev - 1))
                    }
                >
                    <ChevronLeft />
                </Button>
                <InteractiveQuestion questionHtml={currentQuestionHtml} />
                <Button
                    variant="ghost"
                    className="z-20 cursor-pointer"
                    onClick={() =>
                        setCurrentQuestionId((prev) =>
                            Math.min((questions?.length ?? 1) - 1, prev + 1)
                        )
                    }
                >
                    <ChevronRight />
                </Button>
            </div>
            <div className="h-full flex-2 bg-white rounded-xl flex justify-center items-center">
                <Chat
                    question={currentQuestionHtml ?? ''}
                    questionId={currentQuestion?.id ?? ''}
                />
            </div>
        </UserLayoutV2>
    )
}
