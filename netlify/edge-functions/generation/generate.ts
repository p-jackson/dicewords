import { wordlist as reinholdWordlist } from "./dictionaries/original-diceware-wordlist.ts";
import { wordlist as effLargeWordlist } from "./dictionaries/eff-large-wordlist.ts";
import { wordlist as effShortWordlist1 } from "./dictionaries/eff-short-wordlist-1.ts";
import { wordlist as effShortWordlist2 } from "./dictionaries/eff-short-wordlist-2.ts";

export function generate(wordCount: number, dictionary: string) {
  const [wordlist, diceCount] = getWordlist(dictionary);

  const phrase = Array.from({ length: wordCount }).map(() => {
    const randoms = new Uint32Array(diceCount);
    crypto.getRandomValues(randoms);
    return Array.from(randoms)
      .map((a) => Math.floor((a / (0xffffffff + 1)) * 6) + 1)
      .join("");
  });

  return phrase.map((word) => wordlist[word]);
}

function getWordlist(dictionary: string): [Record<string, string>, number] {
  switch (dictionary) {
    case "eff-long":
      return [effLargeWordlist, 5];
    case "eff-short":
      return [effShortWordlist1, 4];
    case "eff-short2":
      return [effShortWordlist2, 4];
    case "reinhold":
    default:
      return [reinholdWordlist, 5];
  }
}
