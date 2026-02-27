import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MapScreen from './screens/MapScreen/MapScreen.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MapScreen />
  </StrictMode>,
)
