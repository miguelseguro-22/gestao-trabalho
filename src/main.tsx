// main.tsx ou index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { setupAuth } from './auth' // ⬅️ IMPORTAR

// ⬅️ INICIALIZAR O window.Auth ANTES DE RENDERIZAR
setupAuth()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)