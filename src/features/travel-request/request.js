// CREACIÓN DE SOLICITUD DE VIAJE (US-08, APPROVED · CLOSED 2026-10-08) — pure rules; interactive form, panel, confirmation and success live in prototype/Portal Viaticos.dc.html (svRender · svEval · svNormalize · svChain · svSubmit · svCancel).
// Angular: TravelRequestModule (RequestForm · SegmentEditor · EstimatePanel · ConfirmSubmit) + TravelRequestService.
export const MAX_DEST = 3, OTROS_GASTOS_DIAS_MIN = 7, CUENTA_ALT_DIGITOS = 18, TIPOS_TARJETA = ['VISA', 'MC', 'AMEX'];
const toD = s => { const [d, m, y] = String(s || '').split('/').map(Number); return d && m && y ? new Date(y, m - 1, d) : null; };
const days = (a, b) => Math.round((toD(b) - toD(a)) / 864e5);

// Preconditions (rule 76): blocking vs informative.
export function gate({ perfilVigente, admiteSolicitudes, enCaptura, sapOk }) {
  if (!perfilVigente) return { ok: false, block: 'sinPerfil' };
  if (!admiteSolicitudes) return { ok: false, block: 'sinPresupuesto' };
  return { ok: true, info: [enCaptura && 'solicitudEnCaptura', !sapOk && 'sapNoRecuperado'].filter(Boolean) };
}
// Derived lodging (rule 269).
export const hospedaje = (perfil, seg) => seg.tipo === 'otro' ? 'hotel' : (['Director', 'Ejecutivo'].includes(perfil) ? 'hotel' : 'hospital');
// Trip dates and nights from ordered segments (rule 268).
export function tripSpan(segs) { const a = segs[0] && segs[0].inicio, b = segs.length && segs[segs.length - 1].fin; return a && b ? { inicio: a, fin: b, dias: days(a, b) + 1, noches: days(a, b) } : null; }
export function chronological(segs) { for (let i = 1; i < segs.length; i++) if (toD(segs[i].inicio) < toD(segs[i - 1].fin)) return false; return true; }
// Single normalization (rules 288, 289, 295, 301, 302, 362): hidden conditional fields never keep a value.
export function normalize(form) {
  const f = { ...form, destinos: (form.destinos || []).map(d => ({ ...d, horaVuelo: d.medio === 'Avión' ? d.horaVuelo : '', auto: d.medio === 'Auto particular' ? d.auto : null })) };
  if (f.motivo !== 'Proyecto') f.proyecto = '';
  const span = tripSpan(f.destinos); if (!span || span.dias <= OTROS_GASTOS_DIAS_MIN) f.otrosGastos = {};
  const hotel = f.destinos.some(d => d.hospedaje === 'hotel'); if (!hotel) f.pago = { aplica: false };
  else if (f.pago && f.pago.tipo !== 'alternativa') f.pago = { ...f.pago, alternativa: null };
  return f;
}
// Meals: only external meals count; daily cap by number of external meals (never summing caps) (rules 271, 299).
export const mealCost = (comidasExternas, dias, topes) => comidasExternas > 0 ? (topes[comidasExternas - 1] || 0) * dias : 0;
// Estimate = maximum effective tariffs of applicable concepts only (rules 294, 389). Flight is reference only.
export function estimate(items) { return items.filter(i => i.aplica && i.concepto !== 'Vuelo').reduce((s, i) => s + (i.importe || 0), 0); }
// Budget validation at send: estimate + own pending ≤ PRE disponible (rule 277).
export const budgetOk = (estimado, pendAprob, preDisponible) => estimado + pendAprob <= preDisponible;
// Alternative card (rules 297, 298): never CVV/NIP; reads always masked.
export const validCuentaAlt = v => new RegExp('^\\d{' + CUENTA_ALT_DIGITOS + '}$').test(String(v || ''));
export const mask = v => v ? '•••• ' + String(v).slice(-4) : '';
// 24 h time (rule 302): "0830" → "08:30".
export const timeFmt = v => { const d = String(v || '').replace(/\D/g, '').slice(0, 4); return d.length === 4 ? d.slice(0, 2) + ':' + d.slice(2) : v; };
export const timeOk = v => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
