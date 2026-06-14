import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QrCode, Mail, Lock, User, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Toast from '../components/UI/Toast';

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Cargar e inicializar Google SDK
  React.useEffect(() => {
    const scriptId = 'google-gsi-client-reg';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        initializeGoogleSignIn();
      };
    } else if (window.google) {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google) return;

    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1046467000880-mock.apps.googleusercontent.com',
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-btn-container-reg'),
        { theme: 'outline', size: 'large', width: 350 }
      );
    } catch (err) {
      console.error('Error al inicializar Google Sign-In:', err);
    }
  };

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    const res = await loginWithGoogle(response.credential);
    setLoading(false);

    if (res.success) {
      setToast({ message: 'Cuenta creada con Google exitosamente', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } else {
      setToast({ message: res.message || 'Error al autenticar con Google', type: 'error' });
    }
  };

  const handleMockGoogleLogin = async () => {
    setLoading(true);
    const res = await loginWithGoogle(null, {
      name: 'Usuario Google Demo',
      email: 'sandra.google@gmail.com',
    });
    setLoading(false);

    if (res.success) {
      setToast({ message: 'Sesión iniciada con Google (Simulación)', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } else {
      setToast({ message: res.message || 'Error en simulación', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setToast({ message: 'Por favor complete todos los campos', type: 'warning' });
      return;
    }

    if (password.length < 6) {
      setToast({ message: 'La contraseña debe tener al menos 6 caracteres', type: 'warning' });
      return;
    }

    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setToast({ message: res.message || 'Error al registrar usuario', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Botón flotante para cambiar tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-25 p-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-850 transition-colors"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Panel izquierdo: Contenido visual */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-brand-600 to-indigo-700 dark:from-brand-950/60 dark:to-indigo-950/50 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-500/20 blur-[100px] rounded-full"></div>

        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-white z-10">
          <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-xl">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span>QR<span className="text-brand-300">ify</span></span>
        </Link>

        <div className="z-10 max-w-md">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-snug">
            Eleva la presencia de tu marca con códigos dinámicos.
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">
            Regístrate en pocos segundos y desbloquea el generador más completo para potenciar menús, tarjetas de presentación, redes wifi y folletos comerciales.
          </p>
        </div>

        <p className="text-xs text-brand-200/70 z-10">&copy; 2026 QRify SaaS. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho: Formulario de Registro */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md bg-white dark:bg-dark-900 p-8 sm:p-10 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 shadow-xl shadow-slate-100/10 dark:shadow-black/25">
          <div className="mb-8">
            <h1 className="text-2xl font-black mb-1.5">Crear Cuenta</h1>
            <p className="text-slate-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold underline">
                Accede aquí
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nombre */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Nombre Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-premium pl-10"
                />
              </div>
            </div>

            {/* Campo Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium pl-10"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pl-10"
                />
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 disabled:opacity-75 disabled:cursor-not-allowed group text-sm"
            >
              {loading ? 'Creando cuenta...' : 'Comenzar Gratis'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-dark-900 px-3 text-slate-400 font-bold">O registrarse con</span>
            </div>
          </div>

          <div className="space-y-3 flex flex-col items-center">
            {/* Contenedor del botón oficial de Google */}
            <div id="google-btn-container-reg" className="w-full flex justify-center min-h-[44px]"></div>

            {/* Botón de simulación offline */}
            {!import.meta.env.PROD && (
              <button
                onClick={handleMockGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-650 dark:text-slate-350 bg-slate-50 hover:bg-slate-100 dark:bg-dark-950 dark:hover:bg-dark-850 rounded-xl border border-slate-200/60 dark:border-slate-855/50 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Simular Google Registro (Desarrollo)
              </button>
            )}
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

export default Register;
