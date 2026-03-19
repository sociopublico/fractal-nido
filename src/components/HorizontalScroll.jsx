import { useEffect, useRef, useState } from 'react';
import ScrollCard from './ScrollCard';
import StatsCard from './StatsCard';
import SingleStatsCard from './SingleStatsCard';
import ScrollyStack from './ScrollyStack';

// Rango de scroll (en px) para cada fase
const SCROLL_STEP_1_PX = 400;     // paso 0 → paso 1 del scrolly
const SCROLL_STEP_2_PX = 400;     // paso 1 → paso 2 del scrolly
const SCROLL_STEP_3_PX = 400;     // paso 2 → paso 3 del scrolly
const SCROLL_STEP_4_PX = 400;     // paso 3 → paso 4 (un paso más antes de slide)
const SCROLL_SLIDE_PX = 320;      // primer slide (Pedro card)
const SCROLL_SLIDE_2_PX = 320;    // segundo slide (stats)
const SCROLL_SLIDE_3_PX = 320;    // tercer slide (scrolly4 + card)
const SCROLL_SLIDE_4_PX = 320;    // cuarto slide (card blanca)
const SCROLL_SLIDE_5_PX = 320;    // quinto slide (imagen + single stats)
const SCROLL_SLIDE_6_PX = 320;    // sexto slide (ScrollCard final)
const SECTION2_BASE_OFFSET_VW = -30; // "margen" negativo para reducir aire antes de Pedro
const SECTION4_BASE_OFFSET_VW = -34; // "margen" negativo para reducir aire en el paso siguiente

const SCROLLY_PHASE_END_PX = SCROLL_STEP_1_PX + SCROLL_STEP_2_PX + SCROLL_STEP_3_PX + SCROLL_STEP_4_PX;
const SLIDE_TOTAL_PX = SCROLL_SLIDE_PX + SCROLL_SLIDE_2_PX + SCROLL_SLIDE_3_PX + SCROLL_SLIDE_4_PX + SCROLL_SLIDE_5_PX + SCROLL_SLIDE_6_PX;

// Qué capas (01..18) están prendidas en cada paso del scrolly (4 pasos antes de que empiece el slide)
const SCROLLY_STEPS = [
  [18],
  [10, 11, 12, 13, 14, 15, 16, 17, 18],
  [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], // paso extra antes de scrollear
];

