export function flagUrl(code: string | null | undefined): string | null {
  if (!code) return null;
  return `https://app.warera.io/images/flags/${code.toLowerCase()}.svg?v=16`;
}
