/**
 * ACORDEÓN DE SERVICIOS
 *
 * Reemplaza los onclick inline del HTML original. Ventajas:
 * - Cero funciones globales: todo queda dentro del módulo
 * - Accesible: aria-expanded / aria-controls / role="region" y navegación
 *   completa por teclado (flechas, Home, End) según el patrón WAI-ARIA
 * - Anima la altura con grid-template-rows, por lo que no hace falta medir
 *   el contenido ni usar max-height "a ojo"
 *
 * @module accordion
 */

/**
 * @param {Object} [options]
 * @param {boolean} [options.singleOpen=true] - Cerrar los demás al abrir uno
 * @param {number|null} [options.defaultOpen=0] - Índice abierto al cargar
 * @param {(id: string) => void} [options.onOpen] - Callback al abrir un panel
 */
export function initAccordion({
  singleOpen = true,
  defaultOpen = 0,
  onOpen,
} = {}) {
  const root = document.querySelector('[data-accordion]');
  if (!root) return;

  const triggers = [...root.querySelectorAll('[data-accordion-trigger]')];
  if (!triggers.length) return;

  /** Abre o cierra un panel concreto. */
  const setItemState = (trigger, open) => {
    const panel = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    );
    if (!panel) return;

    trigger.setAttribute('aria-expanded', String(open));
    panel.dataset.open = String(open);

    if (open && typeof onOpen === 'function') {
      onOpen(trigger.dataset.accordionTrigger ?? '');
    }
  };

  const toggle = (trigger) => {
    const willOpen = trigger.getAttribute('aria-expanded') !== 'true';

    if (singleOpen) {
      triggers.forEach((other) => {
        if (other !== trigger) setItemState(other, false);
      });
    }

    setItemState(trigger, willOpen);
  };

  triggers.forEach((trigger, index) => {
    setItemState(trigger, index === defaultOpen);

    trigger.addEventListener('click', () => toggle(trigger));

    // Navegación por teclado entre cabeceras del acordeón
    trigger.addEventListener('keydown', (event) => {
      const keys = {
        ArrowDown: (index + 1) % triggers.length,
        ArrowUp: (index - 1 + triggers.length) % triggers.length,
        Home: 0,
        End: triggers.length - 1,
      };

      const target = keys[event.key];
      if (target === undefined) return;

      event.preventDefault();
      triggers[target].focus();
    });
  });
}
