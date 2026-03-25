"use client";

import { useEffect, useState } from "react";
import { ImageType } from "../backend/core/types";
import EditorForm from "./EditorForm";
import Preview from "./Preview";
import { useEditorStore } from "../store/useEditorStore";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/20/solid";

export default function Controller() {
    const [image, setImage] = useState<ImageType | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        <div className="container mx-auto relative">
            <button
                type="button"
                className="btn min-h-16 min-w-16 btn-secondary fixed bottom-4 right-4 z-40 lg:hidden rounded-full"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
                {isMobileMenuOpen ? <XMarkIcon></XMarkIcon> : <PencilSquareIcon></PencilSquareIcon>}


            </button>

            {isMobileMenuOpen && (
                <button
                    type="button"
                    aria-label="Close editor backdrop"
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className="flex flex-col lg:flex-row gap-6 w-full justify-center items-center">
                <Preview />

                <aside
                    className={`
                        fixed top-0 right-0 h-dvh w-[88vw] max-w-sm bg-white z-40 shadow-2xl
                        transform transition-transform duration-300 lg:static lg:h-auto lg:w-auto lg:max-w-none lg:shadow-none
                        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
                    `}
                >
                    <div className="flex items-center justify-between px-4 pt-4 lg:hidden">
                        <h2 className="font-semibold">Editor</h2>
                        <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Fechar
                        </button>
                    </div>
                    <div className="overflow-y-auto h-[calc(100dvh-3.5rem)] lg:h-auto">
                        <EditorForm />
                    </div>
                </aside>
            </div>
            <div className="mt-4">
             
            </div>
        </div>
    );
}