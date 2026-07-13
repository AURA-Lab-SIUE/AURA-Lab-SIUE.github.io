import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Play } from 'lucide-react'
import { useYouTubeAPI } from '../../hooks/useYouTubeAPI'
import { useAppStore } from '../../store/useAppStore'
import type { YTPlayer, YTPlayerEvent } from '../../types/annotation'

export interface VideoPaneHandle {
  getCurrentTime: () => number
  pauseVideo: () => void
  playVideo: () => void
  seekTo: (seconds: number) => void
}

export function extractVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed
  const shortMatch = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    const v = url.searchParams.get('v')
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
    // youtube.com/embed/ID or /shorts/ID
    const pathMatch = url.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/)
    if (pathMatch) return pathMatch[1]
  } catch {
    // not a URL
  }
  return null
}

interface VideoPaneProps {
  onTimeCapture: (time: number) => void
}

export const VideoPane = forwardRef<VideoPaneHandle, VideoPaneProps>(
  ({ onTimeCapture }, ref) => {
    const apiStatus = useYouTubeAPI()
    const videoId = useAppStore((s) => s.videoId)
    const videoUrl = useAppStore((s) => s.videoUrl)
    const setVideoUrl = useAppStore((s) => s.setVideoUrl)
    const setVideoId = useAppStore((s) => s.setVideoId)
    const setPlayerState = useAppStore((s) => s.setPlayerState)

    const [error, setError] = useState('')
    const playerContainerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<YTPlayer | null>(null)

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => playerRef.current?.getCurrentTime() ?? 0,
      pauseVideo: () => playerRef.current?.pauseVideo(),
      playVideo: () => playerRef.current?.playVideo(),
      seekTo: (seconds: number) => {
        playerRef.current?.seekTo(seconds, true)
        playerRef.current?.playVideo()
      },
    }))

    // Create/recreate the player when a video is loaded and the API is ready.
    useEffect(() => {
      if (apiStatus !== 'ready' || !videoId || !playerContainerRef.current) return

      playerRef.current?.destroy()
      const container = playerContainerRef.current
      const playerDiv = document.createElement('div')
      container.innerHTML = ''
      container.appendChild(playerDiv)

      playerRef.current = new window.YT.Player(playerDiv, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { modestbranding: 1, rel: 0, origin: window.location.origin },
        events: { onStateChange: (event: YTPlayerEvent) => setPlayerState(event.data) },
      })

      return () => {
        playerRef.current?.destroy()
        playerRef.current = null
      }
    }, [apiStatus, videoId, setPlayerState])

    function handleLoad() {
      setError('')
      const id = extractVideoId(videoUrl)
      if (!id) {
        setError('Could not read a YouTube video ID from that. Paste a full watch URL, a youtu.be link, or the 11-character ID.')
        return
      }
      setVideoId(id)
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="yt-url-input" className="sr-only">YouTube URL or video ID</label>
          <input
            id="yt-url-input"
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            placeholder="Paste a YouTube URL or video ID…"
            className="field-input flex-1"
            aria-describedby={error ? 'yt-url-error' : undefined}
          />
          <button
            onClick={handleLoad}
            className="btn-primary shrink-0"
            disabled={apiStatus === 'loading'}
          >
            <Play size={15} aria-hidden="true" />
            {apiStatus === 'loading' ? 'Loading…' : 'Load video'}
          </button>
        </div>

        {error && (
          <p id="yt-url-error" role="alert" className="text-sm" style={{ color: 'var(--brick-deep)' }}>
            {error}
          </p>
        )}
        {apiStatus === 'error' && (
          <p role="alert" className="text-sm" style={{ color: 'var(--brick-deep)' }}>
            Could not reach YouTube. Check your internet connection and reload.
          </p>
        )}

        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: '16/9', background: 'var(--ink)', borderRadius: 'var(--radius-card)', border: '1px solid var(--line)' }}
        >
          {!videoId && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <Play size={24} style={{ color: 'rgba(255,255,255,0.5)' }} aria-hidden="true" />
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Load a YouTube video to begin coding
              </p>
            </div>
          )}
          <div
            ref={playerContainerRef}
            className="h-full w-full"
            aria-label="YouTube video player"
            style={{ display: videoId ? 'block' : 'none' }}
          />
        </div>

        {videoId && (
          <button
            type="button"
            onClick={() => onTimeCapture(playerRef.current?.getCurrentTime() ?? 0)}
            className="btn-secondary self-start"
          >
            ⏱ Capture this moment
          </button>
        )}
      </div>
    )
  }
)

VideoPane.displayName = 'VideoPane'
