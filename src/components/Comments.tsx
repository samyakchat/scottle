import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Filter } from 'bad-words'
import { MessageCircle } from 'lucide-react'
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { getLocalDate } from '../config'
import { Button } from './Button'
import { Modal } from './Modal'

type Comment = { id: string; name: string; text: string; score: number }
const filter = new Filter()
const fieldClass = 'w-full mt-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-scottle focus:outline-none focus:ring-2 focus:ring-scottle/15'

function dayBounds(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const start = new Date(year, month - 1, day)
  const end = new Date(year, month - 1, day + 1)
  return [Timestamp.fromDate(start), Timestamp.fromDate(end)] as const
}

function storageGet(key: string) {
  try { return localStorage.getItem(key) } catch { return null }
}

export function Comments({ date = getLocalDate(), score = 0, showPrompt = false }: { date?: string; score?: number; showPrompt?: boolean }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [resolvedThisSession, setResolvedThisSession] = useState(false)
  const prompted = useRef(false)
  const hasCommentedToday = posted || storageGet(`hasCommented-${date}`) === 'true'
  const resolvedKey = `commentPromptResolved-${date}`
  const promptResolved = resolvedThisSession || hasCommentedToday || storageGet('neverShowCommentsPrompt') === 'true' || storageGet(resolvedKey) === 'true'

  useEffect(() => {
    if (!showPrompt || prompted.current || promptResolved) return
    prompted.current = true
    setOpen(true)
  }, [showPrompt, promptResolved])

  useEffect(() => {
    if (!open) return
    const [start, end] = dayBounds(date)
    const commentsQuery = query(
      collection(db, 'comments'),
      where('createdAt', '>=', start),
      where('createdAt', '<', end),
      orderBy('createdAt', 'desc'),
      limit(50),
    )
    setLoadError('')
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      setComments(snapshot.docs.map((item) => {
        const data = item.data()
        return { id: item.id, name: String(data.name ?? ''), text: String(data.text ?? ''), score: typeof data.score === 'number' ? data.score : 0 }
      }).sort((a, b) => b.score - a.score))
    }, () => setLoadError('Comments could not be loaded right now.'))
    return unsubscribe
  }, [date, open])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim() || 'Anonymous'
    const cleanText = text.trim()
    if (cleanName.length > 30) { setError('Name must be 30 characters or fewer.'); return }
    if (!cleanText) { setError('Please write a comment first.'); return }
    if (cleanText.length > 300) { setError('Comment must be 300 characters or fewer.'); return }
    setError('')
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'comments'), {
        name: filter.clean(cleanName),
        text: filter.clean(cleanText),
        score,
        createdAt: serverTimestamp(),
      })
      try {
        localStorage.setItem(`hasCommented-${date}`, 'true')
        localStorage.setItem(resolvedKey, 'true')
      } catch { /* Storage is optional. */ }
      setPosted(true)
      setText('')
      setName('')
    } catch {
      setError('Your comment could not be posted. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function dismissPrompt() {
    try { localStorage.setItem(resolvedKey, 'true') } catch { /* Storage is optional. */ }
    setResolvedThisSession(true)
    setOpen(false)
  }

  function neverShowAgain() {
    try {
      localStorage.setItem('neverShowCommentsPrompt', 'true')
      localStorage.setItem(resolvedKey, 'true')
    } catch { /* Storage is optional. */ }
    setResolvedThisSession(true)
    setOpen(false)
  }

  return (
    <>
      {showPrompt && promptResolved && (
        <Button
          variant="plain"
          className="size-9 rounded-full border border-zinc-200 text-[15px] text-zinc-600 hover:bg-zinc-100"
          aria-label="View comments"
          onClick={() => setOpen(true)}
        >
          <MessageCircle size={16} strokeWidth={1.75} aria-hidden="true" />
        </Button>
      )}
      {open && (
        <Modal
          title={promptResolved? "Todays comments": "Add a comment for today"}
          eyebrow="Today’s Scottle"
          onClose={dismissPrompt}
          showCloseButton
        >
          {!promptResolved ? (
            <form onSubmit={(event) => void submit(event)}>
              <label className="mb-3 block space-y-1.5 text-xs font-medium text-zinc-600">
                Name
                <input
                  className={fieldClass}
                  value={name}
                  maxLength={30}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Anonymous"
                />
              </label>
              <label className="block space-y-1.5 text-xs font-medium text-zinc-600">
                Your comment
                <textarea
                  className={`${fieldClass} min-h-20 resize-y mt-1`}
                  required
                  maxLength={300}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="say something"
                />
              </label>
              {error && (
                <p role="alert" className="mt-2 text-xs text-red-700">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="mt-3 w-full"
              >
                {submitting ? "Posting…" : "Post Publicly"}
              </Button>
              <Button
                type="button"
                variant="plain"
                onClick={neverShowAgain}
                className="mt-2 min-h-9 w-full py-4 rounded-xl border border-zinc-200 px-4 text-[13px] text-zinc-600 hover:bg-zinc-50"
              >
                Never show ts again
              </Button>
            </form>
          ) : (
            <>
              {loadError ? (
                <p role="status" className="text-sm text-zinc-500">
                  {loadError}
                </p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-zinc-400">No comments yet.</p>
              ) : (
                <ul className="max-h-[60vh] space-y-3 overflow-y-auto">
                  {comments.map((comment) => (
                    <li
                      key={comment.id}
                      className="border-b border-zinc-100 pb-3 text-sm"
                    >
                      <strong className="mb-1 block text-xs font-semibold text-zinc-700">
                        {comment.name}
                        <span className="ml-2 font-semibold text-green-700">{comment.score}</span>
                      </strong>
                      <p className="whitespace-pre-wrap break-words text-zinc-600">
                        {comment.text}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Modal>
      )}
    </>
  );
}
