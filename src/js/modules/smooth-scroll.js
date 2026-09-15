/**
 * SCROLL SUAVE (Lenis) + UTILIDADES DE SCROLL
 *
 * Lenis interpola el scroll nativo para lograr el desplazamiento con inercia
 * que se ve en sitios corporativos modernos. Se integra con GSAP ScrollTrigger
 * para que las animaciones queden sincronizadas con el scroll virtual.
 *
 * @module smooth-scroll
 */

import Lenis from 'lenis';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Alto del header fijo, leído del token CSS para no duplicar el valor. */
function headerOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    '--header-height',
  );
  const rem = parseFloat(raw) || 5;
  return rem * 16;
}

/**
 * Inicializa Lenis. Si el usuario pide movimiento reducido, se omite y se
 * deja el scroll nativo del navegador.
 * @returns {Lenis|null}
 */
export function initSmoothScroll() {
  if (prefersReducedMotion()) return null;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Lenis maneja su propio requestAnimationFrame: así evitamos depender de
    // sincronizarlo a mano con el ticker de GSAP, que es una fuente típica
    // de bugs sutiles (ScrollTrigger dejando de recibir el evento "scroll").
    autoRaf: true,
    // En táctil se mantiene el scroll nativo: es más fluido y no rompe gestos
    syncTouch: false,
    touchMultiplier: 1.6,
  });

  return lenis;
}

/**
 * Enlaces internos (#seccion) con desplazamiento suave y offset del header.
 * @param {Lenis|null} lenis
 */
export function initAnchorLinks(lenis) {
  const offset = () => -headerOffset();

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    link.addEventListener('click', (event) => {
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      if (lenis) {
        lenis.scrollTo(target, { offset: offset(), duration: 1.2 });
      } else {
        const top =
          target.getBoundingClientRect().top + window.scrollY + offset();
        window.scrollTo({ top, behavior: 'smooth' });
      }

      // Se actualiza la URL sin provocar un salto brusco
      history.pushState(null, '', href);
    });
  });
}

/**
 * Barra de progreso de lectura en el borde superior.
 * @returns {(scroll: number) => void} actualizador
 */
export function initScrollProgress() {
  const bar = document.querySelector('[data-scroll-progress]');
  if (!bar) return () => {};

  return (scroll = window.scrollY) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(scroll / max, 1) : 0;
    bar.style.transform = `scaleX(${progress})`;
  };
}

/**
 * Botón "volver arriba": aparece después de una pantalla de scroll.
 * @param {Lenis|null} lenis
 * @returns {(scroll: number) => void} actualizador
 */
export function initScrollToTop(lenis) {
  const button = document.querySelector('[data-scroll-top]');
  if (!button) return () => {};

  button.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  return (scroll = window.scrollY) => {
    button.dataset.visible = String(scroll > window.innerHeight * 0.75);
  };
}
