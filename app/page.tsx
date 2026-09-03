'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleAlert,
  Clipboard,
  Code2,
  Download,
  ExternalLink,
  Flame,
  Globe2,
  Moon,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  TerminalSquare,
  Zap,
} from 'lucide-react';
import type { AnalysisReport, Opportunity } from '@/lib/schemas';
import { buildImplementationPrompt } from '@/lib/prompt';

const steps = [
  'Fetching public pages',
  'Understanding the business',
  'Mapping user workflows',
  'Researching MCP opportunities',
  'Analyzing agent use cases',
  'Ranking recommendations',
  'Generating implementation plan',
];
const categoryColors: Record<string, string> = {
  Discovery: 'cyan',
  Retrieval: 'blue',
  Actions: 'violet',
  Personalization: 'amber',
  Automation: 'green',
};

const demo: AnalysisReport = {
  website: {
    url: 'https://northstar-outfitters.example',
    title: 'Northstar Outfitters',
    business_type: 'Outdoor ecommerce',
    primary_purpose: 'Help customers discover and buy outdoor equipment',
    target_audience: 'Hikers, campers, and outdoor travelers',
  },
  summary: {
    description:
      'A fictional outdoor retailer with a browsable product catalog, buying guides, inventory, and order support.',
    key_workflows: [
      'Search the catalog',
      'Compare equipment',
      'Check stock',
      'Track an order',
    ],
    limitations: ['Demo data only — no web research was performed.'],
  },
  agent_readiness: {
    overall: 68,
    explanation:
      'The catalog is discoverable, but the most useful product and inventory workflows are still UI-bound.',
    discoverability: 81,
    agent_actions: 46,
    structured_data: 74,
    workflow_automation: 51,
    mcp_potential: 93,
  },
  opportunities: [
    {
      id: 'demo-search',
      category: 'Discovery',
      priority: 'Build First',
      difficulty: 'Easy',
      risk_level: 'Read',
      summary: 'Search the product catalog with structured filters.',
      agent_need:
        'Agents need a reliable alternative to interpreting search pages and filter controls.',
      user_benefit:
        'Shoppers can describe the product they need in their own words.',
      business_benefit:
        'Improves product discovery and creates an agent-driven acquisition path.',
      safeguards: ['Validate filters', 'Rate limit anonymous use'],
      tool: {
        name: 'search_products',
        description:
          'Search the catalog using product criteria and structured filters.',
        input: [
          { name: 'query', type: 'string', required: true, description: 'Natural-language product query' },
          { name: 'max_price', type: 'number', required: false, description: 'Maximum price' },
          { name: 'category', type: 'string', required: false, description: 'Catalog category' },
        ],
        output: [
          { name: 'products', type: 'ProductSummary[]', required: true, description: 'Matching products' },
          { name: 'total', type: 'number', required: true, description: 'Total match count' },
        ],
      },
      scores: {
        user_value: 94,
        agent_usefulness: 96,
        business_value: 91,
        frequency: 92,
        implementation_difficulty: 22,
        data_availability: 94,
        safety: 96,
        agent_native_potential: 97,
        overall: 93,
      },
      example_user_request: 'Find a waterproof two-person tent under $300.',
      example_agent_call:
        "search_products({ query: 'waterproof two-person tent', max_price: 300 })",
    },
    {
      id: 'demo-product',
      category: 'Retrieval',
      priority: 'Build First',
      difficulty: 'Easy',
      risk_level: 'Read',
      summary:
        'Return canonical product facts, variants, price, and availability.',
      agent_need:
        'Agents require a compact source of truth before comparing or recommending products.',
      user_benefit:
        'Customers receive accurate specifications without opening several tabs.',
      business_benefit:
        'Makes product data easier for qualified agent referrals to use.',
      safeguards: ['Return current prices', 'Mark external content untrusted'],
      tool: {
        name: 'get_product',
        description:
          'Get current product details by stable product identifier.',
        input: [{ name: 'product_id', type: 'string', required: true, description: 'Stable product identifier' }],
        output: [{ name: 'product', type: 'ProductDetail', required: true, description: 'Current product details' }],
      },
      scores: {
        user_value: 90,
        agent_usefulness: 94,
        business_value: 84,
        frequency: 89,
        implementation_difficulty: 18,
        data_availability: 97,
        safety: 98,
        agent_native_potential: 93,
        overall: 91,
      },
      example_user_request: 'Does the Alpine 2 tent include a footprint?',
      example_agent_call: "get_product({ product_id: 'alpine-2' })",
    },
    {
      id: 'demo-compare',
      category: 'Automation',
      priority: 'High Priority',
      difficulty: 'Moderate',
      risk_level: 'Read',
      summary: 'Compare selected products across normalized decision criteria.',
      agent_need:
        'Agents can avoid scraping inconsistent specification tables.',
      user_benefit:
        'Shoppers get a concise comparison based on what matters to them.',
      business_benefit:
        'Reduces decision friction on high-consideration purchases.',
      safeguards: ['Limit batch size', 'Explain missing attributes'],
      tool: {
        name: 'compare_products',
        description:
          'Compare two to five products using normalized catalog attributes.',
        input: [
          { name: 'product_ids', type: 'string[]', required: true, description: 'Products to compare' },
          { name: 'criteria', type: 'string[]', required: false, description: 'Optional decision criteria' },
        ],
        output: [
          { name: 'comparison', type: 'ComparisonMatrix', required: true, description: 'Normalized comparison' },
          { name: 'caveats', type: 'string[]', required: true, description: 'Missing or incomparable attributes' },
        ],
      },
      scores: {
        user_value: 91,
        agent_usefulness: 92,
        business_value: 83,
        frequency: 71,
        implementation_difficulty: 43,
        data_availability: 82,
        safety: 97,
        agent_native_potential: 95,
        overall: 86,
      },
      example_user_request: 'Compare your three lightest two-person tents.',
      example_agent_call:
        "compare_products({ product_ids: ['alpine-2', 'trail-2', 'cloud-2'] })",
    },
  ],
  top_recommendations: ['search_products', 'get_product', 'compare_products'],
  impact: [
    'Agents can discover products directly',
    'Customers can complete research conversationally',
    'Structured results reduce interpretation errors',
    'New agent-driven entry points become possible',
  ],
  sources: [],
  implementation_prompt:
    'Demo prompt. Run a real analysis to generate a source-grounded, production-ready implementation prompt.',
};

