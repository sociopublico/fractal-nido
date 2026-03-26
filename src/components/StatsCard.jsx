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

export default function StatsCard({ children, textoMenorIngreso, textoMayorIngreso, numMenorIngreso, numMayorIngreso, total,className = '', style = {} }) {
  return (
    <div
      className={`bg-white shadow-xl overflow-hidden text-black  min-w-[32rem] ${className}`}
      style={style}
    >
      <div className="p-8">
        {children}
      </div>
      <div className="flex w-full">
        <div className="w-1/2 bg-menorIngreso p-6 text-white text-3xl font-bold">
        <img src={withBase('arrow.png')} alt="Green Icon" className="w-6 h-6 mb-4 rotate-180" />
          <p className="text-3xl font-bold">{numMenorIngreso ?? '—'} de cada {total ?? '—'}</p>
          <p className="text-sm  font-regular uppercase">de menor nivel socioeconómico no accede a espacios verdes</p>
          <div className="flex items-bottom justify-left flex-wrap gap-2 mt-4" >
            {Array.from({ length: total - numMenorIngreso}).map((_, index) => 
              <WalkingPerson key={index} size={16} />
            )}
            {Array.from({ length: numMenorIngreso }).map((_, index) => 
              <WalkingPerson key={index} size={24} />
            )}
            
          </div>
        </div>
        <div className="w-1/2 bg-mayorIngreso p-6 text-white text-3xl font-bold">
        <img src={withBase('arrow.png')} alt="Green Icon" className="w-6 h-6 mb-4" />
          <p className="text-3xl font-bold">{numMayorIngreso ?? '—'} de cada {total ?? '—'}</p>
          <p className="text-sm  font-regular uppercase">de mayor nivel socioeconómico no accede a espacios verdes</p>
          <div className="flex items-bottom justify-left flex-wrap gap-2 mt-4" >
            {Array.from({ length: total - numMayorIngreso}).map((_, index) => 
              <WalkingPerson key={index} size={16} />
            )}
            
            {Array.from({ length: numMayorIngreso }).map((_, index) => 
              <WalkingPerson key={index} size={24} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
