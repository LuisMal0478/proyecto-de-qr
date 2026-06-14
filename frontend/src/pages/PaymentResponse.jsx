import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Spinner from '../components/UI/Spinner';
import Toast from '../components/UI/Toast';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
} from 'lucide-react';

const PaymentResponse = () => {
  const { upgradeToPremium } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState(''); // approved, pending, rejected, failed
  const [toast, setToast] = useState(null);
  const [reference, setReference] = useState('');

  // Disparar confeti de celebración al aprobarse
  const triggerConfetti = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const verifyPayment = async () => {
    // ePayco suele redireccionar con ?ref_payco=REF o ?id=REF
    const params = new URLSearchParams(location.search);
    const refPayco = params.get('ref_payco') || params.get('id') || params.get('ref');

    if (!refPayco) {
      setStatus('failed');
      setVerifying(false);
      setToast({
        message: 'No se encontró referencia de transacción en la dirección URL.',
        type: 'error',
      });
      return;
    }

    setReference(refPayco);

    try {
      // Llamar al endpoint de confirmación
      const res = await api.post('/payments/confirm', { refPayco });

      if (res.data.success) {
        setStatus(res.data.status); // approved, pending, rejected

        if (res.data.status === 'approved') {
          // Actualizar estado local del AuthContext
          upgradeToPremium();
          // Lanzar confeti
          triggerConfetti();
        }
      } else {
        setStatus('failed');
      }
    } catch (err) {
      console.error('Error al verificar el pago:', err);
      setStatus('failed');
      setToast({
        message: err.response?.data?.message || 'Error al conectar con el servidor para verificar el pago.',
        type: 'error',
      });
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [location]);

  if (verifying) {
    return (
      <div className="min-h-[500px] flex flex-col justify-center items-center space-y-4 fade-in-up">
        <Spinner size="large" />
        <h2 className="font-extrabold text-lg text-slate-800 dark:text-white">Verificando su pago con ePayco</h2>
        <p className="text-xs text-slate-400 max-w-xs text-center leading-normal">
          Estamos consultando los servidores de ePayco en tiempo real. Por favor no cierre ni refresque la pestaña.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-[500px] flex items-center justify-center fade-in-up">
      <div className="w-full bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-3xl p-8 sm:p-10 text-center shadow-xl shadow-slate-100/10 dark:shadow-black/20">
        
        {/* Caso Pago APROBADO */}
        {status === 'approved' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto scale-110">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Actualización Exitosa
              </div>
              <h1 className="text-2xl font-black">¡Felicidades, ya eres Premium!</h1>
              <p className="text-xs text-slate-400 leading-normal">
                Tu pago ha sido validado correctamente. Hemos desbloqueado el panel de analíticas, descargas limpias sin marcas, logos e historial ilimitado.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-dark-950/40 border border-slate-100 dark:border-slate-850/50 rounded-2xl text-left text-xs space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>Referencia de Pago:</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{reference}</span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="font-bold text-emerald-500 uppercase tracking-wide">Aprobado</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/dashboard"
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-500/15"
              >
                <LayoutDashboard className="w-4 h-4" />
                Ir a mi Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Caso Pago PENDIENTE */}
        {status === 'pending' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black">Pago en Estado Pendiente</h1>
              <p className="text-xs text-slate-400 leading-normal">
                ePayco reporta que tu transacción está en espera de procesamiento (común en PSE o pagos en efectivo locales). Tu cuenta se ascenderá de forma inmediata tan pronto ePayco notifique la aprobación en segundo plano.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-dark-950/40 border border-slate-100 dark:border-slate-850/50 rounded-2xl text-left text-xs space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>Referencia de Pago:</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{reference}</span>
              </div>
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="font-bold text-amber-500 uppercase tracking-wide">Pendiente</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/dashboard"
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors"
              >
                Volver al Panel
              </Link>
            </div>
          </div>
        )}

        {/* Caso Pago RECHAZADO o FALLIDO */}
        {(status === 'rejected' || status === 'failed') && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black">Transacción Fallida o Rechazada</h1>
              <p className="text-xs text-slate-455 dark:text-slate-400 leading-normal">
                El pago ha sido denegado por el banco o cancelado durante la pasarela. No se ha realizado ningún cobro y tu cuenta permanece en el Plan Básico Free.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/pricing"
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors text-xs"
              >
                Volver a Intentar Pago
              </Link>
              <Link
                to="/dashboard"
                className="w-full py-3 px-4 font-bold text-slate-500 hover:bg-slate-50 dark:text-slate-450 dark:hover:bg-dark-850 rounded-xl transition-colors text-xs border border-slate-200 dark:border-slate-800"
              >
                Ir a mi Dashboard
              </Link>
            </div>
          </div>
        )}

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

export default PaymentResponse;
