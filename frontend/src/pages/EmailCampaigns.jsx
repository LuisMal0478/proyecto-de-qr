import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Mail,
  Send,
  CalendarCheck,
  Users,
  Sparkles,
  AlertTriangle,
  Terminal,
  Trash2,
  Eye,
  X,
  RefreshCw,
  Clock
} from 'lucide-react';
import Toast from '../components/UI/Toast';

const EmailCampaigns = () => {
  const [metrics, setMetrics] = useState({ total: 0, free: 0, premium: 0, expiring: 0 });
  const [logs, setLogs] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // 'promotion' o 'expiration' o 'clear'
  const [selectedMail, setSelectedMail] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const res = await api.get('/emails/metrics');
      if (res.data && res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Error al obtener métricas:', err);
      setToast({
        message: 'No se pudieron cargar las estadísticas del sistema.',
        type: 'error'
      });
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get('/emails/logs');
      if (res.data && res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Error al obtener logs de correos:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchLogs();
  }, []);

  const handlePromotePremium = async () => {
    setActionLoading('promotion');
    try {
      const res = await api.post('/emails/promote-premium');
      if (res.data && res.data.success) {
        setToast({
          message: res.data.message || '¡Campaña promocional enviada exitosamente!',
          type: 'success'
        });
        fetchMetrics();
        fetchLogs();
      }
    } catch (err) {
      console.error('Error al enviar campaña promocional:', err);
      setToast({
        message: err.response?.data?.message || 'Error al lanzar la campaña.',
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckExpirations = async () => {
    setActionLoading('expiration');
    try {
      const res = await api.post('/emails/check-expirations');
      if (res.data && res.data.success) {
        setToast({
          message: res.data.message || '¡Chequeo de expiraciones completado con éxito!',
          type: 'success'
        });
        fetchMetrics();
        fetchLogs();
      }
    } catch (err) {
      console.error('Error al verificar expiraciones:', err);
      setToast({
        message: err.response?.data?.message || 'Error al procesar los vencimientos.',
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearLogs = async () => {
    setActionLoading('clear');
    try {
      const res = await api.delete('/emails/logs');
      if (res.data && res.data.success) {
        setLogs([]);
        setToast({
          message: 'Bitácora de correos vaciada correctamente.',
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error al borrar logs:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 fade-in-up">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Campañas de Correo y Marketing</h1>
          <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
            {import.meta.env.PROD 
              ? 'Gestión administrativa para notificaciones transaccionales y campañas de mercadeo.'
              : 'Gestión administrativa y simulador en vivo para notificaciones transaccionales y mercadeo.'}
          </p>
        </div>
        <button
          onClick={() => {
            fetchMetrics();
            fetchLogs();
          }}
          className="flex items-center gap-2 py-2 px-4 text-xs font-bold bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-850 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-brand-500" />
          Sincronizar Panel
        </button>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-50 dark:bg-dark-950 rounded-2xl text-slate-550 dark:text-slate-450">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base de Datos</span>
          </div>
          <p className="text-2xl font-black">{loadingMetrics ? '...' : metrics.total}</p>
          <h4 className="text-xs text-slate-400 font-medium mt-1">Usuarios Totales Registrados</h4>
        </div>

        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-50 dark:bg-dark-950 rounded-2xl text-slate-500 dark:text-slate-450">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Free</span>
          </div>
          <p className="text-2xl font-black text-slate-600 dark:text-slate-400">{loadingMetrics ? '...' : metrics.free}</p>
          <h4 className="text-xs text-slate-400 font-medium mt-1">Elegibles para Campañas</h4>
        </div>

        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl text-amber-500">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Premium</span>
          </div>
          <p className="text-2xl font-black text-amber-550 dark:text-amber-555">{loadingMetrics ? '...' : metrics.premium}</p>
          <h4 className="text-xs text-slate-400 font-medium mt-1">Suscripciones Premium Activas</h4>
        </div>

        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-3xl shadow-sm relative overflow-hidden">
          {metrics.expiring > 0 && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 dark:bg-rose-500/10 blur-[30px] rounded-full pointer-events-none"></div>
          )}
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Por Vencer</span>
          </div>
          <p className="text-2xl font-black text-rose-500">{loadingMetrics ? '...' : metrics.expiring}</p>
          <h4 className="text-xs text-slate-400 font-medium mt-1">Plan expira en &le; 3 días</h4>
        </div>
      </div>

      {/* Grid de Acciones de Campaña */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Campaña Promocional Premium */}
        <div className="p-8 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-3xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 dark:bg-brand-950/40 border border-brand-200/30 dark:border-brand-850/40 rounded-full text-brand-600 dark:text-brand-400 font-bold text-[10px] uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Mercadeo Directo</span>
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Campaña de Promoción Premium</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Envía un correo de marketing estilizado a todos tus usuarios **Free** ({metrics.free}). Promociona el plan Premium destacando el soporte de logotipos, analíticas completas, descargas limpias sin marca de agua y la nueva tarifa ultra-competitiva de **$2.99 USD (~$11,900 COP) al mes**.
            </p>
            
            {/* Pequeña previsualización simulada */}
            <div className="p-4 bg-slate-55/60 dark:bg-dark-950/40 border border-slate-200/50 dark:border-slate-850/50 rounded-2xl mb-6 space-y-2 text-[11px] text-slate-400 font-medium">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850/40 pb-2">
                <span>Remitente:</span>
                <span className="text-slate-600 dark:text-slate-350">QRify <span className="font-normal">&lt;noreply@qrify.com&gt;</span></span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Asunto:</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[250px]">🚀 Desbloquea Códigos QR Dinámicos por solo $2.99 USD</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePromotePremium}
            disabled={actionLoading !== null || metrics.free === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-slate-100 dark:disabled:bg-dark-950 disabled:text-slate-400 rounded-xl transition-all shadow-md shadow-brand-500/10 text-xs"
          >
            <Send className="w-4 h-4" />
            {actionLoading === 'promotion' ? 'Disparando campaña...' : 'Lanzar Campaña Promocional ($2.99 USD)'}
          </button>
        </div>

        {/* Notificaciones de Expiración de Suscripción */}
        <div className="p-8 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-3xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/30 dark:border-amber-900/30 rounded-full text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase tracking-wider mb-5">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Transaccional Automático</span>
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Monitoreo y Alertas de Expiración</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Escanea la base de datos de SQLite en busca de usuarios **Premium** cuya suscripción venza en los próximos **3 días**. Envía alertas personalizadas recordándoles los beneficios que perderán si su plan se cancela e invitándolos a renovar a la nueva tarifa mensual de **$2.99 USD**.
            </p>
            
            <div className="p-4 bg-slate-55/60 dark:bg-dark-950/40 border border-slate-200/50 dark:border-slate-850/50 rounded-2xl mb-6 space-y-2 text-[11px] text-slate-400 font-medium">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850/40 pb-2">
                <span>Filtro de Días:</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">Menos de o igual a 3 días</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Estado:</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Suscripciones Activas
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckExpirations}
            disabled={actionLoading !== null}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-dark-950 dark:hover:bg-dark-850 border border-slate-200/60 dark:border-slate-850/50 rounded-xl transition-all shadow-sm text-xs"
          >
            <CalendarCheck className="w-4 h-4 text-amber-500" />
            {actionLoading === 'expiration' ? 'Buscando y notificando...' : 'Escanear y Notificar Vencimientos'}
          </button>
        </div>
      </div>

      {/* Consola de Correos Simulados */}
      {!import.meta.env.PROD && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg relative overflow-hidden">
          {/* Encabezado de consola */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl text-teal-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">Consola de Simulación de Correos (Desarrollo)</h3>
                <p className="text-[10px] text-slate-550 font-medium">
                  Captura en tiempo real de correos electrónicos transaccionales y de marketing despachados por la API.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={fetchLogs}
                className="flex items-center gap-1.5 py-1.5 px-3 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Recargar Logs
              </button>
              <button
                onClick={handleClearLogs}
                disabled={actionLoading === 'clear' || logs.length === 0}
                className="flex items-center gap-1.5 py-1.5 px-3 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Vaciar
              </button>
            </div>
          </div>

          {/* Lista de correos */}
          {loadingLogs ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-550">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">Cargando bitácora de correos...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-center max-w-sm mx-auto">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 mb-2">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 font-bold">Bitácora vacía</p>
              <p className="text-[10px] text-slate-550 leading-relaxed">
                No se han despachado correos electrónicos recientemente en esta sesión. Ejecuta una campaña o un chequeo de vencimiento para ver los correos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold text-left">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Para</th>
                    <th className="py-2.5 px-3">Asunto</th>
                    <th className="py-2.5 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-slate-600" />
                          <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            log.type === 'expiration_warning'
                              ? 'text-amber-400 bg-amber-950/40 border border-amber-900/30'
                              : 'text-brand-400 bg-brand-950/40 border border-brand-900/30'
                          }`}
                        >
                          {log.type === 'expiration_warning' ? 'Vencimiento' : 'Promocional'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{log.to}</td>
                      <td className="py-3 px-3 truncate max-w-xs">{log.subject}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedMail(log)}
                          className="inline-flex items-center gap-1 py-1 px-2.5 bg-slate-800 hover:bg-slate-750 text-teal-400 font-bold rounded-md border border-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver HTML
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Visor de Correo HTML */}
      {selectedMail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-50 dark:bg-brand-950 text-brand-500 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Previsualizador de Correo Real</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Destinatario: <span className="font-bold text-slate-650 dark:text-slate-350">{selectedMail.to}</span></p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedMail(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-950 border border-slate-150 dark:border-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ficha técnica */}
            <div className="bg-slate-50 dark:bg-dark-950/50 px-6 py-3 border-b border-slate-100 dark:border-slate-850/60 text-xs text-slate-450 space-y-1">
              <p><span className="font-bold">Asunto:</span> <span className="text-slate-800 dark:text-white font-medium">{selectedMail.subject}</span></p>
              <p><span className="font-bold">Fecha del envío:</span> {new Date(selectedMail.timestamp).toLocaleString()}</p>
            </div>

            {/* Sandbox Iframe rendering the HTML */}
            <div className="flex-1 bg-slate-100 dark:bg-dark-950 p-4 overflow-y-auto">
              <div className="w-full h-[50vh] bg-white rounded-2xl border border-slate-200/80 dark:border-slate-850/80 overflow-hidden shadow-inner">
                <iframe
                  title="Mock Email Content"
                  srcDoc={selectedMail.html}
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            {/* Footer de Modal */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-dark-950/60 border-t border-slate-100 dark:border-slate-850/80 flex justify-end">
              <button
                onClick={() => setSelectedMail(null)}
                className="py-2 px-5 text-xs font-bold bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-850 shadow-sm transition-colors"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alertas flotantes */}
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

export default EmailCampaigns;
