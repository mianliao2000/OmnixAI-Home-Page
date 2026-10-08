import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/encode-sans/400.css';
import '@fontsource/encode-sans/600.css';
import '@fontsource/encode-sans/700.css';
import App from './App';
import './landing.css';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
