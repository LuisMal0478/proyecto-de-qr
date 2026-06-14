import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Spinner from '../components/UI/Spinner';
import Toast from '../components/UI/Toast';
import {
  BarChart3,
  Globe,
  Smartphone,
  Compass,
  Monitor,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { isPremium } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [qrList, setQrList] = useState([]);
  const [selectedQrId, setSelectedQrId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [qrDetails, setQrDetails] = useState(null);
  const [toast, setToast] = useState(null);

  // 1. Obtener lista de QRs dinámicos para el selector
  const fetchDynamicQRs = async () => {
    try {
      const res = await api.get('/qr/history');
      if (res.data.success) {
        const dynamics = res.data.qrCodes.filter((qr) => qr.isDynamic);
        setQrList(dynamics);
        if (dynamics.length > 0) {
          setSelectedQrId(dynamics[0]._id);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Error al obtener QRs:', err);
      setToast({ message: 'Error al consultar la lista de códigos QR.', type: 'error' });
      setLoading(false);
    }
  };

  // 2. Obtener estadísticas del QR seleccionado
  const fetchAnalytics = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/stats/qr/${id}`);
      if (res.data.success) {
        setAnalytics(res.data.analytics);
        setQrDetails(res.data.qrCode);
      }
    } catch (err) {
      console.error('Error al consultar analíticas:', err);
      setToast({ message: 'Error al recuperar las estadísticas del servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamicQRs();
  }, []);

  useEffect(() => {
    if (selectedQrId) {
      fetchAnalytics(selectedQrId);
    }
  }, [selectedQrId]);

  if (!isPremium) {
    return (
      <div className="p-8 text-center bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl max-w-2xl mx-auto space-y-6 fade-in-up">
        <Sparkles className="w-16 h-16 text-amber-500 mx-auto animate-pulse" />
        <h2 className="text-2xl font-black">Módulo de Analíticas Premium</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Las analíticas detalladas por dispositivo, sistema operativo, navegador y país son exclusivas para suscriptores de QRify Premium.
        </p>
        <button
          onClick={() => window.location.href = '/pricing'}
          className="inline-flex items-center justify-center px-6 py-3 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-500/10"
        >
          Suscribirme a Premium
        </button>
      </div>
    );
  }

  // Configuración de Gráfico Lineal (Cronología)
  const lineChartData = {
    labels: analytics?.scansTimeline?.map((item) => item._id) || [],
    datasets: [
      {
        label: 'Escaneos',
        data: analytics?.scansTimeline?.map((item) => item.count) || [],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#8b5cf6',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  // Helper para armar gráficos de Doughnut
  const buildDoughnutData = (statsArray, label) => {
    return {
      labels: statsArray?.map((item) => item._id || 'Desconocido') || [],
      datasets: [
        {
          label: label,
          data: statsArray?.map((item) => item.count) || [],
          backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#64748b'],
          borderWidth: 0,
        },
      ],
    };
  };

  if (loading && qrList.length > 0) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <Spinner size="medium" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Analíticas de Escaneo</h1>
          <p className="text-sm text-slate-400">
            Analiza el tráfico de tus códigos QR dinámicos con informes en tiempo real.
          </p>
        </div>

        {/* Selector de Código QR */}
        {qrList.length > 0 && (
          <div className="w-full sm:w-64">
            <select
              value={selectedQrId}
              onChange={(e) => setSelectedQrId(e.target.value)}
              className="input-premium py-2 px-3 font-semibold text-xs uppercase tracking-wide"
            >
              {qrList.map((qr) => (
                <option key={qr._id} value={qr._id}>
                  {qr.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {qrList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl">
          <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-base text-slate-650 dark:text-slate-400">Sin códigos QR dinámicos</h3>
          <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm mx-auto mt-1">
            Para ver estadísticas, crea un código QR y asegúrate de activar la opción <strong>Dinámico</strong> en el panel de configuración.
          </p>
        </div>
      ) : (
        <>
          {/* Métricas destacadas rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Escaneos Totales</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {qrDetails?.scansCount || 0}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Dispositivo Líder</span>
              <p className="text-lg font-black text-slate-800 dark:text-white mt-1 truncate">
                {analytics?.devices?.[0]?._id ? analytics.devices[0]._id.toUpperCase() : 'Ninguno'}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sistema Operativo</span>
              <p className="text-lg font-black text-slate-800 dark:text-white mt-1 truncate">
                {analytics?.os?.[0]?._id ? analytics.os[0]._id : 'Ninguno'}
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">País Principal</span>
              <p className="text-lg font-black text-slate-800 dark:text-white mt-1 truncate">
                {analytics?.countries?.[0]?._id ? analytics.countries[0]._id : 'Ninguno'}
              </p>
            </div>
          </div>

          {/* Gráfico de Línea - Histograma de Visitas */}
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-brand-500" />
              <h2 className="font-extrabold text-base">Evolución de Escaneos (Últimos 7 días)</h2>
            </div>
            
            {analytics?.scansTimeline?.length === 0 ? (
              <div className="py-12 text-center text-slate-400">Sin escaneos registrados en los últimos 7 días.</div>
            ) : (
              <div className="h-64 sm:h-80">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            )}
          </div>

          {/* Distribución por Dispositivos y Navegadores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Dispositivos */}
            <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl text-center space-y-4">
              <h3 className="font-extrabold text-sm flex items-center justify-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Smartphone className="w-4 h-4 text-brand-500" />
                Dispositivos
              </h3>
              {analytics?.devices?.length === 0 ? (
                <div className="py-8 text-xs text-slate-400">Sin datos</div>
              ) : (
                <div className="max-w-[170px] mx-auto">
                  <Doughnut data={buildDoughnutData(analytics.devices, 'Dispositivos')} />
                </div>
              )}
            </div>

            {/* Navegadores */}
            <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl text-center space-y-4">
              <h3 className="font-extrabold text-sm flex items-center justify-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Compass className="w-4 h-4 text-brand-500" />
                Navegadores
              </h3>
              {analytics?.browsers?.length === 0 ? (
                <div className="py-8 text-xs text-slate-400">Sin datos</div>
              ) : (
                <div className="max-w-[170px] mx-auto">
                  <Doughnut data={buildDoughnutData(analytics.browsers, 'Navegadores')} />
                </div>
              )}
            </div>

            {/* Geografía (Top Países) */}
            <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl space-y-4">
              <h3 className="font-extrabold text-sm flex items-center justify-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Globe className="w-4 h-4 text-brand-500" />
                Top Países de Origen
              </h3>
              {analytics?.countries?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Sin datos geográficos</div>
              ) : (
                <div className="space-y-3">
                  {analytics.countries.map((country, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-750 dark:text-slate-350">{idx + 1}. {country._id}</span>
                      <span className="font-bold bg-slate-50 dark:bg-dark-950 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-850">{country.count} visitas</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}

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

export default Analytics;
