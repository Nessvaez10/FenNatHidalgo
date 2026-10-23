export type SemaforoLevel = 'rojo' | 'naranja' | 'amarillo' | 'verde' | 'gris';

export type StatusCategory = 
  | 'vigente_activo'        // En proceso de atención (oficial)
  | 'atendido'              // Concluido / Atendido (oficial)
  | 'en_seguimiento'        // Con trabajos u operativos en curso
  | 'pendiente_confirmacion'// Requiere verificación municipal/SIPDUS
  | 'historico_sipdus';     // Antecedente histórico

/*
 * =========================================================================================
 * 🌪️ MARCADOR: CÓMO AGREGAR MÁS FENÓMENOS METEOROLÓGICOS AQUÍ EN TYPESCRIPT
 * =========================================================================================
 * Para añadir un 4°, 5° o más fenómenos durante el año:
 * 1. Agrega el identificador aquí abajo en el tipo `FenomenoId` (ej: | 'frente-frio-num-3').
 * 2. En `/src/data/phenomenaData.ts`, ve a `FENOMENOS_HISTORICOS_2_ANOS` y copia la plantilla.
 * =========================================================================================
 */
export type FenomenoId = 
  | 'lluvias-junio-2026'           // 1. Fenómeno de Junio: Temporal de Lluvias (9 al 17 de Junio 2026)
  | 'lluvias-julio-2026'           // 2. Fenómeno de Julio: Cierres y Lluvias (10 al 22 de Julio 2026)
  | 'canal-baja-presion-octubre'   // 3. Fenómeno de Octubre: Canal de Baja Presión y Lluvias (1 al 10 de Octubre)
  | 'frente-frio-num-2'            // 4. Fenómeno Invernal: Frente Frío núm 2 (2025-2026)
  | 'primer-fenomeno-sin-nombre'   // (Histórico anterior)
  // ⬇️ PEGA AQUÍ TUS NUEVOS FENÓMENOS (ejemplos comentados):
  // | 'frente-frio-num-3'
  // | 'tormenta-tropical-alberto'
  | string;

export interface FenomenoHistorico {
  id: string;                      // Identificador único (ej: 'frente-frio-num-3')
  nombre: string;                  // Nombre oficial legible
  periodo: string;                 // Ej: "15 al 20 de Noviembre 2026"
  ano: number;                     // Año: 2024, 2025, 2026, 2027...
  descripcion: string;             // Resumen técnico del evento
  activo: boolean;                 // true si está actualmente bajo monitoreo activo
  archivoPdfPrincipal?: string;    // Ruta o URL al reporte oficial PDF
  archivosPdfsHistoricos?: Array<{ titulo: string; archivo: string; fecha: string }>;
  totalIncidentesRegistrados: number; // Conteo de incidentes vinculados
  zonaAfectadaPrincipal: string;   // Ej: "Sierra Alta, Huasteca..."
}

/*
 * =========================================================================================
 * 📘 GUÍA PARA AGREGAR NUEVOS RUBROS DE AFECTACIÓN DURANTE EL AÑO:
 * =========================================================================================
 * Si durante el transcurso del año Protección Civil o la Secretaría de Gobierno integran
 * una nueva tipología o rubro de afectación (por ejemplo: 'heladas', 'granizadas', 
 * 'incendios_forestales', 'colapso_barda', 'desabasto_agua', etc.), sigue estos 3 pasos:
 *
 * 1. PASO 1 (AQUÍ): Agrega la clave al tipo `AffectationCategory` (ej: | 'heladas').
 * 2. PASO 2: En `/src/data/phenomenaData.ts`:
 *    - Registra el rubro en `RUBROS_AFECTACION` con su nombre legible y color.
 *    - Registra su fotografía oficial por defecto en `FOTOS_POR_TEMA`:
 *       heladas: {
 *         tema: 'Heladas y Bajas Temperaturas',
 *         url: '/assets/evidencias/evidencia_monitoreo.svg',
 *         tituloDefault: 'Monitoreo de helada y congelamiento de carpeta asfáltica',
 *         creditoDefault: 'Secretaría de Gobierno • Protección Civil Hidalgo'
 *       }
 * 3. PASO 3: En `/src/components/IncidentsTable.tsx`:
 *    - Agrega la `<option value="heladas">Heladas y Bajas Temperaturas</option>` en el filtro.
 * =========================================================================================
 */
