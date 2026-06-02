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

export const sensitiveProviderErrorKiwoomQuoteResponse: KiwoomQuoteResponse = {
  return_code: "Q2001",
  return_msg: "Quote failed with access_token=fixture_quote_access_token_1234567890 and secretkey=fixture_secret.",
  access_token: "fixture_quote_access_token_value_that_must_not_escape",
  appkey: "fixture_app_key_that_must_not_escape",
  secretkey: "fixture_secret_key_that_must_not_escape"
};

export const sensitiveMalformedKiwoomQuoteResponse: KiwoomQuoteResponse = {
  stock_code: "005930",
  current_price: "not-a-number-with-token fixture_quote_access_token_1234567890",
  return_code: "0",
  return_msg: "OK",
  access_token: "fixture_quote_access_token_value_that_must_not_escape",
  secretkey: "fixture_secret_key_that_must_not_escape"
};

export const signedChangeKiwoomQuoteResponse: KiwoomQuoteResponse = {
  symbol: "069500",
  name: "KODEX 200",
  market: "KOSPI",
  price: "35,250",
  change: "+125",
  change_rate: "+0.36",
  volume: "1,234,567",
  as_of: "2026-06-03T09:00:00.000Z",
  return_code: "0",
  return_msg: "OK"
};
