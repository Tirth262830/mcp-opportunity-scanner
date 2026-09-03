import { spawn } from "node:child_process";

const port = "4317";
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", port], { stdio: "ignore", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  let response;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { response = await fetch(`http://localhost:${port}`); if (response.ok) break; } catch {}
    await wait(500);
  }
  if (!response?.ok) throw new Error("Local app did not become ready");
  const html = await response.text();
  if (!html.includes("Turn any website")) throw new Error("Landing page did not render the scanner");
  const badUrl = await fetch(`http://localhost:${port}/api/analyze`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ websiteUrl: "http://localhost" }) });
  if (badUrl.status !== 400) throw new Error(`Expected safe URL rejection, received ${badUrl.status}`);
  console.log("E2E happy path passed: landing page rendered and API rejected a private URL.");
} finally { child.kill(); }

