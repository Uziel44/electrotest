/**
 * ELECTRO TEST — Punto de entrada
 *
 * Orquesta todos los módulos de la landing. Se importa el CSS desde acá para
 * que Vite lo procese y lo emita como un único archivo optimizado.
 */

import '../css/main.css';

import {
  initHeader,
  initMobileMenu,
  initScrollSpy,
} from './modules/navigation.js';
import { initAccordion } from './modules/accordion.js';
import {
  initSmoothScroll,
  initAnchorLinks,
  initScrollProgress,
  initScrollToTop,
} from './modules/smooth-scroll.js';
import {
  connectScrollTrigger,
  initRevealAnimations,
  initHeroAnimation,
  initCounters,
  initParallax,
  refreshScrollTriggers,
} from './modules/animations.js';
import { initServiceGallery } from './modules/gallery.js';
import { initImages } from './modules/lazy-images.js';

/** Marca que el JS está activo: el CSS lo usa para ocultar lo que se anima. */
document.documentElement.classList.add('js');

function boot() {
  // --- Scroll -------------------------------------------------------------
  const lenis = initSmoothScroll();
  connectScrollTrigger(lenis);
  initAnchorLinks(lenis);

  // --- Navegación ---------------------------------------------------------
  const updateHeader = initHeader({
    getScroll: () => (lenis ? lenis.scroll : window.scrollY),
  });
  initMobileMenu();
  initScrollSpy();

  // --- Indicadores de scroll ----------------------------------------------
  const updateProgress = initScrollProgress();
  const updateScrollTop = initScrollToTop(lenis);

  // Un solo manejador para todo lo que depende del scroll: menos trabajo por
  // frame que tener tres listeners compitiendo.
  const onScroll = (scroll) => {
    updateHeader?.();
    updateProgress(scroll);
    updateScrollTop(scroll);
  };

  if (lenis) {
    lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  } else {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          onScroll(window.scrollY);
          ticking = false;
        });
      },
      { passive: true },
    );
  }

  onScroll(window.scrollY);

  // --- Servicios: acordeón enlazado con la galería ------------------------
  const updateServiceImage = initServiceGallery();
  initAccordion({
    singleOpen: true,
    defaultOpen: 0,
    onOpen: updateServiceImage,
  });

  // --- Animaciones --------------------------------------------------------
  initHeroAnimation();
  initRevealAnimations();
  initCounters();
  initParallax();

  // --- Imágenes -----------------------------------------------------------
  // Cuando terminan de cargar cambian las alturas: hay que recalcular triggers
  initImages(() => refreshScrollTriggers());

  // --- Año dinámico en el pie ---------------------------------------------
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
