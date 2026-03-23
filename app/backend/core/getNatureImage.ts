import { Image, SearchResult } from "./types";

export interface ImageServie {
    getRandom(): Promise<Image[]>,
}

export async function getNatureImage(service: ImageServie): Promise<Image>{
    const data = await service.getRandom();

    if (data.length === 0) {
        throw new Error("No images available");
    }

    return data[0];
}