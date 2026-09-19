export function useAuthIdentity() {
  const session = useUserSession();

  watch(
    () => session.user,
    (user) => {
      if (user.value) {
        setIdentity({ userId: user.value.id, userName: user.value.name });
      } else {
        clearIdentity();
      }
    },
    { immediate: true },
  );
}
