export function omit<T extends object, K extends keyof T>(
  obj: Readonly<T>,
  keys: readonly K[],
): Omit<T, K> {
  const excludes = new Set(keys);
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !excludes.has(k as K))) as Omit<
    T,
    K
  >;
}

export const chunk = <T>(array: T[], chunkSize: number): T[][] => {
  return array.reduce<T[][]>((acc, _, i) => {
    if (i % chunkSize === 0) {
      acc.push(array.slice(i, i + chunkSize));
    }
    return acc;
  }, []);
};
