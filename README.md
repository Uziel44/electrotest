# Electro Test — Landing Page

Landing corporativa de Electro Test (ingeniería, diagnóstico y mantenimiento
en media y alta tensión). Reescrita como proyecto con build: **Vite +
Tailwind CSS v4 + GSAP + Lenis**.

## ⚠️ Importante: ya no se abre el `index.html` directo con doble clic

El proyecto ahora se **compila**. Si abrís `index.html` directamente desde el
explorador de archivos (`file:///...`), vas a ver la página sin estilos ni
animaciones, porque el HTML apunta a `/src/js/main.js` (una ruta que sólo
existe cuando corre un servidor). Esto es normal y esperado: es el precio de
tener CSS y JS optimizados en vez del CDN de Tailwind cargando 300 KB en cada
visita.

Para ver el sitio, elegí una de estas dos formas:

### Opción A — Modo desarrollo (mientras editás)

```bash
npm install   # sólo la primera vez
npm run dev
```

Abre automáticamente `http://localhost:5173`. Cualquier cambio en
`index.html`, `src/css/*` o `src/js/*` se refleja al instante en el navegador.

### Opción B — Vista previa de producción (para revisar antes de subir)

```bash
npm run build     # genera la carpeta dist/ optimizada
npm run preview   # sirve esa carpeta tal como quedará publicada
```

## Publicar en el hosting

1. `npm run build`
2. Subir **todo el contenido de la carpeta `dist/`** (no la raíz del
   proyecto) al hosting, por FTP o como corresponda.
3. `dist/` ya incluye `index.html`, `assets/` (CSS y JS compilados y
   minificados), `img/` y el archivo de verificación de Google.

## Estructura del proyecto

```
electrotest/
├── index.html                # HTML fuente (editar acá)
├── public/
│   ├── img/                  # Fotos e ícono del sitio
│   └── googleb3b849e56668f84e.html
├── src/
│   ├── css/
│   │   ├── main.css          # Import raíz + tokens de diseño (@theme)
│   │   ├── base.css          # Reset, tipografía fluida, fondos de sección
│   │   ├── components.css    # Botones, tarjetas, header, acordeón, FAB…
│   │   └── animations.css    # Keyframes y utilidades de animación
│   └── js/
│       ├── main.js           # Punto de entrada: orquesta todos los módulos
│       └── modules/
│           ├── navigation.js     # Header dinámico, menú móvil, scrollspy
│           ├── accordion.js      # Acordeón de servicios (accesible)
│           ├── smooth-scroll.js  # Scroll con inercia (Lenis) + progreso
│           ├── animations.js     # Revelados por scroll, contadores (GSAP)
│           ├── gallery.js        # Imagen que acompaña al servicio abierto
│           └── lazy-images.js    # Fade-in de imágenes y fallback de error
├── vite.config.js
└── package.json
```

## Qué cambió respecto a la versión anterior

- **Tailwind CDN → Tailwind v4 compilado**: de ~300 KB sin cachear a ~8 KB
  gzip, sin parpadeo de estilos al cargar.
- **Paleta con nombres honestos**: los tokens `orange`/`slate` que en
  realidad pintaban celeste ahora se llaman `brand` (celeste corporativo) e
  `ink` (azules profundos). Visualmente es la misma paleta; el código ya no
  miente sobre lo que hace.
- **JS modular en `type="module"`**: se eliminaron los `onclick` inline y las
  funciones globales (`toggleAccordion`). Cada pieza (menú, acordeón, scroll,
  animaciones) vive en su propio archivo.
- **Accesibilidad**: acordeón y menú con `aria-expanded`/`aria-controls`,
  navegación por teclado, `:focus-visible`, `skip-link`, y todo el movimiento
  respeta `prefers-reduced-motion`.
- **Rendimiento**: imágenes con `loading="lazy"`, `width`/`height` para
  evitar saltos de layout, precarga de la foto del hero (LCP) y de la
  tipografía.
- **SEO**: meta description, Open Graph, `theme-color`, favicon y datos
  estructurados (`schema.org/ProfessionalService`) para que Google entienda
  que es una empresa de servicios con delegaciones en La Rioja y Catamarca.
- **Animaciones nuevas**: entrada escalonada del hero, revelado de secciones
  al hacer scroll, contadores animados, scroll con inercia (Lenis), barra de
  progreso de lectura y botón "volver arriba".

## Cómo editar contenido común

- **Textos y estructura**: directamente en `index.html`.
- **Colores de marca**: `src/css/main.css`, bloque `@theme` (tokens
  `--color-brand-*` e `--color-ink-*`).
- **Fotos de fondo por sección**: `src/css/base.css`, clases `.bg-hero`,
  `.bg-equipo`, `.bg-experiencia`.
- **Contenido del acordeón de Servicios**: buscar `data-accordion-trigger`
  en `index.html`; cada `<article class="accordion-item">` es un servicio.
- **Número de WhatsApp**: buscar `wa.me` en `index.html`.
