import { Avatar, AvatarImage } from "./ui/avatar";

export default function BotAvatar({
    src
}) {
    return (
        <Avatar className='h-12 w-12'>
            <AvatarImage src={src} />
        </Avatar>
    );
}