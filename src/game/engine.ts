import { getLineDuration } from '../config'
import { pointsForPress } from './scoring'
import type { Conversation } from '../data/conversations'

export type PressResult = { valid: boolean; points: number; lineIndex: number }
export function durationForLine(conversation: Conversation, index: number): number {
  const line = conversation.lines[index]
  return getLineDuration(index, conversation.lines.length, line.text, line.durationMs)
}

export function judgePress(conversation: Conversation, lineIndex: number, elapsed: number, scored: Set<number>): PressResult {
  const line = conversation.lines[lineIndex]
  if (!line?.isSetup || scored.has(lineIndex) || elapsed < 0 || elapsed >= durationForLine(conversation, lineIndex)) {
    return { valid: false, points: 0, lineIndex }
  }
  return { valid: true, points: pointsForPress(elapsed, durationForLine(conversation, lineIndex)), lineIndex }
}
