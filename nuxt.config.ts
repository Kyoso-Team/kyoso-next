import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  nitro: {
    preset: "bun",
  },
  experimental: {
    typedPages: true,
  },
  routeRules: {
    "/:slug/manage/**": {
      appLayout: "tournament",
    },
  },
  modules: ["@nuxt/fonts", "shadcn-nuxt", "@nuxtjs/color-mode", "evlog/nuxt", "@nuxt/icon"],
  evlog: {
    env: {
      service: "kyoso",
    },
    routes: {
      "/api/**": { service: "kyoso-api" },
    },
    exclude: ["/api/_nuxt_icon/**", "/api/session"],
  },
  $production: {
    evlog: {
      console: false,
      sampling: {
        rates: { info: 10, warn: 50, debug: 0 },
        keep: [{ duration: 1000 }, { status: 400 }],
      },
    },
  },
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      frontendUrl: process.env.FRONTEND_URL,
      osu: {
        clientId: process.env.OSU_CLIENT_ID,
        redirectUri: process.env.OSU_REDIRECT_URI,
      },
      discord: {
        clientId: process.env.DISCORD_CLIENT_ID,
        redirectUri: process.env.DISCORD_REDIRECT_URI,
      },
    },
    ownerOsuUserId: process.env.OWNER_OSU_USER_ID,
    database: {
      url: process.env.DATABASE_URL,
    },
    osuClientSecret: process.env.OSU_CLIENT_SECRET,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
    redis: {
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      port: +process.env.REDIS_PORT!,
    },
  },
  shadcn: {
    componentDir: "./app/components/ui",
    prefix: "",
  },
});
