import http from "node:http";
import { analyzeSource } from "../core/report.js";

const PORT = Number(process.env.PORT || 4317);
const MAX_BODY = 1_000_000;

function send(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(data),
    "x-content-type-options": "nosniff",
    "cache-control": "no-store"
  });
  res.end(data);
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/health") {
    return send(res, 200, { ok: true, service: "designagent-os", version: "0.1.0" });
  }

  if (req.method === "POST" && req.url === "/api/analyze") {
    let body = "";
    req.setEncoding("utf8");

    req.on("data", chunk => {
      body += chunk;
      if (body.length > MAX_BODY) req.destroy();
    });

    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        if (typeof payload.source !== "string") {
          return send(res, 400, { error: "source must be a string" });
        }
        return send(res, 200, analyzeSource(payload.source, payload.metadata || {}));
      } catch {
        return send(res, 400, { error: "invalid JSON payload" });
      }
    });
    return;
  }

  send(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(`DesignAgent OS API listening on http://localhost:${PORT}`);
});
