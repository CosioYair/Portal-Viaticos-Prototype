# HOME VISIBILITY MATRIX — Inicio por rol (canonical · US-02 APPROVED · CLOSED · FULLY SYNCED · 2026-10-02)

Supersedes every earlier version of this matrix. Source of truth: `src/data/home.json` (synchronized from the approved prototype) + `src/features/home/home.js`.

## How a Home is composed
| Dimension | Decides | Where |
|---|---|---|
| Functional role | Role sections: KPI blocks (`summaries[]`) and work trays (`trays[]`) | `home.json › homes[user]` |
| Organizational scope | `summary.scope`: **personal** (own figures) · **operational** (own work queue) · **organizational** (budget of the unit the role is responsible for) | each block |
| Traveler capability (= vigente traveler profile, CLAUDE.md 82) | Adds **Perfil de viajero · Tu viaje · Nueva solicitud** (one shared set of components) | `traveler.json`, `navigation.js › isTraveler` |
| Client-defined order | `home.order` (keys `sum<i>` · `tray<i>` · `perfil` · `trip` · `nueva`) is authoritative; keys not listed go after in base order | rule 252 |
| Base order (no `order`) | KPIs → trays → traveler sections | `home.js › ordOf` |
| Multi-role users | The Home of the vigente role with the highest Home priority is shown (US-26 resolver); access to the other roles' options is not removed | prototype `homeRoleOf` |

**Traveler capability adds** only the user's OWN profile summary, OWN most recent trip (shared journey) and the Nueva solicitud entry with its preconditions. **It never exposes** organizational budget totals, other people's data, or a wider scope (least scope wins). Without a vigente profile: the Perfil de viajero card shows «Sin perfil vigente» (explanation in its «?»); an EXISTING trip keeps showing in Tu viaje (its folio keeps the rules frozen at authorization); the empty «primera visita» journey is not shown; Nueva solicitud stays visible but disabled with its blocking precondition in red.

## Per role
| Role (demo user) | Sections in order | Scope of figures | Traveler sections |
|---|---|---|---|
| Colaborador (Elizabeth Sánchez) | Perfil de viajero → Tu viaje actual → Nueva solicitud | personal (personal KPI block and «Mis viajes» tray are not rendered on a traveler Home; Mis viajes is its own route) | yes (traveler by definition) |
| Capital Humano HSM (Laura Miranda) | Viajeros externos a tu cargo (KPIs) → Viajeros externos con pendientes (VIAJERO EXTERNO cell) → traveler sections | operational | yes, after role sections |
| Dirección de Hospital (Ricardo Fuentes) | Presupuesto · HSM Chihuahua → Solicitudes por autorizar (Destino filter, decision summary, two-line Detalle) → Hospedados actualmente · HSM Chihuahua → traveler sections | organizational (own hospital) | yes, after role sections |
| Dirección Corporativa (Mónica Herrera) | Presupuesto · Dirección Comercial y de Negocios («Ir a Monitor») → Solicitudes por autorizar → Colaboradores en viaje (+Asunto) → traveler sections | organizational (own dirección) | yes, after role sections |
| Capital Humano Corporativo (Alfredo Cacho) | **1** Presupuesto · Dirección de Capital Humano (concept dots + embedded micro-chart in PRE disponible, «Ir a Monitor») → **2** Casos escalados → **3** Solicitudes por autorizar → **4** Colaboradores en viaje → **5** Perfil de viajero → **6** Tu viaje → **7** Nueva solicitud | organizational (own dirección) + escalated cases | yes, positions 5–7 |
| DGA (Pedro Medina) | **1** Presupuesto · Dirección General Adjunta → **2** Perfil de viajero → **3** Tu viaje (Anticipo «No aplica») → Nueva solicitud → **4** Autorizaciones pendientes (KPIs + tray) | organizational (own dirección) + operational | yes, positions 2–3 |
| Hotelería HSM (Andrés Palma) | **1** Hospedaje HSM · ‹hospital› → **2** Indicadores de hospedaje (satisfacción · estancia promedio · rechazos en rojo) → **3** Solicitudes de hospedaje | operational (own hospital) | only if the person has a vigente profile (in the demo, by documented exception), always after |
| Hotelería Corporativo (Verónica Ibarra) | Encuestas de hospedaje (KPIs) → Bandeja de trabajo · Rechazadas por Hotelería HSM → Encuestas sin responder | operational | — (intentionally minimal Home) |
| Viáticos (Daniel Osorio) | Bandejas de trabajo (KPIs) → **Hotel externo y vuelos** (route Detalle, «Viaja en X días») → Comprobaciones por validar | operational | — |
| Contabilidad / Tesorería (Claudia Reyna) | Contabilización (KPIs) → Anticipos autorizados → Contabilizaciones pendientes (7 scenarios, signed amounts) | operational | — |
| Contraloría (Ma. Elena) | Gastos de representación (KPIs, **no budget KPI**) → Gastos de representación por autorizar (Asunto before Detalle) | operational | — |
| Admin / Seguridad TI (Sofía Delgado) | Configuración del portal (KPIs) → Actividad reciente en bitácora | operational | — |

## Budget rules on the Home
- Organizational block = Planeado · Ejercido · Comprometido · PRE disponible (PRE disponible = Planeado − Comprometido). The line under the utilization % reads «Planeado − Estimado» (rule 261).
- Utilization severity (rule 244): **0–70 % green · 71–84 % yellow · ≥ 85 % red**; red = red outline on the KPI card (rule 245). Severity lives in the block — no top banner restates it.
- «Sin presupuesto» (preview state): PRE disponible $0 · 100 % red; the traveler sees the blocking precondition next to Nueva solicitud.
- Collaborators never see organizational totals or percentages; their budget is a personal precondition (rule 75b).

## States (traveler preview)
Normal · Primera visita (empty journey) · Solicitud en proceso · Comprobación parcial / completa / Plazo vencido (shared journey + «Saldo pendiente por comprobar») · Sin perfil vigente · Sin presupuesto · Datos de SAP no disponibles (one yellow warning at the top; sections keep their layout).
