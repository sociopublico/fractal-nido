import { withBase } from '../utils/withBase';

export default function ScrollCard({
  title,
  children,
  className = '',
  styleCard = {},
  style = {},
  pattern = true,
  /** Layout flotante (desktop / strip horizontal). En false: columna mobile. */
  floating = true,
}) {
  const positionClasses = floating
    ? 'absolute right-0 w-[420px] min-h-[200px] max-w-[90vw] pointer-events-none'
    : 'relative right-auto left-auto mx-auto min-h-0 w-full max-w-full pointer-events-auto';

  const outerPad = floating ? 'p-10 max-h-[85vh]' : 'p-4 md:p-10';
  const innerPad = floating ? 'p-8' : 'p-4 md:p-8';
  const titleClass = floating
    ? 'mb-2 text-4xl font-medium leading-tightest text-black'
    : 'mb-2 text-3xl font-medium leading-tighter text-black md:text-4xl';
  const bodyClass = floating
    ? 'mt-12 text-xl font-medium leading-snug text-gray'
    : 'mt-6 text-base font-medium leading-snug text-gray md:mt-12 md:text-xl';

  return (
    <div
      className={`${positionClasses} text-black transition-transform duration-300 ease-out ${className}`}
      style={{
        top: floating ? '50%' : undefined,
        transform: floating ? style.transform ?? 'translateY(-50%)' : style.transform ?? 'none',
        ...style,
      }}
    >
      {pattern && (
        <img
          src={withBase('card.png')}
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover object-center"
        />
      )}
      <div className={`relative z-10 overflow-visible ${outerPad}`}>
        <div className={`rounded-sm bg-white shadow-lg ${innerPad}`} style={styleCard}>
          {title != null && title !== '' ? (
            <>
              <h3 className={titleClass}>{title}</h3>
              <p className={bodyClass}>{children}</p>
            </>
          ) : (
            <p className={bodyClass}>{children}</p>
          )}
        </div>
      </div>
    </div>
  );
}
