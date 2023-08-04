'use client'

import { SendHorizonal } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function ChatForm({
    input,
    handleInputChange,
    onSubmit,
    isLoading,
}) {
    return (
        //TODO: why don's we need the Form from shadcn here?
        <form
            onSubmit={onSubmit}
            className="
            border-t border-primary/10 py-4 flex items-center gap-x-2"
        >

            <Input
                disabled={isLoading}
                value={input}
                onChange={handleInputChange}
                placeholder={'Type a message'}
                className="rounded-lg bg-primary/10"
            />

            <Button disabled={isLoading} variant="ghost">
                <SendHorizonal className="h-6 w-6" />
            </Button>

        </form>
    );
}