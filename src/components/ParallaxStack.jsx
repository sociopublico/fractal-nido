/**
 * ParallaxStack: imágenes superpuestas con parallax individual.
 *
 * Cada capa puede prenderse/apagarse y moverse a distinta velocidad
 * a medida que el strip horizontal avanza.
 *
 * @param {Array}  layers   - Configuración de capas, de atrás hacia adelante:
 *   {
 *     src:     string,  // ruta de la imagen
 *     visible: boolean, // si está prendida (default true)
 *     speed:   number,  // factor de parallax (default 0):
 *                       //   0  = se mueve con el strip (sin efecto)
 *                       //   +N = se mueve N veces más rápido (sale "delante")
 *                       //   -N = se mueve N veces más lento (queda "atrás")
 *     zIndex:  number,  // z-index explícito (default: orden en el array)
 *    
 *   }
 * @param {number} slideX   - Offset horizontal actual del strip en px (del parent)
 * @param {string} className - Clases del contenedor
 * @param {object} style     - Estilos del contenedor
 */
export default function ParallaxStack({
  layers = [],
  slideX = 0,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`relative flex-none ${className}`}
      style={style}
    >
      {layers.map((layer, i) => {
        const visible = layer.visible !== false;
        const speed = layer.speed ?? 0;
        const start = layer.initialX ?? 0;
        // slideX es negativo (el strip se mueve izquierda).
        // speed > 0: la capa se adelanta (parece más cercana).
        // speed < 0: la capa se retrasa (parece más lejana).
        const extraX = layer.maxX ? Math.min(slideX * speed, layer.maxX) : slideX * speed

        if(layer.debug) console.log(layer.src, extraX)

        return (
          <img
            key={i}
            src={layer.src}
            alt=""
            className={`absolute top-0 left-0 w-full h-full object-contain object-center pointer-events-none`}
            style={{
              opacity: visible ? 1 : 0,
              zIndex: layer.zIndex ?? i + 1,
              transform: `translateX(${start + extraX}px)   scale(${layer.scale ?? 1})`,
              transition: 'opacity 200ms ease-out, transform 75ms linear',
            }}
          />
        );
      })}
    </div>
  );
}
