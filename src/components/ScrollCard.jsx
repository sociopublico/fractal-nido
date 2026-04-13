import { withBase } from '../utils/withBase';

export default function ScrollCard({ title, children, className = '', styleCard = {},  style = {}, pattern=true }) {
  return (
    <div
      className={`absolute right-0 w-[420px] min-h-[200px] max-w-[90vw] pointer-events-none transition-transform duration-300 ease-out text-black ${className}`}
      style={{
        top: '50%',
        transform: style.transform ?? 'translateY(-50%)',
        ...style,
      }}
    >
      {/* Imagen de fondo: se estira con la altura del contenido */}
      {pattern && <img src={withBase('card.png')} alt="" className="absolute inset-0 w-full h-full object-cover object-center z-0" />}
      {/* Contenido en flujo para que la card crezca en altura con el texto */}
      <div className="relative z-10 p-10 max-h-[85vh]">
        <div className={`bg-white shadow-lg rounded-sm p-8`} style={styleCard}>
          {title != null && title !== '' ? (
            <>
              <h3 className="text-4xl mb-2 text-black font-medium leading-tighter">
                {title}
              </h3>
              <p className="text-xl text-gray font-medium mt-12">
                {children}
              </p>
            </>
          ) : (
            <p className="text-xl text-gray font-medium mt-12">
              {children}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
