import { ThemeName } from "@nook/app-ui";

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

export function stringToColor(str: string): string {
  const backgroundColors = [
    "#87CEEB", // Sky Blue
    "#FF7F50", // Coral
    "#40E0D0", // Turquoise
    "#50C878", // Emerald Green
    "#9966CC", // Amethyst
    "#FD5E53", // Sunset Orange
    "#008080", // Teal
    "#D87093", // Pale Violet Red,
    "#32CD32", // Lime Green
    "#6A5ACD", // Slate Blue,
    "#FFDB58", // Mustard Yellow
    "#708090", // Slate Grey
    "#2E8B57", // Sea Green,
    "#6495ED", // Cornflower Blue,
    "#FFA07A", // Light Salmon,
    "#191970", // Midnight Blue
    "#98FF98", // Mint Green
    "#800000", // Maroon
    "#007BA7", // Cerulean
    "#E97451", // Burnt Sienna
  ];

  // Hash function to convert the string to a hash number.
  const hash = str.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Use the hash number to select a color from the list.
  const index = Math.abs(hash) % backgroundColors.length;
  return backgroundColors[index];
}

export const darkenColor = (color: string): string => {
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);

  r = Math.floor(r * 0.5);
  g = Math.floor(g * 0.5);
  b = Math.floor(b * 0.5);

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function stringToTheme(str: string): ThemeName {
  const backgroundColors = [
    "mauve",
    "blue",
    "green",
    "orange",
    "pink",
    "purple",
    "red",
    "yellow",
  ];

  // Hash function to convert the string to a hash number.
  const hash = str.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Use the hash number to select a color from the list.
  const index = Math.abs(hash) % backgroundColors.length;
  return backgroundColors[index] as ThemeName;
}
