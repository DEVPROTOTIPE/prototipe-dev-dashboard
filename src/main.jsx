import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AlertConfirmProvider } from './components/common/AlertConfirmContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AlertConfirmProvider>
        <App />
      </AlertConfirmProvider>
    </BrowserRouter>
  </StrictMode>,
)
