import { describe, expect, it } from "vitest";
import { normalizePublicUrl } from "../lib/url";

describe("URL validation", () => {
  it("adds https to a normal domain", () => expect(normalizePublicUrl("example.com").toString()).toBe("https://example.com/"));
  it("rejects embedded credentials", () => expect(() => normalizePublicUrl("https://user:secret@example.com")).toThrow(/credentials/));
  it("rejects localhost", () => expect(() => normalizePublicUrl("http://localhost:3000")).toThrow(/private/));
  it("rejects non-http protocols", () => expect(() => normalizePublicUrl("file:///etc/passwd")).toThrow(/HTTP/));
});

