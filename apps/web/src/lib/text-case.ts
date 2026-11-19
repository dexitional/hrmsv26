// The legacy HR data stores people's names (and many free-text fields) in
// capitals. These turn them into readable case for display.

const LOWER_PARTICLES = new Set(['de', 'da', 'van', 'von', 'der', 'del', 'la', 'le', 'of', 'and', 'for', 'the', 'in', 'on', 'at'])
/** Acronyms kept in capitals wherever they appear (unit names, mostly). */
const ACRONYMS = new Set(['UCC', 'ICT', 'IT', 'HR', 'DHR', 'NSS', 'SRC', 'DRIC', 'CoDE', 'ATM', 'UK', 'USA', 'GH'])
const ROMAN = /^(i{1,3}|iv|v|vi{0,3}|ix|x)$/i

/** "Dr. (MRS.) AMA SERWAA MENSAH-BONSU" → "Dr. (Mrs.) Ama Serwaa Mensah-Bonsu". */
export function properName(value: string | null | undefined): string | null | undefined {
  if (!value) return value
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, i) => {
      const bare = word.replace(/[^A-Za-z]/g, '')
      if (ROMAN.test(bare) && bare.length > 1) return word.toUpperCase()
      // "(CERED)", "(DICTS)": bracketed all-capital abbreviations stay as they are.
      if (/^\([A-Z&]{2,8}\)[.,;:]?$/.test(word)) return word
      if (ACRONYMS.has(bare.toUpperCase()) && word === word.toUpperCase()) return word
      if (i > 0 && LOWER_PARTICLES.has(word.toLowerCase())) return word.toLowerCase()
      // Capitalise after the start, a hyphen, an apostrophe, a bracket or "Mc".
      return word
        .toLowerCase()
        .replace(/(^|[-'’(/.])([a-z])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
        .replace(/^Mc([a-z])/, (_m, ch: string) => `Mc${ch.toUpperCase()}`)
    })
    .join(' ')
}

/** "FAILURE TO REPORT FOR DUTY. NEGLIGENCE" → "Failure to report for duty. Negligence". */
export function sentenceCase(value: string | null | undefined): string | null | undefined {
  if (!value) return value
  // Leave text that is already in mixed case alone.
  if (value !== value.toUpperCase()) return value
  return value.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)([a-z])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
}
