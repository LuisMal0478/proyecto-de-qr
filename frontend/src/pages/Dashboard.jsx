import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Spinner from '../components/UI/Spinner';
import Toast from '../components/UI/Toast';
import {
  QrCode,
  Sparkles,
  BarChart3,
  TrendingUp,
  Clock,
  Smartphone,
  Plus,
  ArrowRight,
  Globe,
  Settings,
  Users,
  CreditCard,
  ShieldCheck,
  Mail
} from 'lucide-react';

const Dashboard = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [toast, setToast] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@qrify.com';

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/stats/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentScans(res.data.recentScans);
      }
    } catch (err) {
      console.error('Error al consultar datos del dashboard:', err);
      setToast({
        message: 'No se pudieron cargar las estadísticas del panel.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <Spinner size="medium" />
      </div>
    );
  }

  // --- RENDERIZADO DEL DASHBOARD DE ADMINISTRADOR ---
  if (isAdmin) {
    const adminCards = [
      {
        title: 'Usuarios Totales',
        value: stats?.totalUsers || 0,
        sub: 'Clientes registrados en la plataforma',
        icon: <Users className="w-5 h-5 text-indigo-500" />,
        bg: 'bg-white dark:bg-dark-900',
      },
      {
        title: 'Códigos QR Globales',
        value: stats?.totalQRs || 0,
        sub: `${stats?.dynamicQRs || 0} dinámicos / ${stats?.staticQRs || 0} estáticos`,
        icon: <QrCode className="w-5 h-5 text-brand-500" />,
        bg: 'bg-white dark:bg-dark-900',
      },
      {
        title: 'Escaneos del Sistema',
        value: stats?.totalScans || 0,
        sub: 'Clicks acumulados en QRs dinámicos',
        icon: <TrendingUp className="w-5 h-5 text-teal-500" />,
        bg: 'bg-white dark:bg-dark-900',
      },
      {
        title: 'Ingresos ePayco',
        value: stats?.totalRevenue ? `$${Number(stats.totalRevenue).toLocaleString()} COP` : '$0 COP',
        sub: 'Facturación premium aprobada',
        icon: <CreditCard className="w-5 h-5 text-emerald-500" />,
        bg: 'bg-gradient-to-br from-white to-emerald-50/10 dark:from-dark-900 dark:to-emerald-950/5',
      },
    ];

    return (
      <div className="space-y-8 fade-in-up">
        {/* Encabezado Admin */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              Hola, Administrador 🛡️
            </h1>
            <p className="text-sm text-slate-450 dark:text-slate-400">
              Panel de control global de QRify. Monitorea el uso de la plataforma y lanza campañas de email.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/campaigns"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 font-bold text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-650/10 text-xs"
            >
              <Mail className="w-4 h-4" />
              Lanzar Campañas
            </Link>
          </div>
        </div>

        {/* Grid de Tarjetas Admin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminCards.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm flex flex-col justify-between ${item.bg}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">
                  {item.title}
                </span>
                <div className="p-2 bg-slate-50 dark:bg-dark-950 rounded-lg">{item.icon}</div>
              </div>
              <div>
                <span className="text-2xl font-black leading-none">{item.value}</span>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cuerpo de Administración */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Escaneos Globales Recientes */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-extrabold text-lg text-slate-800 dark:text-white">Últimos Escaneos en la Plataforma</h2>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full uppercase tracking-wider">
                  Global
                </span>
              </div>

              {recentScans.length === 0 ? (
                <div className="py-12 text-center">
                  <Globe className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="font-bold text-sm text-slate-500 dark:text-slate-450 mb-1">Sin actividad global</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-500 max-w-xs mx-auto">
                    Los códigos QR dinámicos de los usuarios aún no registran visitas en el sistema.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentScans.map((scan, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-dark-950/20 border border-slate-100 dark:border-slate-850/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 rounded-lg">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-[150px] sm:max-w-xs">
                            {scan.qrCode?.name || 'QR Eliminado'}
                          </h4>
                          <div className="flex flex-wrap gap-x-2 text-[11px] text-slate-400 font-medium">
                            <span>{scan.device}</span>
                            <span>&bull;</span>
                            <span>{scan.os}</span>
                            <span>&bull;</span>
                            <span>{scan.browser}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {scan.country}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(scan.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-6 flex justify-end">
              <Link
                to="/campaigns"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-650"
              >
                Ir a Campañas de Email
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Panel Lateral Admin */}
          <div className="space-y-6">
            {/* Widget Informativo del Sistema */}
            <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl">
              <h3 className="font-extrabold text-base mb-4 flex items-center gap-1.5 text-indigo-500">
                <ShieldCheck className="w-5 h-5" />
                Seguridad de Admin
              </h3>
              
              <div className="space-y-4 text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                <p>
                  Has iniciado sesión como **Administrador Global** del sistema.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-dark-950/40 border border-slate-100 dark:border-slate-850/60 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span>Base de Datos:</span>
                    <span className="font-bold text-slate-850 dark:text-slate-350">SQLite (Local)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado SMTP:</span>
                    <span className="font-bold text-slate-850 dark:text-slate-350">
                      {import.meta.env.VITE_SMTP_CONFIGURED ? 'Activo' : 'Simulador'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Las métricas y los escaneos mostrados son del uso combinado de todos los usuarios registrados en QRify.
                </p>
              </div>
            </div>

            {/* Acceso Directo de Campaña */}
            <div className="p-6 bg-indigo-50/30 dark:bg-indigo-950/10 border border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-2xl text-xs space-y-3">
              <h4 className="font-extrabold text-indigo-500 uppercase tracking-wide">📢 Aviso de Marketing</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-normal">
                Puedes lanzar campañas promocionales del plan Premium por **$2.99 USD** directamente desde el Panel de Campañas para todos los usuarios Free en un clic.
              </p>
              <Link
                to="/campaigns"
                className="w-full flex items-center justify-center py-2 px-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] transition-colors shadow-sm"
              >
                Ir a campañas de correo
              </Link>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  // --- COMPORTAMIENTO ESTÁNDAR PARA CLIENTE REGULAR ---
  const clientCards = [
    {
      title: 'Códigos QR Creados',
      value: stats?.totalQRs || 0,
      sub: `${stats?.dynamicQRs || 0} dinámicos / ${stats?.staticQRs || 0} estáticos`,
      icon: <QrCode className="w-5 h-5 text-brand-500" />,
      bg: 'bg-white dark:bg-dark-900',
    },
    {
      title: 'Escaneos Totales',
      value: stats?.totalScans || 0,
      sub: 'Acumulado en QRs dinámicos',
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-white dark:bg-dark-900',
    },
    {
      title: 'Plan de Cuenta',
      value: isPremium ? 'Premium' : 'Free',
      sub: isPremium ? 'Historial y descargas ilimitadas' : 'Límite de historial: 5 QRs',
      icon: <Sparkles className={`w-5 h-5 ${isPremium ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />,
      bg: isPremium ? 'bg-gradient-to-br from-white to-amber-50/20 dark:from-dark-900 dark:to-amber-950/5' : 'bg-white dark:bg-dark-900',
    },
  ];

  return (
    <div className="space-y-8 fade-in-up">
      {/* Encabezado del Dashboard Cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Hola, {user?.name || 'Creador'}</h1>
          <p className="text-sm text-slate-400">
            Administra tus códigos QR y revisa el rendimiento de tus enlaces.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/generator"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            Crear Código QR
          </Link>
        </div>
      </div>

      {/* Grid de Tarjetas de Métricas Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clientCards.map((item, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm flex flex-col justify-between ${item.bg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {item.title}
              </span>
              <div className="p-2 bg-slate-50 dark:bg-dark-950 rounded-lg">{item.icon}</div>
            </div>
            <div>
              <span className="text-3xl font-black leading-none">{item.value}</span>
              <p className="text-xs text-slate-400 mt-2 font-medium">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Historial de actividad de escaneo Cliente */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-500" />
                <h2 className="font-extrabold text-lg">Actividad de Escaneo Reciente</h2>
              </div>
              {isPremium && (
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                  Tiempo Real
                </span>
              )}
            </div>

            {recentScans.length === 0 ? (
              <div className="py-12 text-center">
                <Globe className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 mb-1">Sin escaneos registrados</h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 max-w-xs mx-auto">
                  Tus códigos QR dinámicos aún no han recibido visitas. Comparte tus códigos para empezar a ver datos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentScans.map((scan, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-dark-950/20 border border-slate-100 dark:border-slate-850/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-50 dark:bg-brand-950/50 text-brand-500 rounded-lg">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-[150px] sm:max-w-xs">
                          {scan.qrCode?.name || 'QR Eliminado'}
                        </h4>
                        <div className="flex flex-wrap gap-x-2 text-[11px] text-slate-400 font-medium">
                          <span>{scan.device}</span>
                          <span>&bull;</span>
                          <span>{scan.os}</span>
                          <span>&bull;</span>
                          <span>{scan.browser}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {scan.country}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(scan.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-6 flex justify-end">
            <Link
              to="/history"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:text-brand-650"
            >
              Administrar códigos QR
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Panel lateral derecho Cliente */}
        <div className="space-y-6">
          {/* Tarjeta Cuenta */}
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl">
            <h3 className="font-extrabold text-base mb-4">Suscripción Activa</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Estado de Cuenta</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isPremium
                      ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-dark-950 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isPremium ? 'Premium Activo' : 'Versión Limitada'}
                </span>
              </div>

              {!isPremium ? (
                <div className="p-4 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-xl text-white">
                  <h4 className="font-bold text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Obtén Más Poder
                  </h4>
                  <p className="text-[10px] text-brand-100 mb-3 leading-normal">
                    Habilita QRs dinámicos editables, estadísticas con gráficos, elimina marcas de agua e inserta logos personalizados.
                  </p>
                  <Link
                    to="/pricing"
                    className="w-full flex items-center justify-center py-2 px-3 bg-white text-brand-700 hover:bg-brand-50 font-bold rounded-lg text-[10px] transition-colors shadow-sm"
                  >
                    Actualizar a Premium
                  </Link>
                </div>
              ) : (
                <div className="p-4 bg-slate-55 dark:bg-dark-950/30 rounded-xl border border-slate-150 dark:border-slate-850/50 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Siguiente Facturación:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">
                      {user?.subscription?.expiresAt
                        ? new Date(user.subscription.expiresAt).toLocaleDateString()
                        : 'En 30 días'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Método:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">ePayco Checkout</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tips SaaS */}
          <div className="p-6 bg-slate-50/50 dark:bg-dark-900/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-3">
            <h4 className="font-extrabold text-slate-400 uppercase tracking-wide">💡 Tip de QRify</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-normal">
              Utiliza <strong>Códigos QR Dinámicos</strong> si estás imprimiendo folletos o menús en tu restaurante. Si cambias de menú, solo editas el enlace en tu panel de QRify y el código QR impreso seguirá funcionando.
            </p>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
