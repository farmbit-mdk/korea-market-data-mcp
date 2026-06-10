# Claude Desktop Quant Research Examples

These examples are written for Claude Desktop using `korea-market-data-mcp`.

The MCP is a data supply engine. It returns Korean market data payloads. Claude interprets the payload and may write summaries, tables, and research-note drafts. The MCP does not generate buy/sell judgments, target prices, return forecasts, account data, orders, holdings, trading, or auto-trading.

## Example 1: Single Stock Data Summary

```text
korea-market-data MCP로 삼성전자 최근 20일 quote, daily_charts, related_indices, research_metrics를 가져와줘.
그 데이터를 기준으로 가격 흐름과 거래량 변화를 요약해줘.
투자 추천은 하지 말고, 매수/매도 판단과 목표가는 제외해줘.
```

Expected MCP data focus:

- Resolved asset and symbol.
- Real quote when Kiwoom is configured.
- Daily OHLCV candles.
- `research_metrics.period_return`, high/low, latest close, average volume, and volume ratio.
- Related index comparison if available.

## Example 2: ETF Data Summary

```text
KODEX 200의 최근 20일 흐름을 키움 데이터로 가져와줘.
period_return, period_high, period_low, average_volume, volume_ratio를 데이터 기준으로 설명해줘.
투자 의견은 제외해줘.
```

Expected MCP data focus:

- ETF symbol resolution.
- Quote and daily chart bundle.
- Related KOSPI200 context when available.
- Null or unavailable comparison reasons when related index period data is not comparable.

## Example 3: Stock vs Related Index

```text
삼성전자우 최근 20일 일봉과 KOSPI 또는 KOSPI200 관련 지수 context를 같이 가져와줘.
asset_vs_index_return_diff가 계산 가능하면 데이터 표로 정리해줘.
계산 불가하면 comparison_status와 comparison_unavailable_reason만 근거로 이유를 설명해줘.
매수/매도 판단은 하지 마.
```

## Example 4: Multi-Asset Observation Table

```text
삼성전자, SK하이닉스, KODEX 200의 최근 20일 데이터를 표로 정리해줘.
period_return, latest_close, average_volume, volume_ratio 중심으로 비교하되 추천 순위는 매기지 마.
```

## Example 5: Research Note Draft

```text
아래 MCP 데이터 bundle을 바탕으로 데이터 중심 리서치 노트 초안을 작성해줘.
관찰 요약, 주요 수치 표, null 또는 unavailable 항목 설명을 포함해줘.
매수/매도, 목표가, 수익 전망은 포함하지 마.
```

## Data Handling Notes

- If real Kiwoom data is unavailable, do not ask Claude to substitute mock market data.
- If `research_metrics` fields are `null`, use the accompanying data-state fields to explain why.
- If related index comparison is unavailable, use `comparison_status` and `comparison_unavailable_reason`.
- Keep outputs as observation tables, data summaries, and research-note drafts.

No account access. No orders. No balance lookup. No holdings lookup. No trading. No auto-trading. No investment recommendations. No user-facing mock market data fallback.
