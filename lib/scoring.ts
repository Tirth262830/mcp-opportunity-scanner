import type { z } from "zod";
import type { ScoresSchema } from "./schemas";

type Scores = z.infer<typeof ScoresSchema>;

export function calculateOpportunityScore(scores: Omit<Scores, "overall">) {
  const positive =
    scores.user_value * 0.2 +
    scores.agent_usefulness * 0.2 +
    scores.business_value * 0.15 +
    scores.frequency * 0.1 +
    scores.data_availability * 0.1 +
    scores.safety * 0.08 +
    scores.agent_native_potential * 0.17;
  const difficultyPenalty = scores.implementation_difficulty * 0.12;
  return Math.max(0, Math.min(100, Math.round(positive - difficultyPenalty)));
}

export function difficultyLabel(score: number) {
  if (score <= 25) return "Easy" as const;
  if (score <= 50) return "Moderate" as const;
  if (score <= 75) return "Hard" as const;
  return "Very Hard" as const;
}

