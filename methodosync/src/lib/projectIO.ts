import type { ProjectFile } from '../types/annotation'
import { downloadBlob } from '../utils/downloadBlob'

interface ProjectSnapshot {
  videoUrl: string
  videoId: string | null
  annotations: ProjectFile['annotations']
  categories: ProjectFile['categories']
  themes: ProjectFile['themes']
  codebookRows: ProjectFile['codebookRows']
}

/** Serialize the current project to a portable .json file the student keeps. */
export function exportProject(snapshot: ProjectSnapshot): void {
  const project: ProjectFile = {
    app: 'methodosync',
    version: 2,
    savedAt: new Date().toISOString(),
    ...snapshot,
  }
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json',
  })
  const stamp = new Date().toISOString().slice(0, 10)
  const name = snapshot.videoId ? `${snapshot.videoId}-${stamp}` : `methodosync-${stamp}`
  downloadBlob(blob, `${name}.methodosync.json`)
}

/** Parse and validate a project file the student re-opens. */
export function parseProject(text: string): ProjectFile {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON. Choose a .methodosync.json project file.')
  }
  const p = data as Partial<ProjectFile>
  if (!p || p.app !== 'methodosync' || !Array.isArray(p.annotations)) {
    throw new Error('That does not look like a MethodoSync project file.')
  }
  return {
    app: 'methodosync',
    version: 2,
    savedAt: p.savedAt ?? new Date().toISOString(),
    videoUrl: p.videoUrl ?? '',
    videoId: p.videoId ?? null,
    annotations: p.annotations ?? [],
    categories: p.categories ?? [],
    themes: p.themes ?? [],
    codebookRows: p.codebookRows ?? [],
  }
}
