// HOME (Inicio) — US-02 · APPROVED · CLOSED · FULLY SYNCED (2026-10-02). One screen shared by every role, composed from data.
// Angular: HomeComponent (template = this file's HTML, styles = home.css, data = HomeService reading home.json + people.json + traveler.json).
//
// WHAT DECIDES THE CONTENT (docs/HOME_VISIBILITY_MATRIX.md is the canonical per-role reference):
//   · functional role        → role sections: KPI blocks (home.summaries[]) and work trays (home.trays[])
//   · organizational scope   → summary.scope: personal (own figures) · operational (own work queue) · organizational (budget of the unit the role is responsible for)
//   · traveler capability    → traveler sections (Perfil de viajero · Tu viaje · Nueva solicitud) only with a vigente traveler profile; never escalates data access
//   · client-defined order   → home.order (rule 252/264/267): keys perfil · trip · nueva · sum<i> · tray<i>; keys not listed go after in base order;
//                              without home.order: KPIs → trays → traveler (base order). One mechanism (ordOf), no per-role screens.
// Global rules implemented here: budget severity (≤70 verde · 71–84 amarillo · ≥85 rojo, rule 244), severity lives in its KPI (no banner, 245),
// shared person cell (246), decision summary on authorization trays (247), two-line Detalle + Destino filter (248), Saldo pendiente por comprobar (262),
// CH CO concept dots + embedded micro-chart in PRE disponible (264/266), flight-route Detalle (255), status sub-line (259).
import { icon } from '../../config/icons.js';
import { esc } from '../../config/app-config.js';
import { statusChip } from '../../layout/portal-layout.js';
import { anticipoApplies } from '../../layout/navigation.js';
import { renderJourneyProgress, pendingToProve } from '../../shared/journey-progress.js';
import { applyListState, emptyListState, renderListToolbar, renderSortHeader, renderPager, DEFAULT_PAGE_SIZE } from '../../shared/data-list.js';

const money = n => '$' + Number(n).toLocaleString('es-MX');
const numOf = v => Number(String(v || '').replace(/[^\d.]/g, '')) || 0;
// GLOBAL BUDGET SEVERITY (rule 244) — one function for every budget indicator.
export const budgetTone = pct => pct >= 85 ? 'rojo' : pct > 70 ? 'amarillo' : 'verde';

