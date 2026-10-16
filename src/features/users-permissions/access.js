// USUARIOS Y PERMISOS / BITÁCORA (US-25 en el backlog actual; histórico US-26) — APPROVED · CLOSED 2026-10-09.
// Reglas puras; la UI (lista, ficha, editar asignaciones, hospitales que atiende, ajustar permisos, matriz, configuración por rol,
// composición del Inicio, bitácora) vive en prototype/Portal Viaticos.dc.html (u26Render · resolveAccess · homeBlocks* · hospText).
// Angular: UsersPermissionsModule + AuditModule con un único AccessResolverService.
const toKey = s => { const [d, m, y] = String(s || '').split('/'); return y ? y + m + d : ''; };

// Vigencia obligatoria; estado derivado de fechas + revocación.
export function tempStatus(rec, today) {
  if (rec.revoked) return 'Revocado';
  const t = toKey(today), f = toKey(rec.from), e = toKey(rec.to);
  return t < f ? 'Programado' : t > e ? 'Vencido' : 'Vigente';
}
export function rangeError(from, to) {
  if (!from || !to) return 'Indica fecha de inicio y fecha de fin: ninguna asignación ni ajuste manual puede quedar sin vigencia';
  if (toKey(to) <= toKey(from)) return 'La fecha fin debe ser posterior a la fecha inicio';
  return '';
}
export const overlaps = (a, b) => toKey(a.from) <= toKey(b.to) && toKey(b.from) <= toKey(a.to);

// Resolver único: matriz base del rol vigente + ajustes vigentes por OPCIÓN; la revocación gana.
// Las opciones V / V+PF exigen capacidad de viajero (perfil de viajero vigente) y ningún ajuste la salta.
export function resolveAccess({ roles, overrides, travelerCap, profileOk }, option, action, baseOf, today) {
  const live = roles.filter(r => tempStatus(r, today) === 'Vigente');
  const ov = overrides.filter(o => o.option === option.id && o.action === action && tempStatus(o, today) === 'Vigente');
  if (option.travelerGate && !travelerCap) return 'needTrav';
  if (option.profileGate && !profileOk) return 'needProfile';
  if (ov.some(o => o.sense === 'quitar')) return 'revocado';
  const cells = live.map(r => baseOf(r.code, option.id, action));
  if (cells.includes('✓')) return 'default';
  if (cells.includes('L')) return 'readonly';
  if (ov.some(o => o.sense === 'agregar')) return 'manual';
  return cells.includes('P') ? 'adjustReq' : 'none';
}
// Elegibilidad de ajustes: «agregar» solo lo que no tiene; «quitar» solo lo que tiene.
export const addable = s => s === 'none' || s === 'adjustReq';
export const removable = s => ['default', 'byExc', 'readonly', 'manual', 'manualExc'].includes(s);

// HOSPITALES QUE ATIENDE: ids de Cat. Hospital (idhospital SAP). El filtrado por hospital está PENDIENTE de definición.
export function hospText(ids, catalog) {
  const l = (ids || []).map(id => (catalog.find(h => h.id === id) || {}).nombre).filter(Boolean);
  if (!l.length) return 'Sin hospitales asignados';
  if (l.length === catalog.length) return 'Todos los hospitales (' + l.length + ')';
  return l.length > 3 ? l.slice(0, 3).join(' · ') + ' y ' + (l.length - 3) + ' más' : l.join(' · ');
}
export const searchHospitals = (catalog, q) => { const n = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); const k = n(q); return catalog.filter(h => !k || n(h.nombre).includes(k) || h.id.includes(k)); };

// COMPOSICIÓN DEL INICIO: bloques resumen / bandeja / viajero (este último siempre presente, no se quita; solo se ve con perfil vigente).
export function validateHomeBlocks(blocks) {
  const errs = [];
  blocks.forEach((b, i) => {
    if (b.type === 'resumen' && (!String(b.title || '').trim() || !(b.kpis || []).length)) errs.push({ i, msg: 'El resumen necesita título y al menos un indicador' });
    if (b.type === 'bandeja' && !String(b.title || '').trim()) errs.push({ i, msg: 'La bandeja necesita título' });
  });
  if (!blocks.some(b => b.type === 'viajero')) errs.push({ i: -1, msg: 'El bloque del viajero no se puede quitar' });
  return errs;
}
// Bitácora: rango obligatorio; > 90 días = aviso, nunca bloqueo.
export function auditRange(from, to) { if (!from || !to) return { ok: false, warn: false }; const d = (new Date(toKey(to).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) - new Date(toKey(from).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))) / 864e5; return { ok: d >= 0, warn: d > 90 }; }
