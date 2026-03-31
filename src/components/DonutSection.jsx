import DimensionsDonutChart from './DimensionsDonutChart';

export default function DonutSection() {
  return (
    <section
      className="relative bg-white"
    >
      
    <div className="bg-[#0030870D] pt-24">
      <div className=" px-12 md:px-12 ">
        < h2 className="max-w-xl mx-auto text-4xl text-center font-medium text-black mb-12">No todas las dimensiones pesan lo mismo en el índice.</h2>
        <p className="max-w-xl mx-auto text-lg text-center text-black mb-12">Su importancia se define según su impacto en la infancia, la posibilidad de mejora y la urgencia de actuar.</p>
        <div className=" max-w-7xl mx-auto flex justify-center gap-2">
          <div className="text-center w-full md:w-1/3 px-4">
            <p className="text-4xl font-medium text-navy mb-4">1</p>
            <p className="text-xl font-bold text-navy">Impacto en el desarrollo</p>
            <p className="text-xl text-navy -mt-1">Cuánto influye en la infancia.</p>
          </div>
          <div className="text-center w-full md:w-1/3 border-l border-navy/10 px-4">
            <p className="text-4xl font-medium text-navy mb-4">2</p>
            <p className="text-xl font-bold text-navy">Potencial de intervención</p>
            <p className="text-xl text-navy -mt-1">Qué tan viable es mejorarla.</p>
          </div>
          <div className="text-center w-full md:w-1/3 border-l border-navy/10 px-4">
            <p className="text-4xl font-medium text-navy mb-4">3</p>
            <p className="text-xl font-bold text-navy">Urgencia contextual</p>
            <p className="text-xl text-navy -mt-1">Qué tan prioritario es abordarla hoy.</p>
          </div>  
        </div>
        <DimensionsDonutChart />

      </div>
    </div>
    </section>
  );
}
