// FICHA DEL VIAJERO Y ASIGNACIÓN DE PERFIL (US-04, APPROVED · CLOSED) — pure functions over src/data/traveler-profiles.json + users/people.
// The interactive dialogs (Cambiar / Asignar perfil, Asignación masiva, Exportar ficha), confirmation, success modal and audit
// live, interactive, in prototype/Portal Viaticos.dc.html (pvOpenAssign · pvOpenMass · pvExportFicha · pvAsk · notifySuccess · pvLog).
// Angular: TravelerFileModule (CollaboratorsList · TravelerFile · AssignProfileDialog · MassAssignDialog) over TravelerRulesService.
import { tempStatus, overlaps, rangeError, toDate } from './rules.js';

// Proposed profile from SAP personnel group (synthetic mapping — official client table PENDING).
export const PROPOSED_BY_GROUP = { E: 'Director', ED: 'Director', EJ: 'Ejecutivo', MM: 'Mando medio', OP: 'Operativo' };
export const proposedProfile = person => PROPOSED_BY_GROUP[person.personnelGroup] || '';

// Assignment state for a collaborator: Sin perfil asignado · Programado · Vigente · Vencido (rule 85).
export function assignmentState(model, userId) {
  const list = model.assignments[userId] || [], today = model.today;
  const norm = a => ({ ...a, to: a.to || '31/12/9999' });
  const cur = list.map(norm).find(a => tempStatus(a, today) === 'Vigente');
  const fut = list.map(norm).find(a => tempStatus(a, today) === 'Programado');
  if (cur) return { state: 'Vigente', current: cur, scheduled: fut || null };
  if (fut) return { state: 'Programado', current: null, scheduled: fut };
  return { state: list.length ? 'Vencido' : 'Sin perfil asignado', current: null, scheduled: null };
}
// Traveler capability = RESULT of having a vigente profile (rule 82), never a separate switch.
export const travelerCapability = (model, userId) => assignmentState(model, userId).state === 'Vigente';

// Validation of an individual assignment (same rules as the approved dialog).
export function validateAssignment(f, model, person) {
  const errs = {};
  if (!f.perfil) errs.perfil = 'Selecciona el perfil a asignar';
  if (rangeError(f.from, f.to)) errs.vigencia = 'Indica una vigencia completa: fecha de inicio y fecha de fin';
  if (!String(f.motivo || '').trim()) errs.motivo = 'El motivo es obligatorio en todo cambio de perfil';
  const libre = f.perfil && f.perfil !== proposedProfile(person);
  if (libre && !f.doc) errs.doc = 'Asignar un perfil distinto del propuesto requiere el documento de autorización';
  return { errs, origen: libre ? 'libre' : 'automatico' };
}

// Apply: closes the previous vigencia the day before the new one; nothing is deleted (rule 69).
export function applyAssignment(model, userId, f, actor, when) {
  const list = (model.assignments[userId] || []).map(a => ({ ...a }));
  const start = toDate(f.from); const prevDay = new Date(start.getTime() - 86400000);
  const dd = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  list.forEach(a => { if (overlaps({ from: a.from, to: a.to || '31/12/9999' }, { from: f.from, to: f.to })) a.to = dd(prevDay); });
  const { origen } = validateAssignment(f, model, { personnelGroup: f.personnelGroup });
  return [{ perfil: f.perfil, from: f.from, to: f.to, origen, motivo: f.motivo, documento: f.doc || '', by: actor, when }].concat(list);
}

// Mass assignment preview (rule 78): criterion → mandatory preview with exclusions; re-runs never duplicate.
export function massPreview(model, people, criterion, from, to) {
  return people.map(p => {
    const st = assignmentState(model, p.id), prop = proposedProfile(p);
    const already = (model.assignments[p.id] || []).some(a => a.perfil === prop && a.from === from);
    const inScope = criterion === 'sin-perfil' ? st.state === 'Sin perfil asignado' || st.state === 'Vencido' : p.personnelGroup === criterion;
    const excluded = !inScope ? 'Fuera del criterio' : !prop ? 'Sin perfil propuesto para su grupo de personal' : already ? 'Asignación ya aplicada' : '';
    return { id: p.id, name: p.name, employeeNumber: p.employeeNumber, personnelGroup: p.personnelGroup, proposed: prop, excluded, selected: !excluded };
  }).filter(r => r.excluded !== 'Fuera del criterio');
}

// Collaborators list rows (one meaning per column — TABLE_LIST_STANDARD).
export function collaboratorRows(model, people) {
  return people.map(p => { const st = assignmentState(model, p.id);
    return { id: p.id, employeeNumber: p.employeeNumber, name: p.name, puesto: p.puesto, org: p.hospital || 'Corporativo', ceco: p.ceco || '—',
      perfilLabel: st.current ? st.current.perfil : 'Sin perfil asignado', sub: st.scheduled ? `Programado: ${st.scheduled.perfil} (${st.scheduled.from})` : '', estado: p.estado || 'Activo' }; });
}
