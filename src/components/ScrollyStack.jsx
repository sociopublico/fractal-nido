import { withBase } from '../utils/withBase';

/**
 * ScrollyStack: varias imágenes superpuestas (carpeta con 01..18).
 * La 01 queda arriba (delante), la 18 atrás.
 * steps[currentStep] define qué números de imagen están "prendidos" en cada paso.
 *
 * @param {string} folder - Carpeta en public (ej: "scrolly1") → rutas /scrolly1/01.png
 * @param {number} totalImages - Cantidad de imágenes (default 18)
 * @param {number[][]} steps - Por paso: lista de números de imagen visibles. Ej: [[1],[1,2],[1,2,3]]
 * @param {number} currentStep - Índice del paso actual (0, 1, 2, ...)
 * @param {string} className - Clases del contenedor
 * @param {object} style - Estilos del contenedor
 */
export default function ScrollyStack({
  folder = 'scrolly1',
  totalImages = 18,
  steps = [[1], [1, 2], [1, 2, 3]],
  currentStep = 0,
  className = '',
  style = {},
}) {
  const stepIndex = Math.max(0, Math.min(currentStep, steps.length - 1));
  const visibleSet = new Set(steps[stepIndex] ?? steps[0] ?? []);

  // Del fondo (18) al frente (1): mayor número = más atrás, menor = más arriba
  const layers = [];
  for (let n = totalImages; n >= 1; n--) {
    layers.push(n);
  }

  const folderPath = String(folder).replace(/^\/+/, '');

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      style={style}
    >
      {layers.map((num) => (
        <img
          key={num}
          src={withBase(`${folderPath}/${String(num).padStart(2, '0')}.png`)}
          alt=""
          className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none transition-opacity duration-200 ease-out"
          style={{ opacity: visibleSet.has(num) ? 1 : 0, zIndex: totalImages - num + 1 }}
        />
      ))}
    </div>
  );
}
