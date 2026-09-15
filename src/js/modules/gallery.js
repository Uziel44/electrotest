/**
 * GALERÍA DE SERVICIOS
 *
 * La imagen de la columna izquierda de "Servicios" acompaña al acordeón:
 * al abrir un servicio se cambia la foto con un crossfade. En el sitio
 * original la imagen era fija y el id #imagen-servicio no se usaba nunca.
 *
 * @module gallery
 */

/** Foto de reserva si cualquier imagen de servicio falla al cargar. */
const FALLBACK_SRC = '/img/seccionador-altura.jpg';

/** Foto y epígrafe asociados a cada servicio del acordeón. */
const SERVICE_MEDIA = {
  protecciones: {
    src: '/img/celda-mt-schneider.jpeg',
    alt: 'Celda de media tensión con relés de protección y seccionador',
    caption: 'Ensayo de protecciones en estación transformadora.',
  },
  mantenimiento: {
    src: '/img/celda-media-tension.jpg',
    alt: 'Técnico realizando maniobras en celda de media tensión',
    caption: 'Mantenimiento preventivo en celdas de media tensión.',
  },
  instalacion: {
    src: '/img/campo-03.jpg',
    alt: 'Montaje de equipamiento eléctrico en playa de maniobras',
    caption: 'Montaje y conexionado de equipamiento en campo.',
  },
  telecontrol: {
    src: '/img/campo-02.jpg',
    alt: 'Trabajo sobre tablero de control y unidades terminales remotas',
    caption: 'Instalación y parametrización de sistemas de telecontrol.',
  },
  reparaciones: {
    src: '/img/seccionador-altura.jpg',
    alt: 'Trabajo en altura sobre seccionador de alta tensión',
    caption: 'Intervenciones correctivas sobre equipamiento de maniobra.',
  },
};

/**
 * Devuelve un callback para enlazar con el acordeón (opción onOpen).
 * @returns {(serviceId: string) => void}
 */
export function initServiceGallery() {
  const image = document.querySelector('[data-service-image]');
  const caption = document.querySelector('[data-service-caption]');
  if (!image) return () => {};

  // Precargamos las fotos para que el cambio sea instantáneo
  Object.values(SERVICE_MEDIA).forEach(({ src }) => {
    const preload = new Image();
    preload.src = src;
  });

  let current = '';

  // El listener de "lazy-images.js" es {once:true} y ya se consumió con la
  // carga inicial: acá necesitamos uno propio que sobreviva a cada cambio
  // de foto del acordeón, no sólo al primero.
  image.addEventListener('error', () => {
    if (image.src !== new URL(FALLBACK_SRC, window.location.href).href) {
      image.src = FALLBACK_SRC;
    }
  });

  return (serviceId) => {
    const media = SERVICE_MEDIA[serviceId];
    if (!media || serviceId === current) return;
    current = serviceId;

    // Crossfade: bajamos opacidad, cambiamos src, volvemos a subir
    image.style.opacity = '0';

    const swap = () => {
      image.src = media.src;
      image.alt = media.alt;
      if (caption) caption.textContent = media.caption;
      image.style.opacity = '1';
    };

    // 250ms coincide con la transición declarada en el HTML
    window.setTimeout(swap, 250);
  };
}
