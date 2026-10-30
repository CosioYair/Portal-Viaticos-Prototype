# DASHBOARD — traceability (REVIEW MODE · SYNC PENDING, 2026-10-26)

Pipeline: canonical records → `presCaps` scope + `antCapOf('dashboard','CO')` → filters (`state.db`: per · f.ent · f.motivo · f.sede · f.unidad) → `met()` / builders in `dbRender` → blocks (kpis · bars · table) → drill `dList(kind)`.

| Element | Source | Date | Roles | Click |
|---|---|---|---|---|
| Presupuesto (Planeado · Comprometido · Ejercido · PRE + % · Disponible del mes) | `presData().entidades` (base, comprometido, ejercido, pre, preMes) — same as Monitor / Inicio | ejercicio | DIR CHC DGA CTR CON | Monitor (entity) |
| Presupuesto por entidad / área | entidades (consolidated, Hospital vs Dirección Corporativa subtotals) or `bolsas` of the entity | ejercicio | idem | Ver entidad (focus) · Monitor entity/bolsa |
| Alertas | `presData().alertas` (CONFIG.umbrales) | now | idem | Monitor / Cargas (CON) |
| Viajes autorizados · Gasto estimado · Promedio · Colaboradores | `svAllReqs` status aprobada/enProceso/finalizado, `total`, uid | trip start | DIR CHC DGA (+CTR/CON/VIA subsets) | folio list |
| Gasto comprobado y validado | `comConcil().comprobado`, recs aprobada/contabilizada/cerrada | trip start | DIR CTR CON | folio list |
| Por autorizar ahora | `apPending(user)` | now | DIR CHC DGA (AU) | Aprobación de viaje |
| Viajes por motivo · Sedes · Top colaboradores | authorized folios grouped by motivo / segment label / uid | trip start | DIR (+VIA motivo/sedes) | folio list |
| Anticipo contra reembolso | `comConcil` of contabilizada/cerrada (anticipo, gastos+rep, reembolso, devolución) + `comAnticipo` sin contabilizar | trip start | DIR CTR CON | folio list |
| Gasto por tipo | approved `renglones` by concepto + `comVueloRows` + `repAutorizado` | trip start | DIR CTR CON | folio list |
| Comprobaciones por estatus | `comRecs` estado (`comStTxt` colors) + concluded without record (`comElig`) | trip start | CON VIA | folio list |
| Pendientes de Contabilidad | `comCounts('con-comp')` · `tabCounts('con-ant')` | now | CON | tray tab |
| Pendientes de Viáticos | `comCounts('ges-comp')` · `tabCounts('res-hotel')` | now | VIA | tray tab |
| Representación (por revisar · solicitada · autorizada · no autorizada · por estatus) | `repPend` · `repAll` · `repAutorizado` · `repSt` | now / trip start | CTR | Gastos de representación / folio list |
| Encuestas respondidas · Satisfacción · Sin responder · Por unidad · Por pregunta | `encResps` (respondida) · `encScore` · `encAllPending` | response date / now | HC | Gestión de encuestas (Resultados prefilled / Sin responder) |

Folio detail (dashboard): read-only; `journey()` stages from status / `antStage` / `comStage` / `cieStage`; montos (estimado, anticipo, comprobado validado, resultado, representación); links only when the target option is permitted.
