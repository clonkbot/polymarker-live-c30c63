import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Get all active markets
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const markets = await ctx.db
      .query("markets")
      .withIndex("by_active", (q) => q.eq("active", true))
      .order("desc")
      .take(50);

    // Sort by volume
    return markets.sort((a, b) => b.volume - a.volume);
  },
});

// Get market by ID
export const getById = query({
  args: { marketId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("markets")
      .withIndex("by_marketId", (q) => q.eq("marketId", args.marketId))
      .first();
  },
});

// Get top movers (biggest price changes)
export const getTopMovers = query({
  args: {},
  handler: async (ctx) => {
    const markets = await ctx.db
      .query("markets")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    // Calculate price change for each market
    const withChanges = markets.map(market => {
      const maxChange = market.outcomes.reduce((max, outcome) => {
        const change = outcome.previousPrice
          ? Math.abs(outcome.price - outcome.previousPrice)
          : 0;
        return Math.max(max, change);
      }, 0);
      return { ...market, maxChange };
    });

    return withChanges
      .filter(m => m.maxChange > 0)
      .sort((a, b) => b.maxChange - a.maxChange)
      .slice(0, 10);
  },
});

// Get price history for a market
export const getPriceHistory = query({
  args: { marketId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("priceHistory")
      .withIndex("by_market", (q) => q.eq("marketId", args.marketId))
      .order("desc")
      .take(100);
  },
});

// Get recent activity
export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("activityLog")
      .withIndex("by_timestamp")
      .order("desc")
      .take(20);
  },
});

// Internal mutation to update market data
export const upsertMarket = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("markets")
      .withIndex("by_marketId", (q) => q.eq("marketId", args.marketId))
      .first();

    if (existing) {
      // Track price changes
      const outcomesWithPrevious = args.outcomes.map(outcome => {
        const existingOutcome = existing.outcomes.find(o => o.name === outcome.name);
        return {
          ...outcome,
          previousPrice: existingOutcome?.price ?? outcome.price,
        };
      });

      await ctx.db.patch(existing._id, {
        ...args,
        outcomes: outcomesWithPrevious,
        lastUpdated: Date.now(),
      });

      // Record price history
      for (const outcome of args.outcomes) {
        await ctx.db.insert("priceHistory", {
          marketId: args.marketId,
          outcomeName: outcome.name,
          price: outcome.price,
          timestamp: Date.now(),
        });
      }
    } else {
      await ctx.db.insert("markets", {
        ...args,
        lastUpdated: Date.now(),
      });

      // Log new market
      await ctx.db.insert("activityLog", {
        type: "new_market",
        marketId: args.marketId,
        message: `New market: ${args.question}`,
        timestamp: Date.now(),
      });
    }
  },
});

// Log activity
export const logActivity = internalMutation({
  args: {
    type: v.union(
      v.literal("market_update"),
      v.literal("price_spike"),
      v.literal("new_market"),
      v.literal("market_resolved")
    ),
    marketId: v.optional(v.string()),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLog", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Action to fetch data from Polymarket API
export const fetchPolymarketData = action({
  args: {},
  handler: async (ctx) => {
    try {
      // Polymarket CLOB API - fetch active markets
      const response = await fetch(
        "https://clob.polymarket.com/markets?active=true&closed=false&limit=50",
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Process each market
      for (const market of data) {
        // Parse outcomes from tokens
        const outcomes = [];

        if (market.tokens && Array.isArray(market.tokens)) {
          for (const token of market.tokens) {
            outcomes.push({
              name: token.outcome || "Unknown",
              price: parseFloat(token.price) || 0.5,
            });
          }
        }

        // If no valid outcomes, create default Yes/No
        if (outcomes.length === 0) {
          outcomes.push(
            { name: "Yes", price: 0.5 },
            { name: "No", price: 0.5 }
          );
        }

        await ctx.runMutation(internal.markets.upsertMarket, {
          marketId: market.condition_id || market.id || String(Math.random()),
          question: market.question || "Unknown Market",
          description: market.description,
          outcomes,
          volume: parseFloat(market.volume) || 0,
          liquidity: parseFloat(market.liquidity) || 0,
          endDate: market.end_date_iso,
          category: market.category,
          imageUrl: market.image,
          active: market.active !== false,
        });
      }

      await ctx.runMutation(internal.markets.logActivity, {
        type: "market_update",
        message: `Synced ${data.length} markets from Polymarket`,
      });

      return { success: true, count: data.length };
    } catch (error) {
      console.error("Failed to fetch Polymarket data:", error);

      // Fall back to gamma API
      try {
        const gammaResponse = await fetch(
          "https://gamma-api.polymarket.com/markets?closed=false&limit=50",
          {
            headers: {
              "Accept": "application/json",
            },
          }
        );

        if (gammaResponse.ok) {
          const gammaData = await gammaResponse.json();

          for (const market of gammaData) {
            const outcomes = [];

            if (market.outcomePrices) {
              try {
                const prices = JSON.parse(market.outcomePrices);
                const names = market.outcomes ? JSON.parse(market.outcomes) : ["Yes", "No"];

                names.forEach((name: string, i: number) => {
                  outcomes.push({
                    name,
                    price: parseFloat(prices[i]) || 0.5,
                  });
                });
              } catch {
                outcomes.push(
                  { name: "Yes", price: 0.5 },
                  { name: "No", price: 0.5 }
                );
              }
            } else {
              outcomes.push(
                { name: "Yes", price: 0.5 },
                { name: "No", price: 0.5 }
              );
            }

            await ctx.runMutation(internal.markets.upsertMarket, {
              marketId: market.id || String(Math.random()),
              question: market.question || "Unknown Market",
              description: market.description,
              outcomes,
              volume: parseFloat(market.volume) || 0,
              liquidity: parseFloat(market.liquidity) || 0,
              endDate: market.endDate,
              category: market.category,
              imageUrl: market.image,
              active: !market.closed,
            });
          }

          await ctx.runMutation(internal.markets.logActivity, {
            type: "market_update",
            message: `Synced ${gammaData.length} markets from Polymarket (gamma)`,
          });

          return { success: true, count: gammaData.length };
        }
      } catch (gammaError) {
        console.error("Gamma API also failed:", gammaError);
      }

      return { success: false, error: String(error) };
    }
  },
});
