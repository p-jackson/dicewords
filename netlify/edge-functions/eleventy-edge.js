import {
  EleventyEdge,
  precompiledAppData,
} from "./_generated/eleventy-edge-app.js";
import { generate } from "./generation/generate.ts";

export default async (request, context) => {
  try {
    if (request.method === "POST") {
      try {
        const formData = await request.formData();

        const wordCountParam = parseInt(formData.get("word-count") ?? "", 10);
        const wordCount = isNaN(wordCountParam) ? 5 : wordCountParam;
        const dictionary = formData.get("dictionary") ?? "reinhold";

        return new Response(null, {
          status: 302,
          statusText: "Found",
          headers: {
            Location: request.url,
            "Set-Cookie": `state=${dictionary},${wordCount}; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict;`,
          },
        });
      } catch (e) {
        console.error(e);
        return new Response(null, {
          status: 302,
          statusText: "Found",
          headers: {
            Location: request.url,
          },
        });
      }
    }

    const edge = new EleventyEdge("edge", {
      request,
      context,
      precompiled: precompiledAppData,
      cookies: [],
    });

    const [dictionary = "reinhold", wordCountAsStr = ""] =
      request.headers.get("Cookie")?.split(";")[0]?.split("=")[1]?.split(",") ??
      [];

    const wordCountParam = parseInt(wordCountAsStr, 10);
    const wordCount = isNaN(wordCountParam) ? 5 : wordCountParam;

    const phrase = generate(wordCount, dictionary);

    edge.config((eleventyConfig) => {
      eleventyConfig.addGlobalData("phrase", phrase);
      eleventyConfig.addGlobalData("wordCount", wordCount);
      eleventyConfig.addGlobalData("dictionary", dictionary);
    });

    return await edge.handleResponse();
  } catch (e) {
    console.log("ERROR", { e });
    return context.next(e);
  }
};
