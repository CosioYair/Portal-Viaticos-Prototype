window.SMV_US08 = window.SMV_US08 || (function () {
// NUEVA SOLICITUD DE VIAJE — catálogos y parámetros que consume la captura de la solicitud. DEMO ONLY (datos sintéticos).
// Las personas NO viven aquí: se leen del registro canónico (us01-data.js › USERS / us26-data.js).
// El perfil, las reglas, las tarifas, la antelación mínima y la estructura de SAP NO viven aquí: se leen del modelo único de perfil
// (usperfil-data.js › PROFILES / TARIFAS / EXCEPCIONES / GLOBAL / SAP_PERSONAL / ESTRUCTURA_SAP).
// Motivos, parámetros globales, estados, hospitales y conceptos de la solicitud se DERIVAN del catálogo confirmado (uscat-data.js › SMV_CAT).
// Clasificación de origen: CLIENT CONFIRMED — GREEN WORKBOOK V1 (1) · CLIENT VALIDATION 2026-10-05 (Word) · PROVISIONAL MOCK · OPEN CLIENT DECISION.
const CAT = () => window.SMV_CAT || {};

// Parámetros del módulo (códigos del libro «Paramtros Globales»; el valor se lee del catálogo, aquí solo se nombran los que usa la captura).
const PARAMS = {
  get maxDestinos() { return CAT().paramGlobal ? (CAT().paramGlobal('MAX_DEST') || 3) : 3; },          // MAX_DEST
  get validarHospitalHospital() { return CAT().paramGlobal ? CAT().paramGlobal('HOSP_HOSP') === 2 : true; }, // HOSP_HOSP = 2 «Con autorización» (preautorización de DGA)
  observacionesRequeridas: false,  // Observaciones: requerido u opcional según parámetro (alcance)
  otrosGastosDiasMin: 7,           // «Otros gastos estimados» solo en viajes de MÁS de 7 días (manager 2026-10-05); ocultos = fuera del estimado y se limpian
  folioInicial: 48                 // siguiente folio libre de los datos sintéticos (00043 … 00047 ya existen)
};

// Motivos (CLIENT CONFIRMED — GREEN WORKBOOK «Motivos de viaje»): etiquetas vigentes, en el orden del libro.
function motivos() { return (CAT().MOTIVOS_VIAJE || []).map(m => m.label); }
function motivoCode(label) { return ((CAT().MOTIVOS_VIAJE || []).find(m => m.label === label) || {}).code || ''; }

// REGLAS POR MOTIVO (CLIENT VALIDATION 2026-10-05):
//   Operación y Cubrir vacante → el destino es forzosamente un hospital (sin «Otro destino») y el hospedaje es en el hospital salvo rechazo.
//   Proyecto, Reunión comité y Diligencias → pueden elegir «Otro destino» (estado + ciudad); «Otro destino» implica hospedaje en hotel.
//   Capacitación → el libro/Word no mencionan «Otro destino»: solo hospitales (OPEN CLIENT DECISION).
const MOTIVOS_HOSPITAL_FORZOSO = ['Operación', 'Cubrir vacante'];
const MOTIVOS_OTRO_DESTINO = ['Proyecto', 'Reunión comité', 'Diligencias'];
// HOSPEDAJE POR PERFIL (Word): Niveles 1-2 (Director · Ejecutivo) → hotel · Niveles 3-5 (Mando medio · Operativo · viajero externo) → hospital.
// Se lee del catálogo de perfiles (PROFILES.hospedaje); aquí solo la regla de combinación con el destino.
function hospedajeDe(destTipo, perfilHospedaje) {
  if (destTipo === 'otro') return 'hotel';
  if (destTipo === 'corporativo') return perfilHospedaje === 'Hospital' ? 'sinHospedaje' : 'hotel'; // Corporativo (1100) no ofrece hospedaje: sin regla en las fuentes → se informa
  return perfilHospedaje === 'Hospital' ? 'hospital' : 'hotel';
}
// CAPACITACIÓN (Word): elegibles Niveles 1-2-3 (Director · Ejecutivo · Mando medio) de nuevo ingreso (alta/reingreso dentro de la semana) o con cambio
// organizativo / movimiento interno — la medida es dato de SAP (usperfil-data.js › SAP_PERSONAL.medida). Sustituye la regla provisional «solo niveles 1 y 2».
const CAPACITACION_PERFILES = ['Director', 'Ejecutivo', 'Mando medio'];

// FORMA DE PAGO DE LOS VIÁTICOS (manager 2026-10-05) — nivel solicitud:
//   debito = tarjeta de débito ya asignada en SAP (solo lectura, enmascarada; SAP_PERSONAL.cuentaBancaria) · alternativa = capturada en el Portal
//   (prototipo: banco + últimos 4 dígitos; NUNCA CVV; campos de producción = OPEN) · corporativa = el colaborador paga con su tarjeta corporativa
//   (sin reglas de elegibilidad: no confirmadas → OPEN; SAP_PERSONAL.tarjetaCorporativa solo se informa).
// TARJETA ALTERNATIVA (CLIENT CONFIRMED 2026-10-05): campos Banco · Tipo de tarjeta · Cuenta de 18 dígitos. Nunca CVV, NIP ni contraseñas.
// Tipos de tarjeta = los de la referencia del cliente (sin marcas adicionales). Se guarda el código canónico.
const TIPOS_TARJETA = [{ code: 'VISA', label: 'VISA' }, { code: 'MC', label: 'MasterCard' }, { code: 'AMEX', label: 'American Express' }];
const CUENTA_ALT_DIGITOS = 18;
const FORMAS_PAGO = [
  { id: 'debito', label: 'Tarjeta de débito', origen: 'SAP' },
  { id: 'alternativa', label: 'Tarjeta alternativa', origen: 'Portal' },
  { id: 'corporativa', label: 'Tarjeta corporativa', origen: 'Portal' }
];

// Catálogo de destinos = las 22 unidades del catálogo confirmado (uscat-data.js › HOSPITALES). Sin zonas: la antigua regla provisional de vuelo por zona
// fue RETIRADA (2026-10-05); el vuelo lo determina Viáticos en el proceso operativo. RECORRIDOS (km) sigue sin regla que lo consuma.
let _dest = null;
// ESTADO DE CADA UNIDAD: derivado de la ciudad del catálogo confirmado (abreviatura → nombre del catálogo de estados). Sirve al selector Estado → Hospital de Creación.
const EDO_ABBR = { 'Mich.': 'Michoacán de Ocampo', 'Ags.': 'Aguascalientes', 'Yuc.': 'Yucatán', 'Chih.': 'Chihuahua', 'S.L.P.': 'San Luis Potosí', 'Edo. Méx.': 'México (Estado de México)', 'Qro.': 'Querétaro', 'Ver.': 'Veracruz', 'Jal.': 'Jalisco', 'Pue.': 'Puebla', 'N.L.': 'Nuevo León' };
function estadoDe(ciudad) { const c = String(ciudad || ''); if (c === 'Ciudad de México') return 'Ciudad de México'; const ab = c.split(', ').pop(); return EDO_ABBR[ab] || ''; }
function destinos() { const C = CAT(); if (!C.HOSPITALES) return []; if (!_dest) _dest = C.HOSPITALES.map(h => ({ id: 'h' + h.id, hospId: h.id, nombre: h.alias, oficial: h.id + ' · ' + h.nombre, tipo: h.tipo, ciudad: h.ciudad, estado: estadoDe(h.ciudad), conAlimentos: !!h.conAlimentos })); return _dest; }
// ESTADOS DEL SELECTOR DE DESTINO: los que tienen unidades Star Médica + los vigentes para «Otro destino» (orden alfabético).
function estadosDestino() { const s = new Set(destinos().map(d => d.estado).filter(Boolean).concat(estados())); return [...s].sort((a, b) => a.localeCompare(b, 'es')); }
// Estados para «Otro destino» (CLIENT CONFIRMED — «Ciudades de viaje»): solo los vigentes; la ciudad se captura como texto (el libro no trae ciudades).
function estados() { return CAT().ESTADOS_VIGENTES || []; }

// CONCEPTOS DEL GASTO ESTIMADO = columna «Solicitud» del catálogo de documentos (CLIENT CONFIRMED). Ver uscat-data.js › CONCEPTOS_SOLICITUD.
function conceptos() { return CAT().CONCEPTOS_SOLICITUD || []; }

// PRE disponible por entidad: ya NO vive aquí. La fuente única es el modelo canónico de presupuesto (uspres-data.js › window.SMV_PRES),
// que también alimenta el Inicio y el Monitor. El colaborador nunca ve cifras de la entidad (solo si admite nuevas solicitudes).

// Hospitales con Dirección de Hospital vacante (la solicitud se dirige a Capital Humano Corporativo / «CH Central»).
const DIRECCION_VACANTE = [];

// MENSAJES DEL SISTEMA (cliente: «tabla de mensajes de sistema» mantenible) — semilla del catálogo: clave → texto. La pantalla de mantenimiento
// pertenece a Catálogos y parámetros; aquí solo se centralizan los textos de la solicitud para que no vivan fijos en la interfaz.
const MENSAJES = {
  vuelosPerdidos: 'Los vuelos perdidos se reportan y registran en el Portal.',
  vueloViaticos: 'La opción de vuelo la determina Viáticos después de aprobarse la solicitud; la tarifa autorizada de vuelo se muestra como referencia y no se suma al estimado.',
  horaVuelo: 'Hora de salida aproximada o preferida para este tramo; la reservación la gestiona Viáticos.',
  depositos: 'Los depósitos de viáticos se realizan los días martes y jueves.',
  destinosMotivo: 'Los destinos deben coincidir con el motivo del viaje. Si viajas a algún destino por otro motivo, crea otra solicitud en la misma semana.',
  hospedajeHospital: 'Con este motivo el hospedaje es en el hospital destino. Si el hospital no confirma habitación, se generará la solicitud de hospedaje en hotel.',
  hospedajeHospitalPerfil: 'Por tu perfil el hospedaje es en el hospital destino. Si el hospital no confirma habitación, se generará la solicitud de hospedaje en hotel.',
  hospedajeHotel: 'El hospedaje se solicita en hotel; Viáticos lo gestiona al aprobarse la solicitud.',
  otroDestinoHotel: 'Con «Otro destino» el hospedaje es en hotel: al aprobarse se genera en automático la solicitud de hospedaje a Viáticos.',
  presupuestoEnvio: 'Al enviar, el estimado queda como pendiente de aprobación dentro del presupuesto de tu entidad; al aprobarse pasa a comprometido.',
  presupuestoBloqueo: 'El estimado de tu viaje supera el disponible de tu entidad presupuestal (considerando las solicitudes pendientes de aprobación). La solicitud no se envió y sigue En proceso con su folio y todos sus datos. Avisa a tu Director para que gestione un suplemento: cuando se aplique recibirás un aviso y podrás retomarla.',
  presupuestoCambio: 'Al enviar se revalidó el presupuesto con el saldo de ese momento: durante la captura otra operación de tu entidad utilizó parte del disponible y el estimado de este viaje ya no cabe. La solicitud no se envió y sigue En proceso con su folio y todos sus datos. Avisa a tu Director para que gestione un suplemento.',
  presupuestoNoDisponible: 'No fue posible consultar la disponibilidad presupuestal en este momento. La solicitud no se envió sin validar: sigue En proceso con su folio y todos sus datos. Vuelve a intentar la validación.',
  sinCuentaAlternativa: '',
  pagoAlternativa: 'Se registran únicamente los datos requeridos para identificar la cuenta alternativa. El Portal nunca solicita CVV, NIP ni contraseñas.',
  pagoCorporativa: 'Los gastos del viaje se pagan con la tarjeta corporativa del colaborador.',
  proyecto: 'El nombre del proyecto se guarda con la solicitud para los reportes por proyecto.',
  otrosGastosDias: 'Otros gastos estimados aplica a viajes de más de 7 días.',
  autoSegmento: 'Importes estimados de este destino. Si cambias el medio de transporte, se quitan del estimado.'
};

// SOLICITUDES YA ENVIADAS DE LOS DATOS SINTÉTICOS — escenario de viaje compartido. UNA solicitud = UN folio = UN dueño (solicitante);
// los acompañantes internos REFERENCIAN la misma solicitud por el id del registro canónico. MODELO POR DESTINO (CLIENT VALIDATION 2026-10-05):
// segmentos[n] = destino + fechas + alimentos + medio + hospedaje propios; la ruta se deriva (el segmento n sale del destino n-1).
const SEED_REQS = [
  { folio: '00050', uid: 'u03', userId: 'u03', status: 'pendAut', motivo: 'Operación', motivoCode: 'OPER',
    segmentos: [
      { n: 1, tipo: 'hospital', id: 'h1104', hospId: '1104', label: 'HSM Ciudad Juárez', inicio: '13/10/2026', fin: '14/10/2026', dias: 2, noches: 1, medio: 'Auto particular', comidas: ['Cena'], hospAlim: true, hospedaje: 'hotel' },
      { n: 2, tipo: 'hospital', id: 'h1125', hospId: '1125', label: 'HSM Monterrey', inicio: '14/10/2026', fin: '15/10/2026', dias: 2, noches: 1, medio: 'Auto particular', comidas: ['Cena'], hospAlim: true, hospedaje: 'hotel' } ],
    ruta: { origen: { id: 'h1114', label: 'HSM Chihuahua' }, tramos: [
      { n: 1, desde: { id: 'h1114', label: 'HSM Chihuahua' }, hasta: { id: 'h1104', label: 'HSM Ciudad Juárez' } },
      { n: 2, desde: { id: 'h1104', label: 'HSM Ciudad Juárez' }, hasta: { id: 'h1125', label: 'HSM Monterrey' } } ] },
    gastos: [{ concepto: 'Hospedaje', importe: 5600, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 1600, origen: 'tarifa' }, { concepto: 'Gasolina', importe: 1800, origen: 'captura' }, { concepto: 'Casetas', importe: 900, origen: 'captura' }],
    dest: 'HSM Ciudad Juárez · HSM Monterrey', fechas: '13/10/2026 – 15/10/2026', nights: '3 días · 2 noches', total: 9900, hasta: false,
    firstLabel: 'Dirección Corporativa', exceso: false, when: '25/09/2026 12:40', at: 1, perfilFolio: 'Director', entidad: 'HSM Chihuahua',
    pago: { metodo: 'debito', label: 'Tarjeta de débito', origen: 'SAP', referencia: '•••• 9054', texto: 'Tarjeta de débito · •••• 9054' },
    justificacion: 'Supervisión de la operación de hospedaje y alimentos en HSM Ciudad Juárez y HSM Monterrey con el equipo de la red norte; el recorrido en auto permite visitar ambas unidades en la misma semana.',
    observaciones: 'Salida 06:00 desde HSM Chihuahua; regreso por carretera federal 45.',
    // DESVIACIÓN DEMO: hotel externo en HSM Monterrey con perfil cuyo hospedaje es en hospital → documento de autorización del excedente (evidencia de US-08).
    excesos: ['Hospedaje: el perfil indica hospedaje en hospital; la solicitud pide hotel externo en los 2 destinos (ocupación de habitaciones del hospital por remodelación).'],
    evidencia: [{ key: 'ev1', name: 'Agenda-supervision-red-norte.pdf' }, { key: 'exc', name: 'Autorizacion-hotel-externo-remodelacion-HSM.pdf' }],
    // VIAJE EN GRUPO (cliente 2026-10-06): cada acompañante interno tiene SU PROPIA solicitud ligada por grupo.
    grupo: 'G-00050', rolGrupo: 'origen', participantes: [{ personId: 'u01', folio: '00051' }, { personId: 'u02', folio: '00052' }],
    acompanantes: [{ personId: 'u02', addedAt: '25/09/2026 12:31', addedBy: 'u03' }, { personId: 'u01', addedAt: '25/09/2026 12:32', addedBy: 'u03' }] },
  // Solicitudes INDIVIDUALES de los acompañantes del grupo G-00050: datos del viaje compartidos (solo lectura, copia del origen al generarse)
  // + perfil, autorización, montos y estatus PROPIOS. 00051 = generada y pendiente de revisar/enviar por la acompañante (En captura).
  { folio: '00051', uid: 'u01', userId: 'u01', status: 'captura', segmentos: [
      { n: 1, tipo: 'hospital', id: 'h1104', hospId: '1104', label: 'HSM Ciudad Juárez', inicio: '13/10/2026', fin: '14/10/2026', dias: 2, noches: 1, medio: 'Auto particular', comidas: ['Cena'], hospAlim: true, hospedaje: 'hospital' },
      { n: 2, tipo: 'hospital', id: 'h1125', hospId: '1125', label: 'HSM Monterrey', inicio: '14/10/2026', fin: '15/10/2026', dias: 2, noches: 1, medio: 'Auto particular', comidas: ['Cena'], hospAlim: true, hospedaje: 'hospital' } ],
    ruta: { origen: { id: 'h1114', label: 'HSM Chihuahua' }, tramos: [
      { n: 1, desde: { id: 'h1114', label: 'HSM Chihuahua' }, hasta: { id: 'h1104', label: 'HSM Ciudad Juárez' } },
      { n: 2, desde: { id: 'h1104', label: 'HSM Ciudad Juárez' }, hasta: { id: 'h1125', label: 'HSM Monterrey' } } ] },
    dest: 'HSM Ciudad Juárez · HSM Monterrey', fechas: '13/10/2026 – 15/10/2026', nights: '3 días · 2 noches', motivo: 'Operación', motivoCode: 'OPER', acompanantes: [],
    grupo: 'G-00050', rolGrupo: 'acompanante', origenFolio: '00050', origenUid: 'u03',
    gastos: [{ concepto: 'Hospedaje', importe: 0, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 1600, origen: 'tarifa' }], total: 1600, hasta: false, perfilFolio: 'Mando medio', entidad: 'Dirección Comercial y de Negocios',
    firstLabel: '', cadena: [], exceso: false, when: '25/09/2026 12:40', at: 2, pago: { metodo: 'debito', label: 'Tarjeta de débito', origen: 'SAP', referencia: '•••• 2205', texto: 'Tarjeta de débito · •••• 2205' }, justificacion: 'Acompaña la supervisión de la red norte para el seguimiento comercial en ambas unidades.' },
  { folio: '00052', uid: 'u02', userId: 'u02', status: 'pendAut', segmentos: [
      { n: 1, tipo: 'hospital', id: 'h1104', hospId: '1104', label: 'HSM Ciudad Juárez', inicio: '13/10/2026', fin: '14/10/2026', dias: 2, noches: 1, medio: 'Auto particular', comidas: ['Cena'], hospAlim: true, hospedaje: 'hospital' },
      { n: 2, tipo: 'hospital', id: 'h1125', hospId: '1125', label: 'HSM Monterrey', inicio: '14/10/2026', fin: '15/10/2026', dias: 2, noches: 1, medio: 'Auto particular', comidas: ['Cena'], hospAlim: true, hospedaje: 'hospital' } ],
    ruta: { origen: { id: 'h1114', label: 'HSM Chihuahua' }, tramos: [
      { n: 1, desde: { id: 'h1114', label: 'HSM Chihuahua' }, hasta: { id: 'h1104', label: 'HSM Ciudad Juárez' } },
      { n: 2, desde: { id: 'h1104', label: 'HSM Ciudad Juárez' }, hasta: { id: 'h1125', label: 'HSM Monterrey' } } ] },
    dest: 'HSM Ciudad Juárez · HSM Monterrey', fechas: '13/10/2026 – 15/10/2026', nights: '3 días · 2 noches', motivo: 'Operación', motivoCode: 'OPER', acompanantes: [],
    grupo: 'G-00050', rolGrupo: 'acompanante', origenFolio: '00050', origenUid: 'u03',
    gastos: [{ concepto: 'Hospedaje', importe: 0, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 1600, origen: 'tarifa' }], total: 1600, hasta: false, perfilFolio: 'Mando medio', entidad: 'HSM Chihuahua',
    // Cadena por estructura de SAP (HSM Chihuahua 1114: director u03 → autorizador corporativo ZA02 u04); corregido 2026-10-13 (antes nombraba a una persona inexistente en el registro).
    firstLabel: 'Dirección de Hospital (Ricardo Fuentes Ávila)', cadena: [{ label: 'Dirección de Hospital', person: 'Ricardo Fuentes Ávila' }, { label: 'Dirección Corporativa', person: 'Mónica Herrera Luna' }], cadenaIds: ['u03', 'u04'],
    cadenaInfo: [{ ctx: 'HSM Chihuahua · director del hospital (función 80001076)' }, { ctx: 'Dirección Comercial y de Negocios · autorizador corporativo de la unidad organizativa (ZA02)' }], decisiones: [], exceso: false, when: '26/09/2026 09:10', at: 3, pago: { metodo: 'debito', label: 'Tarjeta de débito', origen: 'SAP', referencia: '•••• 6612', texto: 'Tarjeta de débito · •••• 6612' }, justificacion: 'Acompaña la supervisión de la red norte para el seguimiento de capital humano en ambas unidades.', evidencia: [{ key: 'ev1', name: 'Agenda-supervision-red-norte.pdf' }] },
  // SOLICITUDES A NOMBRE DE VIAJEROS EXTERNOS (mismo modelo de solicitud/segmentos): uid = travelerId = id del registro de externos (nunca un usuario del Portal),
  // createdBy = usuario de Capital Humano HSM que captura y opera · respId = colaborador responsable (entidad presupuestal) · dirCorpId = Dirección Corporativa elegida en pantalla.
  // Sin anticipo (etapa «No aplica · viajero externo»); cadena Dirección de Hospital → Dirección Corporativa seleccionada → Capital Humano Corporativo.
  { folio: '00044', uid: 'x01', travelerType: 'externo', travelerId: 'x01', userId: 'u02', createdBy: 'u02', respId: 'u01', dirCorpId: 'u04', status: 'enProceso', motivo: 'Entrevista', motivoCode: null,
    segmentos: [{ n: 1, tipo: 'corporativo', id: 'h1100', hospId: '1100', label: 'Corporativo', inicio: '08/06/2026', fin: '09/06/2026', dias: 2, noches: 1, medio: 'Autobús', comidas: ['Comida', 'Cena'], hospAlim: false, hospedaje: 'sinHospedaje' }],
    ruta: { origen: { id: '', label: 'Ciudad Juárez, Chihuahua' }, tramos: [{ n: 1, desde: { id: '', label: 'Ciudad Juárez, Chihuahua' }, hasta: { id: 'h1100', label: 'Corporativo' } }] },
    gastos: [{ concepto: 'Alimentos', importe: 1300, origen: 'tarifa' }], dest: 'Corporativo', fechas: '08/06/2026 – 09/06/2026', nights: '2 días · 1 noche', total: 1300, hasta: false, acompanantes: [],
    pago: { tipo: 'noAplica', label: 'No aplica', referencia: '—', texto: 'No aplica · sin hotel externo' }, perfilFolio: 'Viajero externo', entidad: 'Dirección Comercial y de Negocios',
    firstLabel: 'Dirección de Hospital', cadena: [{ label: 'Dirección de Hospital', person: 'Ricardo Fuentes Ávila' }, { label: 'Dirección Corporativa', person: 'Mónica Herrera Luna' }, { label: 'Capital Humano Corporativo', person: 'Alfredo Cacho' }],
    justificacion: 'Entrevista final de la candidata para la Gerencia de Estrategias Comerciales.', exceso: false, when: '25/05/2026 11:05', at: 4 },
  { folio: '00040', uid: 'x02', travelerType: 'externo', travelerId: 'x02', userId: 'u02', createdBy: 'u02', respId: 'u07', dirCorpId: 'u04', status: 'aprobada', motivo: 'Reunión sindical', motivoCode: null,
    segmentos: [{ n: 1, tipo: 'hospital', id: 'h1125', hospId: '1125', label: 'HSM Monterrey', inicio: '17/06/2026', fin: '18/06/2026', dias: 2, noches: 1, medio: 'Avión', horaVueloAprox: '07:30', comidas: ['Cena'], hospAlim: true, hospedaje: 'hospital' }],
    ruta: { origen: { id: '', label: 'Chihuahua, Chihuahua' }, tramos: [{ n: 1, desde: { id: '', label: 'Chihuahua, Chihuahua' }, hasta: { id: 'h1125', label: 'HSM Monterrey' } }] },
    gastos: [{ concepto: 'Hospedaje', importe: 0, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 800, origen: 'tarifa' }], dest: 'HSM Monterrey', fechas: '17/06/2026 – 18/06/2026', nights: '2 días · 1 noche', total: 800, hasta: false, acompanantes: [],
    pago: { tipo: 'noAplica', label: 'No aplica', referencia: '—', texto: 'No aplica · sin hotel externo' }, perfilFolio: 'Viajero externo', entidad: 'HSM Chihuahua',
    firstLabel: 'Dirección de Hospital', cadena: [{ label: 'Dirección de Hospital', person: 'Ricardo Fuentes Ávila' }, { label: 'Dirección Corporativa', person: 'Mónica Herrera Luna' }, { label: 'Capital Humano Corporativo', person: 'Alfredo Cacho' }],
    justificacion: 'Reunión de la comisión mixta sindical en HSM Monterrey.', exceso: false, when: '02/06/2026 10:20', at: 5 }
];
// COMPROBACIÓN DE UN ACOMPAÑANTE (CLIENT CONFIRMED 2026-10-06): el único concepto de transporte comprobable es Taxi (el medio del viaje compartido no cambia).
const COMPROBACION_TRANSPORTE_ACOMPANANTE = ['Taxi'];

return { COMPROBACION_TRANSPORTE_ACOMPANANTE, PARAMS, get MOTIVOS() { return motivos(); }, motivoCode, MOTIVOS_HOSPITAL_FORZOSO, MOTIVOS_OTRO_DESTINO, hospedajeDe, CAPACITACION_PERFILES,
  get DESTINOS() { return destinos(); }, get ESTADOS_DESTINO() { return estadosDestino(); }, get ESTADOS() { return estados(); }, get CONCEPTOS() { return conceptos(); }, DIRECCION_VACANTE, MENSAJES, SEED_REQS, FORMAS_PAGO, TIPOS_TARJETA, CUENTA_ALT_DIGITOS };
})();
