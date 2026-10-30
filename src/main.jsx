import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

try { localStorage.removeItem('__clerk_environment'); } catch { /* sem acesso ao armazenamento */ }

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)