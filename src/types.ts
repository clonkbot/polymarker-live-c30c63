export interface Outcome {
  name: string;
  price: number;
  previousPrice?: number;
}

export interface Market {
  _id: string;
  marketId: string;
  question: string;
  description?: string;
  outcomes: Outcome[];
  volume: number;
  liquidity: number;
  endDate?: string;
  category?: string;
  imageUrl?: string;
  active: boolean;
  lastUpdated: number;
  maxChange?: number;
}

export interface WatchlistItem {
  _id: string;
  userId: string;
  marketId: string;
  addedAt: number;
  market: Market | null;
}

export interface Activity {
  _id: string;
  type: "market_update" | "price_spike" | "new_market" | "market_resolved";
  marketId?: string;
  message: string;
  timestamp: number;
}
