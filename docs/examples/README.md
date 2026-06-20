# AI Agent Research Examples

This directory contains data-only example prompts and workflows for `korea-market-data-mcp` users. The MCP is a read-only Korean market data supply engine; Claude/GPT/Codex and other AI clients interpret the returned payloads.

## Example Index

- [`quant-research-prompt-pack.md`](quant-research-prompt-pack.md): General prompt pack for Claude, Codex, ChatGPT, Cursor, and other AI agents that need data summaries, comparison tables, metrics explanations, and research note drafts.
- [`claude-desktop-quant-research-examples.md`](claude-desktop-quant-research-examples.md): Local stdio examples for Claude Desktop, the current primary local verification path.
- [`codex-cursor-research-workflows.md`](codex-cursor-research-workflows.md): Repository and IDE workflows for Codex and Cursor, including Markdown notes and CSV-like tables.
- [`data-only-analysis-boundaries.md`](data-only-analysis-boundaries.md): Shared safety boundary for every client and integration target.

## Future: ChatGPT and remote MCP integration

ChatGPT integration may require a remote MCP transport or custom app wrapper. Local stdio setup and remote setup are different. The current project remains local-first and read-only, and future releases will document remote MCP transport readiness.

Provider capability is unchanged. No account access. No orders. No balance lookup. No holdings lookup. No trading. No auto-trading. No investment recommendations. No user-facing mock market data fallback.
