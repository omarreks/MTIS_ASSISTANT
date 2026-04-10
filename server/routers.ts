import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { loginUser, getStudentProfile, getGlobalStats } from "./db";
import { aiRouter } from "./aiRouter";
import { sdk } from "./_core/sdk";

export const appRouter = router({
  system: systemRouter,
  getStats: publicProcedure.query(async () => {
    return await getGlobalStats();
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({
        email: z.string().email("Invalid email format"),
        nationalId: z.string().min(10, "National ID must be at least 10 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await loginUser(input.email);
          
          if (!user) {
            return {
              success: false,
              error: "Student record not found. Please use your academic email.",
            };
          }

          // Validate National ID against the profile
          const profile = await getStudentProfile(user.id);
          if (!profile || profile.nationalId !== input.nationalId) {
             return {
              success: false,
              error: "Invalid National ID for this student account.",
            };
          }

          // Create a secure JWT session token
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name || user.email || "Student",
          });

          // Set session cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
          };
        } catch (error) {
          console.error("Login error:", error);
          return {
            success: false,
            error: "Login failed. Please try again.",
          };
        }
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
