import { createClient } from "pexels";
import { Image } from "../core/types";

export class ImageApiService {
  async getRandom(): Promise<Image[]> {
    const key = process.env.pexels_api_key;

    if (!key) {
      throw new Error("Missing API key");
    }

    const client = createClient(key);

    const result = await client.photos.search({ query: "nature",per_page: 100 });
    
    // valida resposta da API
    if (!("photos" in result)) {
      throw new Error("External API error");
    }

    const random = Math.floor(Math.random() * result.photos.length);
    const selectedPhoto = result.photos[random];

    return [selectedPhoto];
  }
}