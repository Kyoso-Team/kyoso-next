export function omit<T extends object, K extends keyof T>(
  obj: Readonly<T>,
  keys: readonly K[],
): Omit<T, K> {
  const excludes = new Set(keys);
  return Object.fromEntries(Object.entries(obj).filter(([k, _]) => !excludes.has(k as K))) as Omit<
    T,
    K
  >;
}
