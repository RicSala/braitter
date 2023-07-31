import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function layout({
    children
}) {
    return (
        <div className="h-full">
            <Navbar />
            <div className="
            hidden md:flex mt-16 flex-col fixed inset-y-0
            ">
                <Sidebar />

            </div>
            <main className="md:pl-24 pt-16 h-full">
                {children}
            </main>
        </div>
    );
}