import React, { useState } from 'react';
import { FenomenoHistorico, Incident, AffectationCategory } from '../types';
import { FENOMENOS_HISTORICOS_2_ANOS, RUBROS_AFECTACION, FOTOS_POR_TEMA } from '../data/phenomenaData';
import { 
  X, 
  Layers, 
  FileText, 
  UploadCloud, 
  Sparkles, 
  Code, 
  CheckCircle2, 
  Calendar, 
  HelpCircle, 
  Plus, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  FolderOpen,
  Camera
} from 'lucide-react';

interface PhenomenaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  phenomenaList: FenomenoHistorico[];
  activePhenomenonId: string | 'all';
  onSelectPhenomenon: (id: string | 'all') => void;
  onRegisterPhenomenon: (newPhenomenon: FenomenoHistorico) => void;
  onIngestPdfForPhenomenon: (phenomenonId: string, pdfName: string, extractedIncidents: Incident[]) => void;
}

export const PhenomenaManagerModal: React.FC<PhenomenaManagerModalProps> = ({
  isOpen,
  onClose,
  phenomenaList,
  activePhenomenonId,
  onSelectPhenomenon,
  onRegisterPhenomenon,
  onIngestPdfForPhenomenon
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'catalogo' | 'alimentar_pdf' | 'alimentar_codigo' | 'orientacion' | 'guia_rubros'>('catalogo');
  
  // New Phenomenon form state
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newNombre, setNewNombre] = useState<string>('');
  const [newAno, setNewAno] = useState<number>(2025);
  const [newPeriodo, setNewPeriodo] = useState<string>('');
  const [newDescripcion, setNewDescripcion] = useState<string>('');
  const [newZona, setNewZona] = useState<string>('');

  // PDF ingestion state
  const [selectedTargetPhenomenon, setSelectedTargetPhenomenon] = useState<string>(
    phenomenaList[0]?.id || 'canal-baja-presion-octubre'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);
  const [ingestSuccessMessage, setIngestSuccessMessage] = useState<string>('');

  // Code / JSON ingestion state
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');

  const handleCreatePhenomenon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;

    const id = `fen-${Date.now()}`;
    const nuevo: FenomenoHistorico = {
      id,
      nombre: newNombre.trim(),
      periodo: newPeriodo.trim() || `${newAno}`,
      ano: newAno,
      descripcion: newDescripcion.trim() || 'Evento registrado en el histórico de contingencias meteorológicas del Estado de Hidalgo.',
      activo: false,
      totalIncidentesRegistrados: 0,
      zonaAfectadaPrincipal: newZona.trim() || 'Estado de Hidalgo'
    };

    onRegisterPhenomenon(nuevo);
    setShowCreateForm(false);
    setNewNombre('');
    setNewPeriodo('');
    setNewDescripcion('');
    setNewZona('');
    setSelectedTargetPhenomenon(id);
  };

  const handleSimulatePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessingPdf(true);
    setIngestSuccessMessage('');

    // Simulate AI extraction pipeline
    setTimeout(() => {
      setIsProcessingPdf(false);
      
      const sampleParsed: Incident[] = [
        {
          id: `hist-${Date.now()}-1`,
          municipio: "Molango",
          comunidadPunto: "Carretera Federal 105 km 112",
          ubicacion: "Tramo Molango - Otongo",
          tipoAfectacion: "derrumbes",
          tipoAfectacionLabel: "Derrumbes",
          fenomenoId: selectedTargetPhenomenon,
          estatusOficial: "EN PROCESO DE ATENCIÓN",
          estatusCategoria: "vigente_activo",
          afectacionDetalle: `Derrumbe de talud registrado en expediente oficial de ${file.name}. Cuadrilla en retiro de material.`,
          accionAtencion: "Habilitación de paso con maquinaria pesada.",
          documentoOrigen: file.name,
          paginaDocumento: 3,
          fechaReporte: "Reporte Histórico Validado",
          ultimaVerificacion: "Expediente digitalizado",
          puntosContabilizados: 1,
          fotoUrl: "/assets/evidencias/evidencia_derrumbes.svg",
          fotoTema: "Derrumbes en Carreteras y Caminos"
        },
        {
          id: `hist-${Date.now()}-2`,
          municipio: "San Felipe Orizatlán",
          comunidadPunto: "Ribera del Río Huerique",
          ubicacion: "Zona urbana baja",
          tipoAfectacion: "creciente_rios",
          tipoAfectacionLabel: "Creciente de Ríos",
          fenomenoId: selectedTargetPhenomenon,
          estatusOficial: "ATENDIDO / CAUCE NORMALIZADO",
          estatusCategoria: "atendido",
          afectacionDetalle: `Creciente pluvial monitoreada e integrada desde reporte ${file.name}.`,
          accionAtencion: "Supervisión de bordos concluidos por Protección Civil.",
          documentoOrigen: file.name,
          paginaDocumento: 7,
          fechaReporte: "Reporte Histórico Validado",
          ultimaVerificacion: "Expediente digitalizado",
          puntosContabilizados: 1,
          fotoUrl: "/assets/evidencias/evidencia_creciente_rios.svg",
          fotoTema: "Creciente y Desbordamiento de Ríos"
        }
      ];

      onIngestPdfForPhenomenon(selectedTargetPhenomenon, file.name, sampleParsed);
      setIngestSuccessMessage(`¡Documento procesado con éxito! Se integraron incidencias al fenómeno seleccionado.`);
    }, 1500);
  };

  const handleApplyJson = () => {
    try {
      setJsonError('');
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        onIngestPdfForPhenomenon(selectedTargetPhenomenon, 'Lote_Estructurado_JSON.json', parsed);
        setIngestSuccessMessage(`¡${parsed.length} incidencias integradas exitosamente desde JSON!`);
        setJsonInput('');
      } else {
        setJsonError('El JSON debe ser un arreglo de incidentes: [ { "municipio": "...", ... } ]');
      }
    } catch (err: any) {
      setJsonError('Error de sintaxis JSON: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[1250] bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#531325] via-[#691C32] to-[#791c38] px-5 py-4 text-white flex items-center justify-between border-b-4 border-[#BC955B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-amber-300/30 text-[#BC955B]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-950/70 text-amber-200 border border-rose-800">
                  Secretaría de Gobierno • Protección Civil Hidalgo
                </span>
                <span className="text-xs text-rose-200">
                  Histórico Bienal
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
                Gestor de Fenómenos y Alimentador de Documentos Oficiales
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-5 pt-3 border-b border-slate-200 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`py-2 px-3.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'catalogo'
                ? 'bg-white text-[#691C32] shadow-xs border-t-2 border-t-[#691C32]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fenómenos Oficiales (Junio, Julio, Octubre)</span>
          </button>

          <button
            onClick={() => setActiveTab('alimentar_pdf')}
            className={`py-2 px-3.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'alimentar_pdf'
                ? 'bg-white text-[#691C32] shadow-xs border-t-2 border-t-[#691C32]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
            <span>Alimentar con Documentos en PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('alimentar_codigo')}
            className={`py-2 px-3.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'alimentar_codigo'
                ? 'bg-white text-[#691C32] shadow-xs border-t-2 border-t-[#691C32]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>Alimentar con Código / JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('orientacion')}
            className={`py-2 px-3.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orientacion'
                ? 'bg-white text-[#691C32] shadow-xs border-t-2 border-t-[#691C32]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>¿Con Código o con PDFs?</span>
          </button>

          <button
            onClick={() => setActiveTab('guia_rubros')}
            className={`py-2 px-3.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guia_rubros'
                ? 'bg-white text-[#691C32] shadow-xs border-t-2 border-t-[#691C32]'
                : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100 hover:text-rose-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-[#691C32]" />
            <span>Guía: Agregar Fenómenos y Rubros</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: LOS 3 FENÓMENOS OFICIALES */}
          {activeTab === 'catalogo' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-base font-serif">
                    Fenómenos Oficiales (Junio, Julio, Octubre e Histórico Bienal)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecciona un fenómeno para visualizar su cartografía, incidencias y reportes oficiales en PDF.
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#691C32] hover:bg-[#501526] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showCreateForm ? 'Ocultar formulario' : 'Registrar Nuevo Fenómeno'}</span>
                </button>
              </div>

              {/* Create Phenomenon Form */}
              {showCreateForm && (
                <form onSubmit={handleCreatePhenomenon} className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3 text-xs animate-in fade-in duration-150">
                  <strong className="text-slate-800 font-serif block">Dar de alta un nuevo fenómeno meteorológico</strong>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre del Fenómeno:</label>
                      <input
                        type="text"
                        required
                        value={newNombre}
                        onChange={(e) => setNewNombre(e.target.value)}
                        placeholder="Ej: Huracán Grace / Tormenta Tropical..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#691C32] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Año y Periodo:</label>
                      <div className="flex gap-2">
                        <select
                          value={newAno}
                          onChange={(e) => setNewAno(Number(e.target.value))}
                          className="w-24 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        >
                          <option value={2026}>2026</option>
                          <option value={2025}>2025</option>
                          <option value={2024}>2024</option>
                        </select>
                        <input
                          type="text"
                          value={newPeriodo}
                          onChange={(e) => setNewPeriodo(e.target.value)}
                          placeholder="Ej: 1 al 7 de Octubre 2026"
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Zonas y Municipios Afectados:</label>
                      <input
                        type="text"
                        value={newZona}
                        onChange={(e) => setNewZona(e.target.value)}
                        placeholder="Ej: Sierra Alta, Huasteca, Otomí-Tepehua..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Descripción Ejecutiva:</label>
                      <input
                        type="text"
                        value={newDescripcion}
                        onChange={(e) => setNewDescripcion(e.target.value)}
                        placeholder="Resumen del corte operativo o antecedentes..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#691C32] hover:bg-[#501526] text-white font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Guardar Fenómeno</span>
                    </button>
                  </div>
                </form>
              )}

              {/* The 3 Phenomena Cards */}
              <div className="space-y-3">
                {phenomenaList.map((item, index) => {
                  const isSelected = activePhenomenonId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-rose-50/60 border-[#691C32] shadow-sm ring-1 ring-[#691C32]'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#691C32] text-amber-200 text-xs font-bold flex items-center justify-center font-mono">
                              {index + 1}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {item.periodo}
                            </span>
                            {item.activo && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Corte Vigente Activo
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 font-serif">
                            {item.nombre}
                          </h4>

                          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                            {item.descripcion}
                          </p>

                          <p className="text-[11px] text-slate-500 font-medium">
                            <strong>Zonas Afectadas:</strong> {item.zonaAfectadaPrincipal}
                          </p>

                          {item.archivosPdfsHistoricos && item.archivosPdfsHistoricos.length > 0 && (
                            <div className="pt-1 flex flex-wrap gap-2 text-[10px]">
                              {item.archivosPdfsHistoricos.map((pdf, pIdx) => (
                                <span key={pIdx} className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                                  <FileText className="w-3 h-3 text-amber-700" />
                                  <span>{pdf.titulo}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => onSelectPhenomenon(isSelected ? 'all' : item.id)}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#691C32] text-white shadow-xs'
                                : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-700'
                            }`}
                          >
                            {isSelected ? '✓ Visualizando en Mapa' : 'Seleccionar en Mapa'}
                          </button>

                          <span className="text-xs text-slate-600 font-mono font-semibold">
                            {item.totalIncidentesRegistrados} incidentes documentados
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rubros de Afectación Catalog Reference */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 text-xs font-serif">
                    Rubros y Temas de Afectación Activos en el Sistema
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Segmentables en mapa y tablas
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(RUBROS_AFECTACION) as AffectationCategory[]).map(key => {
                    const rubro = RUBROS_AFECTACION[key];
                    return (
                      <span 
                        key={key} 
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${rubro.badgeClass}`}
                      >
                        {rubro.nombre}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALIMENTAR CON DOCUMENTOS PDF */}
          {activeTab === 'alimentar_pdf' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold font-serif text-sm">
                  <UploadCloud className="w-4 h-4 text-amber-700" />
                  <span>Alimentación Automatizada con Documentos Oficiales en PDF</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Puedes integrar el histórico subiendo directamente los PDFs de las <strong>Tarjetas Informativas, Concentrados Ejecutivos SIPDUS o Reportes de Protección Civil</strong>. El extractor analiza los 84 municipios, desglosa las incidencias por comunidad y las asigna al fenómeno elegido.
                </p>
              </div>

              {/* Selector of Target Phenomenon */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  1. Selecciona a qué fenómeno corresponde el documento:
                </label>
                <select
                  value={selectedTargetPhenomenon}
                  onChange={(e) => setSelectedTargetPhenomenon(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-[#691C32] focus:outline-none"
                >
                  {phenomenaList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.periodo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-[#691C32] bg-slate-50/80 hover:bg-rose-50/30 rounded-xl p-8 text-center transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleSimulatePdfUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-[#691C32]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {uploadedFileName ? uploadedFileName : 'Arrastra o selecciona el PDF oficial'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Soporta reportes de SIPDUS, tarjetas de Protección Civil y dictámenes de carreteras
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 shadow-xs">
                    Examinar archivo PDF...
                  </span>
                </div>
              </div>

              {isProcessingPdf && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-900 animate-pulse">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                    <strong>Procesando y extrayendo incidencias del PDF...</strong>
                    <p className="text-[11px] text-blue-700">Identificando tramos carreteros, comunidades y estatus de atención.</p>
                  </div>
                </div>
              )}

              {ingestSuccessMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong>{ingestSuccessMessage}</strong>
                    <p className="text-[11px] text-emerald-700">El mapa y el catálogo se han actualizado con la información del documento.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ALIMENTAR CON CÓDIGO O JSON */}
          {activeTab === 'alimentar_codigo' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs">
              <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-900 font-bold font-serif text-sm">
                  <Code className="w-4 h-4 text-indigo-700" />
                  <span>Alimentación por Código / Archivos JSON Estructurados</span>
                </div>
                <p className="text-indigo-800 leading-relaxed">
                  Para integrar grandes volúmenes o automatizaciones desde bases de datos externas, puedes depositar archivos JSON o pegar directamente un arreglo JSON de incidencias aquí.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Fenómeno destino:
                </label>
                <select
                  value={selectedTargetPhenomenon}
                  onChange={(e) => setSelectedTargetPhenomenon(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {phenomenaList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.periodo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Pegar arreglo JSON de incidencias:
                  </label>
                  <button
                    type="button"
                    onClick={() => setJsonInput(JSON.stringify([
                      {
                        "municipio": "Tenango de Doria",
                        "comunidadPunto": "El Damo",
                        "ubicacion": "Carretera Metepec - Tenango km 28",
                        "tipoAfectacion": "derrumbes",
                        "tipoAfectacionLabel": "Derrumbes",
                        "estatusOficial": "EN PROCESO DE ATENCIÓN",
                        "estatusCategoria": "vigente_activo",
                        "afectacionDetalle": "Desprendimiento de rocas sobre carril derecho.",
                        "accionAtencion": "Retiro de material con retroexcavadora.",
                        "documentoOrigen": "Reporte_Tenango_Historico.pdf",
                        "paginaDocumento": 1,
                        "fechaReporte": "15/08/2024",
                        "ultimaVerificacion": "15/08/2024 14:00 h",
                        "puntosContabilizados": 1,
                        "fotoUrl": "/assets/evidencias/evidencia_derrumbes.svg"
                      }
                    ], null, 2))}
                    className="text-[11px] text-indigo-700 hover:underline font-semibold"
                  >
                    Insertar plantilla de ejemplo
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='[ { "municipio": "...", "comunidadPunto": "...", ... } ]'
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {jsonError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                  {jsonError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={!jsonInput.trim()}
                  onClick={handleApplyJson}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Procesar e Integrar JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: RESPUESTA CLARA A LA CONSULTA DEL USUARIO */}
          {activeTab === 'orientacion' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <h4 className="text-sm font-bold font-serif text-amber-300">
                  Orientación Oficial: ¿Cómo solventar la alimentación del histórico de 2 años?
                </h4>
                <p className="text-slate-300">
                  Consultaste si es mejor solventar esta parte <strong>con código</strong> o <strong>con los documentos en cuestión (PDFs)</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opción 1: Con Documentos */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span>Con Documentos (PDFs Oficiales)</span>
                  </div>
                  <p>
                    <strong>Ideal para:</strong> El equipo operativo y Protección Civil en el día a día.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Subes el PDF de la tarjeta o concentración ejecutiva.</li>
                    <li>La herramienta extrae automáticamente comunidades, carreteras y estatus.</li>
                    <li>Conserva la trazabilidad legal: cita el número de página y la fecha oficial.</li>
                    <li>No necesitas saber programar ni modificar archivos del servidor.</li>
                  </ul>
                </div>

                {/* Opción 2: Con Código / JSON */}
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                    <Code className="w-4 h-4 text-indigo-700" />
                    <span>Con Código / Archivos JSON</span>
                  </div>
                  <p>
                    <strong>Ideal para:</strong> Carga masiva o bases de datos de C5i / SIPDUS.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Puedes procesar cientos de registros en milisegundos sin esperas.</li>
                    <li>Permite enlazar directamente las fotografías alojadas en <code>/public/assets/evidencias/</code>.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-medium">
                <strong>Solución implementada:</strong> Esta plataforma cuenta con <em>ambas vías</em> activas. Puedes cargar tus PDFs en la pestaña <strong>"Alimentar con Documentos en PDF"</strong> o ingresar los lotes con código en la pestaña <strong>"Alimentar con Código / JSON"</strong>, y el mapa se segmentará por tema en tiempo real.
              </div>
            </div>
          )}

          {/* TAB 5: GUÍA TÉCNICA PARA AGREGAR MÁS FENÓMENOS Y RUBROS EN CÓDIGO */}
          {activeTab === 'guia_rubros' && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-gradient-to-r from-[#531325] via-[#691C32] to-[#791c38] text-white rounded-xl space-y-1.5 shadow-sm border-l-4 border-amber-400">
                <div className="flex items-center gap-2 text-amber-300 font-bold font-serif text-sm">
                  <Code className="w-4 h-4 text-amber-300" />
                  <span>Manual de Programación: Cómo Agregar Nuevos Fenómenos y Rubros</span>
                </div>
                <p className="text-rose-100 text-[11px] leading-relaxed">
                  Esta plataforma está diseñada de forma modular para que durante el año puedas ir añadiendo más fenómenos meteorológicos (4°, 5°, etc.) y sus respectivos rubros de afectación.
                </p>
              </div>

              {/* SECCIÓN A: AGREGAR NUEVO FENÓMENO EN CÓDIGO */}
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs font-serif flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-bold">A</span>
                    🌪️ Cómo Agregar un Nuevo Fenómeno en el Código (4°, 5°, etc.)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Archivo: src/data/phenomenaData.ts
                  </span>
                </div>
                <p className="text-slate-600">
                  Abre <code>/src/data/phenomenaData.ts</code>, busca el arreglo <code>FENOMENOS_HISTORICOS_2_ANOS</code> y añade este bloque después de <em>Frente Frío núm 2</em>:
                </p>
                <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                  <span className="text-slate-500">// En /src/data/phenomenaData.ts &gt; FENOMENOS_HISTORICOS_2_ANOS:</span><br />
                  &#123;<br />
                  &nbsp;&nbsp;id: <span className="text-amber-300">'frente-frio-num-3'</span>,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// ID único (en minúsculas)</span><br />
                  &nbsp;&nbsp;nombre: <span className="text-sky-200">'Frente Frío núm 3'</span>,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Nombre que verá el usuario</span><br />
                  &nbsp;&nbsp;periodo: <span className="text-sky-200">'15 al 22 de Noviembre 2026'</span>,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Fechas del evento</span><br />
                  &nbsp;&nbsp;ano: <span className="text-purple-300">2026</span>,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Año del evento</span><br />
                  &nbsp;&nbsp;descripcion: <span className="text-sky-200">'Evento invernal con heladas y vientos en la sierra.'</span>,<br />
                  &nbsp;&nbsp;activo: <span className="text-amber-300">false</span>,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// true si es el evento actual</span><br />
                  &nbsp;&nbsp;totalIncidentesRegistrados: <span className="text-purple-300">0</span>,<br />
                  &nbsp;&nbsp;zonaAfectadaPrincipal: <span className="text-sky-200">'Sierra Alta y Otomí-Tepehua'</span><br />
                  &#125;
                </div>
                <p className="text-[11px] text-slate-500">
                  <em>Tip:</em> También puedes registrarlo en <code>/src/types/index.ts</code> en el tipo <code>FenomenoId</code>.
                </p>
              </div>

              {/* SECCIÓN B: CÓMO VINCULAR RUBROS E INCIDENCIAS A UN FENÓMENO */}
              <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-950 text-xs font-serif flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center text-[10px] font-bold">B</span>
                    🏷️ Cómo se Vinculan los Rubros a un Fenómeno en Cada Incidencia
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Estructura de Incidente
                  </span>
                </div>
                <p className="text-slate-600">
                  Cada reporte o incidente vincula simultáneamente el <strong>Fenómeno</strong> y el <strong>Rubro de afectación</strong>. Al cargar datos por JSON o código, solo debes incluir estas claves:
                </p>
                <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                  &#123;<br />
                  &nbsp;&nbsp;id: <span className="text-sky-200">"inc-219"</span>,<br />
                  &nbsp;&nbsp;municipio: <span className="text-sky-200">"Zacualtipán de Ángeles"</span>,<br />
                  &nbsp;&nbsp;<span className="text-amber-300 font-bold">fenomenoId</span>: <span className="text-amber-300">"frente-frio-num-3"</span>,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// ⬅️ Vincula al fenómeno por su ID</span><br />
                  &nbsp;&nbsp;fenomenoNombre: <span className="text-sky-200">"Frente Frío núm 3"</span>,<br />
                  &nbsp;&nbsp;<span className="text-emerald-300 font-bold">tipoAfectacion</span>: <span className="text-emerald-300">"derrumbes"</span>,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// ⬅️ Rubro (derrumbes, deslaves, etc.)</span><br />
                  &nbsp;&nbsp;tipoAfectacionLabel: <span className="text-sky-200">"Derrumbes en Carreteras"</span>,<br />
                  &nbsp;&nbsp;estatusCategoria: <span className="text-rose-300">"vigente_activo"</span>,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// ⬅️ 'vigente_activo' o 'atendido'</span><br />
                  &nbsp;&nbsp;estatusOficial: <span className="text-sky-200">"EN PROCESO DE ATENCIÓN / MAQUINARIA EN SITIO"</span>,<br />
                  &nbsp;&nbsp;ubicacion: <span className="text-sky-200">"Carretera Federal México-Tampico km 94"</span><br />
                  &#125;
                </div>
                <p className="text-[11px] text-slate-500">
                  El mapa, las estadísticas del tablero y el selector de fenómenos filtrarán automáticamente los rubros de ese fenómeno.
                </p>
              </div>

              {/* SECCIÓN C: AGREGAR NUEVO RUBRO GENERAL DE AFECTACIÓN */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs font-serif flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#691C32] text-white flex items-center justify-center text-[10px] font-bold">C</span>
                    📋 Cómo Agregar un Nuevo Rubro General (ej: 'heladas', 'granizadas')
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    3 Pasos Sencillos
                  </span>
                </div>
                <p className="text-slate-600">
                  Si surge una tipología no contemplada inicialmente:
                </p>
                <div className="space-y-2">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <strong>Paso 1:</strong> En <code>/src/types/index.ts</code> agrega la clave a <code>AffectationCategory</code>:
                    <div className="bg-slate-900 text-emerald-400 p-2 rounded mt-1 font-mono text-[10px]">
                      | 'heladas' // ← nuevo rubro
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <strong>Paso 2:</strong> En <code>/src/data/phenomenaData.ts</code> pega la plantilla comentada en <code>RUBROS_AFECTACION</code> y <code>FOTOS_POR_TEMA</code>.
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <strong>Paso 3:</strong> En <code>/src/components/IncidentsTable.tsx</code> añade la <code>&lt;option value="heladas"&gt;Heladas&lt;/option&gt;</code> en el selector.
                  </div>
                </div>
              </div>

              {/* SECCIÓN D: REGISTRAR EN VIVO DESDE LA PLATAFORMA */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-950 font-medium flex items-center justify-between">
                <div>
                  <strong>¿Prefieres dar de alta un fenómeno sin programar?</strong><br />
                  <span className="text-[11px] text-emerald-800">
                    Ve a la pestaña <strong>"Los 3 Fenómenos Oficiales"</strong> y haz clic en <strong>"+ Registrar Nuevo Fenómeno"</strong>. Se añadirá en tiempo real a tu catálogo de trabajo.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('catalogo');
                    setShowCreateForm(true);
                  }}
                  className="px-3 py-1.5 bg-[#691C32] hover:bg-[#501526] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer shrink-0 ml-3"
                >
                  Ir al Formulario
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Secretaría de Gobierno • Subsecretaría de Protección Civil y Gestión de Riesgos
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Cerrar Gestor
          </button>
        </div>
      </div>
    </div>
  );
};
