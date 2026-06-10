# Quant Research Examples and Prompt Pack

This prompt pack is for using `korea-market-data-mcp` as a Korean market data supply engine.

The MCP returns structured data such as quotes, `daily_charts[]`, `related_indices[]`, and `research_metrics`. Claude/GPT/Codex performs interpretation. The MCP does not create buy/sell judgments, recommendations, target prices, return forecasts, portfolio recommendations, rebalancing conclusions, account access, orders, balance lookup, holdings lookup, trading, or auto-trading.

## Prompt Style

Use data-centered phrasing:

- "데이터 기준으로 정리해줘."
- "최근 흐름을 데이터 중심으로 설명해줘."
- "투자 추천은 하지 말고, MCP payload의 필드만 근거로 설명해줘."
- "계산 불가한 값은 null 또는 unavailable reason을 기준으로 설명해줘."

Avoid prompts that ask the AI to produce a trading decision, target price, ranking, or return forecast.

## Single Stock Summary

- "삼성전자 최근 20일 가격 흐름과 거래량 변화를 데이터 기준으로 요약해줘. 투자 추천은 하지 말고, 현재가, 일봉, research_metrics 중심으로만 설명해줘."
- "삼성전자우 최근 20일 일봉 데이터와 research_metrics를 바탕으로 period_return, period_high, period_low, latest_close, average_volume을 데이터 중심으로 정리해줘."

## ETF Summary

- "KODEX 200의 최근 20일 흐름을 데이터 기준으로 정리해줘. period_return, period_high, period_low, average_volume, volume_ratio가 의미하는 바를 설명해줘."
- "TIGER 미국S&P500 최근 60일 가격 흐름과 거래량 변화를 데이터 중심으로 설명해줘. 투자 추천은 하지 말고, null 값이 있으면 이유도 함께 정리해줘."

## Stock vs Related Index

- "삼성전자의 최근 20일 흐름을 KOSPI 또는 KOSPI200 관련 지수 context와 함께 비교해서 설명해줘. 단, 매수/매도 판단은 하지 마."
- "삼성전자우 daily_charts와 related_indices를 기준으로 asset_vs_index_return_diff가 계산 가능한지 확인하고, 가능하면 데이터 표로 정리해줘."

## ETF vs Related Index

- "KODEX 200과 KOSPI200 관련 지수 데이터를 함께 보고, 추종 흐름을 데이터 중심으로 요약해줘. 투자 의견은 제외해줘."
- "TIGER 미국S&P500 ETF의 최근 흐름을 related_indices와 비교하되, 비교값이 없으면 comparison_unavailable_reason을 기준으로 설명해줘."

## Volume Change

- "최근 일봉과 research_metrics를 기준으로 거래량이 평소 대비 커졌는지 데이터만 보고 설명해줘. volume_ratio가 계산되지 않으면 왜 계산 불가한지도 설명해줘."
- "삼성전자 최근 20일 latest_volume, average_volume, volume_ratio를 표로 정리해줘. 투자 추천은 하지 말고 관찰값만 설명해줘."

## Recent 20/60 Day Price Flow

- "삼성전자 최근 20일 가격 흐름을 데이터 기준으로 정리해줘. period_start_price, period_end_price, period_return, period_high, period_low 중심으로 설명해줘."
- "KODEX 200 최근 60일 일봉 데이터를 기준으로 가격 흐름과 거래량 흐름을 데이터 중심으로 설명해줘. 매수/매도 의견은 제외해줘."

## research_metrics Field Interpretation

- "research_metrics의 period_return, period_high, period_low, average_volume, volume_ratio가 각각 어떤 계산값인지 데이터 기준으로 설명해줘."
- "아래 MCP bundle에서 research_metrics 값이 null인 필드를 찾아서 왜 계산할 수 없는지 데이터 상태 중심으로 설명해줘."

## related_indices Comparison Unavailable

- "related_indices 비교값이 null이면 comparison_status와 comparison_unavailable_reason을 기준으로 왜 비교할 수 없는지 설명해줘."
- "asset_vs_index_return_diff가 null인 경우, 관련 지수 데이터 부족인지 기간 불일치인지 payload의 metadata 기준으로 정리해줘."

## Multi-Asset Comparison Data Table

- "삼성전자, SK하이닉스, KODEX 200의 최근 20일 데이터를 표로 정리해줘. period_return, latest_close, average_volume, volume_ratio 중심으로 비교하되 추천 순위는 매기지 마."
- "여러 종목의 quote, daily_charts, research_metrics를 한 표로 정리해줘. 투자 추천은 하지 말고 데이터 차이만 설명해줘."

## Research Note Draft

- "아래 MCP 데이터 bundle을 바탕으로 데이터 중심 리서치 노트 초안을 작성해줘. 매수/매도, 목표가, 수익 전망은 포함하지 마."
- "아래 quote, daily_charts, related_indices, research_metrics를 기준으로 관찰 요약, 데이터 표, 계산 불가 항목을 포함한 리서치 메모를 작성해줘. 투자 추천은 하지 말고 데이터 해석 범위에서만 작성해줘."

## Boundary Reminder

No account access. No orders. No balance lookup. No holdings lookup. No trading. No auto-trading. No investment recommendations. No user-facing mock market data fallback.
