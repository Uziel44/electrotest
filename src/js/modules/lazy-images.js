/**
 * IMÁGENES
 *
 * - Fade-in cuando la imagen termina de decodificarse (evita el "pop" feo)
 * - Fallback declarativo por data-fallback en lugar de onerror inline
 * - Aviso a ScrollTrigger cuando todo cargó, porque las alturas cambian
 *
 * @module lazy-images
 */

/**
 * @param {() => void} [onAllLoaded] - Se llama cuando terminan de cargar
 */
export function initImages(onAllLoaded) {
  const images = [...document.querySelectorAll('img')];
  if (!images.length) {
    onAllLoaded?.();
    return;
  }

  let pending = images.length;

  const settle = () => {
    pending -= 1;
    if (pending <= 0) onAllLoaded?.();
  };

  images.forEach((img) => {
    // Fallback declarativo: <img data-fallback="/img/otra.jpg">
    img.addEventListener(
      'error',
      () => {
        const fallback = img.dataset.fallback;
        if (fallback && img.src !== fallback) {
          img.src = fallback;
        } else {
          img.classList.add('opacity-100');
        }
        settle();
      },
      { once: true },
    );

    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('is-loaded');
      settle();
      return;
    }

    img.addEventListener(
      'load',
      () => {
        img.classList.add('is-loaded');
        settle();
      },
      { once: true },
    );
  });
}
