import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { resolve, join, extname, normalize } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "docs/screenshots/action-explorer.png");
const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".png", "image/png"],
]);

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const safePath = normalize(url.pathname).replace(/^\/+/, "");
  const file = join(root, safePath || "docs/screenshot-fixture.html");
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  res.writeHead(200, { "content-type": types.get(extname(file)) || "application/octet-stream" });
  createReadStream(file).pipe(res);
});

await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const port = server.address().port;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/docs/screenshot-fixture.html`);
  await page.waitForSelector("action-explorer-panel", { state: "attached" });
  await page.waitForTimeout(450);
  await page.screenshot({ path: output, fullPage: false });
  console.log(output);
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
