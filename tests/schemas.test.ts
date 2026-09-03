import { describe, expect, it } from "vitest";
import { AnalysisReportSchema, OpportunitySchema } from "../lib/schemas";

const opportunity = {
  id: "search", category: "Discovery", priority: "Build First", difficulty: "Easy", risk_level: "Read",
  summary: "Search public items with structured filters.", agent_need: "Agents need predictable search results.", user_benefit: "Users find relevant items with less friction.", business_benefit: "The business gets a useful agent acquisition path.", safeguards: ["Rate limits"],
  tool: { name: "search_items", description: "Search available items using structured filters.", input: [{ name: "query", type: "string", required: true, description: "Search query" }], output: [{ name: "items", type: "Item[]", required: true, description: "Matching items" }] },
  scores: { user_value: 90, agent_usefulness: 90, business_value: 85, frequency: 80, implementation_difficulty: 20, data_availability: 90, safety: 95, agent_native_potential: 92, overall: 89 },
  example_user_request: "Find an item for me.", example_agent_call: "search_items({ query: 'item' })"
};

describe("structured model output", () => {
  it("accepts a valid opportunity", () => expect(OpportunitySchema.parse(opportunity).tool.name).toBe("search_items"));
  it("rejects malformed model output", () => expect(() => OpportunitySchema.parse({ ...opportunity, tool: { ...opportunity.tool, name: "Search Items" } })).toThrow());
  it("rejects empty research-shaped reports", () => expect(() => AnalysisReportSchema.parse({ opportunities: [] })).toThrow());
});
