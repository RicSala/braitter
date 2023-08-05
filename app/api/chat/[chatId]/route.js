import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser } from "@clerk/nextjs"
import { CallbackManager } from "langchain/callbacks"
import { NextResponse } from "next/server";
import { Replicate } from "langchain/llms/replicate"

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {

    try {

        const { prompt } = await req.json()
        const user = await currentUser()

        if (!user || !user.firstName || !user.id) {
            return new NextResponse("Unauthorized")
        }

        const identifier = req.url + "-" + user.id
        const { success } = await rateLimit(identifier)
        if (!success) {
            return new NextResponse("Rate limit exceeded", { status: 429 })
        }

        // This is just the database to show to the users, not the one the ai will use
        const companion = await prisma.companion.update({
            where: {
                id: params.chatId,
            },
            data: {
                messages: {
                    create: {
                        content: prompt,
                        role: 'user',
                        userId: user.id
                    }
                }
            }
        })

        if (!companion) {
            return new NextResponse("Companion not found", { status: 404 })
        }

        const name = companion.id
        const companion_file_name = name + ".txt"

        const companionKey = {
            companionName: name,
            userId: user.id,
            modelName: "llama2-13b"
        }

        const memoryManager = MemoryManager.getInstance()

        const records = await memoryManager.readLatestHistory(companionKey)

        if (records.length === 0) {
            await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey)
        }

        await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey)

        const recentChatHistory = await memoryManager.getLatestHistory(companionKey)

        const similarDocs = await memoryManager.vectorSearch(
            recentChatHistory,
            companion_file_name
        )

        let relevantHistory = ""

        if (!!similarDocs && similarDocs.length !== 0) {
            relevantHistory = similarDocs.map((doc) => (
                doc.pageContent)).join("\n")
        }

        const { handlers } = LangChainStream()

        const model = new Replicate({
            model: "a16z-infra/llama-2-13b-chat:2a7f981751ec7fdf87b5b91ad4db53683a98082e9ff7bfd12c8cd5ea85980a52",
            input: {
                max_length: 2048,
            },
            apiKey: process.env.REPLICATE_API_TOKEN,
            callbackManager: CallbackManager.fromHandlers(handlers),
        })

        model.verbose = true

        const resp = String(
            await model
                .call(`
                ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${name}: prefix.

                ${companion.instructions}

                Below are the relevant details about ${name}'s past and the conversation you are in.

                ${relevantHistory}

                ${recentChatHistory}\n${name}:
                `)
                .catch(console.error)
        )

        const cleaned = resp.replace(",", "")
        const chunks = cleaned.split("\n")
        const response = chunks[0]

        await memoryManager.writeToHistory("" + response.trim(),
            companionKey)

        var Readable = require("stream").Readable

        let s = new Readable()
        s.push(response)
        s.push(null)

        if (response !== undefined && response.length > 1) {
            memoryManager.writeToHistory("" + response.trim(), companionKey)

            await prisma.companion.update({
                where: {
                    id: params.chatId,
                },
                data: {
                    messages: {
                        create: {
                            content: response.trim(),
                            role: "system",
                            userId: user.id
                        }
                    }
                }
            })
        }

        return new StreamingTextResponse(s)

    } catch (error) {
        console.log("[CHAT_POST]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}