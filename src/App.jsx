import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>

      <Navbar />

     <Routes>
       
     </Routes>
    </BrowserRouter>
  )
}

export default App
