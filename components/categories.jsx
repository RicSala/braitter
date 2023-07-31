'use client'

import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

export default function Categories({ data }) {

    const router = useRouter();
    const searchParams = useSearchParams();

    const categoryId = searchParams.get("categoryId");

    const onClick = (categoryId) => {
        const query = { categoryId: categoryId };

        const url = qs.stringifyUrl({
            url: window.location.href,
            query: query,
        }, { skipEmptyString: true, skipNull: true });

        router.push(url);
    };

    return (
        <div className="w-full overflow-x-auto space-x-2 flex p-1">
            <button
                onClick={() => onClick(undefined)}
                className={
                    cn(`
            flex
            items-center
            text-center
            text-xs
            md:text-sm
            px-2
            md:px-4
            py-2
            md:py-3
            rounded-md
            bg-primary/10
            hover:opacity-75
            transition
            `,
                        !categoryId && "bg-primary/25"
                    )}>
                Newest
            </button>
            {
                data.map((category, index) => (
                    <button
                        onClick={() => onClick(category.id)}
                        key={category.id}
                        className={
                            cn(`
                            flex
                            items-center
                            text-center
                            text-xs
                            md:text-sm
                            px-2
                            md:px-4
                            py-2
                            md:py-3
                            rounded-md
                            bg-primary/10
                            hover:opacity-75
                            transition
                            `,
                                categoryId === category.id && "bg-primary/25"
                            )}>
                        {category.name}
                    </button>
                )
                )
            }
        </div>
    )

}