export default function authLayout({
    children
}) {
    return (
        <div className="
        flex flex-row items-center
        justify-center h-full">
            {children}
        </div>
    );
}