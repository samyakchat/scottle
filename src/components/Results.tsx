import { useEffect, useState } from 'react'
import type { GameResult } from '../storage/storage'
import { Button } from './Button'

type Props = { result: GameResult; currentStreak: number; bestStreak: number; title: string }

function pointsEmoji(points: number): string {
  if (points >= 80) return '🟩'
  if (points >= 60) return '🟨'
  if (points > 0) return '🟧'
  return '⬛'
}
function pointsColor(points: number): string {
  if (points >= 80) return 'bg-emerald-500'
  if (points >= 60) return 'bg-yellow-400'
  if (points > 0) return 'bg-orange-400'
  return 'bg-zinc-800'
}

function getcurrentstreaktotal(currentStreak: number) {
  return Math.ceil(currentStreak / 10) * 10;
}

function decimal(currentStreak: number) {
  return currentStreak/(getcurrentstreaktotal(currentStreak))*100
}

function timetomidnight(): string {
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const seconds = Math.max(0, Math.floor((midnight.getTime() - Date.now()) / 1000))
  return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

const resultRow = 'flex items-start gap-3 border-b border-zinc-200 py-3.5'

export function Results({ result, currentStreak, bestStreak }: Props) {
  const [countdown, setCountdown] = useState(timetomidnight)
  const [copied, setCopied] = useState(false)
  const setups = [...result.setups].sort((a, b) => a.lineIndex - b.lineIndex)
  const emojis = setups.map(({ points }) => pointsEmoji(points)).join('')
  const penalty = result.invalidPresses * 20

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(timetomidnight()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function share() {
    const text = `Scottle #${result.puzzle}  ${result.score}/500\n${emojis}\n${result.invalidPresses} misclicks · Streak: ${currentStreak}`
    try {
      if (navigator.share) await navigator.share({ text })
      else await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      try { await navigator.clipboard.writeText(text); setCopied(true) } catch {}
    }
  }

  return (
    <section className="py-10 max-[480px]:pt-[34px]">
      <h1 className="mb-1 mt-6 text-[74px] font-semibold leading-none tracking-[-5px] max-[480px]:text-[66px]">
        {result.score}
        <span className="text-[22px] font-normal tracking-normal text-zinc-400">
          {" "}
          / 500
        </span>
      </h1>
      <p className="mb-[22px] text-zinc-600">
        {result.score >= 250
          ? "Freaky freak."
          : result.score >= 150
            ? "A few good catches."
            : "There’s always tomorrow."}
      </p>
      <div className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white ring-1 ring-black/[0.02]">
        <div className="flex items-center justify-between bg-zinc-900 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-100">
            Scottle <span className="text-zinc-500">#{result.puzzle}</span>
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-zinc-200">
            {Math.round(result.score / 5)}%
          </span>
        </div>

        <div className="px-4 pb-5 pt-4">
          <div className="mb-4 flex items-baseline gap-1.5">
            <span className="text-4xl font-bold leading-none tracking-tight text-zinc-900 tabular-nums">
              {result.score}
            </span>
            <span className="text-sm font-medium text-zinc-400">/ 500</span>
          </div>

          <div
            className="flex gap-2"
            role="img"
            aria-label={`Results: ${emojis}`}
          >
            {setups.map((setup) => (
              <div
                key={setup.lineIndex}
                className={`aspect-square max-w-12 flex-1 rounded-xl shadow-sm ${pointsColor(setup.points)}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/80 px-4 py-2.5 text-xs text-zinc-500">
          <span>
            {result.invalidPresses} misclick
            {result.invalidPresses === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1.5">
            Streak
            <strong className="rounded-md bg-zinc-900 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
              {currentStreak}
            </strong>
          </span>
        </div>
      </div>
      <Button
        variant="plain"
        className="flex min-h-11 w-full justify-between gap-2 rounded-xl border border-zinc-200 px-4 text-[13px] text-zinc-700 hover:bg-zinc-50"
        onClick={() => void share()}
        trailing={<span aria-hidden="true">↗</span>}
      >
        {copied ? "Copied your score" : "Share your score"}
      </Button>
      <div className="mt-[31px]">
        <div className="border-b border-zinc-200 pb-3 text-[10px] tracking-[1px] text-zinc-500">
          DID U GET IT?
        </div>
        {setups.map((setup) => (
          <article className={resultRow} key={setup.lineIndex}>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[13px] leading-snug">“{setup.text}”</p>
              <small className="mt-1 block text-[11px] text-zinc-500">
                {setup.elapsedMs === null
                  ? "Missed"
                  : `Caught in ${setup.elapsedMs / 1000} seconds`}
              </small>
            </div>
            <strong
              className={`whitespace-nowrap text-xs ${setup.points ? "text-green-700" : "text-zinc-400"}`}
            >
              {setup.points ? `${setup.points} pts` : "Missed"}
            </strong>
          </article>
        ))}
      </div>
      <div className="flex justify-between border-b border-zinc-200 py-3.5 text-xs text-zinc-500">
        {result.invalidPresses} wrong{" "}
        {result.invalidPresses === 1 ? "press" : "presses"}{" "}
        <span className="font-mono font-medium tabular-nums text-red-700">
          −{penalty} points
        </span>
      </div>
      <div className=" justify-center items-center flex gap-2 py-4 text-sm text-zinc-600">
        
        <div 
        style={{background: `linear-gradient(to right, #94CEEA ${decimal(currentStreak)}%, transparent ${decimal(currentStreak)}%)`,}}
        className="flex-1 items-center border border-zinc-200 py-3 px-4 rounded-lg
        
        ">
          <strong className="text-zinc-900">{currentStreak}/{getcurrentstreaktotal(currentStreak)}</strong> day streak
        </div>
        <div className="flex-1 items-center border border-zinc-200 py-3 px-4 rounded-lg">
          Best <strong className="text-zinc-900">{bestStreak}</strong>
        </div>
      </div>
      <div className="border-t border-zinc-200 pt-4 text-center font-normal text-[10px] tracking-[1px] text-zinc-500">
        NEXT SCOTTLE IN{" "}
        <strong className="ml-2 font-mono text-[11px] font-normal tabular-nums tracking-normal text-zinc-700">
          {countdown}
        </strong>
      </div>
    </section>
  );
}
