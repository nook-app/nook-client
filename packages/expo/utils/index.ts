import { Channel, FarcasterCast, FarcasterUser } from '@/types'

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(Math.floor(num / 10000) / 100).toFixed(2)}M`
  }
  if (num >= 1000) {
    return `${(Math.floor(num / 10) / 100).toFixed(1)}K`
  }
  return num.toString()
}

export const isWarpcastUrl = (url?: string) => {
  if (!url) return false
  return (
    /^https:\/\/warpcast\.com\/[a-zA-Z0-9]+\/0x[a-fA-F0-9]+$/.test(url) ||
    /^https:\/\/warpcast\.com\/~\/conversations\/0x[a-fA-F0-9]+$/.test(url)
  )
}

export function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(timestamp).getTime()) / 1000
  )
  let interval = seconds / 86400 // Days

  if (interval > 30) {
    const dateObj = new Date(timestamp)
    return `${dateObj.toLocaleString('default', {
      month: 'short',
    })} ${dateObj.getDate()}`
  }
  if (interval > 1) {
    return `${Math.floor(interval)}d ago`
  }
  interval = seconds / 3600 // Hours
  if (interval > 1) {
    return `${Math.floor(interval)}h ago`
  }
  interval = seconds / 60 // Minutes
  if (interval > 1) {
    return `${Math.floor(interval)}m ago`
  }

  return `${Math.floor(seconds)}s ago` // Seconds
}

export const formatToWarpcastCDN = (
  url: string,
  opts?: { width?: number; type?: string }
) => {
  const params = ['c_fill']

  if (opts?.type === 'image/gif' || url.includes('.gif')) {
    params.push('f_gif')
  } else {
    params.push('f_jpg')
  }

  if (opts?.width) {
    params.push(`w_${opts.width}`)
  }

  return `https://res.cloudinary.com/merkle-manufactory/image/fetch/${params.join(
    ','
  )}/${url}`
}

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const hasUserDiff = (user1: FarcasterUser, user2: FarcasterUser) => {
  return (
    user1.engagement.followers !== user2.engagement.followers ||
    user1.engagement.following !== user2.engagement.following
  )
}

export const hasChannelDiff = (channel1: Channel, channel2: Channel) => {
  return false
}

export const hasCastDiff = (cast1: FarcasterCast, cast2: FarcasterCast) => {
  return (
    cast1.engagement.likes !== cast2.engagement.likes ||
    cast1.engagement.recasts !== cast2.engagement.recasts ||
    cast1.engagement.replies !== cast2.engagement.replies ||
    cast1.engagement.quotes !== cast2.engagement.quotes
  )
}

export function stringToColor(str: string): string {
  const backgroundColors = [
    '#87CEEB', // Sky Blue
    '#FF7F50', // Coral
    '#40E0D0', // Turquoise
    '#50C878', // Emerald Green
    '#9966CC', // Amethyst
    '#FD5E53', // Sunset Orange
    '#008080', // Teal
    '#D87093', // Pale Violet Red,
    '#32CD32', // Lime Green
    '#6A5ACD', // Slate Blue,
    '#FFDB58', // Mustard Yellow
    '#708090', // Slate Grey
    '#2E8B57', // Sea Green,
    '#6495ED', // Cornflower Blue,
    '#FFA07A', // Light Salmon,
    '#191970', // Midnight Blue
    '#98FF98', // Mint Green
    '#800000', // Maroon
    '#007BA7', // Cerulean
    '#E97451', // Burnt Sienna
  ]

  // Hash function to convert the string to a hash number.
  const hash = str.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  // Use the hash number to select a color from the list.
  const index = Math.abs(hash) % backgroundColors.length
  return backgroundColors[index]
}
