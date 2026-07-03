import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './features/auth/context/AuthContext.jsx'
import './index.css'

const appName = import.meta.env.VITE_APP_NAME || 'ResumeRAG'
document.title = appName
document.documentElement.dataset.environment = import.meta.env.VITE_ENVIRONMENT || 'development'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
