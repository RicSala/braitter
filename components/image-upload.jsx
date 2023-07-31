'use client '

import { CldUploadButton } from "next-cloudinary";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ImageUpload({
    children,
    value,
    onChange,
    disabled,
    className,
    ...props
}) {

    const [isMounted, setIsMounted] = useState(false);

    // To solve hydration mismatch error
    useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted) {
        return null;
    }

    return (
        <div className="space-y-4 w-full flex flex-col
        justify-center items-center
        ">
            <CldUploadButton
                onUpload={(result) => { onChange(result.info.secure_url) }}
                options={{
                    maxFiles: 1,
                }}
                uploadPreset="albilmwq"
            >
                <div className="
            p-4
            border-4
            border-dashed
            border-primary/10
            rounded-lg
            hover:opacity-75
            transition
            flex flex-col
            space-y-2
            items-center
            justify-center
            ">
                    <div className="relative h-40 w-40">
                        <Image
                            fill
                            alt="Upload"
                            src={value || "/images/placeholder.svg"}
                            className="rounded-lg object-cover"
                        />

                    </div>

                </div>
            </CldUploadButton>
        </div>
    );
}