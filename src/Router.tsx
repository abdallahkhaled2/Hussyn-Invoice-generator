import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import App from './App';
import Dashboard from './pages/Dashboard';
import InvoicePreview from './InvoicePreview';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/preview" element={<InvoicePreview />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
