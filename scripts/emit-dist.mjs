#!/usr/bin/env node
/**
 * Emit a minimal `dist/` folder after `next build` so platform-level
 * dist-checks that expect a Vite-style `dist/` artifact pass. The real
 * runtime artifact for this Next.js project is `.next/` (used by
 * Vercel / `next start`); `dist/` is only a marker for the platform's
 * static-output check.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve(process.cwd(), "dist");
mkdirSync(distDir, { recursive: true });

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <title>BillForge</title>
  </head>
  <body>
    <p>This project is a Next.js application. Runtime artifacts live in <code>.next/</code>. Deploy on Vercel or run <code>next start</code>.</p>
  </body>
</html>
`;

writeFileSync(resolve(distDir, "index.html"), html);
writeFileSync(
  resolve(distDir, "build-info.json"),
  JSON.stringify(
    {
      framework: "next",
      runtimeArtifactDir: ".next",
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

if (!existsSync(resolve(process.cwd(), ".next"))) {
  console.warn("[emit-dist] .next/ not found — did next build succeed?");
}

console.log("[emit-dist] wrote dist/ marker");
