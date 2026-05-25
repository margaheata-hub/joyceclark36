import { useState, useEffect } from 'react'

type Candle = { id: number; name: string; created_at: string }

export default function Candles() {
  const [candles, setCandles] = useState<Candle[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [justLit, setJustLit] = useState(false)

  const load = async () => {
    try {
      const res = await fetch('/api/candles')
      const data = await res.json() as { candles: Candle[]; count: number }
      setCandles(data.candles || [])
      setCount(data.count || 0)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const light = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/candles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        setName('')
        setJustLit(true)
        load()
        setTimeout(() => setJustLit(false), 4000)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <header className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-moss-800">Light a Candle</h2>
        <p className="mt-3 text-moss-700 italic font-serif">
          A small flame, in her memory.
        </p>
      </header>

      <div className="bg-cream-50 border border-moss-200 rounded-sm p-8 mb-10 text-center shadow-sm">
        <div className="text-6xl mb-3" aria-hidden="true">
          {justLit ? '🕯️✨' : '🕯️'}
        </div>
        <div className="text-3xl font-serif text-moss-800">
          {loading ? '…' : count.toLocaleString()}
        </div>
        <div className="text-xs uppercase tracking-widest text-moss-600 mt-1">
          {count === 1 ? 'candle lit' : 'candles lit'}
        </div>

        <form onSubmit={light} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            className="flex-1 border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500"
          />
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="px-5 py-2 bg-clay-400 text-cream-50 text-xs uppercase tracking-widest hover:bg-clay-500 disabled:opacity-50 transition"
          >
            {submitting ? 'Lighting…' : 'Light a candle'}
          </button>
        </form>
      </div>

      {candles.length > 0 && (
        <>
          <h3 className="text-center font-serif text-xl text-moss-800 mb-4">Recently lit by</h3>
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-moss-700">
            {candles.map((c) => (
              <li key={c.id} className="font-serif italic">
                {c.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
