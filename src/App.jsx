import { Route, Routes } from 'react-router-dom'
import './App.css'
import PlayerApp from './PlayerApp'
import AdminApp from './AdminApp'
import Summaryplayer from './Summaryplayer'



function App() {
  return (
    <Routes>
        <Route path="/" exact element={<PlayerApp/>} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/summary" element={<Summaryplayer/>} />
    </Routes>
  )
}

export default App
