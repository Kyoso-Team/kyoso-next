import "#nuxt-better-auth";

declare module "#nuxt-better-auth" {
  interface AuthUser {
    country: string;
    discord: {
      discordId: string;
      username: string;
    } | null;
  }
}
