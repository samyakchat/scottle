import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChartNoAxesColumnIncreasing, CircleQuestionMark } from 'lucide-react'
import { getLocalDate, getLineDuration, getPuzzleNumber } from './config'
import { getConversationForDate, type Conversation } from './data/conversations'
import { judgePress } from './game/engine'
import { totalScore } from './game/scoring'
import { finishAttempt, getProgress, getResult, makeResult, saveProgress, startAttempt, streaks, type GameResult, type SetupResult } from './storage/storage'
import { Button } from './components/Button'
import { CatWaterfall } from './components/CatWaterfall'
import { HowToPlayModal, StatsModal } from './components/Modal'
import { MessageThread } from './components/MessageThread'
import { Results } from './components/Results'
import { StartScreen } from './components/StartScreen'
import { Comments } from './components/Comments'

type Screen = 'start' | 'playing' | 'celebrating' | 'results'
type ModalName = 'help' | 'stats' | null
type Feedback = { id: number; text: string; kind: 'good' | 'bad' }

function pastResults(): Record<string, GameResult> {
  try {
    return JSON.parse(localStorage.getItem('scottle-state-v1') ?? '{"results":{}}').results ?? {}
  } catch {
    return {}
  }
}

export default function App() {
  const date = useMemo(getLocalDate, [])
  const puzzle = getPuzzleNumber(date)
  const dateLabel = useMemo(
    () => new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00`)),
    [date],
  )

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loadError, setLoadError] = useState('')
  const [screen, setScreen] = useState<Screen>('start')
  const [modal, setModal] = useState<ModalName>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [currentLine, setCurrentLine] = useState(-1)
  const [lineProgress, setLineProgress] = useState(0)
  const [scored, setScored] = useState<Record<number, SetupResult>>({})
  const [invalidPresses, setInvalidPresses] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [catRain, setCatRain] = useState(false)
  const [catRainKey, setCatRainKey] = useState(0)

  const beginTime = useRef(0)
  const currentLineRef = useRef(-1)
  const scoredRef = useRef<Record<number, SetupResult>>({})
  const invalidRef = useRef(0)
  const endedRef = useRef(false)
  const celebrationTimer = useRef<number | undefined>(undefined)
  const feedbackTimer = useRef<number | undefined>(undefined)
  const catRainTimer = useRef<number | undefined>(undefined)
  const feedbackId = useRef(0)

  const runningScore = totalScore(Object.values(scored).map((setup) => setup.points), invalidPresses)
  const streak = streaks(date)

  useEffect(() => {
    let active = true
    void getConversationForDate(date).then((loaded) => {
      if (!active) return
      setConversation(loaded)

      const savedResult = getResult(date)
      if (savedResult) {
        setResult(savedResult)
        setScreen('results')
        return
      }

      const progress = getProgress(date)
      if (progress) {
        const savedPoints = progress.points
        const setups = loaded.lines.flatMap((line, index) => line.isSetup
          ? [savedPoints[index] ?? { lineIndex: index, text: line.text, points: 0, elapsedMs: null }]
          : [])
        const recovered = makeResult(date, puzzle, setups, progress.invalidPresses)
        finishAttempt(recovered)
        setResult(recovered)
        setScreen('results')
        return
      }

      try {
        if (localStorage.getItem('scottle-seen-help') !== '1') {
          setModal('help')
          localStorage.setItem('scottle-seen-help', '1')
        }
      } catch { /* Storage is optional. */ }
    }).catch((error: unknown) => {
      if (active) setLoadError(error instanceof Error ? error.message : 'Could not load today’s game.')
    })
    return () => { active = false }
  }, [date, puzzle])

  const endGame = useCallback(() => {
    if (!conversation || endedRef.current) return
    endedRef.current = true
    const setups = conversation.lines.flatMap((line, index) => line.isSetup
      ? [scoredRef.current[index] ?? { lineIndex: index, text: line.text, points: 0, elapsedMs: null }]
      : [])
    const completed = makeResult(date, puzzle, setups, invalidRef.current)
    setResult(completed)
    setScreen('celebrating')
    celebrationTimer.current = window.setTimeout(() => {
      finishAttempt(completed)
      setScreen('results')
    }, 2400)
  }, [conversation, date, puzzle])

  useEffect(() => {
    if (screen !== 'playing' || !conversation) return
    let animationFrame = 0
    const tick = () => {
      const now = performance.now()
      let index = currentLineRef.current
      const lineStart = (lineIndex: number) => beginTime.current + conversation.lines
        .slice(0, lineIndex)
        .reduce((sum, _, previousIndex) => sum + getLineDuration(previousIndex, conversation.lines.length, conversation.lines[previousIndex].text, conversation.lines[previousIndex].durationMs), 0)

      while (index < conversation.lines.length && now >= lineStart(index) + getLineDuration(index, conversation.lines.length, conversation.lines[index].text, conversation.lines[index].durationMs)) index++
      if (index >= conversation.lines.length) {
        endGame()
        return
      }
      if (index !== currentLineRef.current) {
        currentLineRef.current = index
        setCurrentLine(index)
      }
      const duration = getLineDuration(index, conversation.lines.length, conversation.lines[index].text, conversation.lines[index].durationMs)
      setLineProgress(Math.min(1, Math.max(0, (now - lineStart(index)) / duration)))
      animationFrame = requestAnimationFrame(tick)
    }

    animationFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrame)
  }, [screen, conversation, endGame])

  useEffect(() => () => {
    if (celebrationTimer.current !== undefined) window.clearTimeout(celebrationTimer.current)
    if (feedbackTimer.current !== undefined) window.clearTimeout(feedbackTimer.current)
    if (catRainTimer.current !== undefined) window.clearTimeout(catRainTimer.current)
  }, [])

  const replayCatWaterfall = useCallback(() => {
    setCatRain(true)
    setCatRainKey((key) => key + 1)
    if (catRainTimer.current !== undefined) window.clearTimeout(catRainTimer.current)
    catRainTimer.current = window.setTimeout(() => setCatRain(false), 2400)
  }, [])

  const startGame = () => {
    const progress = getProgress(date)
    if (progress && conversation) {
      const setups = conversation.lines.flatMap((line, index) => line.isSetup
        ? [progress.points[index] ?? { lineIndex: index, text: line.text, points: 0, elapsedMs: null }]
        : [])
      const recovered = makeResult(date, puzzle, setups, progress.invalidPresses)
      finishAttempt(recovered)
      setResult(recovered)
      setScreen('results')
      return
    }

    startAttempt(date)
    endedRef.current = false
    beginTime.current = performance.now()
    currentLineRef.current = 0
    scoredRef.current = {}
    invalidRef.current = 0
    setScored({})
    setInvalidPresses(0)
    setCurrentLine(0)
    setLineProgress(0)
    setScreen('playing')
  }

  const press = useCallback(() => {
    if (screen !== 'playing' || !conversation || endedRef.current) return
    const now = performance.now()
    let index = currentLineRef.current
    const lineStart = (lineIndex: number) => beginTime.current + conversation.lines
      .slice(0, lineIndex)
      .reduce((sum, _, previousIndex) => sum + getLineDuration(previousIndex, conversation.lines.length, conversation.lines[previousIndex].text, conversation.lines[previousIndex].durationMs), 0)
    while (index < conversation.lines.length && now >= lineStart(index) + getLineDuration(index, conversation.lines.length, conversation.lines[index].text, conversation.lines[index].durationMs)) index++
    if (index >= conversation.lines.length) {
      endGame()
      return
    }
    if (index !== currentLineRef.current) {
      currentLineRef.current = index
      setCurrentLine(index)
    }

    const verdict = judgePress(conversation, index, now - lineStart(index), new Set(Object.keys(scoredRef.current).map(Number)))
    let kind: Feedback['kind']
    let text: string
    if (verdict.valid) {
      const updated = {
        ...scoredRef.current,
        [index]: { lineIndex: index, text: conversation.lines[index].text, points: verdict.points, elapsedMs: Math.round(now - lineStart(index)) },
      }
      scoredRef.current = updated
      setScored(updated)
      text = `+${verdict.points}`
      kind = 'good'
    } else {
      invalidRef.current += 1
      setInvalidPresses(invalidRef.current)
      text = '−20'
      kind = 'bad'
    }

    saveProgress(date, scoredRef.current, invalidRef.current)
    const id = ++feedbackId.current
    setFeedback({ id, text, kind })
    if (feedbackTimer.current !== undefined) window.clearTimeout(feedbackTimer.current)
    feedbackTimer.current = window.setTimeout(() => setFeedback(null), 900)
  }, [screen, conversation, date, endGame])

  const pointerPress = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    press()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modal) setModal(null)
      if (event.code === 'KeyP' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement) && !(event.target instanceof HTMLElement && event.target.isContentEditable)) {
        event.preventDefault()
        replayCatWaterfall()
      }
      if ((event.code === 'Space' || event.code === 'Enter') && screen === 'playing' && !(event.target instanceof HTMLButtonElement) && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault()
        press()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [modal, screen, press, replayCatWaterfall])

  if (loadError) {
    return <main className="m-auto max-w-[420px] py-12"><a className="text-[23px] font-bold tracking-tight text-zinc-900 no-underline" href="#">scottle</a><h1 className="mt-8 text-4xl font-semibold">A little pause.</h1><p className="leading-relaxed text-zinc-600">{loadError}</p></main>
  }
  if (!conversation) return <main className="m-auto text-sm text-zinc-500" aria-live="polite">Loading today’s chat…</main>

  const visibleLines = screen === 'playing' ? conversation.lines.slice(0, currentLine + 1) : []
  const showResults = (screen === 'celebrating' || screen === 'results') && result !== null

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-zinc-200">
        <a className="text-[23px] font-bold tracking-[-1px] text-zinc-900 no-underline" href="#" aria-label="Scottle home">scottle</a>
              <small className="text-sm text-zinc-500">{dateLabel}</small>

        <nav className="flex gap-2" aria-label="Game menu">
          <Button variant="plain" className="size-9 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100" aria-label="Statistics" onClick={() => setModal('stats')}><ChartNoAxesColumnIncreasing size={16} strokeWidth={1.75} aria-hidden="true" /></Button>
          <Button variant="plain" className="size-9 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100" aria-label="How to play" onClick={() => setModal('help')}><CircleQuestionMark size={16} strokeWidth={1.75} aria-hidden="true" /></Button>
          <Comments date={date} score={result?.score ?? 0} showPrompt={screen === 'results' && result !== null} />
        </nav>
      </header>
      <main className="flex flex-1 flex-col">
        {screen === 'start' && <StartScreen title={conversation.title} onStart={startGame} />}
        {screen === 'playing' && (
          <>
            <MessageThread conversation={conversation} lines={visibleLines} currentLine={currentLine} score={runningScore} feedback={feedback} />
            <div className="h-0.5 overflow-hidden bg-zinc-100" aria-hidden="true"><div className="h-full w-full origin-left bg-scottle transition-transform duration-75" style={{ transform: `scaleX(${1 - lineProgress})` }} /></div>
            <div className="pb-[max(20px,env(safe-area-inset-bottom))] pt-[17px] text-center">
              <Button className={`min-h-16 w-full rounded-[15px] text-base ${feedback?.kind === 'good' ? 'bg-green-700 animate-press' : feedback?.kind === 'bad' ? 'bg-red-700 animate-shake' : ''}`} aria-label="That’s what she said" onPointerDown={pointerPress} onClick={(event) => { if (event.detail === 0) press() }}>
                That’s what she said
              </Button>
              <p className="mt-2 text-[11px] text-zinc-400">or press <kbd className="rounded border border-zinc-300 px-1 py-0.5 font-mono text-[10px] text-zinc-500">space</kbd></p>
            </div>
          </>
        )}
        {showResults && result && <Results result={result} currentStreak={streak.current} bestStreak={streak.best} title={conversation.title} />}
      </main>

      {(screen === 'celebrating' || catRain) && <CatWaterfall key={catRainKey} />}
      {modal === 'help' && <HowToPlayModal onClose={() => setModal(null)} />}
      {modal === 'stats' && <StatsModal current={streak.current} best={streak.best} games={Object.keys(pastResults()).length} onClose={() => setModal(null)} />}
    </div>
  )
}
