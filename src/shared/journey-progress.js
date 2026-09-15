// JOURNEY PROGRESS — the ONE shared visual for a traveler's own trip status (client rule, US-01 review).
// Used by every Home that shows the user's own trip (Colaborador, DGA, Capital Humano HSM, Dirección, Viáticos… as travelers).
// Never duplicate this markup in a role Home. Angular: JourneyProgressComponent (@Input() stages).
// The four canonical stages are fixed and NEVER renumbered: Aprobación de viaje · Anticipo · Comprobación · Cierre (Hospedaje/Vuelo are sub-statuses, not stages).
// A stage that does not apply to the traveler (e.g. Anticipo for the DGA profile) keeps its number and position with state 'na' («No aplica»): filled gray, number visible.
// stages = [{ label, state: 'done' | 'current' | 'todo' | 'na', note }]  — styles: .journey* in src/styles/global.css
import { icon } from '../config/icons.js';
import { esc } from '../config/app-config.js';

export function renderJourneyProgress(stages) {
  return `
<ol class="journey" aria-label="Etapas del viaje">
  ${stages.map((st, i) => `
  <li class="journey__step${st.state === 'done' ? ' is-done' : st.state === 'current' ? ' is-current' : st.state === 'na' ? ' is-na' : ''}"${st.state === 'current' ? ' aria-current="step"' : ''}>
    <span class="journey__marker">${st.state === 'done' ? icon('check', 18, { stroke: 3 }) : i + 1}</span>
    <span class="journey__body">
      <span class="journey__label">${esc(st.label)}</span>
      <span class="journey__note">${esc(st.note)}</span>
    </span>
  </li>`).join('')}
</ol>`;
}
