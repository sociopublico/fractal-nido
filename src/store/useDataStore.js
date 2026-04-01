import { create } from 'zustand';
import * as d3 from 'd3';
import { withBase } from '../utils/withBase';

const LOCALIDADES_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4qmx1XopDwvHxBj574EUmjT9XlM4OdvxP_DameDIq8qadGzBx1AlWb7BQirXwyvf37FacyS5OJZIw/pub?gid=1970511762&single=true&output=csv';

const TASA_DE_PRIVACIONES_KEYS = ['tasa de privaciones', 'tasa_sin_privaciones', 'tasaDePrivaciones', 'privaciones'];

function parseLocalidades(rows) {
  if (!rows?.length) return [];
  return rows
    .filter((d) => d.LON != null && d.LAT != null && d.localidad != null)
    .map((d) => {
      const tasaKey = Object.keys(d).find((k) =>
        TASA_DE_PRIVACIONES_KEYS.some((tk) => k.toLowerCase().trim() === tk.toLowerCase())
      );
      const tasaRaw = tasaKey ? d[tasaKey] : null;
      const tasaDePrivaciones =
        tasaRaw != null && tasaRaw !== '' ? +String(tasaRaw).replace(',', '.') : null;
      return {
        provincia: d.provincia ?? '',
        localidad: d.localidad ?? '',
        LON: +d.LON,
        LAT: +d.LAT,
        poblacion: d.poblacion != null ? +d.poblacion : null,
        tasaDePrivaciones: !Number.isNaN(tasaDePrivaciones) ? tasaDePrivaciones : null,
      };
    })
    .filter((d) => !Number.isNaN(d.LON) && !Number.isNaN(d.LAT));
}

export const useDataStore = create((set, get) => ({
  // Geo (Argentina feature)
  geoData: null,
  geoLoading: false,
  geoError: null,

  // Localidades (CSV procesado)
  localidades: [],
  localidadesLoading: false,
  localidadesError: null,

  fetchGeo: async () => {
    if (get().geoData) return;
    set({ geoLoading: true, geoError: null });
    try {
      const geojson = await d3.json(withBase('shapes/provincias.json'));
      if (!geojson) return;
      set({ geoData: geojson, geoLoading: false, geoError: null });
    } catch (err) {
      console.error(err);
      set({ geoError: err, geoLoading: false });
    }
  },

  fetchLocalidades: async () => {
    if (get().localidades.length > 0) return;
    set({ localidadesLoading: true, localidadesError: null });
    try {
      const rows = await d3.csv(LOCALIDADES_CSV_URL);
      const data = parseLocalidades(rows ?? []);
      set({ localidades: data, localidadesLoading: false, localidadesError: null });
    } catch (err) {
      console.error(err);
      set({ localidadesError: err, localidadesLoading: false });
    }
  },

  /** Carga geo y localidades si aún no están (para usar en App o en el componente que los necesite) */
  fetchAll: async () => {
    await Promise.all([get().fetchGeo(), get().fetchLocalidades()]);
  },
}));
