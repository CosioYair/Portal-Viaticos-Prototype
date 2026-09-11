// HOME (Inicio) — feature screen shared by every role: own trip (travelers) → indicators → trays.
// Angular: HomeComponent (template = this file's HTML, styles = home.css, data = HomeService reading home.json).
import { icon } from '../../config/icons.js';
import { esc } from '../../config/app-config.js';
import { statusChip } from '../../layout/portal-layout.js';

const whoHeader = (role) => role === 'ADM' ? 'Usuario' : (role === 'HH' || role === 'CHH') ? 'Viajero' : 'Colaborador';

function tripCard(trip, user, statuses) {
  const stages = trip.stages ? `
  <ol class="stages">
    ${trip.stages.map((st, i, arr) => `
    <li class="stage${st.state === 'done' ? ' is-done' : st.state === 'current' ? ' is-current' : ''}">
      <div class="stage__line"><span class="stage__dot">${st.state === 'done' ? icon('check', 14, { stroke: 3 }) : i + 1}</span>${i < arr.length - 1 ? '<span class="stage__bar"></span>' : ''}</div>
      <div class="stage__body"><div class="stage__label">${esc(st.label)}</div><div class="stage__note">${esc(st.note)}</div></div>
    </li>`).join('')}
  </ol>` : '';
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
  ${stages}
  <div class="trip__foot">
    <div class="trip__next">${icon('arrowRight', 20)}<div><div class="eyebrow">Siguiente paso</div><div class="trip__next-text">${esc(trip.next)}</div></div></div>
    <button class="btn btn--trip" data-action="go" data-route="${trip.nextTarget}">${esc(trip.nextCta)}</button>
  </div>
</section>`;
}

function tray(t, user, statuses, narrow) {
  const rows = narrow ? `
  <div class="tcards">${t.rows.map(r => `
    <button class="tcard" data-action="go" data-route="${t.target}">
      <div class="tcard__top"><span class="tcard__folio">Folio ${esc(r.folio)}</span><span class="tcard__age">${esc(r.age)}</span></div>
      <div class="tcard__who">${esc(r.who)}</div><div class="tcard__area">${esc(r.area)}</div>
      <div class="tcard__meta">${esc(r.meta)}</div>
      ${statusChip(statuses[r.status])}
    </button>`).join('')}
  </div>` : `
  <div class="ttable" role="table">
    <div role="row" style="display:contents"><div class="ttable__h">Folio</div><div class="ttable__h">${whoHeader(user.role)}</div><div class="ttable__h">Detalle</div><div class="ttable__h">Estatus</div><div class="ttable__h">Antigüedad</div></div>
    ${t.rows.map(r => `
    <button class="ttable__row" role="row" data-action="go" data-route="${t.target}">
      <span class="ttable__c ttable__c--folio">${esc(r.folio)}</span>
      <span class="ttable__c ttable__c--who"><span class="who">${esc(r.who)}</span><span class="area">${esc(r.area)}</span></span>
      <span class="ttable__c ttable__c--meta">${esc(r.meta)}</span>
      <span class="ttable__c">${statusChip(statuses[r.status])}</span>
      <span class="ttable__c ttable__c--age"><span>${esc(r.age)}</span>${icon('chevronRight', 16)}</span>
    </button>`).join('')}
  </div>`;
  return `
<section class="card tray">
  <div class="tray__head">
    <h2 class="tray__title">${esc(t.title)}</h2><span class="tray__count">${t.count}</span><span class="tray__spacer"></span>
    <button class="btn btn--tertiary tray__cta" data-action="go" data-route="${t.target}">${esc(t.cta)} ›</button>
  </div>
  ${rows}
</section>`;
}

// home = homes[user.id] from data/home.json · statuses = statuses.json map · mode = desktop | narrow | mobile
export function renderHome(home, user, statuses, mode) {
  const narrow = mode !== 'desktop';
  return `
<div class="home">
  ${home.myTrip ? tripCard(home.myTrip, user, statuses) : ''}
  <section class="kpis" aria-label="Resumen">
    ${(home.kpis || []).map(k => `
    <div class="card kpi">
      <div class="kpi__label">${esc(k.label)}</div>
      <div class="kpi__row">${k.tone ? `<span class="kpi__dot tone-${k.tone}"></span>` : ''}<span class="kpi__value">${esc(k.value)}</span></div>
      ${k.hint ? `<div class="kpi__hint">${esc(k.hint)}</div>` : ''}
    </div>`).join('')}
  </section>
  ${(home.trays || []).map(t => tray(t, user, statuses, narrow)).join('')}
</div>`;
}
