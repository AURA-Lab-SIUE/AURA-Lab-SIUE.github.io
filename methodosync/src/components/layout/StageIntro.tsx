import type { ReactNode, RefObject } from 'react'

interface StageIntroProps {
  fig: string
  kicker: string
  title: string
  headingRef?: RefObject<HTMLHeadingElement | null>
  children?: ReactNode
}

/** Consistent stage header: FIG tag + eyebrow + title + guidance blurb. */
export function StageIntro({ fig, kicker, title, headingRef, children }: StageIntroProps) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <span className="figtag">{fig}</span>
        <span className="seclabel">{kicker}</span>
      </div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-3xl leading-tight outline-none md:text-4xl"
      >
        {title}
      </h2>
      {children && (
        <div className="mt-3 max-w-measure font-serif text-ink-soft">{children}</div>
      )}
    </div>
  )
}
