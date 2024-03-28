import { reload } from "./reloadPlugin";
import { resolve } from "./resolvePlugin";
import esbuild from "rollup-plugin-esbuild";

/** 内置插件集合 */
export const getPlugins = (isDev: boolean) => {
  return [
    ...(isDev ? [resolve(), reload()] : []),
    esbuild({
      target: isDev ? "esnext" : "es2019",
      minify: !isDev,
    }),
  ];
};
