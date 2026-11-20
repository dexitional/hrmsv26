// Relative codes: the staff number and a letter (14023A, 14023B, … 14023Z,
// 14023AA…), handed out in a fixed order: spouses first, then children, then
// parents, then every other relative; within each group, in the order they
// were recorded (by id). A code is the relative's place in that order.

const RELATIVE_GROUP: Record<string, number> = { SPOUSE: 0, CHILD: 1, FATHER: 2, MOTHER: 2 }

/** 1 → A, 26 → Z, 27 → AA … */
export const codeLetters = (n: number): string => (n <= 0 ? '' : codeLetters(Math.floor((n - 1) / 26)) + String.fromCharCode(65 + ((n - 1) % 26)))

/** The code every relative of one staff member should have, in order. */
export function relativeCodes<T extends { id: number; relation: string | null }>(staffNo: number, family: Array<T>): Array<T & { newCode: string }> {
  return [...family]
    .sort((a, b) => (RELATIVE_GROUP[a.relation ?? ''] ?? 3) - (RELATIVE_GROUP[b.relation ?? ''] ?? 3) || a.id - b.id)
    .map((r, i) => ({ ...r, newCode: `${staffNo}${codeLetters(i + 1)}` }))
}
