import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles, QrCode } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800/50 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              <div className="p-1.5 bg-brand-500 rounded-xl text-white">
                <QrCode className="w-6 h-6" />
              </div>
              <span>QR<span className="text-brand-500">ify</span></span>
            </Link>
          </div>

          {/* Menú de enlaces */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              Beneficios
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              Planes
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              FAQ
            </a>
            <Link to="/pricing" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              Precios Premium
            </Link>
          </div>

          {/* Acciones de la derecha */}
          <div className="flex items-center gap-4">
            {/* Selector de Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-900 transition-colors"
              aria-label="Cambiar tema"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20"
                >
                  Ir a Mi Panel
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-900 rounded-xl transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-900 rounded-xl transition-colors"
                >
                  Acceder
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
