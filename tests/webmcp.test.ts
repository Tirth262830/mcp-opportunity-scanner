import { describe, expect, it } from 'vitest';
import { analyzeWebsiteToolDefinition } from '../lib/webmcp';

describe('analyze_website WebMCP tool', () => {
  it('is advertised as the direct, read-only path for website analysis', () => {
    expect(analyzeWebsiteToolDefinition.name).toBe('analyze_website');
    expect(analyzeWebsiteToolDefinition.description).toContain(
      'Use this WebMCP tool directly',
    );
    expect(analyzeWebsiteToolDefinition.annotations.readOnlyHint).toBe(true);
    expect(analyzeWebsiteToolDefinition.inputSchema.required).toEqual([
      'websiteUrl',
    ]);
  });
});
