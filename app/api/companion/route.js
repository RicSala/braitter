import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {

        const body = await req.json()
        const user = await currentUser()
        console.log(user)
        const {
            name,
            description,
            instructions,
            seed,
            src,
            categoryId,
        } = body

        if (!user || !user.id || !user.firstName) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        if (
            !name ||
            !description ||
            !instructions ||
            !seed ||
            !src ||
            !categoryId
        ) { return new NextResponse('Missing required field', { status: 400 }) }

        //TODO: Check for subscription

        const companion = await prisma.companion.create({
            data: {
                userId: user.id,
                userName: user.firstName,
                src,
                name,
                description,
                instructions,
                seed,
                category: {
                    connect: {
                        id: categoryId
                    }
                }

            }
        })

        return NextResponse.json(companion)


    } catch (error) {
        console.log('[COMPANION_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }

}