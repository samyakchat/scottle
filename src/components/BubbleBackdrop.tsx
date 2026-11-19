const bubbles = [
  { side: 'left', w: 180, h: 44 },
  { side: 'right', w: 120, h: 44 },
  { side: 'left', w: 230, h: 68 },
  { side: 'right', w: 160, h: 44 },
  { side: 'left', w: 90, h: 44 },
  { side: 'right', w: 210, h: 68 },
  { side: 'left', w: 150, h: 44 },
  { side: 'right', w: 100, h: 44 },
] as const

export function BubbleBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
    >
      <div className="mx-auto flex h-full max-w-[500px] flex-col justify-center gap-3 px-4">
        {bubbles.map((b, i) => {
          const left = b.side === 'left'
          return (
            <div
              key={i}
              className={`max-w-[80%] animate-[bubble-loop_10s_ease-out_infinite] motion-reduce:animate-none ${
                left
                  ? 'self-start origin-bottom-left rounded-[19px] rounded-bl-[5px] bg-zinc-200/70'
                  : 'self-end origin-bottom-right rounded-[19px] rounded-br-[5px] bg-scottle/20'
              }`}
              style={{ width: b.w, height: b.h, animationDelay: `${i * 1.2}s` }}
            />
          )
        })}
      </div>
    </div>
  )
}