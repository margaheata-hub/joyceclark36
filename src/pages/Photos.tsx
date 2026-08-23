import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

type FamilyPhoto = { src: string; caption: string; era: string; family: true }
type UploadedPhoto = { id: number; filename: string; uploader_name: string; caption: string; era: string; created_at: string; family?: false }
type Photo =
  | FamilyPhoto
  | (UploadedPhoto & { src: string })

const familyPhotos: FamilyPhoto[] = [
  { src: '/photos/joyce-wedding.jpg',         caption: 'The bride',                era: 'Wedding',      family: true },
  { src: '/photos/joyce-wedding-couple.jpg',  caption: 'Wedding day',              era: 'Wedding',      family: true },
  { src: '/photos/joyce-midlife.jpg',         caption: 'Joyce',                    era: 'Mid-life',     family: true },
  { src: '/photos/joyce-with-herb.jpg',       caption: 'With Herb',                era: 'Mid-life',     family: true },
  { src: '/photos/joyce-red-shirt.jpg',       caption: 'Outside, in her element',  era: 'Later years',  family: true },
  { src: '/photos/joyce-elder.jpg',           caption: 'Smiling, always',          era: 'Later years',  family: true },
  { src: '/photos/joyce-elder-couple.jpg',    caption: 'With family',              era: 'Later years',  family: true },
  { src: '/photos/joyce-with-family.jpg',     caption: 'Generations together',     era: 'Later years',  family: true },
  { src: '/photos/joyce-porch-toast.jpg',     caption: 'A porch toast',            era: 'Later years',  family: true },
  { src: '/photos/joyce-porch-birthday.jpg',  caption: 'Cake on the porch',        era: 'Later years',  family: true },
  { src: '/photos/joyce-flowers.jpg',         caption: 'Fresh flowers',            era: 'Later years',  family: true },
  { src: '/photos/joyce-beach.jpg',           caption: 'A find on the beach',      era: 'Later years',  family: true },
  { src: '/photos/joyce-ice-cream.jpg',       caption: 'Out for ice cream',        era: 'Later years',  family: true },
  { src: '/photos/joyce-beaded-fish.jpg',     caption: 'Delighted with a gift',    era: 'Later years',  family: true },
  { src: '/photos/joyce-salon.jpg',           caption: 'Salon day',                era: 'Later years',  family: true },
  { src: '/photos/joyce-dessert.jpg',         caption: 'Dessert first',            era: 'Later years',  family: true },
  { src: '/photos/joyce-89th-birthday.jpg',   caption: 'Eighty-nine candles',      era: 'Later years',  family: true },
]

const ERAS = ['Wedding', 'Mid-life', 'Later years', 'Family', 'Other']

