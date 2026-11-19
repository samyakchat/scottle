export const FIRST_LINE_MS = 3200
export const LAST_LINE_MS = 1100
export const FIRST_LINE_ORIENTATION_BONUS_MS = 500
export const LONG_LINE_THRESHOLD = 40
export const LONG_LINE_BONUS_PER_CHARACTER_MS = 30
export const INVALID_PRESS_PENALTY = 20
export const MAX_SCORE = 500
export const EPOCH_DATE = '2026-11-19'

export function getLocalDate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getPuzzleNumber(dateString: string): number {
  return Math.floor((Date.parse(`${dateString}T00:00:00Z`) - Date.parse(`${EPOCH_DATE}T00:00:00Z`)) / 86_400_000) + 1
}

export function getLineDuration(index: number, total: number, text: string, override?: number): number {
  const base = override ?? FIRST_LINE_MS + (LAST_LINE_MS - FIRST_LINE_MS) * (index / Math.max(1, total - 1))
    + (index === 0 ? FIRST_LINE_ORIENTATION_BONUS_MS : 0)
    + Math.max(0, text.length - LONG_LINE_THRESHOLD) * LONG_LINE_BONUS_PER_CHARACTER_MS
  return Math.round(base)
}
