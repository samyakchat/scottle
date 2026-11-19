import { BubbleBackdrop } from './BubbleBackdrop'
import { Button } from './Button'

type Props = { title: string; onStart: () => void }

export function StartScreen({ title, onStart }: Props) {
  return (
    <section className="relative my-auto w-full max-w-[500px] pb-36 pt-16 max-[480px]:pb-32 max-[480px]:pt-12">
      <BubbleBackdrop />
      <h1 className="mb-4 text-[clamp(47px,12vw,64px)] font-bold leading-none tracking-[-3px]">
        The <span className="text-scottle">daily</span> Scottle
      </h1>
      <p className="mb-8 max-w-[355px] text-base leading-relaxed text-zinc-600">
        Watch two people conversate, and catch the message with the "second meaning"
      </p>
      <div className="grid gap-1">
        <span className="text-xs text-zinc-500">Today’s conversation...</span>
        <strong className="text-lg font-semibold">{title}</strong>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[500px] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button className="w-full justify-between gap-2" onClick={onStart} trailing={<span aria-hidden="true" className="text-xl">→</span>}>
          Start today’s game
        </Button>
        <p className="mt-3 text-center text-[11px] text-zinc-400">Only one a day like wordle</p>
      </div>
    </section>
  )
}