import { describe, expect, it } from "vitest";
import { calculateOpportunityScore, difficultyLabel } from "../lib/scoring";

describe("opportunity scoring", () => {
  it("rewards value and penalizes implementation difficulty", () => {
    const base = { user_value: 90, agent_usefulness: 90, business_value: 90, frequency: 80, data_availability: 90, safety: 90, agent_native_potential: 90 };
    expect(calculateOpportunityScore({ ...base, implementation_difficulty: 20 })).toBeGreaterThan(calculateOpportunityScore({ ...base, implementation_difficulty: 80 }));
  });
  it("classifies difficulty", () => { expect(difficultyLabel(20)).toBe("Easy"); expect(difficultyLabel(60)).toBe("Hard"); expect(difficultyLabel(90)).toBe("Very Hard"); });
});

