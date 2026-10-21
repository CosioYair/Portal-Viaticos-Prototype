if (!window.SMV_PRES) { (function(){
// =====================================================================================================
// PRESUPUESTO · MODELO CANÓNICO ÚNICO (US-06 Disponibilidad presupuestal · US-07 Administración del presupuesto)
// Única fuente de presupuesto del prototipo: la consumen el Inicio (bloques organizacionales y precondición del
// colaborador), Creación (validación al enviar), el Monitor (Resumen · Movimientos · detalle de bolsa), las alertas
// y la cancelación (liberación automática). Ninguna pantalla guarda cifras de presupuesto propias.
// Datos SINTÉTICOS (repositorio público): importes, folios y fechas inventados.
// =====================================================================================================

// --- Configuración (todo valor no confirmado por el cliente vive AQUÍ, nunca disperso en pantallas) ---
const CONFIG = {
  ejercicio: 2026,
  // Umbrales de alerta CONFIGURABLES. Valores DEMO = severidad global vigente del prototipo (regla 244: 0–70 % verde ·
  // 71–84 % amarillo · 85 % o más rojo). US-06 menciona >80 % / >90 % como referencia del alcance: DECISIÓN PENDIENTE del cliente.
  umbrales: { advertencia: 70, critico: 85 },
  // PRE disponible = Planeado − Comprometido (US-06 · regla 14). Ampliado se guarda APARTE; US-07 dice que «suma al disponible».
  // Cómo suma (¿amplía el Planeado o es un concepto propio?) está PENDIENTE: este indicador permite cambiarlo sin tocar pantallas.
  ampliadoSumaAlDisponible: true,
  // «Admite nuevas solicitudes» = la entidad tiene presupuesto del ejercicio y PRE disponible > admiteMinimo (PENDIENTE de definición).
  admiteMinimo: 0,
  // Etiquetas aprobadas: Inicio (regla 261, «Planeado − Estimado») y fórmula del Monitor (US-06 / US-07). Tensión documentada.
  etiquetaUtilizacionInicio: 'Planeado − Estimado',
  formula: 'PRE disponible = Planeado + Suplementos − Bloqueos − Comprometido',
  // Ejercicios que admite la carga de bolsas (actual y siguiente).
  ejerciciosCarga: [2026, 2027]
};

// --- Catálogos de apoyo para la carga de bolsas (DATOS DEMO centralizados; los catálogos oficiales de CECO, cuentas y tipo de
// empleado vienen del ERP y están PENDIENTES). Selectores dependientes: sociedad → entidad (Hospital / Dirección Corporativa) → CECO.
const CECOS = {
  'HSM Chihuahua': ['CECO 2001-HSMCH', 'CECO 2210-HSMCH', 'CECO 2305-HSMCH'],
  'HSM Querétaro': ['CECO 2001-HSMQRO', 'CECO 2210-HSMQRO'],
  'Dirección Comercial y de Negocios': ['CECO 4100-CO', 'CECO 4110-CO'],
  'Dirección de Capital Humano': ['CECO 4300-CO', 'CECO 4310-CO'],
  'Dirección General Adjunta': ['CECO 4000-CO'],
  'Corporativo': ['CECO 4206-CO', 'CECO 4207-CO'],
  'Tecnologías de la Información': ['CECO 4500-CO']
};
// CATÁLOGO DE ENTIDADES PARA ALTA DE BOLSAS = el MISMO de las demás pantallas: hospitales de «Cat. Hospital» (uscat-data.js ›
// HOSPITALES, confirmado por el cliente; se muestran con su alias) + las Direcciones Corporativas del modelo. Sociedad = «Cat. RFC»
// (uscat-data.js › SOCIEDADES). La sociedad de cada hospital del catálogo es 1100 (Star Médica S.A. de C.V.) — supuesto DEMO
// centralizado aquí: la relación oficial sociedad → hospital / dirección viene del ERP y está PENDIENTE.
const CAT = () => window.SMV_CAT || {};
function entidadesCatalogo() {
  const hs = (CAT().HOSPITALES || []).filter(h => h.tipo === 'hospital').map(h => ({ id: h.alias, tipo: 'Hospital', sociedad: '1100', director: null, hospId: h.id }));
  const out = ENTIDADES.map(e => ({ ...e, hospId: (hs.find(h => h.id === e.id) || {}).hospId }));
  hs.forEach(h => { if (!out.some(e => e.id === h.id)) out.push(h); });
  return out;
}
function cecosDe(entidad) {
  if (CECOS[entidad]) return CECOS[entidad];
  const e = entidadesCatalogo().find(x => x.id === entidad); if (!e) return [];
  // CECO demo con la clave del hospital del catálogo (catálogo oficial de CECO del ERP PENDIENTE).
  return e.hospId ? ['CECO 2001-' + e.hospId, 'CECO 2210-' + e.hospId] : [];
}
const CUENTAS = ['6101-001 · Viáticos nacionales', '6101-002 · Viáticos internacionales'];
const TIPOS_EMPLEADO = ['Personal interno', 'Viajeros externos'];

// --- Folios bloqueados por presupuesto (solicitudes En proceso que no pudieron enviarse). Los avisos «Avisar a mi Director»
// de la sesión se suman en vivo. Cuando una carga registra un Suplemento para su entidad, se desbloquean y se avisa al solicitante.
const BLOQUEOS = [
  { folio: '00049', entidad: 'Corporativo', uid: 'u13', estimado: 5200, when: '08/10/2026 10:20' },
  { folio: '00050', entidad: 'Corporativo', uid: 'u08', estimado: 3900, when: '09/10/2026 12:05' }
];

// --- Entidades presupuestales: Hospital y Dirección Corporativa son entidades DISTINTAS (nunca un campo mixto) ---
// director = destinatario de «Avisar a mi Director» y de las alertas de la entidad (SUPUESTO DEMO centralizado: la regla
// exacta de destinatario — estructura del ERP / línea de reporte — está pendiente).
const ENTIDADES = [
  { id: 'HSM Chihuahua', tipo: 'Hospital', sociedad: '1100', director: 'u03' },
  { id: 'HSM Querétaro', tipo: 'Hospital', sociedad: '1100', director: null },
  { id: 'Dirección Comercial y de Negocios', tipo: 'Dirección Corporativa', sociedad: '4100', director: 'u04' },
  { id: 'Dirección de Capital Humano', tipo: 'Dirección Corporativa', sociedad: '4100', director: 'u05' },
  { id: 'Dirección General Adjunta', tipo: 'Dirección Corporativa', sociedad: '1100', director: 'u06' },
  { id: 'Corporativo', tipo: 'Dirección Corporativa', sociedad: '4800', director: 'u06' },
  { id: 'Tecnologías de la Información', tipo: 'Dirección Corporativa', sociedad: '4100', director: null }
];

// --- Adscripción colaborador → entidad presupuestal (UN solo punto de resolución) ---
// Por defecto: hospital del colaborador (personal hospitalario) o su dirección corporativa. Excepciones explícitas aquí.
const ADSCRIPCION = { u06: 'Dirección General Adjunta', u09: 'Corporativo', u10: 'Corporativo', u11: 'Corporativo', u13: 'Corporativo' };

// --- Alcance del Monitor por rol (US-06 / US-07; «propia» = la entidad de adscripción del usuario) ---
// pendiente = alcance no confirmado por el cliente (se usa como demo y se documenta, nunca se presenta en la interfaz como provisional).
const ALCANCE = {
  DIR: { modo: 'propia' }, CHC: { modo: 'propia' },
  // DGA y Contraloría: alcance CONSOLIDADO completo (cliente 2026-10-12); ambas autorizan suplementos.
  DGA: { modo: 'consolidado' },
  VIA: { modo: 'consolidado', pendiente: true },
  CON: { modo: 'consolidado' }, CTR: { modo: 'consolidado' },
  ADM: { modo: 'consolidado', pendiente: true }
};

// --- Bolsas presupuestales: 7 dimensiones (sociedad · entidad · CECO · cuenta contable · proyecto · tipo de empleado · año) ---
// Importes por estado (snapshot persistido). comprometido INCLUYE en tránsito y ejercido (alineación 25/09/2026).
// (sin tipo de empleado ni proyecto: no forman parte de la carga del cliente, 2026-10-12)
// ESTRUCTURA DE LA CARGA DEL CLIENTE (2026-10-12): la bolsa se identifica por los campos de su archivo de presupuesto
// Soc. · División (clave del hospital) / Nombre de la Div. · Denominación (código del hospital) · Cta. mayor (cuenta de gasto) ·
// Texto explicativo (descripción) · Ce.coste (CECO) · Posición Ptto (posición presupuestal) · CeBe (centro de beneficio) + ejercicio,
// con el presupuesto ANUAL distribuido por MES (cada mes con su monto). Estos campos SOLO llegan por carga masiva (sin catálogos en el Portal).
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const BOLSAS = [
  { id: 'B-CHI-01', anio: 2026, entidad: 'HSM Chihuahua', ceco: 'CECO 2001-HSMCH', cuenta: '6101-001 · Viáticos nacionales', proyecto: 'Operación hospitalaria', tipoEmpleado: 'Personal interno',
    desde: '01/01/2026', hasta: '31/12/2026', estado: 'Activa', planeado: 900000, ampliado: 0, comprometido: 702000, transito: 58000, ejercido: 480000, liberado: 12400 },
  { id: 'B-CHI-02', anio: 2026, entidad: 'HSM Chihuahua', ceco: 'CECO 2210-HSMCH', cuenta: '6101-001 · Viáticos nacionales', proyecto: 'Viajeros externos del hospital', tipoEmpleado: 'Viajeros externos',
    desde: '01/01/2026', hasta: '31/12/2026', estado: 'Activa', planeado: 300000, ampliado: 0, comprometido: 210000, transito: 9000, ejercido: 132000, liberado: 0 },
  { id: 'B-QRO-01', anio: 2026, entidad: 'HSM Querétaro', ceco: 'CECO 2001-HSMQRO', cuenta: '6101-001 · Viáticos nacionales', proyecto: 'Operación hospitalaria', tipoEmpleado: 'Personal interno',
    desde: '01/01/2026', hasta: '31/12/2026', estado: 'Activa', planeado: 600000, ampliado: 60000, comprometido: 600000, transito: 31000, ejercido: 455000, liberado: 8200 },
  { id: 'B-COM-01', anio: 2026, entidad: 'Dirección Comercial y de Negocios', ceco: 'CECO 4100-CO', cuenta: '6101-001 · Viáticos nacionales', proyecto: 'Operación comercial', tipoEmpleado: 'Personal interno',
    desde: '01/01/2026', hasta: '31/12/2026', estado: 'Activa', planeado: 550000, ampliado: 0, bloqueado: 10000, comprometido: 309000, transito: 21000, ejercido: 198000, liberado: 15500 },
  { id: 'B-COM-25', anio: 2025, entidad: 'Dirección Comercial y de Negocios', ceco: 'CECO 4100-CO', cuenta: '6101-001 · Viáticos nacionales', proyecto: 'Operación comercial', tipoEmpleado: 'Personal interno',
    desde: '01/01/2025', hasta: '31/12/2025', estado: 'Inactiva', planeado: 500000, ampliado: 0, comprometido: 471300, transito: 0, ejercido: 471300, liberado: 22100 },
  { id: 'B-CH-01', anio: 2026, entidad: 'Dirección de Capital Humano', ceco: 'CECO 4300-CO', cuenta: '6101-001 · Viáticos nacionales', proyecto: 'Operación de Capital Humano', tipoEmpleado: 'Personal interno',
    desde: '01/01/2026', hasta: '31/12/2026', estado: 'Activa', planeado: 420000, ampliado: 0, comprometido: 240000, transito: 14000, ejercido: 151000, liberado: 0 },
  { id: 'B-DGA-01', anio: 2026, entidad: 'Dirección General Adjunta', ceco: 'CECO 4000-CO', cuenta: '6101-001 · Viáticos nacionales', proyecto: 'Dirección General Adjunta', tipoEmpleado: 'Personal interno',
    desde: '01/01/2026', hasta: '31/12/2026', estado: 'Activa', planeado: 800000, ampliado: 0, comprometido: 472000, transito: 26000, ejercido: 296000, liberado: 4600 },
  { id: 'B-COR-01', anio: 2026, entidad: 'Corporativo', ceco: 'CECO 4206-CO', cuenta: '6101-001 · Viáticos nacionales', proyecto: 'Operación corporativa', tipoEmpleado: 'Personal interno',
    desde: '01/01/2026', hasta: '31/12/2026', estado: 'Activa', planeado: 300000, ampliado: 0, comprometido: 300000, transito: 12000, ejercido: 238000, liberado: 0 }
];
// Campos de carga de cada bolsa semilla (DATOS SINTÉTICOS con la forma del archivo del cliente).
const CARGA_CAMPOS = {
  'B-CHI-01': { sociedad: '1100', division: '14CH', divNombre: 'STAR MÉDICA CHIHUAHUA', denominacion: 'SM CHIHUAHUA', ctaMayor: '6103011000', texto: 'Viáticos nacionales', posPpto: 'G610301100', cebe: 'ADS14CH000', pesos: [7, 8, 9, 8, 9, 9, 7, 8, 9, 9, 9, 8] },
  'B-CHI-02': { sociedad: '1100', division: '14CH', divNombre: 'STAR MÉDICA CHIHUAHUA', denominacion: 'SM CHIHUAHUA', ctaMayor: '6173001000', texto: 'Viajes de viajeros externos', posPpto: 'G617300100', cebe: 'CEG14CH000', pesos: [0, 6, 9, 9, 9, 10, 8, 9, 10, 10, 10, 10] },
  'B-QRO-01': { sociedad: '1100', division: '13QR', divNombre: 'STAR MÉDICA QUERÉTARO', denominacion: 'SM QUERETARO', ctaMayor: '6103011000', texto: 'Viáticos nacionales', posPpto: 'G610301100', cebe: 'ADS13QR000', pesos: [8, 8, 8, 8, 8, 9, 8, 8, 8, 9, 9, 9] },
  'B-COM-01': { sociedad: '4100', division: '11NM', divNombre: 'STAR MÉDICA', denominacion: 'SM CORPO', ctaMayor: '6173002000', texto: 'Viáticos dirección comercial', posPpto: 'G617300200', cebe: 'CEP11NM000', pesos: [5, 7, 9, 9, 9, 9, 7, 8, 9, 10, 10, 8] },
  'B-COM-25': { sociedad: '4100', division: '11NM', divNombre: 'STAR MÉDICA', denominacion: 'SM CORPO', ctaMayor: '6173002000', texto: 'Viáticos dirección comercial', posPpto: 'G617300200', cebe: 'CEP11NM000', pesos: [8, 8, 8, 8, 9, 9, 8, 8, 8, 9, 9, 8] },
  'B-CH-01': { sociedad: '4100', division: '11NM', divNombre: 'STAR MÉDICA', denominacion: 'SM CORPO', ctaMayor: '6173004000', texto: 'Viáticos capital humano', posPpto: 'G617300400', cebe: 'CEG11NM000', pesos: [6, 8, 8, 9, 9, 9, 8, 8, 9, 9, 9, 8] },
  'B-DGA-01': { sociedad: '1100', division: '11NM', divNombre: 'STAR MÉDICA', denominacion: 'SM CORPO', ctaMayor: '6103011000', texto: 'Viáticos dirección general adjunta', posPpto: 'G610301100', cebe: 'ADS11NM000', pesos: [8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9] },
  'B-COR-01': { sociedad: '4800', division: '11NM', divNombre: 'STAR MÉDICA', denominacion: 'SM CORPO', ctaMayor: '6173003000', texto: 'Viáticos corporativo', posPpto: 'G617300300', cebe: 'DAD11NM000', pesos: [9, 9, 9, 9, 8, 8, 8, 8, 8, 8, 8, 8] }
};
// Reparte un importe anual en 12 montos mensuales variables (enteros que suman exactamente el total).
function repartir(total, pesos) { const s = pesos.reduce((n, x) => n + x, 0) || 1; const out = pesos.map(w => Math.floor(total * w / s)); out[pesos.indexOf(Math.max(...pesos))] += total - out.reduce((n, x) => n + x, 0); return out; }
BOLSAS.forEach(b => { const cc = CARGA_CAMPOS[b.id] || {}; const { pesos, ...rest } = cc; Object.assign(b, rest, { meses: repartir(b.planeado, pesos || Array(12).fill(1)) }); delete b.tipoEmpleado; delete b.proyecto; });
// Vigencia de la bolsa = del primer al último mes con presupuesto del ejercicio.
function vigenciaDe(b) { const m = b.meses || []; const i = m.findIndex(x => x > 0), j = 11 - [...m].reverse().findIndex(x => x > 0); if (i < 0) return { desde: '—', hasta: '—', nMeses: 0 };
  const last = new Date(b.anio, j + 1, 0).getDate(), pad = n => String(n).padStart(2, '0'); return { desde: '01/' + pad(i + 1) + '/' + b.anio, hasta: last + '/' + pad(j + 1) + '/' + b.anio, nMeses: m.filter(x => x > 0).length }; }
BOLSAS.forEach(b => { const v = vigenciaDe(b); b.desde = v.desde; b.hasta = b.estado === 'Inactiva' ? b.hasta : v.hasta; });
// Llave única de bolsa (combinación de la carga por ejercicio).
const llave = b => [b.sociedad, b.division, b.ceco, b.ctaMayor, b.posPpto, b.cebe, b.anio].map(x => String(x || '').trim().toUpperCase()).join('|');
// División → entidad presupuestal: hospital = su hospital del «Cat. Hospital» (por clave de división o por Nombre de la Div.);
// la división corporativa (11NM · SM CORPO) se reparte por CeBe/CECO a las Direcciones Corporativas (tabla DEMO; la oficial viene del ERP).
const DIVISIONES = { '14CH': 'HSM Chihuahua', '13QR': 'HSM Querétaro' };
const CORP_CEBE = { ADS: 'Dirección General Adjunta', CEP: 'Dirección Comercial y de Negocios', CEG: 'Dirección de Capital Humano', DAD: 'Corporativo', TIN: 'Tecnologías de la Información' };
function entidadDeCarga(r) {
  if (DIVISIONES[r.division]) return DIVISIONES[r.division];
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
  const h = ((window.SMV_CAT || {}).HOSPITALES || []).find(x => x.tipo === 'hospital' && norm(x.nombre) === norm(r.divNombre));
  if (h) return h.alias;
  if (String(r.division).toUpperCase() === '11NM') return CORP_CEBE[String(r.cebe || '').slice(0, 3).toUpperCase()] || 'Corporativo';
  return null;
}

// --- Movimientos presupuestales (APPEND-ONLY: nunca se sobrescriben ni se borran) ---
// tipo → concepto afectado: Carga (Planeado +) · Suplemento aplicado (Ampliado +) · Compromiso (Comprometido +) ·
// Transferencia (En tránsito +, dentro de Comprometido) · Contabilización (Ejercido +, dentro de Comprometido) ·
// Liberación por cancelación (Comprometido −, Liberado +). Todo movimiento conserva su folio o evento de origen.
const MOVIMIENTOS = [
  { id: 'M-0001', when: '02/01/2026 09:00', bolsa: 'B-CHI-01', tipo: 'Carga', importe: 900000, folio: '—', evento: 'Carga del presupuesto 2026', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0002', when: '02/01/2026 09:00', bolsa: 'B-CHI-02', tipo: 'Carga', importe: 300000, folio: '—', evento: 'Carga del presupuesto 2026', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0003', when: '02/01/2026 09:05', bolsa: 'B-QRO-01', tipo: 'Carga', importe: 600000, folio: '—', evento: 'Carga del presupuesto 2026', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0004', when: '02/01/2026 09:10', bolsa: 'B-COM-01', tipo: 'Carga', importe: 550000, folio: '—', evento: 'Carga del presupuesto 2026', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0005', when: '02/01/2026 09:12', bolsa: 'B-CH-01', tipo: 'Carga', importe: 420000, folio: '—', evento: 'Carga del presupuesto 2026', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0006', when: '02/01/2026 09:14', bolsa: 'B-DGA-01', tipo: 'Carga', importe: 800000, folio: '—', evento: 'Carga del presupuesto 2026', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0007', when: '02/01/2026 09:16', bolsa: 'B-COR-01', tipo: 'Carga', importe: 300000, folio: '—', evento: 'Carga del presupuesto 2026', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0000', when: '02/01/2025 09:00', bolsa: 'B-COM-25', tipo: 'Carga', importe: 500000, folio: '—', evento: 'Carga del presupuesto 2025', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0026', when: '31/12/2025 23:59', bolsa: 'B-COM-25', tipo: 'Cierre de vigencia', importe: 0, folio: '—', evento: 'Cierre de la vigencia al terminar el ejercicio 2025 · bolsa inactiva', actor: 'Proceso automático', actorRol: 'Sistema', fuente: 'Portal', origen: 'Proceso' },
  { id: 'M-0008', when: '12/01/2026 17:20', bolsa: 'B-COM-01', tipo: 'Reserva', importe: 15500, folio: '00024', uid: 'u01', evento: 'Aprobación de la planeación del viaje', actor: 'Mónica Herrera Luna', actorRol: 'Dirección Corporativa', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0009', when: '28/01/2026 11:02', bolsa: 'B-COM-01', tipo: 'Liberación por cancelación', importe: -15500, folio: '00024', uid: 'u01', evento: 'Cancelación del folio', actor: 'Proceso automático', actorRol: 'Sistema', fuente: 'Portal', origen: 'Proceso' },
  { id: 'M-0010', when: '02/03/2026 10:45', bolsa: 'B-COM-01', tipo: 'Reserva', importe: 8700, folio: '00031', uid: 'u01', evento: 'Aprobación de la planeación del viaje', actor: 'Mónica Herrera Luna', actorRol: 'Dirección Corporativa', fuente: 'Portal', origen: 'APP' },
  { id: 'M-0011', when: '12/03/2026 13:30', bolsa: 'B-CHI-01', tipo: 'Reserva', importe: 7800, folio: '00027', uid: 'u03', evento: 'Aprobación de la planeación del viaje', actor: 'Proceso automático', actorRol: 'Sistema', fuente: 'Portal', origen: 'Proceso' },
  { id: 'M-0012', when: '28/03/2026 18:10', bolsa: 'B-COM-01', tipo: 'Comprobación', importe: 8700, folio: '00031', uid: 'u01', evento: 'Contabilización de la comprobación', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'ERP', origen: 'Web' },
  { id: 'M-0013', when: '08/04/2026 12:00', bolsa: 'B-CHI-01', tipo: 'Comprobación', importe: 7650, folio: '00027', uid: 'u03', evento: 'Contabilización de la comprobación', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'ERP', origen: 'Web' },
  { id: 'M-0014', when: '10/06/2026 16:25', bolsa: 'B-COM-01', tipo: 'Reserva', importe: 9090, folio: '00043', uid: 'u01', evento: 'Aprobación de la planeación del viaje', actor: 'Mónica Herrera Luna', actorRol: 'Dirección Corporativa', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0015', when: '12/06/2026 09:40', bolsa: 'B-COM-01', tipo: 'Anticipo', importe: 9090, folio: '00043', uid: 'u01', evento: 'Transferencia del anticipo', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'ERP', origen: 'Web' },
  { id: 'M-0016', when: '12/06/2026 17:05', bolsa: 'B-COM-01', tipo: 'Reserva', importe: 6300, folio: '00048', uid: 'u04', evento: 'Aprobación de la planeación del viaje', actor: 'Pedro Medina', actorRol: 'DGA', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0017', when: '14/06/2026 10:15', bolsa: 'B-CHI-02', tipo: 'Reserva', importe: 800, folio: '00040', ext: 'x02', evento: 'Aprobación de la planeación del viaje', actor: 'Ricardo Fuentes Ávila', actorRol: 'Dirección de Hospital', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0018', when: '20/06/2026 08:30', bolsa: 'B-DGA-01', tipo: 'Reserva', importe: 7400, folio: '00035', uid: 'u06', evento: 'Aprobación al capturar (DGA, sin superior)', actor: 'Proceso automático', actorRol: 'Sistema', fuente: 'Portal', origen: 'Proceso' },
  { id: 'M-0019', when: '04/07/2026 12:50', bolsa: 'B-COR-01', tipo: 'Reserva', importe: 6800, folio: '00034', uid: 'u13', evento: 'Aprobación de la planeación del viaje', actor: 'Alfredo Cacho', actorRol: 'Capital Humano Corporativo', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0020', when: '05/07/2026 09:20', bolsa: 'B-COR-01', tipo: 'Anticipo', importe: 1240, folio: '00034', uid: 'u13', evento: 'Transferencia del anticipo', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'ERP', origen: 'Web' },
  { id: 'M-0021', when: '25/09/2026 13:00', bolsa: 'B-QRO-01', tipo: 'Suplemento', importe: 60000, folio: '—', periodo: 'Septiembre 2026', carga: 'CAR-0002', archivo: 'ajustes-presupuesto-2026-09.csv', doc: 'autorizacion-suplemento-SM-QUERETARO-sep-2026.pdf', evento: 'Carga CAR-0002 · renglón 1 · Septiembre', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0024', when: '25/09/2026 13:00', bolsa: 'B-COM-01', tipo: 'Bloqueo', importe: -10000, folio: '—', periodo: 'Diciembre 2026', carga: 'CAR-0002', archivo: 'ajustes-presupuesto-2026-09.csv', doc: 'autorizacion-bloqueo-SM-CORPO-CEP-dic-2026.pdf', evento: 'Carga CAR-0002 · renglón 2 · Diciembre', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0025', when: '20/07/2026 12:10', bolsa: 'B-COR-01', tipo: 'Comprobación', importe: 1180, folio: '00034', uid: 'u13', evento: 'Contabilización de la comprobación', actor: 'Claudia Reyna Ortega', actorRol: 'Contabilidad / Tesorería', fuente: 'ERP', origen: 'Web' },
  { id: 'M-0022', when: '25/09/2026 13:20', bolsa: 'B-QRO-01', tipo: 'Reserva', importe: 9800, folio: '00026', evento: 'Aprobación de la planeación del viaje (folio desbloqueado tras el suplemento de septiembre)', actor: 'Alfredo Cacho', actorRol: 'Capital Humano Corporativo', fuente: 'Portal', origen: 'Web' },
  { id: 'M-0023', when: '30/09/2026 18:05', bolsa: 'B-COR-01', tipo: 'Reserva', importe: 7300, folio: '00022', uid: 'u13', evento: 'Aprobación de la planeación del viaje', actor: 'Alfredo Cacho', actorRol: 'Capital Humano Corporativo', fuente: 'Portal', origen: 'APP' }
];

// Periodo (mes de vigencia) de cada movimiento: la carga se registra mes por mes; los demás eventos en el mes en que ocurren.
(function () { const out = [];
  MOVIMIENTOS.forEach(m => { const b = BOLSAS.find(x => x.id === m.bolsa);
    if (m.tipo === 'Carga' && b && b.meses) b.meses.forEach((v, i) => { if (v > 0) out.push({ ...m, tipo: 'Carga inicial', carga: b.anio === 2026 ? 'CAR-0001' : 'CAR-2025', archivo: b.anio === 2026 ? 'presupuesto-viaticos-2026.csv' : 'presupuesto-viaticos-2025.csv', id: m.id + '-' + String(i + 1).padStart(2, '0'), importe: v, periodo: MESES[i] + ' ' + b.anio, evento: 'Carga ' + (b.anio === 2026 ? 'CAR-0001' : 'CAR-2025') + ' · ' + MESES[i] }); });
    else if (m.periodo) out.push(m);
    else { const mm = Number(String(m.when).split('/')[1]) - 1, yy = String(m.when).split('/')[2].slice(0, 4); out.push({ ...m, periodo: (MESES[mm] || '') + ' ' + yy }); } });
  MOVIMIENTOS.length = 0; out.forEach(x => MOVIMIENTOS.push(x)); })();

// CONCILIACIÓN + CONTROL MENSUAL (cliente 2026-10-13): todo lo comprometido es un renglón (Reserva · Anticipo · Comprobación) con su PERIODO,
// y lo comprometido de cada mes NUNCA excede el presupuesto de ese mes (planeado + suplementos − bloqueos). Lo no usado de meses anteriores
// NO se acumula al mes actual. Renglones SINTÉTICOS (folios y viajeros inventados) generados por mes para que cada bolsa semilla concilie.
// Regla de conteo (misma que el encabezado de Movimientos de bolsa): Comprobación cuenta en su mes · Anticipo sin comprobar cuenta en su mes ·
// Reserva cuenta en su mes mientras su folio no tenga anticipo ni comprobación (neto de liberaciones).
function mesIdx(periodo) { const t = String(periodo || '').split(' '); return { k: MESES.indexOf(t[0]), y: Number(t[1]) }; }
function MES_ACTUAL() { const d = new Date(); return { k: d.getMonth(), y: d.getFullYear() }; }
function compPorMes(rows, anio) {
  const out = { comp: Array(12).fill(0), ej: 0, tr: 0, rs: 0 }, k0 = m => { const q = mesIdx(m.periodo); return q.k >= 0 && q.y === anio ? q.k : (q.y < anio ? 0 : 11); };
  // VUELO (cliente 2026-10-15): sale de la solicitud de viaje, no pasa por anticipo; consume directo de la bolsa. En tránsito mientras se confirma el
  // boleto → al confirmarse cuenta como Ejercido (Comprobaciones). Se descuenta de la reserva vigente de SU folio (la reserva cuenta neta del vuelo).
  const usados = new Set(rows.filter(m => m.tipo === 'Anticipo' || m.tipo === 'Comprobación').map(m => m.folio)), cf = new Set(rows.filter(m => m.tipo === 'Comprobación').map(m => m.folio)), net = {}, first = {}, vu = {};
  rows.forEach(m => { if (m.tipo === 'Vuelo') vu[m.folio] = (vu[m.folio] || 0) + m.importe; });
  rows.forEach(m => { if (m.tipo === 'Comprobación' || (m.tipo === 'Vuelo' && m.vueloEstado === 'confirmado')) { out.comp[k0(m)] += m.importe; out.ej += m.importe; }
    else if (m.tipo === 'Vuelo') { out.comp[k0(m)] += m.importe; out.tr += m.importe; }
    else if (m.tipo === 'Anticipo' && !cf.has(m.folio)) { out.comp[k0(m)] += m.importe; out.tr += m.importe; }
    else if (m.tipo === 'Reserva' || /^Liberación/.test(m.tipo)) { net[m.folio] = (net[m.folio] || 0) + m.importe; if (m.tipo === 'Reserva' && first[m.folio] == null) first[m.folio] = k0(m); } });
  Object.keys(net).forEach(f => { const v = net[f] - (vu[f] || 0); if (!usados.has(f) && v > 0) { out.comp[first[f] != null ? first[f] : 11] += v; out.rs += v; } });
  return out;
}
function capMes(b, rows) {
  const plan = (b.meses || Array(12).fill(0)).slice(), amp = Array(12).fill(0), bloq = Array(12).fill(0);
  rows.forEach(m => { const q = mesIdx(m.periodo); if (!(q.k >= 0 && q.y === b.anio)) return; if (m.tipo === 'Suplemento') amp[q.k] += m.importe; if (m.tipo === 'Bloqueo') bloq[q.k] += -m.importe; });
  return { plan, amp, bloq, cap: plan.map((v, k) => Math.max(0, v + (CONFIG.ampliadoSumaAlDisponible ? amp[k] : 0) - bloq[k])) };
}
(function () {
  const NOMBRES = ['Laura Méndez Ruiz', 'Jorge Castillo Vega', 'Patricia Olvera Sáenz', 'Héctor Ramos Lugo', 'Sofía Treviño Mata', 'Raúl Ibarra Solís', 'Diana Fuentes Cano', 'Arturo Lara Núñez', 'Gabriela Ríos Paz', 'Iván Montoya León', 'Natalia Cruz Oropeza', 'Óscar Salinas Ruiz'];
  let seed = 7, folio = 100; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const pad = n => String(n).padStart(2, '0'), HOY = { y: 2026, k: 9 };
  BOLSAS.forEach(b => {
    const rows = MOVIMIENTOS.filter(m => m.bolsa === b.id), cnt = compPorMes(rows, b.anio), cm = capMes(b, rows);
    let needE = Math.max(0, b.ejercido - cnt.ej), needT = Math.max(0, b.transito - cnt.tr), needR = Math.max(0, b.comprometido - b.ejercido - b.transito - cnt.rs);
    const add = (tipo, imp, k, fx, extra) => { if (!fx) folio++; const cut = b.anio < HOY.y ? 11 : HOY.k, wk = Math.min(k, cut), dd = 2 + Math.floor(rnd() * 25);
      const g = { id: 'G-' + b.id + '-' + folio, when: pad(dd) + '/' + pad(wk + 1) + '/' + b.anio + ' ' + pad(9 + Math.floor(rnd() * 9)) + ':' + pad(Math.floor(rnd() * 6) * 10), bolsa: b.id, tipo, importe: imp, folio: '00' + folio, viajeroNom: NOMBRES[Math.floor(rnd() * NOMBRES.length)], periodo: MESES[k] + ' ' + b.anio,
        evento: tipo === 'Anticipo' ? 'Transferencia del anticipo · pendiente de comprobar' : tipo === 'Comprobación' ? 'Contabilización de la comprobación' : 'Aprobación de la planeación del viaje',
        actor: tipo === 'Reserva' ? 'Proceso automático' : 'Claudia Reyna Ortega', actorRol: tipo === 'Reserva' ? 'Sistema' : 'Contabilidad / Tesorería', fuente: tipo === 'Reserva' ? 'Portal' : 'ERP', origen: tipo === 'Reserva' ? 'Proceso' : 'Web', ...(extra || {}) };
      MOVIMIENTOS.push(g); };
    // Llenado cronológico mes a mes SIN exceder el presupuesto del mes: primero lo ejercido, luego lo en tránsito y al final las reservas.
    for (let k = 0; k < 12 && needE + needT + needR > 0; k++) {
      let room = Math.max(0, cm.cap[k] - cnt.comp[k]); if (k === 11) room = needE + needT + needR;
      // Vuelo semilla: renglón «Vuelo» + la «Reserva» (solicitud de viaje) del MISMO folio = vuelo + resto vigente tomado de las reservas pendientes.
      const addVuelo = (amt, est, k) => { folio++;
        const X = Math.max(0, Math.min(needR, room, Math.round(amt * 0.6 / 10) * 10)); needR -= X; room -= X;
        const vn = NOMBRES[Math.floor(rnd() * NOMBRES.length)];
        add('Reserva', amt + X, k, true, { evento: 'Aprobación de la solicitud de viaje · incluye vuelo', viajeroNom: vn });
        add('Vuelo', amt, k, true, est === 'confirmado'
          ? { id: 'G-' + b.id + '-' + folio + '-V', viajeroNom: vn, vueloEstado: 'confirmado', evento: 'Boleto confirmado · consumo directo de la bolsa', actor: 'Mesa de Viáticos', actorRol: 'Viáticos', fuente: 'Portal', origen: 'Web' }
          : { id: 'G-' + b.id + '-' + folio + '-V', viajeroNom: vn, vueloEstado: 'transito', evento: 'Vuelo reservado · pendiente de confirmar el boleto', actor: 'Mesa de Viáticos', actorRol: 'Viáticos', fuente: 'Portal', origen: 'Web' }); };
      const take = (need, tipo) => { const v = Math.min(need, room); if (v <= 0) return 0; room -= v; const n = Math.max(1, Math.min(4, Math.round(v / 25000)));
        let left = v; for (let j = 0; j < n; j++) { const part = j === n - 1 ? left : Math.round(v / n * (0.7 + rnd() * 0.6) / 10) * 10; const amt = Math.min(part, left);
          if (amt > 0) { if ((tipo === 'Comprobación' || tipo === 'Anticipo') && rnd() < 0.3) addVuelo(amt, tipo === 'Comprobación' ? 'confirmado' : 'transito', k); else add(tipo, amt, k); } left -= amt; }
        return v; };
      needE -= take(needE, 'Comprobación'); needT -= take(needT, 'Anticipo'); needR -= take(needR, 'Reserva'); }
  });
})();

// --- Estimado por autorizar: solicitudes ENVIADAS pendientes de aprobación (no comprometen; US-06) ---
// Las solicitudes de la sesión se suman en vivo (sin duplicar folios ya listados aquí).
const PENDIENTES = [
  { folio: '00041', entidad: 'HSM Chihuahua', importe: 4050 },
  // 00044 retirado (2026-10-13): la solicitud está En proceso (ya aprobada, en Comprobación), no por autorizar → no es Estimado.
  { folio: '00039', entidad: 'Corporativo', importe: 4300 },
  { folio: '00046', entidad: 'Dirección Comercial y de Negocios', importe: 7100 }
];

// --- Historial de cambios de cada bolsa (anterior → nuevo, usuario, fecha/hora) ---
const HISTORIAL = {
  'B-CHI-01': [{ when: '02/01/2026 09:00', accion: 'Alta de la bolsa', campo: 'Planeado', antes: '—', despues: 900000, usuario: 'Claudia Reyna Ortega' }],
  'B-CHI-02': [{ when: '02/01/2026 09:00', accion: 'Alta de la bolsa', campo: 'Planeado', antes: '—', despues: 300000, usuario: 'Claudia Reyna Ortega' }],
  'B-QRO-01': [{ when: '02/01/2026 09:05', accion: 'Alta de la bolsa', campo: 'Planeado', antes: '—', despues: 600000, usuario: 'Claudia Reyna Ortega' },
    { when: '25/09/2026 13:00', accion: 'Suplemento por carga CAR-0002 · Septiembre 2026', campo: 'Ampliado', antes: 0, despues: 60000, usuario: 'Claudia Reyna Ortega' }],
  'B-COM-01': [{ when: '02/01/2026 09:10', accion: 'Alta de la bolsa', campo: 'Planeado', antes: '—', despues: 520000, usuario: 'Claudia Reyna Ortega' },
    { when: '15/02/2026 12:30', accion: 'Modificó el importe planeado', campo: 'Planeado', antes: 520000, despues: 550000, usuario: 'Claudia Reyna Ortega' },
    { when: '25/09/2026 13:00', accion: 'Bloqueo por carga CAR-0002 · Diciembre 2026', campo: 'Bloqueado', antes: 0, despues: 10000, usuario: 'Claudia Reyna Ortega' }],
  'B-COM-25': [{ when: '02/01/2025 09:00', accion: 'Alta de la bolsa', campo: 'Planeado', antes: '—', despues: 500000, usuario: 'Claudia Reyna Ortega' },
    { when: '31/12/2025 23:59', accion: 'Cerró la vigencia de la bolsa', campo: 'Estado', antes: 'Activa', despues: 'Inactiva', usuario: 'Proceso automático' }],
  'B-CH-01': [{ when: '02/01/2026 09:12', accion: 'Alta de la bolsa', campo: 'Planeado', antes: '—', despues: 420000, usuario: 'Claudia Reyna Ortega' }],
  'B-DGA-01': [{ when: '02/01/2026 09:14', accion: 'Alta de la bolsa', campo: 'Planeado', antes: '—', despues: 800000, usuario: 'Claudia Reyna Ortega' }],
  'B-COR-01': [{ when: '02/01/2026 09:16', accion: 'Alta de la bolsa', campo: 'Planeado', antes: '—', despues: 300000, usuario: 'Claudia Reyna Ortega' }]
};

// MOVIMIENTOS PRESUPUESTALES (cliente, reunión 2026-10-13 — SUSTITUYE el ciclo de suplementos): toda modificación del presupuesto llega por
// CARGAR ARCHIVO y el sistema clasifica cada monto por bolsa y mes: el PRIMER monto positivo del mes = Carga inicial (sin documento);
// un positivo posterior en el mismo mes = Suplemento (aplicado al registrarse); un negativo = Bloqueo. Suplemento y Bloqueo exigen el
// DOCUMENTO DE AUTORIZACIÓN (evidencia de una autorización hecha fuera del Portal; uno por bolsa afectada). No hay estatus ni bandeja.
// + Cierre de vigencia (cliente 2026-10-13): afecta la bolsa de forma global (deja de recibir movimientos), no es un gasto.
const MOV_PRES = ['Carga inicial', 'Suplemento', 'Bloqueo', 'Cierre de vigencia'];
const REQUIERE_DOC = t => t === 'Suplemento' || t === 'Bloqueo';
// MOVIMIENTOS DE BOLSA visibles (cliente): SOLO Anticipos y Comprobaciones. Compromisos (reservas al aprobar; incluye el VUELO, que consume
// directo de la bolsa) y liberaciones siguen en el modelo y en los importes, pero no son renglones de estas tablas.
// + CAMBIOS HECHOS EN EL PORTAL sobre la bolsa (no por carga): Liberación manual y Cierre de vigencia, con origen «Cambio en el Portal»
// (cliente 2026-10-13: el «Historial de cambios» se elimina; todo cambio de la bolsa queda en una de las dos tablas de movimientos).
// Reserva = presupuesto comprometido al aprobarse un folio (incluye el vuelo, que consume directo de la bolsa); deja de estar vigente cuando el
// folio recibe anticipo o comprobación, o cuando se libera (cancelación / liberación manual). Así TODO lo comprometido es un renglón (cliente 2026-10-13).
const MOV_BOLSA = ['Reserva', 'Anticipo', 'Vuelo', 'Comprobación', 'Liberación por cancelación', 'Liberación manual'];
const ORIGEN_MOV = t => MOV_PRES.includes(t) ? 'Carga de archivo' : (t === 'Anticipo' || t === 'Vuelo' || t === 'Comprobación') ? 'Proceso del viaje' : 'Cambio en el Portal';
// Cargas registradas (historial). Sus movimientos se leen de MOVIMIENTOS por el campo «carga».
const CARGAS = [
  { id: 'CAR-2025', when: '02/01/2025 09:00', anio: 2025, archivo: 'presupuesto-viaticos-2025.csv', usuario: 'Claudia Reyna Ortega', estado: 'Aplicada' },
  { id: 'CAR-0001', when: '02/01/2026 09:00', anio: 2026, archivo: 'presupuesto-viaticos-2026.csv', usuario: 'Claudia Reyna Ortega', estado: 'Aplicada' },
  { id: 'CAR-0002', when: '25/09/2026 13:00', anio: 2026, archivo: 'ajustes-presupuesto-2026-09.csv', usuario: 'Claudia Reyna Ortega', estado: 'Aplicada' }
];

// --- Historial de alertas emitidas (la condición vigente se calcula; aquí queda cuándo se emitió y su atención) ---
const ALERTAS_EMITIDAS = {
  'HSM Chihuahua': { desde: '06/10/2026 07:00', atencion: 'Notificada a Dirección de Hospital' },
  'HSM Querétaro': { desde: '22/09/2026 09:30', atencion: 'Suplemento de septiembre cargado (CAR-0002) · sigue en nivel crítico' },
  'Corporativo': { desde: '30/09/2026 18:05', atencion: 'Notificada a la Dirección · pendiente de suplemento en la siguiente carga' },
  'Tecnologías de la Información': { desde: '01/01/2026 00:00', atencion: 'Sin Dirección responsable registrada' }
};

// ----------------------------------- Cálculo (funciones puras) -----------------------------------
const TIPO_EFECTO = {
  'Carga inicial': { planeado: 1 }, 'Suplemento': { ampliado: 1 }, 'Bloqueo': { bloqueadoNeg: 1 },
  'Compromiso': { comprometido: 1 }, 'Reserva': { comprometido: 1 }, 'Anticipo': { transito: 1 }, 'Comprobación': { ejercido: 1 },
  'Liberación por cancelación': { comprometido: 1, liberadoNeg: 1 }, 'Liberación manual': { comprometido: 1, liberadoManualNeg: 1 },
  // Regla del cliente (2026-10-12): al CIERRE del viaje lo comprometido no utilizado se libera (flujo de Cierre, aún no construido).
  'Liberación al cierre': { comprometido: 1, liberadoCierreNeg: 1 },
  'Cierre de vigencia': {}
};
const CONCEPTO_DE = { 'Carga inicial': 'Planeado', 'Suplemento': 'Ampliado (aumenta el disponible)', 'Bloqueo': 'Bloqueado (reduce el disponible)', 'Compromiso': 'Comprometido', 'Reserva': 'Comprometido (reserva del folio aprobado)', 'Anticipo': 'En tránsito (dentro de Comprometido)', 'Vuelo': 'Consumo directo de la bolsa · En tránsito hasta confirmar el boleto → Ejercido (dentro de Comprometido)', 'Comprobación': 'Ejercido (dentro de Comprometido)', 'Liberación por cancelación': 'Comprometido → Liberado por cancelación', 'Liberación manual': 'Comprometido → Liberación manual', 'Liberación al cierre': 'Comprometido → Liberado al cierre', 'Cierre de vigencia': 'Estado de la bolsa (Activa → Inactiva)' };
const entidadById = id => ENTIDADES.find(e => e.id === id) || entidadesCatalogo().find(e => e.id === id) || null;
const nivelDe = (pct, base) => !base ? 'sinPresupuesto' : pct >= 100 ? 'sinDisponible' : pct >= CONFIG.umbrales.critico ? 'critico' : pct > CONFIG.umbrales.advertencia ? 'advertencia' : 'normal';
function derivar(b) {
  const base = b.planeado + (CONFIG.ampliadoSumaAlDisponible ? b.ampliado : 0) - (b.bloqueado || 0);
  const pre = Math.max(0, base - b.comprometido);
  const pct = base ? Math.round(b.comprometido / base * 100) : 0;
  return { ...b, base, pre, pct, reservas: Math.max(0, b.comprometido - b.transito - b.ejercido), nivel: nivelDe(pct, base) };
}
// Resolver ÚNICO solicitud → bolsa (regla definitiva PENDIENTE: CECO · cuenta · proyecto · tipo de empleado).
// Prototipo: bolsa activa del ejercicio de la entidad, por tipo de empleado (interno / viajero externo).
// Disponible para una solicitud: bolsa de su entidad + MES de inicio del viaje (dd/mm/aaaa). Devuelve null si no hay bolsa vigente ese mes.
function disponiblePara(data, entidad, externo, fecha) {
  const t = String(fecha || '').split('/'), k = Number(t[1]) - 1, y = Number(t[2]); if (!(k >= 0) || !y) return null;
  const act = data.bolsas.filter(b => b.entidad === entidad && b.anio === y && b.estado === 'Activa');
  const b = (externo ? act.find(x => /extern/i.test(x.texto || '')) : act.find(x => !/extern/i.test(x.texto || ''))) || act[0];
  return b ? { bolsa: b, mes: MESES[k] + ' ' + y, pre: b.mes.pre[k], periodo: MESES[k] + ' ' + y } : { bolsa: null, mes: MESES[k] + ' ' + y, pre: 0, periodo: MESES[k] + ' ' + y };
}
function bolsaPara(entidad, externo, lista) {
  const act = (lista || BOLSAS).filter(b => b.entidad === entidad && b.anio === CONFIG.ejercicio && b.estado === 'Activa');
  // Sin «tipo de empleado» (cliente 2026-10-12): externos → bolsa cuya descripción indique viajeros externos, si existe; si no, la primera activa.
  return (externo ? act.find(b => /extern/i.test(b.texto || '')) : act.find(b => !/extern/i.test(b.texto || ''))) || act[0] || null;
}
// DISPONIBILIDAD MENSUAL (cliente 2026-10-12): cada solicitud cae en la bolsa de su hospital/entidad y en el MES de su vigencia
// (mes de inicio del viaje). Por bolsa y mes: Planeado del mes (+ Ampliado aplicado en ese mes) − Comprometido del mes.
// Lo comprometido de la semilla (snapshot) se asigna a los meses desde enero, hasta el planeado de cada mes (consumo cronológico, DEMO);
// los movimientos de la sesión caen en su PERIODO. El Inicio muestra el disponible del MES ACTUAL; Creación valida el mes del viaje.

function mensual(b, seedComp, sMovs) {
  const rows = MOVIMIENTOS.concat(sMovs).filter(m => m.bolsa === b.id), cm = capMes(b, rows);
  sMovs.filter(m => m.bolsa === b.id && m.tipo === 'Carga inicial').forEach(m => { const q = mesIdx(m.periodo); if (q.k >= 0 && q.y === b.anio) { cm.plan[q.k] += m.importe; cm.cap[q.k] += m.importe; } });
  const comp = compPorMes(rows, b.anio).comp;
  // Disponible por mes SIN arrastre: lo no usado de un mes cerrado no pasa al siguiente.
  const pre = cm.cap.map((c, k) => Math.max(0, c - comp[k]));
  const ma = MES_ACTUAL(), desde = b.anio < ma.y ? 12 : b.anio > ma.y ? 0 : ma.k;
  const preUsable = pre.reduce((n, v, k) => n + (k >= desde ? v : 0), 0), noAcum = pre.reduce((n, v, k) => n + (k < desde ? v : 0), 0);
  return { plan: cm.plan, amp: cm.amp, bloq: cm.bloq, comp, pre, preUsable, noAcum };
}

// compute({ movs, reqs }): aplica los movimientos de la sesión (append-only) y el Estimado vivo; devuelve bolsas, entidades, alertas y movimientos.
function compute(ctx) {
  const sMovs = (ctx && ctx.movs) || [], sReqs = (ctx && ctx.reqs) || [];
  const delta = {};
  sMovs.forEach(m => { const ef = TIPO_EFECTO[m.tipo] || {}, d = delta[m.bolsa] = delta[m.bolsa] || {};
    Object.keys(ef).forEach(k => { if (/Neg$/.test(k)) { const f = k.replace(/Neg$/, ''); d[f] = (d[f] || 0) - m.importe; } else d[k] = (d[k] || 0) + m.importe; }); });
  // Bolsas de la sesión (alta individual o carga masiva) + cambios de vigencia/estado (los importes cambian solo por movimientos).
  const patch = (ctx && ctx.patch) || {};
  const bolsas = BOLSAS.concat((ctx && ctx.bolsas) || []).map(b0 => { const b = { liberadoManual: 0, liberadoCierre: 0, bloqueado: 0, ...b0, ...(patch[b0.id] || {}) };
    if (patch[b0.id] && patch[b0.id].meses && b.estado === 'Activa') { const v = vigenciaDe(b); b.desde = v.desde; b.hasta = v.hasta; } const d = delta[b.id] || {}; const nb = { ...b };
    Object.keys(d).forEach(k => { nb[k] = (nb[k] || 0) + d[k]; }); const out = derivar(nb); out.mes = mensual(out, b0.comprometido || 0, sMovs);
    // PRE disponible = lo que AÚN se puede usar: disponible del mes en curso + meses siguientes del ejercicio (sin lo no usado de meses cerrados).
    out.pre = out.estado === 'Activa' ? out.mes.preUsable : 0; out.preNoAcum = out.mes.noAcum; return out; });
  const seedF = new Set(PENDIENTES.map(p => p.folio));
  // US-09: un folio semilla que ya se resolvió (aprobado → compromete; rechazado/cancelado → libera) deja de contar como Estimado. Sin cambio de fórmula.
  const resueltos = new Set(sReqs.filter(r => r.status && r.status !== 'pendAut').map(r => r.folio));
  const pend = PENDIENTES.filter(p => !resueltos.has(p.folio)).concat(sReqs.filter(r => r.status === 'pendAut' && r.entidad && !seedF.has(r.folio)).map(r => ({ folio: r.folio, entidad: r.entidad, importe: Number(r.total) || 0 })));
  // Periodo (mes de inicio del viaje) de cada folio por autorizar, tomado de la propia solicitud.
  const perOf = f => { const r = sReqs.find(x => x.folio === f), seg = r && (r.segmentos || [])[0], t = String((seg && seg.inicio) || '').split('/'); return t.length === 3 ? MESES[Number(t[1]) - 1] + ' ' + t[2] : ''; };
  const extra = entidadesCatalogo().filter(e => !ENTIDADES.some(x => x.id === e.id) && bolsas.some(b => b.entidad === e.id));
  const entidades = ENTIDADES.concat(extra).map(e => {
    const bs = bolsas.filter(b => b.entidad === e.id && b.anio === CONFIG.ejercicio && b.estado === 'Activa');
    const sum = k => bs.reduce((n, b) => n + (b[k] || 0), 0);
    const t = { planeado: sum('planeado'), ampliado: sum('ampliado'), comprometido: sum('comprometido'), transito: sum('transito'), ejercido: sum('ejercido'), liberado: sum('liberado'), liberadoManual: sum('liberadoManual'), bloqueado: sum('bloqueado') };
    const base = t.planeado + (CONFIG.ampliadoSumaAlDisponible ? t.ampliado : 0) - t.bloqueado, pre = sum('pre'), preNoAcum = sum('preNoAcum'), pct = base ? Math.round(t.comprometido / base * 100) : 0;
    const estimado = pend.filter(p => p.entidad === e.id).reduce((n, p) => n + p.importe, 0);
    return { ...e, ...t, base, pre, preNoAcum, pct, reservas: Math.max(0, t.comprometido - t.transito - t.ejercido), estimado, porAutorizar: pend.filter(p => p.entidad === e.id).length,
      // Disponible del MES ACTUAL de la entidad (suma de sus bolsas activas): es lo que decide «admite nuevas solicitudes» en el Inicio.
      preMes: (() => { const ma = MES_ACTUAL(); return bs.filter(b => b.anio === ma.y).reduce((n, b) => n + b.mes.pre[ma.k], 0); })(),
      // Mismos conceptos aplicados al MES ACTUAL (Monitor › Resumen, fila mensual): sumas de las bolsas activas del mes; Estimado = solicitudes por autorizar con inicio del viaje en el mes.
      mesAct: (() => { const ma = MES_ACTUAL(), bm = bs.filter(b => b.anio === ma.y), s2 = k => bm.reduce((n, b) => n + ((b.mes[k] || [])[ma.k] || 0), 0); const per = MESES[ma.k] + ' ' + ma.y, pm = pend.filter(p => p.entidad === e.id && perOf(p.folio) === per);
        return { plan: s2('plan'), amp: s2('amp'), bloq: s2('bloq'), comp: s2('comp'), pre: s2('pre'), estimado: pm.reduce((n, p) => n + p.importe, 0), porAutorizar: pm.length }; })(),
      bolsas: bs.length, nivel: nivelDe(pct, base) };
  });
  entidades.forEach(e => { e.admite = e.bolsas > 0 && e.preMes > CONFIG.admiteMinimo; });
  const alertas = entidades.filter(e => e.nivel !== 'normal').map(e => ({ entidad: e.id, tipoEntidad: e.tipo, nivel: e.nivel, pct: e.pct,
    ...(ALERTAS_EMITIDAS[e.id] || { desde: null, atencion: 'Emitida en esta sesión' }) }));
  const movs = MOVIMIENTOS.concat(sMovs);
  return { bolsas, entidades, alertas, movs };
}

window.SMV_PRES = { CONFIG, ENTIDADES, ADSCRIPCION, ALCANCE, BOLSAS, MOVIMIENTOS, PENDIENTES, HISTORIAL, MOV_PRES, MOV_BOLSA, ORIGEN_MOV, REQUIERE_DOC, ALERTAS_EMITIDAS, CECOS, cecosDe, entidadesCatalogo, CUENTAS, TIPOS_EMPLEADO, MESES, vigenciaDe, llave, entidadDeCarga, disponiblePara, MES_ACTUAL, mesIdx, BLOQUEOS, CARGAS, CONCEPTO_DE, entidadById, bolsaPara, compute, nivelDe };
})(); }
