'use client'

import { useEffect, useRef, useState } from "react";
import ChatMessage from "./chat-message";

export default function ChatMessages({
    companion,
    isLoading,
    messages = [],
}) {


    const scrollRef = useRef(null)
    const [fakeLoading, setFakeLoading] = useState(messages.length === 0)

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setFakeLoading(() => false)
        }, 1000)

        return () => {
            clearTimeout(timeOut)
        }
    }, [])

    useEffect(() => {
        scrollRef?.current?.scrollIntoView({ behavior: "smooth" }) //TODO: where is scrollIntoView comming from?
    }, [messages.length])

    return (
        <div className="flex-1 overflow-y-auto pr-4">
            <ChatMessage
                isLoading={fakeLoading}
                src={companion.src}
                role={'system'}
                content={`Hello! I am ${companion.name}, ${companion.description}`}
            />

            {
                messages.map(message => (
                    <ChatMessage
                        role={message.role}
                        content={message.content}
                        src={message.src}
                        key={message.id}
                    />
                ))
            }
            {
                isLoading &&
                <ChatMessage role={'system'} src={companion.src} isLoading />
            }
            <div ref={scrollRef} />
        </div>
    );
}