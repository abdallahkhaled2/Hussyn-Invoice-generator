import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import InvoicePreview from './InvoicePreview';
import './index.css';

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {path === '/preview' ? <InvoicePreview /> : <App />}
  </React.StrictMode>
);
