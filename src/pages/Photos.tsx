import { useState, useEffect } from 'react'

type Photo = { src: string; caption: string; era: string }

const photos: Photo[] = [
  { src: '/photos/joyce-wedding.jpg',         caption: 'The bride',                era: 'Wedding' },
  { src: '/photos/joyce-wedding-couple.jpg',  caption: 'Wedding day',              era: 'Wedding' },
  { src: '/photos/joyce-midlife.jpg',         caption: 'Joyce',                    era: 'Mid-life' },
  { src: '/photos/joyce-with-herb.jpg',       caption: 'With Herb',                era: 'Mid-life' },
  { src: '/photos/joyce-red-shirt.jpg',       caption: 'Outside, in her element',  era: 'Later years' },
  { src: '/photos/joyce-elder.jpg',           caption: 'Smiling, always',          era: 'Later years' },
  { src: '/photos/joyce-elder-couple.jpg',    caption: 'With family',              era: 'Later years' },
]

export default function Photos() {
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i! + 1) % photos.length)
      if (e.key === 'ArrowLeft')  setOpen((i) => (i! - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <header className="text-center mb-12">
        <h2 className="font-serif text-4xl md:text-5xl text-moss-800">Photos</h2>
        <p className="mt-3 text-moss-700 italic font-serif">A few moments from a long, full life.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {photos.map((p, i) => (
          <button
            key={p.src}
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
            </div>
          </button>
        ))}
      </div>

      <p className="mt-12 text-center text-moss-700 italic font-serif">
        Family will be adding more. If you have a photo of Joyce you'd like included,
        send it to the family.
      </p>

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
            </figcaption>
            <button
              onClick={() => setOpen(null)}
              className="mt-4 px-4 py-2 text-xs uppercase tracking-widest text-cream-100 border border-cream-100/40 hover:border-cream-100 rounded-sm"
            >
              Close
            </button>
          </figure>
        </div>
      )}
    </div>
  )
}
