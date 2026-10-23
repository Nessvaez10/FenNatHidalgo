import { FenomenoHistorico, AffectationCategory } from '../types';

/*
 * =========================================================================================================
 * 🌪️ GUÍA TÉCNICA 1: CÓMO AGREGAR MÁS FENÓMENOS METEOROLÓGICOS AL HISTÓRICO BIENAL
 * =========================================================================================================
 * Para añadir un 4°, 5° o más fenómenos durante el año (ej. 'Frente Frío núm 3', 'Tormenta Tropical Alberto'):
 *
 * OPCIÓN A: DIRECTAMENTE DESDE CÓDIGO (Recomendado para fijar en el sistema)
 * 1. En `/src/types/index.ts`: Añade el id en `FenomenoId` (ej: | 'frente-frio-num-3').
 * 2. En este archivo (abajo): Ve al arreglo `FENOMENOS_HISTORICOS_2_ANOS` y copia la plantilla comentada
 *    "➕ PLANTILLA LISTA PARA COPIAR Y PEGAR NUEVO FENÓMENO".
 *
 * OPCIÓN B: DIRECTAMENTE DESDE LA PLATAFORMA (Sin tocar código)
 * 1. En la barra superior, haz clic en el botón "Fenómenos e Histórico".
 * 2. En la primera pestaña, pulsa "+ Registrar Nuevo Fenómeno".
 * 3. Escribe el nombre, periodo, año y descripción; quedará registrado en vivo en la sesión.
 *
 * =========================================================================================================
 * 🏷️ GUÍA TÉCNICA 2: CÓMO SE VINCULAN LOS RUBROS E INCIDENCIAS A UN FENÓMENO
 * =========================================================================================================
 * Cada fenómeno agrupa sus propios incidentes y sus propios rubros automáticamente.
 * Para que un incidente pertenezca a un fenómeno específico, simplemente se le asigna:
 *
 *   {
 *     id: "inc-001",
 *     municipio: "Zacualtipán de Ángeles",
 *     fenomenoId: "frente-frio-num-3",          // ⬅️ Vincula al fenómeno por su id
 *     fenomenoNombre: "Frente Frío núm 3",      // ⬅️ Nombre oficial legible
 *     tipoAfectacion: "derrumbes",              // ⬅️ Rubro de afectación (deslaves, derrumbes, etc.)
 *     tipoAfectacionLabel: "Derrumbes en Carreteras",
 *     estatusCategoria: "vigente_activo",       // ⬅️ 'vigente_activo' | 'atendido'
 *     ...
 *   }
 *
 * El mapa, el tablero de mando y los filtros por rubro se adaptan en tiempo real al fenómeno activo.
 *
 * =========================================================================================================
 * 📋 GUÍA TÉCNICA 3: CÓMO AGREGAR NUEVAS CATEGORÍAS/RUBROS DE AFECTACIÓN DURANTE EL AÑO
 * =========================================================================================================
 * Si surge una nueva tipología (ej: 'heladas', 'granizadas', 'incendios_forestales'):
 * 1. En `/src/types/index.ts`: Agrega la clave al tipo `AffectationCategory` (ej: | 'heladas').
 * 2. En este archivo: Agrega la entrada en `RUBROS_AFECTACION` y en `FOTOS_POR_TEMA` (ver plantillas abajo).
 * 3. En `/src/components/IncidentsTable.tsx`: Agrega `<option value="heladas">Heladas</option>`.
 * =========================================================================================================
 */

