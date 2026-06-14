import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Spinner from '../components/UI/Spinner';
import Toast from '../components/UI/Toast';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  Check,
  X,
  FileText,
  Link2,
  Wifi,
  Share2,
} from 'lucide-react';
import { Phone } from 'lucide-react';

const History = () => {
  const { isPremium } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [qrList, setQrList] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [toast, setToast] = useState(null);

  // Estados para edición inline
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/qr/history');
      if (res.data.success) {
        setQrList(res.data.qrCodes);
      }
    } catch (err) {
      console.error('Error al obtener historial:', err);
      setToast({ message: 'No se pudo cargar el historial de códigos QR.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Eliminar un QR
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este código QR? Se borrarán de forma definitiva todas sus estadísticas de escaneo.')) {
      return;
    }

    try {
      const res = await api.delete(`/qr/delete/${id}`);
      if (res.data.success) {
        setQrList((prev) => prev.filter((qr) => qr._id !== id));
        setToast({ message: 'Código QR eliminado exitosamente.', type: 'success' });
      }
    } catch (err) {
      console.error('Error al eliminar QR:', err);
      setToast({ message: 'Error al eliminar el código QR del servidor.', type: 'error' });
    }
  };

  // Iniciar edición
  const startEditing = (qr) => {
    setEditingId(qr._id);
    setEditName(qr.name);
    setEditContent(qr.content);
  };

  // Guardar edición (nombre o contenido de QR dinámico)
  const saveEditing = async (id) => {
    if (!editName || !editContent) {
      setToast({ message: 'Complete todos los campos de edición.', type: 'warning' });
      return;
    }

    try {
      const res = await api.put(`/qr/update/${id}`, {
        name: editName,
        content: editContent,
      });

      if (res.data.success) {
        setQrList((prev) =>
          prev.map((qr) => (qr._id === id ? { ...qr, name: editName, content: editContent } : qr))
        );
        setEditingId(null);
        setToast({ message: 'Código QR actualizado exitosamente.', type: 'success' });
      }
    } catch (err) {
      console.error('Error al actualizar QR:', err);
      setToast({ message: 'Error en el servidor al actualizar el código.', type: 'error' });
    }
  };

  // Descarga del QR desde el historial
  const downloadHistoryQR = (qr) => {
    // 1. Encontrar el canvas renderizado offscreen
    const canvas = document.getElementById(`canvas-${qr._id}`);
    if (!canvas) return;

    // 2. Crear un canvas de descarga con tamaño personalizado
    const downloadCanvas = document.createElement('canvas');
    const ctx = downloadCanvas.getContext('2d');
    const qrSize = qr.design?.size || 300;

    if (isPremium) {
      // Premium: Descarga directa
      downloadCanvas.width = qrSize;
      downloadCanvas.height = qrSize;
      ctx.drawImage(canvas, 0, 0, qrSize, qrSize);
    } else {
      // Free: Agregar marca de agua
      const watermarkHeight = 60;
      downloadCanvas.width = qrSize;
      downloadCanvas.height = qrSize + watermarkHeight;

      // Fondo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, qrSize, qrSize + watermarkHeight);

      // Copiar QR
      ctx.drawImage(canvas, 0, 0, qrSize, qrSize);

      // Borde y fondo marca
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, qrSize, qrSize, watermarkHeight);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, qrSize);
      ctx.lineTo(qrSize, qrSize);
      ctx.stroke();

      // Texto marca
      ctx.fillStyle = '#64748b';
      ctx.font = `bold ${Math.max(10, Math.floor(qrSize * 0.035))}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Generado con QRify.com', qrSize / 2, qrSize + (watermarkHeight / 2));
    }

    const link = document.createElement('a');
    link.download = `${qr.name.replace(/\s+/g, '_')}_qrify.png`;
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'url':
        return <Link2 className="w-4 h-4 text-brand-500" />;
      case 'text':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'whatsapp':
        return <Phone className="w-4 h-4 text-emerald-500" />;
      case 'wifi':
        return <Wifi className="w-4 h-4 text-purple-500" />;
      case 'social':
        return <Share2 className="w-4 h-4 text-indigo-500" />;
      default:
        return <Link2 className="w-4 h-4 text-slate-400" />;
    }
  };

  // Filtrar lista
  const filteredQRs = qrList.filter((qr) => {
    const matchesSearch =
      qr.name.toLowerCase().includes(search.toLowerCase()) ||
      qr.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || qr.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
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
          <h1 className="text-3xl font-black tracking-tight">Mi Historial</h1>
          <p className="text-sm text-slate-400">
            Administra tus códigos QR creados, actualiza URLs dinámicas y consulta estadísticas.
          </p>
        </div>
      </div>

      {/* Controles de Filtro y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Barra de Búsqueda */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o contenido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium pl-10"
          />
        </div>

        {/* Filtro por Tipo */}
        <div className="w-full md:w-56 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-premium pl-9 font-semibold text-xs uppercase tracking-wide"
          >
            <option value="all">Todos los Tipos</option>
            <option value="url">Enlaces URL</option>
            <option value="text">Texto Plano</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="wifi">Redes WiFi</option>
            <option value="social">Social Media</option>
          </select>
        </div>
      </div>

      {/* Grid de Códigos QR */}
      {filteredQRs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-base text-slate-650 dark:text-slate-400">Ningún código QR encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Prueba ajustando el término de búsqueda o crea tu primer código desde la sección de creador.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQRs.map((qr) => (
            <div
              key={qr._id}
              className="p-5 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all relative overflow-hidden"
            >
              {/* Indicador Dinámico / Estático */}
              <div className="absolute top-4 right-4 flex items-center gap-1">
                {qr.isDynamic ? (
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-brand-500 text-white rounded-full uppercase tracking-wider flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    Dinámico
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-dark-950 text-slate-500 dark:text-slate-400 rounded-full uppercase tracking-wider">
                    Estático
                  </span>
                )}
              </div>

              {/* Contenido Superior */}
              <div className="space-y-4">
                
                {/* Nombre e Icono */}
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-50 dark:bg-dark-950 rounded-lg">
                    {getIconForType(qr.type)}
                  </div>
                  
                  {editingId === qr._id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-premium py-1.5 px-3 max-w-[200px] text-sm"
                    />
                  ) : (
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-white truncate pr-16">
                      {qr.name}
                    </h3>
                  )}
                </div>

                {/* Vista del Contenido/Destino */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Destino
                  </span>
                  
                  {editingId === qr._id ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        disabled={!qr.isDynamic}
                        className="input-premium py-1.5 px-3 text-xs"
                      />
                      {!qr.isDynamic && (
                        <p className="text-[9px] text-rose-500">
                          Los QRs estáticos no permiten cambiar su destino.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-550 dark:text-slate-350 bg-slate-50 dark:bg-dark-950/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/50">
                      <span className="truncate flex-1 font-mono pr-2">
                        {qr.content}
                      </span>
                      {qr.type === 'url' && (
                        <a
                          href={qr.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-500 hover:text-brand-650 flex-shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RENDERIZADO DEL QR (oculto en pantalla, usado para descarga) */}
              <div className="hidden">
                <QRCodeCanvas
                  id={`canvas-${qr._id}`}
                  value={
                    qr.isDynamic
                      ? `${import.meta.env.VITE_REDIRECT_URL || 'http://localhost:5000/r'}/${qr.shortId}`
                      : qr.content
                  }
                  size={qr.design?.size || 300}
                  fgColor={qr.design?.fgColor || '#000000'}
                  bgColor={qr.design?.bgColor || '#ffffff'}
                  level="H"
                  imageSettings={
                    qr.design?.logo
                      ? {
                          src: qr.design.logo,
                          x: undefined,
                          y: undefined,
                          height: 50,
                          width: 50,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>

              {/* Acciones e Info Inferior */}
              <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-5 flex items-center justify-between">
                {/* Estadísticas escaneos si es Dinámico */}
                <div className="text-left">
                  {qr.isDynamic ? (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Escaneos
                      </span>
                      <p className="text-sm font-black text-brand-600 dark:text-brand-400 leading-none mt-1">
                        {qr.scansCount}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">
                      Creado: {new Date(qr.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center gap-1">
                  
                  {editingId === qr._id ? (
                    <>
                      <button
                        onClick={() => saveEditing(qr._id)}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
                        title="Guardar Cambios"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-950 dark:hover:bg-dark-850 rounded-xl transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => downloadHistoryQR(qr)}
                        className="p-2 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-dark-950 rounded-xl transition-colors border border-slate-200/50 dark:border-slate-800/50"
                        title="Descargar de Nuevo"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      {qr.isDynamic && (
                        <button
                          onClick={() => startEditing(qr)}
                          className="p-2 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-dark-950 rounded-xl transition-colors border border-slate-200/50 dark:border-slate-800/50"
                          title="Editar Contenido"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(qr._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors border border-transparent"
                        title="Eliminar QR"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                </div>
              </div>

            </div>
          ))}
        </div>
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

export default History;
