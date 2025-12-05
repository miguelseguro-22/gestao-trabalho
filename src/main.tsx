// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { setupAuth } from './auth';   // < IMPORTA
setupAuth();                          // < INVOCA (semeia users, obras, etc.)

createRoot(document.getElementById('root')!).render(<App />);
