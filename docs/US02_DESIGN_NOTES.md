# US-02 — Pantallas de Inicio · design & implementation notes (APPROVED · CLOSED · FULLY SYNCED · 2026-10-02)

Per-role sections and order: `HOME_VISIBILITY_MATRIX.md`. Table rules: `TABLE_LIST_STANDARD.md`. Rule numbers refer to the project rule log.

## Global Home rules (implemented in `src/features/home/home.js` + `home.css`)
| Rule | Behavior |
|---|---|
| Order per role (252/264/267) | `home.order` is authoritative; base order KPIs → trays → traveler; one mechanism (`ordOf`), CSS `order` on each section. |
| Help «?» (243, help pattern) | Descriptive text lives in a «?» popover (title, Perfil de viajero, Siguiente paso, Nueva solicitud). Alerts, blockers, deadlines and statuses stay visible. No duplicated blue strips. |
| Sin perfil vigente (243) | Perfil card shows «Sin perfil vigente»; one explanation in its «?»; no banner; an existing trip stays visible; no empty-journey card; Nueva solicitud disabled with red precondition. |
| Severity (244/245) | Warning/risk = yellow · breach/overdue/blocked = red. Budget utilization 0–70 green · 71–84 yellow · ≥85 red (`budgetTone`). Red KPI = red outline. |
| SAP unavailable (249) | One yellow warning in the message bar; lower sections keep their layout; never repeated below. |
| Person cell (246) | Name 14 px Bold + lines «No. · Hospital · Perfil · Sociedad» (label gray, value ink) from `people.json`; external traveler = Hospital · Tipo · Registrado por. Search covers every line. No duplicated Hospital / Corporativo column. |
| Authorization trays (247/248) | Detalle line 1 = trip dates + estimated amount, line 2 = context; Destino filter instead of Estatus; decision summary (personas · estimado total, + solicitudes when filtered) over the filtered rows. |
| Reservation trays (255) | Flight: bold route «A → B \| B → A» + «Fecha de viaje»; Hotel: dates + nights. Antigüedad = «Viaja en X días». Status sub-line for «hace 3 h» / «Notificado: dd/mm/aaaa». |
| Journey (253/262) | 4 canonical stages; Anticipo «No aplica» (gray) by profile configuration (DGA) or Director E/ED; «Saldo pendiente por comprobar» on the current Comprobación stage of the OWN trip = sujeto − comprobado (`traveler.json › comprobaciones`). |
| Perfil de viajero summary (263) | Category icon + title on one header row (36 px light-blue box, 13 px title), value + sub-line below; same component for every traveler role. |
| CH CO budget (264/266) | Fixed concept dots (Planeado green · Ejercido orange · Comprometido yellow · PRE disponible light blue) + micro-chart embedded in the PRE disponible card (only when it fits beside the text; never below it). Severity stays on the %. |
| Monitor CTA (251) | «Ir a Monitor» → Presupuesto › Monitor on organizational budget blocks that declare `monitorCta`. |
| Sidebar order (265) | `navigation.json › roleMenuOrder` reorders options inside a group for one role (CHC: Hospedaje → Vuelos → Anticipo). Presentation only. |

## Responsive (validated 1440 · 1280 · 768 · 390 · 360)
KPI grids wrap (auto-fit); trays become cards < 1180 px container; journey vertical on narrow content; standard buttons full width on mobile; Perfil categories stack one per row on mobile; no page-level horizontal overflow; help popovers capped at viewport width.

## Data sources
`home.json` (sections, order, trays) · `people.json` (canonical person projection) · `traveler.json` (profiles, vigente assignments, comprobaciones, personal budget precondition, concept colors) · `statuses.json` · `navigation.json` · `notifications.json`. All values are synthetic demo data; no business rule is computed beyond what the approved prototype defines.

## Implementation note (modular source vs full prototype)
The modular source reproduces the approved Home structure and rules. The complete approved behavior — every preview state (Comprobación parcial/completa, Sin presupuesto, SAP, Vencido), welcome modal, account panel, and the open-story screens — is in the full prototype snapshot `prototype/Portal Viaticos.dc.html`, which is the visual reference for anything not yet ported to `src/`.
