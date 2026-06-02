import { MarketDataProviderError } from "../errors.js";
import type {
  DailyChartInput,
  MarketDataProvider,
  MarketIndexInput,
  QuoteInput,
  SymbolSearchInput
} from "../types.js";
import type { NormalizedDailyChart, NormalizedIndex, NormalizedQuote, SymbolSearchResult } from "../../schemas/index.js";
import { createKiwoomAuthClient, type KiwoomAuthClient } from "./auth.js";

export class KiwoomMarketDataProvider implements MarketDataProvider {
  readonly metadata = {
    id: "kiwoom",
    name: "Kiwoom Securities REST API",
    supportsRealtime: false,
    supportsHistoricalChart: false,
    supportsEtfData: false,
    supportsIndexData: false,
    supportsSymbolSearch: false,
    isReadOnly: true
  } as const;

  readonly capabilities = {
    symbolSearch: false,
    stockQuote: false,
    etfQuote: false,
    marketIndex: false,
    dailyChart: false,
    minuteChart: false,
    realtimeQuote: false
  };

  constructor(private readonly authClient: KiwoomAuthClient = createKiwoomAuthClient()) {}

  async searchSymbol(_input: SymbolSearchInput): Promise<SymbolSearchResult[]> {
    return this.throwNotImplemented();
  }

  async getStockQuote(_input: QuoteInput): Promise<NormalizedQuote> {
    return this.throwNotImplemented();
  }

  async getEtfQuote(_input: QuoteInput): Promise<NormalizedQuote> {
    return this.throwNotImplemented();
  }

  async getMarketIndex(_input: MarketIndexInput): Promise<NormalizedIndex> {
    return this.throwNotImplemented();
  }

  async getDailyChart(_input: DailyChartInput): Promise<NormalizedDailyChart> {
    return this.throwNotImplemented();
  }

  private throwNotImplemented(): never {
    this.authClient.assertCredentialsPresent();

    throw new MarketDataProviderError(
      "UNSUPPORTED_PROVIDER_CAPABILITY",
      "Kiwoom provider data calls are not implemented yet.",
      "kiwoom",
      false
    );
  }
}
