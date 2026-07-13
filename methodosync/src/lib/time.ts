/** Format seconds as m:ss, or h:mm:ss for videos an hour or longer. */
export function formatTimestamp(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`
}

/** A YouTube deep-link that opens the video at an exact moment. */
export function youtubeDeepLink(videoId: string, seconds: number): string {
  return `https://youtu.be/${videoId}?t=${Math.max(0, Math.floor(seconds))}s`
}

/** The canonical watch URL for a video (no timestamp). */
export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}