// =========================================================================================================
// 🌪️ CATÁLOGO PRINCIPAL DE FENÓMENOS (INCLUYE LOS 3 SOLICITADOS POR LA SECRETARÍA DE GOBIERNO)
// =========================================================================================================
// 🌪️ CATÁLOGO PRINCIPAL DE FENÓMENOS (3 FENÓMENOS SEPARADOS Y DIFERENTES: JUNIO, JULIO Y OCTUBRE + FRENTE FRÍO)
// =========================================================================================================
export const FENOMENOS_HISTORICOS_2_ANOS: FenomenoHistorico[] = [
  {
    // 1. FENÓMENO DE JUNIO (Corte Histórico 17 de Junio 2026, 18:34 h)
    id: 'lluvias-junio-2026',
    nombre: 'Temporal de Lluvias de Junio (9 al 17 de Junio)',
    periodo: '9 al 17 de Junio 2026',
    ano: 2026,
    descripcion: 'Concentrado ejecutivo oficial de afectaciones por lluvias. 33 registros acumulados (23 finalizados, 5 en atención, 5 pendientes) en 18 municipios: 14 derrumbes/deslaves, 3 arrastres de material, 3 cierres totales, 5 caídas de árboles, encharcamientos y suministro eléctrico.',
    activo: false,
    archivoPdfPrincipal: '/assets/aistudio/Concentrado_Ejecutivo_Lluvias_17Jun2026_Formato_Institucional_4789bd8a.pdf',
    archivosPdfsHistoricos: [
      {
        titulo: 'Corte Histórico 17/Junio 18:34 h - Concentrado Ejecutivo Oficial',
        archivo: '/assets/aistudio/Concentrado_Ejecutivo_Lluvias_17Jun2026_Formato_Institucional_4789bd8a.pdf',
        fecha: '17/06/2026 18:34 h'
      }
    ],
    totalIncidentesRegistrados: 33,
    zonaAfectadaPrincipal: 'Sierra Alta, Otomí-Tepehua, Valle de Tulancingo, Altiplano'
  },
  {
    // 2. FENÓMENO DE JULIO (Periodo del 10 al 22 de Julio 2026 | Cierres Homologados)
    id: 'lluvias-julio-2026',
    nombre: 'Temporal de Lluvias de Julio (10 al 22 de Julio)',
    periodo: '10 al 22 de Julio 2026',
    ano: 2026,
    descripcion: 'Concentrado ejecutivo de afectaciones por lluvias y cierres homologados. 15 registros totales (3 puntos viales restituidos al 100%: Tlanchinol, Huautla y Huehuetla; más 12 árboles atendidos en 8 municipios).',
    activo: false,
    archivoPdfPrincipal: '/assets/aistudio/Concentrado_Ejecutivo_Lluvias_10al22Jul2026_Cierres_Atendidos_a352457a.pdf',
    archivosPdfsHistoricos: [
      {
        titulo: 'Corte Homologado 10 al 22 de Julio - Actualización de Cierres Viales y Árboles',
        archivo: '/assets/aistudio/Concentrado_Ejecutivo_Lluvias_10al22Jul2026_Cierres_Atendidos_a352457a.pdf',
        fecha: '22/07/2026 18:00 h'
      }
    ],
    totalIncidentesRegistrados: 15,
    zonaAfectadaPrincipal: 'Sierra Alta, Huasteca, Valle de Tulancingo, Valle del Mezquital'
  },
  {
    // 3. FENÓMENO DE OCTUBRE (Canal de Baja Presión del 1 al 10 de Octubre | 218 incidencias)
    id: 'canal-baja-presion-octubre',
    nombre: 'Canal de Baja Presión de Octubre (1 al 10 de Octubre)',
    periodo: '1 al 10 de Octubre 2026',
    ano: 2026,
    descripcion: 'Cruce municipal oficial: Lluvias, tarjetas informativas SSPCyGR y concentración SIPDUS. 218 afectaciones documentadas en 44 municipios (deslaves, derrumbes, creciente de ríos, afectaciones a puentes, socavones y vías).',
    activo: true,
    archivoPdfPrincipal: '/assets/aistudio/Concentrado_Ejecutivo_Cruzado_01al10Oct2026_0d9667b0.pdf',
    archivosPdfsHistoricos: [
      {
        titulo: 'Cruce Municipal 1 al 10 de Octubre - Concentrado Ejecutivo Cruzado SSPCyGR / Tarjetas',
        archivo: '/assets/aistudio/Concentrado_Ejecutivo_Cruzado_01al10Oct2026_0d9667b0.pdf',
        fecha: '10/10/2026 20:27 h'
      },
      {
        titulo: 'Corte Oficial 20/Octubre 21:13 h - Concentrado Ejecutivo SIPDUS / SICT Federal',
        archivo: '/assets/aistudio/Concentrado_Ejecutivo_Lluvias_20Oct2026_2113_Corregido_Infraestructura_Federal_63c258fe.pdf',
        fecha: '20/10/2026 21:13 h'
      }
    ],
    totalIncidentesRegistrados: 218,
    zonaAfectadaPrincipal: 'Sierra Alta, Huasteca, Otomí-Tepehua, Valle del Mezquital'
  },
  {
    // 4. FENÓMENO INVERNAL (Frente Frío núm 2)
    id: 'frente-frio-num-2',
    nombre: 'Frente Frío núm 2',
    periodo: 'Temporada Invernal 2025 - 2026',
    ano: 2025,
    descripcion: 'Masa de aire polar ártico asociada al Frente Frío núm 2, con precipitaciones, niebla densa, heladas en zonas altas y saturación de humedad en laderas de la sierra.',
    activo: false,
    totalIncidentesRegistrados: 0,
    zonaAfectadaPrincipal: 'Sierra de Zacualtipán, Corredor de la Montaña, Molango'
  }

  /*
   * =====================================================================================================
   * ➕ PLANTILLA LISTA PARA COPIAR Y PEGAR UN NUEVO FENÓMENO ADICIONAL (5°, 6°, etc.):
   * =====================================================================================================
   * ,
   * {
   *   id: 'frente-frio-num-3',
   *   nombre: 'Frente Frío núm 3',
   *   periodo: '15 al 22 de Noviembre 2026',
   *   ano: 2026,
   *   descripcion: 'Evento invernal con vientos arrachados y heladas en zonas serranas y de la Huasteca.',
   *   activo: false,
   *   archivoPdfPrincipal: '/assets/aistudio/reporte_frente3.pdf',
   *   totalIncidentesRegistrados: 0,
   *   zonaAfectadaPrincipal: 'Sierra Alta, Otomí-Tepehua, Altiplano'
   * }
   * =====================================================================================================
   */
];

