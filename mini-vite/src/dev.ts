import connect from "connect";
import historyApiFallback from "connect-history-api-fallback";
import sirv from "sirv";
import { transformMiddleware } from "./transformMiddleware";
import { getPlugins } from "./plugins";
import { createPluginContainer } from "./pluginContainer";
import { setupReloadServer as setupWsServer } from "./reloadPlugin";
import { createFileWatcher } from "./fileWatcher";
import { setupHmrServer } from "./hmrPlugin";
export const startDev = () => {
  const server = connect();
  server.listen(3000, "localhost");
  const ws = setupWsServer();
  const hmrWs = setupHmrServer();
  const plugins = getPlugins(true);
  const pluginContainer = createPluginContainer(plugins);
  server.use(transformMiddleware(pluginContainer));
  server.use(
    sirv(undefined, {
      dev: true,
      etag: true,
      setHeaders(res, pathname) {
        if (/\.[tj]s$/.test(pathname)) {
          res.setHeader("Content-Type", "application/javascript");
        }
      },
    })
  );
  server.use(historyApiFallback);
  console.log("dev server running at http://localhost:3000");

  createFileWatcher((eventName, path) => {
    console.log(`Detected file change (${eventName}) reloading!: ${path}`);
    if (eventName === "change") {
      hmrWs.send({ type: "file:change", data: { file: `/${path}` } });
    } else {
      ws.send({ type: "reload" });
    }
  });
};