export default function Photos() {
  const [searchParams] = useSearchParams()
  const adminKey = searchParams.get('admin') || ''
  const isAdmin = adminKey.length > 0

  const [uploaded, setUploaded] = useState<UploadedPhoto[]>([])
  const [open, setOpen] = useState<number | null>(null)

  const load = async () => {
    try {
      const res = await fetch('/api/photos')
      const data = await res.json() as { photos: UploadedPhoto[] }
      setUploaded(data.photos || [])
    } catch {
      // ignore
    }
  }

  useEffect(() => { load() }, [])

  const photos: Photo[] = [
    ...familyPhotos,
    ...uploaded.map((u) => ({ ...u, src: `/api/photos/file/${u.filename}` })),
  ]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i! + 1) % photos.length)
      if (e.key === 'ArrowLeft')  setOpen((i) => (i! - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, photos.length])

  const deletePhoto = async (id: number) => {
    if (!confirm('Delete this photo?')) return
    const res = await fetch(`/api/photos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminKey}` },
    })
    if (res.ok) {
      setUploaded((prev) => prev.filter((p) => p.id !== id))
      setOpen(null)
    } else {
      alert('Delete failed (check admin key).')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <header className="text-center mb-12">
        <h2 className="font-serif text-4xl md:text-5xl text-moss-800">Photos</h2>
        <p className="mt-3 text-moss-700 italic font-serif">A few moments from a long, full life.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {photos.map((p, i) => (
          <button
            key={p.family ? p.src : `u-${(p as UploadedPhoto).id}`}
            onClick={() => setOpen(i)}
            className="group block overflow-hidden rounded-sm bg-moss-100 shadow-md shadow-moss-900/15 hover:shadow-xl hover:shadow-moss-900/25 transition"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={p.src}
                alt={p.caption}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500"
              />
            </div>
            <div className="px-3 py-2 text-left">
              <div className="font-serif italic text-sm text-moss-800">{p.caption}</div>
              <div className="text-[10px] uppercase tracking-widest text-clay-500">{p.era}</div>
              {!p.family && (
                <div className="text-[10px] text-moss-600 mt-1">
                  Shared by {(p as UploadedPhoto).uploader_name}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <UploadForm onUploaded={load} />

      {open !== null && (
        <div
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-50 bg-slate-ink/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <figure className="max-w-3xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[open].src}
              alt={photos[open].caption}
              className="max-w-full max-h-[80vh] object-contain rounded-sm"
            />
            <figcaption className="mt-4 text-cream-100 font-serif italic text-center">
              {photos[open].caption}
              <span className="block text-xs uppercase tracking-widest text-clay-300 mt-1">{photos[open].era}</span>
              {!photos[open].family && (
                <span className="block text-xs text-cream-300 mt-1">
                  Shared by {(photos[open] as UploadedPhoto).uploader_name}
                </span>
              )}
            </figcaption>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setOpen(null)}
                className="px-4 py-2 text-xs uppercase tracking-widest text-cream-100 border border-cream-100/40 hover:border-cream-100 rounded-sm"
              >
                Close
              </button>
              {isAdmin && !photos[open].family && (
                <button
                  onClick={() => deletePhoto((photos[open] as UploadedPhoto).id)}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-clay-200 border border-clay-400/50 hover:border-clay-300 hover:text-clay-100 rounded-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </figure>
        </div>
      )}
    </div>
  )
}

function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploader_name, setUploaderName] = useState('')
  const [caption, setCaption] = useState('')
  const [era, setEra] = useState(ERAS[2])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!file) return setError('Please choose a photo.')
    if (!uploader_name.trim()) return setError('Please share your name.')
    if (!caption.trim()) return setError('Please add a short caption.')

    const form = new FormData()
    form.append('photo', file)
    form.append('uploader_name', uploader_name.trim())
    form.append('caption', caption.trim())
    form.append('era', era)

    setSubmitting(true)
    try {
      const res = await fetch('/api/photos', { method: 'POST', body: form })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(errorMessage(data.error))
        return
      }
      setFile(null)
      setUploaderName('')
      setCaption('')
      setEra(ERAS[2])
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSuccess(true)
      onUploaded()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-16 border-t border-moss-200 pt-12">
      <header className="text-center mb-8">
        <h3 className="font-serif text-2xl md:text-3xl text-moss-800">Share a photo</h3>
        <p className="mt-2 text-moss-700 italic font-serif">
          If you have a photo of Joyce, add it here. The family will see it.
        </p>
      </header>

      <form onSubmit={submit} className="max-w-2xl mx-auto bg-cream-50 border border-moss-200 rounded-sm p-6 md:p-8 shadow-sm">
        {success && (
          <div className="mb-4 p-3 bg-moss-100 border border-moss-300 text-moss-800 text-sm rounded-sm">
            Thank you. Your photo has been added.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-clay-50 border border-clay-300 text-clay-600 text-sm rounded-sm">
            {error}
          </div>
        )}

        <label className="block mb-4">
          <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-moss-800 file:mr-3 file:px-3 file:py-2 file:border-0 file:bg-moss-700 file:text-cream-50 file:text-xs file:uppercase file:tracking-widest file:cursor-pointer"
          />
          <span className="block text-xs text-moss-600 mt-1">JPEG, PNG, WebP or GIF. Up to 10 MB.</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Your name</span>
            <input
              type="text"
              value={uploader_name}
              onChange={(e) => setUploaderName(e.target.value)}
              maxLength={80}
              className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500"
            />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Era</span>
            <select
              value={era}
              onChange={(e) => setEra(e.target.value)}
              className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500"
            >
              {ERAS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
        </div>

        <label className="block mb-4">
          <span className="block text-xs uppercase tracking-widest text-moss-700 mb-1">Caption</span>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            placeholder="A short description"
            className="w-full border border-moss-200 bg-white px-3 py-2 text-moss-900 focus:outline-none focus:border-moss-500"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-moss-700 text-cream-50 text-xs uppercase tracking-widest hover:bg-moss-800 disabled:opacity-50 transition"
        >
          {submitting ? 'Uploading…' : 'Share photo'}
        </button>
      </form>
    </section>
  )
}

function errorMessage(code: string | undefined): string {
  switch (code) {
    case 'missing_file': return 'Please choose a photo.'
    case 'missing_fields': return 'Please fill in name, caption, and era.'
    case 'unsupported_type': return 'Please use JPEG, PNG, WebP, or GIF.'
    case 'too_large': return 'Photo is too large (max 10 MB).'
    case 'empty_file': return 'The file looks empty.'
    case 'storage_error': return 'Upload failed. Please try again.'
    case 'db_error': return 'Upload failed. Please try again.'
    default: return 'Something went wrong. Please try again.'
  }
}
