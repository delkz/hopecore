import { getNatureImage } from "@/app/backend/core/getNatureImage";
import { ImageApiService } from "@/app/backend/services/imageApi";
import { NextResponse } from "next/server";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedImage: any = null;
let lastFetchTime = 0;

let lastRequestTime = 0;
const RATE_LIMIT_MS = 1000;

export async function GET(req: Request) {
  try {
    const now = Date.now();

    // rate limit
    if (now - lastRequestTime < RATE_LIMIT_MS) {
      return NextResponse.json(
        { message: "Too many requests.. " },
        { status: 429 }
      );
    }

    lastRequestTime = now;

    const url = new URL(req.url);
    const refresh = url.searchParams.get("refresh");

    // cache
    if (cachedImage && !refresh) {
      return NextResponse.json(cachedImage);
    }

    // fluxo normal
    const service = new ImageApiService();
    const image = await getNatureImage(service);

    // salva cache
    cachedImage = image;
    lastFetchTime = now;

    return NextResponse.json(image);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ message }, { status: 500 });
  }
}