export type AffectationCategory =
  | 'deslaves'
  | 'derrumbes'
  | 'socavon'
  | 'afectaciones_estructurales'
  | 'creciente_rios'
  | 'vias_accesos'
  | 'encharcamientos'
  | 'personas_atrapadas'
  | 'personas_lesionadas'
  | 'persona_sin_signos'
  | 'caida_arboles'
  | 'suministro_electrico'
  | 'drenaje_colapsado'
  | 'evacuaciones_preventivas'
  | 'refugios_temporales'
  | 'monitoreo_hidrologico'
  | 'monitoreo_preventivo'
  | 'accidentes'
  | 'vehiculos_atrapados'
  // --- PUEDES AGREGAR MÁS RUBROS AQUÍ ABAJO CONFORME SE PRESENTEN EN EL AÑO: ---
  // | 'heladas'
  // | 'granizadas'
  // | 'incendios_forestales'
  // | 'afectacion_puentes'
  // | 'falla_suministro_agua'
  ;

export interface Incident {
  id: string;
  municipio: string;
  comunidadPunto: string;
  ubicacion: string;
  tipoAfectacion: AffectationCategory;
  tipoAfectacionLabel: string;
  fenomenoId?: string; // ID del evento ("primer-fenomeno-sin-nombre" | "canal-baja-presion-octubre" | "frente-frio-num-2")
  fenomenoNombre?: string;
  estatusOficial: string;
  estatusCategoria: StatusCategory;
  afectacionDetalle: string;
  accionAtencion?: string;
  documentoOrigen: string;
  paginaDocumento: number;
  fechaReporte: string;
  referenciaSIPDUS?: string;
  ultimaVerificacion: string;
  puntosContabilizados?: number;
  esHistoricoSipdus?: boolean;
  coordenadasAprox?: [number, number];
  // Evidencia Fotográfica Oficial
  fotoUrl?: string;
  fotoTitulo?: string;
  fotoTema?: string;
  fotoFecha?: string;
  fotoCredito?: string;
}

export interface MunicipalitySummary {
  cve_mun: string;
  nombre: string;
  nombreOficial: string;
  regionPC: string;
  cabecera: string;
  lat: number;
  lng: number;
  semaforo: SemaforoLevel;
  semaforoValidado: boolean;
  motivoSemaforo: string;
  criteriosCumplidos: string[];
  totalIncidentes: number;
  activos: number;
  atendidos: number;
  enSeguimiento: number;
  comunidadesAfectadas: string[];
  viasAfectadas: string[];
  comunidadesIncomunicadas: string[];
  serviciosAfectados: string[];
  refugioTemporalActivo?: boolean;
  personaFallecida?: boolean;
  personasLesionadas?: number;
  personasRescatadas?: number;
  notasOficiales?: string;
}

export interface SemaforoRule {
  id: string;
  nivel: SemaforoLevel;
  nombre: string;
  descripcion: string;
  criterios: string[];
  baseLegal: string;
  validadorSugerido: string;
}

export interface PDFReportMetadata {
  titulo: string;
  subtitulo: string;
  dependencia: string;
  fechaIntegracion: string;
  horaIntegracion: string;
  referenciaSIPDUS: string;
  volumetriaSIPDUS: {
    caminosContingencia: number;
    caminosCerrados: number;
    caminosAbiertosParcial: number;
    caminosAtendidos100: number;
    puentesAfectados: number;
    m3Cuantificados: number;
    m3Retirados: number;
    m3Pendientes: number;
  };
  resumenIncidentes: {
    deslaves: { activos: number; atendidos: number; total: number };
    derrumbes: { activos: number; atendidos: number; total: number };
    socavones: { activos: number; atendidos: number; total: number };
    estructurales: { activos: number; atendidos: number; total: number };
    crecienteRios: { activos: number; atendidos: number; total: number };
    viasAccesos: { activos: number; atendidos: number; total: number };
    encharcamientos: { activos: number; atendidos: number; total: number };
    personasLesionadas: number;
    personasAtrapadas: { activos: number; atendidos: number; total: number };
    personaSinSignos: { activos: number; atendidos: number; total: number };
    caidaArboles: { activos: number; atendidos: number; total: number };
    suministroElectrico: { activos: number; atendidos: number; total: number };
    drenajeColapsado: { activos: number; atendidos: number; total: number };
    evacuacionesPreventivas: { activos: number; atendidos: number; total: number };
    refugiosTemporales: { activos: number; atendidos: number; total: number };
    monitoreoHidrologico: { activos: number; atendidos: number; total: number };
    monitoreoPreventivo: { activos: number; atendidos: number; total: number };
    accidentes: { activos: number; atendidos: number; total: number };
    vehiculosAtrapados: { activos: number; atendidos: number; total: number };
  };
}

export interface ExtractionChangeItem {
  id: string;
  municipio: string;
  comunidadPunto: string;
  tipoAfectacion: AffectationCategory;
  estatusAnterior?: string;
  estatusNuevo: string;
  tipoCambio: 'nuevo' | 'actualizacion_estatus' | 'resuelto' | 'sin_cambio';
  detalle: string;
  paginaReferencia: number;
  aprobadoParaAplicar: boolean;
}
