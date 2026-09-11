// DEMO ONLY — NOT PART OF THE PRODUCTION PORTAL.
// MODO DEMO strip (simulated-user switcher), fixed «Modo demo» tag, prototype persistence, simulated loading delay.
// Removing this folder + the 3 marked lines in portal-layout.js + styles/demo.css leaves the production UI intact.
import { icon } from '../config/icons.js';
import { esc } from '../config/app-config.js';
import { isTraveler } from '../layout/navigation.js';

const STORAGE_KEY = 'smv-demo-user';       // remembers the last simulated user
export const DEMO_LOADING_MS = 1000;        // skeleton time on start / user switch
export const DEV_TOOLS = new URLSearchParams(location.search).get('dev') === '1'; // ?dev=1 → extra shortcuts

export function loadDemoUserId(users, fallback) {
  try { const id = localStorage.getItem(STORAGE_KEY); return users.some(u => u.id === id) ? id : fallback; } catch { return fallback; }
}
export function saveDemoUserId(id) { try { localStorage.setItem(STORAGE_KEY, id); } catch { /* storage unavailable */ } }

export function renderDemoBar(users, user) {
  const travelerLine = isTraveler(user) ? `Viajero: sí · ${user.perfil ? `Nivel ${user.perfil.nivel} · ${user.perfil.nombre}` : ''}` : 'Viajero: no';
  return `
<div class="demo-bar">
  <span class="demo-bar__tag">${icon('info', 12)}Modo demo · Solo prototipo</span>
  <label class="demo-bar__field"><span class="demo-bar__label">Usuario simulado</span>
    <select class="demo-bar__select" data-action="demo:user">
      ${users.map(u => `<option value="${u.id}"${u.id === user.id ? ' selected' : ''}>${esc(`${u.name} — ${u.roleLabel}${u.traveler ? ' · viajero' : ''}`)}</option>`).join('')}
    </select>
  </label>
  <span class="demo-bar__info">${esc(travelerLine)}</span>
  <span class="demo-bar__spacer"></span>
  ${DEV_TOOLS ? '<button class="demo-bar__link" data-action="go" data-route="denied">Probar sección sin permiso</button>' : ''}
</div>`;
}
export const renderDemoTag = () => '<div class="demo-tag">Modo demo</div>';
