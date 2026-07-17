import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ScrollCard from './ScrollCard';
import { useDataStore } from '../store/useDataStore';
import { useMediaQuery } from '../hooks/useMediaQuery';

const ZOOM_SCROLL_PX = 500;
const CARD_SCROLL_PX = 700;
const TEXT_SCROLL_PX = 600;

/** Mobile: solo fase de zoom del mapa; el resto del scroll es flujo normal (card fuera de esta sección). */
const MOBILE_MAP_SECTION_MIN_HEIGHT = `calc(${ZOOM_SCROLL_PX}px + 100vh)`;
const SCALE_START = 3;
const SCALE_END = 0.85;

const POINT_RADIUS = 4.5;
const POINT_COLOR = '#18D4B4';
const POINT_OPACITY = 0.85;
const PRIVACION_OPACITY = 0.3;
const PRIVACION_RADIUS_MIN = POINT_RADIUS * 2;
const PRIVACION_RADIUS_MAX = POINT_RADIUS * 6;

// Duraciones y delays de pulso por índice (deterministas, no random)
const getPulseDuration = (i) => 2.2 + (i * 0.41) % 1.8; // 2.2–4.0s
const getPulseDelay = (i) => (i * 0.67) % 2.2;          // 0–2.2s

function shouldPlaceTooltipBelow(clientY) {
  const pad = 10;
  const gap = 12;
  const approxH = 102;
  const spaceAbove = clientY - pad;
  const spaceBelow = window.innerHeight - clientY - pad;

  return spaceAbove < approxH + gap && spaceBelow > Math.min(spaceAbove, approxH * 0.85);
}

/** Tooltip en mobile: no sale de pantalla; arriba/abajo según espacio; costados contrarios cerca de bordes. */
function computeMobileTooltipPosition(clientX, clientY) {
  const vw = window.innerWidth;
  const pad = 10;
  const gap = 12;
  const maxW = Math.min(300, vw - 2 * pad);
  const halfW = maxW / 2;

  const placeBelow = shouldPlaceTooltipBelow(clientY);

  const nearLeft = clientX < vw * 0.28;
  const nearRight = clientX > vw * 0.72;

  let left = clientX;
  if (!nearLeft && !nearRight) {
    if (left < pad + halfW) left = pad + halfW;
    if (left > vw - pad - halfW) left = vw - pad - halfW;
  }

  let top;
  let transform;
  if (placeBelow) {
    top = clientY + gap;
    transform = 'translateX(-50%)';
  } else {
    top = clientY - gap;
    transform = 'translate(-50%, -100%)';
  }

  let tooltipLeftEdge = left - halfW;

  if (nearLeft) {
    left = pad;
    transform = placeBelow ? 'translate(0, 0)' : 'translate(0, -100%)';
    tooltipLeftEdge = pad;
  } else if (nearRight) {
    left = vw - pad;
    transform = placeBelow ? 'translate(-100%, 0)' : 'translate(-100%, -100%)';
    tooltipLeftEdge = vw - pad - maxW;
  }

  const mArrowLeftPx = Math.round(Math.min(Math.max(clientX - tooltipLeftEdge, 12), maxW - 12));
  const mArrowFromCenter = !nearLeft && !nearRight;
  const mArrowOffsetX = mArrowFromCenter ? clientX - left : 0;

  return {
    mLeft: left,
    mTop: top,
    mTransform: transform,
    mPlaceBelow: placeBelow,
    mArrowFromCenter,
    mArrowOffsetX,
    mArrowLeftPx,
  };
}

