window.SMV_US08 = window.SMV_US08 || (function () {
// NUEVA SOLICITUD DE VIAJE — catálogos y parámetros que consume la captura de la solicitud. DEMO ONLY (datos sintéticos).
// Las personas NO viven aquí: se leen del registro canónico (us01-data.js › USERS / us26-data.js).
// El perfil, las reglas, las tarifas y la antelación mínima NO viven aquí: se leen del modelo único de perfil
// (usperfil-data.js › PROFILES / TARIFAS / EXCEPCIONES / GLOBAL.antelacion).
// DESTINOS se DERIVAN del catálogo de hospitales confirmado por el cliente (uscat-data.js › HOSPITALES); motivos, estados y
// ciudades siguen siendo valores del prototipo (PROVISIONAL MOCK).

// Parámetros del módulo de planeación (valores del alcance; configurables por parámetro).
const PARAMS = {
  maxDestinos: 3,
  validarHospitalHospital: true,   // viaje de hospital a hospital exige preautorización de DGA (activable por parámetro)
  observacionesRequeridas: false,  // Observaciones: requerido u opcional según parámetro
  // Tintorería ya NO se parametriza aquí: es regla GLOBAL confirmada (usperfil-data.js › GLOBAL.tintoreria: $85 por día desde el 6.º día).
  folioInicial: 48                 // siguiente folio libre de los datos sintéticos (00043 … 00047 ya existen)
};

// Motivos (catálogo de las reglas del módulo de planeación del alcance).
const MOTIVOS = ['Proyecto', 'Capacitación', 'Operación', 'Cubrir vacante', 'Reunión comité', 'Diligencias'];

// Catálogo de destinos = las 22 unidades del catálogo confirmado de hospitales (CLIENT CONFIRMED — GREEN WORKBOOK «Cat. Hospital»).
// id = 'h' + idhospital · nombre = alias de presentación del Portal («HSM Chihuahua» → 1114 STAR MÉDICA CHIHUAHUA) · hospId = registro canónico
// · conAlimentos = «Con alimentos» del catálogo (el hospital puede proporcionar desayuno y comida).
// zona = agrupación geográfica del PROTOTIPO (PROVISIONAL MOCK) que solo alimenta la regla provisional de vuelo por tramo.
const ZONA_HOSP = { '1100': 'centro', '1101': 'occidente', '1102': 'occidente', '1103': 'sureste', '1104': 'norte', '1105': 'centro', '1106': 'centro', '1107': 'centro', '1109': 'centro',
  '1110': 'centro', '1111': 'centro', '1112': 'centro', '1113': 'centro', '1114': 'norte', '1115': 'golfo', '1119': 'centro', '1120': 'centro', '1121': 'occidente', '1122': 'centro', '1125': 'norte', '1129': 'centro', '1133': 'centro' };
// Se resuelve de forma PEREZOSA (getter) para no depender del orden de carga de los scripts del helmet.
let _dest = null;
function destinos() { const CAT = window.SMV_CAT; if (!CAT) return []; if (!_dest) _dest = CAT.HOSPITALES.map(h => ({ id: 'h' + h.id, hospId: h.id, nombre: h.alias, oficial: h.id + ' · ' + h.nombre, tipo: h.tipo, ciudad: h.ciudad, conAlimentos: !!h.conAlimentos, zona: ZONA_HOSP[h.id] || null })); return _dest; }
// Zona por estado (destinos de Diligencias, capturados por estado y ciudad). PROVISIONAL MOCK.
const ZONA_ESTADO = { 'Chihuahua': 'norte', 'Ciudad de México': 'centro', 'Estado de México': 'centro', 'Jalisco': 'occidente',
  'Nuevo León': 'norte', 'Querétaro': 'centro', 'Veracruz': 'golfo', 'Yucatán': 'sureste' };
// REGLA PROVISIONAL DEL PROTOTIPO — PROVISIONAL FLIGHT DECISION LOGIC (NO confirmada por el cliente):
// un tramo requiere vuelo cuando su origen y su destino están en zonas distintas. null = no se puede derivar.
// El catálogo confirmado de RECORRIDOS (uscat-data.js, kilómetros por par de ciudades) es CLIENT-CONFIRMED DISTANCE DATA y
// NO se usa aquí: el cliente aún no define qué regla consumen los km (OPEN CLIENT DECISION). No se inventa un umbral.
function tramoRequiereVuelo(zonaDesde, zonaHasta) { if (!zonaDesde || !zonaHasta) return null; return zonaDesde !== zonaHasta; }

// Estados y ciudades (solo con motivo Diligencias: el destino puede no ser una unidad hospitalaria).
const ESTADOS = {
  'Chihuahua': ['Chihuahua', 'Ciudad Juárez', 'Delicias'],
  'Ciudad de México': ['Ciudad de México'],
  'Estado de México': ['Naucalpan', 'Toluca'],
  'Jalisco': ['Guadalajara', 'Zapopan'],
  'Nuevo León': ['Monterrey', 'San Pedro Garza García'],
  'Querétaro': ['Querétaro', 'San Juan del Río'],
  'Veracruz': ['Veracruz', 'Xalapa'],
  'Yucatán': ['Mérida']
};

// PRE disponible por entidad presupuestal — SOLO para validar el envío (estimado ≤ disponible).
// Nunca se muestra al colaborador: el monitor de presupuesto pertenece a los roles con responsabilidad presupuestal.
const PRE_DISPONIBLE = {
  'Dirección Comercial y de Negocios': 18000,
  'HSM Chihuahua': 60000,
  'Dirección de Capital Humano': 45000,
  'Dirección de Operación Hospitalaria': 50000,
  'Tecnologías de la Información': 30000,
  'Corporativo': 80000
};

// Hospitales con Dirección de Hospital vacante (la solicitud se dirige a Capital Humano Corporativo).
const DIRECCION_VACANTE = [];

// SOLICITUDES YA ENVIADAS DE LOS DATOS SINTÉTICOS — escenario de viaje compartido. Destinos remapeados al catálogo confirmado
// (HSM Torreón → 1104 HSM Ciudad Juárez · HSM Saltillo → 1125 HSM Monterrey; se conserva el propósito: ruta encadenada de 2 tramos por carretera).
// UNA solicitud = UN folio = UN dueño (solicitante). Los acompañantes internos REFERENCIAN la misma solicitud por el id del
// registro canónico de personas (us01-data.js › USERS): no se copia su nombre ni se crea otra solicitud, folio ni flujo para ellos.
// ruta = origen + tramos ordenados: el tramo n sale del destino n-1 (el primero sale del origen del viaje).
const SEED_REQS = [
  { folio: '00050', uid: 'u03', userId: 'u03', status: 'pendAut', motivo: 'Operación', medio: 'Auto particular',
    ruta: { origen: { label: 'HSM Chihuahua', zona: 'norte' }, tramos: [
      { n: 1, desde: { label: 'HSM Chihuahua', zona: 'norte' }, hasta: { id: 'h1104', label: 'HSM Ciudad Juárez', zona: 'norte' }, requiereVuelo: false },
      { n: 2, desde: { id: 'h1104', label: 'HSM Ciudad Juárez', zona: 'norte' }, hasta: { id: 'h1125', label: 'HSM Monterrey', zona: 'norte' }, requiereVuelo: false } ] },
    dest: 'HSM Ciudad Juárez · HSM Monterrey', fechas: '13/10/2026 – 15/10/2026', nights: '3 días · 2 noches', total: 14200, hasta: true,
    firstLabel: 'Dirección Corporativa', exceso: false, when: '25/09/2026 12:40', at: 1,
    // Participantes: el solicitante es el dueño; los acompañantes solo consultan (lectura).
    acompanantes: [{ personId: 'u02', addedAt: '25/09/2026 12:31', addedBy: 'u03' }, { personId: 'u01', addedAt: '25/09/2026 12:32', addedBy: 'u03' }] }
];

return { PARAMS, MOTIVOS, get DESTINOS() { return destinos(); }, ZONA_HOSP, ZONA_ESTADO, tramoRequiereVuelo, ESTADOS, PRE_DISPONIBLE, DIRECCION_VACANTE, SEED_REQS };
})();
