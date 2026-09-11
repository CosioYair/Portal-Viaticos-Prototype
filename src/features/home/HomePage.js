// HOME (Inicio) — shared structure for every role: own trip (travelers) → indicators → trays.
// Receives the user's HOMES entry (data/home.js). Table rows ≥ 1180 px; card rows below.
import { icon } from '../../core/ui/icon.js';
import { esc, whoHeaderFor } from '../../utils/text.js';
import { statusChip, primaryButton } from '../../core/ui/fragments.js';

function TripCard({ trip, user, mode }) {
  const stages = trip.stages ? `
  <ol class="stages">
    ${trip.stages.map((st, i, arr) => `
    <li class="stage${st.state === 'done' ? ' is-done' : st.state === 'current' ? ' is-current' : ''}">
      <div class="stage__line">
        <span class="stage__dot">${st.state === 'done' ? icon('check', { size: 14, strokeWidth: 3 }) : i + 1}</span>
        ${i < arr.length - 1 ? '<span class="stage__bar"></span>' : ''}
      </div>
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
    ${statusChip(trip.status)}
  </div>
  ${stages}
  <div class="trip__foot">
    <div class="trip__next">${icon('arrowRight', { size: 20 })}<div><div class="eyebrow">Siguiente paso</div><div class="trip__next-text">${esc(trip.next)}</div></div></div>
    ${primaryButton(trip.nextCta, 'go', 'btn--trip', `data-route="${trip.nextTarget}"`)}
  </div>
</section>`;
}

function Kpis({ kpis }) {
  return `
<section class="kpis" aria-label="Resumen">
  ${kpis.map(k => `
  <div class="card kpi">
    <div class="kpi__label">${esc(k.label)}</div>
    <div class="kpi__row">${k.tone ? `<span class="kpi__dot tone-${k.tone}"></span>` : ''}<span class="kpi__value">${esc(k.value)}</span></div>
    ${k.hint ? `<div class="kpi__hint">${esc(k.hint)}</div>` : ''}
  </div>`).join('')}
</section>`;
}

function Tray({ tray, user, narrow }) {
  const who = whoHeaderFor(user.role);
  const rows = narrow ? `
  <div class="tcards">
    ${tray.rows.map(r => `
    <button class="tcard" data-action="go" data-route="${tray.target}">
      <div class="tcard__top"><span class="tcard__folio">Folio ${esc(r.folio)}</span><span class="tcard__age">${esc(r.age)}</span></div>
      <div class="tcard__who">${esc(r.who)}</div><div class="tcard__area">${esc(r.area)}</div>
      <div class="tcard__meta">${esc(r.meta)}</div>
      ${statusChip(r.status)}
    </button>`).join('')}
  </div>` : `
  <div class="ttable" role="table">
    <div role="row" style="display:contents">
      <div class="ttable__h">Folio</div><div class="ttable__h">${esc(who)}</div><div class="ttable__h">Detalle</div><div class="ttable__h">Estatus</div><div class="ttable__h">Antigüedad</div>
    </div>
    ${tray.rows.map(r => `
    <button class="ttable__row" role="row" data-action="go" data-route="${tray.target}">
      <span class="ttable__c ttable__c--folio">${esc(r.folio)}</span>
      <span class="ttable__c ttable__c--who"><span class="who">${esc(r.who)}</span><span class="area">${esc(r.area)}</span></span>
      <span class="ttable__c ttable__c--meta">${esc(r.meta)}</span>
      <span class="ttable__c">${statusChip(r.status)}</span>
      <span class="ttable__c ttable__c--age"><span>${esc(r.age)}</span>${icon('chevronRight', { size: 16 })}</span>
    </button>`).join('')}
  </div>`;
  return `
<section class="card tray">
  <div class="tray__head">
    <h2 class="tray__title">${esc(tray.title)}</h2>
    <span class="tray__count">${tray.count}</span>
    <span class="tray__spacer"></span>
    <button class="btn btn--tertiary tray__cta" data-action="go" data-route="${tray.target}">${esc(tray.cta)} ›</button>
  </div>
  ${rows}
</section>`;
}

export function HomePage({ home, user, mode }) {
  const narrow = mode !== 'desktop';
  return `
<div class="home">
  ${home.myTrip ? TripCard({ trip: home.myTrip, user, mode }) : ''}
  ${Kpis({ kpis: home.kpis || [] })}
  ${(home.trays || []).map(t => Tray({ tray: t, user, narrow })).join('')}
</div>`;
}
