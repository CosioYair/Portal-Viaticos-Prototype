# FINAL_HANDOFF — Portal de Viáticos 2.0 (Star Médica) · prototipo de diseño

**Handoff date:** 2026-10-30 · **State:** design/prototype engagement COMPLETE · all implemented stories CLOSED · client validation tracked separately.

> This is a **front-end prototype with synthetic mock data**, not production software. There is no backend; ERP/SAP, e-mail and payment integrations are simulated (MODO DEMO).

## Story status matrix
Closed ≠ Client validated. «Yes» in CLIENT VALIDATED only when the validation is documented.

| USER STORY | TITLE | IMPLEMENTED | CLOSED | CLIENT VALIDATED | PDF | NOTES |
|---|---|---|---|---|---|---|
| US-01 | Layout y navegación por rol | Yes | Yes | Yes | Earlier closure (US-01 Paquete Visual) | Preserved |
| US-02 | Pantallas de Inicio | Yes | Yes | Yes | Earlier closure | Preserved |
| US-03 | Administración de perfiles de viajero | Yes | Yes | Yes | Earlier closure | Preserved · see pending #1 (Importe máximo) |
| US-04 | Ficha del viajero y asignación de perfil | Yes | Yes | Yes | Earlier closure | Preserved |
| US-05 | Viajeros externos | Yes | Yes | Yes | Earlier closure | Preserved |
| US-06 | Disponibilidad presupuestal | Yes | Yes | Yes | Earlier closure | Preserved |
| US-07 | Administración del presupuesto | Yes | Yes | Yes | Earlier closure | Preserved |
| US-08 | Creación de solicitud | Yes | Yes | Yes | Earlier closure | Preserved |
| US-09 | Aprobación de viaje | Yes | Yes | Yes | Earlier closure | Preserved |
| US-10 | Mis viajes | Yes | Yes | Yes | Earlier closure | Preserved |
| US-11 · US-12 · US-13 | Hospedaje y vuelo | Yes | Yes | Yes | Earlier closures | Preserved |
| US-14 · US-15 | Anticipo | Yes | Yes | Yes | Earlier closures | Preserved |
| US-16 | Adeudo / cancelación tras compra | No | No | No | — | Only an external-dependency placeholder (cierre bloqueo) |
| **US-17** | Encuesta hospitalaria | Yes | Yes | **Yes** | US-17_Encuesta-hospitalaria_FINAL.pdf | Closed in this pass |
| **US-18** | Registro de comprobación | Yes | Yes | **Yes** | US-18_Registro-de-comprobacion_FINAL.pdf | Closed in this pass |
| **US-19** | Gastos de representación | Yes | Yes | **Yes** | US-19_Gastos-de-representacion_FINAL.pdf | Closed in this pass |
| **US-20** | Validación de comprobaciones | Yes | Yes | **Yes** | US-20_Validacion-de-comprobaciones_FINAL.pdf | Closed in this pass |
| **US-21** | Reembolso / reintegro, contabilización, cierre e IT0014 | Yes | Yes | **Yes** | US-21_Contabilizacion-reembolso-cierre-IT0014_FINAL.pdf | Closed in this pass |
| **US-22** | Dashboard | Yes | Yes (handoff) | **Pending** | US-22_Dashboard_FINAL.pdf | Closed for project handoff before final client validation · number inferred |
| **US-23** | Reportes operativos y de control | Yes | Yes (handoff) | **Pending** | US-23_Reportes-operativos-y-de-control_FINAL.pdf | Closed for project handoff before final client validation |
| **US-24** | Administración › Políticas y guías | Yes | Yes (handoff) | **Pending** | US-24_Administracion-de-politicas-y-guias_FINAL.pdf | Closed for project handoff before final client validation |
| US-25 | Usuarios y permisos · Bitácora | Yes | Yes | Yes | Earlier closure | Preserved |
| **US-26** | Ayuda: políticas vigentes, guías y soporte | Yes | Yes (handoff) | **Pending** | US-26_Ayuda-politicas-guias-soporte_FINAL.pdf | Closed for project handoff before final client validation |
| — | Administración de catálogos y parámetros | **No** | No | No | — | Story not started (menu placeholder only) |

PDF sources: `US-xx Paquete Visual.dc.html` (print copy `US-xx Paquete Visual.dc-print.html`). Store the exported files in `FINAL_HANDOFF/pdf/`.
Note: the prototype menu keeps historical `us:` references (e.g. dashboard «US-23», reportes «US-24»); this matrix uses the current backlog numbering.

## Source snapshot
- Folder: `handoff/Portal-Viaticos-Prototype/` → ZIP **portal-viaticos-prototype_FINAL_HANDOFF.zip**.
- `prototype/Portal Viaticos.dc.html` = the exact current cumulative prototype (copy of `US-01 Layout Portal.dc.html`) + every data module it loads + assets.
- `src/` = modular port of the stories closed up to 2026-10-21 (reference); features closed afterwards live in `prototype/` (see IMPLEMENTATION_MAP.md).

## How to run
Serve the folder with any static server (e.g. `npx serve handoff/Portal-Viaticos-Prototype`) and open `prototype/Portal Viaticos.dc.html`. The **MODO DEMO · SOLO PROTOTIPO** bar switches the simulated user/role and demo conditions (ERP failure, fiscal validation result, etc.). It is prototype-only.

## Open client / development questions
See FEATURE_SYNC_PENDING.md › «FINAL HANDOFF · PENDING CLIENT / DEVELOPMENT DEFINITION» (17 items; e.g. Importe por política / Importe máximo, alert thresholds, holiday calendar, rejection-reason catalog, ERP/IT0014 layout, support attention, external-traveler reimbursement account, Administración de catálogos).

## Integration notes
- Data ownership default = SAP/ERP unless a story says Portal. Visible budget movements = Anticipo and Comprobación only. Journey = four stages. Nómina is not a Portal role. DGA = functional role. Contraloría participates only in representation expenses; Viáticos does not validate representation.

## Known prototype limitations
- No backend, no persistence beyond the browser session; fixture dates fixed around Oct 2026.
- ERP, e-mail, payments, IT0014 load and help-desk attention are simulated or not built.
- Portraits in `assets/users/` are client-provided demo images; company RFCs and GL accounts come from the client workbook — confirm before publishing a public repository.

## Recommended development starting point
PROJECT_RULES.md (= project CLAUDE.md; canonical rules, numbered) → IMPLEMENTATION_MAP.md (where each feature lives) → the story PDFs (functional rules + screens) → `prototype/` for behaviour.
