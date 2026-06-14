import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Spinner from '../UI/Spinner';
import { Menu, X, QrCode } from 'lucide-react';

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Si está cargando el perfil del usuario, mostrar Spinner
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-dark-950">
        <Spinner size="large" />
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-950 transition-colors duration-200">
      {/* Sidebar para pantallas medianas/grandes */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Menú lateral móvil deslizante */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Fondo traslúcido para cerrar menú */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Contenido del Sidebar móvil */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-dark-900">
            {/* Botón de cierre en el panel móvil */}
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Contenedor principal de la app */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior para móvil */}
        <header className="flex md:hidden items-center justify-between h-16 px-4 bg-white dark:bg-dark-900 border-b border-slate-200/60 dark:border-slate-800/50 flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-1.5 font-bold text-lg tracking-tight">
            <div className="p-1 bg-brand-500 rounded-lg text-white">
              <QrCode className="w-4 h-4" />
            </div>
            <span>QR<span className="text-brand-500">ify</span></span>
          </Link>
          
          <div className="w-8"></div> {/* Espaciador simétrico */}
        </header>

        {/* Zona del contenido central */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-slate-50/50 dark:bg-dark-950/20 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
