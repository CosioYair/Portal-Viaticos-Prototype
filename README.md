# Portal de Viáticos 2.0 — prototipo de referencia (código fuente)

**Cliente:** Starmedica · **Estado (2026-10-08 · snapshot acumulado):**
- **US-01 — Layout y navegación por rol · APPROVED · CLOSED · FULLY SYNCED**
- **US-02 — Pantallas de Inicio · APPROVED · CLOSED · FULLY SYNCED** — referencia: `docs/HOME_VISIBILITY_MATRIX.md`, `docs/US02_DESIGN_NOTES.md`.
- **US-03 — Administración de perfiles de viajero · APPROVED · CLOSED · FULLY SYNCED (2026-10-08)** — Perfiles · Tarifas · Excepciones (`src/features/traveler-profile/`, `src/data/traveler-profiles.json`); referencia: `docs/TRAVELER_PROFILE_MODEL.md` y el PDF «Propuesta visual (US-03 - Administración de perfiles de viajero)».
- **US-04 — Ficha del viajero y asignación de perfil · APPROVED · CLOSED · FULLY SYNCED (2026-10-08)** — Colaboradores · ficha · asignación individual y masiva (`src/features/traveler-profile/collaborators.js`); PDF «Propuesta visual (US-04 - Ficha del viajero y asignación de perfil)».
- **US-05 — Viajeros externos · APPROVED · CLOSED · FULLY SYNCED (2026-10-08)** — registro, ficha, alta/edición, desactivar/reactivar y selección en Creación (`src/features/external-travelers/externals.js`, `src/data/externals.json`); PDF «Propuesta visual (US-05 - Viajeros externos)».
- **US-08 — Creación de solicitud de viaje · APPROVED · CLOSED · FULLY SYNCED (2026-10-08)** — `src/features/travel-request/request.js`; PDF «Propuesta visual (US-08 - Creación de solicitud de viaje)».
- **US-10 — Mis viajes · APPROVED · CLOSED · FULLY SYNCED (2026-10-08)** — `src/features/my-trips/trips.js`; PDF «Propuesta visual (US-10 - Mis viajes)».
- **US-25 — Usuarios y permisos / Bitácora (histórico US-26) · APPROVED · CLOSED · FULLY SYNCED (2026-10-09)** — `src/features/users-permissions/access.js`; incluye Composición del Inicio por rol y Hospitales que atiende; PDF «Propuesta visual (US-25 - Usuarios y permisos / Bitácora)».
- Historias aún en revisión (REVIEW MODE · SYNC PENDING), incluidas en el **prototipo completo** (`prototype/`) pero NO aprobadas: US-08 Creación de solicitud de viaje, US-10 Mis viajes, US-26 Usuarios y permisos / Bitácora, catálogos y tarifas del libro V1, composición del Inicio por rol. Se portan a `src/` al finalizar cada historia.

Este proyecto es el **ÚNICO código fuente acumulado** del Portal: las historias siguientes lo extienden; nunca se rehace US-01 ni US-02.

## Fundación implementada (US-01)
Shell del portal (encabezado, menú lateral 284 / 72 px, barra de mensajes, área de trabajo) · navegación por rol (`navigation.json` + `canSee`) · layout consciente de la capacidad de viajero · vistas de Inicio de referencia por rol · indicador de etapas compartido (JourneyProgress) · estándar de tablas/listas con búsqueda, filtros, orden y paginación (`data-list.js`) · diseño responsivo (1440 / 1280 / 390) · tokens y activos Starmedica · reglas de negocio de visualización (Anticipo, presupuesto, perfil, folio). Las vistas de Inicio pueden seguir evolucionando con las historias funcionales posteriores.

## ¿Qué es esto?
Prototipo visual y funcional de referencia, en HTML/CSS/JavaScript plano (sin build). Los editores interactivos de US-03 (formularios, confirmación, éxito, bitácora) viven en `prototype/Portal Viaticos.dc.html`; sus validaciones y reglas están portadas a `src/features/traveler-profile/rules.js`. **No es la aplicación de producción**: el Portal final puede ser Angular. Sirve para leer la estructura aprobada, las reglas de navegación por rol, los datos de ejemplo, los tokens visuales y el comportamiento responsive, y reproducirlos fielmente.

