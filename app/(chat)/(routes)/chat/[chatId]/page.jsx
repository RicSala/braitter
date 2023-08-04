import prisma from "@/lib/prisma";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ChatClient from "./components/chat-client";



export default async function ChatPage({
    params
}) {

    const { userId } = auth()
    if (!userId) {
        return redirectToSignIn()
    }

    const companion = await prisma.companion.findUnique({
        where: {
            id: params.chatId
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc"
                },
                where: {
                    userId: userId,
                }
            },
            _count: {
                select: {
                    messages: true
                }
            }
        },
    })

    if (!companion) {
        redirect('/') //TODO: Instead of router, in server we use this.
    }


    return (
        <ChatClient companion={companion} />
    );
}