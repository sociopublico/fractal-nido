import { useEffect, useRef, useState } from 'react';
import ScrollCard from './ScrollCard';
import StatsCard from './StatsCard';
import SingleStatsCard from './SingleStatsCard';
import ScrollyStack from './ScrollyStack';
import ParallaxStack from './ParallaxStack';
import { withBase } from '../utils/withBase';
import { useMediaQuery } from '../hooks/useMediaQuery';

/** Menos px por paso = secuencia de capas completa con menos scroll (antes del final del viewport). */
const SCROLL_STEP_PX = 50;
const SLIDE_SCROLL_PX = 2500;

const SCROLLY_IMAGE_ORDER = [0, 10, 11, 12, 13, 14, 15, 16, 17, 6, 7, 8, 9, 1, 2, 3, 4, 5];
const SCROLLY_STEPS = SCROLLY_IMAGE_ORDER.map((_, i) => SCROLLY_IMAGE_ORDER.slice(0, i + 1));
const SCROLLY_PHASE_END_PX = SCROLLY_IMAGE_ORDER.length * SCROLL_STEP_PX;
const MOBILE_SCROLL_STEP_FACTOR = 0.5;
const MOBILE_SCROLL_START_OFFSET = 0.5;
/** Mobile: 1.5 = misma animación en ~2/3 del scroll (50% más rápido que el ritmo anterior). */
const MOBILE_SCROLLY_SPEED_MULTIPLIER = 1.8;
/** Mobile: cuando el tope de la sección está en este % del alto del viewport (desde arriba), todas las capas ya visibles. */
const MOBILE_SCROLLY_COMPLETE_VIEWPORT_TOP_FRAC = 0.25;

const cardStyle = { position: 'relative', top: 'auto', transform: 'none' };

function MobileParallax({ layers, className = '' }) {
  return <ParallaxStack slideX={0} className={`relative w-full max-w-full mx-auto ${className}`} layers={layers} />;
}

