import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm tracking-wide uppercase ${
    isActive ? 'text-clay-500' : 'text-moss-700 hover:text-clay-500'
  }`

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <header className="border-b border-moss-200/60 bg-cream-50/80 backdrop-blur">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <NavLink to="/" className="font-serif text-xl text-moss-800">
            Joyce Clark
          </NavLink>
          <div className="flex flex-wrap gap-1">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/photos" className={navLinkClass}>Photos</NavLink>
            <NavLink to="/stories" className={navLinkClass}>Stories</NavLink>
            <NavLink to="/timeline" className={navLinkClass}>Timeline</NavLink>
            <NavLink to="/guestbook" className={navLinkClass}>Guestbook</NavLink>
            <NavLink to="/candles" className={navLinkClass}>Light a Candle</NavLink>
            <NavLink to="/rsvp" className={navLinkClass}>RSVP</NavLink>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-moss-200/60 py-8 text-center text-xs text-moss-700">
        In loving memory · July 8, 1936 – May 25, 2025
      </footer>
    </div>
  )
}
