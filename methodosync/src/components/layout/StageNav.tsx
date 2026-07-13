import type { RefObject } from 'react'
import { useAppStore } from '../../store/useAppStore'
import type { Stage } from '../../store/useAppStore'

const STAGES: { id: Stage; fig: string; label: string; short: string }[] = [
  { id: 'stage1', fig: 'FIG.1', label: 'Open coding', short: 'Code' },
  { id: 'stage2', fig: 'FIG.2', label: 'Axial & themes', short: 'Cluster' },
  { id: 'stage3', fig: 'FIG.3', label: 'Codebook', short: 'Codebook' },
]

interface StageNavProps {
  panelRefs: Record<Stage, RefObject<HTMLHeadingElement | null>>
}

export function StageNav({ panelRefs }: StageNavProps) {
  const activeStage = useAppStore((s) => s.activeStage)
  const setActiveStage = useAppStore((s) => s.setActiveStage)
  const annotations = useAppStore((s) => s.annotations)
  const categories = useAppStore((s) => s.categories)
  const themes = useAppStore((s) => s.themes)
  const codebookRows = useAppStore((s) => s.codebookRows)

  const counts: Record<Stage, number> = {
    stage1: annotations.length,
    stage2: categories.length + themes.length,
    stage3: codebookRows.length,
  }

  function switchTo(stage: Stage) {
    setActiveStage(stage)
    setTimeout(() => panelRefs[stage].current?.focus(), 50)
  }

  return (
    <nav
      aria-label="Coding stages"
      className="sticky top-[57px] z-30 border-y"
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--paper) 90%, transparent)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="mx-auto flex max-w-page px-2 md:px-8" role="tablist" aria-label="Coding stages">
        {STAGES.map((stage) => {
          const isActive = activeStage === stage.id
          return (
            <button
              key={stage.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${stage.id}`}
              id={`tab-${stage.id}`}
              onClick={() => switchTo(stage.id)}
              className="group relative flex-1 px-2 py-3 text-left transition-colors"
              style={{ borderBottom: isActive ? '3px solid var(--brick)' : '3px solid transparent' }}
            >
              <span
                className="block font-mono text-[0.62rem] tracking-wider"
                style={{ color: isActive ? 'var(--brick)' : 'var(--ink-soft)' }}
              >
                {stage.fig}
                {counts[stage.id] > 0 && (
                  <span className="ml-1.5 opacity-70">[{counts[stage.id]}]</span>
                )}
              </span>
              <span
                className="mt-0.5 block font-sans text-[0.8rem] font-semibold md:text-sm"
                style={{ color: isActive ? 'var(--ink)' : 'var(--ink-soft)' }}
              >
                <span className="hidden sm:inline">{stage.label}</span>
                <span className="sm:hidden">{stage.short}</span>
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
