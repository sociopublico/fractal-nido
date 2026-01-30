import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

const WORLD_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const LOCALIDADES_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4qmx1XopDwvHxBj574EUmjT9XlM4OdvxP_DameDIq8qadGzBx1AlWb7BQirXwyvf37FacyS5OJZIw/pub?gid=1970511762&single=true&output=csv';

const ARGENTINA_ID = '032';

const ZOOM_SCROLL_PX = 500;
const CARD_SCROLL_PX = 700;
const SCALE_START = 3;
const SCALE_END = 1;

const POINT_RADIUS = 3.5;
const POINT_COLOR = '#18D4B4';


export default function ArgentinaMapScroll() {
  const sectionRef = useRef(null);
  const svgRef = useRef(null);
  const [scale, setScale] = useState(SCALE_START);
  const [step2Progress, setStep2Progress] = useState(0);
  const [geoData, setGeoData] = useState(null);
  const [localidades, setLocalidades] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [projectionReady, setProjectionReady] = useState(false);
  const [redrawKey, setRedrawKey] = useState(0);
  const [svgSize, setSvgSize] = useState({ w: 800, h: 600 });
  const projectionRef = useRef(null);
  const pathGeneratorRef = useRef(null);
  const baseScaleRef = useRef(1);
  const setTooltipRef = useRef(setTooltip);
  setTooltipRef.current = setTooltip;

  // Cargar TopoJSON y extraer Argentina
  useEffect(() => {
    let cancelled = false;
    d3.json(WORLD_ATLAS_URL).then((topology) => {
      if (cancelled || !topology) return;
      const countries = feature(topology, topology.objects.countries);
      const argentina = countries.features.find(
        (d) => String(d.id) === ARGENTINA_ID || d.id === 32
      );
      if (argentina) setGeoData(argentina);
    }).catch(console.error);
    return () => { cancelled = true; };
  }, []);

  // Cargar localidades desde CSV (provincia, localidad, LON, LAT, población)
  useEffect(() => {
    let cancelled = false;
    d3.csv(LOCALIDADES_CSV_URL).then((rows) => {
      if (cancelled || !rows) return;
      const data = rows
        .filter((d) => d.LON != null && d.LAT != null && d.localidad != null)
        .map((d) => ({
          provincia: d.provincia ?? '',
          localidad: d.localidad ?? '',
          LON: +d.LON,
          LAT: +d.LAT,
          poblacion: d.poblacion != null ? +d.poblacion : null,
        }))
        .filter((d) => !Number.isNaN(d.LON) && !Number.isNaN(d.LAT));
      setLocalidades(data);
    }).catch(console.error);
    return () => { cancelled = true; };
  }, []);

  // Inicializar proyección cuando hay datos y SVG con dimensiones
  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const initProjection = () => {
      const el = svgRef.current;
      if (!el || !geoData) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      const projection = d3.geoMercator().fitSize([w, h], geoData);
      baseScaleRef.current = projection.scale();
      projectionRef.current = projection;
      pathGeneratorRef.current = d3.geoPath().projection(projection);
      setSvgSize({ w, h });
      setProjectionReady(true);
      setRedrawKey((k) => k + 1);
    };

    initProjection();
    const ro = new ResizeObserver(initProjection);
    ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, [geoData]);

  // Scroll: zoom out (paso 1) y luego paso 2 con card que entra/sale
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const scrollY = window.scrollY;
      const progress = Math.max(0, scrollY - sectionTop + window.innerHeight * 0.2);

      if (progress < ZOOM_SCROLL_PX) {
        const t = progress / ZOOM_SCROLL_PX;
        setScale(SCALE_START - t * (SCALE_START - SCALE_END));
        setStep2Progress(0);
      } else {
        setScale(SCALE_END);
        const step2 = Math.min(1, (progress - ZOOM_SCROLL_PX) / CARD_SCROLL_PX);
        setStep2Progress(step2);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Redibujar mapa: path + puntos (localidades) con escala base fija, zoom con <g> centrado
  useEffect(() => {
    if (!geoData || !svgRef.current || !pathGeneratorRef.current || !projectionRef.current) return;

    const path = pathGeneratorRef.current(geoData);
    if (!path) return;

    const proj = projectionRef.current;
    const { w: cw, h: ch } = svgSize;
    const cx = cw / 2;
    const cy = ch / 2;

    d3.select(svgRef.current).selectAll('*').remove();

    const defs = d3.select(svgRef.current).append('defs');
    const filter = defs
      .append('filter')
      .attr('id', 'glow-cyan')
      .attr('x', '-250%')
      .attr('y', '-250%')
      .attr('width', '600%')
      .attr('height', '600%')
      .attr('filterUnits', 'objectBoundingBox')
      .attr('color-interpolation-filters', 'sRGB');
    filter.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', 5).attr('result', 'blur');
    filter.append('feFlood').attr('flood-color', '#09A9E7').attr('result', 'color');
    filter.append('feComposite').attr('in', 'color').attr('in2', 'blur').attr('operator', 'in').attr('result', 'glow');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'glow');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = d3.select(svgRef.current).append('g').attr('transform', `translate(${cx},${cy}) scale(${scale}) translate(${-cx},${-cy})`);

    g.append('path')
      .attr('d', path)
      .attr('fill', '#003087')
      .attr('stroke', '#00A1DE33')
      .attr('stroke-width', 1.5);

    const points = localidades
      .map((d) => {
        const pt = proj([d.LON, d.LAT]);
        return pt ? { ...d, x: pt[0], y: pt[1] } : null;
      })
      .filter(Boolean);

    const circles = g
      .selectAll('circle')
      .data(points)
      .join('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', POINT_RADIUS)
      .attr('fill', POINT_COLOR)
      .attr('filter', 'url(#glow-cyan)')
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        setTooltipRef.current({
          x: event.clientX,
          y: event.clientY,
          localidad: d.localidad,
          provincia: d.provincia,
          poblacion: d.poblacion,
        });
      })
      .on('mouseout', () => setTooltipRef.current(null))
      .on('mousemove', (event) => {
        setTooltipRef.current((t) => (t ? { ...t, x: event.clientX, y: event.clientY } : null));
      });

    circles
      .append('title')
      .text((d) => `${d.localidad}, ${d.provincia}${d.poblacion ? ` · ${d.poblacion.toLocaleString('es-AR')} hab.` : ''}`);
  }, [geoData, scale, projectionReady, redrawKey, svgSize, localidades]);

  const { w: svgW, h: svgH } = svgSize;
  const cardY = step2Progress <= 0 ? 100 : (1 - 2 * step2Progress) * 100;

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ minHeight: `calc(${ZOOM_SCROLL_PX + CARD_SCROLL_PX}px + 50vh)` }}
    >
      <div className="sticky top-0 left-0 w-full h-screen flex items-center justify-center bg-navy overflow-hidden">
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
        />
        {/* Tooltip al hacer hover sobre un punto */}
        {tooltip && (
          <div
            className="pointer-events-none fixed z-10 rounded-lg bg-navy/95 px-3 py-2 text-sm text-white shadow-lg"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y + 12,
            }}
          >
            <div className="font-medium">{tooltip.localidad}</div>
            <div className="text-white/80">{tooltip.provincia}</div>
            {tooltip.poblacion != null && (
              <div className="mt-1 text-white/70">
                {tooltip.poblacion.toLocaleString('es-AR')} hab.
              </div>
            )}
          </div>
        )}
        {/* Card que entra desde abajo a la derecha y sale por arriba (paso 2) */}
        <div
          className="absolute text-black right-0 w-[450px] pointer-events-none transition-transform duration-200 ease-out"
          style={{
            top: '50%',
            transform: `translateY(calc(-50% + ${cardY}vh))`,
          }}
        >
            <img src="/card.png" className="object-cover w-full h-full" />
            <div className="absolute top-0 left-0 w-full h-full p-10">
              <div className="bg-white w-full h-full p-10">
                <h3 className="text-4xl mb-2 text-black font-medium leading-tighter">
                  El entorno puede{' '}
                  <span style={{ color: '#00A1DE' }}>potenciar</span> o limitar esas oportunidades desde el primer día.
                </h3>
              <p className="text-xl font-medium mt-12" style={{ color: '#00A1DE' }}>
              Algunos niños y niñas nacen en entornos con menos oportunidades que otros.
            </p>

              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
