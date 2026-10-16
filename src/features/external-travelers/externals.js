// VIAJEROS EXTERNOS (US-05, APPROVED · CLOSED) — pure rules over src/data/externals.json + traveler-profiles.json › globals.maxExternos.
// Interactive list/ficha/form, confirmation, success modal and audit live in prototype/Portal Viaticos.dc.html (extNew · extEdit · extSave · extToggle · sharedConfirm).
// Angular: ExternalTravelersModule (ExternalsList · ExternalFile · ExternalForm) + ExternalTravelerService; Creación consumes the service.
import { tempStatus } from '../traveler-profile/rules.js';

const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
export const vigencia = (x, today) => tempStatus({ from: x.from, to: x.to }, today); // Programado · Vigente · Vencido
export const isVigente = (x, today) => x.estado === 'Activo' && vigencia(x, today) === 'Vigente';
export const mine = (list, uid) => list.filter(x => x.registradorId === uid);            // CH HSM operates only its own externals
export const vigentesCount = (list, uid, today) => mine(list, uid).filter(x => isVigente(x, today)).length;
export const atLimit = (list, uid, today, max) => vigentesCount(list, uid, today) >= max; // max = globals.maxExternos (5)
export const flightMissing = x => !x.fechaNac || !x.nacionalidad;

// Duplicates: same identification, or same name + birth date, blocks the save.
export function findDuplicate(list, f, selfId) {
  return list.find(x => x.id !== selfId && ((f.idNumero && norm(x.idNumero) === norm(f.idNumero)) ||
    (norm(x.name) === norm([f.nombre, f.apellidos].join(' ')) && f.fechaNac && x.fechaNac === f.fechaNac))) || null;
}
// Required fields (responsable is automatic = registrador).
export function validateExternal(f) {
  const errs = [];
  [['tipo', 'Tipo'], ['nombre', 'Nombre(s)'], ['apellidos', 'Apellidos'], ['idTipo', 'Tipo de identificación'], ['idNumero', 'Número de identificación'], ['idDoc', 'Documento de identificación'], ['autorizadorId', 'Autorizador primer nivel'], ['from', 'Vigencia desde'], ['to', 'Vigencia hasta']]
    .forEach(([k, label]) => { if (!f[k]) errs.push({ key: k, label }); });
  return errs;
}
// Deactivation: logical, motivo required, blocked with open folios. Reactivation respects the limit.
export const canDeactivate = openFolios => openFolios.length === 0;
export const canReactivate = (list, uid, today, max) => !atLimit(list, uid, today, max);
// Request gate (Nueva solicitud de viaje a su nombre).
export const requestGate = (x, today) => isVigente(x, today) ? { ok: true } : { ok: false, reason: x.estado !== 'Activo' ? 'El externo está inactivo' : 'La vigencia del externo no está activa' };
// Chain for external requests: Autorizador primer nivel → Capital Humano Corporativo. Anticipo never applies.
export const chainExt = x => [{ role: 'Autorizador primer nivel', personId: x.autorizadorId }, { role: 'Capital Humano Corporativo' }];
export const anticipoApplies = () => false;
