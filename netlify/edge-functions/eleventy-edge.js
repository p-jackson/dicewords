import {
  EleventyEdge,
  precompiledAppData,
} from "./_generated/eleventy-edge-app.js";
import { generate } from "./generation/generate.ts";

export default async (request, context) => {
  try {
    const edge = new EleventyEdge("edge", {
      request,
      context,
      precompiled: precompiledAppData,
      cookies: [],
    });

    const { searchParams } = new URL(request.url);
    const wordCountParam = parseInt(searchParams.get("word-count") ?? "", 10);
    const wordCount = isNaN(wordCountParam) ? 5 : wordCountParam;
    const dictionary = searchParams.get("dictionary") ?? "reinhold";

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
