import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChatProvider } from './store/chatStore.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </StrictMode>,
)
