import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

document.body.style.backgroundColor = '#ffffff';
document.getElementById('root')!.style.backgroundColor = '#ffffff';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)