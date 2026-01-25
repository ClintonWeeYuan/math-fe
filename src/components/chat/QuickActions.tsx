import type { Dispatch, SetStateAction } from 'react'
import type { Message } from '@/components/chat/Chat.tsx'
import { Button } from '@/components/ui/button.tsx'
import useGenerateHintMutation from '@/hooks/useGenerateHintMutation.ts'

type Props = {
    isLoading: boolean
    setIsLoading: Dispatch<SetStateAction<boolean>>
    messages: Message[]
    setMessages: Dispatch<SetStateAction<Message[]>>
    question: string
    questionId: string
}

export function QuickActions({
    isLoading,
    setIsLoading,
    messages,
    setMessages,
    questionId,
    question,
}: Props) {
    const { mutateAsync } = useGenerateHintMutation({
        onSuccess: () => {},
    })

    const getHint = async () => {
        setIsLoading(true)
        try {
            const response = await mutateAsync({
                question: extractBodyContent(question) ?? '',
                questionId,
            })

            setMessages((prev) => [
                ...prev,
                {
                    id: messages.length + 1,
                    role: 'assistant',
                    content: response.data?.hint ?? '',
                    timestamp: new Date(),
                },
            ])
        } catch (error) {
            console.error('Hint error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex gap-2 p-3 border-b border-gray-200 bg-gray-50">
            <Button
                onClick={getHint}
                disabled={isLoading}
                className="px-3 cursor-pointer py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
                Get Hint
            </Button>
            <Button
                onClick={() => {}}
                disabled={true}
                className="px-3 cursor-pointer py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
            >
                Show Steps
            </Button>
            <Button
                onClick={() => {}}
                disabled={true}
                className="px-3 cursor-pointer py-1.5 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50"
            >
                Explain Concept
            </Button>
        </div>
    )
}

/**
 * Extracts the body content from an HTML string
 * @param htmlString - The full HTML string
 * @param options - Options for extraction
 * @returns The extracted body content or null if no body found
 */
function extractBodyContent(
    htmlString: string,
    options: {
        removeScripts?: boolean
        removeStyles?: boolean
        returnOuterHTML?: boolean
    } = {}
): string | null {
    const {
        removeScripts = true,
        removeStyles = true,
        returnOuterHTML = false,
    } = options

    // Create a temporary DOM parser
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    // Get the body element
    const body = doc.body

    if (!body) {
        return null
    }

    // Clone the body to avoid modifying the original
    const bodyClone = body.cloneNode(true) as HTMLElement

    // Remove script tags if requested
    if (removeScripts) {
        const scripts = bodyClone.querySelectorAll('script')
        scripts.forEach((script) => script.remove())
    }

    // Remove style tags if requested
    if (removeStyles) {
        const styles = bodyClone.querySelectorAll('style')
        styles.forEach((style) => style.remove())
    }

    // Return either the outer HTML (including <body> tag) or inner HTML
    return returnOuterHTML ? bodyClone.outerHTML : bodyClone.innerHTML
}
