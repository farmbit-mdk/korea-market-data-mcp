import type { KiwoomQuoteResponse } from "../../src/providers/kiwoom/index.js";

export const successfulKiwoomQuoteLikeResponse: KiwoomQuoteResponse = {
  stock_code: "005930",
  name: "Samsung Electronics",
  market: "KOSPI",
  current_price: "70,000",
  change: "-500",
  change_rate: "-0.71",
  volume: "12,345,678",
  timestamp: "2026-06-02T09:00:00.000Z",
  return_code: "0",
  return_msg: "OK"
};

export const missingPriceKiwoomQuoteResponse: KiwoomQuoteResponse = {
  stock_code: "005930",
  market: "KOSPI",
  return_code: "0",
  return_msg: "OK"
};

export const malformedKiwoomQuoteResponse: KiwoomQuoteResponse = {
  stock_code: "005930",
  current_price: "not-a-number",
  return_code: "0",
  return_msg: "OK"
};

export const providerErrorKiwoomQuoteResponse: KiwoomQuoteResponse = {
  return_code: "Q1001",
  return_msg: "Quote endpoint unavailable."
};
