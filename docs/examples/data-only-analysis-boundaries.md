# Data-Only Analysis Boundaries

`korea-market-data-mcp` is a data supply engine. It is not an answer engine, brokerage client, portfolio manager, or investment recommendation system.

The MCP supplies structured Korean market data payloads. Claude/GPT/Codex interprets that payload for the user.

## MCP Responsibilities

Allowed:

- Resolve Korean market queries to stocks, ETFs, or indices.
- Return read-only quote data.
- Return read-only daily chart candles.
- Return read-only related index context.
- Return data-based `research_metrics`.
- Explain unavailable/null data states through structured fields.

## AI Client Responsibilities

Allowed for Claude/GPT/Codex:

- Data summary.
- Observation.
- Comparison table.
- Metric explanation.
- Unavailable reason explanation.
- Research note draft.

## Explicitly Out Of Scope

The MCP does not generate or provide:

- Buy/sell judgment.
- Recommendation.
- Target price.
- Return forecast.
- Portfolio recommendation.
- Rebalancing conclusion.
- Account access.
- Orders.
- Balance lookup.
- Holdings lookup.
- Trading.
- Auto-trading.
- User-facing mock market data fallback.

## Phrases To Avoid

Avoid prompts or product text that asks for:

- "buy candidate"
- "strong buy"
- "sell signal"
- "target price"
- "expected return"
- "portfolio allocation"
- "top picks"
- "buy list"
- "sell list"

## Safer Phrases

Prefer:

- "데이터 기준으로 정리"
- "최근 흐름을 데이터 중심으로 설명"
- "관찰값만 표로 정리"
- "투자 추천은 하지 말고"
- "계산 불가한 값은 unavailable reason을 기준으로 설명"

## Release Boundary

v0.42.0-alpha adds Quant Research Examples and Prompt Pack documentation only. Provider capability is unchanged.

No account access. No orders. No balance lookup. No holdings lookup. No trading. No auto-trading. No investment recommendations. No user-facing mock market data fallback.
