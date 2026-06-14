import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  QrCode,
  History,
  BarChart3,
  Sparkles,
  LogOut,
  Sun,
  Moon,
  Home,
  User,
  Mail,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isPremium } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@qrify.com';

  const navItems = [
    { to: '/dashboard', label: 'Panel de Control', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/generator', label: 'Crear Código QR', icon: <QrCode className="w-5 h-5" /> },
    { to: '/history', label: 'Mi Historial', icon: <History className="w-5 h-5" /> },
    {
      to: '/analytics',
      label: 'Analíticas',
      icon: <BarChart3 className="w-5 h-5" />,
      premiumOnly: true,
    },
    {
      to: '/campaigns',
      label: 'Campañas de Email',
      icon: <Mail className="w-5 h-5" />,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-white dark:bg-dark-900 border-r border-slate-200/60 dark:border-slate-800/50 transition-colors duration-200">
      {/* Cabecera */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200/60 dark:border-slate-800/50">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
          <div className="p-1.5 bg-brand-500 rounded-xl text-white">
            <QrCode className="w-6 h-6" />
          </div>
          <span>QR<span className="text-brand-500">ify</span></span>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) {
            return null;
          }

          if (item.premiumOnly && !isPremium) {
            return (
              <div
                key={item.to}
                onClick={() => navigate('/pricing')}
                className="group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-950/40 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-brand-400 dark:hover:bg-dark-950/40'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Banner Premium si no es Premium */}
      {!isPremium && (
        <div className="mx-4 my-2 p-4 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-2xl text-white shadow-md">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Pásate a Premium</h4>
          </div>
          <p className="text-[11px] text-brand-100 mb-3 leading-relaxed">
            QRs dinámicos, estadísticas, descarga sin marca de agua e historial ilimitado.
          </p>
          <Link
            to="/pricing"
            className="w-full flex items-center justify-center py-2 px-3 bg-white text-brand-700 hover:bg-brand-50 font-semibold rounded-xl text-xs transition-colors shadow-sm"
          >
            Suscribirme ahora
          </Link>
        </div>
      )}

      {/* Información del Usuario a pie de sidebar */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/50 space-y-3 bg-slate-50/50 dark:bg-dark-950/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold uppercase">
            {user?.name ? user.name.substring(0, 2) : <User className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
              {user?.name || 'Usuario'}
            </p>
            <div className="flex items-center gap-1">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  isAdmin ? 'bg-indigo-500' : isPremium ? 'bg-amber-400' : 'bg-slate-400'
                }`}
              ></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isAdmin ? 'Admin' : isPremium ? 'Premium' : 'Plan Free'}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800/30 pt-3 px-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 transition-colors"
            title="Cambiar Tema"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <Link
            to="/"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-900 transition-colors"
            title="Ir al Sitio Principal"
          >
            <Home className="w-4 h-4" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