// Tray column sets (docs/TABLE_LIST_STANDARD.md). Each column: [header, row field]. One meaning per column; tray.detalleMeaning states Detalle.
const COLUMNS = {
  personal:       [['Folio', 'folio'], ['Destino', 'destino'], ['Asunto', 'asunto'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  externos:       [['Folio', 'folio'], ['Viajero externo', 'who'], ['Destino', 'destino'], ['Asunto', 'asunto'], ['Detalle', 'detalle'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  standard:       [['Folio', 'folio'], ['Colaborador', 'who'], ['Destino', 'destino'], ['Asunto', 'asunto'], ['Detalle', 'detalle'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  operational:    [['Folio', 'folio'], ['Colaborador', 'who'], ['Detalle', 'meta'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  operationalOrg: [['Folio', 'folio'], ['Colaborador', 'who'], ['Detalle', 'meta'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  collabOrg:      [['Folio', 'folio'], ['Colaborador', 'who'], ['Destino', 'destino'], ['Detalle', 'meta'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  hosted:         [['Folio', 'folio'], ['Colaborador', 'who'], ['Entrada', 'entrada'], ['Salida', 'salida'], ['Estatus', 'status'], ['Habitación', 'age']],
  traveling:      [['Folio', 'folio'], ['Colaborador', 'who'], ['Destino', 'destino'], ['Asunto', 'asunto'], ['Fechas', 'fechas'], ['Estatus', 'status'], ['Regreso', 'age']],
  anticipos:      [['Folio', 'folio'], ['Colaborador', 'who'], ['Detalle', 'meta'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  repr:           [['Folio', 'folio'], ['Colaborador', 'who'], ['Asunto', 'asunto'], ['Detalle', 'meta'], ['Estatus', 'status'], ['Antigüedad', 'age']],
  bitacora:       [['Fecha y hora', 'age'], ['Folio', 'folio'], ['Usuario', 'usuario'], ['Área', 'area'], ['Perfil', 'perfil'], ['Acción', 'meta'], ['Resultado', 'status']]
};

// SHARED PERSON CELL (rule 246): name dominant + one «Label: value» line per datum. Internal collaborator = No. · Hospital · Perfil · Sociedad
// (people.json, canonical registry). External traveler = Hospital · Tipo · Registrado por (no employee data invented).
function personOf(r, people, externals) {
  if (r.personId && people[r.personId]) { const p = people[r.personId]; return { who: p.name, org: p.org, lines: [['No. ', p.employeeNumber], ['Hospital: ', p.org], ['Perfil: ', p.perfil], ['Sociedad: ', p.sociedad]] }; }
  if (r.extId && externals[r.extId]) { const x = externals[r.extId]; return { who: x.name, org: x.hospital, lines: [['Hospital: ', x.hospital], ['Tipo: ', x.tipo || 'Externo'], ['Registrado por: ', x.registradoPor]] }; }
  return null;
}
const personCell = p => `<span class="pcell"><span class="pcell__name">${esc(p.who)}</span>${p.lines.map(([k, v]) => `<span class="pcell__line"><span class="pcell__k">${esc(k)}</span>${esc(v)}</span>`).join('')}</span>`;

// Normalizes one tray row: person projection, two-line Detalle (rule 248), flight route (rule 255), search text over every visible value.
function prepRow(r, set, people, externals) {
  const p = personOf(r, people, externals);
  let row = { ...r, ...(p ? { who: p.who, org: p.org, person: p } : {}) };
  if (set === 'standard' && row.detalle && !row.detalleSub) {
    const m = String(row.detalle).match(/^Viaje (.+?) · (\$[\d,]+ est\.)(?: · (.+))?$/);
    if (m) row = { ...row, detalle: m[1] + ' · ' + m[2], detalleSub: m[3] || '', monto: numOf(m[2]) };
  }
  if (row.legs) row = { ...row, meta: 'Vuelos · ' + row.legs.map(l => l.join(' → ')).join(' | '), metaSub: row.fechaViaje ? 'Fecha de viaje: ' + row.fechaViaje : '', metaStrong: true };
  else if (row.servicio && row.meta) row = { ...row, meta: row.servicio + ' · ' + row.meta };
  row._search = [p ? p.lines.map(l => l[1]).join(' ') : '', row.detalleSub, row.metaSub, row.statusSub, row.servicio].filter(Boolean).join(' ');
  return row;
}

function cell(r, field, statuses) {
  if (field === 'status') return `<span class="scell">${statusChip(statuses[r.status])}${r.statusSub ? `<span class="scell__sub">${esc(r.statusSub)}</span>` : ''}</span>`;
  if (field === 'who') return r.person ? personCell(r.person) : `<span class="who">${esc(r.who)}</span><span class="area">${esc(r.area || '')}</span>`;
  if (field === 'usuario') return esc(r.who);
  if (field === 'detalle' || field === 'meta') {
    const sub = field === 'detalle' ? r.detalleSub : r.metaSub;
    return `<span class="dcell"><span class="dcell__l1${r.metaStrong && field === 'meta' ? ' is-strong' : ''}">${esc(r[field])}</span>${sub ? `<span class="dcell__l2">${esc(sub)}</span>` : ''}</span>`;
  }
  return esc(r[field]);
}

// Section help «?» (shared help pattern: descriptive text lives in the popover, never as a duplicated strip).
export const helpTip = (id, text) => `<details class="help" data-help="${id}"><summary aria-label="Ayuda">${icon('help', 16)}</summary><div class="help__pop" role="note">${esc(text)}</div></details>`;

// ---------- Traveler sections ----------
function perfilCard(user, traveler, profile) {
  const cats = profile ? [
    ['money', 'Anticipo', profile.anticipo, ''],
    ['bed', 'Hospedaje', profile.hospedaje, 'Habitación: ' + (profile.habitacion || []).join(' · ')],
    ['utensils', 'Alimentos', (profile.alimentos || []).join(' · '), ''],
    ['car', 'Transporte', (profile.transporte || []).join(' · '), ''],
    ['route', 'Autorización', user.hospital ? profile.cadenaHospital : profile.cadenaCorporativo, '']
  ] : [];
  const help = profile ? 'Resumen de las reglas principales del perfil de viajero vigente. El detalle completo se consulta en Perfil del viajero.'
    : 'Sin perfil de viajero vigente no se aplican reglas ni tarifas de viaje y no es posible crear solicitudes. La asignación del perfil la realiza Capital Humano o Admin / Seguridad TI.';
  return `
<section class="card perfil" data-section="perfil">
  <div class="perfil__head"><div><div class="perfil__eyebrow">Perfil de viajero ${helpTip('perfil', help)}</div><div class="perfil__name">${esc(profile ? profile.perfil : 'Sin perfil vigente')}</div></div></div>
  ${cats.length ? `<dl class="perfil__cats">${cats.map(([ic, t, v, sub]) => `
    <div class="perfil__cat"><div class="perfil__cat-head"><span class="perfil__ico" aria-hidden="true">${icon(ic, 20)}</span><dt>${esc(t)}</dt></div>
      <div><dd class="perfil__val">${esc(v)}</dd>${sub ? `<dd class="perfil__sub">${esc(sub)}</dd>` : ''}</div></div>`).join('')}</dl>` : ''}
  ${profile ? `<div class="perfil__actions"><button class="btn btn--secondary" data-action="go" data-route="perfil">Ver mi perfil de viajero</button><button class="btn btn--secondary" data-action="go" data-route="misviajes">Ver mis viajes</button></div>` : ''}
</section>`;
}

function tripCard(trip, user, statuses, traveler, profiles) {
  let stages = trip.stages;
  // Anticipo «No aplica» by profile configuration (rule 253) — also for trips whose data still carried another state.
  if (!anticipoApplies(user, profiles) && stages[1] && stages[1].state !== 'na') stages = stages.map((s, i) => i === 1 ? { ...s, state: 'na', note: 'No aplica' } : s);
  const own = !trip.isCompanion, compCur = own && stages[2] && stages[2].state === 'current';
  const saldo = compCur ? pendingToProve((traveler.comprobaciones || {})[trip.folio]) : null;
  return `
<section class="card card--pad" data-section="trip">
  <div class="trip__head">
    <div style="min-width:0">
      <div class="eyebrow">${user.role === 'COL' ? 'Tu viaje actual' : 'Tu viaje (como viajero)'}</div>
      <div class="trip__dest-row"><span class="trip__dest">${esc(trip.dest)}</span><span class="trip__folio">Folio <strong>${esc(trip.folio)}</strong></span></div>
      <div class="trip__meta">${esc([trip.dates, trip.nights, trip.motivo].filter(Boolean).join(' · '))}</div>
    </div>
    ${statusChip(statuses[trip.status])}
  </div>
  ${renderJourneyProgress(stages, saldo)}
  <div class="trip__foot">
    <div class="trip__next">${icon('arrowRight', 20)}<div><div class="eyebrow">Siguiente paso ${helpTip('next', trip.next)}</div>${trip.deadline ? `<div class="trip__deadline tone-${trip.deadline.severity === 'error' ? 'rojo' : 'amarillo'}">${esc(trip.deadline.text)}</div>` : ''}</div></div>
    <button class="btn btn--trip" data-action="go" data-route="${trip.nextTarget}">${esc(trip.nextCta)}</button>
  </div>
</section>`;
}

// Nueva solicitud: preconditions stay VISIBLE next to the disabled CTA (rule 76). Blocking: no vigente profile · no budget available.
function nuevaCard(user, profile, budget) {
  const block = !profile ? 'Sin perfil de viajero vigente no es posible crear solicitudes.' : budget && budget.suficiente === false ? 'La entidad presupuestal no tiene disponible para nuevas solicitudes. Se requiere un suplemento de presupuesto antes de continuar.' : '';
  return `
<section class="card card--pad nueva" data-section="nueva">
  <div class="nueva__row"><div class="eyebrow">Nueva solicitud de viaje ${helpTip('nueva', 'Para crear una solicitud se requiere perfil de viajero vigente y disponible presupuestal en la entidad correspondiente.')}</div>
  <button class="btn" data-action="go" data-route="creacion"${block ? ' disabled aria-disabled="true"' : ''}>Nueva solicitud de viaje</button></div>
  ${block ? `<div class="precond tone-rojo">${icon('xCircle', 16)}<span>${esc(block)}</span></div>` : ''}
</section>`;
}

// ---------- Role sections ----------
// Budget block decoration: severity on PRE disponible (% prominent, colored by budgetTone, red outline at red), CH CO concept dots + micro-chart.
function decorateSummary(sm, colors) {
  if (sm.scope !== 'organizational') return sm;
  const concept = lb => Object.keys(colors).find(c => lb === c || lb.indexOf(c + ' ') === 0);
  const bars = sm.chart ? sm.kpis.map(k => ({ c: concept(k.label), k })).filter(x => x.c).map(x => ({ label: x.k.label, value: x.k.value, n: numOf(x.k.value), color: colors[x.c] })) : [];
  const max = Math.max(1, ...bars.map(b => b.n));
  return { ...sm, kpis: sm.kpis.map(k => {
    const c = sm.conceptDots && concept(k.label);
    let out = { ...k, dot: c ? colors[c] : '' };
    if (k.label === 'PRE disponible') {
      const m = String(k.hint || '').match(/(\d+)\s*%/), pct = m ? +m[1] : null;
      if (pct != null) { const tn = budgetTone(pct); out = { ...out, pct, tone: tn, hint: 'Planeado − Estimado', red: tn === 'rojo', sevNote: tn === 'rojo' ? 'Utilización crítica: revisar el saldo antes de autorizar' : tn === 'amarillo' ? 'En riesgo: revisar el saldo antes de autorizar' : '' }; }
      if (bars.length > 1) out.micro = bars.map(b => ({ ...b, h: (b.n / max * 46).toFixed(1), short: Math.round(b.n / 1000) + 'k' }));
    }
    return out;
  }) };
}

function summary(sm, user, ord) {
  return `
<section class="summary" aria-label="${esc(sm.title)}" data-scope="${sm.scope}" style="order:${ord}">
  <div class="summary__head"><div class="eyebrow">${esc(sm.title)}</div>${sm.monitorCta ? `<button class="btn btn--secondary" data-action="go" data-route="pres-monitor">Ir a Monitor</button>` : ''}</div>
  <div class="kpis">
    ${sm.kpis.map(k => `
    <div class="card kpi${k.red ? ' kpi--red' : ''}${k.micro ? ' kpi--micro' : ''}">
      <div class="kpi__main">
        <div class="kpi__label">${k.dot ? `<span class="kpi__cdot" style="background:${k.dot}"></span>` : ''}${esc(k.label)}</div>
        <div class="kpi__row">${k.tone ? `<span class="kpi__dot tone-${k.tone}"></span>` : ''}<span class="kpi__value${k.valueTone && k.tone ? ` tone-${k.tone}` : ''}">${esc(k.value)}</span></div>
        ${k.pct != null ? `<div class="kpi__pct tone-${k.tone}"><span>${k.pct} %</span><small>utilizado</small></div>` : ''}
        ${k.hint ? `<div class="kpi__hint">${esc(k.hint)}</div>` : ''}
        ${k.sevNote ? `<div class="kpi__sev tone-${k.tone}">${icon(k.tone === 'rojo' ? 'xCircle' : 'warning', 16)}<span>${esc(k.sevNote)}</span></div>` : ''}
      </div>
      ${k.micro ? `<div class="kpi__micro" role="img" aria-label="${esc('Comparativo de conceptos: ' + k.micro.map(b => b.label + ' ' + b.value).join(', '))}">${k.micro.map(b => `<span class="kpi__bar" title="${esc(b.label + ' ' + b.value)}"><small>${b.short}</small><i style="height:${b.h}px;background:${b.color}"></i></span>`).join('')}</div>` : ''}
    </div>`).join('')}
  </div>
</section>`;
}

// One tray = title + count + CTA → decision summary (authorization trays) → toolbar → table (≥1180) or cards → pager.
function tray(t, key, listState, statuses, narrow, people, externals, ord) {
  const set = t.columns || 'operational';
  const cols = COLUMNS[set] || COLUMNS.operational;
  const rows = t.rows.map(r => prepRow(r, set, people, externals));
  const view = applyListState(rows, cols, listState, statuses, t.pageSize || DEFAULT_PAGE_SIZE);
  // DECISION SUMMARY (rule 247): people + estimated total of what is being authorized, over the FILTERED rows.
  let decision = '';
  if (set === 'standard' && rows.length && view.total) {
    const all = applyListState(rows, cols, { ...listState, page: 1 }, statuses, 9999).rows;
    const filtered = !!(listState.q || Object.values(listState.f).some(Boolean));
    const nP = new Set(all.map(r => r.personId || r.extId || r.who)).size;
    decision = `<div class="decision" role="group" aria-label="Resumen para autorizar">${filtered ? `<span><b>${all.length}</b> ${all.length === 1 ? 'solicitud' : 'solicitudes'}</span>` : ''}<span><b>${nP}</b> ${nP === 1 ? 'persona' : 'personas'}</span><span><b>${money(all.reduce((a, r) => a + (r.monto || 0), 0))}</b> estimado total</span><em>${filtered ? 'Según la búsqueda y los filtros aplicados' : 'Total de la bandeja'}</em></div>`;
  }
  const body = !t.rows.length ? `<p class="tray__empty">${esc(t.empty || 'Sin pendientes por ahora.')}</p>`
    : !view.total ? '<p class="tray__empty">Ningún registro coincide con la búsqueda o los filtros. Ajusta los criterios para ver resultados.</p>'
    : narrow ? `
  <div class="tcards">${view.rows.map(r => `
    <button class="tcard" data-action="go" data-route="${t.target}">
      <div class="tcard__top"><span class="tcard__folio">Folio ${esc(r.folio)}</span><span class="tcard__age">${esc(r.age)}</span></div>
      <div class="tcard__who">${r.person ? personCell(r.person) : esc(r.who || r.destino || '')}</div>
      ${cols.filter(([, f]) => !['folio', 'age', 'status', 'who'].includes(f)).map(([h, f]) => { const v = f === 'detalle' && r.detalleSub ? r.detalle + ' · ' + r.detalleSub : f === 'meta' && r.metaSub ? r.meta + ' · ' + r.metaSub : r[f]; return v ? `<div class="tcard__meta"><span class="tcard__k">${h}:</span> ${esc(v)}</div>` : ''; }).join('')}
      ${cell(r, 'status', statuses)}
    </button>`).join('')}
  </div>` : `
  <div class="ttable ttable--${set}" role="table">
    <div role="row" style="display:contents">${cols.map(([h, f]) => renderSortHeader(key, h, f, listState)).join('')}</div>
    ${view.rows.map(r => `
    <button class="ttable__row" role="row" data-action="go" data-route="${t.target}">
      ${cols.map(([, f], i) => `<span class="ttable__c ttable__c--${f}">${cell(r, f, statuses)}${i === cols.length - 1 ? icon('chevronRight', 16) : ''}</span>`).join('')}
    </button>`).join('')}
  </div>`;
  return `
<section class="card tray" data-tray="1" style="order:${ord}">
  <div class="tray__head">
    <h2 class="tray__title">${esc(t.title)}</h2><span class="tray__count">${t.count}</span><span class="tray__spacer"></span>
    <button class="btn btn--tertiary tray__cta" data-action="go" data-route="${t.target}">${esc(t.cta)} ›</button>
  </div>
  ${decision}
  ${rows.length ? renderListToolbar(key, t.title, rows, cols, t.filters, listState, statuses, view) : ''}
  ${body}
  ${rows.length ? renderPager(key, view) : ''}
</section>`;
}

// home = homes[user.id] · statuses = statuses.json map · mode = desktop | narrow | mobile · lists = per-tray list state
// people / externals = people.json · traveler = traveler.json · travelerCapable = isTraveler(user)
export function renderHome(home, user, statuses, mode, lists = {}, ctx = {}) {
  const { people = {}, externals = {}, traveler = {}, travelerCapable = false } = ctx;
  const narrow = mode !== 'desktop';
  const ordList = home.order || null;
  const ordOf = (key, def) => { if (!ordList) return def; const i = ordList.indexOf(key); return i >= 0 ? i + 1 : 100 + def; };
  const hosp = s => String(s || '').split('{hospital}').join(user.hospital || 'Corporativo');
  const colors = traveler.budgetConceptColors || {};
  const blocks = (home.summaries || (home.summary ? [home.summary] : [])).filter(sm => !(travelerCapable && sm.scope === 'personal'));
  const perfil = (traveler.assignments || {})[user.id] || (user.perfil && user.perfil.label) || null;
  const profile = perfil ? (traveler.profiles || []).find(p => p.perfil === perfil) || null : null;
  const budget = (traveler.budget || {})[user.id];
  const tv = travelerCapable ? `
  <div style="order:${ordOf('perfil', 30)}">${perfilCard(user, traveler, profile)}</div>
  ${home.myTrip ? `<div style="order:${ordOf('trip', 31)}">${tripCard(home.myTrip, user, statuses, traveler, traveler.profiles || [])}</div>` : ''}
  <div style="order:${ordOf('nueva', 32)}">${nuevaCard(user, profile, budget)}</div>` : '';
  return `
<div class="home">
  ${blocks.map((sm, i) => summary(decorateSummary({ ...sm, title: hosp(sm.title) }, colors), user, ordOf('sum' + i, 10 + i))).join('')}
  ${(home.trays || []).map((t, i) => (travelerCapable && t.columns === 'personal') ? '' : (() => { const key = `${user.id}:${i}`; return tray({ ...t, title: hosp(t.title) }, key, lists[key] || emptyListState(), statuses, narrow, people, externals, ordOf('tray' + i, 20 + i)); })()).join('')}
  <!-- personal trays (Mis viajes) are not shown on a traveler Home: Mis viajes lives in its own route (rule 104) -->
  ${tv}
</div>`;
}
