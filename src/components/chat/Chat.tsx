import { Bot, User } from 'lucide-react'
import { useRef, useState } from 'react'
import { QuickActions } from '@/components/chat/QuickActions.tsx'

export type Message = {
    id: number
    role: string
    content: string
    timestamp: Date
}

type Props = {
    questionId: string
    question: string
}

export function Chat({ questionId, question }: Props) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: 'assistant',
            content:
                "Hi! I'm here to help you with this math problem. I can explain concepts, show diagrams, and guide you step-by-step!",
            timestamp: new Date(),
        },
    ])

    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    // const sendMessage = async () => {
    //     if (!inputMessage.trim() || isLoading) return
    //
    //     const userMessage = {
    //         id: messages.length + 1,
    //         role: 'user',
    //         content: inputMessage,
    //         timestamp: new Date(),
    //     }
    //
    //     setMessages((prev) => [...prev, userMessage])
    //     setInputMessage('')
    //     setIsLoading(true)
    //
    //     try {
    //         const response = await fetch('/api/chat/math-help', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 message: inputMessage,
    //                 currentQuestion: '',
    //                 questionId: '',
    //                 userId: '',
    //                 conversationHistory: messages.slice(-10),
    //                 requestVisual: true, // Request visual content when appropriate
    //             }),
    //         })
    //
    //         if (!response.ok) throw new Error('Failed to get response')
    //
    //         const data = await response.json()
    //
    //         const assistantMessage = {
    //             id: messages.length + 2,
    //             role: 'assistant',
    //             content: data.response,
    //             timestamp: new Date(),
    //             diagram: data.diagram, // Include diagram if provided
    //             latex: data.latex, // Include LaTeX if provided
    //         }
    //
    //         setMessages((prev) => [...prev, assistantMessage])
    //     } catch (error) {
    //         console.error('Chat error:', error)
    //         setMessages((prev) => [
    //             ...prev,
    //             {
    //                 id: messages.length + 2,
    //                 role: 'assistant',
    //                 content: 'Sorry, I encountered an error. Please try again.',
    //                 timestamp: new Date(),
    //             },
    //         ])
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    // const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (e.key === 'Enter' && !e.shiftKey) {
    //         e.preventDefault()
    //         sendMessage()
    //     }
    // }

    return (
        <>
            <div className="flex flex-col h-full bg-white rounded-lg shadow-xl border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        <h3 className="font-semibold">Math Assistant</h3>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${
                                message.role === 'user'
                                    ? 'justify-end'
                                    : 'justify-start'
                            }`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <div className={`max-w-[80%] space-y-2`}>
                                <div
                                    className={`rounded-lg p-3 ${
                                        message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                    <span
                                        className={`text-xs mt-1 block ${
                                            message.role === 'user'
                                                ? 'text-blue-100'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {message.timestamp.toLocaleTimeString(
                                            [],
                                            {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }
                                        )}
                                    </span>
                                </div>
                            </div>

                            {message.role === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <div className="flex gap-1">
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: '0ms' }}
                                    ></span>
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: '150ms' }}
                                    ></span>
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: '300ms' }}
                                    ></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <QuickActions
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    messages={messages}
                    setMessages={setMessages}
                    questionId={questionId}
                    question={question}
                />

                {/* Input Area */}
                {/*<div className="p-4 border-t border-gray-200">*/}
                {/*    <div className="flex gap-2">*/}
                {/*        <input*/}
                {/*            type="text"*/}
                {/*            value={inputMessage}*/}
                {/*            onChange={(e) => setInputMessage(e.target.value)}*/}
                {/*            onKeyPress={handleKeyPress}*/}
                {/*            placeholder="Ask for help, request a diagram, or type your answer..."*/}
                {/*            disabled={isLoading}*/}
                {/*            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"*/}
                {/*        />*/}
                {/*        <button*/}
                {/*            onClick={sendMessage}*/}
                {/*            disabled={!inputMessage.trim() || isLoading}*/}
                {/*            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"*/}
                {/*        >*/}
                {/*            <Send className="w-5 h-5" />*/}
                {/*        </button>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </>
    )
}
