import { useEffect, useRef, useState } from 'react';
import ScrollCard from './ScrollCard';
import StatsCard from './StatsCard';
import SingleStatsCard from './SingleStatsCard';
import ScrollyStack from './ScrollyStack';
import ParallaxStack from './ParallaxStack';
import { withBase } from '../utils/withBase';

const SCROLL_STEP_1_PX = 400;
const SCROLL_STEP_2_PX = 400;
const SCROLL_STEP_3_PX = 400;
const SCROLL_STEP_4_PX = 400;
const SLIDE_SCROLL_PX = 2500; // px de scroll vertical para recorrer todo el strip

const SCROLLY_PHASE_END_PX = SCROLL_STEP_1_PX + SCROLL_STEP_2_PX + SCROLL_STEP_3_PX + SCROLL_STEP_4_PX;

const SCROLLY_STEPS = [
  [0],
  [10, 11, 12, 13, 14, 15, 16, 17, 0],
  [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 0],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 0],
];

const cardStyle = { position: 'relative', top: 'auto', transform: 'none' };

export default function HorizontalScroll() {
  const sectionRef = useRef(null);
  const stripRef = useRef(null);
  const [scrollyStep, setScrollyStep] = useState(0);
  const [slideX, setSlideX] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const progress = Math.max(0, window.scrollY - sectionTop + window.innerHeight * 0.3);

      if (progress < SCROLL_STEP_1_PX) {
        setScrollyStep(0);
        setSlideX(0);
      } else if (progress < SCROLL_STEP_1_PX + SCROLL_STEP_2_PX) {
        setScrollyStep(1);
        setSlideX(0);
      } else if (progress < SCROLL_STEP_1_PX + SCROLL_STEP_2_PX + SCROLL_STEP_3_PX) {
        setScrollyStep(2);
        setSlideX(0);
      } else if (progress < SCROLLY_PHASE_END_PX) {
        setScrollyStep(3);
        setSlideX(0);
      } else {
        setScrollyStep(3);
        const sp = Math.min(1, (progress - SCROLLY_PHASE_END_PX) / SLIDE_SCROLL_PX);
        const strip = stripRef.current;
        const maxScrollX = strip ? strip.scrollWidth - window.innerWidth : 0;
        setSlideX(-sp * maxScrollX);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const totalScrollHeight = SCROLLY_PHASE_END_PX + SLIDE_SCROLL_PX;

  return (
    <section
      ref={sectionRef}
      className="relative bg-navy"
      style={{ minHeight: `calc(${totalScrollHeight}px + 80vh)` }}
    >
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-navy">
        <div
          ref={stripRef}
          className="absolute top-0 left-0 h-full flex items-center"
          style={{
            transform: `translateX(${slideX}px)`,
            transition: 'transform 75ms ease-out',
          }}
        >
          {/* Sección 1: ScrollyStack */}
          <div className="w-screen h-screen flex-shrink-0 flex items-center justify-center">
            <div className="relative w-full max-w-screen aspect-video max-h-[90vh]">
              <ScrollyStack
                folder="scrolly1"
                totalImages={18}
                steps={SCROLLY_STEPS}
                currentStep={scrollyStep}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Sección 2: Card Pedro */}
          <div className="flex-shrink-0 h-screen flex items-center pr-10 gap-10">
            <ScrollCard
              title="Pedro nació en la periferia de una gran ciudad."
              style={{ ...cardStyle, width: 450 }}
            >
              En su barrio hay un jardín de infantes cerca y calles transitadas que conectan con otras zonas.
              Aun así, no hay plazas o parques a una distancia caminable, por lo que los espacios al aire libre donde jugar o explorar quedan más lejos de su vida cotidiana.
            </ScrollCard>

            <ParallaxStack
              slideX={slideX}
              className="h-[80vh] w-[50vw]"
              layers={[
                { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
                { src: withBase('scrolly1/22.png'), visible: true, speed: 0.1, initialX: 200 },
                { src: withBase('scrolly1/21.png'), visible: true, speed: 0.05, initialX: 600 },
                { src: withBase('scrolly1/19.png'), visible: true, speed: 0.1, initialX: 500 },
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
                  En las grandes ciudades, <span className="font-bold text-cyan">1 de cada 5 niños y niñas</span> de hogares de menor nivel socioeconómico no tiene acceso a espacios verdes, mientras que esta situación afecta solo a <span className="font-bold">1 de cada 25 niños y niñas</span> de hogares con mayores ingresos.<br />
                  Este caso muestra que no todos los barrios ofrecen las mismas oportunidades de acceder a espacios verdes, aun estando dentro de la misma ciudad.<br />
                  Los espacios verdes ofrecen oportunidades de movimiento, exploración y calma, que fortalecen tanto la salud como el desarrollo cognitivo de los niños y niñas.
                </p>
              </StatsCard>
            </div>
            <ParallaxStack
              slideX={slideX}
              className="h-[80vh] w-[50vw] -mr-48"
              layers={[
                { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
                { src: withBase('scrolly1/21.png'), visible: true, speed: 0.09, initialX: 150 },
                { src: withBase('scrolly1/26.png'), visible: true, speed: 0.02, initialX: 100 },
                { src: withBase('scrolly1/25.png'), visible: true, speed: -0.6, initialX: -2000, maxX: 3000, debug: true },
              ]}
            />
          
            <ScrollCard
              title="Lucila nació en un pueblo del interior de una provincia."
              style={{ ...cardStyle, width: 450 }}
            >
              En su pueblo hay una sola posta sanitaria, que solo resuelve consultas básicas en horarios limitados.
              Para estudios, urgencias o tratamientos más complejos, su familia debe trasladarse hasta la ciudad cabecera.
            </ScrollCard>

            <ParallaxStack
              slideX={slideX}
              className="h-[80vh] w-[50vw] -ml-48"
              layers={[
                { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
                { src: withBase('scrolly1/21.png'), visible: true, speed: 0.09, initialX: 150 },
                { src: withBase('scrolly1/24.png'), visible: true, speed: 0.02, initialX: 100 },
                // { src: withBase('scrolly1/25.png'), visible: true, speed: -0.5, initialX: -2800 },
              ]}
            />
            <div className="w-[450px] max-w-[90vw] bg-[#609B3E] shadow-xl p-4 mt-80 -ml-48 -mr-48 relative z-10">
              <div className="border-4 border-white p-4 flex justify-center items-center gap-10">
                <svg width="20" height="24" className='' viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0L20 16.719H14.5V24L5.5 24V16.719H0L10 0Z" fill="white"/>
                </svg>

                <p className="text-lg font-bold text-white leading-tight uppercase">
                  hasta el hospital más cercano
                </p>
                <p className="text-2xl font-bold text-white leading-tight w-1/2">
                  2h 10m
                </p>
              </div>
            </div>
            <ParallaxStack
              slideX={slideX}
              className="h-[80vh] w-[50vw] mt-48"
              layers={[
                { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
                { src: withBase('scrolly1/14.png'), visible: true, speed: 0 },
                { src: withBase('scrolly1/08.png'), visible: true, speed: 0.1, initialX: 0 },
                { src: withBase('scrolly1/12.png'), visible: true, speed: 0.1, initialX: 1200 },
                { src: withBase('scrolly1/17.png'), visible: true, speed: 0.4, initialX: 2150  },
              ]}
            />
            <div className="w-[42rem] flex-none relative z-10">
              <SingleStatsCard
                color="coral"
                numero={1}
                total={10}
                texto="no accede a servicios de salud cercanos"
                className="w-full"
              >
                <p className="text-lg text-gray-700 leading-relaxed">
                  <span className="font-bold text-cyan">En 240 localidades del país</span> hay que viajar <span className="font-bold">más de 2 horas en auto</span> para llegar al hospital público más cercano.<br />
                  Este caso muestra que la distancia también es una limitación: cuando la infraestructura sanitaria queda lejos, se vuelve difícil acceder a controles, estudios o tratamientos que implican necesidades complejas.
                </p>
              </SingleStatsCard>
            </div>
            <ParallaxStack
              slideX={slideX}
              className="h-[80vh] w-[60vw] -ml-[600px]"
              layers={[
                { src: withBase('scrolly1/0.png'), visible: true, speed: 0 },
                { src: withBase('scrolly1/24.png'), visible: true, speed: 0.02, 
                  initialX: 100, scale: 1.65 },
              ]}
            />
            <ScrollCard
            className='ml-48 mr-16 overflow-hidden'
              title="Amanda nació en un pequeño pueblo rural, a más de cuatro horas de la capital de su provincia."
              style={{ ...cardStyle, width: 650 }}
            >
              En su zona no hay un jardín de infantes cercano, por lo que Amanda no va todos los días.
              Las opciones de educación inicial requieren trasladarse a otras localidades, así que las familias de la zona organizan esos recorridos según sus tiempos y posibilidades.
            </ScrollCard>
          </div>
        </div>
      </div>
    </section>
  );
}
