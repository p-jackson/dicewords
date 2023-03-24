import { readLines } from "https://deno.land/std@0.181.0/io/read_lines.ts";

const NUM_WORDS = 5;

export async function generate() {
  const file = await Deno.open(
    "netlify/edge-functions/generation/diceware.wordlist.asc.txt"
  );

  const phrase = Array.from({ length: NUM_WORDS }).map(() => {
    const randoms = new Uint32Array(5);
    crypto.getRandomValues(randoms);
    return Array.from(randoms)
      .map((a) => Math.floor((a / (0xffffffff + 1)) * 6) + 1)
      .join("");
  });

  let found = 0;
  for await (const line of readLines(file)) {
    for (let i = 0; i < phrase.length; i++) {
      const word = phrase[i];
      if (line.startsWith(word)) {
        phrase[i] = line.split("\t")[1];
        found++;
      }
    }
    if (found >= NUM_WORDS) break;
  }

  return phrase;
}
