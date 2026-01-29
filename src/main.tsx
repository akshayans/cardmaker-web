import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import App from './App'
import CreateCard from './CreateCard'
import ViewCard from './ViewCard'
import Last from './Last'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/create" element={<CreateCard />} />
        <Route path="/card/:cardId" element={<ViewCard />} />
        <Route path="/card/:cardId/last" element={<Last />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
