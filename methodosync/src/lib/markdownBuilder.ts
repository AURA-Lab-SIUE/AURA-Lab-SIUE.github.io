import type { Annotation, Category, Theme, CodebookRow } from '../types/annotation'
import { VARIABLE_TYPES } from '../types/annotation'
import { formatTimestamp, youtubeDeepLink, youtubeWatchUrl } from './time'

/** Escape a value for safe use inside single-quoted YAML. */
function yamlString(v: string): string {
  return `'${v.replace(/'/g, "''")}'`
}

function yamlList(items: string[]): string {
  if (items.length === 0) return ' []'
  return '\n' + items.map((i) => `  - ${yamlString(i)}`).join('\n')
}

/**
 * Stage 1 export — one clean Markdown file per coding session, written for
 * VS Code (standard Markdown, no Obsidian wikilinks). Every annotation's
 * heading is a clickable link back to the exact moment in the video.
 */
export function buildStage1Markdown(videoId: string, annotations: Annotation[]): string {
  const codedDate = new Date().toISOString().slice(0, 10)

  const allCodes: string[] = []
  const seen = new Set<string>()
  annotations.forEach((a) =>
    a.openCodes.forEach((c) => {
      if (!seen.has(c)) { seen.add(c); allCodes.push(c) }
    })
  )

  const frontmatter = [
    '---',
    `video_id: ${yamlString(videoId)}`,
    `video_url: ${yamlString(youtubeWatchUrl(videoId))}`,
    `coded_date: ${codedDate}`,
    `total_annotations: ${annotations.length}`,
    `open_codes:${yamlList(allCodes)}`,
    '---',
  ].join('\n')

  const intro = [
    `# Open coding — ${videoId}`,
    '',
    `Source: [${youtubeWatchUrl(videoId)}](${youtubeWatchUrl(videoId)})`,
    '',
    `${annotations.length} annotation${annotations.length !== 1 ? 's' : ''}. `,
    'Each timestamp links to the exact moment in the video.',
  ].join('\n')

  const sections = annotations
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((a, i) => {
      const link = youtubeDeepLink(a.videoId, a.timestamp)
      const time = formatTimestamp(a.timestamp)
      const observation = a.observationText.trim()
        ? '> ' + a.observationText.trim().replace(/\n/g, '\n> ')
        : '> *No observation recorded.*'
      const codes =
        a.openCodes.length > 0
          ? a.openCodes.map((c) => `\`${c}\``).join(' · ')
          : '*none*'
      const memo = a.analyticalMemo.trim() ? `\n\n**Memo:** ${a.analyticalMemo.trim()}` : ''
      return [
        `## ${i + 1}. [${time}](${link})`,
        '',
        observation,
        '',
        `**Open codes:** ${codes}${memo}`,
      ].join('\n')
    })

  return [frontmatter, '', intro, '', ...sections].join('\n').trimEnd() + '\n'
}

/**
 * Stage 2 export — the axial/thematic synthesis as a readable analytic memo:
 * themes → categories → the open codes clustered under each, with memos.
 */
export function buildStage2Markdown(
  categories: Category[],
  themes: Theme[]
): string {
  const catById = new Map(categories.map((c) => [c.id, c]))
  const assignedCatIds = new Set(themes.flatMap((t) => t.categoryIds))

  const lines: string[] = ['# Axial & thematic coding', '']

  themes.forEach((t) => {
    lines.push(`## Theme: ${t.label}`)
    if (t.memo.trim()) lines.push('', `${t.memo.trim()}`)
    lines.push('')
    if (t.categoryIds.length === 0) {
      lines.push('_No categories assigned yet._', '')
    }
    t.categoryIds.forEach((cid) => {
      const c = catById.get(cid)
      if (!c) return
      lines.push(`### ${c.label}`)
      if (c.memo.trim()) lines.push('', `${c.memo.trim()}`)
      lines.push('', `Open codes: ${c.openCodes.map((x) => `\`${x}\``).join(' · ') || '*none*'}`, '')
    })
  })

  const orphanCats = categories.filter((c) => !assignedCatIds.has(c.id))
  if (orphanCats.length) {
    lines.push('## Categories not yet grouped into a theme', '')
    orphanCats.forEach((c) => {
      lines.push(`### ${c.label}`)
      if (c.memo.trim()) lines.push('', `${c.memo.trim()}`)
      lines.push('', `Open codes: ${c.openCodes.map((x) => `\`${x}\``).join(' · ') || '*none*'}`, '')
    })
  }

  return lines.join('\n').trimEnd() + '\n'
}

/**
 * Stage 3 export — the codebook as a Markdown reference: a summary table plus
 * a detailed entry per variable, with anchor deep-links preserved.
 */
export function buildCodebookMarkdown(rows: CodebookRow[]): string {
  const typeLabel = (t: string) =>
    VARIABLE_TYPES.find((v) => v.value === t)?.label ?? t

  const lines: string[] = ['# Codebook', '']

  // Summary table
  lines.push('| Variable | Label | Type |', '|---|---|---|')
  rows.forEach((r) => {
    lines.push(
      `| \`${r.variableName || '—'}\` | ${r.variableLabel || '—'} | ${typeLabel(r.variableType)} |`
    )
  })
  lines.push('')

  // Detail per variable
  rows.forEach((r) => {
    lines.push(`## ${r.variableLabel || r.variableName || 'Untitled variable'}`)
    lines.push('')
    lines.push(`- **Variable name:** \`${r.variableName || '—'}\``)
    lines.push(`- **Type:** ${typeLabel(r.variableType)}`)
    if (r.definitionText.trim()) lines.push(`- **Definition:** ${r.definitionText.trim()}`)
    if (r.inclusionRules.trim()) lines.push(`- **Include when:** ${r.inclusionRules.trim()}`)
    if (r.exclusionRules.trim()) lines.push(`- **Exclude when:** ${r.exclusionRules.trim()}`)
    if (r.valuesScale.trim()) {
      lines.push('- **Values / scale:**')
      r.valuesScale.split('\n').forEach((v) => v.trim() && lines.push(`    - ${v.trim()}`))
    }
    if (r.anchorExample.trim() || r.anchorTimestamp != null) {
      const link =
        r.anchorVideoId && r.anchorTimestamp != null
          ? ` ([${formatTimestamp(r.anchorTimestamp)}](${youtubeDeepLink(r.anchorVideoId, r.anchorTimestamp)}))`
          : ''
      lines.push(`- **Anchor example:** ${r.anchorExample.trim()}${link}`)
    }
    lines.push('')
  })

  return lines.join('\n').trimEnd() + '\n'
}
