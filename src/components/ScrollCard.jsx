export default function ScrollCard({ title, children, className = '', style = {} }) {
  return (
    <div
      className={`absolute right-0 w-[450px] min-h-[200px] max-w-[90vw] pointer-events-none transition-transform duration-300 ease-out text-black ${className}`}
      style={{
        top: '50%',
        transform: style.transform ?? 'translateY(-50%)',
        ...style,
      }}
    >
      {/* Imagen de fondo: se estira con la altura del contenido */}
      <img src="/card.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center z-0 rounded-lg" />
      {/* Contenido en flujo para que la card crezca en altura con el texto */}
      <div className="relative z-10 p-10 max-h-[85vh] overflow-y-auto">
        <div className="bg-white p-8 shadow-lg rounded-sm">
          {title != null && title !== '' ? (
            <>
              <h3 className="text-4xl mb-2 text-black font-medium leading-tighter">
                {title}
              </h3>
              <p className="text-xl text-gray-600 leading-tighter mt-12">
                {children}
              </p>
            </>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
