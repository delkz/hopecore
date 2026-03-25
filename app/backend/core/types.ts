import { PhotosWithTotalResults } from "pexels"

export type ImageType = {
    id: number,
    width: number,
    height: number,
    url: string,
    photographer: string,
    photographer_url: string,
    photographer_id: string,
    avg_color: string | null,
    src: {
        original: string,
        large2x: string,
        large: string,
        medium: string,
        small: string,
        portrait: string,
        landscape: string,
        tiny: string
    },
    liked: boolean,
    alt: string | null
}

export type SearchResult = PhotosWithTotalResults

export type TextOptions = {
    fontSize: number;
    color: string;
    textAlign: "left" | "center" | "right" | string;
    textWeight: "normal" | "bold" | "bolder" | "lighter" | number | string;
    fontfamily: "Arial" | "Helvetica" | "Times New Roman" | "Courier New" | "Verdana" | string;
}