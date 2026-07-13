import type { RefObject } from 'react'
import { useState } from 'react'
import { Clock, Minus, Plus, Save, Pencil, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { TokenInput } from './TokenInput'
import { formatTimestamp } from '../../lib/time'
import type { VideoPaneHandle } from './VideoPane'

interface CaptureFormProps {
  videoRef: RefObject<VideoPaneHandle | null>
}

export function CaptureForm({ videoRef }: CaptureFormProps) {
  const videoId = useAppStore((s) => s.videoId)
  const draft = useAppStore((s) => s.draft)
  const updateDraft = useAppStore((s) => s.updateDraft)
  const capturedTimestamp = useAppStore((s) => s.capturedTimestamp)
  const timestampLocked = useAppStore((s) => s.timestampLocked)
  const captureTimestamp = useAppStore((s) => s.captureTimestamp)
  const nudgeTimestamp = useAppStore((s) => s.nudgeTimestamp)
  const saveAnnotation = useAppStore((s) => s.saveAnnotation)
  const clearDraft = useAppStore((s) => s.clearDraft)
  const editingId = useAppStore((s) => s.editingAnnotationId)

  const [codeInput, setCodeInput] = useState('')

  const canSave = !!videoId && (draft.observationText.trim() !== '' || draft.openCodes.length > 0)
  const isEditing = editingId !== null

  function captureNow() {
    const t = videoRef.current?.getCurrentTime() ?? 0
    captureTimestamp(t)
    videoRef.current?.pauseVideo()
  }

  function handleSave() {
    // fold any half-typed code into the list before saving
    if (codeInput.trim()) {
      const c = codeInput.trim().replace(/,+$/, '').trim()
      if (c && !draft.openCodes.includes(c)) updateDraft({ openCodes: [...draft.openCodes, c] })
      setCodeInput('')
    }
    saveAnnotation()
  }

  return (
    <div className="card card-pad flex flex-col gap-4">
      {isEditing && (
        <div
          className="flex items-center justify-between rounded-md px-3 py-2 text-sm"
          style={{ background: 'var(--brick-wash)', color: 'var(--brick-deep)' }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Pencil size={13} aria-hidden="true" /> Editing an existing annotation
          </span>
          <button onClick={clearDraft} className="btn-ghost">
            <X size={13} aria-hidden="true" /> Cancel
          </button>
        </div>
      )}

      {/* Timestamp readout + controls */}
      <div>
        <span className="field-label">Video moment</span>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-lg"
            style={{
              background: timestampLocked ? 'var(--brick-wash)' : 'transparent',
              color: timestampLocked ? 'var(--brick-deep)' : 'var(--ink-soft)',
              border: '1px solid var(--line)',
            }}
            aria-live="polite"
          >
            <Clock size={15} aria-hidden="true" />
            {formatTimestamp(capturedTimestamp)}
          </span>
          <div className="inline-flex overflow-hidden rounded-md" style={{ border: '1px solid var(--line)' }}>
            <button onClick={() => nudgeTimestamp(-1)} className="px-2 py-1.5 hover:bg-[var(--brick-wash)]" aria-label="One second earlier" title="1s earlier">
              <Minus size={14} aria-hidden="true" />
            </button>
            <button onClick={() => nudgeTimestamp(1)} className="border-l px-2 py-1.5 hover:bg-[var(--brick-wash)]" style={{ borderColor: 'var(--line)' }} aria-label="One second later" title="1s later">
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
          <button onClick={captureNow} className="btn-secondary" disabled={!videoId}>
            <Clock size={14} aria-hidden="true" /> Capture &amp; pause
          </button>
        </div>
        {!timestampLocked && (
          <p className="mt-1.5 text-xs text-ink-soft">
            Play to the moment you want, then capture it. The captured time stays put while you write.
          </p>
        )}
      </div>

      {/* Observation */}
      <div>
        <label htmlFor="observation" className="field-label">What do you observe?</label>
        <textarea
          id="observation"
          value={draft.observationText}
          onChange={(e) => updateDraft({ observationText: e.target.value })}
          rows={3}
          placeholder="Describe what is happening at this moment, in your own words…"
          className="field-input resize-y"
        />
      </div>

      {/* Open codes */}
      <div>
        <label htmlFor="open-codes" className="field-label">Open codes</label>
        <TokenInput
          id="open-codes"
          tags={draft.openCodes}
          onChange={(tags) => updateDraft({ openCodes: tags })}
          inputValue={codeInput}
          onInputChange={setCodeInput}
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          Short labels for what is going on — one idea each. You will cluster these into categories in the next stage.
        </p>
      </div>

      {/* Memo */}
      <div>
        <label htmlFor="memo" className="field-label">Analytic memo <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
        <textarea
          id="memo"
          value={draft.analyticalMemo}
          onChange={(e) => updateDraft({ analyticalMemo: e.target.value })}
          rows={2}
          placeholder="A note to yourself — a hunch, a question, a link to theory…"
          className="field-input resize-y"
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="btn-primary" disabled={!canSave}>
          <Save size={15} aria-hidden="true" /> {isEditing ? 'Update annotation' : 'Save annotation'}
        </button>
        {!videoId && <span className="text-xs text-ink-soft">Load a video first.</span>}
      </div>
    </div>
  )
}