## Cómo ejecutar
Los módulos ES requieren HTTP (no `file://`).
```bash
npm start                  # Node ≥ 18 → http://localhost:4173
npm run start:python       # alternativa Python 3
```
`?dev=1` muestra atajos de desarrollo en la franja de demo.

**Prototipo completo (todas las historias, todos los estados de vista previa):** con el mismo servidor abre `http://localhost:4173/prototype/Portal%20Viaticos.dc.html`. Es la referencia visual y funcional vigente (incluye la franja MODO DEMO para cambiar de usuario y de estado del Inicio). `prototype/support.js` es el runtime del prototipo; no forma parte de la arquitectura propuesta.

## Dónde está cada cosa
```
index.html                      documento de entrada (estilos + src/app.js)
prototype/                      SNAPSHOT del prototipo aprobado/vigente: Portal Viaticos.dc.html + datos (us01/us26/usperfil/us08/uscat-data.js) + imágenes; referencia de todo lo no portado a src/
public/assets/branding/         logo-starmedica.png — logo REAL (no redibujar ni sustituir)
public/assets/icons/*.svg       un archivo por icono (mismos nombres que src/config/icons.js)
public/assets/users/            demo-profile-user.jpg — fotografía DEMO proporcionada por el cliente para la maqueta
src/
  app.js                        carga src/data/*.json y monta el shell
  config/app-config.js          breakpoints (760 / 1180), ruta del logo, utilidades
  config/icons.js               ÚNICO mapa de iconos (clave → trazo SVG) + icono por tono
  layout/portal-layout.js       shell: estado, encabezado, menú de cuenta, avisos, barra de mensajes, estados
  layout/navigation.js          resolución de permisos (canSee / resolveNavigation) + sidebar + drawer móvil
  features/home/home.js|.css    pantalla Inicio (viaje propio, resumen según rol/ámbito, bandejas)
  features/traveler-profile/    Administración › Perfiles de viajero (US-03): admin.js (pestañas Perfiles · Tarifas · Excepciones + simulador) · rules.js (resolver de valor efectivo, estados, validaciones, simulador) · traveler-profile.css
  data/traveler-profiles.json   modelo único de perfiles, conceptos, tarifas, parámetros globales, taxi, reglas exceptuables, excepciones y asignaciones
  shared/journey-progress.js    ÚNICO indicador de etapas del viaje (4 etapas canónicas) — futuro componente Angular compartido
  data/users.json               usuarios de prueba + catálogo de roles
  data/navigation.json          MENÚ: grupos, ítems, iconos, rutas, visibilidad por rol, reglas de perfil
  data/statuses.json            estatus (texto + tono + icono)
  data/home.json                Inicio representativo por usuario
  data/notifications.json       avisos, alertas de plazo, contadores pendientes
  data/people.json              registro canónico de personas (celda Colaborador / Viajero externo)
  data/traveler.json            perfiles vigentes, asignaciones, comprobaciones (saldo por comprobar), precondición presupuestal personal, colores de concepto
  demo/demo.js                  DEMO ONLY — franja MODO DEMO, cambio de usuario, persistencia
  styles/tokens.css             tokens visuales (CSS custom properties, valores aprobados)
  styles/global.css             reset, Roboto, scrollbars, botones, tarjetas, chips, paneles, estados
  styles/layout.css             shell, encabezado, sidebar (284 / 72), drawer
  styles/responsive.css         reglas < 1180 y < 760 (clases .is-narrow / .is-mobile en el shell)
  styles/demo.css               DEMO ONLY
docs/MENU_MATRIX.md             matriz de visibilidad del menú (+ orden por rol) · docs/HOME_VISIBILITY_MATRIX.md Inicio por rol (canónico US-02) · docs/TABLE_LIST_STANDARD.md · docs/US01_DESIGN_NOTES.md · docs/US02_DESIGN_NOTES.md
```

## Reglas de visibilidad del menú (`data/navigation.json` → `layout/navigation.js › canSee`)
`✓` visible · `V` requiere capacidad de viajero · `V+PF` viajero + bandera del perfil (`profileRules`) · `L` solo lectura (etiqueta «Lectura») · `P` permiso configurado en `user.permissions` (oculto por defecto) · rol ausente = no visible.

