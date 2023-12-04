import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

import fs from "node:fs";

export const writeJSON = async (path, data) => {
  fs.writeFile(path, JSON.stringify(data), "utf8", (err) => {
    if (err) {
      console.log(`Error writing file: ${err}`);
    } else {
      console.log(`File is written successfully!`);
    }
  });
};

export const readJSON = (path) => require(path);
