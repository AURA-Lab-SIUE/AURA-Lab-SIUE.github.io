import ExcelJS from 'exceljs'
import type { CodebookRow } from '../types/annotation'
import { VARIABLE_TYPES } from '../types/annotation'
import { downloadBlob } from '../utils/downloadBlob'
import { formatTimestamp, youtubeDeepLink } from './time'

const typeLabel = (t: string) =>
  VARIABLE_TYPES.find((v) => v.value === t)?.label ?? t

/**
 * Exports the codebook to a styled .xlsx workbook in the AURA Lab palette
 * (warm paper, brick header). One row per variable, with a live hyperlink on
 * the anchor example so a coder can jump to the exact moment in the video.
 */
export async function exportToExcel(rows: CodebookRow[]): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'MethodoSync — AURA Lab @ SIUE'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Codebook', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  sheet.columns = [
    { header: 'Variable Name',            key: 'variableName',   width: 22 },
    { header: 'Variable Label',           key: 'variableLabel',  width: 28 },
    { header: 'Type',                     key: 'variableType',   width: 20 },
    { header: 'Definition',               key: 'definitionText', width: 38 },
    { header: 'Coding Rules — Inclusion', key: 'inclusionRules', width: 34 },
    { header: 'Coding Rules — Exclusion', key: 'exclusionRules', width: 34 },
    { header: 'Values / Scale',           key: 'valuesScale',    width: 30 },
    { header: 'Anchor Example',           key: 'anchorExample',  width: 40 },
  ]

  // Header row — brick fill, white bold.
  const headerRow = sheet.getRow(1)
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA8322A' } }
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 }
    cell.alignment = { vertical: 'middle', wrapText: true }
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF872619' } } }
  })
  headerRow.height = 28

  rows.forEach((row, index) => {
    const dataRow = sheet.addRow({
      variableName:   row.variableName,
      variableLabel:  row.variableLabel,
      variableType:   typeLabel(row.variableType),
      definitionText: row.definitionText,
      inclusionRules: row.inclusionRules,
      exclusionRules: row.exclusionRules,
      valuesScale:    row.valuesScale,
      anchorExample:  row.anchorExample,
    })

    // Warm alternating fill: bone paper / white.
    const fillColor = index % 2 === 0 ? 'FFF6F3EC' : 'FFFFFFFF'
    dataRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { vertical: 'top', wrapText: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } }
      cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF1E1B18' } }
    })

    // Make the anchor a live hyperlink to the exact video moment.
    if (row.anchorVideoId && row.anchorTimestamp != null) {
      const anchorCell = dataRow.getCell('anchorExample')
      const label = row.anchorExample.trim() || 'Watch moment'
      const stamp = formatTimestamp(row.anchorTimestamp)
      anchorCell.value = {
        text: `${label} (${stamp})`,
        hyperlink: youtubeDeepLink(row.anchorVideoId, row.anchorTimestamp),
      }
      anchorCell.font = { name: 'Calibri', size: 11, color: { argb: 'FFA8322A' }, underline: true }
    }

    dataRow.height = 64
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  downloadBlob(blob, 'methodosync-codebook.xlsx')
}
