import { useState } from 'react';

/**
 * Ejemplo de uso de window.wpMiApp (solo en WordPress).
 * En local, apiUrl y nonce pueden estar indefinidos.
 */
function useWpConfig() {
  const wp = typeof window !== 'undefined' ? window.wpMiApp : undefined;
  return {
    apiUrl: wp?.apiUrl ?? '',
    nonce: wp?.nonce ?? '',
    isWp: Boolean(wp?.apiUrl),
  };
}

export default function Ejemplo() {
  const [contador, setContador] = useState(0);
  const { apiUrl, nonce, isWp } = useWpConfig();

  return (
    <div className="rounded-xl border border-gray/30 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-semibold text-navy">
        Mi App (React + Vite + Tailwind)
      </h1>
      <p className="mb-4 text-gray">
        Componente de ejemplo. Si está embebida en WordPress, verás la
        configuración de <code className="rounded bg-gray/20 px-1">window.wpMiApp</code>.
      </p>

      <div className="mb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setContador((c) => c - 1)}
          className="rounded-lg bg-gray/20 px-4 py-2 font-medium text-navy hover:bg-gray/30"
        >
          −
        </button>
        <span className="min-w-[3rem] text-center text-xl font-bold text-navy">
          {contador}
        </span>
        <button
          type="button"
          onClick={() => setContador((c) => c + 1)}
          className="rounded-lg bg-blue px-4 py-2 font-medium text-white hover:opacity-90"
        >
          +
        </button>
      </div>

      {isWp ? (
        <div className="rounded-lg bg-teal/20 p-3 text-sm text-navy">
          <strong>WordPress:</strong> apiUrl y nonce disponibles para llamadas
          REST.
          {apiUrl && (
            <div className="mt-1 truncate text-navy/80">
              apiUrl: {apiUrl}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-gold/20 p-3 text-sm text-navy">
          Modo desarrollo: <code>window.wpMiApp</code> no definido. En WordPress,
          define <code>wpMiApp.apiUrl</code> y <code>wpMiApp.nonce</code> al
          encolar el script.
        </div>
      )}
    </div>
  );
}
