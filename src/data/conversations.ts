export type Speaker = 'a' | 'b'
export type ChatLine = { speaker: Speaker; text: string; isSetup: boolean; durationMs?: number }
export type Conversation = { date: string; title: string; speakers: Record<Speaker, string>; lines: ChatLine[] }

let cache: Conversation[] | null = null

export async function getConversations(): Promise<Conversation[]> {
  if (cache) return cache
  const response = await fetch('/conversations.jsonl')
  if (!response.ok) throw new Error('Could not load today’s conversation.')
  const rows = (await response.text()).split(/\r?\n/).filter(Boolean)
  cache = rows.map((row) => {
    const raw = JSON.parse(row) as { date: string; title: string; speakers: Record<Speaker, string>; lines: unknown[][] }
    return {
      date: raw.date,
      title: raw.title,
      speakers: raw.speakers,
      lines: raw.lines.map(([speaker, text, isSetup, durationMs]) => ({
        speaker: speaker as Speaker, text: String(text), isSetup: isSetup === 1,
        ...(typeof durationMs === 'number' ? { durationMs } : {}),
      })),
    }
  })
  return cache
}

export async function getConversationForDate(dateString: string): Promise<Conversation> {
  const conversations = await getConversations()
  const exact = conversations.find((conversation) => conversation.date === dateString)
  if (exact) return exact
  const day = Math.floor((Date.parse(`${dateString}T00:00:00Z`) - Date.parse('2026-11-19T00:00:00Z')) / 86_400_000)
  return conversations[((day % conversations.length) + conversations.length) % conversations.length]
}
