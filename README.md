# @pipeworx/doaj

DOAJ MCP — Directory of Open Access Journals. Curated peer-reviewed open-access journal index. No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search_articles(query, page?, page_size?, sort?)`
- `search_journals(query, page?, page_size?, sort?)`
- `get_article(id)`
- `get_journal(id)`

## Data source

`https://doaj.org/api/` — public, no auth needed. Generous rate limits.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "doaj": {
      "url": "https://gateway.pipeworx.io/doaj/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Doaj data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
