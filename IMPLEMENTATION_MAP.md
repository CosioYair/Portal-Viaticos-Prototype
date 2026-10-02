# IMPLEMENTATION_MAP — elemento aprobado → archivo (US-01 + US-02 · APPROVED · FULLY SYNCED · 2026-10-02)

| Elemento aprobado | Archivo(s) |
|---|---|
| Shell (Encabezado → Menú → Título → Barra de mensajes → Área de trabajo), estado y acciones; marco de altura fija 100vh donde solo navegación y área de trabajo se desplazan | `src/layout/portal-layout.js` · `.shell`, `.body`, `.main` en `src/styles/layout.css` |
| Encabezado: logo real 30/24 px, «Portal de Viáticos», aviso de plazo, campana + contador, avatar con fotografía + nombre + rol + chevrón | `renderHeader` en `portal-layout.js` · `.header`, `.brand*`, `.deadline`, `.badge`, `.account-btn*` en `layout.css` · logo `public/assets/branding/logo-starmedica.png` (`LOGO_SRC` en `config/app-config.js`) |
| Menú de cuenta (solo Número de colaborador · Dirección · Puesto · Perfil + «Cerrar sesión»; la identidad no se repite: vive en el encabezado) | `renderAccountMenu` en `portal-layout.js` · `.account__*`, `.account__fields` en `global.css` · `users.json › employeeNumber/direccion/puesto/perfil.label` |
| Panel de avisos (no leídos, «Notificado: …», «Ir a …», estado vacío) | `renderNotifications` en `portal-layout.js` · `.notice*` en `global.css` · datos `data/notifications.json › notices` |
| Sidebar #00A7E1 altura completa, expandido 284 / colapsado 72 con tooltips, grupos, activo, hover, contadores, «Lectura» | `renderSidebar` en `layout/navigation.js` · `.sidebar*`, `.nav-*` en `layout.css` |
| Control «Contraer / Expandir menú» (utilidad del shell en el pie FIJO del menú, fuera de la lista desplazable, siempre visible) · riel colapsado sin desplazamiento horizontal | `renderSidebar` › `.sidebar__foot` en `layout/navigation.js` · `.sidebar__foot`, `.sidebar__toggle` en `layout.css` |
| Avatar con fotografía DEMO (respaldo: iniciales) | `avatar()` en `config/app-config.js` · `.avatar*` en `layout.css` · `users.json › photo` · `public/assets/users/` |
| Indicador de etapas del viaje (componente compartido, 4 etapas canónicas, 40 / 36 px) | `shared/journey-progress.js` · `.journey*` en `global.css` (+ móvil en `responsive.css`) · `home.json › myTrip.stages` |
| Drawer móvil (pantalla completa, identidad, misma navegación, «Cerrar sesión») | `renderDrawer` en `layout/navigation.js` · `.drawer*` en `layout.css` |
| Catálogo de menú, orden, iconos, rutas, matriz por rol, reglas de perfil | `data/navigation.json` (+ `docs/MENU_MATRIX.md`) |
| Ámbito del Inicio por rol (personal · operativo · organizacional; la capacidad de viajero no amplía el ámbito) | `data/home.json › summary.scope / personalBudget` · `docs/HOME_VISIBILITY_MATRIX.md` |
| Resolución de permisos (usuario + rol + viajero + perfil + permisos → navegación) | `canSee`, `resolveNavigation` en `layout/navigation.js` (único lugar) |
| Usuarios y roles de prueba | `data/users.json` |
| Inicio según rol y ámbito (viaje más reciente → resumen `summary.scope` personal / operational / organizational → bandejas con `columns` personal / externos / operational, `empty`; tabla ≥ 1180 / tarjetas) | `features/home/home.js` (`COLUMNS`, reglas en el comentario de cabecera) · `features/home/home.css` · datos `data/home.json` |
| Chips de estatus (color + icono + texto) y barra de mensajes única | `statusChip`, `messageBar` en `portal-layout.js` · `.status--*`, `.msgbar--*` · `data/statuses.json` |
| Estados: cargando, sin permiso, sección no construida, sesión cerrada | `skeleton`, `deniedState`, `notBuiltState`, `closedState` en `portal-layout.js` · `.mskel*`, `.state*` en `global.css` |
| Botones 42 / 40 / texto (12 px Bold Caps +8 %) | `.btn*` en `global.css` |
| Tokens visuales (colores, tipografía, dimensiones, sombras; esquinas `--radius-default: 0px` / `--radius-circle: 50%`) | `styles/tokens.css` |
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
| `src/features/home/` | feature `home` (componente / módulo / ruta); `summary.scope` → condición de plantilla alimentada por el permiso real del rol |
| `src/shared/journey-progress.js` | `JourneyProgressComponent` compartido (`@Input() stages`) — el único indicador de etapas del portal |
| `src/data/*.json` | servicios mock, modelos (`User`, `MenuItem`, `Status`, …) y fixtures; en producción, APIs |
| `src/config/app-config.js` | `environment` / constantes de la app (breakpoints, rutas de assets) |
| `src/config/icons.js` + `public/assets/icons/` | registro de iconos (o `lucide-angular` con los nombres de `ASSET_MANIFEST.md`) |
| `src/styles/tokens.css` | `styles.scss` / variables de tokens de diseño |
| `src/styles/global.css`, `layout.css`, `responsive.css` | estilos globales + `scss` de cada componente |
| `src/demo/` | solo prototipo — **no migrar** a producción salvo indicación explícita |

