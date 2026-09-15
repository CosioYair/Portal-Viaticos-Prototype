// HOME (Inicio) — feature screen shared by every role: own trip (travelers) → summary indicators → trays.
// Angular: HomeComponent (template = this file's HTML, styles = home.css, data = HomeService reading home.json).
//
// HOME IS ROLE- AND SCOPE-AWARE (client rule, US-01 review). What a user sees depends on:
//   · traveler capability  → myTrip card with the shared JourneyProgress (own trip only)
//   · home.summary.scope   → "personal"       = the user's OWN travel figures (Colaborador and any plain traveler): Comprometido · En tránsito ·
//                                               Gasto acumulado · Uso de presupuesto asignado (own assigned budget). NEVER Dirección totals or %.
//                            "operational"    = the user's OWN work queue (Hotelería, Viáticos, Contabilidad, CH HSM, CH CO, DGA, Admin)
//                            "organizational" = budget / totals of the unit the role is RESPONSIBLE for
//                                               (only roles with Presupuesto › Monitor in the menu: Dirección, Contraloría …)
//   Traveler capability never escalates scope: a traveler-capable operational user gets own trip + own operational queue only.
//   The scope is data (home.json), not code: development maps it to the real permission of the role. Reference: docs/HOME_VISIBILITY_MATRIX.md
import { icon } from '../../config/icons.js';
import { esc } from '../../config/app-config.js';
import { statusChip } from '../../layout/portal-layout.js';
import { renderJourneyProgress } from '../../shared/journey-progress.js';
import { applyListState, emptyListState, renderListToolbar, renderSortHeader, renderPager, DEFAULT_PAGE_SIZE } from '../../shared/data-list.js';

