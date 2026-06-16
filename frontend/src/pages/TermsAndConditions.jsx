import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import { QrCode, FileText, ArrowLeft, ShieldCheck, Scale, Award } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al inicio</span>
        </Link>

        {/* Content Card */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-150/10 dark:shadow-none">
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8 text-center sm:text-left">
            <div className="inline-flex items-center justify-center p-3 bg-brand-50 dark:bg-brand-950/50 text-brand-500 rounded-2xl mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Términos y Condiciones
            </h1>
            <p className="text-sm text-slate-450 dark:text-slate-400">
              Última actualización: 16 de junio de 2026
            </p>
          </div>

          {/* Terms Body */}
          <div className="space-y-8 text-slate-600 dark:text-slate-350 leading-relaxed text-sm sm:text-base">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                1. Aceptación de los Términos
              </h2>
              <p>
                Al acceder y utilizar la plataforma <strong>QRify</strong>, usted acepta y se compromete a cumplir con los presentes Términos y Condiciones. Si no está de acuerdo con alguna de estas disposiciones, debe abstenerse de utilizar nuestros servicios de inmediato.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                2. Descripción del Servicio
              </h2>
              <p>
                QRify es un servicio web basado en software como servicio (SaaS) que proporciona herramientas de generación de códigos QR, tanto estáticos como dinámicos (editables en tiempo real), herramientas de personalización (diseño, logotipos) y analíticas de escaneo.
              </p>
              <p>
                Ofrecemos un <strong>Plan Gratuito</strong> con capacidades limitadas de almacenamiento de historial y sin soporte para QRs dinámicos, y un <strong>Plan Premium</strong> de pago mensual o anual que desbloquea funciones completas.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                3. Registro de Cuentas y Responsabilidad
              </h2>
              <p>
                Para acceder a las funcionalidades avanzadas e historial de códigos QR, es necesario crear una cuenta. Usted es responsable de mantener la confidencialidad de sus credenciales de inicio de sesión y de todas las actividades realizadas en su cuenta. Notifíquenos de inmediato ante cualquier uso no autorizado.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                4. Suscripciones, Pagos y Cancelaciones (ePayco)
              </h2>
              <p>
                Los pagos del Plan Premium se procesan de forma segura a través de la pasarela de pagos integrada <strong>ePayco</strong>. 
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Tarifas:</strong> Las tarifas aplicables al Plan Premium se muestran detalladamente en nuestra sección de precios y están sujetas a cambios con aviso previo.
                </li>
                <li>
                  <strong>Facturación y Procesamiento:</strong> El procesamiento de cobro es operado por ePayco, garantizando la confidencialidad y la protección de datos bancarios. Una vez aprobado el pago, el plan premium se habilitará automáticamente en su cuenta.
                </li>
                <li>
                  <strong>Cancelaciones:</strong> Puede cancelar su suscripción en cualquier momento desde su panel. No se emitirán reembolsos parciales por periodos de facturación ya iniciados.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                5. Uso Correcto de la Plataforma
              </h2>
              <p>
                Usted acepta utilizar los códigos QR y la plataforma de conformidad con la ley. Queda estrictamente prohibido utilizar QRify para dirigir a los usuarios a sitios web con contenido malicioso, fraudulento, de phishing, de apuestas ilegales, o que infrinjan derechos de propiedad intelectual de terceros. QRify se reserva el derecho de desactivar cualquier código QR o cuenta que viole esta disposición.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                6. Limitación de Responsabilidad
              </h2>
              <p>
                QRify se esfuerza por mantener una disponibilidad óptima de la plataforma, pero no garantiza que el servicio sea ininterrumpido o libre de errores. No nos hacemos responsables por pérdidas comerciales, daños directos o indirectos ocasionados por la caída temporal del servicio o el mal funcionamiento de los códigos QR impresos.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                7. Información de Contacto
              </h2>
              <p>
                Si tiene dudas o consultas sobre estos Términos y Condiciones, puede contactar al propietario y administrador de la plataforma:
              </p>
              <div className="mt-4 p-5 bg-slate-50 dark:bg-dark-950/40 border border-slate-200/50 dark:border-slate-850/40 rounded-2xl space-y-2 text-slate-700 dark:text-slate-350">
                <p className="font-bold text-slate-800 dark:text-white">Propietario / Administrador:</p>
                <ul className="space-y-1">
                  <li><span className="font-semibold text-slate-600 dark:text-slate-400">Nombre:</span> Luis Angel Maldonado Urieles</li>
                  <li><span className="font-semibold text-slate-600 dark:text-slate-400">Correo Electrónico:</span> <a href="mailto:maldonadourielesluis@gmail.com" className="text-brand-500 hover:underline">maldonadourielesluis@gmail.com</a></li>
                  <li><span className="font-semibold text-slate-600 dark:text-slate-400">Teléfono / WhatsApp:</span> <a href="https://wa.me/573018922819" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">3018922819</a></li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Basic Footer for policy pages */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-white">
            <div className="p-1 bg-brand-500 rounded-lg text-white">
              <QrCode className="w-4 h-4" />
            </div>
            <span>QRify</span>
          </Link>
          <p>&copy; 2026 QRify. Todos los derechos reservados. Contacto: Luis Angel Maldonado Urieles</p>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
