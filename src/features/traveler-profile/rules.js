// TRAVELER-PROFILE RULES — pure functions (no DOM). One resolver shared by Home, Mi perfil de viajero, Creación and the estimate.
// Source model: src/data/traveler-profiles.json (prototype: usperfil-data.js › SMV_PERFIL). Angular: TravelerRulesService.
// Dates are dd/mm/aaaa (approved display format); 31/12/9999 = «sin fecha de cierre».

export const toDate = s => { const m = String(s || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; };
export const money = n => '$' + Number(n).toLocaleString('es-MX', { maximumFractionDigits: 2 });

// Single validity formatter (rule 140): «Desde dd/mm/aaaa hasta dd/mm/aaaa» · open end → «sin fecha de cierre».
export function vigText(from, to, cap = false) {
  const d = cap ? 'Desde' : 'desde';
  if (!to || to === '31/12/9999') return `${d} ${from} · sin fecha de cierre`;
  return `${d} ${from} hasta ${to}`;
}

// Status derived from dates + revocation (never captured): Programado · Vigente · Vencido · Revocado.
export function tempStatus(rec, today) {
  if (rec.revoked) return 'Revocado';
  const t = toDate(today), f = toDate(rec.from), e = toDate(rec.to);
  if (f && t < f) return 'Programado';
  if (e && t > e) return 'Vencido';
  return 'Vigente';
}
// Catalog record state: future validity shows as «Futura».
export const profileState = (p, today) => { const s = tempStatus(p, today); return s === 'Programado' ? 'Futura' : s === 'Vencido' ? 'Vencida' : 'Vigente'; };

export function rangeError(from, to) { const f = toDate(from), t = toDate(to); return !f || !t || t < f; }
export function overlaps(a, b) {
  const af = toDate(a.from), at = toDate(a.to || '31/12/9999'), bf = toDate(b.from), bt = toDate(b.to || '31/12/9999');
  return !!(af && at && bf && bt) && af <= bt && bf <= at;
}

// Effective tariff of a concept for a profile (or «Viajero externo»): value + its own validity. null = «Sin tarifa».
export function tariff(model, cid, perfil, overrides = {}) {
  const c = model.concepts.find(x => x.id === cid) || {};
  const over = overrides[cid + '|' + perfil];
  const raw = over ? (over.tiers || over.importe) : (model.tariffs[cid] || {})[perfil];
  if (raw == null) return null;
  const tiers = Array.isArray(raw) ? raw : null;
  const vig = over || ((model.tariffValiditySpecific[cid + '|' + perfil] || []).slice(-1)[0]) || model.tariffValidity;
  return { importe: tiers ? tiers[tiers.length - 1] : raw, tiers, from: vig.from, to: vig.to, impuesto: c.impuesto || '' };
}
// Meals: daily cap for N external meals (1 · 2 · 3). Tiers are cumulative and never added together.
export const mealCap = (model, perfil, n) => { const t = tariff(model, 'c2', perfil); return t && t.tiers && n > 0 ? t.tiers[Math.min(3, n) - 1] : null; };

// Reading format by rule kind: amounts carry currency + base, counts carry their unit (captured as plain numbers).
export function fmtRule(model, rid, v) {
  const def = model.exceptionRules.find(r => r.id === rid);
  if (v == null || v === '') return 'Sin valor';
  if (!def) return String(v);
  if (def.kind === 'money') return money(v) + ' ' + def.unidad;
  if (def.kind === 'int') return v + ' ' + def.unidad;
  return String(v);
}

// Policy value of a rule for a profile (before exceptions). Antelación (r12) is a GLOBAL parameter.
export function policyRaw(model, profile, rid) {
  const def = model.exceptionRules.find(r => r.id === rid); if (!def) return null;
  if (def.policy === 'antelacion') return model.global.antelacion ? model.global.antelacion.dias : null;
  if (def.policy.startsWith('tarifa:')) { const cid = def.policy.slice(7); const t = tariff(model, cid, profile.perfil); return t ? (t.tiers ? t.tiers[2] : t.importe) : null; }
  if (def.policy === 'diasComprobar') return profile.diasComprobar ?? model.global.diasComprobar.dias;
  return profile[def.policy] ?? null;
}

// EFFECTIVE VALUE (rule 68): vigente individual exception → profile policy → global parameter, always with its origin.
export function effectiveValue(model, userId, profile, rid, today) {
  const ex = model.exceptions.find(e => e.userId === userId && e.regla === rid && tempStatus(e, today) === 'Vigente');
  if (ex) return { value: ex.valor, origin: 'Excepción individual', exception: ex };
  const def = model.exceptionRules.find(r => r.id === rid) || {};
  const raw = policyRaw(model, profile, rid);
  const global = def.base === 'global' || (def.policy === 'diasComprobar' && profile.diasComprobar == null);
  return { value: raw, origin: global ? 'Parámetro global' : 'Política del perfil' };
}

// ---------- validations (same messages as the approved UI) ----------
export function validateProfile(f, profiles) {
  const errs = {};
  if (!f.perfil) errs.perfil = 'Indica el perfil';
  const clash = profiles.find(x => x.perfil === f.perfil && x.id !== f.id && overlaps(x, f));
  if (rangeError(f.from, f.to)) errs.vigencia = 'Indica una vigencia completa: fecha de inicio y fecha de fin';
  else if (clash) errs.vigencia = 'La vigencia se traslapa con el rango ' + vigText(clash.from, clash.to);
  if (!f.doc) errs.doc = 'El cambio normativo requiere el documento de autorización';
  return errs;
}
export function validateTariff(f, tiered) {
  const errs = {};
  if (tiered) {
    const n = [f.t1, f.t2, f.t3].map(v => Number(String(v ?? '').trim()));
    if ([f.t1, f.t2, f.t3].some(v => !String(v ?? '').trim()) || n.some(isNaN)) errs.importe = 'Indica los tres topes diarios en pesos';
    else if (n[0] > n[1] || n[1] > n[2]) errs.importe = 'Cada tope incluye las comidas anteriores: 1 comida ≤ 2 comidas ≤ 3 comidas';
  } else if (!String(f.importe ?? '').trim() || isNaN(Number(f.importe))) errs.importe = 'Indica el importe máximo en pesos';
  if (rangeError(f.from, f.to)) errs.vigencia = 'Indica la vigencia completa de la tarifa';
  return errs;
}
export function validateException(f, model, hasProfile, today) {
  const errs = {};
  if (!f.userId) errs.userId = 'Selecciona al colaborador';
  if (!f.regla) errs.regla = 'Selecciona la regla';
  if (f.userId && !hasProfile) errs.userId = 'El colaborador no tiene perfil de viajero vigente: no hay valor de política que sustituir';
  if (String(f.valor ?? '').trim() === '') errs.valor = 'Captura el valor excepcional';
  if (rangeError(f.from, f.to)) errs.vigencia = 'Indica una vigencia completa: fecha de inicio y fecha de fin';
  if (!String(f.motivo || '').trim()) errs.motivo = 'Indica el motivo';
  if (!f.doc) errs.doc = 'Adjunta el documento de autorización';
  const same = model.exceptions.filter(e => e.id !== f.id && e.userId === f.userId && e.regla === f.regla && !e.revoked);
  const open = same.find(e => ['Vigente', 'Programado'].includes(tempStatus(e, today)));
  if (!f.id && open) errs.duplicate = open;   // UI: «Este colaborador ya tiene una excepción vigente para esta regla» + open that record
  const clash = same.find(e => overlaps(e, f));
  if (!errs.vigencia && clash) errs.vigencia = 'Ya existe una excepción de esta regla para el colaborador en el rango ' + vigText(clash.from, clash.to);
  return errs;
}

// ---------- cost simulator (rule 93): captured quantities, traceable lines, nothing derived between them ----------
export function simulate(model, { perfil, dias, noches, comidas, hospId }) {
  const lines = [], missing = []; let total = 0;
  const th = tariff(model, 'c1', perfil);
  if (!th) missing.push('Hospedaje'); else { const s = th.importe * noches; total += s; lines.push({ k: 'Hospedaje', v: `${money(th.importe)} por noche × ${noches} ${noches === 1 ? 'noche' : 'noches'} = ${money(s)}` }); }
  if (!tariff(model, 'c2', perfil)) missing.push('Alimentos');
  else if (comidas === 0) lines.push({ k: 'Alimentos', v: 'Sin comidas externas: no se estima' });
  else { const cap = mealCap(model, perfil, comidas), s = cap * dias; total += s; lines.push({ k: 'Alimentos', v: `Tope de ${comidas} ${comidas === 1 ? 'comida' : 'comidas'} ${money(cap)} × ${dias} ${dias === 1 ? 'día' : 'días'} = ${money(s)}` }); }
  const tint = model.global.tintoreria, tDias = Math.max(0, dias - (tint.desdeDia - 1));
  if (tDias > 0) { const s = tint.importe * tDias; total += s; lines.push({ k: 'Tintorería', v: `${money(tint.importe)} por día × ${tDias} ${tDias === 1 ? 'día' : 'días'} (a partir del ${tint.desdeDia}.º) = ${money(s)}` }); }
  const taxi = model.taxi.porHospital[hospId] ?? model.taxi.otros;
  lines.push({ k: 'Taxi', v: `Tarifa semanal de referencia ${money(taxi)} (no se suma: su aplicación por semana está en definición)` });
  return { lines, total, missing };
}
