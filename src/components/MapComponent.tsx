import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { MunicipalitySummary, Incident, SemaforoLevel, AffectationCategory, FenomenoHistorico } from '../types';
import { normalizeMunicipalityName } from '../utils/semaforoLogic';
import { RUBROS_AFECTACION, FOTOS_POR_TEMA } from '../data/phenomenaData';
import { 
  Layers, 
  Search, 
  RotateCcw, 
  AlertTriangle, 
  Info, 
  MapPin, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2, 
  Camera, 
  Filter,
  Calendar
} from 'lucide-react';

interface MapComponentProps {
  municipalities: MunicipalitySummary[];
  incidents: Incident[];
  selectedMunicipality: MunicipalitySummary | null;
  onSelectMunicipality: (municipality: MunicipalitySummary) => void;
  onOpenCriteria: () => void;
  onOpenPhoto?: (incident: Incident) => void;
  onOpenPhenomenaManager?: () => void;
  phenomenaList?: FenomenoHistorico[];
  activePhenomenonId?: string | 'all';
  onSelectPhenomenonId?: (id: string | 'all') => void;
  activeCategoryFilter?: AffectationCategory | 'all';
  onSelectCategoryFilter?: (cat: AffectationCategory | 'all') => void;
}

const SEMAFORO_COLORS: Record<SemaforoLevel, { fill: string; stroke: string; label: string; text: string }> = {
  rojo: { fill: '#dc2626', stroke: '#991b1b', label: 'Crítico', text: 'text-red-700 bg-red-50 border-red-200' },
  naranja: { fill: '#ea580c', stroke: '#c2410c', label: 'Alto', text: 'text-orange-700 bg-orange-50 border-orange-200' },
  amarillo: { fill: '#eab308', stroke: '#ca8a04', label: 'Moderado', text: 'text-amber-700 bg-amber-50 border-amber-200' },
  verde: { fill: '#16a34a', stroke: '#15803d', label: 'Sin afectaciones activas', text: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  gris: { fill: '#94a3b8', stroke: '#64748b', label: 'Información no reportada', text: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const RUBRO_ICONS: Record<string, { symbol: string; color: string }> = {
  derrumbes: { symbol: '⛰️', color: 'bg-amber-600 text-white' },
  deslaves: { symbol: '⚠️', color: 'bg-orange-600 text-white' },
  socavon: { symbol: '🕳️', color: 'bg-red-600 text-white' },
  creciente_rios: { symbol: '💧', color: 'bg-sky-600 text-white' },
  afectaciones_estructurales: { symbol: '🏗️', color: 'bg-violet-600 text-white' },
  vias_accesos: { symbol: '🚧', color: 'bg-amber-700 text-white' },
  encharcamientos: { symbol: '🌊', color: 'bg-cyan-600 text-white' },
  suministro_electrico: { symbol: '⚡', color: 'bg-yellow-600 text-white' },
  caida_arboles: { symbol: '🌲', color: 'bg-emerald-600 text-white' },
  refugios_temporales: { symbol: '🏠', color: 'bg-rose-600 text-white' },
  monitoreo_hidrologico: { symbol: '📊', color: 'bg-blue-600 text-white' },
  monitoreo_preventivo: { symbol: '🔍', color: 'bg-slate-600 text-white' },
  personas_atrapadas: { symbol: '🆘', color: 'bg-red-700 text-white' },
  personas_lesionadas: { symbol: '🩹', color: 'bg-red-600 text-white' },
  persona_sin_signos: { symbol: '✝️', color: 'bg-zinc-800 text-white' },
  drenaje_colapsado: { symbol: '🔧', color: 'bg-slate-700 text-white' },
  evacuaciones_preventivas: { symbol: '🚶', color: 'bg-orange-600 text-white' },
  accidentes: { symbol: '🚗', color: 'bg-amber-600 text-white' },
  vehiculos_atrapados: { symbol: '🚙', color: 'bg-amber-700 text-white' }
};

export const MapComponent: React.FC<MapComponentProps> = ({
  municipalities,
  incidents,
  selectedMunicipality,
  onSelectMunicipality,
  onOpenCriteria,
  onOpenPhoto,
  onOpenPhenomenaManager,
  phenomenaList = [],
  activePhenomenonId = 'canal-baja-presion-octubre',
  onSelectPhenomenonId,
  activeCategoryFilter = 'all',
  onSelectCategoryFilter
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  
  const [geoData, setGeoData] = useState<any>(null);
  const [loadingGeo, setLoadingGeo] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical_high' | 'with_incidents'>('all');
  const [showCriticalMarkers, setShowCriticalMarkers] = useState<boolean>(true);
  const [activeBasemap, setActiveBasemap] = useState<'blanco' | 'satellite' | 'osm' | 'google'>('blanco');

  // Map of normalized name to summary
  const summaryByNormalizedName = useMemo(() => {
    const map = new Map<string, MunicipalitySummary>();
    municipalities.forEach(m => {
      map.set(normalizeMunicipalityName(m.nombre), m);
      map.set(normalizeMunicipalityName(m.nombreOficial), m);
    });
    return map;
  }, [municipalities]);

  // Load GeoJSON once
  useEffect(() => {
    setLoadingGeo(true);
    fetch('/data/hidalgo_municipios.geojson')
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar el archivo GeoJSON");
        return res.json();
      })
      .then(data => {
        setGeoData(data);
        setLoadingGeo(false);
      })
      .catch(err => {
        console.error("Error al cargar GeoJSON:", err);
        setLoadingGeo(false);
      });
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.52, -98.85],
      zoom: 8.4,
      zoomSnap: 0.2,
      minZoom: 7,
      maxZoom: 16,
    });

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch basemap tile layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
      currentTileLayerRef.current = null;
    }

    if (activeBasemap === 'google') {
      const layer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20
      }).addTo(map);
      currentTileLayerRef.current = layer;
    } else if (activeBasemap === 'satellite') {
      const layer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20
      }).addTo(map);
      currentTileLayerRef.current = layer;
    } else if (activeBasemap === 'osm') {
      const layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      currentTileLayerRef.current = layer;
    }
  }, [activeBasemap]);

  // Render polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }

    const geoLayer = L.geoJSON(geoData, {
      style: (feature) => {
        const rawName = feature?.properties?.NOMGEO || feature?.properties?.nom_mun || feature?.properties?.name || '';
        const norm = normalizeMunicipalityName(rawName);
        const summary = summaryByNormalizedName.get(norm);
        const semaforo: SemaforoLevel = summary ? summary.semaforo : 'gris';
        const colorCfg = SEMAFORO_COLORS[semaforo];

        const isFilteredOut = 
          (activeFilter === 'critical_high' && semaforo !== 'rojo' && semaforo !== 'naranja') ||
          (activeFilter === 'with_incidents' && (!summary || summary.totalIncidentes === 0));

        const isSelected = selectedMunicipality && normalizeMunicipalityName(selectedMunicipality.nombre) === norm;

        return {
          fillColor: colorCfg.fill,
          fillOpacity: isFilteredOut ? 0.12 : (isSelected ? 0.88 : (activeBasemap === 'blanco' ? 0.72 : 0.65)),
          color: isSelected ? '#1e1b4b' : (isFilteredOut ? '#cbd5e1' : colorCfg.stroke),
          weight: isSelected ? 3.5 : (activeBasemap === 'satellite' ? 1.5 : 1.2),
          opacity: isFilteredOut ? 0.3 : 1,
        };
      },
      onEachFeature: (feature, layer) => {
        const rawName = feature?.properties?.NOMGEO || feature?.properties?.nom_mun || feature?.properties?.name || '';
        const norm = normalizeMunicipalityName(rawName);
        const summary = summaryByNormalizedName.get(norm);

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 2.8,
              color: '#0f172a',
              fillOpacity: 0.88
            });
            l.bringToFront();
          },
          mouseout: (e) => {
            if (geojsonLayerRef.current) {
              geojsonLayerRef.current.resetStyle(e.target);
            }
          },
          click: () => {
            if (summary) {
              onSelectMunicipality(summary);
            }
          }
        });

        const semaforo: SemaforoLevel = summary ? summary.semaforo : 'gris';
        const semLabel = SEMAFORO_COLORS[semaforo].label;
        const total = summary ? summary.totalIncidentes : 0;
        const activos = summary ? summary.activos : 0;
        const atendidos = summary ? summary.atendidos : 0;
        const region = summary ? summary.regionPC : 'Hidalgo';

        const tooltipContent = `
          <div class="text-xs font-sans leading-tight p-1 min-w-[190px]">
            <div class="font-bold text-slate-900 text-sm border-b pb-1 mb-1.5 flex items-center justify-between">
              <span>${summary ? summary.nombre : rawName}</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${SEMAFORO_COLORS[semaforo].text}">
                ${semLabel}
              </span>
            </div>
            <div class="text-slate-600 text-[11px] mb-1">
              <strong>Región:</strong> ${region}
            </div>
            <div class="grid grid-cols-2 gap-1 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200 mb-1.5">
              <div>En proceso: <strong class="text-rose-700">${activos}</strong></div>
              <div>Atendidos: <strong class="text-emerald-700">${atendidos}</strong></div>
              <div class="col-span-2 text-slate-700">Total incidencias: <strong>${total}</strong></div>
            </div>
            <div class="text-[10px] text-slate-400 italic">
              Haz clic para ver desglose, fotos y ficha técnica.
            </div>
          </div>
        `;

        layer.bindTooltip(tooltipContent, {
          sticky: true,
          direction: 'auto',
          className: 'custom-leaflet-tooltip shadow-xl border-slate-300'
        });
      }
    }).addTo(map);

    geojsonLayerRef.current = geoLayer;
  }, [geoData, summaryByNormalizedName, selectedMunicipality, activeFilter, activeBasemap, onSelectMunicipality]);

  // Render incident markers
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    if (!showCriticalMarkers) return;

    // Filter notable incidents
    const notableIncidents = incidents.filter(i => 
      i.tipoAfectacion === 'derrumbes' ||
      i.tipoAfectacion === 'deslaves' ||
      i.tipoAfectacion === 'creciente_rios' ||
      i.tipoAfectacion === 'afectaciones_estructurales' ||
      i.tipoAfectacion === 'socavon' ||
      i.estatusOficial.includes("COMUNIDAD INCOMUNICADA")
    ).slice(0, 50);

    notableIncidents.forEach(inc => {
      const munNorm = normalizeMunicipalityName(inc.municipio);
      const mun = summaryByNormalizedName.get(munNorm);
      if (!mun) return;

      const rubro = RUBROS_AFECTACION[inc.tipoAfectacion] || {
        nombre: inc.tipoAfectacionLabel,
        nombreCorto: inc.tipoAfectacionLabel,
        colorHex: '#c2410c'
      };

      const iconCfg = RUBRO_ICONS[inc.tipoAfectacion] || { symbol: '📍', color: 'bg-rose-600 text-white' };

      // Jitter so multiple markers in same municipality do not overlap
      const jitterLat = (Math.sin(inc.id.length * 17) * 0.035);
      const jitterLng = (Math.cos(inc.id.length * 23) * 0.035);
      const pos: [number, number] = [mun.lat + jitterLat, mun.lng + jitterLng];

      const defaultPhoto = FOTOS_POR_TEMA[inc.tipoAfectacion] || FOTOS_POR_TEMA.derrumbes;
      const photoSrc = inc.fotoUrl || defaultPhoto.url;
      const isActive = inc.estatusCategoria === 'vigente_activo' || inc.estatusCategoria === 'en_seguimiento';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-white ${iconCfg.color} transform hover:scale-125 transition-transform cursor-pointer">
            ${iconCfg.symbol}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(pos, { icon: customIcon });
      
      const popupContent = `
        <div class="text-xs p-1 max-w-xs font-sans">
          <div class="relative w-full h-24 rounded-lg overflow-hidden mb-2 bg-slate-900 border border-slate-200">
            <img src="${photoSrc}" alt="${inc.tipoAfectacionLabel}" class="w-full h-full object-cover" />
            <span class="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white ${isActive ? 'bg-red-600' : 'bg-emerald-600'}">
              ${isActive ? 'En proceso de atención' : 'Atendido'}
            </span>
            <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-900/80 text-amber-300">
              ${rubro.nombreCorto}
            </span>
          </div>

          <div class="font-bold text-slate-800 text-sm border-b pb-1 mb-1">
            ${inc.municipio} • ${inc.comunidadPunto}
          </div>
          <div class="text-[11px] font-semibold text-rose-700 mb-1">
            ${isActive ? 'EN PROCESO DE ATENCIÓN' : inc.estatusOficial}
          </div>
          <div class="text-slate-600 text-[11px] mb-2 leading-relaxed">
            ${inc.afectacionDetalle}
          </div>
          
          <button 
            id="map-popup-btn-${inc.id}" 
            class="w-full py-1 px-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all"
          >
            📷 Ver Fotografía de Incidencia
          </button>
          
          <div class="text-[10px] text-slate-400 mt-2 pt-1 border-t flex justify-between">
            <span>Pág. ${inc.paginaDocumento}</span>
            <span>Ref: ${inc.referenciaSIPDUS || inc.fechaReporte}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`map-popup-btn-${inc.id}`);
          if (btn && onOpenPhoto) {
            btn.onclick = (e) => {
              e.preventDefault();
              onOpenPhoto(inc);
            };
          }
        }, 50);
      });

      markersLayer.addLayer(marker);
    });
  }, [incidents, showCriticalMarkers, summaryByNormalizedName, onOpenPhoto]);

  // Center on selected municipality when it changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedMunicipality) return;

    map.flyTo([selectedMunicipality.lat, selectedMunicipality.lng], 11, {
      duration: 1.2
    });
  }, [selectedMunicipality]);

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([20.52, -98.85], 8.4, { duration: 1 });
    }
  };

  // Filtered municipality list for search box
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return municipalities.filter(m => 
      m.nombre.toLowerCase().includes(term) ||
      m.nombreOficial.toLowerCase().includes(term) ||
      m.regionPC.toLowerCase().includes(term)
    ).slice(0, 6);
  }, [searchTerm, municipalities]);

  // Active phenomenon name
  const activePhenomenonObj = useMemo(() => {
    return phenomenaList.find(p => p.id === activePhenomenonId);
  }, [phenomenaList, activePhenomenonId]);

  return (
    <div className={`relative w-full h-[calc(100vh-145px)] min-h-[580px] ${activeBasemap === 'blanco' ? 'bg-white' : 'bg-slate-100'} overflow-hidden flex flex-col`}>
      {/* Top Map Floating Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        {/* Row 1 (Top): SEGMENTACIÓN DEL MAPA POR TEMA / RUBRO DE AFECTACIÓN */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-lg shadow-md border border-slate-300/80 text-xs max-w-fit">
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider px-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#691C32]" />
            <span>Segmentar por Tema:</span>
          </span>

          <button
            onClick={() => onSelectCategoryFilter && onSelectCategoryFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeCategoryFilter === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos los Rubros
          </button>

          {/* Primary Affectation Themes */}
          {[
            { id: 'derrumbes', label: 'Derrumbes', icon: '⛰️' },
            { id: 'deslaves', label: 'Deslaves', icon: '⚠️' },
            { id: 'creciente_rios', label: 'Creciente de Ríos', icon: '💧' },
            { id: 'afectaciones_estructurales', label: 'Estructuras / Puentes', icon: '🏗️' },
            { id: 'vias_accesos', label: 'Vías y Accesos', icon: '🚧' },
            { id: 'encharcamientos', label: 'Inundaciones', icon: '🌊' },
            { id: 'suministro_electrico', label: 'Red Eléctrica', icon: '⚡' },
            { id: 'caida_arboles', label: 'Caída de Árboles', icon: '🌲' },
            { id: 'refugios_temporales', label: 'Refugios', icon: '🏠' }
          ].map(theme => {
            const isSel = activeCategoryFilter === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectCategoryFilter && onSelectCategoryFilter(isSel ? 'all' : (theme.id as AffectationCategory))}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  isSel
                    ? 'bg-[#691C32] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-rose-50 border border-slate-200 bg-white'
                }`}
              >
                <span>{theme.icon}</span>
                <span>{theme.label}</span>
              </button>
            );
          })}

          {/* Dropdown for other categories */}
          <select
            value={activeCategoryFilter === 'all' ? '' : activeCategoryFilter}
            onChange={(e) => {
              if (onSelectCategoryFilter) {
                onSelectCategoryFilter((e.target.value || 'all') as AffectationCategory | 'all');
              }
            }}
            className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 cursor-pointer"
          >
            <option value="">Más rubros...</option>
            <option value="socavon">Socavones</option>
            <option value="monitoreo_hidrologico">Monitoreo de Presas</option>
            <option value="monitoreo_preventivo">Monitoreo Preventivo</option>
            <option value="personas_atrapadas">Personas Incomunicadas</option>
            <option value="drenaje_colapsado">Drenaje Colapsado</option>
            <option value="evacuaciones_preventivas">Evacuaciones Preventivas</option>
            <option value="accidentes">Accidentes Viales</option>
            <option value="vehiculos_atrapados">Vehículos Atrapados</option>
          </select>
        </div>

        {/* Row 2 (Middle): SELECTOR DE LOS FENÓMENOS */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-lg shadow-md border border-slate-300/80 text-xs max-w-fit">
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider px-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#691C32]" />
            <span>Fenómeno:</span>
          </span>

          {/* All Phenomena button */}
          <button
            onClick={() => onSelectPhenomenonId && onSelectPhenomenonId('all')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activePhenomenonId === 'all'
                ? 'bg-[#691C32] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos los Fenómenos
          </button>

          {/* The requested phenomena */}
          {phenomenaList.map((p, idx) => {
            const isSel = activePhenomenonId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPhenomenonId && onSelectPhenomenonId(p.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  isSel
                    ? 'bg-[#691C32] text-white shadow-xs ring-1 ring-[#BC955B]'
                    : 'text-slate-700 hover:bg-slate-100 bg-slate-50 border border-slate-200'
                }`}
                title={p.descripcion}
              >
                <span className="font-mono text-[10px] opacity-80">{idx + 1}.</span>
                <span>{p.nombre}</span>
                {p.activo && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            );
          })}

          {onOpenPhenomenaManager && (
            <button
              onClick={onOpenPhenomenaManager}
              className="ml-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              title="Abrir Gestor de Fenómenos y Alimentador de Documentos Oficiales en PDF"
            >
              <Layers className="w-3 h-3 text-amber-700" />
              <span>Gestor / Subir PDF</span>
            </button>
          )}
        </div>

        {/* Row 3 (Bottom): BUSCAR ENTRE LOS 84 MUNICIPIOS + SEMÁFORO FILTERS + RESET */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Search bar */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-300/80 p-1 flex items-center relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 ml-2 mr-1" />
            <input
              type="text"
              placeholder="Buscar entre los 84 municipios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-transparent py-1.5 px-2 focus:outline-none text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-slate-400 hover:text-slate-600 px-2 cursor-pointer"
              >
                ×
              </button>
            )}

            {/* Dropdown search results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 z-50">
                {searchResults.map(m => (
                  <div
                    key={m.cve_mun}
                    onClick={() => {
                      onSelectMunicipality(m);
                      setSearchTerm('');
                    }}
                    className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{m.nombre}</div>
                      <div className="text-[10px] text-slate-500">{m.regionPC} • {m.totalIncidentes} afectaciones</div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${SEMAFORO_COLORS[m.semaforo].text}`}>
                      {SEMAFORO_COLORS[m.semaforo].label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Semáforo Filters & Reset */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1 rounded-lg shadow-md border border-slate-300/80 flex items-center gap-1 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
              Filtro:
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                activeFilter === 'all' 
                  ? 'bg-slate-800 text-white shadow-xs font-semibold' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos (84)
            </button>
            <button
              onClick={() => setActiveFilter('critical_high')}
              className={`px-2.5 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer ${
                activeFilter === 'critical_high' 
                  ? 'bg-rose-600 text-white shadow-xs font-semibold' 
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Crítico y Alto
            </button>
            <button
              onClick={() => setActiveFilter('with_incidents')}
              className={`px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                activeFilter === 'with_incidents' 
                  ? 'bg-amber-600 text-white shadow-xs font-semibold' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Con Incidentes
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1"></div>

            <button
              onClick={handleResetView}
              title="Restablecer vista a Hidalgo"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Leaflet Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 cursor-grab active:cursor-grabbing" 
      />

      {/* Bottom Floating Legend & Tools */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] flex flex-wrap items-end justify-between gap-3 pointer-events-none">
        {/* Semáforo Official Legend */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-300/80 max-w-xl text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-[#691C32]"></span>
              <span>Semáforo de Afectaciones Municipales (84 Municipios)</span>
            </div>
            <button
              onClick={onOpenCriteria}
              className="text-[11px] text-[#691C32] hover:text-[#531325] font-semibold underline cursor-pointer flex items-center gap-1"
            >
              <span>Ver Criterios</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded shadow-xs bg-red-600 border border-red-700 shrink-0"></span>
              <div className="leading-tight">
                <span className="font-bold text-slate-800 block">Crítico</span>
                <span className="text-[10px] text-slate-500">Incomunicación/Riesgo</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded shadow-xs bg-orange-500 border border-orange-600 shrink-0"></span>
              <div className="leading-tight">
                <span className="font-bold text-slate-800 block">Alto</span>
                <span className="text-[10px] text-slate-500">Deslaves activos</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded shadow-xs bg-yellow-500 border border-yellow-600 shrink-0"></span>
              <div className="leading-tight">
                <span className="font-bold text-slate-800 block">Moderado</span>
                <span className="text-[10px] text-slate-500">Paso parcial</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded shadow-xs bg-emerald-600 border border-emerald-700 shrink-0"></span>
              <div className="leading-tight">
                <span className="font-bold text-slate-800 block">Sin afectación</span>
                <span className="text-[10px] text-slate-500">Atendidos 100%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded shadow-xs bg-slate-400 border border-slate-500 shrink-0"></span>
              <div className="leading-tight">
                <span className="font-bold text-slate-800 block">Sin reporte</span>
                <span className="text-[10px] text-slate-500">Sin datos de corte</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map View Controls (Basemap Switcher) */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-xl border border-slate-300/80 flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveBasemap('blanco')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeBasemap === 'blanco'
                ? 'bg-[#691C32] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            SIG Limpio
          </button>
          <button
            onClick={() => setActiveBasemap('google')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeBasemap === 'google'
                ? 'bg-[#691C32] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Google Carretero
          </button>
          <button
            onClick={() => setActiveBasemap('satellite')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeBasemap === 'satellite'
                ? 'bg-[#691C32] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Satélite
          </button>

          <div className="h-5 w-px bg-slate-300 mx-1"></div>

          <label className="flex items-center gap-1.5 px-2 py-1 text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCriticalMarkers}
              onChange={(e) => setShowCriticalMarkers(e.target.checked)}
              className="rounded border-slate-300 text-[#691C32] focus:ring-[#691C32]"
            />
            <span className="text-[11px] font-medium">Marcadores de Fotos</span>
          </label>
        </div>
      </div>
    </div>
  );
};
