import ChatHeader from "@/components/chat-header";

export default function ChatClient({
    companion,
}) {
    return (
        <div className="fex flex-col h-full p-4 space-y-2">
            <ChatHeader companion={companion} />
        </div>
    );
}