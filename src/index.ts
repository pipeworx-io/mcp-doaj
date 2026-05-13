interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * DOAJ MCP — Directory of Open Access Journals
 *
 * Curated, peer-reviewed open-access journal + article index.
 * API: https://doaj.org/api/v3/docs (we use v3)
 * Auth: none for read endpoints.
 */


const BASE = 'https://doaj.org/api/v3';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_articles',
    description:
      'Search peer-reviewed open-access articles. Supports Lucene-style field queries (title:climate, abstract:"machine learning", year:2023, author:Doe).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text or Lucene-style query' },
        page: { type: 'number', description: '1-based page (default 1)' },
        page_size: { type: 'number', description: '1-100 (default 10)' },
        sort: { type: 'string', description: 'Sort field:dir, e.g. "created_date:desc"' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_journals',
    description: 'Search open-access journals.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text or Lucene-style query' },
        page: { type: 'number', description: '1-based page' },
        page_size: { type: 'number', description: '1-100 (default 10)' },
        sort: { type: 'string', description: 'Sort field:dir' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_article',
    description: 'Fetch an article by DOAJ id.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'DOAJ article id' } },
      required: ['id'],
    },
  },
  {
    name: 'get_journal',
    description: 'Fetch a journal by DOAJ id.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'DOAJ journal id' } },
      required: ['id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_articles':
      return search('articles', args);
    case 'search_journals':
      return search('journals', args);
    case 'get_article':
      return doajGet(`/articles/${encodeURIComponent(reqStr(args, 'id', '"abc123..."'))}`);
    case 'get_journal':
      return doajGet(`/journals/${encodeURIComponent(reqStr(args, 'id', '"abc123..."'))}`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function search(kind: 'articles' | 'journals', args: Record<string, unknown>) {
  const params = new URLSearchParams({
    page: String(Math.max(1, (args.page as number) ?? 1)),
    pageSize: String(Math.min(100, Math.max(1, (args.page_size as number) ?? 10))),
  });
  if (args.sort) params.set('sort', String(args.sort));
  const q = encodeURIComponent(String(args.query));
  return doajGet(`/search/${kind}/${q}?${params}`);
}

async function doajGet(path: string) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (res.status === 404) throw new Error(`DOAJ: not found`);
  if (res.status === 429) throw new Error('DOAJ: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`DOAJ error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
