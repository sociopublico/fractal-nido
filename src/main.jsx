import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.css';

const MAX_MOUNT_RETRIES = 10;

function mount(retries = 0) {
  const container = document.getElementById('mi-app-root');
  if (container) {
    createRoot(container).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    return;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mount(0));
    return;
  }
  if (retries < MAX_MOUNT_RETRIES) {
    requestAnimationFrame(() => mount(retries + 1));
    return;
  }
  console.error('Mi App: no se encontró #mi-app-root tras varios intentos.');
}

mount();