function priorityIcon(priority: Opportunity['priority']) {
  return priority === 'Build First'
    ? '🔥'
    : priority === 'High Priority'
      ? '⭐'
      : priority === 'Good Opportunity'
        ? '💡'
        : '🧪';
}
function scoreClass(score: number) {
  return score >= 85 ? 'score-high' : score >= 70 ? 'score-mid' : 'score-low';
}
function downloadFile(name: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  a.click();
  URL.revokeObjectURL(href);
}
function reportMarkdown(report: AnalysisReport) {
  return `# MCP Opportunity Report: ${report.website.title}\n\n${report.summary.description}\n\n## Agent readiness: ${report.agent_readiness.overall}/100\n\n${report.agent_readiness.explanation}\n\n## Opportunities\n\n${report.opportunities.map((o) => `### ${o.tool.name} — ${o.scores.overall}/100\n${o.summary}\n\n- Category: ${o.category}\n- Priority: ${o.priority}\n- Difficulty: ${o.difficulty}\n- User benefit: ${o.user_benefit}\n- Business benefit: ${o.business_benefit}`).join('\n\n')}\n\n## Implementation prompt\n\n${report.implementation_prompt}`;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Opportunity score');
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dark, setDark] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(
      () => setProgress((value) => Math.min(value + 1, steps.length - 1)),
      2200,
    );
    return () => clearInterval(timer);
  }, [loading]);

  const analyze = useCallback(
    async (candidate = url) => {
      setError('');
      setLoading(true);
      setProgress(0);
      setReport(null);
      setIsDemo(false);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ websiteUrl: candidate }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Analysis failed.');
        setProgress(steps.length);
        setReport(data);
        setSelected(data.top_recommendations);
        setTimeout(
          () =>
            document
              .getElementById('report')
              ?.scrollIntoView({ behavior: 'smooth' }),
          100,
        );
        return data as AnalysisReport;
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : 'Analysis failed.';
        setError(message);
        throw caught;
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools = [
      {
        name: 'analyze_website',
        title: 'Analyze website',
        description:
          'Research a public website and generate its MCP opportunity report.',
        inputSchema: {
          type: 'object',
          properties: {
            websiteUrl: {
              type: 'string',
              description: 'Public HTTP or HTTPS website URL',
            },
          },
          required: ['websiteUrl'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        execute: async (input: unknown) => {
          const value = input as { websiteUrl?: string };
          if (!value.websiteUrl) throw new Error('websiteUrl is required');
          setUrl(value.websiteUrl);
          const result = await analyze(value.websiteUrl);
          return {
            website: result.website,
            agent_readiness: result.agent_readiness,
            top_recommendations: result.top_recommendations,
          };
        },
      },
      {
        name: 'get_opportunity_report',
        title: 'Get current report',
        description:
          'Return the current MCP opportunity report shown in the interface.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: () => {
          if (!report)
            throw new Error(
              'No report is available. Run analyze_website first.',
            );
          return report;
        },
      },
      {
        name: 'select_tools_for_plan',
        title: 'Select tools for implementation',
        description:
          'Select recommended tools and return a tailored implementation prompt.',
        inputSchema: {
          type: 'object',
          properties: {
            toolNames: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
            },
          },
          required: ['toolNames'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: (input: unknown) => {
          if (!report) throw new Error('No report is available.');
          const names = (input as { toolNames?: string[] }).toolNames ?? [];
          const chosen = report.opportunities.filter((o) =>
            names.includes(o.tool.name),
          );
          if (!chosen.length)
            throw new Error('Choose at least one recommended tool name.');
          setSelected(chosen.map((o) => o.tool.name));
          return {
            selected: chosen.map((o) => o.tool.name),
            implementation_prompt: buildImplementationPrompt(report, chosen),
          };
        },
      },
    ];
    tools.forEach((tool) => {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => undefined);
      } catch {}
    });
    return () => lifecycle.abort();
  }, [analyze, report]);

  const filtered = useMemo(() => {
    if (!report) return [];
    const result = report.opportunities.filter(
      (item) => category === 'All' || item.category === category,
    );
    return [...result].sort((a, b) =>
      sort === 'Business value'
        ? b.scores.business_value - a.scores.business_value
        : sort === 'User value'
          ? b.scores.user_value - a.scores.user_value
          : sort === 'Difficulty'
            ? a.scores.implementation_difficulty -
              b.scores.implementation_difficulty
            : b.scores.overall - a.scores.overall,
    );
  }, [report, category, sort]);
  const selectedTools =
    report?.opportunities.filter((item) => selected.includes(item.tool.name)) ??
    [];
  const prompt =
    report && selectedTools.length
      ? buildImplementationPrompt(report, selectedTools)
      : (report?.implementation_prompt ?? '');
  function showDemo() {
    setReport(demo);
    setIsDemo(true);
    setSelected(demo.top_recommendations);
    setError('');
    setTimeout(
      () =>
        document
          .getElementById('report')
          ?.scrollIntoView({ behavior: 'smooth' }),
      80,
    );
  }

  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="WebMcp.AI home">
          <Image
            className="brand-logo"
            src="/webmcp-ai-mark.png"
            alt=""
            width="44"
            height="43"
          />
          <span className="brand-name">
            WebMcp<span>.AI</span>
          </span>
        </a>
        <div className="nav-actions">
          <a href="#how">How it works</a>
          <a href="#report">Report</a>
          <button
            className="icon-button"
            onClick={() => setDark(!dark)}
            aria-label="Toggle color theme"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </nav>
      <section id="top" className="hero shell">
        <div className="eyebrow">
          <span className="pulse" /> Agent opportunity intelligence
        </div>
        <h1>
          Turn any website into an
          <br />
          <span>agent opportunity map.</span>
        </h1>
        <p>
          Paste a URL. Discover what AI agents could do with your website—and
          get the implementation prompt to make it happen.
        </p>
        <form
          className="scanner"
          onSubmit={(event) => {
            event.preventDefault();
            void analyze().catch(() => undefined);
          }}
        >
          <div className="scanner-input">
            <Globe2 size={20} />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              aria-label="Website URL"
              required
            />
          </div>
          <button disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze my website'}
            <ArrowRight size={17} />
          </button>
        </form>
        <div className="hero-links">
          <span>
            <ShieldCheck size={15} /> Public pages only. Your key stays
            server-side.
          </span>
          <button onClick={showDemo}>
            See example report <ArrowRight size={14} />
          </button>
        </div>
        {error && (
          <div className="error" role="alert">
            <CircleAlert size={18} />
            <div>
              <strong>We couldn’t complete the scan.</strong>
              <span>{error}</span>
            </div>
          </div>
        )}
        {loading && (
          <div className="pipeline" aria-live="polite">
            <div className="pipeline-head">
              <div>
                <span className="live-dot" /> Analysis in progress
              </div>
              <span>{Math.min(94, 12 + progress * 14)}%</span>
            </div>
            <div className="pipeline-bar">
              <i style={{ width: `${Math.min(94, 12 + progress * 14)}%` }} />
            </div>
            <div className="steps">
              {steps.map((step, index) => (
                <div
                  className={
                    index < progress
                      ? 'done'
                      : index === progress
                        ? 'active'
                        : 'pending'
                  }
                  key={step}
                >
                  {index < progress ? (
                    <Check size={15} />
                  ) : index === progress ? (
                    <span className="spinner" />
                  ) : (
                    <span className="step-dot" />
                  )}
                  <span>{step}</span>
                  {index === progress && <em>working</em>}
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && !report && (
          <div className="signal-strip" id="how">
            <div>
              <Search />
              <strong>Research</strong>
              <span>Pages, competitors, APIs</span>
            </div>
            <ArrowRight />
            <div>
              <Network />
              <strong>Map</strong>
              <span>Workflows into tools</span>
            </div>
            <ArrowRight />
            <div>
              <Zap />
              <strong>Rank</strong>
              <span>Value, effort, safety</span>
            </div>
            <ArrowRight />
            <div>
              <TerminalSquare />
              <strong>Ship</strong>
              <span>Copy the build prompt</span>
            </div>
          </div>
        )}
      </section>

      {report && (
        <section id="report" className="report shell">
          {isDemo && (
            <div className="demo-banner">
              <Sparkles size={16} />
              <span>
                Example report using fictional data. Run a scan for real
                research and recommendations.
              </span>
            </div>
          )}
          <div className="report-heading">
            <div>
              <div className="eyebrow">MCP opportunity report</div>
              <h2>{report.website.title}</h2>
              <a href={report.website.url} target="_blank" rel="noreferrer">
                {report.website.url}
                <ExternalLink size={13} />
              </a>
            </div>
            <div className="export-menu">
              <button
                onClick={() =>
                  downloadFile('mcp-report.md', reportMarkdown(report))
                }
              >
                <Download size={15} /> Markdown
              </button>
              <button
                onClick={() =>
                  downloadFile(
                    'mcp-report.json',
                    JSON.stringify(report, null, 2),
                    'application/json',
                  )
                }
              >
                <Download size={15} /> JSON
              </button>
            </div>
          </div>
          <div className="overview-grid">
            <article className="panel overview">
              <div className="panel-kicker">Website overview</div>
              <p>{report.summary.description}</p>
              <dl>
                <div>
                  <dt>Business</dt>
                  <dd>{report.website.business_type}</dd>
                </div>
                <div>
                  <dt>Audience</dt>
                  <dd>{report.website.target_audience}</dd>
                </div>
                <div>
                  <dt>Purpose</dt>
                  <dd>{report.website.primary_purpose}</dd>
                </div>
              </dl>
              <div className="workflow-tags">
                {report.summary.key_workflows.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
            <article className="panel readiness">
              <div className="readiness-top">
                <div>
                  <div className="panel-kicker">Agent readiness</div>
                  <p>{report.agent_readiness.explanation}</p>
                </div>
                <div
                  className={`score-ring ${scoreClass(report.agent_readiness.overall)}`}
                >
                  <strong>{report.agent_readiness.overall}</strong>
                  <span>/100</span>
                </div>
              </div>
              {(
                [
                  ['Discoverability', 'discoverability'],
                  ['Agent actions', 'agent_actions'],
                  ['Structured data', 'structured_data'],
                  ['Automation', 'workflow_automation'],
                  ['MCP potential', 'mcp_potential'],
                ] as const
              ).map(([label, key]) => (
                <div className="metric" key={key}>
                  <span>{label}</span>
                  <div>
                    <i style={{ width: `${report.agent_readiness[key]}%` }} />
                  </div>
                  <b>{report.agent_readiness[key]}</b>
                </div>
              ))}
            </article>
          </div>
          <div className="section-heading">
            <div>
              <span className="section-index">01</span>
              <div>
                <h3>MCP opportunities</h3>
                <p>
                  {report.opportunities.length} grounded ways to make this
                  website useful to agents.
                </p>
              </div>
            </div>
            <div className="controls">
              <label>
                <span>Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>All</option>
                  {Object.keys(categoryColors).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown size={14} />
              </label>
              <label>
                <span>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option>Opportunity score</option>
                  <option>Business value</option>
                  <option>User value</option>
                  <option>Difficulty</option>
                </select>
                <ChevronDown size={14} />
              </label>
            </div>
          </div>
          <div className="opportunity-list">
            {filtered.map((item, index) => (
              <article className="opportunity" key={item.id}>
                <div className="opportunity-main">
                <label className="tool-check" aria-label={`Select ${item.tool.name}`}>
                    <input
                      type="checkbox"
                      checked={selected.includes(item.tool.name)}
                      onChange={() =>
                        setSelected((current) =>
                          current.includes(item.tool.name)
                            ? current.filter((name) => name !== item.tool.name)
                            : [...current, item.tool.name],
                        )
                      }
                    />
                    <span />
                  </label>
                  <div className="tool-info">
                    <div className="tool-line">
                      <code>{item.tool.name}</code>
                      <span
                        className={`category ${categoryColors[item.category]}`}
                      >
                        {item.category}
                      </span>
                      <span className={`risk ${item.risk_level.toLowerCase()}`}>
                        {item.risk_level}
                      </span>
                    </div>
                    <p>{item.summary}</p>
                    <div className="tool-meta">
                      <span>
                        {priorityIcon(item.priority)} {item.priority}
                      </span>
                      <span>{item.difficulty} build</span>
                      <span>#{String(index + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div
                    className={`opportunity-score ${scoreClass(item.scores.overall)}`}
                  >
                    <strong>{item.scores.overall}</strong>
                    <span>opportunity</span>
                  </div>
                  <button
                    className="expand"
                    aria-label={`Expand ${item.tool.name}`}
                    onClick={() =>
                      setExpanded(expanded === item.id ? null : item.id)
                    }
                  >
                    <ChevronDown
                      className={expanded === item.id ? 'rotate' : ''}
                    />
                  </button>
                </div>
                {expanded === item.id && (
                  <div className="opportunity-detail">
                    <div className="benefit-grid">
                      <div>
                        <span>Why an agent needs it</span>
                        <p>{item.agent_need}</p>
                      </div>
                      <div>
                        <span>User benefit</span>
                        <p>{item.user_benefit}</p>
                      </div>
                      <div>
                        <span>Business benefit</span>
                        <p>{item.business_benefit}</p>
                      </div>
                    </div>
                    <div className="schema-row">
                      <div>
                        <span>Suggested shape</span>
                        <pre>{JSON.stringify(item.tool, null, 2)}</pre>
                      </div>
                      <div>
                        <span>Agent experience</span>
                        <blockquote>“{item.example_user_request}”</blockquote>
                        <pre>{item.example_agent_call}</pre>
                        {item.safeguards.length > 0 && (
                          <div className="safeguards">
                            <ShieldCheck size={16} />
                            <span>{item.safeguards.join(' · ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
          <section className="top-three">
            <div>
              <span className="section-index">02</span>
              <div>
                <h3>If you only build three…</h3>
                <p>
                  Start with the best balance of agent value, business leverage,
                  and implementation effort.
                </p>
              </div>
            </div>
            <ol>
              {report.top_recommendations.map((name, index) => {
                const item = report.opportunities.find(
                  (o) => o.tool.name === name,
                );
                return (
                  <li key={name}>
                    <span>0{index + 1}</span>
                    <code>{name}</code>
                    <i />
                    <b>{item?.scores.overall}/100</b>
                  </li>
                );
              })}
            </ol>
          </section>
          <section className="before-after">
            <div className="section-heading">
              <div>
                <span className="section-index">03</span>
                <div>
                  <h3>From interface guessing to direct action</h3>
                  <p>
                    WebMCP turns a fragile browsing sequence into a structured
                    tool call.
                  </p>
                </div>
              </div>
            </div>
            <div className="flow-grid">
              <div className="flow-card without">
                <span>Without WebMCP</span>
                {[
                  'Open website',
                  'Understand UI',
                  'Find the right control',
                  'Read & interpret results',
                ].map((item, i) => (
                  <div key={item}>
                    <em>{i + 1}</em>
                    {item}
                  </div>
                ))}
              </div>
              <div className="flow-center">
                <Bot />
                <ArrowRight />
              </div>
              <div className="flow-card with">
                <span>With WebMCP</span>
                <div className="call">
                  <Code2 />
                  <code>{report.top_recommendations[0]}()</code>
                </div>
                <div className="structured">
                  <Check /> Structured, typed result
                </div>
                <div className="structured">
                  <Check /> Continue the user’s task
                </div>
              </div>
            </div>
          </section>
          <section className="agent-demo">
            <div className="demo-head">
              <div>
                <span className="section-index">04</span>
                <div>
                  <h3>Agent experience</h3>
                  <p>How the website and an agent collaborate after WebMCP.</p>
                </div>
              </div>
              <span className="sim-pill">
                <span /> simulated
              </span>
            </div>
            <div className="terminal">
              <div className="terminal-bar">
                <span />
                <span />
                <span />
                <em>agent-session.trace</em>
              </div>
              <div className="turn user-turn">
                <span>USER</span>
                <p>{report.opportunities[0]?.example_user_request}</p>
              </div>
              <div className="turn agent-turn">
                <span>AGENT</span>
                <div className="trace">
                  {report.top_recommendations.map((name, i) => (
                    <div key={name}>
                      <em>0{i + 1}</em>
                      <ArrowRight size={14} />
                      <code>{name}()</code>
                      {i === 0 && <b>8 results</b>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="turn site-turn">
                <span>WEBSITE</span>
                <p>
                  Returned structured, source-of-truth data. The agent can now
                  continue without interpreting the interface.
                </p>
              </div>
            </div>
          </section>
          <section className="impact">
            <div>
              <span className="section-index">05</span>
              <div>
                <h3>What changes when you add these?</h3>
                <p>Potential improvements—not guaranteed ROI.</p>
              </div>
            </div>
            <div className="impact-grid">
              {report.impact.map((item) => (
                <div key={item}>
                  <Check size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="prompt-builder">
            <div className="prompt-copy">
              <span className="section-index">06</span>
              <h3>Turn the report into code.</h3>
              <p>
                Select opportunities above, then copy a production-ready brief
                for Codex, Claude Code, Cursor, or another coding agent.
              </p>
              <div className="selected-count">
                <Flame size={16} />
                <strong>{selectedTools.length}</strong> tools selected
              </div>
              <div className="prompt-actions">
                <button
                  disabled={!prompt}
                  onClick={async () => {
                    await navigator.clipboard.writeText(prompt);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check size={16} /> : <Clipboard size={16} />}{' '}
                  {copied ? 'Copied' : 'Copy prompt'}
                </button>
                <button
                  disabled={!prompt}
                  onClick={() =>
                    downloadFile('webmcp-implementation-prompt.md', prompt)
                  }
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
            <div className="prompt-window">
              <div>
                <span />
                <span />
                <span />
                <em>implementation-prompt.md</em>
              </div>
              <pre>{prompt}</pre>
            </div>
          </section>
          {report.sources.length > 0 && (
            <section className="sources">
              <div className="section-heading">
                <div>
                  <span className="section-index">07</span>
                  <div>
                    <h3>Research sources</h3>
                    <p>Evidence used to ground this opportunity map.</p>
                  </div>
                </div>
              </div>
              <div>
                {report.sources.map((source) => (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    key={source.url}
                  >
                    <Globe2 size={16} />
                    <span>
                      <strong>{source.title}</strong>
                      <em>{source.evidence}</em>
                    </span>
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            </section>
          )}
        </section>
      )}
      <footer className="shell">
        <div className="brand">
          <Image
            className="brand-logo"
            src="/webmcp-ai-mark.png"
            alt=""
            width="44"
            height="43"
          />
          <span className="brand-name">
            WebMcp<span>.AI</span>
          </span>
        </div>
        <p>
          Built for the OpenAI WebMCP Challenge · Humans click. Agents call
          tools.
        </p>
      </footer>
    </main>
  );
}
