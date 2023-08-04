import prisma from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function PATCH(req, { params }) {
    try {

        const body = await req.json()
        const user = await currentUser()
        const { companionId } = params

        if (!companionId) {
            return new NextResponse("CompanionId is required", { status: 400 })
        }

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

        const companion = await prisma.companion.update({
            where: {
                id: companionId
            },
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
        console.log('[COMPANION_PATCH]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }

}

export async function DELETE(req, { params }) {

    try {

        const { userId } = auth()

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { companionId } = params

        const companion = await prisma.companion.delete({
            where: {
                userId, // So no other user can delete the companion
                id: companionId
            }
        })

        return NextResponse.json(companion)

    } catch (error) {
        console.log('[COMPANION_DELETE]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }

}