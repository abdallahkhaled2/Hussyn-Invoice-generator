import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import App from './App';
import Dashboard from './pages/Dashboard';
import InvoicePreview from './InvoicePreview';

const RouterContent: React.FC = () => {
  const location = useLocation();
  const showNavigation = location.pathname !== '/preview';

  return (
    <>
      {showNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/preview" element={<InvoicePreview />} />
      </Routes>
    </>
  );
};

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
};

export default Router;
