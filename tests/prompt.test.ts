import { describe, expect, it } from "vitest";
import { buildImplementationPrompt } from "../lib/prompt";
import type { Opportunity } from "../lib/schemas";

describe("implementation prompt", () => {
  it("includes security and acceptance criteria", () => {
    const report = { website: { url: "https://example.com", title: "Example", business_type: "SaaS", primary_purpose: "Serve users", target_audience: "Teams" }, summary: { description: "Example", key_workflows: ["Search"], limitations: [] } };
    const tool: Opportunity = { id: "search", category: "Discovery", priority: "Build First", difficulty: "Easy", risk_level: "Read", summary: "Search items in the public index.", agent_need: "Agents need structured results.", user_benefit: "Users save time finding items.", business_benefit: "Improves qualified discovery.", safeguards: ["Rate limiting"], tool: { name: "search_items", description: "Search public items with structured filters.", input: [{ name: "query", type: "string", required: true, description: "Search query" }], output: [{ name: "items", type: "Item[]", required: true, description: "Matching items" }] }, scores: { user_value: 90, agent_usefulness: 90, business_value: 80, frequency: 80, implementation_difficulty: 20, data_availability: 90, safety: 95, agent_native_potential: 90, overall: 88 }, example_user_request: "Find items", example_agent_call: "search_items({ query: 'x' })" };
    const prompt = buildImplementationPrompt(report, [tool]);
    expect(prompt).toContain("document.modelContext.registerTool"); expect(prompt).toContain("Never leak credentials"); expect(prompt).toContain("Acceptance criteria");
  });
});
