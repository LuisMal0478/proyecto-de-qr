import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import DashboardLayout from './components/Layout/DashboardLayout';

// Páginas Públicas
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';

// Páginas del Dashboard
import Dashboard from './pages/Dashboard';
import QRGeneratorPage from './pages/QRGeneratorPage';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Pricing from './pages/Pricing';
import PaymentResponse from './pages/PaymentResponse';
import EmailCampaigns from './pages/EmailCampaigns';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Rutas Públicas de la Landing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

            {/* Rutas Privadas del Panel del Usuario (DashboardLayout se encarga de proteger) */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/generator" element={<QRGeneratorPage />} />
              <Route path="/history" element={<History />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/payment-response" element={<PaymentResponse />} />
              <Route path="/campaigns" element={<EmailCampaigns />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
