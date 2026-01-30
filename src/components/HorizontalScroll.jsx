import { useEffect, useRef, useState } from 'react';
import ScrollCard from './ScrollCard';
import StatsCard from './StatsCard';

// Rango de scroll (en px) para cada fase
const SCROLL_OPACITY_2_PX = 400;  // scrolly2 pasa de 0 a 1
const SCROLL_OPACITY_3_PX = 400;  // scrolly3 pasa de 0 a 1
const SCROLL_SLIDE_PX = 500;      // primer slide (imágenes a la izquierda)
const SCROLL_SLIDE_4_PX = 500;    // slide hasta scrolly4
const SCROLL_SLIDE_STATS_PX = 500; // slide hasta stats card

const SLIDE_TOTAL_PX = SCROLL_SLIDE_PX + SCROLL_SLIDE_4_PX + SCROLL_SLIDE_STATS_PX;

export default function HorizontalScroll() {
  const sectionRef = useRef(null);
  const [opacity2, setOpacity2] = useState(0);
  const [opacity3, setOpacity3] = useState(0);
  const [slideX, setSlideX] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const scrollY = window.scrollY;
      const progress = Math.max(0, scrollY - sectionTop + window.innerHeight * 0.3);

      const phase12End = SCROLL_OPACITY_2_PX + SCROLL_OPACITY_3_PX;

      // Fase 1: opacidad de scrolly2 (0 → 1)
      if (progress < SCROLL_OPACITY_2_PX) {
        const t = progress / SCROLL_OPACITY_2_PX;
        setOpacity2(t);
        setOpacity3(0);
        setSlideX(0);
      }
      // Fase 2: opacidad de scrolly3 (0 → 1)
      else if (progress < phase12End) {
        setOpacity2(1);
        const t = (progress - SCROLL_OPACITY_2_PX) / SCROLL_OPACITY_3_PX;
        setOpacity3(t);
        setSlideX(0);
      }
      // Fase 3+: strip horizontal se corre a la izquierda (4 secciones de 100vw)
      else {
        setOpacity2(1);
        setOpacity3(1);
        const slideProgress = (progress - phase12End) / SLIDE_TOTAL_PX;
        const t = Math.min(1, slideProgress);
        // 0 → -300vw para recorrer las 4 secciones (cada una 100vw)
        setSlideX(-t * 300);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalScrollHeight =
    SCROLL_OPACITY_2_PX + SCROLL_OPACITY_3_PX + SLIDE_TOTAL_PX;

  return (
    <section
      ref={sectionRef}
      className="relative bg-navy"
      style={{ minHeight: `calc(${totalScrollHeight}px + 80vh)` }}
    >
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-navy">
        {/* Strip horizontal: 4 secciones de 100vw */}
        <div
          className="absolute top-0 left-0 h-full flex transition-transform duration-75 ease-out"
          style={{
            width: '400vw',
            transform: `translateX(${slideX}vw)`,
          }}
        >
          {/* Sección 1: tres imágenes superpuestas */}
          <div className="w-screen min-h-screen flex-shrink-0 flex items-center justify-center">
            <div className="relative w-full max-w-4xl mx-auto aspect-video max-h-[70vh] flex items-center justify-center">
              <img
                src="./scrolly1.png"
                alt=""
                className="absolute inset-0 w-full h-full object-contain object-center"
              />
              <img
                src="./scrolly2.png"
                alt=""
                className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none transition-opacity duration-75"
                style={{ opacity: opacity2 }}
              />
              <img
                src="./scrolly3.png"
                alt=""
                className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none transition-opacity duration-75"
                style={{ opacity: opacity3 }}
              />
            </div>
          </div>

          {/* Sección 2: card Pedro */}
          <div className="w-[25vw] min-h-screen flex-shrink-0 relative flex items-center justify-end pr-8 md:pr-16">
            <ScrollCard
              title="Pedro nació en la periferia de una gran ciudad."
              style={{ transform: 'translateY(-50%)' }}
            >
              En su barrio hay un jardín de infantes cerca y calles transitadas que conectan con otras zonas.
              Aun así, no hay plazas o parques a una distancia caminable, por lo que los espacios al aire libre donde jugar o explorar quedan más lejos de su vida cotidiana.
            </ScrollCard>
          </div>

          {/* Sección 3: scrolly4 */}
          <div className="w-screen min-h-screen flex-shrink-0 flex items-center justify-center">
            <img
              src="./scrolly4.png"
              alt=""
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
            />
          </div>

          {/* Sección 4: stats card (blanca, children + verde/rojo 50%) */}
          <div className="w-screen min-h-screen flex-shrink-0 flex items-center justify-center px-8">
            <StatsCard
              greenText={"1 de cada"}
              redText={"1 de cada"}
              greenNumber={25}
              redNumber={5}
              className="w-full max-w-lg"
            >
              <p className="text-lg text-gray-700 leading-relaxed">
              En las grandes ciudades, <span className="font-bold text-cyan">1 de cada 5 niños y niñas</span> de hogares de menor nivel socioeconómico no tiene acceso a espacios verdes, mientras que esta situación afecta solo a <span className="font-bold">1 de cada 25 niños y niñas</span> de hogares con mayores ingresos.<br/>
              Este caso muestra que no todos los barrios ofrecen las mismas oportunidades de acceder a espacios verdes, aun estando dentro de la misma ciudad.<br/>
              Los espacios verdes ofrecen oportunidades de movimiento, exploración y calma, que fortalecen tanto la salud como el desarrollo cognitivo de los niños y niñas.              </p>
            </StatsCard>
          </div>
        </div>
      </div>
    </section>
  );
}
