import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { FollowProvider } from './components/FollowContext.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <FollowProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </FollowProvider>,
)
