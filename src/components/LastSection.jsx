import DimensionsDonutChart from './DimensionsDonutChart';
import { withBase } from '../utils/withBase';

export default function LastSection() {
  return (
    <section
      className="relative bg-white"
    >
      <img
        src={withBase('header.png')}
        alt="Divisor de sección"
        className="w-full object-cover object-left h-[250px]"
      />

      
    <div className="bg-[#003087] pt-12 -mt-1">
      <div className="max-w-4xl mx-auto px-6 md:px-10 md:space-y-12">
        <p className=" text-lg font-light leading-tight mt-0 md:mt-12 md:mb-12 mb-6 text-white">Las desigualdades territoriales no son inevitables.</p>
        <h2 className="md:text-5xl text-3xl font-light leading-tightest text-cyan">Podemos orientar políticas y recursos para transformar el mapa.</h2>
        <p className=" text-lg font-light leading-tight md:mt-12 mt-8 text-white pb-24">El índice NIDO muestra con información precisa en dónde están las brechas y señala las zonas donde una intervención puede hacer una gran diferencia.</p>
      </div>
    </div>
    <div className="bg-white pt-12 pb-20">
      <div className="max-w-4xl mx-auto px-6 md:px-10 space-y-12">
        <p className="text-center text-2xl leading-tight mt-12 mb-12 text-black">
        <b>El punto de partida no debería definir el acceso a las oportunidades.</b><br/>
        Conocé más sobre el{' '}
        <a 
          href="https://fractalargentina.org/wp-content/uploads/2026/05/FBB_WP_Nido-2.pdf" target="_blank" 
          rel="noopener noreferrer" 
          className="font-semibold text-cyan hover:underline transition-colors duration-200">índice NIDO</a> 
          {' '}y explorá el{' '}
        <a
          href="https://nido.up.railway.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-cyan hover:underline transition-colors duration-200"
        >
          mapa interactivo
        </a>.
   
          
          </p>

      <img src={withBase('b&b.png')} alt="Logo"  width={180} height={150} className="mx-auto mb-20" />
      </div>
    </div>
    </section>
  );
}
