import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Cached market data from Polymarket API
  markets: defineTable({
    marketId: v.string(),
    question: v.string(),
    description: v.optional(v.string()),
    outcomes: v.array(v.object({
      name: v.string(),
      price: v.number(),
      previousPrice: v.optional(v.number()),
    })),
    volume: v.number(),
    liquidity: v.number(),
    endDate: v.optional(v.string()),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
    lastUpdated: v.number(),
  }).index("by_marketId", ["marketId"])
    .index("by_volume", ["volume"])
    .index("by_active", ["active"]),

  // Track price changes over time
  priceHistory: defineTable({
    marketId: v.string(),
    outcomeName: v.string(),
    price: v.number(),
    timestamp: v.number(),
  }).index("by_market", ["marketId"])
    .index("by_market_and_time", ["marketId", "timestamp"]),

  // User watchlist
  watchlist: defineTable({
    userId: v.id("users"),
    marketId: v.string(),
    addedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_market", ["userId", "marketId"]),

  // Market alerts set by users
  alerts: defineTable({
    userId: v.id("users"),
    marketId: v.string(),
    outcomeName: v.string(),
    targetPrice: v.number(),
    direction: v.union(v.literal("above"), v.literal("below")),
    triggered: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_market", ["marketId"]),

  // System activity log
  activityLog: defineTable({
    type: v.union(
      v.literal("market_update"),
      v.literal("price_spike"),
      v.literal("new_market"),
      v.literal("market_resolved")
    ),
    marketId: v.optional(v.string()),
    message: v.string(),
    data: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
