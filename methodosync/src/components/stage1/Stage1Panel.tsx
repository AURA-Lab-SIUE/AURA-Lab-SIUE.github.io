import { useRef } from 'react'
import type { RefObject } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { StageIntro } from '../layout/StageIntro'
import { VideoPane } from './VideoPane'
import type { VideoPaneHandle } from './VideoPane'
import { CaptureForm } from './CaptureForm'
import { AnnotationList } from './AnnotationList'

interface Stage1PanelProps {
  headingRef: RefObject<HTMLHeadingElement | null>
}

export function Stage1Panel({ headingRef }: Stage1PanelProps) {
  const videoRef = useRef<VideoPaneHandle | null>(null)
  const captureTimestamp = useAppStore((s) => s.captureTimestamp)
  const setActiveStage = useAppStore((s) => s.setActiveStage)
  const annotations = useAppStore((s) => s.annotations)

  return (
    <div>
      <StageIntro
        fig="FIG.1"
        kicker="First-cycle coding"
        title="Open coding, synced to the tape"
        headingRef={headingRef}
      >
        <p>
          Watch your video and stop at moments that matter. Capture the exact time,
          write what you see, and give it one or more <strong>open codes</strong> —
          short labels for what is going on. Every code stays pinned to its moment,
          so you (and anyone reading your export) can jump straight back to it.
        </p>
      </StageIntro>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <VideoPane ref={videoRef} onTimeCapture={(t) => captureTimestamp(t)} />
        </div>
        <CaptureForm videoRef={videoRef} />
      </div>

      <div className="mt-10">
        <AnnotationList videoRef={videoRef} />
      </div>

      {annotations.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button onClick={() => setActiveStage('stage2')} className="btn-primary">
            Next: cluster your codes →
          </button>
        </div>
      )}
    </div>
  )
}