// Tray column sets (client rules V1 + V2 — docs/TABLE_LIST_STANDARD.md). Each column: [header, row field]. Angular: one TrayComponent with @Input() columns.
// The SAME column means the SAME thing for every row of a table; tray.detalleMeaning (home.json) states what Detalle holds in that table.
//   personal       = the user's OWN trips (Mis viajes) — no organizational column
//   externos       = CH HSM external travelers (Detalle ALWAYS with dates)
//   standard       = Dirección / CH CO request lists: Folio · Colaborador / Viajero (+ org · área · perfil sub-line) · Destino · Asunto · Detalle (dates · amount · request/escalation context) · Estatus · Antigüedad
//   operational    = plain work queue
//   operationalOrg = consolidated work queues (Hotelería, Viáticos, Contabilidad, Contraloría, DGA…): + «Hospital / Corporativo» column (row.org)
//   hosted         = guests currently staying at the Director's hospital: Folio · Colaborador / Viajero · Hospital / Corporativo (origin) · Entrada · Salida · Estatus · Habitación
//   traveling      = collaborators of the user's OWN organizational scope currently traveling: Folio · Colaborador / Viajero · Hospital / Corporativo · Destino · Fechas · Estatus · Regreso
//   bitacora       = Admin audit log: Fecha y hora · Folio («—» when none) · Usuario · Área · Perfil (approved vocabulary, never «Nivel») · Acción · Resultado
const COLUMNS = {
  personal:       [['Folio', 'folio'], ['Destino', 'destino'], ['Asunto', 'asunto'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  externos:       [['Folio', 'folio'], ['Viajero', 'viajero'], ['Destino', 'destino'], ['Asunto', 'asunto'], ['Detalle', 'detalle'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  standard:       [['Folio', 'folio'], ['Colaborador / Viajero', 'who'], ['Destino', 'destino'], ['Asunto', 'asunto'], ['Detalle', 'detalle'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  operational:    [['Folio', 'folio'], ['Responsable', 'who'], ['Detalle', 'meta'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  operationalOrg: [['Folio', 'folio'], ['Responsable', 'who'], ['Hospital / Corporativo', 'org'], ['Detalle', 'meta'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  hosted:         [['Folio', 'folio'], ['Colaborador / Viajero', 'who'], ['Hospital / Corporativo', 'org'], ['Entrada', 'entrada'], ['Salida', 'salida'], ['Estatus', 'status'], ['Habitación', 'age']],
  traveling:      [['Folio', 'folio'], ['Colaborador / Viajero', 'who'], ['Hospital / Corporativo', 'org'], ['Destino', 'destino'], ['Fechas', 'fechas'], ['Estatus', 'status'], ['Regreso', 'age']],
  bitacora:       [['Fecha y hora', 'age'], ['Folio', 'folio'], ['Usuario', 'usuario'], ['Área', 'area'], ['Perfil', 'perfil'], ['Acción', 'meta'], ['Resultado', 'status']]
};
const whoHeader = (role) => role === 'ADM' ? 'Usuario' : (role === 'HH' || role === 'CHH') ? 'Viajero' : 'Colaborador';
const cell = (r, field, statuses) => field === 'status' ? statusChip(statuses[r.status]) : field === 'who' ? `<span class="who">${esc(r.who)}</span><span class="area">${esc(r.area)}</span>` : field === 'usuario' ? esc(r.who) : esc(r[field]);

function tripCard(trip, user, statuses) {
  return `
<section class="card card--pad">
  <div class="trip__head">
    <div style="min-width:0">
      <div class="eyebrow">${user.role === 'COL' ? 'Tu viaje actual' : 'Tu viaje (como viajero)'}</div>
      <div class="trip__dest-row"><span class="trip__dest">${esc(trip.dest)}</span><span class="trip__folio">Folio <strong>${esc(trip.folio)}</strong></span></div>
      <div class="trip__meta">${esc(trip.dates)} · ${esc(trip.nights)} · ${esc(trip.motivo)}</div>
    </div>
    ${statusChip(statuses[trip.status])}
  </div>
  ${renderJourneyProgress(trip.stages)}
  <div class="trip__foot">
    <div class="trip__next">${icon('arrowRight', 20)}<div><div class="eyebrow">Siguiente paso</div><div class="trip__next-text">${esc(trip.next)}</div></div></div>
    <button class="btn btn--trip" data-action="go" data-route="${trip.nextTarget}">${esc(trip.nextCta)}</button>
  </div>
</section>`;
}

// One KPI block. A Home may declare several (home.summaries[]) — e.g. CH CO: own dirección budget (organizational) + escalated cases (operational). Each block carries its own scope.
// kpi.valueTone → the VALUE takes the tone color (client: «Nivel de rechazos» percentage in red; semantic color, no threshold rule).
function summary(sm) {
  return `
<section class="summary" aria-label="${esc(sm.title)}" data-scope="${sm.scope}">
  <div class="eyebrow">${esc(sm.title)}</div>
  <div class="kpis">
    ${sm.kpis.map(k => `
    <div class="card kpi">
      <div class="kpi__label">${esc(k.label)}</div>
      <div class="kpi__row">${k.tone ? `<span class="kpi__dot tone-${k.tone}"></span>` : ''}<span class="kpi__value${k.valueTone && k.tone ? ` tone-${k.tone}` : ''}">${esc(k.value)}</span></div>
      ${k.hint ? `<div class="kpi__hint">${esc(k.hint)}</div>` : ''}
    </div>`).join('')}
  </div>
</section>`;
}

// One tray = title + count + CTA → list toolbar (search + contextual filters) → table (≥1180, sortable headers) or cards → pager.
// key identifies the tray's list state in the shell (state.lists[key]); the pipeline is src/shared/data-list.js.
function tray(t, key, listState, user, statuses, narrow) {
  const set = t.columns || 'operational';
  const cols = COLUMNS[set].map(([h, field]) => [field === 'who' && set !== 'standard' ? whoHeader(user.role) : h, field]);
  const lead = cols.find(([, fld]) => fld === 'viajero' || fld === 'destino' || fld === 'who' || fld === 'usuario')[1];   // main line on cards
  const view = applyListState(t.rows, cols, listState, statuses, t.pageSize || DEFAULT_PAGE_SIZE);
  const body = !t.rows.length ? `<p class="tray__empty">${esc(t.empty || 'Sin pendientes por ahora.')}</p>`
    : !view.total ? '<p class="tray__empty">Ningún registro coincide con la búsqueda o los filtros. Ajusta los criterios para ver resultados.</p>'
    : narrow ? `
  <div class="tcards">${view.rows.map(r => `
    <button class="tcard" data-action="go" data-route="${t.target}">
      <div class="tcard__top"><span class="tcard__folio">${set === 'bitacora' ? esc(r.age) : `Folio ${esc(r.folio)}`}</span><span class="tcard__age">${set === 'bitacora' ? (r.folio && r.folio !== '—' ? `Folio ${esc(r.folio)}` : '') : esc(r.age)}</span></div>
      <div class="tcard__who">${esc(r[lead === 'usuario' ? 'who' : lead])}</div>
      ${cols.filter(([, fld]) => !['folio', 'age', 'status', lead].includes(fld)).map(([h, fld]) => { const v = fld === 'who' ? r.area : r[fld]; return v ? `<div class="tcard__meta"><span class="tcard__k">${h}:</span> ${esc(v)}</div>` : ''; }).join('')}
      ${statusChip(statuses[r.status])}
    </button>`).join('')}
  </div>` : `
  <div class="ttable ttable--${set}" role="table">
    <div role="row" style="display:contents">${cols.map(([h, fld]) => renderSortHeader(key, h, fld, listState)).join('')}</div>
    ${view.rows.map(r => `
    <button class="ttable__row" role="row" data-action="go" data-route="${t.target}">
      ${cols.map(([, fld], i) => `<span class="ttable__c ttable__c--${fld}">${cell(r, fld, statuses)}${i === cols.length - 1 ? icon('chevronRight', 16) : ''}</span>`).join('')}
    </button>`).join('')}
  </div>`;
  return `
<section class="card tray">
  <div class="tray__head">
    <h2 class="tray__title">${esc(t.title)}</h2><span class="tray__count">${t.count}</span><span class="tray__spacer"></span>
    <button class="btn btn--tertiary tray__cta" data-action="go" data-route="${t.target}">${esc(t.cta)} ›</button>
  </div>
  ${t.rows.length ? renderListToolbar(key, t.title, t.rows, cols, t.filters, listState, statuses, view) : ''}
  ${body}
  ${t.rows.length ? renderPager(key, view) : ''}
</section>`;
}

// home = homes[user.id] from data/home.json · statuses = statuses.json map · mode = desktop | narrow | mobile · lists = state.lists (per-tray list state, key = userId:index)
// Order: own trip (MOST RECENT request only — others in Mis viajes) → summary block(s) → trays. A traveler-capable operational
// user whose trays are all empty (e.g. CH HSM without external pendings) therefore sees their own traveler context predominate.
export function renderHome(home, user, statuses, mode, lists = {}) {
  const narrow = mode !== 'desktop';
  const blocks = home.summaries || (home.summary ? [home.summary] : []);
  return `
<div class="home">
  ${home.myTrip ? tripCard(home.myTrip, user, statuses) : ''}
  ${blocks.map(summary).join('')}
  ${(home.trays || []).map((t, i) => { const key = `${user.id}:${i}`; return tray(t, key, lists[key] || emptyListState(), user, statuses, narrow); }).join('')}
</div>`;
}