## Reglas visuales fijadas por el cliente (revisión US-01)
- **Esquinas rectas.** Toda superficie rectangular usa `--radius-default: 0px` (tarjetas, paneles, botones, inputs, menús, chips, barras de mensajes, tooltips, contadores). Solo los elementos de forma circular por significado (avatar, marcador de etapa, punto de estado) usan `--radius-circle: 50%`. Sin píldoras.
- **Fotografía de usuario.** El avatar muestra la fotografía proporcionada por el cliente (`users.json › photo`, activo local DEMO); iniciales solo como respaldo.
- **Menú de cuenta.** Sin repetir la identidad del encabezado (foto · nombre · rol): solo Número de colaborador · Dirección · Hospital (únicamente usuarios de hospital: `users.json › hospital`; los usuarios corporativos no muestran el campo) · Puesto · Perfil (`employeeNumber`, `direccion`, `hospital`, `puesto`, `perfil.label`) + «Cerrar sesión». Vocabulario de perfil aprobado: Director · Ejecutivo · Mando medio · Operativo · DGA (nunca «Nivel n»).
- **Indicadores del colaborador.** Solo ámbito personal: Comprometido · En tránsito · Gasto acumulado · Uso de presupuesto asignado (% del presupuesto propio, `summary.personalBudget`, valor mock). Nunca montos ni % de la Dirección. La capacidad de viajero no amplía el ámbito. Referencia por rol: `docs/HOME_VISIBILITY_MATRIX.md`.
- **Copy.** Barra de ayuda neutra («Aquí se muestra…»); acciones en lenguaje personal («Registra tus gastos»).
- **Fechas con significado.** Avisos: «Notificado: …» (`notifications.json › notifiedAt`); fechas de negocio dentro del texto / Detalle.
- **Tarjeta de viaje = solicitud más reciente**, visible también en la etapa 1. Los demás viajes, en Mis viajes.
- **Columnas de bandeja** (`home.json › trays[].columns`, `COLUMNS` en `home.js`, estándar en docs/TABLE_LIST_STANDARD.md): `personal` · `externos` · `standard` (listas de Dirección / CH CO) · `operationalOrg` (colas consolidadas, con columna «Hospital / Corporativo») · `hosted` (Hospedados actualmente, Dirección de Hospital) · `traveling` (Colaboradores en viaje, Dirección Corporativa / CH CO) · `bitacora` (Admin: Fecha y hora · Folio · Usuario · Área · Perfil · Acción · Resultado). Cada columna significa lo mismo en todas las filas (`detalleMeaning`). Toda lista escalable tiene búsqueda + filtros contextuales, orden por columna y paginación (`src/shared/data-list.js`).
- **Indicador de etapas único.** `src/shared/journey-progress.js` es la única implementación para el viaje propio de cualquier usuario con capacidad de viajero. Etapas: Aprobación de viaje · Anticipo · Comprobación · Cierre (Hospedaje y Vuelo son subprocesos) Una etapa puede ser «No aplica» (`state: "na"`, p. ej. Anticipo para el perfil DGA): conserva su número y posición, rellena en gris; nunca se elimina ni se renumera. Para DGA, Aprobación de viaje nace aprobada al capturar la solicitud.
- **Inicio según rol y ámbito.** `home.json › summary.scope` = `personal` (datos propios del viajero) · `operational` (cola de trabajo propia) · `organizational` (presupuesto de la unidad, solo Dirección / Contraloría). El colaborador nunca ve totales presupuestales de su Dirección. Un Inicio puede tener varios bloques de indicadores (`summaries[]`, p. ej. CH CO: presupuesto de su dirección + casos escalados). Presupuesto organizacional: Planeado · Ejercido · Comprometido · PRE disponible.
- **«Contraer menú» es utilidad del shell.** Va en el pie FIJO del menú lateral (`.sidebar__foot`), fuera de la lista desplazable y siempre visible; separado de la navegación y con menor énfasis; nunca junto a «Inicio». En teléfono no existe (el panel se abre/cierra con hamburguesa y X).
- **Menú lateral = lista de navegación (único elemento que se desplaza, vertical) + pie de utilidad.** Ancho fijo en ambos estados y `overflow-x: hidden`: el riel colapsado nunca muestra desplazamiento horizontal. Colapsado, las etiquetas no se renderizan (nombre por `title` + `aria-label`) y los contadores son insignias de 16 px dentro del ítem. El shell es un marco de altura fija (100vh) donde solo el área de trabajo y la navegación se desplazan.

