import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { setupAuth } from './auth';
import './index.css';

setupAuth(); // inicializa window.Auth UMA vez

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
