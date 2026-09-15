/**
 * ANIMACIONES DE ENTRADA (GSAP + ScrollTrigger)
 *
 * Se controla todo por atributos en el HTML para no tener selectores mágicos
 * repartidos por el JS:
 *   data-reveal="up|left|right|scale|fade"  → dirección de la entrada
 *   data-reveal-delay="0.15"                → retardo en segundos
 *   data-reveal-group                       → anima a los hijos en cascada
 *   data-counter="120"                      → número que cuenta hasta el valor
 *   data-parallax="0.2"                     → intensidad del parallax
 *
 * @module animations
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Estados iniciales según la dirección pedida en el HTML. */
const FROM_STATE = {
  up: { y: 48, opacity: 0 },
  down: { y: -48, opacity: 0 },
  left: { x: -56, opacity: 0 },
  right: { x: 56, opacity: 0 },
  scale: { scale: 0.92, opacity: 0 },
  fade: { opacity: 0 },
};

/**
 * Conecta Lenis con ScrollTrigger para que las animaciones sigan al scroll
 * con inercia. Lenis corre con autoRaf:true (su propio requestAnimationFrame),
 * así que acá sólo hace falta avisarle a ScrollTrigger en cada tick de scroll
 * y refrescar los cálculos una vez que Lenis terminó de montarse.
 * @param {import('lenis').default|null} lenis
 */
export function connectScrollTrigger(lenis) {
  if (!lenis) return;

  lenis.on('scroll', ScrollTrigger.update);

  // Recalcula posiciones de los triggers ya con Lenis activo: si no se hace,
  // los ScrollTrigger creados después pueden quedar calculados contra el
  // scroll nativo del navegador en vez del scroll virtual de Lenis.
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/**
 * Animaciones de revelado al entrar en viewport.
 *
 * Usa IntersectionObserver nativo en vez de ScrollTrigger a propósito: el
 * revelado de contenido es demasiado crítico (si falla, el texto de la
 * página queda invisible) como para depender de que ScrollTrigger esté bien
 * sincronizado con el scroll virtual de Lenis. IntersectionObserver no le
 * importa quién mueve el scroll ni cómo: sólo mira si el elemento entró en
 * pantalla, así que no puede quedar "descolgado" de un scroll virtual.
 */
export function initRevealAnimations() {
  const singles = [...document.querySelectorAll('[data-reveal]:not([data-reveal-group] *)')];
  const groups = [...document.querySelectorAll('[data-reveal-group]')];

  if (prefersReducedMotion()) {
    gsap.set('[data-reveal]', { clearProps: 'all', opacity: 1 });
    return;
  }

  // Estado inicial (antes de que entren en pantalla)
  singles.forEach((el) => {
    const direction = el.dataset.reveal || 'up';
    gsap.set(el, FROM_STATE[direction] ?? FROM_STATE.up);
  });

  groups.forEach((group) => {
    const direction = group.dataset.revealGroup || 'up';
    const children = group.querySelectorAll('[data-reveal]');
    gsap.set(children, FROM_STATE[direction] ?? FROM_STATE.up);
  });

  const revealSingle = (el) => {
    const delay = parseFloat(el.dataset.revealDelay || '0');
    gsap.to(el, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.9,
      delay,
      ease: 'power3.out',
      onComplete: () => gsap.set(el, { clearProps: 'transform,willChange' }),
    });
  };

  const revealGroup = (group) => {
    const children = group.querySelectorAll('[data-reveal]');
    gsap.to(children, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      onComplete: () =>
        gsap.set(children, { clearProps: 'transform,willChange' }),
    });
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (entry.target.hasAttribute('data-reveal-group')) {
          revealGroup(entry.target);
        } else {
          revealSingle(entry.target);
        }

        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
  );

  singles.forEach((el) => observer.observe(el));
  groups.forEach((group) => observer.observe(group));

  // Salvaguarda: si por lo que sea un elemento queda con opacity:0
  // permanente (layout inestable, navegador que no dispara el observer a
  // tiempo, etc.), se revela igual pasado un margen. Preferimos perder una
  // animación a que se pierda contenido de la página.
  window.setTimeout(() => {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (parseFloat(getComputedStyle(el).opacity) === 0) {
        gsap.to(el, { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.4 });
      }
    });
  }, 2500);
}

/** Entrada del hero, encadenada en el orden de lectura. */
export function initHeroAnimation() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const items = hero.querySelectorAll('[data-hero-item]');
  if (!items.length) return;

  if (prefersReducedMotion()) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }

  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from(items, {
      y: 36,
      opacity: 0,
      duration: 1,
      stagger: 0.14,
      delay: 0.15,
    });
}

/** Contadores numéricos (años de experiencia, proyectos, etc.). */
export function initCounters() {
  const counters = gsap.utils.toArray('[data-counter]');
  if (!counters.length) return;

  counters.forEach((el) => {
    const target = parseFloat(el.dataset.counter || '0');
    const suffix = el.dataset.counterSuffix || '';

    if (prefersReducedMotion()) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const state = { value: 0 };

    gsap.to(state, {
      value: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = `${Math.round(state.value)}${suffix}`;
      },
    });
  });
}

/** Parallax suave en imágenes marcadas con data-parallax. */
export function initParallax() {
  if (prefersReducedMotion()) return;
  // El parallax en pantallas chicas gasta batería y aporta poco
  if (!window.matchMedia('(min-width: 1024px)').matches) return;

  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const intensity = parseFloat(el.dataset.parallax || '0.15');

    gsap.to(el, {
      yPercent: intensity * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/** Recalcula posiciones tras cargar imágenes o rotar el dispositivo. */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}
