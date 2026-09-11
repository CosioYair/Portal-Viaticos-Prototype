# IMPLEMENTATION_MAP — US-01 · elemento aprobado → archivo

| Elemento aprobado | Archivo(s) |
|---|---|
| Shell (Encabezado → Menú → Título → Barra de mensajes → Área de trabajo), estado y acciones | `src/layout/portal-layout.js` · `src/styles/layout.css` |
| Encabezado: logo real 30/24 px, «Portal de Viáticos», aviso de plazo, campana + contador, avatar + nombre + rol + chevrón | `renderHeader` en `portal-layout.js` · `.header`, `.brand*`, `.deadline`, `.badge`, `.account-btn*` en `layout.css` · logo `public/assets/branding/logo-starmedica.png` (`LOGO_SRC` en `config/app-config.js`) |
| Menú de cuenta (identidad, área, perfil de viajero, «Cerrar sesión») | `renderAccountMenu` en `portal-layout.js` · `.panel--account`, `.account__*` en `global.css` |
| Panel de avisos (no leídos, «Ir a …», estado vacío) | `renderNotifications` en `portal-layout.js` · `.notice*` en `global.css` · datos `data/notifications.json › notices` |
| Sidebar #00A7E1 altura completa, expandido 284 / colapsado 72 con tooltips, grupos, activo, hover, contadores, «Lectura» | `renderSidebar` en `layout/navigation.js` · `.sidebar*`, `.nav-*` en `layout.css` |
| Drawer móvil (pantalla completa, identidad, misma navegación, «Cerrar sesión») | `renderDrawer` en `layout/navigation.js` · `.drawer*` en `layout.css` |
| Catálogo de menú, orden, iconos, rutas, matriz por rol, reglas de perfil | `data/navigation.json` (+ `docs/MENU_MATRIX.md`) |
| Resolución de permisos (usuario + rol + viajero + perfil + permisos → navegación) | `canSee`, `resolveNavigation` en `layout/navigation.js` (único lugar) |
| Usuarios y roles de prueba | `data/users.json` |
| Inicio por rol (viaje propio, etapas, indicadores, bandejas; tabla ≥ 1180 / tarjetas) | `features/home/home.js` · `features/home/home.css` · datos `data/home.json` |
| Chips de estatus (color + icono + texto) y barra de mensajes única | `statusChip`, `messageBar` en `portal-layout.js` · `.status--*`, `.msgbar--*` · `data/statuses.json` |
| Estados: cargando, sin permiso, sección no construida, sesión cerrada | `skeleton`, `deniedState`, `notBuiltState`, `closedState` en `portal-layout.js` · `.mskel*`, `.state*` en `global.css` |
| Botones 42 / 40 / texto (12 px Bold Caps +8 %) | `.btn*` en `global.css` |
| Tokens visuales (colores, tipografía, dimensiones, radios, sombras) | `styles/tokens.css` |
| Iconos (mapa único) | `config/icons.js` · archivos `public/assets/icons/` |
| Responsive (760 / 1180 medido en el contenedor) | `config/app-config.js` · `styles/responsive.css` · `ResizeObserver` en `portal-layout.js` |
| Roboto 400 / 500 / 700 | `index.html` · `--font` en `tokens.css` |
| MODO DEMO, cambio de usuario, persistencia, carga simulada — DEMO ONLY | `demo/demo.js` · `styles/demo.css` · líneas `DEMO ONLY` en `portal-layout.js` |

## Mapeo sugerido a Angular (conceptual, no generar código ahora)

| Prototipo | Angular |
|---|---|
| `src/app.js` | `main.ts` + `AppComponent` |
| `src/layout/portal-layout.js` | `layout/portal-layout.component.{ts,html,scss}` + `HeaderComponent`, `AccountMenuComponent`, `NotificationsComponent`; el objeto `state` → servicio de estado / signals |
| `src/layout/navigation.js` | `SidebarComponent`, `MobileDrawerComponent` + `NavigationService` (`canSee`, `resolveNavigation`) leyendo la config de navegación |
| `src/features/home/` | feature `home` (componente / módulo / ruta) |
| `src/data/*.json` | servicios mock, modelos (`User`, `MenuItem`, `Status`, …) y fixtures; en producción, APIs |
| `src/config/app-config.js` | `environment` / constantes de la app (breakpoints, rutas de assets) |
| `src/config/icons.js` + `public/assets/icons/` | registro de iconos (o `lucide-angular` con los nombres de `ASSET_MANIFEST.md`) |
| `src/styles/tokens.css` | `styles.scss` / variables de tokens de diseño |
| `src/styles/global.css`, `layout.css`, `responsive.css` | estilos globales + `scss` de cada componente |
| `src/demo/` | solo prototipo — **no migrar** a producción salvo indicación explícita |
