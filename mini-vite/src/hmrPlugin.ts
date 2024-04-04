import { readFile } from "node:fs/promises";
import path from "node:path";
import { Plugin } from "rollup";
import WebSocket, { WebSocketServer } from "ws";

const virtualScriptId = "/@vite:hmr/script.js";

interface Data {
  type: string;
  data: { file: string };
}

export const setupHmrServer = () => {
  const wss = new WebSocketServer({ port: 24679, host: "localhost" });
  let ws: WebSocket;
  wss.on("connection", (connectedWs) => {
    ws = connectedWs;
  });

  return {
    send(data: Data) {
      if (!ws) return;
      ws.send(JSON.stringify(data));
    },
  };
};

export const hmr = (): Plugin => {
  return {
    name: "vite:hmr",
    async resolveId(id) {
      if (id === virtualScriptId) {
        return virtualScriptId;
      }
      return null;
    },
    async transform(code, id) {
      if (id.endsWith(".ts")) {
        const client = await readFile(path.resolve(__dirname, "./hmr-client.js"), "utf-8");
        return `
        ${client}
        
          hmrClient(import.meta);

          ${code}
        `;
      }
      return code;
    },
  };
};
