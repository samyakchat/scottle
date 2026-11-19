import { totalScore } from '../game/scoring'

export type SetupResult = {
  lineIndex: number;
  text: string;
  points: number;
  elapsedMs: number | null;
};

export type GameResult = {
  date: string;
  puzzle: number;
  score: number;
  invalidPresses: number;
  setups: SetupResult[];
};

type State = {
  results: Record<string, GameResult>;
  inProgress: Record<
    string,
    {
      startedAt: number;
      points: Record<number, SetupResult>;
      invalidPresses: number;
    }
  >;
};

const KEY = 'scottle-state-v1'
const emptyState = (): State => ({ results: {}, inProgress: {} })

function read(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<State>
    return { results: parsed.results ?? {}, inProgress: parsed.inProgress ?? {} }
  } catch { return emptyState() }
}
function write(state: State): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    //nogin
  }
}

export function getResult(date: string): GameResult | null {
  return read().results[date] ?? null;
}
export function getProgress(date: string) {
  return read().inProgress[date] ?? null;
}
export function startAttempt(date: string): void {
  const state = read()
  if (!state.results[date] && !state.inProgress[date])
    state.inProgress[date] = {
      startedAt: Date.now(),
      points: {},
      invalidPresses: 0,
    };
  write(state)
}
export function saveProgress(date: string, points: Record<number, SetupResult>, 
  invalidPresses: number): void {
  const state = read(); const previous = state.inProgress[date]
  if (previous) { previous.points = points; previous.invalidPresses = invalidPresses; write(state) }
}
export function finishAttempt(result: GameResult): void {
  const state = read(); state.results[result.date] = result; 
  delete state.inProgress[result.date]; write(state)
}
export function makeResult(date: string, puzzle: number, setups: SetupResult[], invalidPresses: number): GameResult {
  return {date, puzzle, setups, invalidPresses, 
     score: totalScore(setups.map((setup) => setup.points),
      invalidPresses) }
}
export function streaks(date: string): { current: number; best: number } {
  const results = read().results
  const completed = new Set(Object.keys(results))
  const previousDate = (key: string) => {
    const d = new Date(`${key}T12:00:00`);
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  let current = 0; let cursor = completed.has(date) ? date : previousDate(date)
  while (completed.has(cursor)) { current++; cursor = previousDate(cursor) }
  let best = 0
  for (const key of completed) {
    let count = 0; let day = key
    while (completed.has(day)) { count++; day = previousDate(day) }
    best = Math.max(best, count)
  }
  return { current, best }
}
