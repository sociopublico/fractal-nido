import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { withBase } from '../utils/withBase';

function WalkingPerson({ size }) {
  return (
    <DotLottieReact
      src={withBase('walk.lottie')}
      loop
      autoplay
      style={{ width: size, height: size, marginRight: -8.75 }}
    />
  );
}

export default function StatsCard({
  children,
  numMenorIngreso,
  numMayorIngreso,
  total,
  className = '',
  style = {},
  ..._legacyTextoProps
}) {
  return (
    <div className="md:m-0 mx-4">
      <div
      className={`overflow-hidden bg-white text-black shadow-xl max-md:min-w-0 md:min-w-[32rem] ${className}`}
      style={style}
    >
      <div className="max-md:p-6 md:p-8">{children}</div>
      <div className="flex w-full flex-col md:flex-row">
        <div className="w-full bg-mayorIngreso p-6 text-3xl text-white max-md:p-4 max-md:text-2xl md:w-1/2">
          <img src={withBase('arrow.png')} alt="" className="mb-4 h-6 w-6" />
          <p className="font-medium md:font-bold text-4xl md:text-3xl">{numMayorIngreso ?? '—'} de cada {total ?? '—'}</p>
          <p className="text-sm font-medium md:font-bold uppercase">de menor nivel socioeconómico no accede a espacios verdes</p>
          <div className="mt-4 flex flex-wrap items-end justify-start gap-2">
            {Array.from({ length: numMayorIngreso }).map((_, index) => (
              <WalkingPerson key={index} size={24} />
            ))}
            {Array.from({ length: total - numMayorIngreso }).map((_, index) => (
              <WalkingPerson key={index} size={16} />
            ))}
          </div>
        </div>

        <div className="w-full bg-menorIngreso p-6 text-3xl text-white max-md:p-4 max-md:text-2xl md:w-1/2">
          <img src={withBase('arrow.png')} alt="" className="mb-4 h-6 w-6 rotate-180" />
          <p className="font-medium md:font-bold text-4xl md:text-3xl">{numMenorIngreso ?? '—'} de cada {total ?? '—'}</p>
          <p className="text-sm font-medium md:font-bold uppercase">de mayor nivel socioeconómico no accede a espacios verdes</p>
          <div className="mt-4 flex flex-wrap items-end justify-start gap-2">
            {Array.from({ length: numMenorIngreso }).map((_, index) => (
              <WalkingPerson key={index} size={24} />
            ))}
            {Array.from({ length: total - numMenorIngreso }).map((_, index) => (
              <WalkingPerson key={index} size={16} />
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
    
  );
}
