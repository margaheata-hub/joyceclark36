import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Guestbook from './pages/Guestbook'
import Candles from './pages/Candles'
import Photos from './pages/Photos'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/candles" element={<Candles />} />
        <Route path="/photos" element={<Photos />} />
      </Route>
    </Routes>
  )
}