## Added in Validación V2 (final)
- `src/shared/data-list.js` — shared list pipeline (search · contextual filters · sort · pagination) + toolbar/header/pager renderers. Angular: DataListService (pure functions) + a table component with @Input() columns; state `{ q, f, sort, dir, page }` per list. Standard: docs/TABLE_LIST_STANDARD.md.
- `src/layout/navigation.js › anticipoApplies / profileAllows` — Anticipo rule (perfil Director + personnelGroup E/ED → No aplica; DGA does not inherit it). Angular: TravelerRulesService.
- `src/data/users.json › personnelGroup`, `home.json › summaries[] · trays[].filters · detalleMeaning · pageSize · kpi.valueTone`, new column sets `hosted` / `traveling` / `bitacora`.

## Added in US-02 — Pantallas de Inicio (APPROVED · CLOSED · FULLY SYNCED, 2026-10-02)
| Elemento aprobado | Archivo(s) |
|---|---|
| Orden del Inicio por rol (`home.order`, regla 252) y orden base KPIs → bandejas → viajero | `features/home/home.js › renderHome / ordOf` · `data/home.json` |
| Resumen «Perfil de viajero» (icono + título en una cabecera, «?», estado «Sin perfil vigente») | `home.js › perfilCard` · `.perfil*` en `home.css` · `data/traveler.json › profiles / assignments` |
| Tu viaje: trayecto compartido, Anticipo «No aplica» por configuración del perfil, «Saldo pendiente por comprobar» | `home.js › tripCard` · `shared/journey-progress.js › renderJourneyProgress / pendingToProve` · `navigation.js › anticipoApplies(user, profiles)` · `traveler.json › comprobaciones` |
| Nueva solicitud con precondiciones visibles | `home.js › nuevaCard` · `traveler.json › budget` |
| Severidad presupuestal (`budgetTone`), % destacado, contorno rojo, «Ir a Monitor», viñetas de concepto y micrográfica de CH CO | `home.js › decorateSummary / summary` · `.kpi*` en `home.css` · `traveler.json › budgetConceptColors` |
| Celda de persona compartida (Colaborador / Viajero externo) y búsqueda sobre todas sus líneas | `home.js › personOf / personCell / prepRow` · `data/people.json` · `data-list.js › applyListState (_search)` |
| Bandejas de autorización: Detalle en dos líneas, filtro Destino, resumen de decisión | `home.js › prepRow / tray` · `.decision`, `.dcell` en `home.css` |
| Bandejas de reservación: ruta de vuelo, hotel con noches, sub-línea de estatus | `home.js › prepRow / cell` · `.scell` |
| Ayuda «?» compartida (título del Inicio y secciones) | `home.js › helpTip` · `.help*` en `home.css` · `portal-layout.js` (título) |
| Orden de menú por rol (solo presentación) | `navigation.js › resolveNavigation` · `navigation.json › roleMenuOrder` |
| Prototipo completo vigente (todas las historias, todos los estados de vista previa) | `prototype/Portal Viaticos.dc.html` + `prototype/*.js` + `prototype/assets/` |

Angular: `HomeComponent` (+ `TravelerProfileSummaryComponent`, `TripCardComponent` con `JourneyProgressComponent`, `NewRequestCardComponent`, `KpiBlockComponent`, `TrayComponent` con `PersonCellComponent`), `HelpTipComponent` compartido, `TravelerRulesService.anticipoApplies / pendingToProve`, `BudgetSeverity.budgetTone`.
