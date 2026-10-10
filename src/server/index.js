import http from "node:http";
import { analyzeSource } from "../core/report.js";
import { compileStyleDocuments, getDesignStyle, listDesignStyles } from "../core/design-style-library.js";
import { compileDesignMdFromEvidence } from "../core/design-evidence.js";
import { compileDesignMdFromHtml } from "../core/html-design-evidence.js";
import {
  compileDesignTransferPlan,
  normalizeReferenceManifest,
  searchDesignReferences,
  verifyDesignTransferInvariants
} from "../core/design-reference-library.js";

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

function readJson(req, res, handler) {
  let body = "";
  req.setEncoding("utf8");

  req.on("data", chunk => {
    body += chunk;
    if (body.length > MAX_BODY) req.destroy();
  });

  req.on("end", () => {
    try {
      handler(JSON.parse(body || "{}"));
    } catch (error) {
      send(res, 400, { error: error.message || "invalid JSON payload" });
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/health") {
    return send(res, 200, { ok: true, service: "designagent-os", version: "0.1.0" });
  }

  if (req.method === "GET" && req.url === "/api/styles") {
    return send(res, 200, { styles: listDesignStyles() });
  }

  const styleMatch = req.url?.match(/^\/api\/styles\/([a-z0-9-]+)$/);
  if (req.method === "GET" && styleMatch) {
    const style = getDesignStyle(styleMatch[1]);
    return style ? send(res, 200, style) : send(res, 404, { error: "style not found" });
  }

  const compileMatch = req.url?.match(/^\/api\/styles\/([a-z0-9-]+)\/documents$/);
  if (req.method === "POST" && compileMatch) {
    try {
      return send(res, 200, compileStyleDocuments(compileMatch[1]));
    } catch (error) {
      return send(res, 404, { error: error.message });
    }
  }

  if (req.method === "POST" && req.url === "/api/design-md/evidence") {
    return readJson(req, res, payload => send(res, 200, compileDesignMdFromEvidence(payload)));
  }

  if (req.method === "POST" && req.url === "/api/design-md/html") {
    return readJson(req, res, payload => {
      if (typeof payload.html !== "string") return send(res, 400, { error: "html must be a string" });
      return send(res, 200, compileDesignMdFromHtml(payload.html, { sourceName: payload.sourceName || "api-html" }));
    });
  }

  if (req.method === "POST" && req.url === "/api/references/search") {
    return readJson(req, res, payload => {
      const manifest = payload.manifest ?? payload.references;
      const references = normalizeReferenceManifest(manifest, payload.defaults || {});
      return send(res, 200, {
        references: searchDesignReferences(references, payload.query || "", payload.options || {})
      });
    });
  }

  if (req.method === "POST" && req.url === "/api/design-transfer/plan") {
    return readJson(req, res, payload => {
      return send(res, 200, compileDesignTransferPlan(payload.reference, payload.targetContract));
    });
  }

  if (req.method === "POST" && req.url === "/api/design-transfer/verify") {
    return readJson(req, res, payload => {
      return send(res, 200, verifyDesignTransferInvariants(payload.expectedContract, payload.actualContract));
    });
  }

  if (req.method === "POST" && req.url === "/api/analyze") {
    return readJson(req, res, payload => {
      if (typeof payload.source !== "string") {
        return send(res, 400, { error: "source must be a string" });
      }
      return send(res, 200, analyzeSource(payload.source, payload.metadata || {}));
    });
  }

  send(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(`DesignAgent OS API listening on http://localhost:${PORT}`);
});
