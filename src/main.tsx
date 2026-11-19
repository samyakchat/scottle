import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './style.css'

const root = document.getElementById('app')
if (!root) throw new Error('Scottle root element was not found.')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
