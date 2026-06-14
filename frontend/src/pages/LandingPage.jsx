import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import {
  QrCode,
  Sparkles,
  Zap,
  Palette,
  BarChart3,
  RefreshCw,
  Download,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const LandingPage = () => {
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (index) => {
    setFaqOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const benefits = [
    {
      icon: <Zap className="w-6 h-6 text-brand-500" />,
      title: 'Generación Instantánea',
      desc: 'Crea códigos QR en milisegundos para enlaces, redes sociales, textos y credenciales de WiFi.',
    },
    {
      icon: <Palette className="w-6 h-6 text-brand-500" />,
      title: 'Personalización Extrema',
      desc: 'Modifica colores de fondo, módulos de código, inserta tu logotipo y ajusta tamaños de resolución.',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-brand-500" />,
      title: 'Códigos Dinámicos',
      desc: 'Edita la dirección URL de destino a la que apunta tu código QR sin tener que imprimirlo de nuevo.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-brand-500" />,
      title: 'Analíticas Detalladas',
      desc: 'Monitorea escaneos en tiempo real por dispositivo, navegador, sistema operativo y geolocalización.',
    },
    {
      icon: <Download className="w-6 h-6 text-brand-500" />,
      title: 'Descarga Limpia',
      desc: 'Exporta tus códigos QR en alta definición en formato PNG listos para impresión comercial y empaques.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-500" />,
      title: 'Soporte ePayco Seguro',
      desc: 'Suscripciones premium protegidas a través del procesador líder de pagos con activación inmediata.',
    },
  ];

  const faqs = [
    {
      q: '¿Qué diferencia hay entre un código QR estático y uno dinámico?',
      a: 'Los códigos QR estáticos codifican la información final directamente en el patrón, por lo que nunca cambian. Los códigos QR dinámicos codifican una URL corta y redirigen al visitante a tu sitio web. Esto te permite cambiar el enlace de destino cuando quieras en tu panel, sin tener que volver a imprimir el código QR.',
    },
    {
      q: '¿Puedo personalizar los códigos QR con el logo de mi negocio?',
      a: '¡Sí! Los usuarios del plan Premium pueden subir su logotipo corporativo (formatos PNG o JPEG) para incrustarlo directamente en el centro del código QR de manera limpia y profesional, manteniendo la perfecta legibilidad del escaneo.',
    },
    {
      q: '¿Cómo funciona el proceso de pago y activación premium?',
      a: 'Utilizamos la pasarela oficial de ePayco que soporta tarjetas de crédito, PSE y pagos locales con total seguridad. Al completar el pago, nuestro webhook se dispara asíncronamente y actualiza el rol de tu cuenta a Premium en menos de dos segundos de forma automática.',
    },
    {
      q: '¿Hay un límite de historial para la cuenta gratuita?',
      a: 'Sí, las cuentas gratuitas pueden almacenar hasta 5 códigos QR en su historial para descargas recurrentes. Los usuarios con suscripción Premium disfrutan de historial ilimitado y la capacidad de descargar sus archivos sin marca de agua.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Luces traseras de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-50 dark:bg-brand-950/40 border border-brand-200/50 dark:border-brand-800/40 rounded-full text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Generador de códigos QR de última generación</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
            Códigos QR Personalizados y <span className="text-gradient font-black">Dinámicos</span> para tu Negocio
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Personaliza colores, añade tu logo e integra analíticas en tiempo real. Cambia los destinos de tus enlaces en cualquier momento sin volver a imprimir.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-2xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 scale-100 hover:scale-[1.02]"
            >
              Comenzar gratis
            </Link>
            <a
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
            >
              Ver precios
            </a>
          </div>
        </div>
      </section>

      {/* Grid de Beneficios */}
      <section id="features" className="py-20 bg-white dark:bg-dark-900/30 transition-colors border-y border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              ¿Por qué elegir QRify?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Descubre las potentes herramientas SaaS diseñadas para simplificar y potenciar la gestión de tus códigos QR físicos y digitales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 hover:shadow-md transition-all group duration-300"
              >
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabla Comparativa de Precios */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              Planes Flexibles para tu Crecimiento
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Elige el plan ideal para tu negocio. Actualiza o cancela cuando quieras con total libertad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Gratuito */}
            <div className="p-8 rounded-3xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full relative">
              <div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-2">Plan Gratuito</h3>
                <p className="text-sm text-slate-400 mb-6">Para proyectos personales y pruebas básicas.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                  <span className="text-sm font-semibold text-slate-400">USD / mes</span>
                </div>
                <ul className="space-y-3.5 mb-8 text-sm text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span>Códigos QR Estáticos Ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span>Historial limitado a 5 códigos QR</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400 dark:text-slate-600 line-through">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>Códigos QR Dinámicos (Editables)</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400 dark:text-slate-600 line-through">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>Subir logotipo corporativo</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400 dark:text-slate-600 line-through">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>Descargas sin marca de agua</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full py-3 px-4 text-center font-bold bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 rounded-xl transition-colors text-sm"
              >
                Comenzar gratis
              </Link>
            </div>

            {/* Plan Premium */}
            <div className="p-8 rounded-3xl bg-white dark:bg-dark-900 border-2 border-brand-500 flex flex-col justify-between h-full relative shadow-xl shadow-brand-500/5">
              <div className="absolute -top-3.5 right-6 bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Recomendado
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                  Plan Premium
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </h3>
                <p className="text-sm text-slate-400 mb-6">Para empresas, restaurantes y marcas de alto impacto.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$2.99</span>
                  <span className="text-sm font-semibold text-slate-400">USD / mes</span>
                </div>
                <ul className="space-y-3.5 mb-8 text-sm text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Historial y descargas ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span>Códigos QR Dinámicos editables</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span>Incrustación de logotipo corporativo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span>Descarga limpia sin marca de agua</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span>Estadísticas de escaneo en tiempo real</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full py-3 px-4 text-center font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-500/20 text-sm"
              >
                Obtener Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas Frecuentes FAQ */}
      <section id="faq" className="py-20 bg-white dark:bg-dark-900/20 border-t border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Resolvemos tus inquietudes para que comiences a generar códigos QR hoy mismo.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-950/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  {faqOpen[idx] ? <ChevronUp className="w-5 h-5 text-brand-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {faqOpen[idx] && (
                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8 mb-8">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-white">
              <div className="p-1.5 bg-brand-500 rounded-xl text-white">
                <QrCode className="w-5 h-5" />
              </div>
              <span>QRify</span>
            </Link>
            <div className="flex gap-8 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Beneficios</a>
              <a href="#pricing" className="hover:text-white transition-colors">Planes</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
            <p>&copy; 2026 QRify. Todos los derechos reservados. Diseñado para integraciones seguras de ePayco.</p>
            <p>Soporte técnico: soporte@qrify.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
