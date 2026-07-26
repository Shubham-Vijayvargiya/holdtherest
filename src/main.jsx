import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // The app remains fully functional if service-worker registration is unavailable.
    });
  });
}
