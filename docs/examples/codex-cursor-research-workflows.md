# Codex and Cursor Research Workflows

These workflows are for developers using `korea-market-data-mcp` data bundles in Codex, Cursor, or another coding assistant.

The MCP is a data supply engine. Claude/GPT/Codex interprets the data. Keep outputs to observation tables, data summaries, and research note drafts. Do not build account/order/auto-trading workflows, investment recommendation algorithms, top picks, buy list, or sell list behavior.

## Workflow 1: MCP Data To Research Note Markdown

Prompt:

```text
아래 MCP market data bundle을 Markdown 리서치 노트 초안으로 정리해줘.
섹션은 Data Snapshot, Price Flow, Volume Observations, Related Index Comparison, Unavailable Fields로 나눠줘.
투자 추천은 하지 말고, 매수/매도 판단과 목표가는 제외해줘.
```

Recommended output shape:

- Data Snapshot
- Price Flow
- Volume Observations
- Related Index Comparison
- Unavailable Fields

## Workflow 2: research_metrics To Table

Prompt:

```text
research_metrics를 표로 변환해줘.
period_start_date, period_end_date, period_return, period_high, period_low, latest_close, average_volume, volume_ratio를 포함해줘.
null 값은 빈칸으로 바꾸지 말고 null로 유지하고, 이유가 있으면 별도 컬럼에 적어줘.
```

## Workflow 3: daily_charts To CSV-like Table

Prompt:

```text
daily_charts.candles를 CSV-like table로 정리해줘.
date, open, high, low, close, volume, change, change_rate, trading_value 순서로 보여줘.
데이터가 없는 optional field는 null로 유지해줘.
```

## Workflow 4: Compare period_return Across Assets

Prompt:

```text
여러 asset의 research_metrics.asset.period_return을 한 표로 비교해줘.
추천 순위는 매기지 말고, symbol, name, period_return, candle_count, period_start_date, period_end_date만 정리해줘.
```

## Workflow 5: Verify Related Index Comparison Status

Prompt:

```text
related_indices의 comparison_status와 comparison_unavailable_reason을 확인해줘.
asset_vs_index_return_diff가 null이면 왜 비교할 수 없는지 payload 필드 기준으로만 설명해줘.
```

## Workflow 6: Unavailable And Null Handling

Prompt:

```text
아래 MCP payload에서 null 또는 unavailable 값을 찾아줘.
각 항목마다 어떤 원인 필드가 있는지 확인하고, 데이터 부족/기간 불일치/계산 불가 중 어디에 해당하는지 정리해줘.
투자 의견은 제외해줘.
```

## Developer Guardrails

- Use "observation table", "data summary", and "research note" language.
- Keep nulls visible. Do not invent missing data.
- Do not use mock market data as a fallback in user-facing analysis.
- Do not add account access, order placement, balance lookup, holdings lookup, trading, auto-trading, or recommendation workflows.

No account access. No orders. No balance lookup. No holdings lookup. No trading. No auto-trading. No investment recommendations. No user-facing mock market data fallback.
