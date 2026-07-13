import type { RefObject } from 'react'
import { useState } from 'react'
import { Sparkles, Plus, Download, FileText } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { StageIntro } from '../layout/StageIntro'
import { CodebookRowCard } from './CodebookRowCard'
import { buildCodebookMarkdown } from '../../lib/markdownBuilder'
import { exportToExcel } from '../../lib/excelExporter'
import { downloadBlob } from '../../utils/downloadBlob'

interface Stage3PanelProps {
  headingRef: RefObject<HTMLHeadingElement | null>
}

export function Stage3Panel({ headingRef }: Stage3PanelProps) {
  const codebookRows = useAppStore((s) => s.codebookRows)
  const categories = useAppStore((s) => s.categories)
  const themes = useAppStore((s) => s.themes)
  const seedCodebook = useAppStore((s) => s.seedCodebook)
  const addManualRow = useAppStore((s) => s.addManualRow)
  const announce = useAppStore((s) => s.announce)
  const [busy, setBusy] = useState(false)

  const hasSources = categories.length > 0 || themes.length > 0

  function handleMarkdown() {
    const md = buildCodebookMarkdown(codebookRows)
    downloadBlob(new Blob([md], { type: 'text/markdown;charset=utf-8' }), 'codebook.md')
    announce('Codebook markdown downloaded.')
  }

  async function handleExcel() {
    setBusy(true)
    try {
      await exportToExcel(codebookRows)
      announce('Codebook spreadsheet downloaded.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <StageIntro
        fig="FIG.3"
        kicker="Operationalize"
        title="Build your quantitative codebook"
        headingRef={headingRef}
      >
        <p>
          Turn your categories and themes into <strong>measurable variables</strong>.
          Seed the codebook from your Stage 2 work, then give each variable a
          definition, a measurement type, coding rules, and an anchor example linked
          to the exact moment it came from. Export it as a spreadsheet your whole
          coding team can use.
        </p>
      </StageIntro>

      <div className="card card-pad mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans font-semibold">Seed variables from Stage 2</p>
          <p className="text-sm text-ink-soft">
            Creates one candidate variable per theme and category. Re-seeding keeps
            edits you have already made and adds anything new.
          </p>
        </div>
        <button onClick={seedCodebook} className="btn-primary" disabled={!hasSources}>
          <Sparkles size={15} aria-hidden="true" /> Seed from categories &amp; themes
        </button>
      </div>

      {!hasSources && codebookRows.length === 0 && (
        <div className="card card-pad">
          <p className="font-serif text-ink-soft">
            You have no categories or themes yet. Do some clustering in{' '}
            <strong>Stage 2</strong> first, or add a variable manually below.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {codebookRows.map((row, i) => (
          <CodebookRowCard key={row.id} row={row} index={i} />
        ))}
      </div>

      <div className="mt-6">
        <button onClick={addManualRow} className="btn-secondary">
          <Plus size={14} aria-hidden="true" /> Add a variable manually
        </button>
      </div>

      {codebookRows.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t pt-6" style={{ borderColor: 'var(--line)' }}>
          <span className="seclabel mr-auto">Export codebook</span>
          <button onClick={handleMarkdown} className="btn-secondary">
            <FileText size={14} aria-hidden="true" /> Markdown (.md)
          </button>
          <button onClick={handleExcel} className="btn-primary" disabled={busy}>
            <Download size={15} aria-hidden="true" /> {busy ? 'Building…' : 'Excel (.xlsx)'}
          </button>
        </div>
      )}
    </div>
  )
}