export default function HorizontalScroll() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const sectionRef = useRef(null);
  const stripRef = useRef(null);
  const [scrollyStep, setScrollyStep] = useState(0);
  const [patternProgress, setPatternProgress] = useState(0);
  const [slideX, setSlideX] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const vh = window.innerHeight;
      const scrollStartOffset = isMobile ? MOBILE_SCROLL_START_OFFSET : 0.3;
      const phaseEndPx = isMobile
        ? (SCROLLY_PHASE_END_PX * MOBILE_SCROLL_STEP_FACTOR) / MOBILE_SCROLLY_SPEED_MULTIPLIER
        : SCROLLY_PHASE_END_PX;
      const stepPx = isMobile
        ? (SCROLL_STEP_PX * MOBILE_SCROLL_STEP_FACTOR) / MOBILE_SCROLLY_SPEED_MULTIPLIER
        : SCROLL_STEP_PX;
      const progress = Math.max(0, window.scrollY - sectionTop + vh * scrollStartOffset);

      if (
        isMobile &&
        rect.top <= vh * MOBILE_SCROLLY_COMPLETE_VIEWPORT_TOP_FRAC
      ) {
        setScrollyStep(SCROLLY_STEPS.length - 1);
        setPatternProgress(1);
        setSlideX(0);
        return;
      }

      if (progress < phaseEndPx) {
        setScrollyStep(Math.floor(progress / stepPx));
        setPatternProgress(progress / phaseEndPx);
        setSlideX(0);
        return;
      }

      setPatternProgress(1);
      setScrollyStep(SCROLLY_STEPS.length - 1);

      if (isMobile) {
        setSlideX(0);
        return;
      }

      const sp = Math.min(1, (progress - phaseEndPx) / SLIDE_SCROLL_PX);
      const strip = stripRef.current;
      const maxScrollX = strip ? strip.scrollWidth - window.innerWidth : 0;
      setSlideX(-sp * maxScrollX);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isMobile]);

  const mobilePhaseEndPx =
    (SCROLLY_PHASE_END_PX * MOBILE_SCROLL_STEP_FACTOR) / MOBILE_SCROLLY_SPEED_MULTIPLIER;
  const mobileMinHeight = `calc(${mobilePhaseEndPx}px + 70vh)`;

  if (isMobile) {
    return (
      <section
        ref={sectionRef}
        className="relative bg-navy overflow-x-hidden"
        style={{ minHeight: mobileMinHeight }}
      >
        <div className="sticky top-0 left-0 z-10 flex h-[200px] md:h-screen w-full 
        flex-col justify-center overflow-hidden bg-navy py-4 ">
          <div className="flex min-h-[48vh] w-full flex-1 items-center justify-center px-2">
            <div className="relative h-[62vh] w-[114%] max-h-[62vh] max-w-none">
              <ScrollyStack
                folder="scrolly1"
                totalImages={18}
                steps={SCROLLY_STEPS}
                currentStep={scrollyStep}
                patternProgress={patternProgress}
                className="h-full w-full scale-[1.25] md:scale-[1.12]"
                compactPattern
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex w-full max-w-full flex-col gap-10 overflow-x-hidden 
        bg-navy px-0 md:px-4 pb-16 pt-8 md:pt-4">
          <ScrollCard
            floating={false}
            title="Pedro nació en la periferia de una gran ciudad."
            style={cardStyle}
            className="w-full"
          >
            En su barrio hay un jardín de infantes cerca y calles transitadas que conectan con otras zonas. Aun así,
            no hay plazas o parques a una distancia caminable, por lo que los espacios al aire libre donde jugar o
            explorar quedan más lejos de su vida cotidiana.
          </ScrollCard>

          <MobileParallax
            className="h-[220px] sm:h-[260px]"
            layers={[
              { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
              {
                src: withBase('scrolly1/22.png'),
                visible: true,
                speed: 0,
                initialX: 180,
                scale: isMobile ? 2 : 1,
              },
              {
                src: withBase('scrolly1/21.png'),
                visible: true,
                speed: 0,
                initialX: 0,
                scale: isMobile ? 2 : 1,
              },
              {
                src: withBase('scrolly1/19.png'),
                visible: true,
                speed: 0,
                initialX: 250,
                scale: isMobile ? 2 : 1,
              },
              { src: withBase('scrolly1/20.png'), visible: true, speed: 0, initialX: 0, },
              { src: withBase('scrolly1/23.png'), visible: true, speed: 0, initialX: 0,
                scale: isMobile ? 2 : 1,
               },
            ]}
          />

          <StatsCard
            textoMenorIngreso="1 de cada"
            textoMayorIngreso="1 de cada"
            numMenorIngreso={1}
            numMayorIngreso={5}
            total={25}
            className="w-full min-w-0 max-w-full"
            style={{ zIndex: 20 }}
          >
            <p className="text-base text-gray-700 leading-tight md:leading-relaxed">
              En las grandes ciudades, <span className="font-bold text-cyan">5 de cada 25 niños y niñas</span> de
              hogares de menor nivel socioeconómico no tiene acceso a espacios verdes, mientras que esta situación
              afecta solo a <span className="font-bold">1 de cada 25 niños y niñas</span> de hogares con mayores
              ingresos.
              <br />
              <br />
              Este caso muestra que no todos los barrios ofrecen las mismas oportunidades de acceder a espacios verdes,
              aun estando dentro de la misma ciudad.
              <br />
              <br />
              Los espacios verdes ofrecen oportunidades de movimiento, exploración y calma, que fortalecen tanto la salud
              como el desarrollo cognitivo de los niños y niñas.
            </p>
          </StatsCard>

          <MobileParallax
            className="h-[200px]"
            layers={[
              { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
              { src: withBase('scrolly1/21.png'), visible: true, speed: 0, initialX: 0, scale: isMobile ? 2.5 : 1 },
              { src: withBase('scrolly1/26.png'), visible: true, speed: 0, initialX: -120, scale: isMobile ? 2.5 : 1 },
              { src: withBase('scrolly1/25.png'), visible: true, speed: 0, initialX: -60 },
            ]}
          />

          <ScrollCard
            floating={false}
            title="Lucila nació en un pueblo del interior de una provincia."
            style={cardStyle}
            className="w-full"
          >
            En su pueblo hay una sola posta sanitaria, que solo resuelve consultas básicas en horarios limitados. Para
            estudios, urgencias o tratamientos más complejos, su familia debe trasladarse hasta la ciudad cabecera.
          </ScrollCard>

          <MobileParallax
            className="h-[200px]"
            layers={[
              { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
              { src: withBase('scrolly1/21.png'), visible: true, speed: 0, initialX: 60, scale: isMobile ? 2.5 : 1 },
              { src: withBase('scrolly1/24.png'), visible: true, speed: 0, initialX: -200, scale: isMobile ? 2.5 : 1 },
            ]}
          />

          <div className="w-full max-w-full bg-[#609B3E] p-2 md:p-3 shadow-xl">
            <div className="flex items-center justify-between gap-2 md:gap-4 border-4 border-white 
            p-2 px-4 md:p-4 flex-row text-left">
              <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0L20 16.719H14.5V24L5.5 24V16.719H0L10 0Z" fill="white" />
              </svg>
              <p className="block md:hidden text-base font-bold uppercase leading-tight text-white">hasta el hospital<br/> más cercano</p>
              <p className="hidden md:block text-base font-bold uppercase leading-tight text-white">hasta el hospital más cercano</p>
              <p className="text-2xl font-bold leading-tight text-white">2h 10m</p>
            </div>
          </div>

          <MobileParallax
            className="h-[220px]"
            layers={[
              { src: withBase('scrolly1/0.png'), visible: true, speed: 0, scale: isMobile ? 2 : 1 },
              { src: withBase('scrolly1/14.png'), visible: true, speed: 0, initialX: 100, scale: isMobile ? 2 : 1 },
              { src: withBase('scrolly1/08.png'), visible: true, speed: 0, initialX: -180, scale: isMobile ? 2 : 1 },
              { src: withBase('scrolly1/12.png'), visible: true, speed: 0, initialX: 60, scale: isMobile ? 2 : 1 },
              { src: withBase('scrolly1/17.png'), visible: true, speed: 0, initialX: -240, scale: isMobile ? 2 : 1 },
            ]}
          />

          <SingleStatsCard
            color="coral"
            numero={1}
            total={10}
            texto="no accede a servicios de salud cercanos"
            className="w-full min-w-0 max-w-full"
          >
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              <span className="font-bold text-cyan">En 240 localidades del país</span> hay que viajar{' '}
              <span className="font-bold">más de 2 horas en auto</span> para llegar al hospital público más cercano.
              <br />
              Este caso muestra que la distancia también es una limitación: cuando la infraestructura sanitaria queda
              lejos, se vuelve difícil acceder a controles, estudios o tratamientos que implican necesidades complejas.
            </p>
          </SingleStatsCard>

          <MobileParallax
            className="h-[240px]"
            layers={[
              { src: withBase('scrolly1/0.png'), visible: true, speed: 0, scale: isMobile ? 2.5 : 1 },
              {
                src: withBase('scrolly1/24.png'),
                visible: true,
                speed: 0,
                initialX: -350,
                scale: isMobile ? 2.25 : 1.65,
              },
            ]}
          />

          <ScrollCard
            floating={false}
            title="Amanda nació en un pequeño pueblo rural, a más de cuatro horas de la capital de su provincia."
            style={cardStyle}
            className="w-full"
            styleCard={{ padding: 24 }}
            pattern={false}
          >
            En su zona no hay un jardín de infantes cercano, por lo que Amanda no va todos los días. Las opciones de
            educación inicial requieren trasladarse a otras localidades, así que las familias de la zona organizan esos
            recorridos según sus tiempos y posibilidades.
          </ScrollCard>
        </div>
      </section>
    );
  }

  const totalScrollHeight = SCROLLY_PHASE_END_PX + SLIDE_SCROLL_PX;

  return (
    <section
      ref={sectionRef}
      className="relative bg-navy"
      style={{ minHeight: `calc(${totalScrollHeight}px + 80vh)` }}
    >
      <div className="sticky top-0 left-0 h-screen w-full overflow-hidden bg-navy">
        <div
          ref={stripRef}
          className="absolute top-0 left-0 flex h-full items-center"
          style={{
            transform: `translateX(${slideX}px)`,
            transition: 'transform 75ms ease-out',
          }}
        >
          <div className="flex h-screen w-screen flex-shrink-0 items-center justify-center">
            <div className="relative aspect-video max-h-[90vh] w-full max-w-screen">
              <ScrollyStack
                folder="scrolly1"
                totalImages={18}
                steps={SCROLLY_STEPS}
                currentStep={scrollyStep}
                patternProgress={patternProgress}
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="flex h-screen flex-shrink-0 items-center gap-10 pr-10">
            <ScrollCard title="Pedro nació en la periferia de una gran ciudad." style={{ ...cardStyle, width: 450 }}>
              En su barrio hay un jardín de infantes cerca y calles transitadas que conectan con otras zonas. Aun así,
              no hay plazas o parques a una distancia caminable, por lo que los espacios al aire libre donde jugar o
              explorar quedan más lejos de su vida cotidiana.
            </ScrollCard>

            <ParallaxStack
              slideX={slideX}
              className="h-[80vh] w-[70vw]"
              layers={[
                { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
                {
                  src: withBase('scrolly1/22.png'),
                  visible: true,
                  speed: 0.1,
                  initialX: 200,
                  scale: isMobile ? 2 : 1,
                },
                {
                  src: withBase('scrolly1/21.png'),
                  visible: true,
                  speed: 0.05,
                  initialX: 600,
                  scale: isMobile ? 2 : 1,
                },
                {
                  src: withBase('scrolly1/19.png'),
                  visible: true,
                  speed: 0.1,
                  initialX: 500,
                  scale: isMobile ? 2 : 1,
                },
                { src: withBase('scrolly1/20.png'), visible: true, speed: 0.1, initialX: 50 },
                { src: withBase('scrolly1/23.png'), visible: true, speed: 0.25, initialX: 250 },
              ]}
            />

            <div className="w-[42rem] flex-none">
              <StatsCard
                textoMenorIngreso="1 de cada"
                textoMayorIngreso="1 de cada"
                numMenorIngreso={1}
                numMayorIngreso={5}
                total={25}
                className="w-full"
                style={{ zIndex: 1000 }}
              >
                <p className="text-lg text-gray-700 leading-relaxed">
                  En las grandes ciudades, <span className="font-bold text-cyan">5 de cada 25 niños y niñas</span> de
                  hogares de menor nivel socioeconómico no tiene acceso a espacios verdes, mientras que esta situación
                  afecta solo a <span className="font-bold">1 de cada 25 niños y niñas</span> de hogares con mayores
                  ingresos.
                  <br />
                  <br />
                  Este caso muestra que no todos los barrios ofrecen las mismas oportunidades de acceder a espacios
                  verdes, aun estando dentro de la misma ciudad.
                  <br />
                  <br />
                  Los espacios verdes ofrecen oportunidades de movimiento, exploración y calma, que fortalecen tanto la
                  salud como el desarrollo cognitivo de los niños y niñas.
                </p>
              </StatsCard>
            </div>
            <ParallaxStack
              slideX={slideX}
              className="h-[80vh] w-[70vw] -mr-48"
              layers={[
                { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
                { src: withBase('scrolly1/21.png'), visible: true, speed: 0.09, initialX: 150 },
                { src: withBase('scrolly1/26.png'), visible: true, speed: 0.02, initialX: 100 },
                { src: withBase('scrolly1/25.png'), visible: true, speed: -0.55, initialX: -2000, maxX: 3300 },
              ]}
            />

            <ScrollCard title="Lucila nació en un pueblo del interior de una provincia." style={{ ...cardStyle, width: 450 }}>
              En su pueblo hay una sola posta sanitaria, que solo resuelve consultas básicas en horarios limitados. Para
              estudios, urgencias o tratamientos más complejos, su familia debe trasladarse hasta la ciudad cabecera.
            </ScrollCard>

            <ParallaxStack
              slideX={slideX}
              className="h-[80vh] w-[70vw] -ml-48"
              layers={[
                { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
                { src: withBase('scrolly1/21.png'), visible: true, speed: 0.09, initialX: 150 },
                { src: withBase('scrolly1/24.png'), visible: true, speed: 0.02, initialX: 100 },
              ]}
            />
            <div className="relative z-10 -ml-48 -mr-48 mt-80 w-[450px] max-w-[90vw] bg-[#609B3E] p-4 shadow-xl">
              <div className="flex items-center justify-center gap-10 border-4 border-white p-4">
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0L20 16.719H14.5V24L5.5 24V16.719H0L10 0Z" fill="white" />
                </svg>

                <p className="text-lg font-bold uppercase leading-tight text-white">hasta el hospital más cercano</p>
                <p className="w-1/2 text-2xl font-bold leading-tight text-white">2h 10m</p>
              </div>
            </div>
            <ParallaxStack
              slideX={slideX}
              className="mt-48 h-[80vh] w-[70vw]"
              layers={[
                { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
                { src: withBase('scrolly1/14.png'), visible: true, speed: 0 },
                { src: withBase('scrolly1/08.png'), visible: true, speed: 0.1, initialX: 0 },
                { src: withBase('scrolly1/12.png'), visible: true, speed: 0.1, initialX: 1200 },
                { src: withBase('scrolly1/17.png'), visible: true, speed: 0.4, initialX: 2150 },
              ]}
            />
            <div className="relative z-10 w-[42rem] flex-none">
              <SingleStatsCard
                color="coral"
                numero={1}
                total={10}
                texto="no accede a servicios de salud cercanos"
                className="w-full"
              >
                <p className="text-lg text-gray-700 leading-relaxed">
                  <span className="font-bold text-cyan">En 240 localidades del país</span> hay que viajar{' '}
                  <span className="font-bold">más de 2 horas en auto</span> para llegar al hospital público más cercano.
                  <br />
                  Este caso muestra que la distancia también es una limitación: cuando la infraestructura sanitaria queda
                  lejos, se vuelve difícil acceder a controles, estudios o tratamientos que implican necesidades complejas.
                </p>
              </SingleStatsCard>
            </div>
            <ParallaxStack
              slideX={slideX}
              className="mr-[120px] h-[80vh] w-[70vw] -ml-[400px]"
              layers={[
                { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
                {
                  src: withBase('scrolly1/24.png'),
                  visible: true,
                  speed: 0.02,
                  initialX: 100,
                  scale: isMobile ? 2 : 1.65,
                },
              ]}
            />
            <ScrollCard
              className="ml-48 mr-16 overflow-hidden"
              title="Amanda nació en un pequeño pueblo rural, a más de cuatro horas de la capital de su provincia."
              style={{ ...cardStyle, width: 580, marginRight: 'calc(50vw - 325px)', marginLeft: 0 }}
              styleCard={{ padding: 48 }}
              pattern={false}
            >
              En su zona no hay un jardín de infantes cercano, por lo que Amanda no va todos los días. Las opciones de
              educación inicial requieren trasladarse a otras localidades, así que las familias de la zona organizan esos
              recorridos según sus tiempos y posibilidades.
            </ScrollCard>
          </div>
        </div>
      </div>
    </section>
  );
}
