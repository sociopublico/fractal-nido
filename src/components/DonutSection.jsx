import DimensionsDonutChart from './DimensionsDonutChart';

export default function DonutSection() {
  return (
    <section className="relative bg-white">
      <div className="bg-[#0030870D] md:pt-24 pt-12">
        <div className="px-6 md:px-12">
          <h2 className="mx-auto mb-12 max-w-xl text-center md:text-4xl text-3xl font-medium text-black">
            No todas las dimensiones pesan lo mismo en el índice.
          </h2>
          <div className="mx-auto flex max-w-7xl flex-col justify-center gap-2 md:flex-row">
            <div className="w-full px-4 text-center md:w-1/3 border-b border-navy/10 md:border-b-0 pb-4 md:pb-0">
            <p className="md:text-4xl text-3xl font-medium text-navy mb-4">1</p>
            <p className="text-xl font-bold text-navy">Impacto en el desarrollo</p>
            <p className="text-xl text-navy -mt-1">Cuánto influye en la infancia.</p>
          </div>
            <div className="w-full px-4 text-center md:w-1/3 border-b border-navy/10 md:border-b-0 pb-4 md:pb-0 md:border-l md:border-navy/10">
            <p className="md:text-4xl text-3xl font-medium text-navy mt-4 md:mt-0 mb-4">2</p>
            <p className="text-xl font-bold text-navy">Potencial de intervención</p>
            <p className="text-xl text-navy -mt-1">Qué tan viable es mejorarla.</p>
          </div>
            <div className="w-full px-4 text-center md:w-1/3 md:border-l md:border-navy/10">
            <p className="md:text-4xl text-3xl font-medium text-navy mt-4 md:mt-0 mb-4">3</p>
            <p className="text-xl font-bold text-navy">Urgencia contextual</p>
            <p className="text-xl text-navy -mt-1">Qué tan prioritario es abordarla hoy.</p>
            </div>
          </div>
          <p className="mx-auto mb-4 mt-16 max-w-xl leading-tight md:leading-relaxed text-center text-lg text-black">
            Su importancia se define segun su impacto en la infancia, la posibilidad de mejora y la urgencia de actuar.
          </p>
          <DimensionsDonutChart />
        </div>
      </div>
    </section>
  );
}
