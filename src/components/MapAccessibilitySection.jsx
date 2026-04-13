import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { withBase } from '../utils/withBase';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const SALUD_FILTER = ['==', ['get', 'tipo'], 'salud'];
const EXTRUSION_COLOR_BY_TIPO = [
  'match',
  ['get', 'tipo'],
  'salud',
  '#09A9E7',
  'jardin',
  '#FD4E51',
  'esp_verde',
  '#0FBC02',
  'esp_verdes',
  '#0FBC02',
  '#cccccc',
];
const EXTRUSION_HEIGHT_FACTOR = 400;
const EXTRUSION_HEIGHT_TRANSITION_MS = 700;

const metricOptions = [
  { id: 'tiempo_medio_01', label: 'Menores ingresos' },
  { id: 'tiempo_medio_10', label: 'Mayores ingresos' },
];

export default function MapAccessibilitySection() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const extrusionAnimRafRef = useRef(null);
  const popupRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('tiempo_medio_01');
  const currentMetricRef = useRef(selectedMetric);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox token missing: define VITE_MAPBOX_TOKEN in your environment.');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-64.42249, -33.35525],
      zoom: 5.69,
      minZoom: 4,
      maxZoom: 10,
      projection: 'mercator',
      bearing: -15,
      antialias: true,
    });

    mapRef.current = map;
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    map.on('load', async () => {
      const firstSymbolLayer = map
        .getStyle()
        .layers?.find((layer) => layer.type === 'symbol')?.id;

      map.setProjection('mercator');
      map.setCenter([-64.42249, -33.35525]);
      map.setZoom(5.69);
      map.setPitch(60);
      map.setBearing(-15);

      let localidadesGeoJson = null;
      try {
        const raw = await fetch(withBase('shapes/tiempos-v3.geojson')).then((r) => r.text());
        const sanitized = raw.replace(/:\s*NaN/g, ': null');
        localidadesGeoJson = JSON.parse(sanitized);
      } catch {
        return;
      }

      map.addSource('localidades_transformadas_5km', {
        type: 'geojson',
        data: localidadesGeoJson,
      });

      map.addSource('argentina-provincias', {
        type: 'geojson',
        data: withBase('shapes/provincias.json'),
      });

      map.addLayer({
        id: 'argentina-provincias-fill',
        type: 'fill',
        source: 'argentina-provincias',
        paint: {
          'fill-color': '#003087',
          'fill-opacity': 0.2,
        },
      }, firstSymbolLayer);

      map.addLayer({
        id: 'localidades-10km-extrusion',
        type: 'fill-extrusion',
        source: 'localidades_transformadas_5km',
        filter: ['!=', ['get', currentMetricRef.current], null],
        paint: {
          'fill-extrusion-color': EXTRUSION_COLOR_BY_TIPO,
          'fill-extrusion-opacity': 1,
          'fill-extrusion-height': ['*', ['get', currentMetricRef.current], EXTRUSION_HEIGHT_FACTOR],
          'fill-extrusion-base': 0,
        },
      }, firstSymbolLayer);

      map.getStyle().layers?.forEach((layer) => {
        if (
          layer.type !== 'symbol' ||
          layer.source !== 'composite' ||
          layer['source-layer'] !== 'place_label'
        ) {
          return;
        }
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      });

      map.addLayer({
        id: 'localidades-10km-labels',
        type: 'symbol',
        source: 'localidades_transformadas_5km',
        filter: SALUD_FILTER,
        layout: {
          'text-field': ['coalesce', ['get', 'localidad'], ''],
          'text-size': ['interpolate', ['linear'], ['zoom'], 2, 11, 4, 12, 6, 14],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.6,
          'text-justify': 'auto',
          'text-optional': true,
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#1f3f57',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.25,
          'text-halo-blur': 0.5,
        },
        minzoom: 2,
      });

      map.addSource('malvinas-label', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [-59.15, -51.75] },
              properties: { name: 'Islas Malvinas' },
            },
          ],
        },
      });

      map.addLayer({
        id: 'malvinas-label-layer',
        type: 'symbol',
        source: 'malvinas-label',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 14,
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-anchor': 'center',
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#1f3f57',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      });

      // Water color
      map.getStyle().layers?.forEach((layer) => {
        const sl = layer['source-layer'];
        if (sl === 'water' && layer.type === 'fill') {
          map.setPaintProperty(layer.id, 'fill-color', '#E7EAF2');
        }
        if (sl === 'waterway' && layer.type === 'line') {
          map.setPaintProperty(layer.id, 'line-color', '#E7EAF2');
        }
      });

      // Inyectar estilos del popup una sola vez
      if (!document.getElementById('custom-map-popup-style')) {
        const style = document.createElement('style');
        style.id = 'custom-map-popup-style';
        style.textContent = `
          .custom-map-popup .mapboxgl-popup-content {
            padding: 0;
            border: 1px solid black;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: "Satoshi", sans-serif;
            width: 350px ;
          }
          .custom-map-popup .mapboxgl-popup-tip {
            border-top-color: black !important;
          }
          .custom-map-popup {
            width: 350px ;
          }
        `;
        document.head.appendChild(style);
      }

      // Tooltip
      const tipoLabels = {
        salud: 'Centro de salud',
        jardin: 'Jardín de infantes',
        esp_verde: 'Espacio verde',
        esp_verdes: 'Espacio verde',
      };
      const formatMin = (v) => (v != null ? `${v === 240 ? "+240" : Math.round(v)} min` : '—');

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: '360px',
        className: 'custom-map-popup',
        anchor: 'bottom',
      });
      popupRef.current = popup;

      map.on('mouseenter', 'localidades-10km-extrusion', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mousemove', 'localidades-10km-extrusion', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties;
        const metricValue = props[currentMetricRef.current];
        if (metricValue == null) {
          popup.remove();
          return;
        }
        const tipoLabel = tipoLabels[props.tipo] || props.tipo;
        const metricLabel = currentMetricRef.current === 'tiempo_medio_01' ? 'Menores ingresos' : 'Mayores ingresos';
        popup
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="padding:16px 20px; color: black;">
              <div style="font-size: 16px;">
                La población de ${metricLabel.toLowerCase()} de <b>${props.localidad || '—'}</b> debe caminar 
                <b>${formatMin(props[currentMetricRef.current])}</b> a pie hasta el ${tipoLabel.toLowerCase()} más cercano.
              </div>
            </div>`
          )
          .addTo(map);
      });

      map.on('mouseleave', 'localidades-10km-extrusion', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

      setMapReady(true);
    });

    return () => {
      if (extrusionAnimRafRef.current != null) {
        window.cancelAnimationFrame(extrusionAnimRafRef.current);
      }
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('localidades-10km-extrusion')) return;

    const fromMetric = currentMetricRef.current;
    const toMetric = selectedMetric;
    if (fromMetric === toMetric) return;

    if (extrusionAnimRafRef.current != null) {
      window.cancelAnimationFrame(extrusionAnimRafRef.current);
    }

    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / EXTRUSION_HEIGHT_TRANSITION_MS);
      const eased = 1 - (1 - t) * (1 - t);

      map.setPaintProperty('localidades-10km-extrusion', 'fill-extrusion-height', [
        '*',
        [
          '+',
          ['*', ['coalesce', ['get', fromMetric], 0], 1 - eased],
          ['*', ['coalesce', ['get', toMetric], 0], eased],
        ],
        EXTRUSION_HEIGHT_FACTOR,
      ]);

      if (t < 1) {
        extrusionAnimRafRef.current = window.requestAnimationFrame(step);
        return;
      }

      map.setPaintProperty('localidades-10km-extrusion', 'fill-extrusion-height', [
        '*',
        ['get', toMetric],
        EXTRUSION_HEIGHT_FACTOR,
      ]);
      map.setFilter('localidades-10km-extrusion', ['!=', ['get', toMetric], null]);
      currentMetricRef.current = toMetric;
      extrusionAnimRafRef.current = null;
    };

    extrusionAnimRafRef.current = window.requestAnimationFrame(step);
  }, [selectedMetric]);

  return (
    <>
      <div className="relative w-full h-[70vh] min-h-[420px] mt-12">
        <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 bg-white shadow-md rounded-full p-1 flex gap-1">
          {metricOptions.map((option) => {
            const isActive = selectedMetric === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedMetric(option.id)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${isActive ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-navy/10'}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div ref={mapContainerRef} className="absolute inset-0" />

        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            className="w-9 h-9 bg-white text-navy text-lg font-light flex items-center justify-center hover:bg-navy/10 transition-colors shadow-md rounded"
            aria-label="Acercar"
          >+</button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            className="w-9 h-9 bg-white text-navy text-lg font-light flex items-center justify-center hover:bg-navy/10 transition-colors shadow-md rounded"
            aria-label="Alejar"
          >−</button>
        </div>

        {!mapReady && (
          <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-navy/60">
            Cargando mapa...
          </div>
        )}
      </div>

      <div className="w-full bg-[#0030870D] py-4 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-6 text-sm text-black justify-center">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#09A9E7]" />
            Centro de salud
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FD4E51]" />
            Jardín de infantes
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0FBC02]" />
            Espacio verde
          </span>
        </div>
      </div>
    </>
  );
}
