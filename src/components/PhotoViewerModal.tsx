import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  ImageIcon,
  Sparkles,
  RotateCcw,
  FolderOpen
} from 'lucide-react';

interface PhotoViewerModalProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdatePhoto?: (incidentId: string, photoUrl: string, photoTitle: string) => void;
}

// Catálogo de imágenes locales integradas en el proyecto para asignación rápida
export const CATALOGO_IMAGENES_LOCALES = [
  {
    id: 'huautla',
    nombre: 'Huautla: Cruce Río Tamoyón Primero (Tarjeta 157)',
    url: '/assets/evidencias/huautla_rio_tamoyon.svg',
    titulo: 'Monitoreo de cauce y paso restablecido en el cruce del Río Tamoyón Primero (Acceso a Banderas)',
    credito: 'Protección Civil Huautla • SSPCyGR Tarjeta 157 / Gobierno de Hidalgo',
    categoria: 'creciente_rios'
  },
  {
    id: 'tlanchinol',
    nombre: 'Tlanchinol: Km 172 La Virgencita (Tarjeta 156)',
    url: '/assets/evidencias/tlanchinol_virgencita_km172.svg',
    titulo: 'Despeje de rocas y restitución vial en km 172 La Virgencita (México-Tampico)',
    credito: 'Guardia Nacional • Protección Civil Tlanchinol / SSPCyGR Tarjeta 156',
    categoria: 'derrumbes'
  },
  {
    id: 'huehuetla',
    nombre: 'Huehuetla: Parador Fuerza y Esperanza (Tarjeta 158)',
    url: '/assets/evidencias/huehuetla_parador_fuerza.svg',
    titulo: 'Camino reabierto al Parador Ecoturístico Fuerza y Esperanza tras retiro de derrumbe',
    credito: 'Protección Civil Huehuetla • SSPCyGR Tarjeta 158',
    categoria: 'derrumbes'
  },
  {
    id: 'tenango_pena',
    nombre: 'Tenango de Doria: Peña Blanca - El Nanthe (Folio 18)',
    url: '/assets/evidencias/tenango_pena_blanca.svg',
    titulo: 'Cierre total y monitoreo por deslizamiento activo en tramo Peña Blanca - El Nanthe',
    credito: 'Protección Civil Tenango de Doria • Folio Oficial 18',
    categoria: 'deslaves'
  },
  {
    id: 'calnali_ahuimol',
    nombre: 'Calnali: Barrio Ahuimol (Vivienda Evacuada)',
    url: '/assets/evidencias/calnali_barrio_ahuimol.svg',
    titulo: 'Deslave activo y vivienda deshabitada en Barrio Ahuimol, Calnali',
    credito: 'Secretaría de Gobierno • Protección Civil Hidalgo / SIPDUS',
    categoria: 'deslaves'
  },
  {
    id: 'creciente_gen',
    nombre: 'Creciente y Desbordamiento de Ríos',
    url: '/assets/evidencias/evidencia_creciente_rios.svg',
    titulo: 'Monitoreo de cauce y escurrimientos pluviales extraordinarios',
    credito: 'Secretaría de Gobierno • Comisión Estatal del Agua / PC',
    categoria: 'creciente_rios'
  },
  {
    id: 'derrumbes_gen',
    nombre: 'Derrumbes en Carreteras y Rocas',
    url: '/assets/evidencias/evidencia_derrumbes.svg',
    titulo: 'Derrumbe de material pétreo sobre carpeta asfáltica en tramo serrano',
    credito: 'Secretaría de Gobierno • Protección Civil Hidalgo / SIPDUS',
    categoria: 'derrumbes'
  },
  {
    id: 'deslaves_gen',
    nombre: 'Deslaves y Deslizamientos de Talud',
    url: '/assets/evidencias/evidencia_deslaves.svg',
    titulo: 'Deslizamiento activo de masa arcillosa y lodo sobre ladera habitada',
    credito: 'Secretaría de Gobierno • Dictamen Técnico de Riesgos',
    categoria: 'deslaves'
  },
  {
    id: 'estructuras_gen',
    nombre: 'Afectaciones a Puentes y Estructuras',
    url: '/assets/evidencias/evidencia_estructuras.svg',
    titulo: 'Fisuras y compromiso estructural en puente vehicular / muro de contención',
    credito: 'Secretaría de Gobierno • Dictamen Técnico SIPDUS',
    categoria: 'afectaciones_estructurales'
  },
  {
    id: 'arboles_gen',
    nombre: 'Caída de Árboles y Despeje de Vía',
    url: '/assets/evidencias/evidencia_caida_arboles.svg',
    titulo: 'Árbol colapsado sobre vía pública seccionado con motosierra',
    credito: 'Secretaría de Gobierno • Bomberos y Protección Civil',
    categoria: 'caida_arboles'
  },
  {
    id: 'socavon_gen',
    nombre: 'Socavones y Hundimientos',
    url: '/assets/evidencias/evidencia_socavon.svg',
    titulo: 'Socavón de carpeta asfáltica por socavación subsuperficial pluvial',
    credito: 'Secretaría de Gobierno • Cuadrilla de Infraestructura Municipal',
    categoria: 'socavon'
  },
  {
    id: 'inundaciones_gen',
    nombre: 'Inundaciones y Encharcamientos',
    url: '/assets/evidencias/evidencia_inundaciones.svg',
    titulo: 'Acumulación pluvial severa e inspección de paso vehicular',
    credito: 'Secretaría de Gobierno • Brigadas de Respuesta Inmediata',
    categoria: 'encharcamientos'
  },
  {
    id: 'electrico_gen',
    nombre: 'Suministro Eléctrico (CFE)',
    url: '/assets/evidencias/evidencia_suministro_electrico.svg',
    titulo: 'Postes y cableado derribado por rachas de viento y caída de ramas',
    credito: 'Secretaría de Gobierno • Cuadrilla CFE',
    categoria: 'suministro_electrico'
  },
  {
    id: 'vias_gen',
    nombre: 'Vías y Accesos Restringidos',
    url: '/assets/evidencias/evidencia_vias_accesos.svg',
    titulo: 'Paso habilitado a un solo carril con señalamiento de obra',
    credito: 'Secretaría de Gobierno • SIPDUS / SICT Federal',
    categoria: 'vias_accesos'
  },
  {
    id: 'monitoreo_gen',
    nombre: 'Monitoreo Preventivo y Recorridos',
    url: '/assets/evidencias/evidencia_monitoreo.svg',
    titulo: 'Inspección técnica de zonas vulnerables y laderas serranas',
    credito: 'Secretaría de Gobierno • Unidad de Monitoreo Preventivo',
    categoria: 'monitoreo_preventivo'
  }
];

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  incident,
  onClose,
  onUpdatePhoto
}) => {
  if (!incident) return null;

  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>(incident.fotoUrl || '');
  const [customTitle, setCustomTitle] = useState<string>(incident.fotoTitulo || '');

  // Synchronize state when incident changes
  useEffect(() => {
    setCustomUrl(incident.fotoUrl || '');
    setCustomTitle(incident.fotoTitulo || '');
    setIsEditingPhoto(false);
  }, [incident.id, incident.fotoUrl, incident.fotoTitulo]);

  // Determine photo url: custom or default by theme
  const defaultPhoto = FOTOS_POR_TEMA[incident.tipoAfectacion] || FOTOS_POR_TEMA.derrumbes;
  const hasSpecificPhoto = Boolean(incident.fotoUrl);
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

  const handleSelectPreset = (preset: typeof CATALOGO_IMAGENES_LOCALES[0]) => {
    if (onUpdatePhoto) {
      onUpdatePhoto(incident.id, preset.url, preset.titulo);
      setCustomUrl(preset.url);
      setCustomTitle(preset.titulo);
    }
  };

  const handleResetToDefault = () => {
    if (onUpdatePhoto) {
      onUpdatePhoto(incident.id, '', '');
      setCustomUrl('');
      setCustomTitle('');
      setIsEditingPhoto(false);
    }
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result && onUpdatePhoto) {
          const title = `Foto de campo: ${incident.municipio} - ${incident.comunidadPunto}`;
          onUpdatePhoto(incident.id, result, title);
          setCustomUrl(result);
          setCustomTitle(title);
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
                {hasSpecificPhoto ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    Foto Específica de Esta Ficha
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    Imagen de Referencia por Rubro
                  </span>
                )}
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
              {incident.fenomenoNombre && (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-900/80 text-sky-200 border border-sky-400/40 backdrop-blur-xs hidden sm:inline">
                  {incident.fenomenoNombre}
                </span>
              )}
            </div>

            {/* Bottom Photo Caption */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-3 pt-6 text-white text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="max-w-xl">
                <p className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span>{currentTitle}</span>
                  {hasSpecificPhoto && (
                    <span className="text-[10px] bg-emerald-600/80 text-white px-1.5 py-0.2 rounded font-mono">
                      Específica
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400">{currentCredito}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={currentPhotoUrl}
                  download={`evidencia_${incident.municipio}_${incident.comunidadPunto}.svg`}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded border border-white/20 inline-flex items-center gap-1 cursor-pointer transition-colors"
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

          {/* Control Bar: Link / Change Photo for this Card */}
          <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#691C32] hover:bg-[#501526] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <span>{isEditingPhoto ? 'Ocultar Opciones de Imagen' : 'Vincular / Cambiar Imagen de Esta Ficha'}</span>
              </button>

              {hasSpecificPhoto && (
                <button
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 cursor-pointer transition-colors"
                  title="Restablecer a la imagen por defecto del tema"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Restablecer por Defecto</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Archivo actual: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">{currentPhotoUrl}</code>
            </span>
          </div>

          {/* Interactive Panel to Link / Assign Local Image */}
          {isEditingPhoto && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-4 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <strong className="text-slate-900 font-serif block">
                    Vincular Imagen Local Distinta a esta Ficha
                  </strong>
                  <p className="text-[11px] text-slate-500">
                    Puedes elegir una imagen específica de las contingencias oficiales, escribir una ruta local o cargar una fotografía de campo.
                  </p>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded">
                  ID: {incident.id}
                </span>
              </div>

              {/* 1. Quick Presets from Local Evidence Catalog */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5 text-[#691C32]" />
                  <span>1. Seleccionar de las Fotografías de Eventos Específicos Integrados:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {CATALOGO_IMAGENES_LOCALES.map((preset) => {
                    const isSelected = currentPhotoUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`text-left p-2 rounded-lg border text-[11px] transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-amber-50 border-[#691C32] text-[#691C32] font-bold shadow-xs ring-1 ring-[#691C32]'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="w-7 h-7 rounded bg-slate-800 shrink-0 overflow-hidden border border-slate-300">
                          <img src={preset.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate flex-1">
                          <span className="block truncate">{preset.nombre}</span>
                          <span className="text-[9px] font-mono text-slate-400 block truncate">{preset.url}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#691C32] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Manual Local Path or Upload */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-[#691C32]" />
                  <span>2. O Ingresar Ruta Local Personalizada / Cargar desde Dispositivo:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">
                      Ruta local en el proyecto (ej. <code>/assets/evidencias/huautla_rio_tamoyon.svg</code>):
                    </label>
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="/assets/evidencias/..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">
                      O subir foto desde tu equipo:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLocalFileUpload}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#691C32] file:text-white hover:file:bg-[#501526] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="mt-2.5">
                  <label className="block text-[10px] text-slate-500 mb-1">
                    Título o descripción de la fotografía:
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ej: Monitoreo del río Tamoyón Primero y paso restablecido..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingPhoto(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    Cerrar panel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustomPhoto}
                    className="px-4 py-1.5 rounded-lg bg-[#691C32] hover:bg-[#501526] text-white font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar en esta Ficha</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Secretaría de Gobierno • Subsecretaría de Protección Civil y Gestión de Riesgos de Hidalgo
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
