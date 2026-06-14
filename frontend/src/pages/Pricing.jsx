import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Check, CreditCard, ShieldCheck } from 'lucide-react';
import Toast from '../components/UI/Toast';

const Pricing = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleMockSubscribe = () => {
    if (!user) {
      setToast({
        message: 'Por favor inicie sesión o regístrese para suscribirse.',
        type: 'warning',
      });
      return;
    }
    const mockRef = 'ref_mock_approved_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    navigate(`/payment-response?ref_payco=${mockRef}`);
  };

  // Cargar SDK de ePayco
  useEffect(() => {
    const scriptId = 'epayco-checkout-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.epayco.co/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSubscribe = () => {
    if (!user) {
      setToast({
        message: 'Por favor inicie sesión o regístrese para suscribirse.',
        type: 'warning',
      });
      return;
    }

    if (isPremium) {
      setToast({
        message: '¡Ya cuenta con una suscripción Premium activa!',
        type: 'info',
      });
      return;
    }

    if (!window.ePayco) {
      setToast({
        message: 'Pasarela de pagos ePayco no cargada. Por favor intente en un momento.',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      // Configurar Checkout ePayco (Utiliza llave pública Sandbox por defecto)
      const handler = window.ePayco.checkout.configure({
        key: import.meta.env.VITE_EPAYCO_PUBLIC_KEY || '491d6a0b6e82fa030033cf281ea787ab', // Test Sandbox Key
        test: true, // Modo Sandbox Habilitado
      });

      const epaycoData = {
        name: 'Suscripción Premium QRify',
        description: 'Acceso a QRs dinámicos, logos, descargas limpias y estadísticas.',
        currency: 'cop',
        amount: '11900', // Cobro aproximado en COP de $2.99 USD
        tax_base: '0',
        tax: '0',
        country: 'co',
        lang: 'es',

        // Parámetros de Redirección y Webhook
        external: 'false', // Abre modal flotante
        extra1: user._id, // Muy Importante: Envía ID de usuario en extra1 para actualizar cuenta
        response: `${window.location.origin}/payment-response`,
        confirmation: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/webhook`,

        // Datos del comprador pre-llenados
        name_billing: user.name,
        email_billing: user.email,
      };

      handler.open(epaycoData);
    } catch (err) {
      console.error('Error al abrir ePayco:', err);
      setToast({ message: 'Error al abrir la pasarela de ePayco.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const premiumFeatures = [
    'Creación ilimitada de códigos QR',
    'Códigos QR Dinámicos (Destinos editables)',
    'Incrustar logotipos personalizados en tus códigos',
    'Descargas en alta resolución sin marca de agua',
    'Estadísticas de escaneo en tiempo real (dispositivos, países, etc.)',
    'Soporte técnico preferente en menos de 24 horas',
  ];

  return (
    <div className="space-y-8 fade-in-up">
      {/* Encabezado */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Elige el Poder de QRify Premium</h1>
        <p className="text-sm text-slate-450 dark:text-slate-400 leading-relaxed">
          Libera todo el potencial de tu negocio físico. Diseñado para restaurantes, marcas, oficinas y comercio local.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
        
        {/* Plan Gratuito (Referencia rápida) */}
        <div className="p-8 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-3xl flex flex-col justify-between h-full relative">
          <div>
            <h3 className="font-extrabold text-xl mb-1 text-slate-800 dark:text-white">Plan Básico Free</h3>
            <p className="text-xs text-slate-400 mb-6">Pruebas básicas e individuales.</p>
            <div className="flex items-baseline gap-1 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
              <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
              <span className="text-xs font-semibold text-slate-400">USD / mes</span>
            </div>
            
            <ul className="space-y-3.5 mb-8 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Códigos QR Estáticos Ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Historial de hasta 5 códigos QR</span>
              </li>
              <li className="flex items-center gap-2 text-slate-350 dark:text-slate-650 leading-normal line-through">
                <span>Códigos QR Dinámicos (Editables)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-350 dark:text-slate-650 leading-normal line-through">
                <span>Incrustación de logotipos corporativos</span>
              </li>
            </ul>
          </div>
          
          <button
            disabled
            className="w-full py-3 px-4 font-bold text-center bg-slate-100 dark:bg-dark-950 text-slate-400 rounded-xl cursor-not-allowed text-xs transition-colors"
          >
            Suscrito al Plan Free
          </button>
        </div>

        {/* Plan Premium Checkout ePayco */}
        <div className="p-8 bg-white dark:bg-dark-900 border-2 border-brand-500 rounded-3xl flex flex-col justify-between h-full relative shadow-xl shadow-brand-500/5">
          <div className="absolute -top-3.5 right-6 bg-brand-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Recomendado
          </div>
          
          <div>
            <h3 className="font-extrabold text-xl mb-1 text-slate-800 dark:text-white flex items-center gap-1.5">
              Plan Premium Anual/Mensual
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400 mb-6">Tu negocio físico a un clic de distancia.</p>
            
            <div className="flex items-baseline gap-1 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
              <span className="text-4xl font-black text-slate-900 dark:text-white">$2.99</span>
              <span className="text-xs font-semibold text-slate-400">USD / mes (~$11,900 COP)</span>
            </div>

            <ul className="space-y-3.5 mb-8 text-xs text-slate-500 dark:text-slate-400">
              {premiumFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <Check className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <span className={i < 2 ? 'font-bold text-slate-750 dark:text-slate-200' : ''}>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              disabled={loading || isPremium}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-500/20 text-xs ${
                isPremium ? 'opacity-75 cursor-not-allowed bg-emerald-500 hover:bg-emerald-500' : ''
              }`}
            >
              <CreditCard className="w-4 h-4" />
              {loading ? 'Preparando pasarela...' : isPremium ? 'Ya eres Premium' : 'Comprar Suscripción Premium'}
            </button>

            {!isPremium && !import.meta.env.PROD && (
              <button
                onClick={handleMockSubscribe}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-650 dark:text-slate-350 bg-slate-50 hover:bg-slate-100 dark:bg-dark-950 dark:hover:bg-dark-850 rounded-xl border border-slate-200/60 dark:border-slate-850/50 transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                Simular Pago Aprobado (Desarrollo)
              </button>
            )}
          </div>
        </div>

      </div>

      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 bg-slate-50 dark:bg-dark-950/20 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400 mt-6">
        <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <p>Pagos procesados con total seguridad por <strong>ePayco</strong>. Habilitamos entornos de prueba sandbox.</p>
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

export default Pricing;
