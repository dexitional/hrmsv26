// A minimal Excel (.xlsx) writer, so exports need no extra dependency: one
// worksheet with a bold, frozen, filtered header row, inline strings, numbers
// kept as numbers, and column widths fitted to the content. An .xlsx file is a
// zip of a few XML parts; the zip is built here with deflate from node:zlib.
import { deflateRawSync } from 'node:zlib'

type Cell = string | number | null | undefined

const esc = (v: string) =>
  v
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** A1-style column letters: 0 → A, 25 → Z, 26 → AA. */
const col = (i: number): string => (i < 26 ? String.fromCharCode(65 + i) : col(Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)))

function sheetXml(header: Array<string>, rows: Array<Array<Cell>>) {
  const widths = header.map((h, i) => Math.min(60, Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length)) + 2))
  const cell = (v: Cell, ref: string, style = 0) => {
    if (v === null || v === undefined || v === '') return ''
    const s = style ? ` s="${style}"` : ''
    // Numbers stay numbers, except long digit strings (phone numbers, IDs with leading zeros).
    if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"${s}><v>${v}</v></c>`
    return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${esc(String(v))}</t></is></c>`
  }
  const last = `${col(header.length - 1)}${rows.length + 1}`
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    `<dimension ref="A1:${last}"/>` +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` +
    '<sheetData>' +
    `<row r="1">${header.map((h, i) => cell(h, `${col(i)}1`, 1)).join('')}</row>` +
    rows.map((r, ri) => `<row r="${ri + 2}">${r.map((v, i) => cell(v, `${col(i)}${ri + 2}`)).join('')}</row>`).join('') +
    '</sheetData>' +
    `<autoFilter ref="A1:${last}"/>` +
    '</worksheet>'
  )
}

const STYLES =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
  '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFEDEDED"/><bgColor indexed="64"/></patternFill></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  '</styleSheet>'

// ------------------------------------------------------------ zip

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf: Buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function zip(files: Array<{ name: string; data: string }>) {
  const local: Array<Buffer> = []
  const central: Array<Buffer> = []
  let offset = 0
  for (const f of files) {
    const name = Buffer.from(f.name)
    const raw = Buffer.from(f.data, 'utf8')
    const body = deflateRawSync(raw)
    const crc = crc32(raw)
    const head = Buffer.alloc(30)
    head.writeUInt32LE(0x04034b50, 0)
    head.writeUInt16LE(20, 4)
    head.writeUInt16LE(0x0800, 6) // UTF-8 names
    head.writeUInt16LE(8, 8) // deflate
    head.writeUInt32LE(0, 10) // time/date
    head.writeUInt32LE(crc, 14)
    head.writeUInt32LE(body.length, 18)
    head.writeUInt32LE(raw.length, 22)
    head.writeUInt16LE(name.length, 26)
    head.writeUInt16LE(0, 28)
    local.push(head, name, body)
    const dir = Buffer.alloc(46)
    dir.writeUInt32LE(0x02014b50, 0)
    dir.writeUInt16LE(20, 4)
    dir.writeUInt16LE(20, 6)
    dir.writeUInt16LE(0x0800, 8)
    dir.writeUInt16LE(8, 10)
    dir.writeUInt32LE(0, 12)
    dir.writeUInt32LE(crc, 16)
    dir.writeUInt32LE(body.length, 20)
    dir.writeUInt32LE(raw.length, 24)
    dir.writeUInt16LE(name.length, 28)
    dir.writeUInt32LE(offset, 42)
    central.push(dir, name)
    offset += head.length + name.length + body.length
  }
  const centralBuf = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(centralBuf.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...local, centralBuf, end])
}

/** One-sheet workbook. Sheet names are limited to 31 characters and some symbols. */
export function buildXlsx(sheetName: string, header: Array<string>, rows: Array<Array<Cell>>): Buffer {
  const name = esc(sheetName.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Sheet1')
  return zip([
    {
      name: '[Content_Types].xml',
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        '</Types>',
    },
    {
      name: '_rels/.rels',
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>',
    },
    {
      name: 'xl/workbook.xml',
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        `<sheets><sheet name="${name}" sheetId="1" r:id="rId1"/></sheets>` +
        `<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${name}'!$A$1:$${col(header.length - 1)}$${rows.length + 1}</definedName></definedNames>` +
        '</workbook>',
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        '</Relationships>',
    },
    { name: 'xl/styles.xml', data: STYLES },
    { name: 'xl/worksheets/sheet1.xml', data: sheetXml(header, rows) },
  ])
}

export const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
