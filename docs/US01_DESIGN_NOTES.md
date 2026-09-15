# US-01 · Approved direction, assumptions and decisions (from the design notes of the prototype)

Status: internally approved 2026-09-10 · first client review 2026-09-11 (not rejected; corrections below incorporated) · pending final client validation.

## Approved direction
- Real Starmedica logo (30 px / 24 px mobile), never redrawn.
- Sidebar Digital Blue **#00A7E1** (institutional default), full viewport height (container = viewport − 64 px header), content scrolls internally with a thin subtle scrollbar. Expanded 284 px / collapsed rail 72 px with tooltips. Mobile = full-screen drawer (no bottom bar).
- Header: compact identity (name + role, + area in the account menu), no SAP fields; avatar/name/chevron opens the account menu with «Cerrar sesión» (no standalone «Cerrar»); bell in header.
- Same function = same icon (`NAVIGATION_ICONS`). Concise labels, wrap to 2 lines, never ellipsis.
- Component-level contrast on blue: Medium labels; active item = white surface + #4A4F54 text + blue icon; counters white + #0077A8; hover white 18 %; focus ring.
- One message/help bar per screen (state-switching). Folio indicator only on folio screens, below the message bar (not in US-01).
- Status grays: #A9A8A9 captura / #4A4F54 cancelado. Status always color + icon + text. Buttons 42 / 40 / text.
- Demo switcher labeled MODO DEMO · SOLO PROTOTIPO, visually separate (dark strip with dashed border + fixed tag).

## Client review corrections (2026-09-11) — permanent rules
1. **No rounded corners.** Every rectangular surface is 0 px (`--radius-default`). Semantic circles (avatar, journey marker, status dot) stay circular (`--radius-circle`). No pill shapes as a workaround.
2. **Realistic user photo.** Avatar shows the client-supplied demo portrait (`public/assets/users/demo-profile-user.jpg`, not an employee record); initials only as fallback.
3. **Prominent, shared journey progress.** Markers 40 px (36 px mobile), labels 14 px, connector 3 px, current step ringed. One implementation (`src/shared/journey-progress.js`) for every traveler-capable user viewing their own trip; stages fixed to Aprobación de viaje · Anticipo · Comprobación · Cierre.
4. **Home is role- and scope-aware.** Colaborador sees personal travel figures (Comprometido · En tránsito · Gasto acumulado · Uso de presupuesto asignado) — never Dirección budget totals. Budget totals only for roles with documented responsibility and Presupuesto › Monitor: Dirección de Hospital (own hospital), Dirección Corporativa (own dirección), Contraloría (consolidated). `home.json › summary.scope` makes the scope explicit.
5. **Collapse control is a shell utility.** Fixed sidebar footer OUTSIDE the scrollable navigation list (always visible), separated by a divider, 12 px Medium label at 85 % opacity (full on hover/focus), icon-only with title/aria-label when collapsed. Never adjacent to «Inicio». Not present on mobile.
6. **Collapsed rail never scrolls horizontally.** Fixed 72 px, `overflow-x: hidden`; labels and group titles are removed from layout (not clipped); counters are 16 px badges inside the item box; native tooltips replace the custom hover tooltip. The shell is a fixed 100vh frame: only the navigation list and the work area scroll.

## Client validation (Validación Mockup V1, 2026-09-11) — permanent rules
7. Client-supplied demo photo `public/assets/users/demo-profile-user.jpg` (u01) — canonical avatar asset.
8. Account panel: Número de colaborador · Dirección · Puesto · Perfil («Mando medio») + «Cerrar sesión» only. Identity (photo · name · role) lives in the header and is never repeated in the dropdown. No «Nivel 3».
9. Colaborador KPIs personal only: Comprometido · En tránsito · Gasto acumulado · Uso de presupuesto asignado (% of own assigned budget; mock). Never Dirección totals or %. Traveler capability never escalates scope — see docs/HOME_VISIBILITY_MATRIX.md.
10. Help copy neutral; action copy personal.
11. Notices: «Notificado: <timestamp>»; business dates inside text. Detalle always with dates.
12. Home journey card = most recent request only; visible at stage 1.
13. Mis viajes: Folio · Destino · Asunto · Estatus · Antigüedad. CH HSM externos: Folio · Viajero · Destino · Asunto · Detalle · Estatus · Antigüedad. Empty externos → own traveler context predominates.

