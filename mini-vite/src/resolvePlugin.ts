import path from "path";
import fs from "fs/promises";
import type { Plugin } from "rollup";

const root = process.cwd();
const extensions = ["", ".ts", ".js"];

const fileExists = async (p: string) => {
  try {
    const stat = await fs.stat(p);
    if (stat.isFile()) return true;
  } catch {}
  return false;
};

export const resolve = (): Plugin => {
  return {
    name: "vite:resolve",
    async resolveId(id) {
      for (const ext of extensions) {
        const absolutePath = path.resolve(root, `.${id}${ext}`);
        if (await fileExists(absolutePath)) {
          return absolutePath;
        }
      }
      if (id.endsWith("/")) {
        const absolutePath = path.resolve(root, `.${id}index.html`);
        if (await fileExists(absolutePath)) {
          return absolutePath;
        }
      }
      return null;
    },
    async load(id) {
      try {
        const res = await fs.readFile(id, "utf-8");
        return res;
      } catch {}
      return null;
    },
  };
};
