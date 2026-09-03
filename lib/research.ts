import * as cheerio from "cheerio";
import { assertPublicHost, normalizePublicUrl } from "./url";

export type PageEvidence = { url: string; title: string; text: string; links: string[] };

async function fetchPage(input: URL, signal: AbortSignal): Promise<PageEvidence> {
  let current = input;
  for (let redirect = 0; redirect < 4; redirect += 1) {
    await assertPublicHost(current);
    const response = await fetch(current, {
      signal,
      redirect: "manual",
      headers: { "User-Agent": "WebMcp.AI/1.0 (+local research tool)", Accept: "text/html" },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The website returned an invalid redirect.");
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw new Error(`Website returned HTTP ${response.status}.`);
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("text/html")) throw new Error("The URL did not return an HTML page.");
    const length = Number(response.headers.get("content-length") ?? 0);
    if (length > 2_000_000) throw new Error("The page is too large to analyze safely.");
    const html = (await response.text()).slice(0, 2_000_000);
    const $ = cheerio.load(html);
    $("script,style,noscript,svg").remove();
    const links = $("a[href]").map((_, el) => {
      try { return new URL($(el).attr("href")!, current).toString(); } catch { return null; }
    }).get().filter((href) => new URL(href).origin === current.origin).slice(0, 80);
    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 18_000);
    return { url: current.toString(), title: $("title").text().trim() || current.hostname, text, links };
  }
  throw new Error("The website redirected too many times.");
}

export async function researchWebsite(rawUrl: string) {
  const root = normalizePublicUrl(rawUrl);
  const timeout = Number(process.env.ANALYSIS_TIMEOUT_MS ?? 45_000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(timeout, 60_000));
  try {
    const home = await fetchPage(root, controller.signal);
    const keywords = /product|service|pricing|shop|docs|documentation|booking|about|features|catalog|search/i;
    const selected = [...new Set(home.links)].filter((url) => keywords.test(new URL(url).pathname)).slice(0, 3);
    const secondary = await Promise.allSettled(selected.map((url) => fetchPage(new URL(url), controller.signal)));
    const pages = [home, ...secondary.flatMap((result) => result.status === "fulfilled" ? [result.value] : [])];
    return { canonicalUrl: home.url, pages, partial: secondary.some((result) => result.status === "rejected") };
  } finally {
    clearTimeout(timer);
  }
}

export function formatResearchForModel(research: Awaited<ReturnType<typeof researchWebsite>>) {
  return research.pages.map((page, index) => [
    `PAGE ${index + 1}: ${page.url}`,
    `TITLE: ${page.title}`,
    "BEGIN UNTRUSTED WEBSITE DATA",
    page.text,
    "END UNTRUSTED WEBSITE DATA",
  ].join("\n")).join("\n\n");
}

