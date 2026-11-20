import type { ReactNode } from 'react'
import { Button } from './Button'

type Props = { title: string; eyebrow: string; onClose: () => void; children: ReactNode; showCloseButton?: boolean }

export function Modal({ title, onClose, children, showCloseButton = false }: Props) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-zinc-900/40 p-[22px] animate-fade" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="relative w-full max-w-[410px] rounded-2xl bg-white p-8 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {showCloseButton && <button type="button" onClick={onClose} aria-label="Close comments" className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-xl leading-none text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">×</button>}
        <h2 id="modal-title" className="my-4 text-[29px] font-semibold tracking-tight">{title}</h2>
        {children}
      </section>
    </div>
  )
}

const modalCopy = 'my-3 text-sm leading-relaxed text-zinc-600'
const modalAction = 'mt-3 w-full'

export function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal eyebrow="Directions" title="How to play" onClose={onClose}>
      <p className={modalCopy}>Two people are chatting. Five lines are setups for “that’s what she said.” Press the button as soon as you spot one.</p>
      <p className={modalCopy}>The earlier you press, the more points you earn. The chat speeds up as the setups get subtler.</p>
      <p className={modalCopy}>Wrong presses cost 20 points, so don’t spam. A new chat arrives every day.</p>
      <Button className={modalAction} onClick={onClose}>Got it</Button>
    </Modal>
  )
}

export function StatsModal({ current, best, games, onClose }: { current: number; best: number; games: number; onClose: () => void }) {
  return (
    <Modal eyebrow="Daily statistics overall" title="The long game" onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 py-4">
        <div className="flex flex-col gap-1"><strong className="text-[28px]">{current}</strong><span className="text-[10px] text-zinc-500">current streak</span></div>
        <div className="flex flex-col gap-1"><strong className="text-[28px]">{best}</strong><span className="text-[10px] text-zinc-500">best streak</span></div>
        <div className="flex flex-col gap-1"><strong className="text-[28px]">{games}</strong><span className="text-[10px] text-zinc-500">games played</span></div>
      </div>
      <Button className={modalAction} onClick={onClose}>Close</Button>
    </Modal>
  )
}
