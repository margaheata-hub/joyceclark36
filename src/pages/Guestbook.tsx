import { useState, useEffect } from 'react'

type Entry = { id: number; name: string; relationship: string | null; message: string; created_at: string }

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', relationship: '', message: '' })

  const load = async () => {
    try {
      const res = await fetch('/api/guestbook')
      const data = await res.json() as { entries: Entry[] }
      setEntries(data.entries || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.message.trim()) {
      setError('Please share your name and a message.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setForm({ name: '', relationship: '', message: '' })
      setSuccess(true)
      load()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <header className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-moss-800">Guestbook</h2>
        <p className="mt-3 text-moss-700 italic font-serif">
          Share a memory, a kindness, a story. The family will treasure every word.
        </p>
      </header>

      <form onSubmit={submit} className="bg-cream-50 border border-moss-200 rounded-sm p-6 md:p-8 mb-12 shadow-sm">
        {success && (
          <div className="mb-4 p-3 bg-moss-100 border border-moss-300 text-moss-800 text-sm rounded-sm">
            Thank you. Your message has been added.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-clay-50 border border-clay-300 text-clay-600 text-sm rounded-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Your name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={80}
              className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500"
            />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Relationship (optional)</span>
            <input
              type="text"
              value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })}
              placeholder="Friend, neighbor, granddaughter…"
              maxLength={80}
              className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500"
            />
          </label>
        </div>

        <label className="block mb-4">
          <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Your message</span>
          <textarea
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            maxLength={2000}
            className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500 resize-y"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-moss-700 text-cream-50 text-xs uppercase tracking-widest hover:bg-moss-800 disabled:opacity-50 transition"
        >
          {submitting ? 'Sending…' : 'Sign the guestbook'}
        </button>
      </form>

      <div className="space-y-6">
        {loading ? (
          <p className="text-center text-moss-700 italic">Loading messages…</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-moss-700 italic font-serif">Be the first to share a memory.</p>
        ) : (
          entries.map((e) => (
            <article key={e.id} className="border-l-4 border-clay-400 pl-5 py-2">
              <p className="font-serif text-lg text-moss-800 whitespace-pre-line">{e.message}</p>
              <footer className="mt-2 text-sm text-moss-600">
                <span className="font-medium">{e.name}</span>
                {e.relationship && <span className="italic"> · {e.relationship}</span>}
                <span className="text-xs text-moss-500 ml-2">
                  {new Date(e.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </footer>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
