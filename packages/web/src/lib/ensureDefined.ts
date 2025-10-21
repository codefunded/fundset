export function ensureDefined<T>(array: (T | undefined | null)[]): NonNullable<T>[] {
  return array.filter((item): item is NonNullable<T> => item !== undefined && item !== null);
}
