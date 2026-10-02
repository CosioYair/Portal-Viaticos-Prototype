# TABLE_LIST_STANDARD — tables and lists of the Portal (implementation reference)

Applies to every data collection of the Portal (US-01 trays today; Mis viajes, Solicitudes, authorization queues, viajeros externos, operational queues, hospedados, colaboradores en viaje, Hotelería / Viáticos / Contabilidad lists, Admin bitácora, catalogs, report detail tables tomorrow). Client rule (Validación Mockup V2, final): **consistent column semantics + filtering, sorting and pagination wherever a collection can grow.** Not for KPI cards, JourneyProgress, help text or fixed summaries.

Implementation: `src/shared/data-list.js` (pipeline + toolbar/header/pager renderers) · `src/features/home/home.js › COLUMNS` (column sets) · `src/features/home/home.css` (`.list-*`, `.ttable*`, `.tcard*`) · data in `src/data/home.json › trays[]`.
Conceptual model for Angular: `dataset + filter state + sort state + page state → displayed rows` (one service/pipe; one table component with `@Input() columns`).

## 1. Column semantics — one meaning per column, for every row
- A column set is declared once (`COLUMNS`) and referenced by the tray (`columns`). Within one table the same column ALWAYS holds the same type of information; rows never switch meaning.
- **Detalle** is never a free-text dump: every tray states what it contains (`detalleMeaning`, e.g. «Fechas de viaje · monto estimado · fecha de solicitud»). Approval history, escalation reasons or balances go where they belong (Estatus, a dedicated column or the documented Detalle pattern of that table) — for ALL rows.
- Column sets (US-01):
  - `personal` — Folio · Destino · Asunto · Estatus · Antigüedad (own trips; no organizational column).
  - `externos` — Folio · Viajero · Destino · Asunto · Detalle (fechas de viaje · fecha clave de comprobación) · Estatus · Antigüedad.
  - `standard` — Folio · Colaborador / Viajero (sub-line: Hospital o Corporativo · área · perfil) · Destino · Asunto · Detalle (fechas · monto estimado · solicitud/escalamiento) · Estatus · Antigüedad. Used by Dirección de Hospital, Dirección Corporativa, CH CO.
  - `operational` — Folio · Responsable · Detalle · Estatus · Antigüedad.
  - `operationalOrg` — `operational` + **Hospital / Corporativo** (consolidated queues: Hotelería, Viáticos, Contabilidad/Tesorería, Contraloría, DGA, Hotelería Corporativo).
  - `hosted` — Folio · Colaborador / Viajero · Hospital / Corporativo (origen) · Entrada · Salida · Estatus · Habitación (Dirección de Hospital: guests at the own hospital).
  - `traveling` — Folio · Colaborador / Viajero · Hospital / Corporativo · Destino · Fechas · Estatus · Regreso (Dirección Corporativa / CH CO: own-scope collaborators traveling).
  - `bitacora` — Fecha y hora · Folio · Usuario · Área · Perfil · Acción · Resultado (Admin).

## 2. Folio
- Table cell under a FOLIO header: number only (`00045`); `—` when the record has no folio (never invent one).
- Prose, cards and messages: «folio 00045» («Nueva solicitud folio 00045…»). Never «Folio folio».

## 3. Organizational origin (Hospital / Corporativo)
- A dedicated column wherever the origin helps the role process the record (consolidated queues, hosted/traveling lists). In `standard` lists it is the first element of the Colaborador / Viajero sub-line.
- Never in purely personal views (Mis viajes).

## 4. Status
- Always text + icon + color (`statuses.json`), never color only. Codes follow the process (SOL/HOS/HOT/VUE/ANT/COM/CIE).

## 5. Dates
- Every date states its meaning: «Viaje 22 – 23 jun 2026», «Solicitada 9 jun 2026», «Notificado: hoy 08:00». Business dates live in Detalle / Entrada / Salida / Fechas; never a bare date.
- Personnel classification is always **Perfil** (Director · Ejecutivo · Mando medio · Operativo · DGA); «Nivel» is reserved for metrics (e.g. «Nivel de rechazos»).

## 6. Filtering
- Toolbar above the rows: **search** (text, matches every visible column + the sub-line) + **contextual filters** declared per tray (`filters`: `status` Estatus · `org` Hospital / Corporativo · `perfil` Perfil). Only filters relevant to the dataset are shown; options come from the data.
- Any filter change resets to page 1. No match → short neutral text («Ningún registro coincide…»), the toolbar stays.
- Visible range «1–5 de 7» next to the filters.

## 7. Sorting
- Sortable columns (`SORTABLE_FIELDS`): Folio, Colaborador / Viajero / Usuario, Destino, Asunto, Hospital / Corporativo, Entrada, Salida, Fechas, Perfil, Área, Estatus, Antigüedad / Fecha y hora. Detalle / Acción are not sortable.
- Header = button with direction indicator (↕ none · ↑ asc · ↓ desc), `aria-sort`, active column in Digital Blue. Clicking the active column toggles direction. Antigüedad sorts by the list's chronological order (newest first by default).

## 8. Pagination
- Every scalable list ends with a pager: «Página x de y» + previous / next (36 px, disabled at the edges). Page size 5 in the Home trays (`pageSize`), full modules may use 10–25; a page-size selector only when it materially helps.
- The pager is present even with one page (stable layout, discoverable behavior).

## 9. Responsive
- ≥ 1180 px: CSS-grid table with sortable headers. < 1180 px: rows become stacked cards (Folio + Antigüedad · lead · «Columna: valor» pairs · Estatus); toolbar and pager stay usable, filters wrap, search takes the full width. Never uncontrolled horizontal scroll.
- Rows (table and cards) are buttons that open the record's screen (`target`).

## 10. State
- State per list `{ q, f: { field: value }, sort, dir, page }` (`emptyListState()`); reducer `listReducer()`; pipeline `applyListState(rows, columns, state, statuses, pageSize)`. State resets when the demo user changes. Development wires the same state to the API (server-side filter/sort/page for large modules).


## US-02 additions (APPROVED · 2026-10-02)
- **Person cell** (internal): column COLABORADOR — name 14 px Bold + «No. · Hospital · Perfil · Sociedad» lines (label gray / value ink). External: column VIAJERO EXTERNO — Hospital · Tipo · Registrado por. No separate Hospital / Corporativo column when the cell already shows it. Search covers every line.
- **Authorization trays** (`standard`): Detalle line 1 = dates + estimated amount, line 2 = context; filter **Destino** (Estatus does not discriminate); decision summary over filtered rows.
- **Reservation trays** (`collabOrg`): flight route bold «A → B | B → A» + «Fecha de viaje»; hotel dates + nights; Antigüedad «Viaja en X días»; status sub-line for notification time.
- **Accounting** (`anticipos`): Anticipos autorizados (Pendiente de transferencia · Transferido) · Contabilizaciones pendientes (anticipo · comprobación ± · vuelos · gastos de representación · devolución · adeudo a colaborador), every row with amount.
- **Contraloría** (`repr`): Asunto before Detalle; status «Pendiente de autorización» (Contraloría); age since arrival to Contraloría.
- Status chips wrap (no nowrap / fixed height) and accept a gray sub-line.