export default function HorizontalScroll() {
  const sectionRef = useRef(null);
  const [scrollyStep, setScrollyStep] = useState(0);
  const [slideX, setSlideX] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const scrollY = window.scrollY;
      const progress = Math.max(0, scrollY - sectionTop + window.innerHeight * 0.3);

      // Pasos del scrolly (imágenes superpuestas): 0, 1, 2, 3; después empieza el slide
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
        const sp = Math.min(1, (progress - SCROLLY_PHASE_END_PX) / SLIDE_TOTAL_PX);
        const nextSlideX = -sp * 600;
        setSlideX(nextSlideX);
        setSlideProgress(sp);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalScrollHeight =
    SCROLLY_PHASE_END_PX + SLIDE_TOTAL_PX;

  return (
    <section
      ref={sectionRef}
      className="relative bg-navy"
      style={{ minHeight: `calc(${totalScrollHeight}px + 80vh)` }}
    >
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-navy">
        {/* Strip horizontal: 7 secciones de 100vw */}
        <div
          className="absolute top-0 left-0 h-full flex transition-transform duration-75 ease-out"
          style={{
            width: '700vw',
            transform: `translateX(${slideX}vw)`,
          }}
        >
          {/* Sección 1: imágenes superpuestas (scrolly1/01..18), qué capas se prenden por paso */}
          <div className="w-screen min-h-screen flex-shrink-0 flex items-center justify-center">
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

          {/* Sección 2: card Pedro — parallax más rápido */}
          <div
            className="w-screen min-h-screen flex-shrink-0 relative flex items-center justify-end pr-8 md:pr-16 transition-transform duration-75 ease-out"
            style={{
              transform: `translateX(${SECTION2_BASE_OFFSET_VW + slideProgress * -120}vw)`,
              zIndex: 1000,
            }}
          >
            <div>
            <ScrollCard
              title="Pedro nació en la periferia de una gran ciudad."
              style={{ transform: 'translateY(-50%)' }}
              className="-ml-[900px]"
            >
              En su barrio hay un jardín de infantes cerca y calles transitadas que conectan con otras zonas.
              Aun así, no hay plazas o parques a una distancia caminable, por lo que los espacios al aire libre donde jugar o explorar quedan más lejos de su vida cotidiana.
            </ScrollCard>
            </div>
          </div>

          {/* Sección 3: scrolly4 */}
          <div className="w-screen min-h-screen flex-shrink-0 flex items-center justify-center gap-6 px-6">
            <div className="w-[42rem] flex-none">
            <StatsCard
              textoMenorIngreso={"1 de cada"}
              textoMayorIngreso={"1 de cada"}
              numMenorIngreso={1}
              numMayorIngreso={5}
              total={25}
              className="w-full -ml-[500px]"
            >
              <p className="text-lg text-gray-700 leading-relaxed">
              En las grandes ciudades, <span className="font-bold text-cyan">1 de cada 5 niños y niñas</span> de hogares de menor nivel socioeconómico no tiene acceso a espacios verdes, mientras que esta situación afecta solo a <span className="font-bold">1 de cada 25 niños y niñas</span> de hogares con mayores ingresos.<br/>
              Este caso muestra que no todos los barrios ofrecen las mismas oportunidades de acceder a espacios verdes, aun estando dentro de la misma ciudad.<br/>
              Los espacios verdes ofrecen oportunidades de movimiento, exploración y calma, que fortalecen tanto la salud como el desarrollo cognitivo de los niños y niñas.              </p>
            </StatsCard>
            </div>
            <img
              src="./scrolly4.png"
              alt=""
              className="w-[34vw] -ml-[400px] max-w-[40vw] max-h-[80vh] h-auto object-contain flex-none"
            />
          </div>

          {/* Sección 4: scrolly4 + card nueva */}
          <div className="w-screen min-h-screen flex-shrink-0 flex items-center justify-center px-8 gap-8">
            <img
              src="./scrolly1/scrolly4.png"
              alt=""
              className="max-h-[80vh] w-auto h-auto object-contain flex-shrink-0"
            />
            {/* Sección 2: card Pedro — parallax más rápido */}
          <div
            className="w-fit flex-shrink-0 relative flex items-center justify-end pr-8 md:pr-16 transition-transform duration-75 ease-out"
            style={{
              transform: `translateX(${SECTION4_BASE_OFFSET_VW + slideProgress * -60}vw)`,
              zIndex: 1000,
            }}
          >
            <ScrollCard
              title="Lucila nació en un pueblo del interior de una provincia."
              style={{ position: 'relative', top: 'auto', transform: 'none', transform: 'translateX(-50%)' }}
            >
              En su pueblo hay una sola posta sanitaria, que solo resuelve consultas básicas en horarios limitados.
              Para estudios, urgencias o tratamientos más complejos, su familia debe trasladarse hasta la ciudad cabecera.            </ScrollCard>
          </div>
          </div>

          {/* Sección 5: card blanca con texto azul — parallax, alineada abajo */}
          <div
            className="w-screen min-h-screen flex-shrink-0 relative flex items-end justify-end pb-16 pr-8 md:pr-16 transition-transform duration-75 ease-out"
            style={{
              transform: `translateX(${30 + slideProgress * -120}vw)`,
              zIndex: 1000,
            }}
          >
            <div className="w-[450px] max-w-[90vw] bg-white shadow-xl p-4">
              <div className='border-4 border-blue p-4'>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.77864 3.828L8.77864 16L6.77864 16L6.77864 3.828L1.41464 9.192L0.000640529 7.778L7.77864 -3.39987e-07L15.5566 7.778L14.1426 9.192L8.77864 3.828Z" fill="#003087"/>
                </svg>

                <p className="text-2xl font-bold text-navy leading-tight my-2">
                  2h 10m
                </p>
                <p className="text-lg font-medium text-navy leading-tight uppercase">
                hasta el hospital más cercano
                </p>

              </div>
            </div>
          </div>

          {/* Sección 6: imagen placeholder + single stats card */}
          <div className="w-screen min-h-screen flex-shrink-0 flex items-center justify-center px-6 gap-6">
            <img
              src="./scrolly1/scrolly4.png"
              alt=""
              className="w-[34vw] max-w-[34vw] max-h-[80vh] h-auto object-contain flex-none"
            />
            <div className="w-[42rem] flex-none">
            <SingleStatsCard
              color="coral"
              numero={1}
              total={10}
              texto="no accede a servicios de salud cercanos"
              className="w-full"
            >
              <p className="text-lg text-gray-700 leading-relaxed">
              <span className="font-bold text-cyan">En 240 localidades del país</span> hay que viajar <span className="font-bold">más de 2 horas en auto </span> para llegar al hospital público más cercano.<br/>
              Este caso muestra que la distancia también es una limitación: cuando la infraestructura sanitaria queda lejos, se vuelve difícil acceder a controles, estudios o tratamientos que implican necesidades complejas.
              </p>
            </SingleStatsCard>
            </div>
          </div>

          {/* Sección 7: ScrollCard final */}
          <div className="w-screen min-h-screen flex-shrink-0 flex items-center justify-center px-8">
          <img
              src="./scrolly1/scrolly4.png"
              alt=""
              className="max-w-screen w-[40vw] max-h-[80vh] w-auto h-auto object-contain flex-shrink-0"
            />

            <ScrollCard
              title="Amanda nació en un pequeño pueblo rural, a más de cuatro horas de la capital de su provincia."
              style={{ position: 'relative', top: 'auto', transform: 'none', width: 650, marginLeft: 100 }}
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
