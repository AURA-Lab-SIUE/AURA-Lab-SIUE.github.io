import { useRef } from 'react'
import { AppHeader } from './components/layout/AppHeader'
import { StageNav } from './components/layout/StageNav'
import { ProjectBar } from './components/layout/ProjectBar'
import { LiveRegion } from './components/layout/LiveRegion'
import { Stage1Panel } from './components/stage1/Stage1Panel'
import { Stage2Panel } from './components/stage2/Stage2Panel'
import { Stage3Panel } from './components/stage3/Stage3Panel'
import { useAppStore } from './store/useAppStore'
import type { Stage } from './store/useAppStore'

export default function App() {
  const activeStage = useAppStore((s) => s.activeStage)

  const stage1Ref = useRef<HTMLHeadingElement>(null)
  const stage2Ref = useRef<HTMLHeadingElement>(null)
  const stage3Ref = useRef<HTMLHeadingElement>(null)
  const panelRefs: Record<Stage, React.RefObject<HTMLHeadingElement | null>> = {
    stage1: stage1Ref,
    stage2: stage2Ref,
    stage3: stage3Ref,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LiveRegion />
      <AppHeader />
      <StageNav panelRefs={panelRefs} />

      <main className="mx-auto w-full max-w-page flex-1 px-4 py-8 md:px-8">
        <ProjectBar />

        <div
          id="panel-stage1"
          role="tabpanel"
          aria-labelledby="tab-stage1"
          hidden={activeStage !== 'stage1'}
          className="pt-6"
        >
          <Stage1Panel headingRef={stage1Ref} />
        </div>

        <div
          id="panel-stage2"
          role="tabpanel"
          aria-labelledby="tab-stage2"
          hidden={activeStage !== 'stage2'}
          className="pt-6"
        >
          <Stage2Panel headingRef={stage2Ref} />
        </div>

        <div
          id="panel-stage3"
          role="tabpanel"
          aria-labelledby="tab-stage3"
          hidden={activeStage !== 'stage3'}
          className="pt-6"
        >
          <Stage3Panel headingRef={stage3Ref} />
        </div>
      </main>

      <footer
        className="mx-auto w-full max-w-page px-4 py-8 md:px-8"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        <p className="font-mono text-xs text-ink-soft">
          MethodoSync · AURA Lab @ SIUE · All coding stays in your browser — nothing
          is sent to any server. Save a project file to keep your work or move it
          between computers.
        </p>
      </footer>
    </div>
  )
}
