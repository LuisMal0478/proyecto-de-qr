import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import { QrCode, Shield, Eye, Lock, FileText, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Política de Privacidad
            </h1>
            <p className="text-sm text-slate-450 dark:text-slate-400">
              Última actualización: 16 de junio de 2026
            </p>
          </div>

          {/* Policy Body */}
          <div className="space-y-8 text-slate-600 dark:text-slate-350 leading-relaxed text-sm sm:text-base">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                1. Introducción
              </h2>
              <p>
                En <strong>QRify</strong>, valoramos su privacidad y nos comprometemos a proteger sus datos personales. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos su información cuando utiliza nuestra plataforma de generación y administración de códigos QR.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                2. Información que Recopilamos
              </h2>
              <p>
                Para proporcionarle nuestros servicios de manera óptima, podemos recopilar los siguientes datos:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Información de Registro:</strong> Nombre completo, correo electrónico y contraseña encriptada cuando crea una cuenta.
                </li>
                <li>
                  <strong>Información de Códigos QR:</strong> Enlaces de destino, textos, imágenes de logotipos subidos a la plataforma e historial de códigos generados.
                </li>
                <li>
                  <strong>Datos de Analíticas:</strong> Dirección IP aproximada, país/ciudad, navegador, sistema operativo y fecha/hora de los escaneos de sus códigos QR dinámicos.
                </li>
                <li>
                  <strong>Información de Pago:</strong> No almacenamos los datos de sus tarjetas de crédito o débito. Todos los pagos se procesan de forma segura a través de nuestro socio ePayco, quienes cumplen con los estándares PCI-DSS.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                3. Uso de la Información
              </h2>
              <p>
                Utilizamos la información recopilada para los siguientes fines:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Proporcionar, operar y mantener nuestra plataforma y servicios de códigos QR.</li>
                <li>Permitirle personalizar y editar sus códigos QR dinámicos.</li>
                <li>Generar informes de analíticas y estadísticas de escaneos en tiempo real para sus códigos.</li>
                <li>Procesar sus pagos y actualizaciones de suscripción Premium mediante ePayco de manera confiable.</li>
                <li>Brindarle asistencia técnica y resolver solicitudes de soporte.</li>
                <li>Cumplir con las obligaciones legales y normativas aplicables.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                4. Seguridad de los Datos
              </h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas rigurosas para proteger su información personal contra accesos no autorizados, pérdidas, alteraciones o divulgaciones. Su contraseña se cifra mediante algoritmos de hash seguros antes de guardarse en nuestra base de datos.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                5. Derechos del Usuario
              </h2>
              <p>
                Usted tiene derecho a acceder, rectificar, actualizar o eliminar sus datos personales en cualquier momento. Puede gestionar la mayoría de esta información directamente desde su perfil en la plataforma o contactándonos a través del correo electrónico proporcionado a continuación.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                6. Información de Contacto
              </h2>
              <p>
                Si tiene alguna pregunta, inquietud o reclamación relacionada con esta Política de Privacidad o el tratamiento de sus datos personales, puede ponerse en contacto con el responsable del tratamiento:
              </p>
              <div className="mt-4 p-5 bg-slate-50 dark:bg-dark-950/40 border border-slate-200/50 dark:border-slate-850/40 rounded-2xl space-y-2 text-slate-700 dark:text-slate-350">
                <p className="font-bold text-slate-800 dark:text-white">Responsable legal y de datos:</p>
                <ul className="space-y-1">
                  <li><span className="font-semibold text-slate-600 dark:text-slate-400">Nombre:</span> Luis Angel Maldonado Urieles</li>
                  <li><span className="font-semibold text-slate-600 dark:text-slate-400">Correo Electrónico:</span> <a href="mailto:maldonadourielesluis@gmail.com" className="text-brand-500 hover:underline">maldonadourielesluis@gmail.com</a></li>
                  <li><span className="font-semibold text-slate-600 dark:text-slate-400">Teléfono:</span> <a href="tel:3018922819" className="text-brand-500 hover:underline">3018922819</a></li>
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

export default PrivacyPolicy;
