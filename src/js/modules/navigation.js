/**
 * NAVEGACIÓN
 * - Header que cambia de transparente a sólido al scrollear
 * - Menú móvil accesible (aria-expanded, cierre con Escape y click externo)
 * - Scrollspy: marca en el menú la sección que se está viendo
 *
 * @module navigation
 */

const SCROLL_THRESHOLD = 40;

/**
 * Header con fondo dinámico según la posición de scroll.
 * @param {{ getScroll?: () => number }} [options]
 */
export function initHeader({ getScroll } = {}) {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const readScroll = getScroll ?? (() => window.scrollY);

  const update = () => {
    header.dataset.scrolled = String(readScroll() > SCROLL_THRESHOLD);
  };

  update();
  return update;
}

/**
 * Menú móvil desplegable con control de accesibilidad.
 */
export function initMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.dataset.open = String(open);
    // Los enlaces ocultos no deben ser alcanzables con Tab
    menu.setAttribute('aria-hidden', String(!open));
  };

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  setOpen(false);

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  // Al elegir un destino, el menú se cierra solo
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Escape cierra y devuelve el foco al botón
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Click fuera del panel
  document.addEventListener('click', (event) => {
    if (!isOpen()) return;
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      setOpen(false);
    }
  });

  // Si se pasa a desktop con el menú abierto, se normaliza el estado
  const desktop = window.matchMedia('(min-width: 1024px)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

/**
 * Scrollspy con IntersectionObserver: resalta el enlace de la sección visible.
 * Se usa un rootMargin que compensa el header fijo.
 */
export function initScrollSpy() {
  const links = [...document.querySelectorAll('[data-nav-link]')];
  if (!links.length) return;

  const byId = new Map();
  const sections = [];

  links.forEach((link) => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (!id) return;
    const section = document.getElementById(id);
    if (!section) return;
    // Varios enlaces (desktop y móvil) pueden apuntar a la misma sección
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(link);
    if (!sections.includes(section)) sections.push(section);
  });

  if (!sections.length) return;

  const setActive = (id) => {
    byId.forEach((group, key) => {
      group.forEach((link) => {
        if (key === id) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  };

  const visible = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });

      if (!visible.size) return;

      // Si hay varias secciones en pantalla, gana la más alta
      const topmost = [...visible].sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
      )[0];

      setActive(topmost.id);
    },
    {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    },
  );

  sections.forEach((section) => observer.observe(section));
}
