import { createAuthMiddleware } from "evlog/better-auth";

let identify: ReturnType<typeof createAuthMiddleware> | undefined;

export default defineEventHandler(async (event) => {
  identify ??= createAuthMiddleware(serverAuth(event), {
    exclude: ["/api/auth/**", "/api/public/**"],
    include: ["/api/**"],
    maskEmail: true,
  });

  if (!event.context.log) return;

  await identify(event.context.log, event.headers, event.path);
});
