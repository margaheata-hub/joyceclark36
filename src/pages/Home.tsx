const heroes = [
  { src: '/photos/joyce-wedding.jpg', caption: 'A bride on Long Island' },
  { src: '/photos/joyce-midlife.jpg', caption: 'The years she loved most' },
  { src: '/photos/joyce-elder.jpg',   caption: 'Still smiling, always' },
]

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      <header className="text-center mb-12 md:mb-16">
        <p className="font-serif italic text-moss-600 text-lg">In loving memory of</p>
        <h1 className="font-serif text-5xl md:text-7xl text-moss-800 mt-2">
          Joyce Clark
        </h1>
        <p className="mt-4 text-moss-700 tracking-widest text-sm uppercase">
          July 8, 1936 &nbsp;·&nbsp; May 25, 2025
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
        {heroes.map((h) => (
          <figure key={h.src} className="flex flex-col items-center">
            <div className="overflow-hidden rounded-sm shadow-lg shadow-moss-900/20 bg-moss-100">
              <img
                src={h.src}
                alt={h.caption}
                className="w-full h-full object-cover aspect-[3/4]"
              />
            </div>
            <figcaption className="font-serif italic text-moss-700 text-center mt-3 text-sm">
              {h.caption}
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="max-w-2xl mx-auto text-center space-y-6">
        <p className="font-serif text-xl md:text-2xl leading-relaxed text-moss-800">
          She would stop the car for a beautiful rock,
          reverse for a wild bird, and outrun anyone who tried to keep up.
        </p>

        <p className="text-moss-700 leading-relaxed">
          Gram to Dan, Karen, and Andrew. GG to Sky, Aspen, Camden, and Josie.
          She lived many lives &mdash; in Manchester, Florida, Germany, Long Island,
          and Pocomoke City &mdash; and carried every one of them with her.
        </p>

        <p className="text-moss-700 leading-relaxed">
          She was preceded by her daughter Dana, her sister Betty Sue, her brother David,
          her first husband Eddie, her second husband and the love of her life Herb,
          and her third husband Joe.
        </p>
      </section>

      <div className="mt-16 text-center">
        <a
          href="/guestbook"
          className="inline-block px-6 py-3 bg-moss-700 text-cream-50 rounded-sm
                     text-sm uppercase tracking-widest hover:bg-moss-800 transition"
        >
          Leave a memory
        </a>
      </div>
    </div>
  )
}
