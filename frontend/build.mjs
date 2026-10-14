import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");

await build({
  entryPoints: [path.join(root, "src", "main.tsx")],
  bundle: true,
  outfile: path.join(distDir, "app.js"),
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  loader: {
    ".css": "css",
  },
  logLevel: "info",
});

const indexHtml = await readFile(path.join(root, "index.html"), "utf8");
const finalHtml = indexHtml.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  '<link rel="stylesheet" href="./app.css" />\n    <script type="module" src="./app.js"></script>',
);

await mkdir(distDir, { recursive: true });
await writeFile(path.join(distDir, "index.html"), finalHtml, "utf8");
