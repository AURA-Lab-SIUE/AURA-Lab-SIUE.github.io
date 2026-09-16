// The live fig04-1: distinct relevant sources found as the search proceeds.
//
// Inline SVG, no chart library. The curve is a step function because a source
// either added something or it did not; drawing it smooth would imply
// measurement between sources that does not exist.

import type { SaturationReport } from '../../lib/saturation'

const W = 640
const H = 260
const PAD = { top: 18, right: 16, bottom: 34, left: 40 }

export function SaturationChart({ report }: { report: SaturationReport }) {
  const { curve } = report
  const n = curve.length
  const maxY = Math.max(1, curve[n - 1]?.distinct ?? 1)

  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const xAt = (i: number) => PAD.left + (n <= 1 ? 0 : (i / n) * plotW)
  const yAt = (v: number) => PAD.top + plotH - (v / maxY) * plotH

  // Step path: hold the previous height across the source, then rise.
  const d: string[] = []
  if (n > 0) {
    d.push(`M ${xAt(0)} ${yAt(0)}`)
    let prev = 0
    curve.forEach((p, i) => {
      d.push(`L ${xAt(i)} ${yAt(prev)}`)
      d.push(`L ${xAt(i)} ${yAt(p.distinct)}`)
      d.push(`L ${xAt(i + 1)} ${yAt(p.distinct)}`)
      prev = p.distinct
    })
  }

  // The flat tail: the run of most recent sources that added nothing.
  let flatFrom = n
  for (let i = n - 1; i >= 0; i--) {
    if (curve[i].kept) break
    flatFrom = i
  }
  const flatRun = n - flatFrom

  const yTicks = Array.from({ length: Math.min(maxY, 5) + 1 }, (_, i) =>
    Math.round((i * maxY) / Math.min(maxY, 5))
  ).filter((v, i, a) => a.indexOf(v) === i)

  if (n === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
        The curve appears once you have logged a source.
      </p>
    )
  }

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Saturation curve. ${report.keptCount} distinct sources kept across ${report.examinedCount} examined. ${report.headline}`}
      >
        {/* y grid */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left} x2={W - PAD.right} y1={yAt(v)} y2={yAt(v)}
              stroke="var(--line)" strokeWidth="1"
            />
            <text
              x={PAD.left - 8} y={yAt(v) + 4} textAnchor="end"
              fontSize="11" fill="var(--ink-soft)" fontFamily="var(--font-mono, monospace)"
            >
              {v}
            </text>
          </g>
        ))}

        {/* flat tail shading */}
        {flatRun >= 3 && (
          <rect
            x={xAt(flatFrom)} y={PAD.top}
            width={Math.max(0, xAt(n) - xAt(flatFrom))} height={plotH}
            fill="var(--brick)" opacity="0.10"
          />
        )}

        {/* the curve */}
        <path d={d.join(' ')} fill="none" stroke="var(--brick)" strokeWidth="2.25"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* markers for sources that were set aside */}
        {curve.map((p, i) =>
          p.kept ? null : (
            <circle key={i} cx={xAt(i + 0.5)} cy={yAt(p.distinct)} r="2.5"
              fill="var(--paper)" stroke="var(--ink-soft)" strokeWidth="1.25" />
          )
        )}

        {/* axes */}
        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH}
          stroke="var(--ink-soft)" strokeWidth="1" />
        <text x={PAD.left} y={H - 8} fontSize="11" fill="var(--ink-soft)">1</text>
        <text x={W - PAD.right} y={H - 8} fontSize="11" fill="var(--ink-soft)" textAnchor="end">
          {n} examined
        </text>
        <text
          x={PAD.left + plotW / 2} y={H - 8} fontSize="11"
          fill="var(--ink-soft)" textAnchor="middle"
        >
          sources examined, in order
        </text>
      </svg>
      <figcaption className="mt-2 text-xs" style={{ color: 'var(--ink-soft)' }}>
        Distinct sources kept as the search proceeds. Hollow markers are sources you examined
        and set aside. When the line goes flat and stays flat, the searching is done.
        {flatRun >= 3 && ' The shaded stretch is where nothing new has turned up.'}
      </figcaption>
    </figure>
  )
}
