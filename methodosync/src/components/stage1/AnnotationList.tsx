import type { RefObject } from 'react'
import { Pencil, Trash2, Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { formatTimestamp } from '../../lib/time'
import { buildStage1Markdown } from '../../lib/markdownBuilder'
import { downloadBlob } from '../../utils/downloadBlob'
import type { VideoPaneHandle } from './VideoPane'

interface AnnotationListProps {
  videoRef: RefObject<VideoPaneHandle | null>
}

export function AnnotationList({ videoRef }: AnnotationListProps) {
  const annotations = useAppStore((s) => s.annotations)
  const videoId = useAppStore((s) => s.videoId)
  const beginEdit = useAppStore((s) => s.beginEditAnnotation)
  const deleteAnnotation = useAppStore((s) => s.deleteAnnotation)
  const announce = useAppStore((s) => s.announce)
  const [copied, setCopied] = useState(false)

  const sorted = [...annotations].sort((a, b) => a.timestamp - b.timestamp)

  function markdown() {
    return buildStage1Markdown(videoId ?? 'video', annotations)
  }

  function handleDownload() {
    const blob = new Blob([markdown()], { type: 'text/markdown;charset=utf-8' })
    downloadBlob(blob, `${videoId ?? 'video'}-open-coding.md`)
    announce('Markdown file downloaded.')
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown())
    setCopied(true)
    announce('Markdown copied to clipboard.')
    setTimeout(() => setCopied(false), 1800)
  }

  if (annotations.length === 0) {
    return (
      <div className="card card-pad text-center">
        <p className="font-serif text-ink-soft">
          No annotations yet. Capture a moment, write what you see, and save it —
          your list builds here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="seclabel">{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="btn-ghost">
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy .md'}
          </button>
          <button onClick={handleDownload} className="btn-secondary">
            <Download size={14} aria-hidden="true" /> Download .md
          </button>
        </div>
      </div>

      <ol className="flex flex-col gap-3">
        {sorted.map((a) => (
          <li key={a.id} className="card card-pad">
            <div className="flex items-start justify-between gap-3">
              <button
                onClick={() => videoRef.current?.seekTo(a.timestamp)}
                className="link-underline shrink-0 font-mono text-sm font-medium"
                style={{ color: 'var(--brick)' }}
                title="Jump to this moment in the video"
              >
                ▸ {formatTimestamp(a.timestamp)}
              </button>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => beginEdit(a.id)} className="btn-ghost" aria-label="Edit annotation">
                  <Pencil size={13} aria-hidden="true" /> Edit
                </button>
                <button onClick={() => deleteAnnotation(a.id)} className="btn-ghost" aria-label="Delete annotation">
                  <Trash2 size={13} aria-hidden="true" /> Delete
                </button>
              </div>
            </div>

            {a.observationText.trim() && (
              <p className="mt-2 font-serif" style={{ color: 'var(--ink)' }}>{a.observationText}</p>
            )}

            {a.openCodes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.openCodes.map((c) => (
                  <span key={c} className="pill-tag">{c}</span>
                ))}
              </div>
            )}

            {a.analyticalMemo.trim() && (
              <p className="mt-2 font-serif text-sm text-ink-soft">
                <span className="font-sans font-semibold uppercase tracking-wide" style={{ fontSize: '0.65rem' }}>Memo · </span>
                {a.analyticalMemo}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
