// MIS VIAJES (US-10, APPROVED · CLOSED 2026-10-08) — pure rules; list + detail UI live in prototype/Portal Viaticos.dc.html (mvTrips · mvRender · journey · journeyCta · buildList).
// Angular: MyTripsModule (TripsList · TripDetail · shared JourneyComponent) + TripsService over the same TravelRequestService.
const toKey = s => { const [d, m, y] = String(s || '').split('/'); return y ? y + '-' + m + '-' + d : ''; };
const norm = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// A view, never a store (rule 317): one folio = one row = the same canonical record; session request wins by folio; empty captures are not listed.
export function composeTrips(uid, { requests = [], history = [], isEmptyDraft = () => false }) {
  const byFolio = new Map();
  requests.forEach(r => { if (r.uid === uid && !(r.status === 'captura' && isEmptyDraft(r))) byFolio.set(r.folio, { ...r, part: r.rolGrupo === 'acompanante' ? 'acomp' : 'propia' }); });
  history.forEach(h => { if (!byFolio.has(h.folio)) byFolio.set(h.folio, { ...h, part: 'propia' }); });
  return [...byFolio.values()];
}
// Balance only for En proceso / Finalizado (rule 318).
export const saldoApplies = status => status === 'proceso' || status === 'finalizado';
// Search: folio, destination, route, project, invoice UUID (accent/case-insensitive).
export const matches = (t, q) => !q || [t.folio, t.destino, t.ruta, t.proyecto, ...(t.uuids || [])].some(v => norm(v).includes(norm(q)));
export const sortKey = (t, col) => col === 'fechas' ? toKey(t.inicio) : col === 'monto' ? Number(t.monto) || 0 : norm(t[col]);
export const initialSort = { col: 'fechas', dir: 'desc' };
// Turn action per status (rule 320/354): one CTA.
export function turnAction(status, { isComp, anticipoApplies }) {
  if (status === 'captura') return isComp ? ['Enviar mi solicitud', 'Rechazar participación'] : ['Continuar solicitud'];
  if (status === 'aprobada') return anticipoApplies ? ['Ir a Anticipo'] : [];
  if (status === 'proceso') return ['Ir a Comprobación'];
  return [];
}
export const canCancel = status => status === 'pendiente' || status === 'aprobada';
// Comprobación deadline: 7 business days to start + 7 to finish from trip end (rule 319).
export function addBusinessDays(date, n) { const d = new Date(date); while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n--; } return d; }
