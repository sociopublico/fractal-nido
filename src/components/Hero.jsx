
export default function Hero() {
  return (
    <div>
      <section className="max-w-screen-lg mx-auto hero rounded-2xl pt-16 pb-12 px-6 md:px-10 text-black">
        <p className="text-xl mb-10">Cada nacimiento es el punto de partida de una vida.</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium">
          En Argentina, no todos parten desde el mismo lugar.
        </h1>
      </section>
      <img src="/header.png" alt="Header" className="w-full object-cover object-left h-[90]" />
      
    </div>
  );
}