export default function ArgentinaMapScroll() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const sectionRef = useRef(null);
  const svgRef = useRef(null);
  const [scale, setScale] = useState(SCALE_START);
  const [step2Progress, setStep2Progress] = useState(0);
  const [step3Progress, setStep3Progress] = useState(0);
  const [mapStepEntered, setMapStepEntered] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [projectionReady, setProjectionReady] = useState(false);
  const [redrawKey, setRedrawKey] = useState(0);
  const [svgSize, setSvgSize] = useState({ w: 800, h: 500 });
  const projectionRef = useRef(null);
  const pathGeneratorRef = useRef(null);
  const baseScaleRef = useRef(1);
  const setTooltipRef = useRef(setTooltip);
  const hasAnimatedPointsRef = useRef(false);
  const isMobileRef = useRef(isMobile);
  setTooltipRef.current = setTooltip;

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

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
      const progress = Math.max(0, window.scrollY - sectionTop + window.innerHeight * 0.2);

      if (isMobile) {
        if (progress < ZOOM_SCROLL_PX) {
          const t = progress / ZOOM_SCROLL_PX;
          setScale(SCALE_START - t * (SCALE_START - SCALE_END));
        } else {
          setScale(SCALE_END);
        }
        setStep2Progress(0);
        setStep3Progress(0);
        return;
      }

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
  }, [isMobile]);

  // Redibujar mapa: path + puntos. NO depende de `scale` para que las animaciones CSS persistan.
  useEffect(() => {
    if (!geoData || !svgRef.current || !pathGeneratorRef.current || !projectionRef.current) return;

    if (!geoData.features?.length) return;

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

    g.selectAll('.province')
      .data(geoData.features)
      .join('path')
      .attr('class', 'province')
      .attr('d', pathGeneratorRef.current)
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
        const payload = {
          x: event.clientX,
          y: event.clientY,
          localidad: d.localidad,
          provincia: d.provincia,
          poblacion: d.poblacion,
          tasaDePrivaciones: 1 - d.tasaDePrivaciones,
          placeBelow: shouldPlaceTooltipBelow(event.clientY),
        };
        if (isMobileRef.current) {
          Object.assign(payload, computeMobileTooltipPosition(event.clientX, event.clientY));
        }
        setTooltipRef.current(payload);
      })
      .on('mouseout', () => setTooltipRef.current(null))
      .on('mousemove', (event) => {
        setTooltipRef.current((t) => {
          if (!t) return null;
          if (isMobileRef.current) {
            return {
              ...t,
              x: event.clientX,
              y: event.clientY,
              ...computeMobileTooltipPosition(event.clientX, event.clientY),
            };
          }
          return {
            ...t,
            x: event.clientX,
            y: event.clientY,
            placeBelow: shouldPlaceTooltipBelow(event.clientY),
          };
        });
      });

    if (shouldGrow) {
      hasAnimatedPointsRef.current = true;
      circles
        .transition()
        .duration(450)
        .ease(d3.easeCubicOut)
        .attr('r', POINT_RADIUS);
    }
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
  const mapIntroText =
    'Este mapa muestra las tres localidades más grandes de cada provincia y combina indicadores de privación material, condiciones socioeconómicas y tiempos de acceso a servicios clave, como salud y educación en la primera infancia.';

  const mapTooltip =
    tooltip &&
    (isMobile && typeof tooltip.mLeft === 'number' ? (
      <div
        className="pointer-events-none fixed z-10 max-w-[min(300px,calc(100vw-20px))] text-sm text-black"
        style={{
          left: tooltip.mLeft,
          top: tooltip.mTop,
          transform: tooltip.mTransform,
        }}
      >
        <div className="relative border border-black bg-white px-3 py-2 shadow-lg">
          {tooltip.mPlaceBelow ? (
            <div
              className="pointer-events-none absolute h-0 w-0"
              style={{
                top: -6,
                ...(tooltip.mArrowFromCenter
                  ? {
                      left: `calc(50% + ${tooltip.mArrowOffsetX}px)`,
                      transform: 'translateX(-50%)',
                    }
                  : { left: tooltip.mArrowLeftPx, transform: 'none' }),
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '6px solid black',
              }}
            />
          ) : (
            <div
              className="pointer-events-none absolute h-0 w-0"
              style={{
                bottom: -6,
                ...(tooltip.mArrowFromCenter
                  ? {
                      left: `calc(50% + ${tooltip.mArrowOffsetX}px)`,
                      transform: 'translateX(-50%)',
                    }
                  : { left: tooltip.mArrowLeftPx, transform: 'none' }),
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid black',
              }}
            />
          )}
          <div className="uppercase text-black/70">{tooltip.provincia}</div>
          <div className="font-bold">{tooltip.localidad}</div>
          {tooltip.tasaDePrivaciones != null && (
            <div className="mt-1 border-t border-[#86898B4D] pt-1 text-black">
              <b>{Number(1 - tooltip.tasaDePrivaciones).toFixed(1)}%</b> Tasa sin privaciones materiales
            </div>
          )}
        </div>
      </div>
    ) : !isMobile ? (
      <div
        className="pointer-events-none fixed z-10 text-sm text-black"
        style={{
          left: tooltip.x,
          top: tooltip.placeBelow ? tooltip.y + 12 : tooltip.y - 12,
          transform: tooltip.placeBelow ? 'translateX(-50%)' : 'translate(-50%, -100%)',
        }}
      >
        <div className="relative border border-black bg-white px-3 py-2 shadow-lg">
          <div
            style={{
              position: 'absolute',
              ...(tooltip.placeBelow ? { top: -6 } : { bottom: -6 }),
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              ...(tooltip.placeBelow
                ? { borderBottom: '6px solid black' }
                : { borderTop: '6px solid black' }),
            }}
          />
          <div className="uppercase text-black/70">{tooltip.provincia}</div>
          <div className="font-bold">{tooltip.localidad}</div>
          {tooltip.tasaDePrivaciones != null && (
            <div className="mt-1 border-t border-[#86898B4D] pt-1 text-black">
              <b>{Number(1 - tooltip.tasaDePrivaciones).toFixed(1)}%</b> Tasa sin privaciones materiales
            </div>
          )}
        </div>
      </div>
    ) : null);

  const scrollCardContent = (
    <>
      <span className="font-medium leading-tight text-lg" style={{ color: '#00A1DE' }}>
        Algunos niños y niñas nacen en entornos con menos oportunidades que otros.
      </span>
    </>
  );

  const scrollCardTitle = (
    <>
      El entorno puede <span style={{ color: '#00A1DE' }}>potenciar</span> o limitar esas oportunidades desde el
      primer día.
    </>
  );

  const desktopSectionMinHeight = `calc(${ZOOM_SCROLL_PX + CARD_SCROLL_PX + TEXT_SCROLL_PX}px + 50vh)`;

  return (
    <>
      <section
        ref={sectionRef}
        className="relative overflow-x-clip overflow-y-visible -mt-1"
        style={{
          minHeight: isMobile ? MOBILE_MAP_SECTION_MIN_HEIGHT : desktopSectionMinHeight,
        }}
      >
        {isMobile ? (
          <div className="sticky -top-0 left-0 flex h-screen w-full flex-col overflow-x-clip overflow-y-visible bg-navy">
            <div className="z-20 w-full shrink-0 px-4 py-6">
              <p className="text-sm font-regular leading-snug text-white">{mapIntroText}</p>
            </div>

            <div className="relative min-h-0 w-full flex-1 pb-12">
              <svg
                ref={svgRef}
                className="absolute inset-0 h-full w-full"
                viewBox={`0 10 ${svgW} ${svgH}`}
                preserveAspectRatio="xMidYMid meet"
              />
              {mapTooltip}
            </div>
          </div>
        ) : (
        <div className="sticky top-0 left-0 flex h-screen w-full items-center justify-center overflow-x-clip overflow-y-visible bg-navy">
          <svg
            ref={svgRef}
            className="absolute inset-0 h-full w-full"
            viewBox={`0 -30 ${svgW} ${svgH}`}
            preserveAspectRatio="xMidYMid meet"
          />
          {mapTooltip}
          <div
            className="pointer-events-none absolute bottom-12 left-8 z-10 max-w-sm text-left"
            style={{ opacity: textOpacity, transition: 'opacity 0.1s linear' }}
          >
            <p className="text-lg font-regular leading-snug text-white">{mapIntroText}</p>
          </div>
          <ScrollCard
            floating
            title={scrollCardTitle}
            className="absolute right-0 z-30"
            style={{
              top: '50%',
              transform: `translateY(calc(-50% + ${cardY}vh))`,
            }}
          >
            {scrollCardContent}
          </ScrollCard>
        </div>
        )}
      </section>

      {isMobile && (
        <div className="bg-navy px-4 pb-16 pt-8">
          <ScrollCard floating={false} title={scrollCardTitle} className="mx-auto w-full max-w-lg">
            {scrollCardContent}
          </ScrollCard>
        </div>
      )}
    </>
  );
}
