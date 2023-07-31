import Categories from "@/components/categories";
import SearchInput from "@/components/search-input";
import prisma from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";

export default async function RootPage({
    children
}) {

    const categories = await prisma.category.findMany({});

    return (
        <div className="h-full p-4 space-y-2">
            <SearchInput />
            <Categories data={categories} />
        </div>
    );
}