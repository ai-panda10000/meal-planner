import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { migrateMeals } from './lib/storage'

// 📝 Run migration before the app renders
// This adds the new "dish_category" field to any existing meals
// that were saved before this feature was added
migrateMeals();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
