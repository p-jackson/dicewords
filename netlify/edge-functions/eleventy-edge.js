import {
  EleventyEdge,
  precompiledAppData,
} from "./_generated/eleventy-edge-app.js";
import { generate } from "./generation/generate.ts";
import { encode as encodeBase64 } from "https://deno.land/std@0.182.0/encoding/base64.ts";

const cookieSecretKey = await crypto.subtle.importKey(
  "raw",
  stringToArrayBuffer(Deno.env.get("COOKIE_SECRET") ?? "secret"),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign"]
);

export default async (request, context) => {
  try {
    if (request.method === "POST") {
      try {
        const formData = await request.formData();

        const wordCountParam = parseInt(formData.get("word-count") ?? "", 10);
        const wordCount = isNaN(wordCountParam) ? 6 : wordCountParam;
        const dictionary = formData.get("dictionary") ?? "reinhold";

        const cookieValue = await createSignedCookie(
          `${dictionary},${wordCount}`
        );

        return new Response(null, {
          status: 302,
          statusText: "Found",
          headers: {
            Location: request.url,
            "Set-Cookie": cookieValue,
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
      await readCookieString(request);

    const wordCountParam = parseInt(wordCountAsStr, 10);
    const wordCount = isNaN(wordCountParam) ? 6 : wordCountParam;

    const [phrase, totalEntropy, entropyPerCharacter] = generate(wordCount, dictionary);

    edge.config((eleventyConfig) => {
      eleventyConfig.addGlobalData("phrase", phrase);
      eleventyConfig.addGlobalData("wordCount", wordCount);
      eleventyConfig.addGlobalData("dictionary", dictionary);
      eleventyConfig.addGlobalData("totalEntropy", totalEntropy);
      eleventyConfig.addGlobalData("entropyPerCharacter", entropyPerCharacter);
    });

    return await edge.handleResponse();
  } catch (e) {
    console.log("ERROR", { e });
    return context.next(e);
  }
};

async function readCookieString(request) {
  const headerValue = request.headers.get("Cookie");
  if (!headerValue) {
    return [];
  }

  const [value, requestSignature] =
    headerValue.split(";")[0]?.split("state=")[1]?.split(".") ?? [];
  const cookieString = createCookieString(value);

  const newSignature = await crypto.subtle.sign(
    { name: "HMAC" },
    cookieSecretKey,
    stringToArrayBuffer(cookieString)
  );

  if (encodeBase64(newSignature) !== requestSignature) {
    return [];
  }

  return headerValue.split(";")[0]?.split("=")[1]?.split(/[,\.]/) ?? [];
}

async function createSignedCookie(value) {
  const cookieString = createCookieString(value);

  const signature = await crypto.subtle.sign(
    { name: "HMAC" },
    cookieSecretKey,
    stringToArrayBuffer(cookieString)
  );

  return createCookieString(value + "." + encodeBase64(signature));
}

function createCookieString(value) {
  return `state=${value}; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict;`;
}

function stringToArrayBuffer(str) {
  const buf = new ArrayBuffer(str.length * 2); // Each character in JavaScript is 2 bytes (UTF-16)
  const bufView = new Uint16Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
