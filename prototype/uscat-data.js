if (!window.SMV_CAT) { (function(){
// CATÁLOGOS CONFIRMADOS POR EL CLIENTE — libro «tablas viaticos 2.0 _V1.xlsx» (solo pestañas verdes) + aclaraciones de negocio 2026-09-30.
// FUENTE DE VERDAD ÚNICA para hospital, sociedad/RFC, recorridos y documentos de comprobación: las demás pantallas y
// datos sintéticos REFERENCIAN estos registros (id + alias de presentación), nunca copian el catálogo.
// Clasificación de origen (se conserva para sesiones futuras):
//   CLIENT CONFIRMED — GREEN WORKBOOK · CLIENT CLARIFICATION — THIS REVIEW · PROVISIONAL MOCK · OPEN CLIENT DECISION
// Datos sintéticos: ningún dato personal real (las pestañas no verdes con nombres/correos reales NO se usan).

// ---------------------------------------------------------------------------
// HOSPITALES · «Cat. Hospital» (CLIENT CONFIRMED — GREEN WORKBOOK). 22 registros.
// id = idhospital del ERP · nombre = hnombre oficial · alias = etiqueta corta ya usada en el Portal (presentación, no un segundo registro)
// conAlimentos = «Con alimentos» (X) · tipoBanco / cuentaBancaria vienen VACÍOS en el libro y se conservan vacíos (no se inventan).
// Vigencia del catálogo: 01/08/2026 – 31/12/9999 (31/12/9999 = «Sin fecha de cierre»).
// ---------------------------------------------------------------------------
const HOSP_VIG = { from: '01/08/2026', to: '31/12/9999' };
const HOSPITALES = [
  { id: '1100', nombre: 'OFICINAS CENTRALES', alias: 'Corporativo', corto: 'Corporativo', tipo: 'corporativo', conAlimentos: false, ciudad: 'Ciudad de México', tipoBanco: '', cuentaBancaria: '' },
  { id: '1101', nombre: 'STAR MÉDICA MORELIA', alias: 'HSM Morelia', tipo: 'hospital', conAlimentos: true, ciudad: 'Morelia, Mich.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1102', nombre: 'STAR MÉDICA AGUASCALIENTES', alias: 'HSM Aguascalientes', tipo: 'hospital', conAlimentos: true, ciudad: 'Aguascalientes, Ags.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1103', nombre: 'STAR MÉDICA MÉRIDA', alias: 'HSM Mérida', tipo: 'hospital', conAlimentos: true, ciudad: 'Mérida, Yuc.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1104', nombre: 'STAR MÉDICA CIUDAD JUÁREZ', alias: 'HSM Ciudad Juárez', tipo: 'hospital', conAlimentos: true, ciudad: 'Ciudad Juárez, Chih.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1105', nombre: 'STAR MÉDICA SAN LUIS POTOSÍ', alias: 'HSM San Luis Potosí', tipo: 'hospital', conAlimentos: true, ciudad: 'San Luis Potosí, S.L.P.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1106', nombre: 'STAR MÉDICA CENTRO', alias: 'HSM Centro', tipo: 'hospital', conAlimentos: true, ciudad: 'Ciudad de México', tipoBanco: '', cuentaBancaria: '' },
  { id: '1107', nombre: 'HIP', alias: 'HIP', tipo: 'hospital', conAlimentos: true, ciudad: 'Ciudad de México', tipoBanco: '', cuentaBancaria: '' },
  { id: '1109', nombre: 'STAR MÉDICA LOMAS VERDES', alias: 'HSM Lomas Verdes', tipo: 'hospital', conAlimentos: true, ciudad: 'Naucalpan, Edo. Méx.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1110', nombre: 'VIVO JARDÍN BICENTENARIO', alias: 'Vivo Jardín Bicentenario', tipo: 'hospital', conAlimentos: true, ciudad: 'Nezahualcóyotl, Edo. Méx.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1111', nombre: 'VIVO CIUDAD AZTECA', alias: 'Vivo Ciudad Azteca', tipo: 'hospital', conAlimentos: true, ciudad: 'Ecatepec, Edo. Méx.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1112', nombre: 'STAR MÉDICA LUNA PARC', alias: 'HSM Luna Parc', tipo: 'hospital', conAlimentos: false, ciudad: 'Cuautitlán Izcalli, Edo. Méx.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1113', nombre: 'STAR MÉDICA QUERÉTARO', alias: 'HSM Querétaro', tipo: 'hospital', conAlimentos: true, ciudad: 'Querétaro, Qro.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1114', nombre: 'STAR MÉDICA CHIHUAHUA', alias: 'HSM Chihuahua', tipo: 'hospital', conAlimentos: true, ciudad: 'Chihuahua, Chih.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1115', nombre: 'STAR MÉDICA VERACRUZ', alias: 'HSM Veracruz', tipo: 'hospital', conAlimentos: true, ciudad: 'Veracruz, Ver.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1119', nombre: 'STAR MÉDICA TLALNEPANTLA', alias: 'HSM Tlalnepantla', tipo: 'hospital', conAlimentos: true, ciudad: 'Tlalnepantla, Edo. Méx.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1120', nombre: 'STAR MÉDICA POLANCO', alias: 'HSM Polanco', tipo: 'hospital', conAlimentos: false, ciudad: 'Ciudad de México', tipoBanco: '', cuentaBancaria: '' },
  { id: '1121', nombre: 'STAR MÉDICA GUADALAJARA', alias: 'HSM Guadalajara', tipo: 'hospital', conAlimentos: true, ciudad: 'Guadalajara, Jal.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1122', nombre: 'STAR MÉDICA PUEBLA', alias: 'HSM Puebla', tipo: 'hospital', conAlimentos: true, ciudad: 'Puebla, Pue.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1125', nombre: 'STAR MÉDICA MONTERREY', alias: 'HSM Monterrey', tipo: 'hospital', conAlimentos: true, ciudad: 'Monterrey, N.L.', tipoBanco: '', cuentaBancaria: '' },
  { id: '1129', nombre: 'STAR MÉDICA PEDREGAL', alias: 'HSM Pedregal', tipo: 'hospital', conAlimentos: true, ciudad: 'Ciudad de México', tipoBanco: '', cuentaBancaria: '' },
  { id: '1133', nombre: 'STAR MÉDICA SANTA FE', alias: 'HSM Santa Fe', tipo: 'hospital', conAlimentos: true, ciudad: 'Ciudad de México', tipoBanco: '', cuentaBancaria: '' }
];
// ciudad = valor de PRESENTACIÓN del prototipo para el selector de destinos (PROVISIONAL MOCK: el libro no trae ciudad ni estado).
const hospById = id => HOSPITALES.find(h => h.id === String(id)) || null;
// Resuelve un registro por alias corto («HSM Chihuahua»), por nombre oficial o por id. «Corporativo» → 1100.
const hospByAlias = v => { const s = String(v || '').trim(); if (!s) return null; if (/^corporativo$/i.test(s)) return hospById('1100');
  return HOSPITALES.find(h => h.alias === s || h.nombre === s || h.id === s || (h.corto && h.corto === s)) || null; };
const hospLabel = (id, full) => { const h = hospById(id); return h ? (full ? h.id + ' · ' + h.nombre : h.alias) : ''; };

// ---------------------------------------------------------------------------
// SOCIEDADES · «Cat. RFC» (CLIENT CONFIRMED — GREEN WORKBOOK). La SOCIEDAD del colaborador es dato de personal del ERP
// (código); este catálogo solo la ENRIQUECE con razón social y RFC cuando una pantalla lo necesita (comprobación, contabilidad).
// Nunca se infiere la sociedad de una persona a partir de su hospital, rol, perfil o CECO.
// ---------------------------------------------------------------------------
const SOCIEDADES = [
  { sociedad: '1100', razonSocial: 'Star Médica S.A. de C.V.', rfc: 'SME001012RI2' },
  { sociedad: '2200', razonSocial: 'Arrendadora Star Médica', rfc: 'ASM150727BR6' },
  { sociedad: '2521', razonSocial: 'Inmobiliaria SM de Guadalajara', rfc: 'ISG1802141R1' },
  { sociedad: '2522', razonSocial: 'Inmobiliaria SM de Puebla', rfc: 'ISP180214L58' },
  { sociedad: '3100', razonSocial: 'Star del Sureste', rfc: 'ISS0401206S0' },
  { sociedad: '4100', razonSocial: 'Servicio Corporativos MC S.C.', rfc: 'SCO020920HHA' },
  { sociedad: '4800', razonSocial: 'Administración Profesional Star Médica S.A. de C.V.', rfc: 'APS041222253' },
  { sociedad: '5100', razonSocial: 'Imagen y Radiología Médica S.A. de C.V.', rfc: 'IRM080410U16' }
];
const sociedadById = code => SOCIEDADES.find(s => s.sociedad === String(code || '')) || null;
// Etiqueta de cuenta / datos de personal: «1100 · Star Médica S.A. de C.V.» (código + razón social; el RFC solo donde se requiera).
const sociedadLabel = code => { const s = sociedadById(code); return s ? s.sociedad + ' · ' + s.razonSocial : (code ? String(code) : '—'); };

// ---------------------------------------------------------------------------
// RECORRIDOS · «Cat. Recorridos» (CLIENT CONFIRMED — GREEN WORKBOOK): 26 pares ciudad origen → destino con kilómetros.
// SOLO DATO DE REFERENCIA: el cliente NO ha definido qué regla consume los km (vuelo, gasolina, casetas, kilometraje).
// No se asume simetría, no se fabrican rutas faltantes, no se deriva ninguna decisión de negocio (OPEN CLIENT DECISION).
// ---------------------------------------------------------------------------
const RECORRIDOS = [
  { id: 32, origen: 'Morelia', destino: 'Aguascalientes', km: 329 }, { id: 33, origen: 'Morelia', destino: 'Guadalajara', km: 293 },
  { id: 34, origen: 'Morelia', destino: 'León', km: 206 }, { id: 35, origen: 'Morelia', destino: 'Puebla', km: 427 },
  { id: 36, origen: 'Morelia', destino: 'Querétaro', km: 194 }, { id: 37, origen: 'Morelia', destino: 'San Luis Potosí', km: 331 },
  { id: 38, origen: 'Morelia', destino: 'México D.F. (Zona Met)', km: 299 }, { id: 39, origen: 'Morelia', destino: 'Toluca', km: 235 },
  { id: 40, origen: 'México D.F.', destino: 'Acapulco', km: 398 }, { id: 41, origen: 'México D.F.', destino: 'Aguascalientes', km: 500 },
  { id: 42, origen: 'México D.F.', destino: 'León', km: 378 }, { id: 43, origen: 'México D.F.', destino: 'Puebla', km: 143 },
  { id: 44, origen: 'México D.F.', destino: 'Querétaro', km: 207 }, { id: 45, origen: 'México D.F.', destino: 'San Luis Potosí', km: 402 },
  { id: 46, origen: 'México D.F.', destino: 'Toluca', km: 67 }, { id: 47, origen: 'México D.F.', destino: 'Veracruz', km: 419 },
  { id: 48, origen: 'Aguascalientes', destino: 'Guadalajara', km: 242 }, { id: 49, origen: 'Aguascalientes', destino: 'León', km: 123 },
  { id: 50, origen: 'Aguascalientes', destino: 'Querétaro', km: 298 }, { id: 51, origen: 'Aguascalientes', destino: 'San Luis Potosí', km: 210 },
  { id: 52, origen: 'Querétaro', destino: 'Guadalajara', km: 366 }, { id: 53, origen: 'Querétaro', destino: 'León', km: 176 },
  { id: 54, origen: 'Querétaro', destino: 'San Luis Potosí', km: 209 }, { id: 55, origen: 'San Luis Potosí', destino: 'Guadalajara', km: 372 },
  { id: 56, origen: 'San Luis Potosí', destino: 'León', km: 200 }, { id: 57, origen: 'Cd. Juárez', destino: 'Chihuahua', km: 357 }
];

// ---------------------------------------------------------------------------
// DOCUMENTOS DE COMPROBACIÓN · «Cat. Dcotos comprobacion» (CLIENT CONFIRMED — GREEN WORKBOOK). Campos EXACTOS del libro:
// XML · PDF · TXT · IVA · IVA Frontera · IEPS · ISHosp · Impuesto Traslado. FUTURE CONTEXT: lo consumirá la captura y
// validación de la Comprobación (no construida en este pase). Anomalías del libro conservadas tal cual (OPEN CLIENT DECISION):
// 118 propinas con factura sin XML/PDF · 119 propinas sin factura con XML/PDF/IVA · 127 hospedaje sin PDF · 128 otros gastos «?» en XML · 129 paquetería sin PDF.
// ---------------------------------------------------------------------------
const DOCS_COMPROBACION = [
  { id: 109, concepto: 'alimentos con factura', xml: 'X', pdf: 'X', txt: '', iva: 'X', ivaFrontera: 'X', ieps: '', isHosp: '', impTraslado: '' },
  { id: 111, concepto: 'autobus', xml: 'X', pdf: 'X', txt: '', iva: 'X', ivaFrontera: 'X', ieps: '', isHosp: '', impTraslado: '' },
  { id: 113, concepto: 'casetas con factura', xml: 'X', pdf: 'X', txt: '', iva: 'X', ivaFrontera: 'X', ieps: '', isHosp: '', impTraslado: 'X' },
  { id: 114, concepto: 'casetas sin factura', xml: '', pdf: '', txt: '', iva: 'X', ivaFrontera: 'X', ieps: '', isHosp: '', impTraslado: '' },
  { id: 115, concepto: 'estacionamiento con factura', xml: 'X', pdf: 'X', txt: '', iva: 'X', ivaFrontera: '', ieps: '', isHosp: '', impTraslado: '' },
  { id: 116, concepto: 'estacionamiento sin factura', xml: '', pdf: '', txt: '', iva: 'X', ivaFrontera: '', ieps: '', isHosp: '', impTraslado: '' },
  { id: 118, concepto: 'propinas con factura', xml: '', pdf: '', txt: '', iva: '', ivaFrontera: '', ieps: '', isHosp: '', impTraslado: '', anomalia: 'Sin XML/PDF pese a «con factura»' },
  { id: 119, concepto: 'propinas sin factura', xml: 'X', pdf: 'X', txt: '', iva: 'X', ivaFrontera: '', ieps: '', isHosp: '', impTraslado: '', anomalia: 'Con XML/PDF/IVA pese a «sin factura»' },
  { id: 124, concepto: 'tintoreria con factura', xml: 'X', pdf: 'X', txt: '', iva: 'X', ivaFrontera: '', ieps: '', isHosp: '', impTraslado: '' },
  { id: 126, concepto: 'gasolina', xml: 'X', pdf: 'X', txt: '', iva: 'X', ivaFrontera: '', ieps: '', isHosp: '', impTraslado: '' },
  { id: 127, concepto: 'hospedaje', xml: 'X', pdf: '', txt: '', iva: 'X', ivaFrontera: '', ieps: 'X', isHosp: 'X', impTraslado: '', anomalia: 'Sin PDF' },
  { id: 128, concepto: 'otros gastos', xml: '?', pdf: '', txt: '', iva: 'X', ivaFrontera: '', ieps: '', isHosp: '', impTraslado: '', anomalia: '«?» en XML' },
  { id: 129, concepto: 'paqueteria y mensajeria', xml: 'X', pdf: '', txt: '', iva: 'X', ivaFrontera: '', ieps: '', isHosp: '', impTraslado: '', anomalia: 'Sin PDF' }
];
// Columna «Solicitud» (libro V1 (1), 2026-10-05 · CLIENT CONFIRMED — GREEN WORKBOOK): concepto de la solicitud de viaje al que aporta cada documento.
// Es la base del GASTO ESTIMADO de la solicitud (Word «La solicitud deberá agregar los gastos estimados tomar del catálogo…»).
const SOLICITUD_DE = { 109: 'Alimentos', 111: 'Autobús', 113: 'Casetas', 114: 'Casetas', 115: 'Estacionamiento', 116: 'Estacionamiento', 118: 'Propinas', 119: 'Propinas', 124: 'Tintorería', 126: 'Gasolina', 127: 'Hospedaje', 128: 'Otros gastos', 129: 'Paquetería y mensajería' };
DOCS_COMPROBACION.forEach(d => { d.solicitud = SOLICITUD_DE[d.id] || ''; });
// CONCEPTOS DE LA SOLICITUD (derivados, sin duplicar el catálogo): un concepto por valor distinto de «Solicitud», con los ids de documento que lo comprueban.
// calculo = 'tarifa' cuando una tarifa confirmada permite estimarlo (Alimentos · Hospedaje · Tintorería); 'captura' cuando el libro solo da el concepto
// (el viajero puede indicar un importe estimado; sin regla de cálculo en las fuentes — ninguna se inventa).
const CONCEPTOS_SOLICITUD = [];
DOCS_COMPROBACION.forEach(d => { if (!d.solicitud) return; let c = CONCEPTOS_SOLICITUD.find(x => x.label === d.solicitud); if (!c) { c = { id: 'cs' + d.id, label: d.solicitud, docs: [], calculo: ['Alimentos', 'Hospedaje', 'Tintorería'].includes(d.solicitud) ? 'tarifa' : 'captura' }; CONCEPTOS_SOLICITUD.push(c); } c.docs.push(d.id); });

// ---------------------------------------------------------------------------
// MOTIVOS DE VIAJE · «Motivos de viaje» (CLIENT CONFIRMED — GREEN WORKBOOK, libro V1 (1)). Vigencia 01/09/2026 – sin fecha de cierre.
// Las vigencias de las filas 2–6 del libro (01.09.2027…2031 / 31.12.10000…) son un arrastre de celdas, no fechas de negocio → se reporta, no se copia.
// «Otros» aparece sin código ni vigencia: OPEN CLIENT DECISION (¿motivo real u opción «Otros» del listado de destinos?) → no se incluye.
// DILI: «solo puede aplicar a ciertas funciones» (observación del libro); la lista de funciones NO fue proporcionada → sin validación (OPEN).
// ---------------------------------------------------------------------------
const MOTIVOS_VIAJE = [
  { code: 'PROY', label: 'Proyecto', from: '01/09/2026', to: '31/12/9999' },
  { code: 'CAPA', label: 'Capacitación', from: '01/09/2026', to: '31/12/9999' },
  { code: 'CUVA', label: 'Cubrir vacante', from: '01/09/2026', to: '31/12/9999' },
  { code: 'RECO', label: 'Reunión comité', from: '01/09/2026', to: '31/12/9999' },
  { code: 'DILI', label: 'Diligencias', from: '01/09/2026', to: '31/12/9999', obs: 'Solo aplica a ciertas funciones (lista pendiente del cliente)' },
  { code: 'OPER', label: 'Operación', from: '01/09/2026', to: '31/12/9999' }
];

// ---------------------------------------------------------------------------
// PARÁMETROS GLOBALES · «Paramtros Globales» (CLIENT CONFIRMED — GREEN WORKBOOK). idhospital «*» = todos. Vigencia 01/08/2026 – sin fecha de cierre.
// DIAS_ANTSOL: el libro dice 5 «de la solicitud»; el Word habla de 5 para el ANTICIPO y «distinta de la fecha de la solicitud de viaje»; el alcance
// decía 4 para la solicitud de viaje → CONFLICTO ABIERTO. El prototipo usa 5 (valor del libro) marcado como PENDIENTE DE CONFIRMACIÓN, no como confirmado.
// ---------------------------------------------------------------------------
const PARAMETROS_GLOBALES = [
  { code: 'MAX_DEST', label: 'Destinos máximos por viaje', valor: 3, unidad: 'Destinos', from: '01/08/2026', to: '31/12/9999' },
  { code: 'HOSP_CORP', label: 'Viajes de hospitales a Corporativo habilitados', valor: 1, valorLabel: 'Activo', obs: 'Cualquier persona del hospital puede viajar a Corporativo', from: '01/08/2026', to: '31/12/9999' },
  { code: 'HOSP_HOSP', label: 'Viajes de hospital a hospital', valor: 2, valorLabel: 'Con autorización', from: '01/08/2026', to: '31/12/9999' },
  { code: 'CORP_HOSP', label: 'Viajes de Corporativo a hospital', valor: 1, valorLabel: 'Activo', from: '01/08/2026', to: '31/12/9999' },
  { code: 'DIAS_ANTSOL', label: 'Días de anticipación de la solicitud', valor: 5, unidad: 'Días', from: '01/08/2026', to: '31/12/9999', pendiente: 'Conflicto 4 (alcance) vs 5 (libro) · pendiente de confirmación del cliente' }
];
const paramGlobal = code => (PARAMETROS_GLOBALES.find(p => p.code === code) || {}).valor;

// ---------------------------------------------------------------------------
// ESTADOS DE VIAJE · «Ciudades de viaje» (CLIENT CONFIRMED — GREEN WORKBOOK): «TABLA DE ESTADOS». Solo 9 estados llevan vigencia (01/09/2026 –
// sin fecha de cierre); los 23 restantes están listados sin vigencia y se conservan como NO VIGENTES. El libro NO trae ciudades: la ciudad de un
// destino «Otro» se captura como texto. Sustituye el catálogo inventado del prototipo (Jalisco, Nuevo León, ciudades).
// ---------------------------------------------------------------------------
const ESTADOS_VIGENTES = ['Aguascalientes', 'Chihuahua', 'Ciudad de México', 'México (Estado de México)', 'Michoacán de Ocampo', 'Querétaro', 'San Luis Potosí', 'Veracruz', 'Yucatán'];
const ESTADOS_SIN_VIGENCIA = ['Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Quintana Roo', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Zacatecas'];
const ESTADOS_VIAJE = ESTADOS_VIGENTES.map(e => ({ estado: e, from: '01/09/2026', to: '31/12/9999', vigente: true })).concat(ESTADOS_SIN_VIGENCIA.map(e => ({ estado: e, from: '', to: '', vigente: false })));

// REGLAS DE CARGA DE ARCHIVOS — configuración CENTRAL (una sola fuente; toda carga de documentos del Portal la reutiliza).
// Fuentes: flujo aprobado «tipo / tamaño de archivo y caracteres permitidos» · Word del cliente «Archivo de justificación (validar tamaño y tipo de
// archivo, sin caracteres especiales)». NINGUNA fuente fija la lista de tipos ni el tamaño máximo → allowedTypes / maxSizeMB = null = OPEN CLIENT DECISION
// (la validación existe y se activa al confirmarse el valor; no se inventa). El nombre sin caracteres especiales SÍ está confirmado.
// ESTÁNDAR GLOBAL DE CARGA DE ARCHIVOS (CLIENT CONFIRMED 2026-10-05): 5 MB máximo POR ARCHIVO en todo el Portal (actual y futuro), salvo un
// requisito de negocio posterior documentado. allowedTypes = null → tipos aún NO confirmados por el cliente (OPEN; no se inventan).
const FILE_UPLOAD_RULES = { maxSizeBytes: 5 * 1024 * 1024, allowedTypes: null, nameRule: 'safe' };
// Reglas por tipo de documento = el estándar global (solo se separan si un requisito documentado lo exige).
const FILE_RULES = {
  justificacion: { label: 'Archivo de justificación', ...FILE_UPLOAD_RULES },
  respaldo: { label: 'Documento de respaldo', ...FILE_UPLOAD_RULES }
};
// Nombre seguro: letras sin acento, números, espacio, guion y guion bajo + un solo punto antes de la extensión (estándar ya vigente en la solicitud).
const FILE_NAME_SAFE = /^[A-Za-z0-9 _-]+(\.[A-Za-z0-9]{1,10})?$/;
const FILE_ERRORS = {
  FILE_TOO_LARGE: mb => 'El archivo supera el tamaño máximo permitido de ' + mb + ' MB. Selecciona un archivo de menor tamaño.',
  INVALID_FILE_TYPE: () => 'Tipo de archivo no permitido. Selecciona un archivo con un formato admitido.',
  INVALID_FILE_NAME: () => 'El nombre del archivo contiene caracteres no permitidos. Usa letras sin acento, números, espacios, guion o guion bajo.'
};
const fileMB = R => Math.round(((R && R.maxSizeBytes) || FILE_UPLOAD_RULES.maxSizeBytes) / 1048576);
// VALIDADOR ÚNICO: tamaño → tipo → nombre; devuelve { valid, errorCode, message }. Exactamente 5 MB se acepta (solo > máximo se rechaza).
function validateUpload(file, rules) {
  const R = { ...FILE_UPLOAD_RULES, ...(rules || {}) }, name = String((file && file.name) || ''), dot = name.lastIndexOf('.'), ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
  if (R.maxSizeBytes != null && Number(file && file.size) > R.maxSizeBytes) return { valid: false, errorCode: 'FILE_TOO_LARGE', message: FILE_ERRORS.FILE_TOO_LARGE(fileMB(R)) };
  if (Array.isArray(R.allowedTypes) && R.allowedTypes.length && !R.allowedTypes.includes(ext)) return { valid: false, errorCode: 'INVALID_FILE_TYPE', message: FILE_ERRORS.INVALID_FILE_TYPE() };
  if (R.nameRule === 'safe' && !FILE_NAME_SAFE.test(name)) return { valid: false, errorCode: 'INVALID_FILE_NAME', message: FILE_ERRORS.INVALID_FILE_NAME() };
  return { valid: true, errorCode: '', message: '' };
}
// Texto de apoyo que TODO selector muestra antes de elegir (tipos solo cuando estén confirmados).
function uploadHelp(rules) { const R = { ...FILE_UPLOAD_RULES, ...(rules || {}) }; return (Array.isArray(R.allowedTypes) && R.allowedTypes.length ? R.allowedTypes.map(x => x.toUpperCase()).join(', ') + ' · máximo ' : 'Tamaño máximo por archivo: ') + fileMB(R) + ' MB'; }
// Compatibilidad: validateFile(ruleKey, file) → { ok, code, msg } sobre el validador único.
function validateFile(ruleKey, file) { const r = validateUpload(file, FILE_RULES[ruleKey]); return { ok: r.valid, code: r.errorCode, msg: r.message }; }

window.SMV_CAT = { FILE_UPLOAD_RULES, FILE_RULES, FILE_NAME_SAFE, FILE_ERRORS, validateUpload, uploadHelp, validateFile, HOSP_VIG, HOSPITALES, hospById, hospByAlias, hospLabel, SOCIEDADES, sociedadById, sociedadLabel, RECORRIDOS, DOCS_COMPROBACION, CONCEPTOS_SOLICITUD, MOTIVOS_VIAJE, PARAMETROS_GLOBALES, paramGlobal, ESTADOS_VIAJE, ESTADOS_VIGENTES };
})(); }
