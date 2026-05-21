import redisDriver from "unstorage/drivers/redis";

export default defineNitroPlugin(() => {
  const storage = useStorage();

  const driver = redisDriver({
    base: "redis",
    host: useRuntimeConfig().redis.host,
    port: useRuntimeConfig().redis.port ?? 6379,
    password: process.env.NODE_ENV === "production" ? useRuntimeConfig().redis.password : undefined,
  });

  storage.mount("redis", driver);
});
