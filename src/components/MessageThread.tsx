import type { ChatLine, Conversation } from '../data/conversations'
import { MessageBubble } from './MessageBubble'

type Props = {
  conversation: Conversation
  lines: ChatLine[]
  currentLine: number
  score: number
  feedback: { id: number; text: string; kind: 'good' | 'bad' } | null
}

export function MessageThread({ conversation, lines, currentLine, score, feedback }: Props) {
  const contact = conversation.speakers.a

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label={`Conversation with ${contact}`}>
      <div className="flex min-h-12 items-center justify-between border-zinc-100 px-1">
        <div className="flex items-center gap-0.5 text-scottle" aria-hidden="true">
          <span className="-mt-1 text-[34px] font-light leading-none">‹</span>
          <span className="text-sm">Messages</span>
        </div>
        <div className="relative flex items-center gap-2 rounded-full  px-3 py-1.5 ">
          <strong className="font-mono text-[20px] font-semibold tabular-nums text-zinc-900">{score}<small className="ml-0.5 text-[9px] font-normal text-zinc-500">/500</small></strong>
          {feedback && <span key={feedback.id} className={`absolute -right-1 -top-5 z-10 text-[25px] font-bold animate-score-rise ${feedback.kind === 'good' ? 'text-green-700' : 'text-red-700'}`} aria-live="polite">{feedback.text}</span>}
        </div>
      </div>
      <header className="flex min-h-[86px] flex-col items-center justify-center gap-0.5 border-b border-zinc-100">
        <div className="size-[39px] overflow-hidden rounded-full bg-gradient-to-b from-slate-300 to-slate-400" aria-hidden="true">
          <svg className="block size-full" viewBox="0 0 48 48" focusable="false">
            <circle cx="24" cy="19" r="9.5" fill="white" />
            <path d="M5 52c0-12 8.5-20 19-20s19 8 19 20z" fill="white" />
          </svg>
        </div>
        <strong className="text-[13px] font-semibold text-zinc-700">{contact}</strong>
        <span className="text-[10px] text-zinc-500">iMessage</span>
      </header>
      <ol className="flex max-h-[calc(100svh-370px)] min-h-[220px] flex-1 flex-col justify-end gap-2 overflow-auto overscroll-contain py-5 [scrollbar-color:#d1d1d6_transparent] [scrollbar-width:thin] max-[480px]:max-h-[calc(100svh-360px)]" aria-live="polite" aria-relevant="additions">
        {lines.length > 0 && <li className="my-2 self-center rounded-full bg-zinc-100 px-3 py-1 text-[10px] text-zinc-500">Today</li>}
        {lines.map((line, index) => (
          <MessageBubble
            key={index}
            line={line}
            name={conversation.speakers[line.speaker]}
            side={line.speaker === 'a' ? 'left' : 'right'}
            current={index === currentLine}
          />
        ))}
      </ol>
    </section>
  )
}