// Catálogo de Rubros / Temas de Afectación (Segmentación directa por tema solicitada)
export interface RubroConfig {
  id: AffectationCategory;
  nombre: string;
  nombreCorto: string;
  colorHex: string;
  badgeClass: string;
  bgClass: string;
}

export const RUBROS_AFECTACION: Record<AffectationCategory, RubroConfig> = {
  derrumbes: {
    id: 'derrumbes',
    nombre: 'Derrumbes en Carreteras',
    nombreCorto: 'Derrumbes',
    colorHex: '#b45309',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    bgClass: 'bg-amber-50'
  },
  deslaves: {
    id: 'deslaves',
    nombre: 'Deslaves y Deslizamientos',
    nombreCorto: 'Deslaves',
    colorHex: '#c2410c',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    bgClass: 'bg-orange-50'
  },
  socavon: {
    id: 'socavon',
    nombre: 'Socavones y Hundimientos',
    nombreCorto: 'Socavones',
    colorHex: '#dc2626',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    bgClass: 'bg-red-50'
  },
  creciente_rios: {
    id: 'creciente_rios',
    nombre: 'Creciente y Desbordamiento de Ríos',
    nombreCorto: 'Creciente de Ríos',
    colorHex: '#0284c7',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    bgClass: 'bg-sky-50'
  },
  afectaciones_estructurales: {
    id: 'afectaciones_estructurales',
    nombre: 'Afectaciones a Puentes y Estructuras',
    nombreCorto: 'Estructuras / Puentes',
    colorHex: '#7c3aed',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-300',
    bgClass: 'bg-violet-50'
  },
  vias_accesos: {
    id: 'vias_accesos',
    nombre: 'Vías y Accesos Restringidos',
    nombreCorto: 'Vías y Accesos',
    colorHex: '#ea580c',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    bgClass: 'bg-amber-50'
  },
  encharcamientos: {
    id: 'encharcamientos',
    nombre: 'Inundaciones y Encharcamientos',
    nombreCorto: 'Inundaciones',
    colorHex: '#0891b2',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    bgClass: 'bg-cyan-50'
  },
  suministro_electrico: {
    id: 'suministro_electrico',
    nombre: 'Afectaciones al Suministro Eléctrico (CFE)',
    nombreCorto: 'Red Eléctrica CFE',
    colorHex: '#d97706',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    bgClass: 'bg-yellow-50'
  },
  caida_arboles: {
    id: 'caida_arboles',
    nombre: 'Caída de Árboles y Despeje de Vía',
    nombreCorto: 'Caída de Árboles',
    colorHex: '#15803d',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgClass: 'bg-emerald-50'
  },
  refugios_temporales: {
    id: 'refugios_temporales',
    nombre: 'Refugios Temporales y Albergues',
    nombreCorto: 'Refugios Temporales',
    colorHex: '#e11d48',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    bgClass: 'bg-rose-50'
  },
  monitoreo_hidrologico: {
    id: 'monitoreo_hidrologico',
    nombre: 'Monitoreo Hidrológico de Presas y Bordos',
    nombreCorto: 'Monitoreo Presas',
    colorHex: '#2563eb',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    bgClass: 'bg-blue-50'
  },
  monitoreo_preventivo: {
    id: 'monitoreo_preventivo',
    nombre: 'Monitoreo Preventivo e Inspecciones',
    nombreCorto: 'Monitoreo Preventivo',
    colorHex: '#475569',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    bgClass: 'bg-slate-50'
  },
  personas_atrapadas: {
    id: 'personas_atrapadas',
    nombre: 'Auxilio a Personas Incomunicadas / Atrapadas',
    nombreCorto: 'Personas Atrapadas',
    colorHex: '#dc2626',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    bgClass: 'bg-red-50'
  },
  personas_lesionadas: {
    id: 'personas_lesionadas',
    nombre: 'Atención a Personas Lesionadas',
    nombreCorto: 'Personas Lesionadas',
    colorHex: '#b91c1c',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    bgClass: 'bg-red-50'
  },
  persona_sin_signos: {
    id: 'persona_sin_signos',
    nombre: 'Persona Sin Signos Vitales',
    nombreCorto: 'Sin Signos',
    colorHex: '#991b1b',
    badgeClass: 'bg-red-200 text-red-900 border-red-400',
    bgClass: 'bg-red-50'
  },
  drenaje_colapsado: {
    id: 'drenaje_colapsado',
    nombre: 'Drenaje Colapsado y Azolvamiento',
    nombreCorto: 'Drenaje Colapsado',
    colorHex: '#64748b',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    bgClass: 'bg-slate-50'
  },
  evacuaciones_preventivas: {
    id: 'evacuaciones_preventivas',
    nombre: 'Evacuaciones Preventivas',
    nombreCorto: 'Evacuaciones',
    colorHex: '#ea580c',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    bgClass: 'bg-orange-50'
  },
  accidentes: {
    id: 'accidentes',
    nombre: 'Accidentes Viales por Condiciones Meteorológicas',
    nombreCorto: 'Accidentes Viales',
    colorHex: '#d97706',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    bgClass: 'bg-amber-50'
  },
  vehiculos_atrapados: {
    id: 'vehiculos_atrapados',
    nombre: 'Vehículos Atrapados en Corrientes o Lodo',
    nombreCorto: 'Vehículos Atrapados',
    colorHex: '#b45309',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    bgClass: 'bg-amber-50'
  }

  /*
   * =====================================================================================================
   * ➕ PLANTILLA LISTA PARA COPIAR Y PEGAR UN NUEVO RUBRO DE AFECTACIÓN:
   * =====================================================================================================
   * Si agregaste una nueva clave en `AffectationCategory` en `/src/types/index.ts` (ej: 'heladas'),
   * copia y pega este bloque antes de cerrar la llave de `RUBROS_AFECTACION`:
   *
   * ,
   * heladas: {
   *   id: 'heladas',
   *   nombre: 'Heladas y Bajas Temperaturas',
   *   nombreCorto: 'Heladas',
   *   colorHex: '#0284c7',
   *   badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
   *   bgClass: 'bg-sky-50'
   * }
   * =====================================================================================================
   */
};

