import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Utility from './components/Utility'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>

      <Utility />
      <Navbar />

     <Routes>
       
     </Routes>
    </BrowserRouter>
  )
}

export default App
