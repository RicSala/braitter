'use client'

import ChatHeader from "@/components/chat-header";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCompletion } from 'ai/react'
import ChatForm from "@/components/chat-form";
import ChatMessages from "@/components/chat-messages";

export default function ChatClient({
    companion,
}) {

    const router = useRouter()
    const [messages, setMessages] = useState(companion.messages)

    const { input, isLoading, handleInputChange, handleSubmit, setInput } = useCompletion({
        api: `/api/chat/${companion.id}`,
        onFinish(prompt, completion) {
            const systemMessage = {
                role: 'system',
                content: completion,
            }
            setMessages((current) => [...current, systemMessage])
            setInput('')

            router.refresh()
        }
    })


    const onSubmit = (event) => {
        console.log("sent!")
        const userMessage = {
            role: 'user',
            content: input
        }
        setMessages((current) => [...current, userMessage])
        handleSubmit(event)
    }

    return (
        <div className="flex flex-col h-full p-4 space-y-2">
            <ChatHeader companion={companion} />

            <ChatMessages
                companion={companion}
                isLoading={isLoading}
                messages={messages}
            />
            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit} />
        </div>
    );
}