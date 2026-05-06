import { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const CARD_SCROLL_PX = 300;

const dimensions = [
  {
    label: 'Salud',
    description:
      'La <b>salud</b> considera qué tan cerca y accesibles están los efectores públicos, dado que la posibilidad de recibir atención a tiempo puede cambiar por completo los primeros años de vida.',
    Icon: SaludIcon,
  },
  {
    label: 'Educación',
    description:
      'La <b>educación</b> observa la posibilidad real de acceder a ella desde el nivel inicial: cuanto más temprano un niño accede a espacios de aprendizaje y cuidado, más se fortalecen sus trayectorias futuras.',
    Icon: EducacionIcon,
  },
  {
    label: 'Espacios Verdes',
    description:
      'La dimensión de <b>espacios verdes</b> mide cuánto tardan las familias en llegar a una plaza o parque, que no son solo lugares de juego, sino entornos que mejoran la calidad de vida y favorecen el desarrollo integral de la niñez.',
    Icon: EspaciosVerdesIcon,
  },
  {
    label: 'Contexto',
    description:
      'Por último, el <b>contexto</b> reúne los recursos materiales, sociales y cognitivos con los que cuentan las familias, desde las condiciones del hogar y la seguridad del barrio hasta la presencia de redes de apoyo. Estos factores pueden potenciar o limitar el desarrollo durante la primera infancia.',
    Icon: ContextoIcon,
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function NidoDimensionsScrolly() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const rafRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(() => dimensions.map(() => false));

  const progressStops = dimensions.map((_, index) => ({
    index,
    threshold: index / (dimensions.length - 1),
    position: (index / (dimensions.length - 1)) * 100,
    reached: progress >= index / (dimensions.length - 1),
  }));
  const activeCardsCount = clamp(
    progressStops.filter((stop) => progress >= stop.threshold).length,
    1,
    dimensions.length
  );

  useEffect(() => {
    if (!isMobile) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        setInView((prev) => {
          const next = [...prev];
          for (const entry of entries) {
            const raw = entry.target.getAttribute('data-dim-index');
            const idx = raw == null ? NaN : Number.parseInt(raw, 10);
            if (!Number.isFinite(idx) || idx < 0 || idx >= dimensions.length) continue;
            const ratio = entry.intersectionRatio;
            next[idx] = entry.isIntersecting && ratio >= 0.18;
          }
          return next;
        });
      },
      { threshold: [0, 0.1, 0.18, 0.35, 0.55], rootMargin: '0px 0px -12% 0px' }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return undefined;

    const section = sectionRef.current;
    if (!section) return undefined;

    const updateProgress = () => {
      const viewport = window.innerHeight;
      const sectionRect = section.getBoundingClientRect();
      const sectionTop = sectionRect.top + window.scrollY;
      const sectionHeight = section.offsetHeight;

      const startScrollY = sectionTop - viewport * 0.2;
      const scrollRange = Math.max(1, sectionHeight - viewport + viewport * 0.2);
      const raw = window.scrollY - startScrollY;
      const nextProgress = clamp(raw / scrollRange, 0, 1);

      setProgress((prev) => (Math.abs(prev - nextProgress) > 0.001 ? nextProgress : prev));
      rafRef.current = null;
    };

    const requestUpdate = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isMobile]);

  const scrollToDimension = useCallback(
    (index) => {
      if (index < 0 || index >= dimensions.length) return;

      if (isMobile) {
        cardRefs.current[index]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        return;
      }

      const section = sectionRef.current;
      if (!section) return;

      const viewport = window.innerHeight;
      const sectionRect = section.getBoundingClientRect();
      const sectionTop = sectionRect.top + window.scrollY;
      const sectionHeight = section.offsetHeight;
      const startScrollY = sectionTop - viewport * 0.2;
      const scrollRange = Math.max(1, sectionHeight - viewport + viewport * 0.2);
      const denom = Math.max(1, dimensions.length - 1);
      const targetScrollY = startScrollY + (index / denom) * scrollRange;

      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    },
    [isMobile]
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-white"
      style={
        isMobile
          ? undefined
          : { minHeight: `calc(${CARD_SCROLL_PX * dimensions.length}px + 120vh)` }
      }
    >
      <div
        className={`sticky top-0 flex items-center ${isMobile ? 'py-10' : 'min-h-screen py-16'}`}
      >
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <h2 className="mx-auto mb-10 max-w-4xl md:text-2xl text-3xl font-medium leading-tight text-black max-md:leading-tight md:mb-24 md:text-3xl md:leading-tight lg:text-5xl">
            El Índice NIDO reúne cuatro dimensiones que moldean las oportunidades desde el nacimiento.
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-4 md:gap-8">
            {dimensions.map((dimension, index) => {
              const isActive = isMobile ? inView[index] : index < activeCardsCount;
              const Icon = dimension.Icon;
              const inactiveTransform = isMobile
                ? 'translateY(16px) scale(0.98)'
                : 'translateY(22px) scale(0.97)';

              return (
                <article
                  key={dimension.label}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  data-dim-index={index}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ir a la dimensión ${dimension.label}`}
                  onClick={() => scrollToDimension(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      scrollToDimension(index);
                    }
                  }}
                  className={`relative cursor-pointer rounded bg-white shadow-lg transition-all ease-out will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan max-md:p-5 md:p-6 ${
                    isMobile ? 'duration-500' : 'duration-300'
                  }`}
                  style={{
                    opacity: isActive ? 1 : 0.22,
                    transform: isActive ? 'translateY(0) scale(1)' : inactiveTransform,
                    filter: isActive ? 'saturate(1)' : 'saturate(0.72)',
                    boxShadow: isActive
                      ? '0 20px 40px rgba(0,48,135,0.16)'
                      : '0 8px 30px rgba(0,48,135,0.08)',
                    borderColor: isActive ? 'rgba(0,161,222,0.38)' : 'rgba(0,48,135,0.15)',
                  }}
                >
                  <span className="absolute right-0 top-0 bg-[#0030870D] px-3 py-1 text-sm font-medium tracking-wide text-black transition-colors duration-250 ease-out md:text-md">
                    {dimension.label}
                  </span>

                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-cyan transition-transform max-md:mt-2 md:duration-700">
                    <Icon />
                  </div>
                  <p
                    className="mt-3 text-sm leading-snug text-black md:text-md md:leading-tight"
                    dangerouslySetInnerHTML={{ __html: dimension.description }}
                  />
                </article>
              );
            })}
          </div>

          <div className="mt-10 hidden md:block">
            <div className="relative h-[2px] w-full overflow-visible bg-[#C4CDD7]">
              <div className="absolute left-0 top-0 h-full bg-cyan" style={{ width: `${progress * 100}%` }} />
              {progressStops.map((stop) => (
                <span
                  key={`progress-stop-${stop.index}`}
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-250 ease-out"
                  style={{
                    left: `${stop.position}%`,
                    borderColor: stop.reached ? '#00A1DE' : '#C4CDD7',
                    backgroundColor: stop.reached ? '#00A1DE' : '#FFFFFF',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SaludIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 16V12H26V16H30V20H26V24H22V20H18V16H22Z"
        fill="#00A1DE"
      />
      <path
        d="M16 40V28H32V40H38V8H10V40H16ZM20 40H28V32H20V40ZM42 40H46V44H2V40H6V6C6 4.89544 6.89544 4 8 4H40C41.1046 4 42 4.89544 42 6V40Z"
        fill="#003087"
      />
    </svg>
  );
}

function EducacionIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 22.6666L0 18L24 4L48 18L44 20.3334L40 22.6666V36.0226L39.5548 36.5728C35.8914 41.0998 30.2836 44 24 44C17.7163 44 12.1086 41.0998 8.44526 36.5728L8 36.0226V22.6666ZM12 25V34.5834C14.9344 37.908 19.2222 40 24 40C28.7778 40 33.0656 37.908 36 34.5834V25L24 32L12 25ZM7.93854 18L24 27.3692L40.0614 18L24 8.63082L7.93854 18Z"
        fill="#003087"
      />
      <path d="M48 35V18L44 20.3334V35H48Z" fill="#00A1DE" />
    </svg>
  );
}

function EspaciosVerdesIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M41.996 6V10C41.996 17.732 35.728 24 27.996 24H25.996V26H35.996V40C35.996 42.2092 34.2052 44 31.996 44H15.9961C13.787 44 11.9961 42.2092 11.9961 40V26H21.996V20C21.996 12.268 28.2642 6 35.996 6H41.996Z"
        fill="#003087"
      />
      <path
        d="M10.9961 4C16.0533 4 20.526 6.50272 23.2432 10.3372C21.2052 13.0217 19.9961 16.3696 19.9961 20V22H18.9961C10.7118 22 3.99609 15.2843 3.99609 7V4H10.9961Z"
        fill="#00A1DE"
      />
    </svg>
  );
}

function ContextoIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M40 40C40 41.1046 39.1046 42 38 42H10C8.89544 42 8 41.1046 8 40V22H2L22.6546 3.22301C23.4174 2.52951 24.5826 2.52951 25.3454 3.22301L46 22H40V40ZM36 38V18.3149L24 7.40581L12 18.3149V38H36Z"
        fill="#003087"
      />
      <path
        d="M24.0004 34L17.2829 27.2824C15.5255 25.525 15.5255 22.6758 17.2829 20.9184C19.0402 19.1611 21.8894 19.1611 23.6468 20.9184L24.0004 21.272L24.354 20.9184C26.1114 19.1611 28.9606 19.1611 30.718 20.9184C32.4752 22.6758 32.4752 25.525 30.718 27.2824L24.0004 34Z"
        fill="#00A1DE"
      />
    </svg>
  );
}
