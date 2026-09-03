export const analyzeWebsiteToolDefinition = {
  name: 'analyze_website',
  title: 'Analyze a public website with WebMCP',
  description:
    'Use this WebMCP tool directly whenever the user asks to analyze a website. It runs the analysis and updates the report in the page; do not type the URL into the form or click the Analyze button.',
  inputSchema: {
    type: 'object',
    properties: {
      websiteUrl: {
        type: 'string',
        description: 'Public HTTP or HTTPS website URL to analyze',
      },
    },
    required: ['websiteUrl'],
    additionalProperties: false,
  },
  // The tool only reads public pages and updates this tab's UI. It does not
  // mutate the analyzed website or any other external resource.
  annotations: { readOnlyHint: true, untrustedContentHint: true },
} as const;
