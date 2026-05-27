import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

type Story = {
  id: number
  name: string
  relationship: string | null
  title: string
  body: string
  created_at: string
}

export default function Stories() {
  const [searchParams] = useSearchParams()
  const adminKey = searchParams.get('admin') || ''
  const isAdmin = adminKey.length > 0

  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', relationship: '', title: '', body: '' })

  const load = async () => {
    try {
      const res = await fetch('/api/stories')
      const data = await res.json() as { stories: Story[] }
      setStories(data.stories || [])
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
    if (!form.name.trim() || !form.title.trim() || !form.body.trim()) {
      setError('Please share your name, a title, and your story.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setForm({ name: '', relationship: '', title: '', body: '' })
      setSuccess(true)
      load()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteStory = async (id: number) => {
    if (!confirm('Delete this story?')) return
    const res = await fetch(`/api/stories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminKey}` },
    })
    if (res.ok) {
      setStories((prev) => prev.filter((s) => s.id !== id))
    } else {
      alert('Delete failed (check admin key).')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <header className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-moss-800">Stories</h2>
        <p className="mt-3 text-moss-700 italic font-serif">
          The longer ones. A favorite memory, a turning point, a story she would have wanted told.
        </p>
      </header>

      <form onSubmit={submit} className="bg-cream-50 border border-moss-200 rounded-sm p-6 md:p-8 mb-12 shadow-sm">
        {success && (
          <div className="mb-4 p-3 bg-moss-100 border border-moss-300 text-moss-800 text-sm rounded-sm">
            Thank you. Your story has been added.
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
              placeholder="Granddaughter, neighbor, lifelong friend…"
              maxLength={80}
              className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500"
            />
          </label>
        </div>

        <label className="block mb-4">
          <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={120}
            placeholder="A few words to anchor your story"
            className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500"
          />
        </label>

        <label className="block mb-4">
          <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Your story</span>
          <textarea
            rows={10}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            maxLength={10000}
            className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500 resize-y"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-moss-700 text-cream-50 text-xs uppercase tracking-widest hover:bg-moss-800 disabled:opacity-50 transition"
        >
          {submitting ? 'Sending…' : 'Share your story'}
        </button>
      </form>

      <div className="space-y-10">
        {loading ? (
          <p className="text-center text-moss-700 italic">Loading stories…</p>
        ) : stories.length === 0 ? (
          <p className="text-center text-moss-700 italic font-serif">Be the first to share a story.</p>
        ) : (
          stories.map((s) => (
            <article key={s.id} className="border-l-4 border-clay-400 pl-5 py-2">
              <h3 className="font-serif text-2xl text-moss-800">{s.title}</h3>
              <p className="mt-2 text-moss-800 leading-relaxed whitespace-pre-line">{s.body}</p>
              <footer className="mt-3 text-sm text-moss-600 flex flex-wrap items-baseline gap-x-3">
                <span className="font-medium">{s.name}</span>
                {s.relationship && <span className="italic">· {s.relationship}</span>}
                <span className="text-xs text-moss-500">
                  {new Date(s.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => deleteStory(s.id)}
                    className="text-xs text-clay-500 hover:text-clay-700 underline ml-auto"
                  >
                    Delete
                  </button>
                )}
              </footer>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