// Catálogo de fotografías oficiales integradas en el proyecto por tema
export interface FotoEvidenciaTema {
  tema: string;
  url: string;
  tituloDefault: string;
  creditoDefault: string;
}

export const FOTOS_POR_TEMA: Record<string, FotoEvidenciaTema> = {
  derrumbes: {
    tema: 'Derrumbes en Carreteras y Caminos',
    url: '/assets/evidencias/evidencia_derrumbes.svg',
    tituloDefault: 'Derrumbe de material pétreo sobre carpeta asfáltica en tramo serrano',
    creditoDefault: 'Secretaría de Gobierno • Protección Civil Hidalgo / SIPDUS'
  },
  deslaves: {
    tema: 'Deslaves y Deslizamientos de Ladera',
    url: '/assets/evidencias/evidencia_deslaves.svg',
    tituloDefault: 'Deslizamiento activo de ladera con riesgo a viviendas y desalojo preventivo',
    creditoDefault: 'Secretaría de Gobierno • Protección Civil Hidalgo'
  },
  socavon: {
    tema: 'Socavones y Hundimientos',
    url: '/assets/evidencias/evidencia_socavon.svg',
    tituloDefault: 'Socavón de consideración en vialidad con acordonamiento preventivo',
    creditoDefault: 'Secretaría de Gobierno • Protección Civil Municipal'
  },
  creciente_rios: {
    tema: 'Creciente y Desbordamiento de Ríos',
    url: '/assets/evidencias/evidencia_creciente_rios.svg',
    tituloDefault: 'Monitoreo de cauce y escurrimientos pluviales extraordinarios',
    creditoDefault: 'Secretaría de Gobierno • Comisión Estatal del Agua / PC'
  },
  encharcamientos: {
    tema: 'Inundaciones y Encharcamientos Urbanos',
    url: '/assets/evidencias/evidencia_inundaciones.svg',
    tituloDefault: 'Acumulación pluvial severa e inspección de paso vehicular',
    creditoDefault: 'Secretaría de Gobierno • Brigadas de Respuesta Inmediata'
  },
  afectaciones_estructurales: {
    tema: 'Afectaciones a Estructuras y Puentes',
    url: '/assets/evidencias/evidencia_estructuras.svg',
    tituloDefault: 'Fisuras y compromiso estructural en puente vehicular / muro de contención',
    creditoDefault: 'Secretaría de Gobierno • Dictamen Técnico SIPDUS'
  },
  vias_accesos: {
    tema: 'Vías y Accesos Restringidos',
    url: '/assets/evidencias/evidencia_vias_accesos.svg',
    tituloDefault: 'Paso habilitado a un solo carril con señalamiento de obra',
    creditoDefault: 'Secretaría de Gobierno • SIPDUS / SICT Federal'
  },
  suministro_electrico: {
    tema: 'Afectaciones al Suministro Eléctrico',
    url: '/assets/evidencias/evidencia_suministro_electrico.svg',
    tituloDefault: 'Postes y cableado derribado por rachas de viento y caída de ramas',
    creditoDefault: 'Secretaría de Gobierno • Cuadrilla CFE'
  },
  caida_arboles: {
    tema: 'Caída de Árboles y Despeje de Vía',
    url: '/assets/evidencias/evidencia_caida_arboles.svg',
    tituloDefault: 'Árbol colapsado sobre vía pública seccionado con motosierra',
    creditoDefault: 'Secretaría de Gobierno • Bomberos y Protección Civil'
  },
  refugios_temporales: {
    tema: 'Refugios Temporales y Auxilio',
    url: '/assets/evidencias/evidencia_refugios.svg',
    tituloDefault: 'Habilitación de albergue temporal y entrega de colchonetas y víveres',
    creditoDefault: 'Secretaría de Gobierno • DIF Hidalgo / Protección Civil'
  },
  monitoreo_hidrologico: {
    tema: 'Monitoreo Hidrológico de Presas y Ríos',
    url: '/assets/evidencias/evidencia_creciente_rios.svg',
    tituloDefault: 'Monitoreo de niveles en presas, vertedores y ríos principales',
    creditoDefault: 'Secretaría de Gobierno • CONAGUA / CEAA / Protección Civil'
  },
  monitoreo_preventivo: {
    tema: 'Monitoreo Preventivo y Recorridos',
    url: '/assets/evidencias/evidencia_monitoreo.svg',
    tituloDefault: 'Inspección técnica de zonas vulnerables y laderas serranas',
    creditoDefault: 'Secretaría de Gobierno • Unidad de Monitoreo Preventivo'
  }

  /*
   * =====================================================================================================
   * ➕ PLANTILLA FOTOGRÁFICA LISTA PARA COPIAR Y PEGAR PARA EL NUEVO RUBRO:
   * =====================================================================================================
   * ,
   * heladas: {
   *   tema: 'Heladas y Bajas Temperaturas',
   *   url: '/assets/evidencias/evidencia_monitoreo.svg',
   *   tituloDefault: 'Monitoreo de helada y congelamiento de carpeta asfáltica',
   *   creditoDefault: 'Secretaría de Gobierno • Protección Civil Hidalgo'
   * }
   * =====================================================================================================
   */
};
