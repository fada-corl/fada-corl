import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/tokens.css'
import '../styles/global.css'
import { TimelineV2Page } from './TimelineV2Page'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TimelineV2Page />
  </StrictMode>,
)
