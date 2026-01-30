export default function StatsCard({ children, greenText, redText, greenNumber, redNumber, className = '', style = {} }) {
  return (
    <div
      className={`bg-white shadow-xl overflow-hidden text-black ${className}`}
      style={style}
    >
      <div className="p-8">
        {children}
      </div>
      <div className="flex w-full">
        <div className="w-1/2 bg-redmap p-6 text-white text-3xl font-bold">
        <img src="./arrow.png" alt="Green Icon" className="w-6 h-6 mb-4 rotate-180" />
          <p className="text-3xl font-bold">{redText ?? '—'} {redNumber ?? '—'}</p>
          <p className="text-sm  font-regular uppercase">no accede</p>
          <div className="flex items-bottom justify-left flex-wrap gap-2 mt-4" >
            {Array.from({ length: redNumber - 1 }).map((_, index) => 
              <img src="./person.png" key={index} className="h-4" />
            )}
            <img src="./person.png" className="h-6" />
          </div>
        </div>
        <div className="w-1/2 bg-greenmap p-6 text-white text-3xl font-bold">
        <img src="./arrow.png" alt="Green Icon" className="w-6 h-6 mb-4" />
          <p className="text-3xl font-bold">{greenText ?? '—'} {greenNumber ?? '—'}</p>
          <p className="text-sm  font-regular uppercase">accede</p>
          <div className="flex items-bottom justify-left flex-wrap gap-2 mt-4" >
            {Array.from({ length: greenNumber - 1 }).map((_, index) => 
              <img src="./person.png" key={index} className="h-4" />
            )}
            <img src="./person.png" className="h-6" />
          </div>

        </div>
      </div>
    </div>
  );
}
