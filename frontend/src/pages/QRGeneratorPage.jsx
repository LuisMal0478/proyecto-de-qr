import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Link2,
  FileText,
  Wifi,
  Share2,
  Sparkles,
  Download,
  Upload,
  Palette,
  Eye,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import Toast from '../components/UI/Toast';
import { Phone } from 'lucide-react';

const QRGeneratorPage = () => {
  const { isPremium } = useAuth();
  
  // Estados para formulario
  const [activeTab, setActiveTab] = useState('url');
  const [qrName, setQrName] = useState('Mi Código QR');
  const [isDynamic, setIsDynamic] = useState(false);
  
  // Inputs según Tab
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('https://');
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [socialLink, setSocialLink] = useState('https://instagram.com/');

  // Estados de Personalización
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(300);
  const [logoFile, setLogoFile] = useState(null); // base64 string
  
  // Estados de UI
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Referencia para descargar
  const qrCanvasRef = useRef(null);

  // Formatear contenido final según tipo
  const getFormattedContent = () => {
    switch (activeTab) {
      case 'url':
        return urlContent;
      case 'text':
        return textContent;
      case 'whatsapp':
        const cleanNumber = waNumber.replace(/[^\d]/g, '');
        const encodedMsg = encodeURIComponent(waMessage);
        return `https://wa.me/${cleanNumber}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
      case 'wifi':
        // Formato estándar QR WiFi: WIFI:S:SSID;T:WPA;P:PASSWORD;;
        return `WIFI:S:${wifiSsid};T:${wifiSecurity};P:${wifiPassword};;`;
      case 'social':
        return socialLink;
      default:
        return '';
    }
  };

  // Manejar subida de archivo para logo
  const handleLogoUpload = (e) => {
    if (!isPremium) {
      setToast({
        message: 'La inserción de logotipos personalizados requiere una cuenta Premium.',
        type: 'warning',
      });
      return;
    }

    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // límite 2MB
        setToast({ message: 'El archivo excede el límite de 2MB.', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar click en Toggle de Dinámico
  const handleDynamicToggle = (val) => {
    if (val && !isPremium) {
      setToast({
        message: 'Los códigos QR dinámicos editables son una característica exclusiva de QRify Premium.',
        type: 'warning',
      });
      return;
    }
    setIsDynamic(val);
  };

  // Guardar en Historial y Generar
  const handleSaveQR = async () => {
    const rawContent = getFormattedContent();
    if (!rawContent || rawContent === 'https://' || rawContent === 'https://instagram.com/') {
      setToast({ message: 'Por favor complete los campos obligatorios de contenido.', type: 'warning' });
      return;
    }

    setGenerating(true);

    try {
      const payload = {
        name: qrName,
        type: activeTab,
        content: rawContent,
        isDynamic,
        design: {
          fgColor,
          bgColor,
          size: qrSize,
          logo: isPremium ? logoFile : null,
        },
      };

      const res = await api.post('/qr/generate', payload);

      if (res.data.success) {
        setToast({
          message: isDynamic
            ? '¡Código QR Dinámico creado e ingresado al historial!'
            : '¡Código QR Estático creado e ingresado al historial!',
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Error al generar QR:', err);
      setToast({
        message: err.response?.data?.message || 'Límite de historial alcanzado en plan Free.',
        type: 'error',
      });
    } finally {
      setGenerating(false);
    }
  };

  // Descargar Imagen con o sin Marca de Agua
  const downloadPNG = () => {
    const rawContent = getFormattedContent();
    if (!rawContent || rawContent === 'https://' || rawContent === 'https://instagram.com/') {
      setToast({ message: 'Primero complete el contenido del QR antes de descargar.', type: 'warning' });
      return;
    }

    if (isDynamic) {
      setToast({
        message: 'Para descargar un código QR dinámico, primero debes hacer clic en "Guardar en Historial" para generar su enlace en el sistema.',
        type: 'info',
      });
      return;
    }

    const canvas = document.getElementById('qrify-canvas');
    if (!canvas) return;

    // Crear un canvas de descarga
    const downloadCanvas = document.createElement('canvas');
    const ctx = downloadCanvas.getContext('2d');

    if (isPremium) {
      // PREMIUM: Descarga directa y limpia
      downloadCanvas.width = qrSize;
      downloadCanvas.height = qrSize;
      ctx.drawImage(canvas, 0, 0, qrSize, qrSize);
    } else {
      // FREE: Agregar marca de agua sutil abajo
      const watermarkHeight = 60;
      downloadCanvas.width = qrSize;
      downloadCanvas.height = qrSize + watermarkHeight;

      // Dibujar fondo blanco para toda la imagen
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, qrSize, qrSize + watermarkHeight);

      // Dibujar el QR
      ctx.drawImage(canvas, 0, 0, qrSize, qrSize);

      // Dibujar caja de la marca de agua
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, qrSize, qrSize, watermarkHeight);

      // Dibujar borde sutil separator
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, qrSize);
      ctx.lineTo(qrSize, qrSize);
      ctx.stroke();

      // Dibujar Texto de la marca de agua
      ctx.fillStyle = '#64748b'; // color gris pizarra
      ctx.font = `bold ${Math.max(10, Math.floor(qrSize * 0.035))}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Generado con QRify.com', qrSize / 2, qrSize + (watermarkHeight / 2));
    }

    const link = document.createElement('a');
    link.download = `${qrName.replace(/\s+/g, '_')}_qrify.png`;
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  };

  const tabs = [
    { id: 'url', label: 'Enlace URL', icon: <Link2 className="w-4 h-4" /> },
    { id: 'text', label: 'Texto Plano', icon: <FileText className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <Phone className="w-4 h-4" /> },
    { id: 'wifi', label: 'Red WiFi', icon: <Wifi className="w-4 h-4" /> },
    { id: 'social', label: 'Social Media', icon: <Share2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 fade-in-up">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">Creador de Códigos QR</h1>
        <p className="text-sm text-slate-400">
          Personaliza los colores, sube tu logotipo e ingresa tus contenidos en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel Formulario e Inputs (Col-span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Nombre del Código QR */}
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Nombre del Código (Fácil de Identificar)</label>
            <input
              type="text"
              value={qrName}
              onChange={(e) => setQrName(e.target.value)}
              placeholder="Ej. Menú de Restaurante, Enlace de Instagram"
              className="input-premium"
            />
          </div>

          {/* Selector de Tipo de QR */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl overflow-hidden">
            <div className="flex border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-500 bg-brand-50/10'
                      : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Inputs dinámicos según Tab */}
            <div className="p-6">
              
              {activeTab === 'url' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">URL de Destino</label>
                  <input
                    type="url"
                    value={urlContent}
                    onChange={(e) => setUrlContent(e.target.value)}
                    placeholder="https://tusitio.com"
                    className="input-premium"
                  />
                  <p className="text-[11px] text-slate-400">
                    Asegúrate de ingresar la dirección completa incluyendo el protocolo (http:// o https://).
                  </p>
                </div>
              )}

              {activeTab === 'text' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Contenido de Texto</label>
                  <textarea
                    rows={4}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Ingresa el texto que deseas codificar dentro de tu código QR..."
                    className="input-premium"
                  />
                </div>
              )}

              {activeTab === 'whatsapp' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Número Telefónico (Con código de país)</label>
                    <input
                      type="tel"
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      placeholder="Ej: 573151234567"
                      className="input-premium"
                    />
                    <p className="text-[10px] text-slate-400">
                      Ingresa sólo números, iniciando por tu código telefónico internacional (ej: 57 para Colombia).
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Mensaje Predeterminado (Opcional)</label>
                    <input
                      type="text"
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      placeholder="Ej: Hola, me interesa obtener información."
                      className="input-premium"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'wifi' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Nombre de la Red (SSID)</label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="Ej: MiCasa_WiFi"
                        className="input-premium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tipo de Seguridad</label>
                      <select
                        value={wifiSecurity}
                        onChange={(e) => setWifiSecurity(e.target.value)}
                        className="input-premium"
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Sin Contraseña (Abierta)</option>
                      </select>
                    </div>
                  </div>
                  {wifiSecurity !== 'nopass' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Contraseña de la Red</label>
                      <input
                        type="password"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-premium"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Perfil o Canal Social</label>
                  <input
                    type="url"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    placeholder="https://instagram.com/tu_perfil"
                    className="input-premium"
                  />
                </div>
              )}

            </div>
          </div>

          {/* Configuración de Diseño y Personalización */}
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl space-y-6">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-500" />
              Diseño y Personalización
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selector Colores */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Color de los Módulos</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <span className="text-xs font-semibold uppercase font-mono">{fgColor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Color de Fondo</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <span className="text-xs font-semibold uppercase font-mono">{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Subir Logo (Solo Premium) */}
              <div className="p-4 bg-slate-50 dark:bg-dark-950/20 border border-slate-150 dark:border-slate-850/50 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-xs">Logo en el Centro</h4>
                    {!isPremium && (
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full uppercase tracking-wider">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mb-3">
                    Agrega tu logo para que tu QR se vea más formal. Recomendado formato cuadrado transparente PNG.
                  </p>
                </div>

                {isPremium ? (
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer text-xs font-bold transition-all shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      Subir Logo
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {logoFile && (
                      <button
                        onClick={() => setLogoFile(null)}
                        className="text-xs font-bold text-rose-500 hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleDynamicToggle(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-200/50 hover:bg-slate-200 dark:bg-dark-950/50 dark:hover:bg-dark-950 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Incrustar Logo
                  </button>
                )}
              </div>
            </div>

            {/* Ajuste de Resolución / Tamaño */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                <span>Resolución de Descarga</span>
                <span className="font-semibold">{qrSize} x {qrSize} px</span>
              </div>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-dark-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>
          </div>

        </div>

        {/* Panel Previsualizador en Vivo y Acciones (Col-span 1) */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl text-center space-y-6 shadow-sm">
            <h3 className="font-extrabold text-base flex items-center justify-center gap-1.5 border-b border-slate-100 dark:border-slate-800/50 pb-3">
              <Eye className="w-4 h-4 text-brand-500" />
              Previsualizador en Vivo
            </h3>

            {/* Caja Contenedora del QR */}
            <div className="flex justify-center p-4 bg-slate-50 dark:bg-dark-950/20 rounded-2xl border border-slate-150 dark:border-slate-850/50 overflow-hidden mx-auto max-w-[240px]">
              <div style={{ backgroundColor: bgColor }} className="p-3.5 rounded-xl">
                <QRCodeCanvas
                  id="qrify-canvas"
                  value={isDynamic ? 'https://qrify.com/r/loading' : getFormattedContent() || 'https://qrify.com'}
                  size={190}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level="H" // Alta redundancia para soportar logos en el centro sin perder lecturabilidad
                  includeMargin={false}
                  imageSettings={
                    logoFile
                      ? {
                          src: logoFile,
                          x: undefined,
                          y: undefined,
                          height: 38,
                          width: 38,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Ajustes de Tipo de QR (Estático vs Dinámico) */}
            <div className="p-4 bg-slate-50/50 dark:bg-dark-950/20 border border-slate-150 dark:border-slate-850/50 rounded-xl space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-extrabold">QR Dinámico</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" title="Permite editar la URL de redirección en el futuro sin reimprimir" />
                </div>
                
                {/* Switch Dinámico */}
                <button
                  onClick={() => handleDynamicToggle(!isDynamic)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    isDynamic ? 'bg-brand-500' : 'bg-slate-200 dark:bg-dark-950'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isDynamic ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                {isDynamic
                  ? 'Redirige tus escaneos a través de QRify. Puedes modificar la dirección de destino cuando desees.'
                  : 'Codifica el enlace directamente. No puede modificarse posteriormente.'}
              </p>
            </div>

            {/* Acciones del QR */}
            <div className="space-y-3 pt-2">
              <button
                onClick={downloadPNG}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 text-sm"
              >
                <Download className="w-4 h-4" />
                Descargar QR (PNG)
              </button>

              <button
                onClick={handleSaveQR}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-brand-500 bg-brand-50 hover:bg-brand-100 dark:bg-dark-950 dark:text-brand-400 dark:hover:bg-dark-950/80 rounded-xl border border-brand-200/50 dark:border-brand-800/40 transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {generating ? 'Guardando...' : 'Guardar en Historial'}
              </button>
            </div>

            {/* Watermark notice in Free plan */}
            {!isPremium && (
              <p className="text-[10px] text-slate-450 dark:text-slate-500">
                ⚠️ Las descargas en el plan Free incluyen una sutil marca de agua "QRify" en la parte inferior del código.
              </p>
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

export default QRGeneratorPage;
