import { withBase } from "../utils/withBase";

export default function Hero() {
  return (
    <div>
      <section className="max-w-screen-lg mx-auto hero rounded-2xl pt-16 pb-12 mb-4 px-6 md:px-10 text-black">
        <p className="text-xl mb-10">Cada nacimiento es el punto de partida de una vida.</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium">
          En Argentina, no todos parten desde el mismo lugar.
        </h1>
      </section>
      <div className="flex md:h-[400px] h-[30vh] w-full items-center justify-center overflow-hidden">
        <img
          src={withBase('header.png')}
          alt=""
          className="h-full object-cover"
        />
      </div>
    </div>
  );
}
