// JOURNEY PROGRESS — the ONE shared visual for a traveler's own trip status (client rule, US-01 review; US-02 final).
// Used by every Home that shows the user's OWN trip, whatever the functional role. Never duplicate this markup. Angular: JourneyProgressComponent.
// The four canonical stages are fixed and NEVER renumbered: Aprobación de viaje · Anticipo · Comprobación · Cierre.
// A stage that does not apply keeps its number and position with state 'na' («No aplica», gray) — Anticipo when the traveler profile is configured
// without anticipo (DGA) or perfil Director + group E/ED (navigation.js › anticipoApplies). Never shown as done or current.
// SALDO PENDIENTE POR COMPROBAR (rule 262): with Comprobación as the current stage of the user's OWN trip, the stage shows the balance as
// directly visible financial information (neutral ink, never a warning color by itself). saldo = { pending, proved, total } from
// traveler.json › comprobaciones[folio] (sujeto − comprobado). Never for companion trips, trays or KPIs.
// stages = [{ label, state: 'done' | 'current' | 'todo' | 'na', note }]  — styles: .journey* in src/styles/global.css + home.css
import { icon } from '../config/icons.js';
import { esc } from '../config/app-config.js';

const money = n => '$' + Number(n).toLocaleString('es-MX');

export function renderJourneyProgress(stages, saldo = null) {
  return `
<ol class="journey" aria-label="Etapas del viaje">
  ${stages.map((st, i) => `
  <li class="journey__step${st.state === 'done' ? ' is-done' : st.state === 'current' ? ' is-current' : st.state === 'na' ? ' is-na' : ''}"${st.state === 'current' ? ' aria-current="step"' : ''}>
    <span class="journey__marker">${st.state === 'done' ? icon('check', 18, { stroke: 3 }) : i + 1}</span>
    <span class="journey__body">
      <span class="journey__label">${esc(st.label)}</span>
      <span class="journey__note">${esc(st.note)}</span>
      ${i === 2 && st.state === 'current' && saldo ? `<span class="journey__saldo" role="group" aria-label="Saldo pendiente por comprobar"><span class="journey__saldo-k">Saldo pendiente por comprobar</span><span class="journey__saldo-v">${money(saldo.pending)}</span>${saldo.proved > 0 ? `<span class="journey__saldo-sub">Comprobado: ${money(saldo.proved)} de ${money(saldo.total)}</span>` : ''}</span>` : ''}
    </span>
  </li>`).join('')}
</ol>`;
}

// One calculation (rule 262): sujeto − comprobado, never negative. comp = comprobaciones[folio].
export function pendingToProve(comp) {
  if (!comp || comp.sujeto == null) return null;
  const proved = comp.comprobado || 0;
  return { pending: Math.max(0, comp.sujeto - proved), proved, total: comp.sujeto };
}
