import path from "node:path";
import fs from "node:fs/promises";
import parse from "node-html-parser";
import { getPlugins } from "./plugins";
import { rollup } from "rollup";

const root = process.cwd();
const dist = path.resolve(root, "./dist");

export const startBuild = async () => {
  const plugins = getPlugins(false);
  await fs.rm(dist, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(dist);

  const indexHtmlPath = path.resolve(root, "./index.html");
  const distIndexHtmlPath = path.resolve(dist, "./index.html");

  await processHtml(indexHtmlPath, distIndexHtmlPath, async (src) => {
    const bundle = await rollup({ plugins, input: path.resolve(root, `${src}`) });
    const { output } = await bundle.write({
      dir: dist,
      format: "es",
      entryFileNames: "assets/[name].[hash].js",
      chunkFileNames: "assets/[name].[hash].js",
    });
    await bundle.close();
    return `/${output[0].fileName}`;
  });
};

const processHtml = async (indexHtmlPath: string, distIndexHtmlPath: string, bundleEntrypoint: (path: string) => Promise<string>) => {
  const htmlContent = await fs.readFile(indexHtmlPath, "utf-8");
  const doc = parse(htmlContent);
  const scriptTag = doc.querySelector("script");
  if (scriptTag) {
    const src = scriptTag.getAttribute("src");
    if (src) {
      const newSrc = await bundleEntrypoint(src);
      scriptTag.setAttribute("src", newSrc);
    }
  }
  await fs.writeFile(distIndexHtmlPath, doc.toString(), "utf-8");
};
