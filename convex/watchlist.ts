import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's watchlist
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const watchlist = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Fetch market details for each watched market
    const marketsWithDetails = await Promise.all(
      watchlist.map(async (item) => {
        const market = await ctx.db
          .query("markets")
          .withIndex("by_marketId", (q) => q.eq("marketId", item.marketId))
          .first();
        return { ...item, market };
      })
    );

    return marketsWithDetails.filter(m => m.market !== null);
  },
});

// Check if market is in watchlist
export const isWatched = query({
  args: { marketId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_market", (q) =>
        q.eq("userId", userId).eq("marketId", args.marketId)
      )
      .first();

    return item !== null;
  },
});

// Add to watchlist
export const add = mutation({
  args: { marketId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already in watchlist
    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_market", (q) =>
        q.eq("userId", userId).eq("marketId", args.marketId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("watchlist", {
      userId,
      marketId: args.marketId,
      addedAt: Date.now(),
    });
  },
});

// Remove from watchlist
export const remove = mutation({
  args: { marketId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_market", (q) =>
        q.eq("userId", userId).eq("marketId", args.marketId)
      )
      .first();

    if (item) {
      await ctx.db.delete(item._id);
    }
  },
});
