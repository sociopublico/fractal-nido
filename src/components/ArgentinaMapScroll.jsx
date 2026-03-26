import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ScrollCard from './ScrollCard';
import { useDataStore } from '../store/useDataStore';
import { withBase } from '../utils/withBase';

const ZOOM_SCROLL_PX = 500;
const CARD_SCROLL_PX = 700;
const TEXT_SCROLL_PX = 600;
const SCALE_START = 3;
const SCALE_END = 0.90;

const POINT_RADIUS = 4.5;
const POINT_COLOR = '#18D4B4';
const POINT_OPACITY = 0.85;
const PRIVACION_OPACITY = 0.3;
const PRIVACION_RADIUS_MIN = POINT_RADIUS * 2;
const PRIVACION_RADIUS_MAX = POINT_RADIUS * 6;

// Duraciones y delays de pulso por índice (deterministas, no random)
const getPulseDuration = (i) => 2.2 + (i * 0.41) % 1.8; // 2.2–4.0s
const getPulseDelay = (i) => (i * 0.67) % 2.2;          // 0–2.2s

export default function ArgentinaMapScroll() {
  const sectionRef = useRef(null);
  const svgRef = useRef(null);
  const [scale, setScale] = useState(SCALE_START);
  const [step2Progress, setStep2Progress] = useState(0);
  const [step3Progress, setStep3Progress] = useState(0);
  const [mapStepEntered, setMapStepEntered] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [projectionReady, setProjectionReady] = useState(false);
  const [redrawKey, setRedrawKey] = useState(0);
  const [svgSize, setSvgSize] = useState({ w: 800, h: 600 });
  const projectionRef = useRef(null);
  const pathGeneratorRef = useRef(null);
  const baseScaleRef = useRef(1);
  const setTooltipRef = useRef(setTooltip);
  const hasAnimatedPointsRef = useRef(false);
  setTooltipRef.current = setTooltip;

  // Puntos solo cuando la sección del mapa entra en vista
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setMapStepEntered(true);
      },
      { threshold: 0.15, rootMargin: '0px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const geoData = useDataStore((s) => s.geoData);
  const localidades = useDataStore((s) => s.localidades);
  const fetchGeo = useDataStore((s) => s.fetchGeo);
  const fetchLocalidades = useDataStore((s) => s.fetchLocalidades);

  useEffect(() => {
    fetchGeo();
    fetchLocalidades();
  }, [fetchGeo, fetchLocalidades]);

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
        setStep3Progress(0);
      } else {
        setScale(SCALE_END);
        const step2 = Math.min(1, (progress - ZOOM_SCROLL_PX) / CARD_SCROLL_PX);
        setStep2Progress(step2);
        const step3 = Math.min(1, (progress - ZOOM_SCROLL_PX - CARD_SCROLL_PX) / TEXT_SCROLL_PX);
        setStep3Progress(Math.max(0, step3));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Redibujar mapa: path + puntos. NO depende de `scale` para que las animaciones CSS persistan.
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

    // Keyframe de pulso — cada círculo tendrá distinta duración y delay vía style inline
    defs.append('style').text(`
      @keyframes map-pulse {
        0%, 100% { opacity: 0.35; }
        50%       { opacity: 0.9; }
      }


      @keyframes map-lower-pulse {
        0%, 100% { opacity: 0.15; }
        50%       { opacity: 0.30; }
      }
    `);

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

    const g = d3
      .select(svgRef.current)
      .append('g')
      .attr('id', 'map-g')
      .attr('transform', `translate(${cx},${cy}) scale(${scale}) translate(${-cx},${-cy})`);

    g.append('path')
      .attr('d', path)
      .attr('fill', '#003087')
      .attr('stroke', '#00A1DE33')
      .attr('stroke-width', 1.5);

    const points = mapStepEntered
      ? localidades
          .map((d) => {
            const pt = proj([d.LON, d.LAT]);
            return pt ? { ...d, x: pt[0], y: pt[1] } : null;
          })
          .filter(Boolean)
      : [];

    const tasasValidas = points
      .map((d) => 1 - d.tasaDePrivaciones)
      .filter((v) => v != null && !Number.isNaN(v));

    const privacionRadiusScale =
      tasasValidas.length > 0
        ? d3.scaleLinear().domain(d3.extent(tasasValidas)).range([PRIVACION_RADIUS_MIN, PRIVACION_RADIUS_MAX])
        : null;

    // Círculos concéntricos de privaciones (debajo de los puntos)
    // Se preserva el índice original para que el pulso sea sincrónico con el círculo ciudad
    if (privacionRadiusScale) {
      const pointsConPrivacion = points
        .map((d, i) => ({ ...d, _i: i }))
        .filter((d) => 1 - d.tasaDePrivaciones != null);

      g.selectAll('.privacion-circle')
        .data(pointsConPrivacion)
        .join('circle')
        .attr('class', 'privacion-circle')
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', (d) => privacionRadiusScale(1 - d.tasaDePrivaciones))
        .attr('fill', "#09A9E733")
        .attr('opacity', PRIVACION_OPACITY)
        .attr('pointer-events', 'none')
        .style('animation', (d) =>
          `map-pulse ${getPulseDuration(d._i).toFixed(2)}s ${getPulseDelay(d._i).toFixed(2)}s ease-in-out infinite`
        );
    }

    const shouldGrow = !hasAnimatedPointsRef.current && points.length > 0;
    const circles = g
      .selectAll('.city-circle')
      .data(points)
      .join('circle')
      .attr('class', 'city-circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', shouldGrow ? 0 : POINT_RADIUS)
      .attr('fill', POINT_COLOR)
      .attr('filter', 'url(#glow-cyan)')
      .style('cursor', 'pointer')
      // Animación de pulso con duración y delay distintos por punto
      .style('animation', (_, i) =>
        `map-pulse ${getPulseDuration(i).toFixed(2)}s ${getPulseDelay(i).toFixed(2)}s ease-in-out infinite`
      )
      .on('mouseover', function (event, d) {
        setTooltipRef.current({
          x: event.clientX,
          y: event.clientY,
          localidad: d.localidad,
          provincia: d.provincia,
          poblacion: d.poblacion,
          tasaDePrivaciones: 1 - d.tasaDePrivaciones,
        });
      })
      .on('mouseout', () => setTooltipRef.current(null))
      .on('mousemove', (event) => {
        setTooltipRef.current((t) => (t ? { ...t, x: event.clientX, y: event.clientY } : null));
      });

    if (shouldGrow) {
      hasAnimatedPointsRef.current = true;
      circles
        .transition()
        .duration(450)
        .ease(d3.easeCubicOut)
        .attr('r', POINT_RADIUS);
    }

    circles
      .append('title')
      .text(
        (d) =>
          `${d.localidad}, ${d.provincia}${d.poblacion ? ` · ${d.poblacion.toLocaleString('es-AR')} hab.` : ''}${d.tasaDePrivaciones != null ? ` · Tasa sin privaciones: ${d.tasaDePrivaciones.toFixed(1)}%` : ''}`
      );
  }, [geoData, projectionReady, redrawKey, svgSize, localidades, mapStepEntered]);

  // Actualizar solo el transform del grupo al hacer scroll (sin redibujar todo)
  useEffect(() => {
    if (!svgRef.current) return;
    const { w: cw, h: ch } = svgSize;
    const cx = cw / 2;
    const cy = ch / 2;
    d3.select(svgRef.current)
      .select('#map-g')
      .attr('transform', `translate(${cx},${cy}) scale(${scale}) translate(${-cx},${-cy})`);
  }, [scale, svgSize]);

  const { w: svgW, h: svgH } = svgSize;
  const cardY = step2Progress <= 0 ? 100 : (1 - 2 * step2Progress) * 100;
  const textOpacity = step3Progress;

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ minHeight: `calc(${ZOOM_SCROLL_PX + CARD_SCROLL_PX + TEXT_SCROLL_PX}px + 50vh)` }}
    >
      <div className="sticky top-0 left-0 w-full h-screen flex items-center justify-center bg-navy overflow-x">

        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          viewBox={`0 -30 ${svgW} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
        />
        {/* Tooltip al hacer hover sobre un punto */}
        {tooltip && (
          <div
            className="pointer-events-none fixed z-10 text-sm text-black"
            style={{
              left: tooltip.x,
              bottom: `calc(100vh - ${tooltip.y}px + 12px)`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="relative border border-black bg-white px-3 py-2 shadow-lg">
              {/* Triángulo apuntando hacia abajo */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid black',
                }}
              />
            <div className="uppercase text-black/70">{tooltip.provincia}</div>
            <div className="font-bold">{tooltip.localidad}</div>
            {tooltip.tasaDePrivaciones != null && (
              <div className="mt-1 text-black border-t pt-1 border-[#86898B4D]">
                <b>{Number(1 - tooltip.tasaDePrivaciones).toFixed(1)}%</b> Privaciones materiales
              </div>
            )}
            </div>
          </div>
        )}

        {/* Texto blanco abajo a la derecha (paso 3) */}
        <div
          className="absolute bottom-12 left-8 max-w-sm text-left pointer-events-none"
          style={{ opacity: textOpacity, transition: 'opacity 0.1s linear' }}
        >
          <p className="text-white text-lg font-regular leading-snug">
            Este mapa muestra las tres localidades más grandes de cada provincia y combina indicadores de privación material, condiciones socioeconómicas y tiempos de acceso a servicios clave, como salud y educación en la primera infancia.
          </p>
        </div>

        {/* Card que entra desde abajo a la derecha y sale por arriba (paso 2) */}
        <ScrollCard
          className="absolute right-0"
          style={{
            top: '50%',
            transform: `translateY(calc(-50% + ${cardY}vh))`,
          }}
        >
          <h3 className="text-4xl mb-2 text-black font-medium leading-tightest">
            El entorno puede{' '}
            <span style={{ color: '#00A1DE' }}>potenciar</span> o limitar esas oportunidades desde el primer día.
          </h3>
          <p className="text-xl font-medium mt-12" style={{ color: '#00A1DE' }}>
            Algunos niños y niñas nacen en entornos con menos oportunidades que otros.
          </p>
        </ScrollCard>
      </div>
    </section>
  );
}
