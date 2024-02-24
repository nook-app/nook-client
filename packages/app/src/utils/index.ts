export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(Math.floor(num / 10000) / 100).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(Math.floor(num / 10) / 100).toFixed(1)}K`;
  }
  return num.toString();
}
