import { ImageType } from "./types";

export interface ImageServie {
    getRandom(): Promise<ImageType[]>,
}

export async function getNatureImage(service: ImageServie): Promise<ImageType>{
    const data = await service.getRandom();

    if (data.length === 0) {
        throw new Error("No images available");
    }

    return data[0];
}