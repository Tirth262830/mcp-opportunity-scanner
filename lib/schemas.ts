import { z } from "zod";

export const ResearchSourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  evidence: z.string().min(1),
});

export const ToolFieldSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9_]*$/),
  type: z.string().min(1),
  required: z.boolean(),
  description: z.string().min(1),
});

export const ToolShapeSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9_]*$/),
  description: z.string().min(10),
  input: z.array(ToolFieldSchema).max(15),
  output: z.array(ToolFieldSchema).min(1).max(15),
});

export const ScoresSchema = z.object({
  user_value: z.number().min(0).max(100),
  agent_usefulness: z.number().min(0).max(100),
  business_value: z.number().min(0).max(100),
  frequency: z.number().min(0).max(100),
  implementation_difficulty: z.number().min(0).max(100),
  data_availability: z.number().min(0).max(100),
  safety: z.number().min(0).max(100),
  agent_native_potential: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
});

export const OpportunitySchema = z.object({
  id: z.string().min(1),
  category: z.enum(["Discovery", "Retrieval", "Actions", "Personalization", "Automation"]),
  priority: z.enum(["Build First", "High Priority", "Good Opportunity", "Experimental"]),
  difficulty: z.enum(["Easy", "Moderate", "Hard", "Very Hard"]),
  risk_level: z.enum(["Read", "Write", "Destructive"]),
  summary: z.string().min(10),
  agent_need: z.string().min(10),
  user_benefit: z.string().min(10),
  business_benefit: z.string().min(10),
  safeguards: z.array(z.string()).max(8),
  tool: ToolShapeSchema,
  scores: ScoresSchema,
  example_user_request: z.string().min(5),
  example_agent_call: z.string().min(5),
});

export const AnalysisReportSchema = z.object({
  website: z.object({
    url: z.string().min(1),
    title: z.string(),
    business_type: z.string(),
    primary_purpose: z.string(),
    target_audience: z.string(),
  }),
  summary: z.object({
    description: z.string(),
    key_workflows: z.array(z.string()).min(1).max(10),
    limitations: z.array(z.string()).max(8),
  }),
  agent_readiness: z.object({
    overall: z.number().min(0).max(100),
    explanation: z.string(),
    discoverability: z.number().min(0).max(100),
    agent_actions: z.number().min(0).max(100),
    structured_data: z.number().min(0).max(100),
    workflow_automation: z.number().min(0).max(100),
    mcp_potential: z.number().min(0).max(100),
  }),
  opportunities: z.array(OpportunitySchema).min(3).max(12),
  top_recommendations: z.array(z.string()).min(3).max(3),
  impact: z.array(z.string()).min(3).max(8),
  sources: z.array(ResearchSourceSchema).max(15),
  implementation_prompt: z.string().min(100),
});

export const AnalyzeRequestSchema = z.object({
  websiteUrl: z.string().trim().min(1),
});

export type AnalysisReport = z.infer<typeof AnalysisReportSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
