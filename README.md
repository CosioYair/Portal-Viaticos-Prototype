# Portal de Viáticos 2.0 — prototipo de referencia (código fuente)

**Cliente:** Starmedica · **Estado:** US-01 *Layout principal del portal y navegación por rol* — aprobado internamente (2026-09-10), pendiente de validación del cliente. No hay otras historias implementadas.

## ¿Qué es esto?
Prototipo visual y funcional de referencia, en HTML/CSS/JavaScript plano (sin build). **No es la aplicación de producción**: el Portal final puede ser Angular. Sirve para leer la estructura aprobada, las reglas de navegación por rol, los datos de ejemplo, los tokens visuales y el comportamiento responsive, y reproducirlos fielmente.

## Cómo ejecutar
Los módulos ES requieren HTTP (no `file://`).
```bash
npm start                  # Node ≥ 18 → http://localhost:4173
npm run start:python       # alternativa Python 3
```
`?dev=1` muestra atajos de desarrollo en la franja de demo.

## Dónde está cada cosa
```
index.html                      documento de entrada (estilos + src/app.js)
public/assets/branding/         logo-starmedica.png — logo REAL (no redibujar ni sustituir)
public/assets/icons/*.svg       un archivo por icono (mismos nombres que src/config/icons.js)
src/
  app.js                        carga src/data/*.json y monta el shell
  config/app-config.js          breakpoints (760 / 1180), ruta del logo, utilidades
  config/icons.js               ÚNICO mapa de iconos (clave → trazo SVG) + icono por tono
  layout/portal-layout.js       shell: estado, encabezado, menú de cuenta, avisos, barra de mensajes, estados
  layout/navigation.js          resolución de permisos (canSee / resolveNavigation) + sidebar + drawer móvil
  features/home/home.js|.css    pantalla Inicio (viaje propio, indicadores, bandejas)
  data/users.json               usuarios de prueba + catálogo de roles
  data/navigation.json          MENÚ: grupos, ítems, iconos, rutas, visibilidad por rol, reglas de perfil
  data/statuses.json            estatus (texto + tono + icono)
  data/home.json                Inicio representativo por usuario
  data/notifications.json       avisos, alertas de plazo, contadores pendientes
  demo/demo.js                  DEMO ONLY — franja MODO DEMO, cambio de usuario, persistencia
  styles/tokens.css             tokens visuales (CSS custom properties, valores aprobados)
  styles/global.css             reset, Roboto, scrollbars, botones, tarjetas, chips, paneles, estados
  styles/layout.css             shell, encabezado, sidebar (284 / 72), drawer
  styles/responsive.css         reglas < 1180 y < 760 (clases .is-narrow / .is-mobile en el shell)
  styles/demo.css               DEMO ONLY
docs/MENU_MATRIX.md             matriz de visibilidad en tabla · docs/US01_DESIGN_NOTES.md decisiones aprobadas
```

## Reglas de visibilidad del menú (`data/navigation.json` → `layout/navigation.js › canSee`)
`✓` visible · `V` requiere capacidad de viajero · `V+PF` viajero + bandera del perfil (`profileRules`) · `L` solo lectura (etiqueta «Lectura») · `P` permiso configurado en `user.permissions` (oculto por defecto) · rol ausente = no visible.

## Tipografía e iconos
Roboto 400/500/700 desde Google Fonts (`index.html`; para uso offline, sustituir por `@font-face` local). Iconos: trazos inline en `src/config/icons.js`, exportados como SVG en `public/assets/icons/`; geometría Lucide (ISC) con nombre equivalente en `ASSET_MANIFEST.md`. Regla: **misma función = mismo icono**, independiente del rol.

## Solo demo
`src/demo/`, `src/styles/demo.css` y las líneas marcadas `DEMO ONLY` en `portal-layout.js` (franja, etiqueta, carga simulada, usuario recordado). Los datos de `src/data/` son sintéticos.

## Mapeo a Angular
Ver `IMPLEMENTATION_MAP.md › Mapeo sugerido a Angular`.

## Relación con los demás entregables
Artefacto publicado (validación interactiva del cliente) · HTML autocontenido (`publish/`, distribución) · PDF de especificación visual (aprobación + referencia) · **este repositorio** (entrega canónica a desarrollo). Regla: CÓDIGO → implementación renderizada → capturas → PDF. Las historias siguientes **extienden este mismo proyecto** (`src/features/<dominio>/`, `src/data/`); nunca se rehace desde cero.
