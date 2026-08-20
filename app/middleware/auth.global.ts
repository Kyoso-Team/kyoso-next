export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login") return;

  const { data: session, refresh } = useSession();
  await refresh();

  if (!session.value) {
    clearIdentity();
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }

  setIdentity({
    id: session.value.user.id,
    username: session.value.user.osu.username,
  });
});
