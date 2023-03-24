import { wordlist } from "./diceware-wordlist.ts";

const NUM_WORDS = 5;

export async function generate() {
  const phrase = Array.from({ length: NUM_WORDS }).map(() => {
    const randoms = new Uint32Array(5);
    crypto.getRandomValues(randoms);
    return Array.from(randoms)
      .map((a) => Math.floor((a / (0xffffffff + 1)) * 6) + 1)
      .join("");
  });

  return phrase.map((word) => wordlist[word]);
}
