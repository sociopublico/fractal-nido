import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { withBase } from '../utils/withBase';

function Clock({ size }) {
  return (
    <DotLottieReact
      src={withBase('clock.lottie')}
      loop
      autoplay
      style={{ width: size, height: size, marginRight: -3 }}
    />
  );
}

export default function SingleStatsCard({ children, color = 'menorIngreso', texto, numero, total, className = '', style = {} }) {
  return (
    <div
      className={`bg-white shadow-xl overflow-hidden text-black ${className}`}
      style={style}
    >
      <div className="p-8">
        {children}
      </div>
      <div className='bg-mayorIngreso p-6 text-white'>
        <img src={withBase('arrow.png')} alt="" className="w-6 h-6 mb-4 rotate-180" />

        <p className="text-3xl font-bold">+ de 2hs </p>

        <div className='flex items-bottom align-bottom justify-left mt-4'>

          {Array.from({ length: (total ?? 0) - (numero ?? 0) }).map((_, index) =>
            <Clock key={index} size={20} />
          )}
          {Array.from({ length: numero ?? 0 }).map((_, index) =>
            <Clock key={`big-${index}`} size={30} />
          )}

        </div>

      </div>
    </div>
  );
}
