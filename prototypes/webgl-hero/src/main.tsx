import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Experience } from './components/Experience'
import './styles.css'

createRoot(document.getElementById('root')!).render(<StrictMode><Experience /></StrictMode>)
