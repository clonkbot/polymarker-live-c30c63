import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's alerts
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Fetch market details for each alert
    const alertsWithMarkets = await Promise.all(
      alerts.map(async (alert) => {
        const market = await ctx.db
          .query("markets")
          .withIndex("by_marketId", (q) => q.eq("marketId", alert.marketId))
          .first();
        return { ...alert, market };
      })
    );

    return alertsWithMarkets;
  },
});

// Create alert
export const create = mutation({
  args: {
    marketId: v.string(),
    outcomeName: v.string(),
    targetPrice: v.number(),
    direction: v.union(v.literal("above"), v.literal("below")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("alerts", {
      userId,
      marketId: args.marketId,
      outcomeName: args.outcomeName,
      targetPrice: args.targetPrice,
      direction: args.direction,
      triggered: false,
      createdAt: Date.now(),
    });
  },
});

// Delete alert
export const remove = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const alert = await ctx.db.get(args.id);
    if (!alert || alert.userId !== userId) {
      throw new Error("Alert not found");
    }

    await ctx.db.delete(args.id);
  },
});
