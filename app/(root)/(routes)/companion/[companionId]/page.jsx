import prisma from "@/lib/prisma";
import CompanionForm from "./components/companionForm";



export default async function CompanionIdPage({
    params
}) {

    //TODO: check subscription  status

    let companion = null;

    if (params.companionId === "new") {
        companion = {}
    } else {
        companion = await prisma.companion.findUnique({
            where: { id: params.companionId }
        });
    }

    const categories = await prisma.category.findMany();



    return (
        <CompanionForm
            initialData={companion}
            categories={categories}
        />
    );
}