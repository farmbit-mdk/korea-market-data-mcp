import { describe, expect, it, vi } from "vitest";
import {
  createKiwoomIndexClient,
  normalizeKiwoomMarketIndexCode,
  normalizeKiwoomMarketIndexResponse
} from "../src/providers/kiwoom/index-client.js";
import type { KiwoomMarketIndexTransport } from "../src/providers/kiwoom/types.js";

describe("Kiwoom market index client", () => {
  it("normalizes supported Korean market index aliases", () => {
    expect(normalizeKiwoomMarketIndexCode("KOSPI")).toBe("KOSPI");
    expect(normalizeKiwoomMarketIndexCode("코스피")).toBe("KOSPI");
    expect(normalizeKiwoomMarketIndexCode("KOSDAQ")).toBe("KOSDAQ");
    expect(normalizeKiwoomMarketIndexCode("코스닥")).toBe("KOSDAQ");
    expect(normalizeKiwoomMarketIndexCode("KOSPI 200")).toBe("KOSPI200");
    expect(normalizeKiwoomMarketIndexCode("코스피200")).toBe("KOSPI200");
    expect(normalizeKiwoomMarketIndexCode("0001")).toBeUndefined();
  });

  it("normalizes a successful ka20001 index response without exposing raw data", () => {
    const normalized = normalizeKiwoomMarketIndexResponse({
      cur_prc: "2,850.12",
      pred_pre: "+12.34",
      flu_rt: "+0.43",
      open_pric: "2,840.00",
      high_pric: "2,860.00",
      low_pric: "2,830.00",
      trde_qty: "123,456",
      trde_prica: "987,654",
      return_code: 0,
      return_msg: "정상적으로 처리되었습니다"
    }, { indexCode: "KOSPI" }, "ka20001", "/api/dostk/sect");

    expect(normalized).toMatchObject({
      provider: "kiwoom",
      source: "real",
      source_tr: "ka20001",
      endpoint: "/api/dostk/sect",
      public_index_code: "KOSPI",
      kiwoom_market_type: "0",
      kiwoom_sector_code: "001",
      index_code: "KOSPI",
      symbol: "KOSPI",
      name: "KOSPI",
      market: "KRX",
      currency: "KRW",
      value: 2850.12,
      price: 2850.12,
      change: 12.34,
      change_rate: 0.43,
      open: 2840,
      high: 2860,
      low: 2830,
      volume: 123456,
      trading_value: 987654
    });
    expect(JSON.stringify(normalized)).not.toContain("token");
  });

  it("uses the injected transport and read-only ka20001 request mapping", async () => {
    const transport: KiwoomMarketIndexTransport = {
      requestMarketIndex: vi.fn(async () => ({
        cur_prc: "900.12",
        pred_pre: "-1.23",
        flu_rt: "-0.14",
        return_code: "0"
      }))
    };
    const client = createKiwoomIndexClient({
      transport,
      baseUrl: "https://api.kiwoom.com",
      indexEndpointPath: "/api/dostk/sect",
      accessToken: "redacted-token",
      apiId: "ka20001"
    });

    const index = await client.getMarketIndex({ indexCode: "KOSDAQ" });

    expect(index.index_code).toBe("KOSDAQ");
    expect(index.value).toBe(900.12);
    expect(transport.requestMarketIndex).toHaveBeenCalledWith(expect.objectContaining({
      url: "https://api.kiwoom.com/api/dostk/sect",
      method: "POST",
      headers: expect.objectContaining({
        "Content-Type": "application/json;charset=UTF-8",
        "api-id": "ka20001"
      }),
      body: {
        mrkt_tp: "1",
        inds_cd: "101"
      }
    }));
  });
});
