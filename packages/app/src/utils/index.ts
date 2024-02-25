export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(Math.floor(num / 10000) / 100).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(Math.floor(num / 10) / 100).toFixed(1)}K`;
  }
  return num.toString();
}

export const isWarpcastUrl = (url: string) => {
  return (
    /^https:\/\/warpcast\.com\/[a-zA-Z0-9]+\/0x[a-fA-F0-9]+$/.test(url) ||
    /^https:\/\/warpcast\.com\/~\/conversations\/0x[a-fA-F0-9]+$/.test(url)
  );
};

export function formatTimeAgo(date: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  );
  let interval = seconds / 86400; // Days

  if (interval > 30) {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleString("default", {
      month: "short",
    })} ${dateObj.getDate()}`;
  }
  if (interval > 1) {
    return `${Math.floor(interval)}d ago`;
  }
  interval = seconds / 3600; // Hours
  if (interval > 1) {
    return `${Math.floor(interval)}h ago`;
  }
  interval = seconds / 60; // Minutes
  if (interval > 1) {
    return `${Math.floor(interval)}m ago`;
  }

  return `${Math.floor(seconds)}s ago`; // Seconds
}
