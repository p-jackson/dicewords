const fs = require("fs");
const readline = require("readline");
const crypto = require("crypto");

const NUM_WORDS = 5;

module.exports = async () => {
  const fileStream = fs.createReadStream("diceware.wordlist.asc.txt", "utf8");
  const rl = readline.createInterface({ input: fileStream });

  const phrase = Array.from({ length: NUM_WORDS }).map(() =>
    Array.from({ length: 5 })
      .map(() => crypto.randomInt(1, 7))
      .join("")
  );

  let found = 0;
  for await (const line of rl) {
    for (let i = 0; i < phrase.length; i++) {
      const word = phrase[i];
      if (line.startsWith(word)) {
        phrase[i] = line.split("\t")[1];
        found++;
      }
    }
    if (found >= NUM_WORDS) break;
  }

  return { phrase };
};
