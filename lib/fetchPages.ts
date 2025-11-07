// Temporary: ignore missing type declarations.
// Install types with `npm i --save-dev @types/html-to-text` or add a `.d.ts` declaring the module for a proper fix.
// @ts-ignore
import { extract } from "html-to-text";
import { smartSearch } from "@/lib/searchRouter";
import { googleSearchImage } from "@/lib/googleSearch";

async function searchPerplexity(query: string): Promise<any[]> {
  try {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) {
      throw new Error("PERPLEXITY_API_KEY not configured");
    }

    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: `Search for manufacturing/industrial part information about "${query}". 
If this is a part number or product, find: product name, specifications, manufacturer, applications, images.
Focus on datasheets, manufacturer specs, and product information.
Return findings in JSON with: title, snippet, link, images (array of URLs).
If no manufacturing information found, return empty array.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      throw new Error(`Perplexity API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "";

    if (!content || content.includes("no information") || content.includes("not found")) {
      console.warn("[searchPerplexity] No results found");
      return [];
    }

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
      return [{ title: query, snippet: content, link: "https://perplexity.ai" }];
    } catch {
      return [{ title: query, snippet: content, link: "https://perplexity.ai" }];
    }
  } catch (e) {
    console.error("[searchPerplexity] error:", e);
    throw e;
  }
}

async function searchGoogle(query: string): Promise<any[]> {
  try {
    const key = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!key || !cx) {
      console.warn("[searchGoogle] Google Search not configured");
      return [];
    }

    const searchQuery = `${query} specification datasheet -law -statute -ordinance -code`;

    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(searchQuery)}&key=${key}&cx=${cx}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`Google API error: ${res.status}`);
    }

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
    }));
  } catch (e) {
    console.error("[searchGoogle] error:", e);
    return [];
  }
}

export async function fetchAndExtractText(
  query: string,
  opts?: { engine?: "auto" | "perplexity" | "google" }
): Promise<any[]> {
  const engine = opts?.engine || "auto";

  if (engine === "perplexity" || engine === "auto") {
    try {
      const results = await searchPerplexity(query);
      if (results && results.length > 0) {
        console.log(`[fetchAndExtractText] Found ${results.length} Perplexity results`);
        return results;
      }
    } catch (e) {
      console.error("[fetchAndExtractText] Perplexity search failed:", e);
      if (engine === "perplexity") throw e;
    }
  }

  if (engine === "google" || engine === "auto") {
    try {
      const results = await searchGoogle(query);
      if (results && results.length > 0) {
        console.log(`[fetchAndExtractText] Found ${results.length} Google results`);
        return results;
      }
    } catch (e) {
      console.error("[fetchAndExtractText] Google search failed:", e);
      if (engine === "google") throw e;
    }
  }

  console.warn("[fetchAndExtractText] No results from any search engine");
  throw new Error(`No information found for "${query}"`);
}

export async function fetchImages(query: string): Promise<string[]> {
  try {
    const key = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!key || !cx) {
      console.warn("[fetchImages] ⚠️ Google Search not configured (missing GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID)");
      return [];
    }

    const searchQuery = `${query} product image -logo -icon`;

    console.log(`\n[fetchImages] 🔍 Searching Google Images for: "${query}"`);
    console.log(`[fetchImages] Query: ${searchQuery}\n`);

    // ใช้ googleSearchImage จาก lib/googleSearch.ts
    const { results } = await googleSearchImage(searchQuery, 6);
    
    // Extract URLs จากผลลัพธ์
    const imageUrls = results
      .map((r: any) => r.url)
      .filter((url: string) => 
        url && /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
      )
      .slice(0, 6);

    console.log(`[fetchImages] ✅ Found ${imageUrls.length} images from Google\n`);
    console.log(`[fetchImages] 📸 Image URLs:\n`);
    
    console.log(`  images: [`);
    imageUrls.forEach((url: string, i: number) => {
      const comma = i < imageUrls.length - 1 ? "," : "";
      console.log(`    '${url}'${comma}`);
    });
    console.log(`  ],\n`);

    return imageUrls;
  } catch (e) {
    console.error("[fetchImages] ❌ Error:", e);
    return [];
  }
}
