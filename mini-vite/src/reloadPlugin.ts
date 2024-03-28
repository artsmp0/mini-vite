import { Plugin } from "rollup";
import parse from "node-html-parser";
import WebSocket, { WebSocketServer } from "ws";

const port = 24678;
const virtualScriptId = "/@vite:reload/script.js";
const virtualScript = `
  const ws = new WebSocket('ws://localhost:${port}/')
  ws.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data)
    if (msg.type === 'reload') {
      location.reload()
    }
  })
`;

interface Data {
  type: string;
}

export const setupReloadServer = () => {
  const wss = new WebSocketServer({ port, host: "localhost" });
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

export const reload = (): Plugin => {
  return {
    name: "vite:reload",
    async resolveId(id) {
      if (id === virtualScriptId) {
        return virtualScriptId;
      }
      return null;
    },
    load(id) {
      if (id === virtualScriptId) {
        return virtualScript;
      }
      return null;
    },
    transform(code, id) {
      if (!id.endsWith(".html")) return null;
      const doc = parse(code);
      doc.querySelector("head")?.insertAdjacentHTML("beforeend", `<script type="module" src="${virtualScriptId}">`);
      return doc.toString();
    },
  };
};