## Assumptions / decisions
- White on #00A7E1 measures 2.7:1 (AA for large text only) → contrast handled at component level as above. The dark blue #007DB0 / #0B5C7E is only an optional secondary variant, never the default (not included in this source package).
- Warning yellow is not defined by Starmedica guidelines nor the common spec → proposed **#E9A800** (border) / **#FFF6DC** (background), text always #4A4F54, icon #B37D00.
- Role Homes share a structure: own trip (if traveler) → indicators → trays with folio, responsible, detail, status and age. The Colaborador Home is detailed in US-02.
- Operational roles with traveler capability (Capital Humano HSM, DGA, Dirección) also see Planeación de viaje and their own trip card with the same journey progress. No duplicated screens.
- Menu by matrix: ✓ visible, V traveler only, V+PF profile, L with «Lectura» tag, P hidden (US-26). Menu reordered by functional blocks; names avoid «Módulo».
- Unbuilt sections show the story that designs them; no dead links. «Cerrar sesión» is visual.
- Switching demo user clears state and reloads Inicio.

## Client validation (Validación Mockup V2, 2026-09-14) — permanent rules
13. Account panel adds **Hospital** for hospital-based users only (`users.json › hospital`); corporate users show no Hospital field. Order: Número de colaborador · Dirección · Hospital · Puesto · Perfil.
14. Profile vocabulary (user-facing): Director · Ejecutivo · Mando medio · Operativo · DGA. Never «Nivel 1/2/3».
15. Folio terminology: prose introduces the number as «folio 000nn»; FOLIO table cells hold the number only.
16. Journey progress supports `state: 'na'` («No aplica»): the stage keeps number and position, filled gray. DGA own travel: Aprobación de viaje starts approved at capture; Anticipo = No aplica.
17. Organizational budget blocks show Planeado · Ejercido · Comprometido · PRE disponible (Ejercido added). «PRE disponible» naming/visibility still pending client confirmation — kept as documented in the approved flow.
18. Standard request list (Dirección de Hospital, Dirección Corporativa, CH CO): Folio · Colaborador / Viajero (org · área · perfil sub-line) · Destino · Asunto · Detalle (with dates) · Estatus · Antigüedad.
19. Consolidated operational queues carry a «Hospital / Corporativo» column (`operationalOrg`); personal views never add organizational columns.
20. CH CO is traveler-capable in the demo (own trip card, Planeación de viaje, Gastos de representación by profile); its Home = own dirección budget (top) + escalated cases. Help copy: «Aquí llegan solo los casos escalados de: hospitales con Dirección vacante, excedentes de política o presupuesto, autorizaciones específicas.»
21. DGA Home indicator label: «Autorizaciones de viaje pendientes». Hotelería HSM Home adds concise satisfaction statistics (synthetic values; rejection-alert threshold undefined → demo state only).
22. Same function = same icon: every Comprobación / Comprobaciones item uses `fileCheck`. Module naming: «Vuelos».
23. Viáticos: «Falta ticket» replaced by «Pendiente de reembolso $monto». Admin bitácora tray reordered for clarity (Fecha y hora · Usuario · Área del portal · Acción registrada · Resultado) with existing fields only.

## Client clarifications (Validación Mockup V2 — final, 2026-09-14) — permanent, close every V2 question
24. Budget vocabulary: **Ejercido** (never «Consumido»); block = Planeado · Ejercido · Comprometido · PRE disponible; **PRE disponible = Planeado − Comprometido** (definitive).
25. Dirección de Hospital Home adds «Hospedados actualmente · <hospital>» (`hosted`): guests currently staying at the OWN hospital only.
26. Dirección Corporativa and CH CO Homes add «Colaboradores en viaje · <dirección>» (`traveling`): collaborators of the OWN organizational scope only («los suyos, no todos»).
27. Anticipo = No aplica ONLY for perfil Director with personnelGroup E / ED (client: «Solo a Director grupo E ED»; DGA does not inherit it) (`users.json › personnelGroup`; rule in `navigation.js › anticipoApplies`). Not «all Directors», not «DGA always». Journey stage 2 stays visible and unrenumbered.
28. Hotelería HSM «Nivel de rechazos» = percentage counter shown in red (`kpi.valueTone`); no threshold algorithm.
29. Viáticos › Perfil del viajero = Lectura (read-only consultation of any traveler's profile).
30. Admin bitácora columns: Fecha y hora · Folio («—» when none) · Usuario · Área · Perfil · Acción · Resultado.
31. Table semantics: one meaning per column for every row; Detalle documented per table (`detalleMeaning`); Hospital / Corporativo as a dedicated column where operationally relevant; never in personal views. See docs/TABLE_LIST_STANDARD.md.
32. Filtering (search + contextual), sorting (direction indicator) and pagination (page x of y, prev/next) on every scalable collection — functional in the prototype (`src/shared/data-list.js`).
33. «Nivel» is prohibited for personnel classification in any user-facing text or mock data (metrics such as «Nivel de rechazos» are allowed).
