import type { ChatLine } from '../data/conversations'

type Props = {
  line: ChatLine
  name: string
  side: 'left' | 'right'
  current: boolean
}

export function MessageBubble({ line, name, side, current }: Props) {
  const alignment = side === 'left' ? 'self-start' : 'self-end items-end'
  const bubbleColor = side === 'left'
    ? 'rounded-bl-[5px] bg-zinc-200 text-zinc-900'
    : 'rounded-br-[5px] bg-scottle text-white'

  return (
    <li className={`flex max-w-[84%] flex-col animate-arrive ${alignment}${current ? ' current' : ''}`}>
      <span className="mx-3 mb-1 text-[11px] text-zinc-500">{name}</span>
      <p className={`m-0 [overflow-wrap:anywhere] rounded-[19px] px-3.5 py-2.5 text-[15px] leading-snug ${bubbleColor}`}>{line.text}</p>
    </li>
  )
}
