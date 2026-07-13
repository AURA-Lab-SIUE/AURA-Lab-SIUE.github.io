import type { RefObject } from 'react'
import { Plus, Download } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { StageIntro } from '../layout/StageIntro'
import { CodeBank } from './CodeBank'
import { CategoryCard } from './CategoryCard'
import { ThemeCard } from './ThemeCard'
import { buildStage2Markdown } from '../../lib/markdownBuilder'
import { downloadBlob } from '../../utils/downloadBlob'

interface Stage2PanelProps {
  headingRef: RefObject<HTMLHeadingElement | null>
}

export function Stage2Panel({ headingRef }: Stage2PanelProps) {
  const categories = useAppStore((s) => s.categories)
  const themes = useAppStore((s) => s.themes)
  const addCategory = useAppStore((s) => s.addCategory)
  const addTheme = useAppStore((s) => s.addTheme)
  const setActiveStage = useAppStore((s) => s.setActiveStage)
  const announce = useAppStore((s) => s.announce)

  function handleExport() {
    const md = buildStage2Markdown(categories, themes)
    downloadBlob(new Blob([md], { type: 'text/markdown;charset=utf-8' }), 'axial-thematic-coding.md')
    announce('Axial coding markdown downloaded.')
  }

  return (
    <div>
      <StageIntro
        fig="FIG.2"
        kicker="Second-cycle coding"
        title="Cluster codes into categories & themes"
        headingRef={headingRef}
      >
        <p>
          Now step back from the tape. Group your open codes into{' '}
          <strong>categories</strong> (axial coding — codes that share a property),
          then group categories into <strong>themes</strong> (the bigger patterns
          your theory helps you name). This is where analysis happens, and where
          your quantitative variables come from.
        </p>
      </StageIntro>

      <CodeBank />

      {/* Categories */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="seclabel">Categories · axial coding</p>
          <button onClick={() => addCategory('New category')} className="btn-secondary">
            <Plus size={14} aria-hidden="true" /> New category
          </button>
        </div>
        {categories.length === 0 ? (
          <div className="card card-pad">
            <p className="font-serif text-ink-soft">
              No categories yet. Create one here, or use “Assign to category → ＋ New
              category…” on any code in the bank above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        )}
      </div>

      {/* Themes */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="seclabel">Themes · selective coding</p>
          <button onClick={() => addTheme('New theme')} className="btn-secondary" disabled={categories.length === 0}>
            <Plus size={14} aria-hidden="true" /> New theme
          </button>
        </div>
        {themes.length === 0 ? (
          <div className="card card-pad">
            <p className="font-serif text-ink-soft">
              Themes are optional but powerful: they gather related categories into
              the overarching patterns you will report. Add one once you have a few
              categories.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {themes.map((t) => (
              <ThemeCard key={t.id} theme={t} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button onClick={handleExport} className="btn-ghost" disabled={categories.length === 0}>
          <Download size={14} aria-hidden="true" /> Download axial coding (.md)
        </button>
        <button
          onClick={() => setActiveStage('stage3')}
          className="btn-primary"
          disabled={categories.length === 0 && themes.length === 0}
        >
          Next: build your codebook →
        </button>
      </div>
    </div>
  )
}
