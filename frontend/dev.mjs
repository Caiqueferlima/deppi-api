import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const port = Number(process.env.PORT ?? 4173);
const apiTarget = process.env.API_TARGET ?? "http://localhost:3000";

function contentType(filePath) {
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  return "application/octet-stream";
}

async function serveFile(res, filePath) {
  const data = await readFile(filePath);
  res.writeHead(200, { "Content-Type": contentType(filePath) });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (url.pathname.startsWith("/api/")) {
      const upstream = await fetch(`${apiTarget}${url.pathname.slice(4)}${url.search}`, {
        method: req.method,
        headers: {
          "Content-Type": req.headers["content-type"] ?? "",
          Authorization: req.headers.authorization ?? "",
        },
        body: ["GET", "HEAD"].includes(req.method ?? "GET") ? undefined : req,
        duplex: "half",
      });

      res.writeHead(upstream.status, Object.fromEntries(upstream.headers.entries()));
      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.end(buffer);
      return;
    }

    const relative = url.pathname === "/" ? "/index.html" : url.pathname;
    let filePath = path.join(distDir, relative);
    try {
      const fileStat = await stat(filePath);
      if (fileStat.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      await serveFile(res, filePath);
      return;
    } catch {
      await serveFile(res, path.join(distDir, "index.html"));
    }
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(error instanceof Error ? error.message : "Erro inesperado");
  }
});

server.listen(port, () => {
  console.log(`Frontend disponível em http://localhost:${port}`);
  console.log(`Proxy de API apontando para ${apiTarget}`);
});
