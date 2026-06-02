import type { KiwoomRawTokenResponse } from "../../src/providers/kiwoom/index.js";

export const successfulKiwoomTokenResponse: KiwoomRawTokenResponse = {
  token: "fixture_access_token_value",
  token_type: "Bearer",
  expires_dt: "2026-06-02T00:00:00.000Z",
  return_code: "0",
  return_msg: "OK"
};

export const kiwoomErrorTokenResponse: KiwoomRawTokenResponse = {
  return_code: "10001",
  return_msg: "Invalid app key or secret key."
};

export const malformedKiwoomTokenResponse: KiwoomRawTokenResponse = {
  token: "fixture_access_token_value",
  token_type: "Bearer",
  expires_dt: "not-a-date",
  return_code: "0",
  return_msg: "OK"
};

export const missingTokenKiwoomTokenResponse: KiwoomRawTokenResponse = {
  token_type: "Bearer",
  expires_dt: "2026-06-02T00:00:00.000Z",
  return_code: "0",
  return_msg: "OK"
};

export const missingExpiresDtKiwoomTokenResponse: KiwoomRawTokenResponse = {
  token: "fixture_access_token_value",
  token_type: "Bearer",
  return_code: "0",
  return_msg: "OK"
};
