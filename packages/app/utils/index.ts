const CDN_BASE_URL =
  "https://res.cloudinary.com/merkle-manufactory/image/fetch";

export const formatToCDN = (
  url: string,
  opts?: { width?: number; type?: string },
) => {
  const params = ["c_fill"];

  if (opts?.type === "image/gif" || url.includes(".gif")) {
    params.push("f_gif");
  } else {
    params.push("f_jpg");
  }

  if (opts?.width) {
    params.push(`w_${opts.width}`);
  }

  return `${CDN_BASE_URL}/${params.join(",")}/${url}`;
};

export function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(timestamp).getTime()) / 1000,
  );
  let interval = seconds / 86400; // Days

  if (interval > 30) {
    const dateObj = new Date(timestamp);
    return `${dateObj.toLocaleString("default", {
      month: "short",
    })} ${dateObj.getDate()}`;
  }
  if (interval > 1) {
    return `${Math.floor(interval)}d`;
  }
  interval = seconds / 3600; // Hours
  if (interval > 1) {
    return `${Math.floor(interval)}h`;
  }
  interval = seconds / 60; // Minutes
  if (interval > 1) {
    return `${Math.floor(interval)}m`;
  }

  return `${Math.floor(seconds)}s`; // Seconds
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(Math.floor(num / 10000) / 100).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(Math.floor(num / 10) / 100).toFixed(1)}K`;
  }
  return num.toString();
}
