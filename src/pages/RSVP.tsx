import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

type RsvpRow = {
  id: number
  name: string
  email: string | null
  attendees: number
  message: string | null
  created_at: string
}

export default function RSVP() {
  const [searchParams] = useSearchParams()
  const adminKey = searchParams.get('admin') || ''
  const isAdmin = adminKey.length > 0

  const [form, setForm] = useState({ name: '', email: '', attendees: 1, message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [rsvps, setRsvps] = useState<RsvpRow[]>([])
  const [totalAttendees, setTotalAttendees] = useState(0)
  const [adminLoading, setAdminLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    setAdminLoading(true)
    fetch('/api/rsvps', { headers: { Authorization: `Bearer ${adminKey}` } })
      .then((r) => r.json() as Promise<{ rsvps: RsvpRow[]; total_attendees: number }>)
      .then((d) => {
        setRsvps(d.rsvps || [])
        setTotalAttendees(d.total_attendees || 0)
      })
      .catch(() => {})
      .finally(() => setAdminLoading(false))
  }, [isAdmin, adminKey])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Please share your name.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setForm({ name: '', email: '', attendees: 1, message: '' })
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteRsvp = async (id: number) => {
    if (!confirm('Remove this RSVP?')) return
    const res = await fetch(`/api/rsvps/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminKey}` },
    })
    if (res.ok) {
      setRsvps((prev) => prev.filter((r) => r.id !== id))
      setTotalAttendees((prev) => prev - (rsvps.find((r) => r.id === id)?.attendees || 0))
    } else {
      alert('Delete failed (check admin key).')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <header className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-moss-800">RSVP</h2>
        <p className="mt-3 text-moss-700 italic font-serif">
          Celebration of Life for Joyce Clark
        </p>
      </header>

      <div className="bg-cream-50 border border-moss-200 rounded-sm p-6 md:p-8 mb-10 text-center shadow-sm">
        <p className="text-xs uppercase tracking-widest text-clay-500">Event Details</p>
        <p className="mt-2 font-serif text-xl text-moss-800">Sunday, September 6, 2026</p>
        <p className="mt-1 text-moss-700">1:00&#8211;5:00 p.m. ET</p>
        <p className="mt-2 text-moss-700">Winter Quarters Log Cabin</p>
        <p className="text-moss-700">Winter Quarters Drive, Pocomoke City, Maryland</p>
        <p className="mt-3 text-sm text-moss-700">
          Please let us know you'd like to attend so we can plan. Everyone who loved Joyce is welcome.
        </p>
      </div>

      <form onSubmit={submit} className="bg-cream-50 border border-moss-200 rounded-sm p-6 md:p-8 shadow-sm">
        {success && (
          <div className="mb-4 p-3 bg-moss-100 border border-moss-300 text-moss-800 text-sm rounded-sm">
            Thank you. The family has been notified.
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
            <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Email (optional)</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              maxLength={120}
              placeholder="So we can reach you with details"
              className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500"
            />
          </label>
        </div>

        <label className="block mb-4 max-w-xs">
          <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">In your party</span>
          <input
            type="number"
            min={1}
            max={20}
            value={form.attendees}
            onChange={(e) => setForm({ ...form, attendees: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
            className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500"
          />
        </label>

        <label className="block mb-4">
          <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Message (optional)</span>
          <textarea
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            maxLength={500}
            placeholder="Travel notes, dietary considerations, anything we should know"
            className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500 resize-y"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-moss-700 text-cream-50 text-xs uppercase tracking-widest hover:bg-moss-800 disabled:opacity-50 transition"
        >
          {submitting ? 'Sending…' : 'Send RSVP'}
        </button>
      </form>

      {isAdmin && (
        <section className="mt-16 border-t border-moss-200 pt-10">
          <header className="mb-6">
            <h3 className="font-serif text-2xl text-moss-800">RSVPs (admin)</h3>
            <p className="mt-1 text-sm text-moss-700">
              {adminLoading ? 'Loading…' : `${rsvps.length} responses · ${totalAttendees} attendees total`}
            </p>
          </header>

          <div className="space-y-4">
            {rsvps.map((r) => (
              <article key={r.id} className="bg-cream-50 border border-moss-200 rounded-sm p-4">
                <header className="flex flex-wrap items-baseline gap-x-3 mb-1">
                  <span className="font-medium text-moss-800">{r.name}</span>
                  {r.email && <span className="text-sm text-moss-600">{r.email}</span>}
                  <span className="text-sm text-clay-500">· {r.attendees} {r.attendees === 1 ? 'person' : 'people'}</span>
                  <span className="text-xs text-moss-500 ml-auto">
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => deleteRsvp(r.id)}
                    className="text-xs text-clay-500 hover:text-clay-700 underline"
                  >
                    Remove
                  </button>
                </header>
                {r.message && <p className="text-sm text-moss-700 whitespace-pre-line">{r.message}</p>}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
