import { useAppStore } from './store/useAppStore'
import { AppHeader, StageNav, LiveRegion } from './components/layout/Chrome'
import { NextStep } from './components/layout/NextStep'
import { SearchLogPanel } from './components/search/SearchLogPanel'
import { SourcesPanel } from './components/sources/SourcesPanel'
import { ReviewPanel } from './components/review/ReviewPanel'
import { GapsPanel } from './components/gaps/GapsPanel'
import { SynthesisPanel } from './components/synthesis/SynthesisPanel'

export default function App() {
  const stage = useAppStore((s) => s.stage)
  return (
    <>
      <a href="#main" className="sr-only">Skip to main content</a>
      <AppHeader />
      <NextStep />
      <StageNav />
      <main id="main" className="mx-auto max-w-page px-4 md:px-6 py-6">
        {stage === 1 && <SearchLogPanel />}
        {stage === 2 && <SourcesPanel />}
        {stage === 3 && <ReviewPanel />}
        {stage === 4 && <GapsPanel />}
        {stage === 5 && <SynthesisPanel />}
      </main>
      <footer
        className="mx-auto max-w-page px-4 md:px-6 py-8 text-xs"
        style={{ color: 'var(--ink-soft)' }}
      >
        <p className="max-w-measure">
          LitMap follows Chapter 4 of <em>Vibes to Variables</em>. Everything runs in your
          browser: your reading is saved on this device and is never uploaded. Save a project
          file to move your work between computers, or to carry it into{' '}
          <a className="link-underline" style={{ color: 'var(--brick)' }} href="/methodosync/">
            MethodoSync
          </a>{' '}
          when you start coding.
        </p>
        <p className="mt-3">
          It cannot tell you whether you searched well, and it cannot tell you whether your
          question matters. Those are still yours and your instructor's.
        </p>
      </footer>
      <LiveRegion />
    </>
  )
}
