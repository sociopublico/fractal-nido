import DimensionsDonutChart from './DimensionsDonutChart';

export default function DonutSection() {
  return (
    <section
      className="relative bg-white"
    >
      
    <div className="bg-[#0030870D] pt-24">
      <div className=" px-12 md:px-12 ">
        <p className="max-w-4xl mx-auto text-lg text-center text-black mb-20">Cada dimensión tiene un peso distinto en el índice, definido según tres criterios usados en la evaluación de políticas sociales:</p>
        <div className=" max-w-8xl mx-auto flex justify-center gap-2">
          <div className="text-center w-full md:w-1/3 px-4">
            <p className="text-2xl font-medium text-navy mb-4">1</p>
            <p className="text-md font-medium text-navy">Impacto en el desarrollo</p>
            <p className="text-md text-navy">Cuánto influye en la infancia.</p>
          </div>
          <div className="text-center w-full md:w-1/3 border-l border-navy/10 px-4">
            <p className="text-2xl font-medium text-navy mb-4">2</p>
            <p className="text-md font-medium text-navy">Potencial de intervención</p>
            <p className="text-md text-navy">Qué tan viable es mejorarla.</p>
          </div>
          <div className="text-center w-full md:w-1/3 border-l border-navy/10 px-4">
            <p className="text-2xl font-medium text-navy mb-4">3</p>
            <p className="text-md font-medium text-navy">Urgencia contextual</p>
            <p className="text-md text-navy">Qué tan prioritario es abordarla hoy.</p>
          </div>  
        </div>
        <DimensionsDonutChart />

      </div>
    </div>
    </section>
  );
}
