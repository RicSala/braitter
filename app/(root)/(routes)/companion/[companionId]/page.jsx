import prisma from "@/lib/prisma";
import CompanionForm from "./components/companionForm";



export default async function CompanionIdPage({
    params
}) {

    //TODO: check subscription  status

    let companion = null;
    let isNew = false

    if (params.companionId === "new") {
        isNew = true
        companion = {
            name: "",
            description: "",
            instructions: "",
            seed: "",
            src: "",
            categoryId: undefined,
        }
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
            isNew={isNew}
        />
    );
}