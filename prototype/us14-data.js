if (!window.SMV_ANT) { (function(){
// US-14 + US-15 · ANTICIPO — datos DEMO (sintéticos; repositorio público). REVIEW MODE · SYNC PENDING.
// SEED_REQS = solicitudes de viaje APROBADAS con el MISMO modelo de Creación / US-09 (segmentos, gastos, cadena, decisiones):
// el anticipo NUNCA copia el viaje; se liga al folio. ANTICIPOS = registro canónico ÚNICO por folio (US-14 lo crea, US-15 lo opera).
// La propuesta máxima NO se guarda aquí: el Portal la calcula con los valores efectivos del perfil (antPropuesta) y la CONGELA al enviar;
// en la semilla solo se declaran los importes que difieren de la propuesta (sol / aprobado).
const SEG = (n, id, label, tipo, inicio, fin, dias, noches, medio, hospedaje, comidas, extra) => ({ n, tipo, id: 'h' + id, hospId: id, label, inicio, fin, dias, noches, medio, hospedaje, comidas, hospAlim: tipo === 'hospital', ...(extra || {}) });
const RUTA = (origen, segs) => ({ origen, tramos: segs.map((s, i) => ({ n: s.n, desde: i ? { id: segs[i - 1].id, label: segs[i - 1].label } : origen, hasta: { id: s.id, label: s.label } })) });
const DEB = ref => ({ metodo: 'debito', label: 'Tarjeta de débito', origen: 'SAP', referencia: '•••• ' + ref, texto: 'Tarjeta de débito · •••• ' + ref });
const CHI = { id: 'h1114', label: 'HSM Chihuahua' }, COR = { id: 'h1100', label: 'Corporativo' };
const AV = (h, r) => ({ horaVueloAprox: h, vuelo: { tipo: 'redondo', horaRegreso: r, equipaje: 'mano' } });
const CH_HOSP = { cadena: [{ label: 'Dirección de Hospital', person: 'Ricardo Fuentes Ávila' }, { label: 'Dirección Corporativa', person: 'Mónica Herrera Luna' }], cadenaIds: ['u03', 'u04'],
  cadenaInfo: [{ ctx: 'HSM Chihuahua · director del hospital (función 80001076)' }, { ctx: 'Dirección Comercial y de Negocios · autorizador corporativo de la unidad organizativa (ZA02)' }], firstLabel: 'Dirección de Hospital (Ricardo Fuentes Ávila)' };
const CH_U01 = { cadena: [{ label: 'Director inmediato', person: 'Mónica Herrera Luna' }, { label: 'DGA', person: 'Pedro Medina' }], cadenaIds: ['u04', 'u06'],
  cadenaInfo: [{ ctx: 'Directora Comercial y de Negocios · grupo E ED · estructura de SAP' }, { ctx: 'Dirección General Adjunta · el director inmediato es E ED' }], firstLabel: 'Director inmediato (Mónica Herrera Luna)' };
const CH_U09 = { cadena: [{ label: 'Director inmediato', person: 'Alfredo Cacho' }], cadenaIds: ['u05'], cadenaInfo: [{ ctx: 'Director de Capital Humano Corporativo · grupo E EJ · estructura de SAP' }], firstLabel: 'Director inmediato (Alfredo Cacho)' };
const OK2 = (a, b, w1, w2) => [{ paso: 0, res: 'aprobada', byId: a, when: w1, canal: 'Portal web · escritorio' }, { paso: 1, res: 'aprobada', byId: b, when: w2, canal: 'Portal web · escritorio' }];
const OK1 = (a, w1) => [{ paso: 0, res: 'aprobada', byId: a, when: w1, canal: 'Portal web · escritorio' }];
const R = (o) => ({ status: 'aprobada', proyecto: '', acompanantes: [], hasta: false, exceso: false, excesos: [], evidencia: [], ...o, userId: o.userId || o.uid });

const s71 = [SEG(1, '1125', 'HSM Monterrey', 'hospital', '09/11/2026', '12/11/2026', 4, 3, 'Avión', 'hotel', ['Comida', 'Cena'], AV('07:20', '18:30'))];
const s72 = [SEG(1, '1100', 'Corporativo', 'corporativo', '03/11/2026', '05/11/2026', 3, 2, 'Autobús', 'hotel', ['Desayuno', 'Comida', 'Cena'])];
const s73 = [SEG(1, '1113', 'HSM Querétaro', 'hospital', '26/10/2026', '28/10/2026', 3, 2, 'Avión', 'hotel', ['Comida', 'Cena'], AV('06:50', '19:10'))];
const s74 = [SEG(1, '1114', 'HSM Chihuahua', 'hospital', '09/11/2026', '11/11/2026', 3, 2, 'Avión', 'hotel', ['Desayuno', 'Comida', 'Cena'], AV('08:05', '17:40'))];
const s75 = [SEG(1, '1121', 'HSM Guadalajara', 'hospital', '21/10/2026', '23/10/2026', 3, 2, 'Avión', 'hotel', ['Comida', 'Cena'], AV('07:00', '20:15'))];
const s76 = [SEG(1, '1103', 'HSM Mérida', 'hospital', '30/11/2026', '02/12/2026', 3, 2, 'Avión', 'hotel', ['Comida', 'Cena'], AV('06:40', '18:00'))];
const s77 = [SEG(1, '1125', 'HSM Monterrey', 'hospital', '19/10/2026', '20/10/2026', 2, 1, 'Avión', 'hotel', ['Cena'], AV('07:30', '19:45'))];
const s78 = [SEG(1, '1100', 'Corporativo', 'corporativo', '26/10/2026', '27/10/2026', 2, 1, 'Autobús', 'hospital', ['Comida'])];
const s80 = [SEG(1, '1100', 'Corporativo', 'corporativo', '17/10/2026', '18/10/2026', 2, 1, 'Autobús', 'hotel', ['Comida', 'Cena'])];
const s81 = [SEG(1, '1113', 'HSM Querétaro', 'hospital', '16/11/2026', '18/11/2026', 3, 2, 'Autobús', 'hospital', ['Cena'])];
const s82 = [SEG(1, '1113', 'HSM Querétaro', 'hospital', '23/11/2026', '25/11/2026', 3, 2, 'Avión', 'hotel', ['Comida', 'Cena'], AV('06:50', '19:10'))];
const G = (h, a, v) => [{ concepto: 'Hospedaje', importe: h, origen: 'tarifa' }, { concepto: 'Alimentos', importe: a, origen: 'tarifa' }].concat(v ? [{ concepto: 'Vuelos', importe: v, origen: 'ref' }] : []);

const SEED_REQS = [
  // A/B/C · Elizabeth: viaje aprobado, anticipo DISPONIBLE (propuesta, monto menor, intento por encima del máximo). Origen de un viaje en grupo.
  R({ folio: '00071', uid: 'u01', motivo: 'Operación', motivoCode: 'OPER', segmentos: s71, ruta: RUTA(COR, s71), gastos: G(5400, 2600, 5500), dest: 'HSM Monterrey', fechas: '09/11/2026 – 12/11/2026', nights: '4 días · 3 noches', total: 8000,
    acompanantes: [{ personId: 'u02', addedAt: '05/10/2026 10:20', addedBy: 'u01' }], grupo: 'G-00071', rolGrupo: 'origen', participantes: [{ personId: 'u02', folio: '00079' }],
    pago: DEB('4417'), perfilFolio: 'Mando medio', entidad: 'Dirección Comercial y de Negocios', justificacion: 'Arranque del programa comercial 2027 con el equipo directivo de HSM Monterrey.', ...CH_U01,
    decisiones: OK2('u04', 'u06', '07/10/2026 12:10', '08/10/2026 09:40'), when: '05/10/2026 10:30', at: 90 }),
  // F · Andrés: anticipo PENDIENTE de autorización (paso 1 · Dirección de Hospital).
  R({ folio: '00072', uid: 'u07', motivo: 'Capacitación', motivoCode: 'CAP', segmentos: s72, ruta: RUTA(CHI, s72), gastos: G(3600, 2730), dest: 'Corporativo', fechas: '03/11/2026 – 05/11/2026', nights: '3 días · 2 noches', total: 6330,
    pago: DEB('6614'), perfilFolio: 'Mando medio', entidad: 'HSM Chihuahua', justificacion: 'Taller corporativo de estándares de hotelería hospitalaria 2027.', ...CH_HOSP,
    decisiones: OK2('u03', 'u04', '06/10/2026 11:00', '07/10/2026 10:15'), when: '05/10/2026 09:10', at: 84 }),
  // H · Laura: anticipo AUTORIZADO, por contabilizar.
  R({ folio: '00073', uid: 'u02', motivo: 'Operación', motivoCode: 'OPER', segmentos: s73, ruta: RUTA(CHI, s73), gastos: G(3600, 1950, 5500), dest: 'HSM Querétaro', fechas: '26/10/2026 – 28/10/2026', nights: '3 días · 2 noches', total: 5550,
    pago: DEB('8802'), perfilFolio: 'Mando medio', entidad: 'HSM Chihuahua', justificacion: 'Homologación de procesos de Capital Humano con HSM Querétaro.', ...CH_HOSP,
    decisiones: OK2('u03', 'u04', '02/10/2026 10:00', '02/10/2026 17:20'), when: '01/10/2026 12:40', at: 80 }),
  R({ folio: '00074', uid: 'u09', motivo: 'Operación', motivoCode: 'OPER', segmentos: s74, ruta: RUTA(COR, s74), gastos: G(3400, 1905, 5500), dest: 'HSM Chihuahua', fechas: '09/11/2026 – 11/11/2026', nights: '3 días · 2 noches', total: 5305,
    pago: DEB('3391'), perfilFolio: 'Operativo', entidad: 'Corporativo', justificacion: 'Revisión en sitio de comprobaciones del tercer trimestre.', ...CH_U09, decisiones: OK1('u05', '06/10/2026 13:00'), when: '05/10/2026 16:00', at: 81 }),
  // I · anticipo REALIZADO (depositado) + segunda transferencia por cambio de hospedaje (US-16) por transferir.
  R({ folio: '00075', uid: 'u09', motivo: 'Capacitación', motivoCode: 'CAP', segmentos: s75, ruta: RUTA(COR, s75), gastos: G(3400, 1260, 5500), dest: 'HSM Guadalajara', fechas: '21/10/2026 – 23/10/2026', nights: '3 días · 2 noches', total: 4660,
    pago: DEB('3391'), perfilFolio: 'Operativo', entidad: 'Corporativo', justificacion: 'Capacitación a analistas de HSM Guadalajara en la operación del Portal.', ...CH_U09, decisiones: OK1('u05', '30/09/2026 10:30'), when: '29/09/2026 09:20', at: 76 }),
  // G · anticipo RECHAZADO con motivo.
  R({ folio: '00076', uid: 'u07', motivo: 'Operación', motivoCode: 'OPER', segmentos: s76, ruta: RUTA(CHI, s76), gastos: G(3600, 1950, 5500), dest: 'HSM Mérida', fechas: '30/11/2026 – 02/12/2026', nights: '3 días · 2 noches', total: 5550,
    pago: DEB('6614'), perfilFolio: 'Mando medio', entidad: 'HSM Chihuahua', justificacion: 'Apoyo a la apertura del área de hospedaje de HSM Mérida.', ...CH_HOSP,
    decisiones: OK2('u03', 'u04', '08/10/2026 10:00', '08/10/2026 16:00'), when: '07/10/2026 09:30', at: 83 }),
  // Transferencia DEVUELTA por el banco (reabierto con causa).
  R({ folio: '00077', uid: 'u02', motivo: 'Reunión comité', motivoCode: 'COM', segmentos: s77, ruta: RUTA(CHI, s77), gastos: G(1800, 800, 5500), dest: 'HSM Monterrey', fechas: '19/10/2026 – 20/10/2026', nights: '2 días · 1 noche', total: 2600,
    pago: DEB('8802'), perfilFolio: 'Mando medio', entidad: 'HSM Chihuahua', justificacion: 'Comité regional de Capital Humano del Noreste.', ...CH_HOSP,
    decisiones: OK2('u03', 'u04', '01/10/2026 09:00', '01/10/2026 13:30'), when: '30/09/2026 17:00', at: 78 }),
  // D · viajero EXTERNO aprobado: la etapa Anticipo NO existe («No aplica · viajero externo»).
  R({ folio: '00078', uid: 'x02', travelerType: 'externo', travelerId: 'x02', userId: 'u02', createdBy: 'u02', respId: 'u02', motivo: 'Entrevista', motivoCode: null, segmentos: s78, ruta: RUTA({ id: '', label: 'Chihuahua, Chihuahua' }, s78), origenTexto: 'Chihuahua, Chihuahua',
    gastos: G(0, 400), dest: 'Corporativo', fechas: '26/10/2026 – 27/10/2026', nights: '2 días · 1 noche', total: 400, pago: { metodo: 'noAplica', label: 'No aplica', origen: '', referencia: '', texto: 'No aplica · sin hotel externo' }, perfilFolio: 'Viajero externo', entidad: 'HSM Chihuahua',
    justificacion: 'Mesa de trabajo con la representación sindical en Corporativo.', cadena: [{ label: 'Autorizador primer nivel', person: 'Arturo Villaseñor Peña' }, { label: 'Capital Humano Corporativo', person: 'Alfredo Cacho' }], cadenaIds: ['dcw02', 'u05'],
    cadenaInfo: [{ ctx: 'Director de Operaciones Corporativas · asignado en el registro del externo' }, { ctx: 'Cadena de autorización de viajeros externos' }], firstLabel: 'Autorizador primer nivel (Arturo Villaseñor Peña)',
    decisiones: OK2('dcw02', 'u05', '09/10/2026 12:00', '10/10/2026 10:00'), when: '08/10/2026 11:15', at: 79 }),
  // E · ACOMPAÑANTE interno de 00071: SU propio folio, SU propuesta y SU anticipo (el origen no cambia).
  R({ folio: '00079', uid: 'u02', motivo: 'Operación', motivoCode: 'OPER', segmentos: s71, ruta: RUTA(COR, s71), gastos: G(5400, 2600, 5500), dest: 'HSM Monterrey', fechas: '09/11/2026 – 12/11/2026', nights: '4 días · 3 noches', total: 8000,
    grupo: 'G-00071', rolGrupo: 'acompanante', origenFolio: '00071', origenUid: 'u01', pago: DEB('8802'), perfilFolio: 'Mando medio', entidad: 'HSM Chihuahua', justificacion: 'Acompaña el arranque del programa comercial para presentar el plan de capital humano.', ...CH_HOSP,
    decisiones: OK2('u03', 'u04', '07/10/2026 15:00', '08/10/2026 11:00'), when: '06/10/2026 09:00', at: 85 }),
  // Viaje aprobado que inicia en menos de 5 días: anticipo bloqueado por ANTELACIÓN.
  R({ folio: '00080', uid: 'u07', motivo: 'Reunión comité', motivoCode: 'COM', segmentos: s80, ruta: RUTA(CHI, s80), gastos: G(1800, 1300), dest: 'Corporativo', fechas: '17/10/2026 – 18/10/2026', nights: '2 días · 1 noche', total: 3100,
    pago: DEB('6614'), perfilFolio: 'Mando medio', entidad: 'HSM Chihuahua', justificacion: 'Comité corporativo de hotelería.', ...CH_HOSP, decisiones: OK2('u03', 'u04', '12/10/2026 09:00', '12/10/2026 18:00'), when: '11/10/2026 10:00', at: 86 }),
  // Anticipo autorizado TOMADO por otro analista de Contabilidad (concurrencia).
  R({ folio: '00081', uid: 'u09', motivo: 'Operación', motivoCode: 'OPER', segmentos: s81, ruta: RUTA(COR, s81), gastos: G(0, 750), dest: 'HSM Querétaro', fechas: '16/11/2026 – 18/11/2026', nights: '3 días · 2 noches', total: 750,
    pago: DEB('3391'), perfilFolio: 'Operativo', entidad: 'Corporativo', justificacion: 'Auditoría de comprobaciones en sitio.', ...CH_U09, decisiones: OK1('u05', '09/10/2026 12:00'), when: '08/10/2026 13:00', at: 82 }),
  // Anticipo incluido en propuesta de pago, POR TRANSFERIR.
  R({ folio: '00082', uid: 'u01', motivo: 'Capacitación', motivoCode: 'CAP', segmentos: s82, ruta: RUTA(COR, s82), gastos: G(3600, 1950, 5500), dest: 'HSM Querétaro', fechas: '23/11/2026 – 25/11/2026', nights: '3 días · 2 noches', total: 5550,
    pago: DEB('4417'), perfilFolio: 'Mando medio', entidad: 'Dirección Comercial y de Negocios', justificacion: 'Capacitación comercial al equipo de HSM Querétaro.', ...CH_U01, decisiones: OK2('u04', 'u06', '30/09/2026 10:00', '01/10/2026 09:00'), when: '29/09/2026 10:00', at: 70 })
];

// REGISTRO CANÓNICO DE ANTICIPOS (uno por folio; «un anticipo abierto por viaje»). estado:
// pendAut (ANT_Pendiente autorización) · autorizado (por contabilizar; presupuesto ya comprometido por la reserva del folio) · contabilizado ·
// porTransferir (incluido en propuesta de pago) · realizado (ANT_Realizado: depósito confirmado → En tránsito) · devuelto (transferencia devuelta, reabierto) · rechazado · cancelado.
// sol / aprobado = solo los conceptos que difieren de la propuesta calculada. decisiones = append-only por paso (igual que US-09).
const ANTICIPOS = [
  { id: 'ANT-00072', folio: '00072', uid: 'u07', estado: 'pendAut', sol: { Taxi: 1200 }, enviado: '13/10/2026 18:20', cadenaIds: ['u03', 'u04'], decisiones: [] },
  { id: 'ANT-00073', folio: '00073', uid: 'u02', estado: 'autorizado', enviado: '08/10/2026 10:00', cadenaIds: ['u03', 'u04'],
    decisiones: [{ paso: 0, res: 'aprobada', byId: 'u03', when: '12/10/2026 10:00', canal: 'Portal web · escritorio' }, { paso: 1, res: 'aprobada', byId: 'u04', when: '12/10/2026 16:30', canal: 'Portal web · teléfono' }] },
  { id: 'ANT-00074', folio: '00074', uid: 'u09', estado: 'contabilizado', enviado: '07/10/2026 09:00', cadenaIds: ['u05'], decisiones: [{ paso: 0, res: 'aprobada', byId: 'u05', when: '08/10/2026 12:00', canal: 'Portal web · escritorio' }],
    contab: { byId: 'u10', when: '13/10/2026 12:00', poliza: 'PZ-2026-10-0412' } },
  { id: 'ANT-00075', folio: '00075', uid: 'u09', estado: 'realizado', sol: { Taxi: 1340 }, enviado: '01/10/2026 11:00', cadenaIds: ['u05'], decisiones: [{ paso: 0, res: 'aprobada', byId: 'u05', when: '02/10/2026 09:30', canal: 'Portal web · escritorio' }],
    contab: { byId: 'u10', when: '05/10/2026 10:00', poliza: 'PZ-2026-10-0388' }, pp: { id: 'PP-0005', when: '06/10/2026 09:00', byId: 'u10' },
    transfers: [{ n: 1, tipo: 'Anticipo', importe: 6000, fecha: '09/10/2026', referencia: 'SPEI-4471209', estado: 'aplicada', byId: 'u10', when: '09/10/2026 13:10' },
      { n: 2, tipo: 'Ajuste por cambio de hospedaje', importe: 850, motivo: 'Cambio de hotel por saturación de la sede (US-16): diferencia de tarifa de 1 noche', estado: 'porTransferir', when: '13/10/2026 17:00' }] },
  { id: 'ANT-00076', folio: '00076', uid: 'u07', estado: 'rechazado', enviado: '09/10/2026 12:00', cadenaIds: ['u03', 'u04'],
    decisiones: [{ paso: 0, res: 'rechazada', motivoTipo: 'Importe no justificado para la agenda', motivo: 'La agenda en HSM Mérida es de medio día; reprograma el viaje o solicita el anticipo con la agenda definitiva.', byId: 'u03', when: '12/10/2026 11:40', canal: 'Portal web · teléfono' }] },
  { id: 'ANT-00077', folio: '00077', uid: 'u02', estado: 'devuelto', enviado: '02/10/2026 09:00', cadenaIds: ['u03', 'u04'],
    decisiones: [{ paso: 0, res: 'aprobada', byId: 'u03', when: '03/10/2026 10:00', canal: 'Portal web · escritorio' }, { paso: 1, res: 'aprobada', byId: 'u04', when: '05/10/2026 09:00', canal: 'Portal web · escritorio' }],
    contab: { byId: 'u10', when: '07/10/2026 11:00', poliza: 'PZ-2026-10-0397' }, pp: { id: 'PP-0006', when: '08/10/2026 09:00', byId: 'u10' },
    transfers: [{ n: 1, tipo: 'Anticipo', importe: 4410, fecha: '12/10/2026', referencia: 'SPEI-4480017', estado: 'devuelta', byId: 'u10', when: '12/10/2026 12:30', devolucion: { causa: 'Cuenta bloqueada por el banco receptor', when: '13/10/2026 10:15', byId: 'u10' } }] },
  { id: 'ANT-00081', folio: '00081', uid: 'u09', estado: 'autorizado', enviado: '10/10/2026 08:30', cadenaIds: ['u05'], decisiones: [{ paso: 0, res: 'aprobada', byId: 'u05', when: '12/10/2026 09:15', canal: 'Portal web · escritorio' }],
    lock: { byId: 'u13', when: '14/10/2026 08:40' } },
  { id: 'ANT-00082', folio: '00082', uid: 'u01', estado: 'porTransferir', enviado: '02/10/2026 12:00', cadenaIds: ['u04'], decisiones: [{ paso: 0, res: 'aprobada', byId: 'u04', when: '05/10/2026 16:00', canal: 'Portal web · escritorio' }],
    contab: { byId: 'u10', when: '12/10/2026 10:30', poliza: 'PZ-2026-10-0405' }, pp: { id: 'PP-0007', when: '13/10/2026 09:30', byId: 'u10' } }
];

// PARÁMETROS (historia US-14 / US-15). editables = conceptos parametrizados que admiten edición A LA BAJA (historia: «ej. taxi/autobús»).
// antelacionDias = 5 (alcance · distinta de los 4 días de la solicitud de viaje). unAbierto = un solo anticipo abierto por viaje (parametrizable).
const PARAMS = { antelacionDias: 5, editables: ['Taxi', 'Autobús'], propinaMaxPct: 10, unAbierto: true, plazoIniciar: 7, plazoConcluir: 7, motivoMax: 500, abiertos: ['pendAut', 'autorizado', 'contabilizado', 'porTransferir', 'realizado', 'devuelto'] };
// Catálogos DEMO (la historia pide «catálogo + texto libre»; el catálogo oficial es decisión del cliente).
const MOTIVOS_RECHAZO = ['Importe no justificado para la agenda', 'Viaje sujeto a cambios de fecha', 'Anticipos previos sin comprobar', 'Información incompleta o incorrecta', 'Otro motivo'];
const MOTIVOS_CONTAB = ['Datos bancarios no vigentes', 'Viaje cancelado o reprogramado', 'Anticipo duplicado', 'Importe aprobado sin soporte', 'Otro motivo'];
const CAUSAS_DEVOLUCION = ['Cuenta bloqueada por el banco receptor', 'Cuenta cancelada', 'Titular no coincide', 'CLABE o cuenta inexistente', 'Otra causa'];
// Banco de la cuenta de nómina (dato de SAP, simulado): agrupa la propuesta de pago por sociedad y banco.
const BANCO_SAP = { u01: 'BBVA', u02: 'Santander', u07: 'Banorte', u09: 'BBVA', u03: 'BBVA', u05: 'Banorte', u10: 'BBVA', u12: 'Santander' };
// Cuentas NO vigentes en SAP (vacío en la demo; MODO DEMO «Cuenta bancaria (SAP)» simula el caso).
const CUENTA_NO_VIGENTE = [];

window.SMV_ANT = { SEED_REQS, ANTICIPOS, PARAMS, MOTIVOS_RECHAZO, MOTIVOS_CONTAB, CAUSAS_DEVOLUCION, BANCO_SAP, CUENTA_NO_VIGENTE };
})(); }
