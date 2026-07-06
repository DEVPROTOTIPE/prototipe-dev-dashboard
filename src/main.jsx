import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AlertConfirmProvider } from './components/common/AlertConfirmContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AlertConfirmProvider>
      <App />
    </AlertConfirmProvider>
  </StrictMode>,
)
