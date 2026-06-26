import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Report from './pages/Report'
import Dashboard from './pages/Dashboard'
import Map from './pages/Map'
import AIAssistant from './pages/AIAssistant'
import Authority from './pages/Authority'
import Leaderboard from './pages/Leaderboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<Map />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/authority" element={<Authority />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  )
}

export default App