## Tipografía e iconos
Roboto 400/500/700 desde Google Fonts (`index.html`; para uso offline, sustituir por `@font-face` local). Iconos: trazos inline en `src/config/icons.js`, exportados como SVG en `public/assets/icons/`; geometría Lucide (ISC) con nombre equivalente en `ASSET_MANIFEST.md`. Regla: **misma función = mismo icono**, independiente del rol.

## Solo demo
`src/demo/`, `src/styles/demo.css` y las líneas marcadas `DEMO ONLY` en `portal-layout.js` (franja, etiqueta, carga simulada, usuario recordado). Los datos de `src/data/` son sintéticos.

## Mapeo a Angular
Ver `IMPLEMENTATION_MAP.md › Mapeo sugerido a Angular`.

## Relación con los demás entregables
Artefacto publicado (validación interactiva del cliente) · HTML autocontenido (`publish/`, distribución) · PDF de especificación visual (aprobación + referencia) · **este repositorio** (entrega canónica a desarrollo). Regla: CÓDIGO → implementación renderizada → capturas → PDF. Las historias siguientes **extienden este mismo proyecto** (`src/features/<dominio>/`, `src/data/`); nunca se rehace desde cero.

## Reglas de copy (validación V2, 2026-09-14)
- **Folio:** en textos y avisos el número de solicitud siempre se introduce como «folio 000nn» («Nueva solicitud folio 00045…»); en una tabla cuya columna ya se titula FOLIO la celda lleva solo el número.
- **Vuelos** en plural para nombres de módulo/menú; «un vuelo» en prosa no cambia.
- **Origen organizacional** (Hospital / Corporativo) visible en registros operativos cuando ayuda al rol a procesarlos; nunca en vistas personales del viajero.

## Reglas de negocio de datos (validación V2 final)
- **Anticipo**: No aplica solo para perfil Director con grupo de personal E / ED (DGA es un perfil distinto y no hereda la regla) (`users.json › personnelGroup`, regla única en `src/layout/navigation.js › anticipoApplies`). El indicador de etapas conserva la etapa 2 como «No aplica».
- **Presupuesto**: Planeado · Ejercido · Comprometido · PRE disponible = Planeado − Comprometido. «Ejercido» es el término canónico.
- **Perfil**: Director · Ejecutivo · Mando medio · Operativo · DGA; nunca «Nivel» para clasificación de personal.

## Reglas del Inicio (US-02 · aprobadas)
- Orden por rol definido por el cliente (`home.order`); sin orden: KPIs → bandejas → secciones del viajero. CH CO: Presupuesto → Casos escalados → Solicitudes por autorizar → Colaboradores en viaje → Perfil → Tu viaje → Nueva solicitud. DGA: Presupuesto → Perfil → Tu viaje → Autorizaciones. Hotelería HSM: Hospedaje HSM · ‹hospital› → Indicadores → Solicitudes. Viáticos: Hotel externo y vuelos → Comprobaciones.
- Severidad: advertencia = amarillo · incumplimiento/vencido/bloqueo = rojo · utilización 0–70 verde · 71–84 amarillo · ≥85 rojo; la severidad vive en su indicador (sin franjas duplicadas).
- Ayuda descriptiva en «?»; alertas, bloqueos, plazos y estatus siempre visibles. SAP no disponible = un aviso amarillo arriba.
- Celda de persona compartida; Detalle en dos líneas; filtro Destino y resumen de decisión en bandejas de autorización; ruta de vuelo destacada; «Viaja en X días».
- Trayecto compartido: Anticipo «No aplica» por configuración del perfil (DGA) o Director E/ED; «Saldo pendiente por comprobar» en Comprobación del viaje propio.
- Vigencias siempre «desde … hasta …».
