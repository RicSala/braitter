import Categories from "@/components/categories";
import Companions from "@/components/companions";
import SearchInput from "@/components/search-input";
import prisma from "@/lib/prisma";

export default async function RootPage({
    children,
    searchParams
}) {

    const companions = await prisma.companion.findMany({
        where: {
            categoryId: searchParams.categoryId,
            name: {
                contains: searchParams.name
            }

        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: {
                    messages: true
                }
            }
        }
    })

    const categories = await prisma.category.findMany({});

    return (
        <div className="h-full p-4 space-y-2">
            <SearchInput />
            <Categories data={categories} />
            <Companions data={companions} />
        </div>
    );
}