import React, { useState } from 'react';
import { Incident } from '../types';
import { RUBROS_AFECTACION, FOTOS_POR_TEMA } from '../data/phenomenaData';
import { 
  X, 
  Camera, 
  MapPin, 
  FileText, 
  Calendar, 
  ShieldAlert, 
  Download, 
  Upload, 
  Check, 
  Layers, 
  ZoomIn, 
  ExternalLink 
} from 'lucide-react';

interface PhotoViewerModalProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdatePhoto?: (incidentId: string, photoUrl: string, photoTitle: string) => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  incident,
  onClose,
  onUpdatePhoto
}) => {
  if (!incident) return null;

  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>(incident.fotoUrl || '');
  const [customTitle, setCustomTitle] = useState<string>(incident.fotoTitulo || '');

  // Determine photo url: custom or default by theme
  const defaultPhoto = FOTOS_POR_TEMA[incident.tipoAfectacion] || FOTOS_POR_TEMA.derrumbes;
  const currentPhotoUrl = incident.fotoUrl || defaultPhoto.url;
  const currentTitle = incident.fotoTitulo || defaultPhoto.tituloDefault;
  const currentCredito = incident.fotoCredito || defaultPhoto.creditoDefault;

  // Rubro details
  const rubroConfig = RUBROS_AFECTACION[incident.tipoAfectacion] || {
    nombreCorto: incident.tipoAfectacionLabel,
    nombre: incident.tipoAfectacionLabel
  };

  const isActive = incident.estatusCategoria === 'vigente_activo' || incident.estatusCategoria === 'en_seguimiento';

  const handleSaveCustomPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePhoto && customUrl.trim()) {
      onUpdatePhoto(incident.id, customUrl.trim(), customTitle.trim() || currentTitle);
    }
    setIsEditingPhoto(false);
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result && onUpdatePhoto) {
          onUpdatePhoto(incident.id, result, file.name);
          setCustomUrl(result);
          setCustomTitle(file.name);
          setIsEditingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[1300] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#531325] via-[#691C32] to-[#791c38] px-5 py-3.5 text-white flex items-center justify-between border-b-4 border-[#BC955B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-amber-300/30 text-[#BC955B]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-950/70 text-amber-200 border border-rose-800">
                  Evidencia Fotográfica Oficial
                </span>
                <span className="text-xs text-rose-200">
                  {rubroConfig.nombreCorto}
                </span>
              </div>
              <h3 className="text-lg font-bold font-serif leading-tight">
                {incident.municipio} • {incident.comunidadPunto}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Cerrar visor de fotografía"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main Photo Container with Technical Frame */}
          <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center min-h-[340px] max-h-[460px]">
            <img 
              src={currentPhotoUrl} 
              alt={currentTitle}
              className="w-full h-auto max-h-[460px] object-contain select-none"
            />

            {/* In-photo Badge Overlay */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-md ${
                isActive ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {isActive ? 'En proceso de atención' : 'Atendido / Libre'}
              </span>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-900/80 text-amber-300 border border-amber-400/40 backdrop-blur-xs">
                {incident.tipoAfectacionLabel}
              </span>
            </div>

            {/* Bottom Photo Caption */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 pt-6 text-white text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="max-w-xl">
                <p className="font-semibold text-slate-100">{currentTitle}</p>
                <p className="text-[11px] text-slate-400">{currentCredito}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={currentPhotoUrl}
                  download={`evidencia_${incident.municipio}_${incident.comunidadPunto}.svg`}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded border border-white/20 inline-flex items-center gap-1 cursor-pointer"
                  title="Descargar imagen"
                >
                  <Download className="w-3 h-3 text-[#BC955B]" />
                  <span>Descargar</span>
                </a>
              </div>
            </div>
          </div>

          {/* Incident Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Ubicación y Comunidad</span>
              <p className="font-semibold text-slate-800 mt-0.5">{incident.comunidadPunto}</p>
              <p className="text-slate-600 text-[11px]">{incident.ubicacion}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Estatus y Operativo</span>
              <p className="font-semibold text-rose-700 mt-0.5">{incident.estatusOficial}</p>
              <p className="text-slate-600 text-[11px]">
                {isActive ? 'En proceso de atención operativa' : 'Concluido y transitable'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Trazabilidad de Expediente</span>
              <p className="font-semibold text-slate-800 mt-0.5 font-mono">Página {incident.paginaDocumento}</p>
              <p className="text-slate-600 text-[11px] truncate" title={incident.documentoOrigen}>
                {incident.documentoOrigen}
              </p>
            </div>
          </div>

          {/* Narrative detail of affectation */}
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs">
            <strong className="text-amber-950 font-semibold block mb-0.5">Descripción de la Afectación Técnica:</strong>
            <p className="text-slate-700 leading-relaxed">{incident.afectacionDetalle}</p>
            {incident.accionAtencion && (
              <p className="text-emerald-800 font-medium mt-1.5 pt-1.5 border-t border-amber-200">
                <strong>Acción en Curso:</strong> {incident.accionAtencion}
              </p>
            )}
          </div>

          {/* Action: Toggle Edit / Link Custom Photo */}
          <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={() => setIsEditingPhoto(!isEditingPhoto)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#691C32]" />
              <span>{isEditingPhoto ? 'Cancelar edición' : 'Asociar foto propia o cambiar archivo'}</span>
            </button>

            <span className="text-[11px] text-slate-500 font-mono">
              Ruta en proyecto: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">{currentPhotoUrl}</code>
            </span>
          </div>

          {/* Form to link custom photo */}
          {isEditingPhoto && (
            <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <strong className="text-slate-800 font-serif">Asignar Fotografía Específica a esta Incidencia</strong>
                <span className="text-[10px] text-slate-500">Se aloja en el proyecto</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ruta interna del archivo (ej. /assets/evidencias/foto_01.jpg):
                  </label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="/assets/evidencias/..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    O Cargar foto desde tu dispositivo:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLocalFileUpload}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#691C32] file:text-white hover:file:bg-[#501526] cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Título descriptivo de la fotografía:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ej: Deslave en km 42 de la carretera estatal..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingPhoto(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomPhoto}
                  className="px-4 py-1.5 rounded-lg bg-[#691C32] hover:bg-[#501526] text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Asociación de Fotografía</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Secretaría de Gobierno • Protección Civil del Estado de Hidalgo
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Cerrar Fototeca
          </button>
        </div>
      </div>
    </div>
  );
};
