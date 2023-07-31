'use client'

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Sidebar from "./sidebar";


export default function MobileSidebar({
    children
}) {
    return (
        <Sheet>
            <SheetTrigger>
                <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-secondary pt-10 w-32">
                <Sidebar />
            </SheetContent>
        </Sheet>

    );
}