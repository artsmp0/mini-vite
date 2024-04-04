import { hmr } from "./hmrPlugin";
import { reload } from "./reloadPlugin";
import { resolve } from "./resolvePlugin";
import esbuild from "rollup-plugin-esbuild";

/** 内置插件集合 */
export const getPlugins = (isDev: boolean) => {
  console.log("isDev: ", isDev);
  return [
    ...(isDev ? [resolve(), reload(), hmr()] : []),
    esbuild({
      target: isDev ? "esnext" : "es2019",
      minify: !isDev,
    }),
  ];
};
