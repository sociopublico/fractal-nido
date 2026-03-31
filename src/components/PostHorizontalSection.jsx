
import MapAccessibilitySection from './MapAccessibilitySection';
import { withBase } from '../utils/withBase';

export default function PostHorizontalSection() {
  return (
    <section className="relative bg-white pt-28">
      <img
        src={withBase('header.png')}
        alt="Divisor de sección"
        className="absolute -top-2 left-0 w-full object-cover object-left h-[400px]"
      />

      <div className="max-w-xl mx-auto px-6 md:px-10 space-y-12">
        <div className="relative min-h-[200px] bg-white p-12 shadow-xl mb-20">
            <h3 className="text-4xl mb-2 text-black font-medium leading-tightest">
            En el año 2022 en Argentina, <span className="text-cyan">el 43.5% de los niños y niñas de 0 a 5 años no asistía al nivel inicial.</span></h3>
            <p className="text-xl font-medium mt-12 text-gray">
            Los niños y niñas que acceden a la educación inicial desde edades tempranas tienen mayores probabilidades de construir trayectorias escolares más sólidas. <br/><br/>
            Esta diferencia en el acceso temprano genera experiencias desiguales: quienes viven lejos de centros urbanos suelen comenzar más tarde, una brecha que luego se refleja en el desempeño escolar y en la continuidad educativa.
            </p>
        </div>
      </div>

      <div className="bg-[#0030870D]">
          <div className="max-w-3xl mx-auto md:px-10 pt-12">
            <p className="text-center px-16 text-lg font-light leading-tight mt-12 text-black">Las historias de Pedro, Lucila y Amanda son ficticias, pero las condiciones que los rodean son reales.</p>
            <h2 className="text-center text-4xl font-medium leading-tightest mt-12 text-black">Y definen sus posibilidades desde el primer día de vida.</h2>
          </div>
        <MapAccessibilitySection />
      </div>



      
    </section>
  );
}
