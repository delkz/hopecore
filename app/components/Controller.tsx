"use client";

import { useEffect, useState } from "react";
import { ImageType } from "../backend/core/types";
import EditorForm from "./EditorForm";
import Preview from "./Preview";
import { useEditorStore } from "../store/useEditorStore";

export default function Controller() {
    const [image, setImage] = useState<ImageType | null>(null);
    const setStoreImage = useEditorStore((state) => state.setImage);


    useEffect(() => {
        let isMounted = true;

        async function load() {
            const res = await fetch("/api/image");
            const data = await res.json();
            console.log("Fetched image:", data);

            if (!data) {
                console.error("No data received from API");
                return;
            }

            if (isMounted) {
                setImage(data);
                setStoreImage(data);
            }
        }

        load();

        return () => {
            isMounted = false;
        };
    }, [setStoreImage]);

    if (!image) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto">

            <div className="flex flex-col lg:flex-row items-start gap-6">
                <Preview />
                <EditorForm />
            </div>
            <div className="mt-4">
             
            </div>
        </div>
    );
}