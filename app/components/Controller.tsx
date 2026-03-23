"use client";

import { useEffect, useState } from "react";
import { Image } from "../backend/core/types";
import Preview from "./Preview";

export default function Controller() {
    const [image, setImage] = useState<Image | null>(null);


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
            }
        }

        load();

        return () => {
            isMounted = false;
        };
    }, []);

    if (!image) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto">

            <div>
                <Preview
                    image={
                        image
                    }
                    text={
                        {
                            value: "Motivate yourself today!",
                            options: {
                                fontSize: 64,
                                color: "yellow",
                                textAlign: "left",
                                fontfamily: "Arial"
                            }
                        }
                    }
                />
            </div>
            <div className="mt-4">
             
            </div>
        </div>
    );
}