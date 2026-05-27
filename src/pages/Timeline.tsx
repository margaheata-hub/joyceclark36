export default function Timeline() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <header className="text-center mb-12">
        <h2 className="font-serif text-4xl md:text-5xl text-moss-800">A Life in Moments</h2>
        <p className="mt-3 text-moss-700 italic font-serif">
          Born in 1936. Lived in five places. Loved by many.
        </p>
      </header>

      <div className="bg-cream-50 border border-moss-200 rounded-sm p-8 text-center shadow-sm">
        <p className="font-serif text-lg text-moss-800">
          A full timeline of Joyce's life is coming.
        </p>
        <p className="mt-3 text-moss-700">
          We're collecting dates, places, and stories from family so this page reflects all of who she was.
          Check back soon.
        </p>
        <p className="mt-6 text-sm text-moss-600">
          Have a milestone or date you remember? Share it on the{' '}
          <a href="/stories" className="text-clay-500 hover:text-clay-700 underline">Stories</a> page.
        </p>
      </div>
    </div>
  )
}
