export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login") return;

  const { data: session } = await useSession();

  if (!session.value) {
    clearIdentity();
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }

  setIdentity({
    id: session.value.user.id,
    username: session.value.user.osu.username,
  });
});
