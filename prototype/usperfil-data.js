if (!window.SMV_PERFIL) { (function(){
// PERFIL DEL VIAJERO — datos mock del modelo único de perfil de viajero (catálogo, tarifas, excepciones,
// asignaciones, viajes y saldo aplicable). DEMO ONLY (datos sintéticos).
// UN SOLO MODELO: el catálogo y las asignaciones de aquí son la fuente del perfil efectivo que consumen
// el Inicio del colaborador, la ficha del colaborador y la resolución de permisos condicionados a perfil.
// El personal (identidad, puesto, datos de personal) sigue llegando del ERP y vive en us26-data.js (solo lectura).
// Vocabulario de perfil aprobado (5): Director · Ejecutivo · Mando medio · Operativo · Viajero externo (PERFILES_VIAJERO). DGA es ROL FUNCIONAL, nunca perfil (2026-10-06). Nunca «Nivel n».

const TODAY = '18/09/2026'; // referencia con la que se sembraron los registros (el prototipo usa la fecha real del navegador)

// ---------------------------------------------------------------------------
// Parámetros globales: último eslabón de la resolución del valor efectivo
// (excepción individual vigente → política del perfil → parámetro global).
// ---------------------------------------------------------------------------
const GLOBAL = {
  diasComprobar: { label: 'Días hábiles para comprobar', dias: 7, value: '7 días hábiles' },
  diasComplementaria: { label: 'Días hábiles para comprobación complementaria', dias: 7, value: '7 días hábiles' },
  propina: { label: 'Propina máxima', value: '10 % de la factura' },
  // TINTORERÍA — CLIENT CONFIRMED (GREEN WORKBOOK «Tarifas de Lavandería»: Nivel * Todos · $85 por día · Impuesto incluido · A partir del 6.º día)
  // + CLIENT CLARIFICATION: Lavandería = Tintorería (se conserva el término del Portal). Regla GLOBAL: misma para todos los perfiles y el Viajero externo.
  // Sustituye la regla provisional anterior («viajes continuos de más de 12 días», monto por perfil).
  tintoreria: { label: 'Tintorería', importe: 85, unidad: 'por día', desdeDia: 6, impuesto: 'Incluido', from: '01/09/2026', to: '31/12/9999', value: '$85 por día a partir del 6.º día del viaje · Impuesto incluido' },
  // DIAS_ANTSOL (libro V1 (1)) = 5. CONFLICTO ABIERTO: alcance 4 (Dias_Ant) · libro 5 «de la solicitud» · Word 5 para el anticipo «distinta de la solicitud de viaje».
  // Se usa el valor del libro marcado PENDIENTE DE CONFIRMACIÓN; nunca se presenta como recién confirmado. El anticipo conserva su propia antelación de 5 días.
  // CONFIGURABLE (manager 2026-10-05): Admin › Perfiles › Tarifas edita este parámetro global; una EXCEPCIÓN INDIVIDUAL vigente de la regla r12
  // lo sustituye para un colaborador (precedencia: excepción individual vigente > parámetro global; resolver único pvAntEff).
  antelacion: { label: 'Antelación mínima para solicitar', dias: 5, value: '5 días', pendiente: true, code: 'DIAS_ANTSOL' },
  // Parámetro global de política (hoja PERFIL del libro, no resaltada; «agregar a la vista de la solicitud»): días de depósito de viáticos.
  diasDeposito: { label: 'Días de depósito de viáticos', value: 'martes y jueves', dias: ['martes', 'jueves'] },
  // VIAJEROS EXTERNOS (historia, confirmado por el cliente): máximo de externos VIGENTES (activo + vigencia actual) por usuario de Capital Humano HSM registrador. Parámetro.
  maxExternos: { label: 'Máximo de viajeros externos vigentes por usuario de Capital Humano HSM', valor: 5, value: '5 por usuario registrador' }
};

// ---------------------------------------------------------------------------
// CATÁLOGO DE PERFILES — rubros, límites, cadena de autorización y vigencia.
// Los rubros provienen del alcance aprobado: anticipo · hospedaje · habitación · alimentos ·
// transporte · límites (semanas/noches/días) · cadena de autorización · gastos de representación.
// La cadena de autorización distingue colaborador de hospital y de corporativo (flujo aprobado).
// HOSPEDAJE (cliente 2026-10-05): Director/Ejecutivo (Niveles 1-2) → Hotel · Mando medio/Operativo y viajero externo (Niveles 3-5) → Hospital.
// Con motivo Operación o Cubrir vacante el hospedaje es forzosamente en el hospital destino salvo rechazo; «Hotel de convenio» para todos QUEDA SUPERSEDIDO.
// CADENA DE AUTORIZACIÓN: desde 2026-10-05 el perfil NO es la fuente (la define la estructura del ERP: función 80001076, enlace ZA02, jefe E EJ/E ED → DGA);
// cadenaHospital/cadenaCorporativo se conservan solo como TEXTO INFORMATIVO de política y no alimentan ningún cálculo (ver ESTRUCTURA_ERP).
// ---------------------------------------------------------------------------
// IMÁGENES DE REFERENCIA entregadas por el cliente, asociadas al PERFIL existente (no al colaborador).
// MODOS de transporte permitidos (≠ tarifas: los importes de vuelos, gasolina y casetas son conceptos de tarifa propios).
// Taxi NO es medio de la solicitud (cliente 2026-10-05: «Quitar taxi, este solo va en las comprobaciones»); su tarifa (TAXI) se conserva para la comprobación.
const TRANSPORTES = ['Avión', 'Camioneta SM', 'Autobús', 'Renta de auto', 'Auto particular'];
const PROFILES = [
  { id: 'pf-dir', perfil: 'Director', estado: 'Vigente', from: '01/01/2026', to: '31/12/2026',
    semanasMes: 3, nochesSemana: 6, diasMax: 18, diasComprobar: 7,
    anticipo: 'Sí',
    hospedaje: 'Hotel', habitacion: ['Individual'], alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'Sí, con autorización de DGA y revisión de Contraloría',
    transporte: ['Avión', 'Camioneta SM', 'Renta de auto', 'Auto particular'],
    cadenaHospital: 'Dirección de Hospital → Dirección Corporativa', cadenaCorporativo: 'Dirección Corporativa → DGA',
    doc: 'Política-de-viaje-2026-Direccion.pdf', colaboradores: 3 },
  { id: 'pf-eje', perfil: 'Ejecutivo', estado: 'Vigente', from: '01/01/2026', to: '31/12/2026',
    semanasMes: 3, nochesSemana: 5, diasMax: 15, diasComprobar: 7,
    anticipo: 'Sí', hospedaje: 'Hotel', habitacion: ['Individual'], alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'No',
    transporte: ['Avión', 'Camioneta SM', 'Autobús', 'Auto particular'],
    cadenaHospital: 'Dirección de Hospital → Dirección Corporativa', cadenaCorporativo: 'Director inmediato → Dirección Corporativa',
    doc: 'Política-de-viaje-2026-Ejecutivo.pdf', colaboradores: 2 },
  { id: 'pf-mm', perfil: 'Mando medio', estado: 'Vigente', from: '01/01/2026', to: '31/12/2026',
    semanasMes: 2, nochesSemana: 5, diasMax: 12, diasComprobar: 7,
    anticipo: 'Sí', hospedaje: 'Hospital', habitacion: ['Individual'], // cliente 2026-10-20: habitación de unidad hospitalaria siempre individual alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'No',
    transporte: ['Avión', 'Camioneta SM', 'Autobús', 'Auto particular'],
    cadenaHospital: 'Dirección de Hospital → Dirección Corporativa', cadenaCorporativo: 'Director inmediato → Dirección Corporativa',
    doc: 'Política-de-viaje-2026-Mando-medio.pdf', colaboradores: 6 },
  { id: 'pf-op', perfil: 'Operativo', estado: 'Vigente', from: '01/01/2026', to: '31/12/2026',
    semanasMes: 2, nochesSemana: 4, diasMax: 8, diasComprobar: 7,
    anticipo: 'Sí', hospedaje: 'Hospital', habitacion: ['Individual'], // cliente 2026-10-20: habitación de unidad hospitalaria siempre individual alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'No',
    transporte: ['Autobús', 'Camioneta SM', 'Auto particular'],
    cadenaHospital: 'Dirección de Hospital → Dirección Corporativa', cadenaCorporativo: 'Director inmediato → Dirección Corporativa',
    doc: 'Política-de-viaje-2026-Operativo.pdf', colaboradores: 4 },
  // Vigencia futura: demuestra el estado «Futura» («entrará en vigor el…») sin tocar la vigente.
  { id: 'pf-mm-2027', perfil: 'Mando medio', estado: 'Futura', from: '01/01/2027', to: '31/12/2027',
    semanasMes: 2, nochesSemana: 5, diasMax: 12, diasComprobar: 7,
    anticipo: 'Sí', hospedaje: 'Hospital', habitacion: ['Individual'], alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'No',
    transporte: ['Avión', 'Camioneta SM', 'Autobús', 'Auto particular'],
    cadenaHospital: 'Dirección de Hospital → Dirección Corporativa', cadenaCorporativo: 'Director inmediato → Dirección Corporativa',
    doc: 'Política-de-viaje-2027-Mando-medio.pdf', colaboradores: 6 }
];

// PERFIL AUTOMÁTICO propuesto por el ÁREA DE PERSONAL del ERP (tabla del cliente, Word 2026-10-05 «Validaciones asociadas a perfil»):
// Nivel 1 · ED Directivo → Director · Nivel 2 · EJ Ejecutivo → Ejecutivo · Nivel 3 · GR Gerente / SG Subgerente / LI Jefe → Mando medio ·
// Nivel 4 · resto (CO SU PR EN TE OE SS ES SO RS) → Operativo. «Nivel n» es nomenclatura interna: la interfaz usa el nombre del perfil (regla 28).
// Viajero externo no está en la tabla (flujo propio). DGA no es un resultado posible: es rol funcional, no perfil. SUPERSEDE el mapeo anterior por área de personal (E/ED/EJ/MM/OP).
const AUTO_BY_AREA = { ED: 'Director', EJ: 'Ejecutivo', GR: 'Mando medio', SG: 'Mando medio', LI: 'Mando medio',
  CO: 'Operativo', SU: 'Operativo', PR: 'Operativo', EN: 'Operativo', TE: 'Operativo', OE: 'Operativo', SS: 'Operativo', ES: 'Operativo', SO: 'Operativo', RS: 'Operativo' };
const AREA_PERSONAL_NOMBRE = { ED: 'Directivo', EJ: 'Ejecutivo', GR: 'Gerente', SG: 'Subgerente', LI: 'Jefe', CO: 'Coordinador', SU: 'Supervisor', PR: 'Administrativo', EN: 'Especialista no sindicalizado', TE: 'Prof. salud no sindicalizado', OE: 'Operativo no sindicalizado', SS: 'Especialista sindicalizado', ES: 'Prof. salud sindicalizado', SO: 'Operativo sindicalizado', RS: 'Residente' };
// Compatibilidad de lectura (código antiguo): resuelve por área de personal; el grupo de personal ya no propone perfil.
const AUTO_BY_GROUP = AUTO_BY_AREA;

// ---------------------------------------------------------------------------
// TARIFAS MÁXIMAS — fuente por concepto (clasificación que debe sobrevivir a futuras sesiones):
//   c1 Hospedaje  · CLIENT CONFIRMED (GREEN WORKBOOK «Hotel autorizadas») + CLARIFICATION: importe POR NOCHE, máximo autorizado.
//   c2 Alimentos  · CLIENT CONFIRMED («Tarifas de alimentos») + CLARIFICATION: TOPES DIARIOS ACUMULADOS por número de comidas (1 · 2 · 3).
//   TAXI          · CLIENT CONFIRMED («Tarifas de taxis»): por HOSPITAL DESTINO y POR SEMANA, igual para todos los perfiles (ya no es tarifa por perfil).
//   Tintorería    · CLIENT CONFIRMED: regla GLOBAL (GLOBAL.tintoreria). Dejó de ser concepto por perfil.
//   c6 Vuelos · c7 Gasolina · c8 Casetas · c4 Anticipo · PROVISIONAL MOCK (el libro no los confirma; se conservan como importes máximos).
// El titular del rol DGA viaja con perfil Director: recibe las tarifas de Director por su perfil, sin columna ni herencia propia (2026-10-06).
// Impuesto «Incluido» = atributo confirmado de las tarifas del libro (se muestra donde aporta valor).
// ---------------------------------------------------------------------------
const CONCEPTOS = [
  { id: 'c1', label: 'Hospedaje', unidad: 'por noche', duracion: 'noches', fuente: 'confirmada', impuesto: 'Incluido' },
  { id: 'c2', label: 'Alimentos', unidad: 'tope diario por comidas', duracion: 'dias', fuente: 'confirmada', tiers: true, impuesto: 'Incluido' },
  // Conceptos atómicos PROVISIONALES (ids estables c6 vuelos · c7 gasolina · c8 casetas). Base de cálculo NO definida en las fuentes.
  { id: 'c6', label: 'Vuelos', unidad: 'monto máximo · referencia', duracion: null, fuente: 'confirmada', impuesto: '' },
  { id: 'c7', label: 'Gasolina', unidad: 'monto máximo', duracion: null, fuente: 'provisional' },
  { id: 'c8', label: 'Casetas', unidad: 'monto máximo', duracion: null, fuente: 'provisional' },
  { id: 'c4', label: 'Anticipo', unidad: 'monto máximo autorizado', duracion: null, fuente: 'provisional' },
  // c9 Gastos de representación (regla 373): monto máximo por viaje; aplica SOLO a perfiles con capacidades.representacion (Director).
  // Las fuentes no definen importe → «Sin tarifa», configurable. Autorización DGA + revisión Contraloría sin cambios.
  { id: 'c9', label: 'Gastos de representación', unidad: 'monto máximo por viaje', duracion: null, fuente: 'provisional', soloCapacidad: 'representacion' }
];
// Perfiles que heredan la tarifa de otro perfil (ninguno vigente).
// CORRECCIÓN DEL CLIENTE (2026-10-06): DGA es ROL FUNCIONAL, no perfil de viajero → sin herencia «DGA = Director». Mecanismo conservado vacío.
const TARIFA_HEREDA = {};
// importe null = sin tarifa vigente (se señala en la matriz). c2 = [tope 1 comida, tope 2 comidas, tope 3 comidas] (acumulados, NO se suman).
const TARIFAS = {
  c1: { Director: 2800, Ejecutivo: 2000, 'Mando medio': 1800, Operativo: 1700 },
  c2: { Director: [650, 810, 1055], Ejecutivo: [475, 725, 985], 'Mando medio': [400, 650, 910], Operativo: [250, 420, 635], 'Viajero externo': [400, 650, 910] },
  // c6 Vuelos · CLIENT CONFIRMED — GREEN WORKBOOK V1 (1) «Tarifas de vuelo autorizadas»: 5,500 para Niveles 1-4 (vigencia 01/09/2026 – sin fecha de cierre).
  // Base (por vuelo / por viaje) NO declarada en el libro; en la solicitud es REFERENCIA (no se suma: el vuelo lo determina Viáticos). DGA hereda de Director.
  c6: { Director: 5500, Ejecutivo: 5500, 'Mando medio': 5500, Operativo: 5500 },
  // PROVISIONAL MOCK (importes reales pendientes del cliente): c7 · c8 · c4
  c7: { Director: 2500, Ejecutivo: 2000, 'Mando medio': 1800, Operativo: 1500 },
  c8: { Director: 1200, Ejecutivo: 1000, 'Mando medio': 900, Operativo: 800 },
  c4: { Director: null, Ejecutivo: 18000, 'Mando medio': 12000, Operativo: 8000 },
  c9: { Director: null }
};
// VIAJERO EXTERNO (libro: «Nivel 5 / Externo») = concepto existente del flujo de viajeros externos, NO un perfil del Portal.
// Se configura con el MISMO mecanismo canónico de tarifas que los perfiles (clave 'Viajero externo' en TARIFAS; pvTarifa):
// Alimentos confirmado (400 · 650 · 910); Hospedaje, Vuelos, Gasolina, Casetas y Anticipo sin tarifa → «Sin tarifa», configurables.
// Taxi (por hospital destino) y Tintorería (global) le aplican igual que a todos; no tienen tarifa propia por perfil.
const TARIFA_CATEGORIAS = ['Viajero externo'];
const TARIFAS_EXTERNO = { get c2() { return TARIFAS.c2['Viajero externo']; } }; // compatibilidad de lectura: la fuente es TARIFAS
// Vigencia general de publicación de las tarifas del prototipo (PROVISIONAL MOCK: el libro solo trae fechas en Alimentos · Director).
const TARIFA_VIG = { from: '01/01/2026', to: '31/12/2026' };
// Vigencias específicas del libro (CLIENT CONFIRMED): dos registros distintos de Alimentos · Director con los mismos importes; no se fusionan.
// Libro V1 (1): TODAS las filas de tarifas llevan 01/09/2026 – 31/12/9999. Alimentos · Director conserva además el registro 01/06–31/08/2026 (560/810/1055), marcado «Ejemplo» en el libro (histórico, no se fusiona).
const VIG_LIBRO = { from: '01/09/2026', to: '31/12/9999' };
const TARIFA_VIG_ESP = { 'c2|Director': [{ from: '01/06/2026', to: '31/08/2026', importes: [560, 810, 1055], nota: 'Ejemplo (libro)' }, VIG_LIBRO],
  'c2|Ejecutivo': [VIG_LIBRO], 'c2|Mando medio': [VIG_LIBRO], 'c2|Operativo': [VIG_LIBRO], 'c2|Viajero externo': [VIG_LIBRO],
  'c1|Director': [VIG_LIBRO], 'c1|Ejecutivo': [VIG_LIBRO], 'c1|Mando medio': [VIG_LIBRO], 'c1|Operativo': [VIG_LIBRO],
  'c6|Director': [VIG_LIBRO], 'c6|Ejecutivo': [VIG_LIBRO], 'c6|Mando medio': [VIG_LIBRO], 'c6|Operativo': [VIG_LIBRO] };
// POLÍTICA DE LA CATEGORÍA «VIAJERO EXTERNO» (la consume Creación con el MISMO motor que los perfiles; pvProfileOf la resuelve).
// Solo lo confirmado: anticipo «No» (historia: el externo no tiene anticipo, en pantalla y en servidor) · hospedaje en hospital (cliente 2026-10-05, Niveles 3-5) ·
// alimentos 1·2·3 comidas con su tarifa (TARIFAS.c2) · 7 + 7 días hábiles de comprobación (historia). Límites (semanas/noches/días) y medios de transporte NO están
// definidos (alcance: «1 semana, 2 noches, hotel de convenio individual» solo como referencia; perfil «Externos» pendiente) → null = «Sin límite configurado»
// y se ofrece el catálogo general de medios sin restricción inventada. Hotel, vuelo, gasolina y casetas: «Sin tarifa» en la matriz (configurable).
const POLITICA_EXTERNO = { id: 'pf-ext', perfil: 'Viajero externo', estado: 'Vigente', from: VIG_LIBRO.from, to: VIG_LIBRO.to, semanasMes: null, nochesSemana: null, diasMax: null, diasComprobar: 7,
  anticipo: 'No', anticipoNota: 'No aplica · viajero externo', hospedaje: 'Hospital', alimentos: ['Desayuno', 'Comida', 'Cena'], transporte: TRANSPORTES.slice(), transportePendiente: true, limitesPendientes: true,
  representacion: 'No', cadenaHospital: 'Dirección de Hospital → Dirección Corporativa seleccionada → Capital Humano Corporativo' };
// Nota de política del libro (Ejecutivo): se conserva tal cual como contexto confirmado; no se generaliza a otros perfiles.
const TARIFA_NOTAS = { 'c2|Ejecutivo': 'Este perfil toma desayuno y comida en el hospital. En días de traslado puede presentar factura hasta el tope diario; las facturas de días de traslado pueden presentarse en cualquier día del viaje.' };

// TAXI — CLIENT CONFIRMED (GREEN WORKBOOK): tarifa SEMANAL por hospital destino, igual para Niveles 1–5 (todos los perfiles y el viajero externo).
// Hospitales con tarifa específica (idhospital del catálogo canónico): 1101 Morelia · 1113 Querétaro · 1102 Aguascalientes · 1105 San Luis Potosí.
// OPEN CLIENT DECISION: cómo aplica «por semana» a viajes menores a una semana, semanas parciales o de varias semanas → el Portal muestra
// la TARIFA SEMANAL DE REFERENCIA y no calcula ningún total prorrateado.
const TAXI = { label: 'Taxi', unidad: 'por semana', impuesto: 'Incluido', from: '01/09/2026', to: '31/12/9999', ambito: 'comprobacion',
  porHospital: { '1101': 1445, '1113': 1445, '1102': 1445, '1105': 1445 }, otros: 1810, otrosLabel: 'Cualquier otro hospital o destino' };

// ---------------------------------------------------------------------------
// EXCEPCIONES INDIVIDUALES — usuario, regla afectada, valor de política vs valor excepcional,
// vigencia, motivo y documento. Prevalecen sobre la política del perfil mientras están vigentes.
// ---------------------------------------------------------------------------
// REGLAS CON EXCEPCIÓN INDIVIDUAL. La fuente aprobada las enuncia así: «cualquier usuario puede tener
// excepciones a reglas como días para comprobar, importes por cuenta contable de gasto o topes de viaje».
// Por eso el catálogo contiene solo días para comprobar, importes de tarifa y topes del viaje; cada regla
// declara su tipo de dato, su unidad y su control de captura (el formulario se arma con estos metadatos).
// Alimentos: la excepción individual actúa sobre el TOPE DIARIO COMPLETO (3 comidas); una excepción por tramo de comidas no está definida
// en las fuentes (OPEN). Transporte terrestre (antes r8) y Tintorería ya no admiten excepción: Taxi depende del hospital destino
// y Tintorería es regla global; ninguna fuente aprobada define una excepción individual para ellas.
const REGLAS_EXC = [
  { id: 'r1', label: 'Días hábiles para comprobar', kind: 'int', unidad: 'días hábiles', policy: 'diasComprobar' },
  { id: 'r3', label: 'Tarifa de hospedaje por noche', kind: 'money', unidad: 'por noche', policy: 'tarifa:c1' },
  { id: 'r2', label: 'Tope diario de alimentos (3 comidas)', kind: 'money', unidad: 'por día', policy: 'tarifa:c2' },
  { id: 'r9', label: 'Tarifa de vuelos', kind: 'money', unidad: 'monto máximo', policy: 'tarifa:c6' },
  { id: 'r10', label: 'Tarifa de gasolina', kind: 'money', unidad: 'monto máximo', policy: 'tarifa:c7' },
  { id: 'r11', label: 'Tarifa de casetas', kind: 'money', unidad: 'monto máximo', policy: 'tarifa:c8' },
  { id: 'r13', label: 'Gastos de representación', kind: 'money', unidad: 'monto máximo por viaje', policy: 'tarifa:c9', soloCapacidad: 'representacion' },
  { id: 'r4', label: 'Noches máximas por semana', kind: 'int', unidad: 'noches', policy: 'nochesSemana' },
  { id: 'r5', label: 'Semanas máximas por mes', kind: 'int', unidad: 'semanas', policy: 'semanasMes' },
  { id: 'r7', label: 'Días máximos por viaje', kind: 'int', unidad: 'días', policy: 'diasMax' },
  // Antelación mínima para solicitar: su valor base es el PARÁMETRO GLOBAL (no el perfil); la excepción individual vigente lo sustituye (manager 2026-10-05).
  { id: 'r12', label: 'Antelación mínima para solicitar', kind: 'int', unidad: 'días', policy: 'antelacion', base: 'global' },
  // US-14 (alineación 25/09/2026): «Monto máximo = tarifa Anticipo del perfil o la excepción vigente» → excepción individual del tope del anticipo.
  { id: 'r14', label: 'Monto máximo de anticipo', kind: 'money', unidad: 'monto máximo autorizado', policy: 'tarifa:c4' }
];
const EXCEPCIONES = [
  { id: 'e1', userId: 'u01', regla: 'r1', politica: 5, valor: 10,
    from: '01/09/2026', to: '31/12/2026', motivo: 'Cierre comercial simultáneo en tres unidades hospitalarias',
    documento: 'Autorización-Contraloría-2026-031.pdf', by: 'Sofía Delgado Marín', when: '01/09/2026 09:30', revoked: false },
  { id: 'e2', userId: 'u13', regla: 'r2', politica: 635, valor: 800,
    from: '01/08/2026', to: '31/10/2026', motivo: 'Comisión prolongada en plaza con tarifas superiores a la política',
    documento: 'Autorización-DGA-2026-018.pdf', by: 'Sofía Delgado Marín', when: '31/07/2026 17:10', revoked: false },
  { id: 'e3', userId: 'u10', regla: 'r3', politica: 1800, valor: 2400,
    from: '01/05/2026', to: '31/07/2026', motivo: 'Cierre contable presencial en plaza con tarifa hotelera superior',
    documento: 'Autorización-DGA-2026-009.pdf', by: 'Sofía Delgado Marín', when: '28/04/2026 11:45', revoked: false },
  { id: 'e4', userId: 'u03', regla: 'r4', politica: 6, valor: 4,
    from: '01/10/2026', to: '31/12/2026', motivo: 'Acuerdo de reducción de estancias con la Dirección Corporativa',
    documento: 'Autorización-DirCorp-2026-004.pdf', by: 'Sofía Delgado Marín', when: '10/09/2026 12:05', revoked: false },
  // DEMO: excepción individual de antelación (parámetro global 5 → 2 días) para demostrar la precedencia excepción > parámetro global.
  { id: 'e5', userId: 'u02', regla: 'r12', politica: 5, valor: 2,
    from: '01/10/2026', to: '31/12/2026', motivo: 'Coberturas de supervisión que se programan con aviso corto',
    documento: 'Autorización-CHCO-2026-022.pdf', by: 'Sofía Delgado Marín', when: '30/09/2026 10:15', revoked: false },
  // DEMO US-14: excepción individual del tope del anticipo (Operativo 8,000 → 9,000): el origen «Excepción individual» se ve en la propuesta.
  { id: 'e6', userId: 'u09', regla: 'r14', politica: 8000, valor: 9000,
    from: '01/10/2026', to: '31/12/2026', motivo: 'Auditorías en sitio con agendas de semana completa',
    documento: 'Autorización-DGA-2026-027.pdf', by: 'Sofía Delgado Marín', when: '30/09/2026 12:40', revoked: false }
];

// ---------------------------------------------------------------------------
// ASIGNACIONES DE PERFIL por colaborador (histórico + vigente, sin traslapes ni huecos).
// origen: 'automatico' (propuesto por el grupo de personal) | 'libre' (excepción: exige documento).
// Los colaboradores sin asignación quedan «Sin perfil asignado» (bloqueados para viajar).
// ---------------------------------------------------------------------------
const ASSIGN = {
  u01: [{ perfil: 'Mando medio', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por área de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' },
        { perfil: 'Operativo', from: '01/01/2025', to: '31/12/2025', origen: 'automatico', motivo: 'Perfil vigente en 2025', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2025 08:40' }],
  u02: [{ perfil: 'Mando medio', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por área de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u03: [{ perfil: 'Director', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por área de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u04: [{ perfil: 'Director', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por área de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u05: [{ perfil: 'Director', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por área de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u06: [{ perfil: 'Director', from: '01/01/2026', to: '', origen: 'libre', motivo: 'Perfil Director para el titular del rol DGA (DGA usa las tarifas de Director)', documento: 'Autorización-DG-2026-001.pdf', by: 'Sofía Delgado Marín', when: '02/01/2026 09:20' }],
  u07: [{ perfil: 'Mando medio', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por área de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u09: [{ perfil: 'Operativo', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por área de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u10: [{ perfil: 'Mando medio', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por área de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u11: [{ perfil: 'Ejecutivo', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por área de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u12: [{ perfil: 'Mando medio', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por área de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  // u13 (activa), u08 y u14 (inactivos en el Portal) no tienen asignación vigente → «Sin perfil asignado».
  // La alerta de la pantalla de colaboradores cuenta SOLO a los activos: son los que requieren acción.
  // u13 conserva folios con su perfil congelado, para demostrar que un folio autorizado no pierde sus reglas.
};

// ---------------------------------------------------------------------------
// DATOS DE ERP COMPLEMENTARIOS del encabezado del perfil (solo lectura):
// sociedad · CECO · unidad organizativa · grupoPersonal + areaPersonal (códigos del ERP; ≠ perfil de viajero y ≠ personnelGroup,
// que es la clasificación interna E/ED/EJ/MM/OP usada solo para proponer el perfil) · funcionId + funcionNombre · posicionId (el
// nombre de la posición es el puesto canónico USERS.puesto) — demo, sin catálogo ni regla derivada · datos bancarios enmascarados (visibles solo a roles autorizados).
// sociedad = CÓDIGO de sociedad del ERP (dato de personal simulado; CLIENT CLARIFICATION: viene del ERP, NUNCA se deriva de hospital, rol, perfil
// o CECO). La razón social se resuelve del catálogo confirmado uscat-data.js › SOCIEDADES cuando la pantalla la necesita.
// areaPersonal = código ERP del área de personal (base del perfil propuesto, tabla del cliente 2026-10-05). u01 «A · GR» es dato del cliente; el resto es DEMO.
// ---------------------------------------------------------------------------
const ERP_EXTRA = {
  u01: { sociedad: '1100', unidadOrg: 'Estrategias Comerciales', ceco: 'CECO 4102-CO', grupoPersonal: 'A', areaPersonal: 'GR', funcionId: '80000626', funcionNombre: 'Gerencia comercial', posicionId: '70007351', banco: '**** **** **** 4417', clabe: '0141 **** **** **** 27' },
  u02: { sociedad: '1100', unidadOrg: 'Capital Humano HSM Chihuahua', ceco: 'CECO 2210-HSMCH', areaPersonal: 'LI', funcionId: '80000412', funcionNombre: 'Coordinación de Capital Humano', posicionId: '70004120', banco: '**** **** **** 8802', clabe: '0141 **** **** **** 55' },
  u03: { sociedad: '1100', unidadOrg: 'Dirección HSM Chihuahua', ceco: 'CECO 2001-HSMCH', areaPersonal: 'ED', funcionId: '80000201', funcionNombre: 'Dirección de hospital', posicionId: '70002015', banco: '**** **** **** 1190', clabe: '0141 **** **** **** 03' },
  u04: { sociedad: '4100', unidadOrg: 'Dirección Comercial y de Negocios', ceco: 'CECO 4100-CO', areaPersonal: 'ED', funcionId: '80000110', funcionNombre: 'Dirección corporativa', posicionId: '70001102', banco: '**** **** **** 7745', clabe: '0141 **** **** **** 81' },
  u05: { sociedad: '4100', unidadOrg: 'Capital Humano Corporativo', ceco: 'CECO 4300-CO', areaPersonal: 'ED', funcionId: '80000123', funcionNombre: 'Dirección de área corporativa', posicionId: '70001230', banco: '**** **** **** 2036', clabe: '0141 **** **** **** 12' },
  u06: { sociedad: '1100', unidadOrg: 'Dirección General Adjunta', ceco: 'CECO 4000-CO', areaPersonal: 'ED', funcionId: '80000100', funcionNombre: 'Dirección General Adjunta', posicionId: '70001001', banco: '**** **** **** 5521', clabe: '0141 **** **** **** 90' },
  u07: { sociedad: '1100', unidadOrg: 'Hotelería HSM Chihuahua', ceco: 'CECO 2230-HSMCH', areaPersonal: 'LI', funcionId: '80000431', funcionNombre: 'Coordinación de hotelería', posicionId: '70004310', banco: '**** **** **** 6614', clabe: '0141 **** **** **** 44' },
  u08: { sociedad: '4800', unidadOrg: 'Hotelería Corporativa', ceco: 'CECO 4420-CO', areaPersonal: 'CO', funcionId: '80000542', funcionNombre: 'Coordinación de hotelería corporativa', posicionId: '70005420', banco: '**** **** **** 3390', clabe: '0141 **** **** **** 67' },
  u09: { sociedad: '4800', unidadOrg: 'Viáticos', ceco: 'CECO 4210-CO', areaPersonal: 'PR', funcionId: '80000610', funcionNombre: 'Analista de viáticos', posicionId: '70006105', banco: '**** **** **** 7028', clabe: '0141 **** **** **** 31' },
  u10: { sociedad: '4800', unidadOrg: 'Tesorería', ceco: 'CECO 4205-CO', areaPersonal: 'GR', funcionId: '80000621', funcionNombre: 'Coordinación de tesorería', posicionId: '70006210', banco: '**** **** **** 9163', clabe: '0141 **** **** **** 74' },
  u11: { sociedad: '1100', unidadOrg: 'Contraloría Corporativa', ceco: 'CECO 4220-CO', areaPersonal: 'EJ', funcionId: '80000632', funcionNombre: 'Contraloría corporativa', posicionId: '70006320', banco: '**** **** **** 4480', clabe: '0141 **** **** **** 19' },
  u12: { sociedad: '4100', unidadOrg: 'Seguridad TI', ceco: 'CECO 4600-CO', areaPersonal: 'SG', funcionId: '80000664', funcionNombre: 'Administración de seguridad', posicionId: '70006640', banco: '**** **** **** 2255', clabe: '0141 **** **** **** 58' },
  u13: { sociedad: '4800', unidadOrg: 'Contabilidad', ceco: 'CECO 4206-CO', areaPersonal: 'PR', funcionId: '80000622', funcionNombre: 'Analista de contabilidad', posicionId: '70006215', banco: '**** **** **** 8817', clabe: '0141 **** **** **** 26' },
  u14: { sociedad: '1100', unidadOrg: 'Hotelería HSM Chihuahua', ceco: 'CECO 2231-HSMCH', areaPersonal: 'OE', funcionId: '80000432', funcionNombre: 'Auxiliar de hotelería', posicionId: '70004318', banco: '**** **** **** 1002', clabe: '0141 **** **** **** 48' }
};

// ---------------------------------------------------------------------------
// VIAJES del colaborador (Mis viajes / ficha): folio, destino, fechas, motivo, monto, estatus, UUID de factura.
// status = clave de window.SMV_US01.STATUS. uuid = folio fiscal de la factura principal del folio.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// DATOS PERSONALES Y ESTRUCTURA DE ERP (SIMULADOS · solo lectura · cliente 2026-10-05). Ninguno se configura en el Portal.
//   fechaNacimiento · cuentaBancaria (enmascarada; la clabe completa nunca viaja al prototipo) · tarjetaCorporativa (colaboradores.tarjetacorpo)
//   medida: última medida de personal (alta / reingreso / cambio organizativo) con fecha — base de la elegibilidad de Capacitación (N1-3). DEMO.
// ESTRUCTURA_ERP = de dónde sale la cadena de autorización (Word «Proceso de autorización»): dirHospitalFn = ID función del director del hospital
//   (80001076) · autorizadorCorp = enlace temporal ZA02 «Autorizador Corporativo de Viáticos» de la unidad organizativa (resuelto a un usuario canónico)
//   · jefe = director inmediato (corporativo) con su grupo (E EJ / E ED; E ED → DGA). Los ids de persona son del registro canónico (us01-data.js › USERS).
// ---------------------------------------------------------------------------
const ERP_PERSONAL = {
  u01: { fechaNacimiento: '14/03/1988', cuentaBancaria: '**** **** **** 4417', tarjetaCorporativa: false, medida: null },
  u02: { fechaNacimiento: '02/11/1990', cuentaBancaria: '**** **** **** 8802', tarjetaCorporativa: false, medida: { tipo: 'Cambio organizativo', fecha: '28/09/2026' } },
  u03: { fechaNacimiento: '21/07/1975', cuentaBancaria: '**** **** **** 1190', tarjetaCorporativa: true, medida: null },
  u04: { fechaNacimiento: '09/01/1972', cuentaBancaria: '**** **** **** 7745', tarjetaCorporativa: true, medida: null },
  u05: { fechaNacimiento: '30/05/1979', cuentaBancaria: '**** **** **** 2036', tarjetaCorporativa: true, medida: null },
  u06: { fechaNacimiento: '17/09/1968', cuentaBancaria: '**** **** **** 5521', tarjetaCorporativa: true, medida: null },
  u07: { fechaNacimiento: '25/02/1992', cuentaBancaria: '**** **** **** 6614', tarjetaCorporativa: false, medida: null },
  u08: { fechaNacimiento: '11/12/1986', cuentaBancaria: '**** **** **** 3390', tarjetaCorporativa: false, medida: null },
  u09: { fechaNacimiento: '06/06/1994', cuentaBancaria: '**** **** **** 7028', tarjetaCorporativa: false, medida: null },
  u10: { fechaNacimiento: '19/08/1983', cuentaBancaria: '**** **** **** 9163', tarjetaCorporativa: false, medida: null },
  u11: { fechaNacimiento: '03/04/1977', cuentaBancaria: '**** **** **** 4480', tarjetaCorporativa: true, medida: null },
  u12: { fechaNacimiento: '27/10/1985', cuentaBancaria: '**** **** **** 2255', tarjetaCorporativa: false, medida: null },
  u13: { fechaNacimiento: '08/02/1991', cuentaBancaria: '**** **** **** 8817', tarjetaCorporativa: false, medida: { tipo: 'Alta', fecha: '29/09/2026' } },
  u14: { fechaNacimiento: '15/05/1996', cuentaBancaria: '**** **** **** 1002', tarjetaCorporativa: false, medida: null }
};
// Hospital HSM Chihuahua (1114): director = u03 (función 80001076); su unidad organizativa reporta por ZA02 a la Dirección Comercial y de Negocios (u04).
// Corporativo: jefe inmediato por unidad organizativa (DEMO). u06 es DGA (sin superior).
const ESTRUCTURA_ERP = {
  dirHospitalFn: '80001076', enlaceCorp: 'ZA02 · Autorizador Corporativo de Viáticos',
  hospital: { '1114': { director: 'u03', autorizadorCorp: 'u04' } },
  corporativo: { u01: { jefe: 'u04', jefeGrupo: 'E ED' }, u05: { jefe: 'u06', jefeGrupo: 'E ED' }, u08: { jefe: 'u05', jefeGrupo: 'E EJ' }, u09: { jefe: 'u05', jefeGrupo: 'E EJ' }, u10: { jefe: 'u11', jefeGrupo: 'E EJ' },
    u11: { jefe: 'u06', jefeGrupo: 'E ED' }, u12: { jefe: 'u04', jefeGrupo: 'E ED' }, u13: { jefe: 'u10', jefeGrupo: 'E EJ' }, u04: { jefe: 'u06', jefeGrupo: 'E ED' } }
};

const TRIPS = {
  u01: [
    { perfilFolio: 'Mando medio', folio: '00043', destino: 'HSM Chihuahua', fechas: '15/06/2026 – 18/06/2026', motivo: 'Operación', monto: '$9,090', status: 'enProceso', uuid: 'A1B2C3D4-5E6F-4711-8A90-1122334455AA', saldo: 'Anticipo por comprobar $9,090' },
    { perfilFolio: 'Mando medio', folio: '00038', destino: 'HSM Querétaro', fechas: '11/05/2026 – 14/05/2026', motivo: 'Capacitación', monto: '$7,420', status: 'finalizado', uuid: 'B2C3D4E5-6F70-4822-9BA1-2233445566BB', saldo: 'Sin saldo pendiente' },
    { perfilFolio: 'Operativo', folio: '00031', destino: 'HSM Mérida', fechas: '23/03/2026 – 27/03/2026', motivo: 'Operación', monto: '$11,860', status: 'finalizado', uuid: 'C3D4E5F6-7081-4933-ACB2-3344556677CC', saldo: 'Sin saldo pendiente' },
    { perfilFolio: 'Operativo', folio: '00024', destino: 'HSM Veracruz', fechas: '26/01/2026 – 28/01/2026', motivo: 'Reunión comité', monto: '$0', status: 'cancelada', uuid: '—', saldo: 'Presupuesto liberado' },
    { perfilFolio: 'Mando medio', folio: '00016', destino: 'HSM Monterrey', fechas: '03/11/2025 – 11/11/2025', motivo: 'Operación', monto: '$8,950', status: 'finalizado', uuid: 'E1F20304-5A6B-4C7D-8E9F-0A1B2C3D4E5F', saldo: 'Sin saldo pendiente' },
    { perfilFolio: 'Operativo', folio: '00019', destino: 'Corporativo', fechas: '02/12/2025 – 03/12/2025', motivo: 'Proyecto', monto: '$4,150', status: 'finalizado', uuid: 'D4E5F607-1829-4A44-BDC3-445566778899', saldo: 'Sin saldo pendiente' }
  ],
  u02: [
    { perfilFolio: 'Mando medio', folio: '00041', destino: 'Corporativo', fechas: '24/06/2026 – 25/06/2026', motivo: 'Reunión comité', monto: '$3,300', status: 'pendAut', uuid: '—', saldo: 'Pendiente de autorización' },
    { perfilFolio: 'Mando medio', folio: '00029', destino: 'HSM Mérida', fechas: '09/03/2026 – 11/03/2026', motivo: 'Capacitación', monto: '$5,640', status: 'finalizado', uuid: 'E5F60718-293A-4B55-CEDA-5566778899AA', saldo: 'Sin saldo pendiente' }
  ],
  u03: [
    { perfilFolio: 'Director', folio: '00040', destino: 'Corporativo', fechas: '22/06/2026 – 23/06/2026', motivo: 'Reunión comité', monto: '$6,400', status: 'aprobada', uuid: '—', saldo: 'Anticipo por solicitar' },
    { perfilFolio: 'Director', folio: '00027', destino: 'HSM Querétaro', fechas: '17/02/2026 – 19/02/2026', motivo: 'Operación', monto: '$9,250', status: 'finalizado', uuid: 'F6071829-3A4B-4C66-DFEB-66778899AABB', saldo: 'Sin saldo pendiente' }
  ],
  u13: [
    { perfilFolio: 'Operativo', folio: '00046', destino: 'HSM Chihuahua', fechas: '28/09/2026 – 02/10/2026', motivo: 'Proyecto', monto: '$6,800', status: 'pendAut', uuid: '—', saldo: 'Pendiente de autorización' },
    { perfilFolio: 'Operativo', folio: '00034', destino: 'HSM Veracruz', fechas: '13/04/2026 – 15/04/2026', motivo: 'Operación', monto: '$4,980', status: 'rechazada', uuid: '—', saldo: 'Sin saldo pendiente' },
    { perfilFolio: 'Operativo', folio: '00022', destino: 'HSM Mérida', fechas: '12/01/2026 – 16/01/2026', motivo: 'Capacitación', monto: '$8,310', status: 'finalizado', uuid: '07182 93A-4B5C-4D77-EAFC-778899AABBCC', saldo: 'Comprobación vencida · adeudo $1,240' }
  ]
};

// Indicadores de la ficha (comprobaciones vencidas y adeudos del colaborador)
const INDICADORES = {
  u01: { compVencidas: 0, adeudo: '$0', ultimoViaje: '18/06/2026' },
  u02: { compVencidas: 0, adeudo: '$0', ultimoViaje: '25/06/2026' },
  u03: { compVencidas: 0, adeudo: '$0', ultimoViaje: '23/06/2026' },
  u13: { compVencidas: 1, adeudo: '$1,240', ultimoViaje: '16/01/2026' }
};

// ---------------------------------------------------------------------------
// PRESUPUESTO APLICABLE al colaborador: SOLO la entidad presupuestal que corresponde a su adscripción
// (hospital o dirección corporativa, entidades distintas, nunca un campo mixto) y si hay disponible para
// nuevas solicitudes. El colaborador NO ve totales ni porcentajes de consumo de la entidad: el monitor de
// presupuesto pertenece a los roles con responsabilidad documentada.
// ---------------------------------------------------------------------------
const BUDGET = {
  u01: { tipo: 'Dirección corporativa', entidad: 'Dirección Comercial y de Negocios', suficiente: true, propio: { comprometido: 9090, enTransito: 9090, acumulado: 14350 } },
  u02: { tipo: 'Hospital', entidad: 'HSM Chihuahua', suficiente: true, propio: { comprometido: 3300, enTransito: 0, acumulado: 5640 } },
  u03: { tipo: 'Hospital', entidad: 'HSM Chihuahua', suficiente: true, propio: { comprometido: 6400, enTransito: 0, acumulado: 9250 } },
  u04: { tipo: 'Dirección corporativa', entidad: 'Dirección Comercial y de Negocios', suficiente: true, propio: { comprometido: 0, enTransito: 0, acumulado: 0 } },
  u13: { tipo: 'Dirección corporativa', entidad: 'Corporativo', suficiente: false, propio: { comprometido: 6800, enTransito: 1240, acumulado: 13290 } }
};

// EXPEDIENTE DE FOLIOS HISTÓRICOS (DEMO, sintético y coherente con su estatus): todo folio visible en Mis viajes tiene datos para su detalle
// (regla de completitud de fixtures). Secciones: estatus + filas ya en lenguaje del Portal; «No aplica» solo cuando el modelo lo justifica.
// Claves: origen · segs[label,inicio,fin,medio,hospedaje,comidas,hora] · cadena[[firmante, persona, resultado, fecha]] · hos/vue/ant/com/cie [estatus, tono, filas] ·
// cancel {fecha, motivo, punto} · gastos[[concepto, importe]] · hist[[fecha, evento, usuario, detalle, resultado, tono]].
const DET = (o) => o;
const TRIP_DETAIL = {
  '00043': DET({ origen: 'Corporativo', pago: { tipo: 'debito', texto: 'Tarjeta de débito · ERP · terminación 4417' }, just: 'Supervisión del arranque operativo del nuevo módulo de imagenología.', obs: 'Se requiere acceso temprano al área de imagenología el primer día.', docs: [['Evidencia adicional', 'Agenda-supervision-Puebla.pdf', '03/05/2026']], segs: [['HSM Chihuahua', '15/06/2026', '18/06/2026', 'Avión', 'hospital', ['Cena'], '07:40']],
    cadena: [['Director inmediato', 'Mónica Herrera Luna', 'Aprobada', '10/06/2026 11:20']],
    hos: ['Confirmado', 'verde', [['Unidad', 'HSM Chihuahua · habitación 214'], ['Fechas', '15/06/2026 – 18/06/2026 · 3 noches'], ['Confirmación', 'Hotelería HSM · 11/06/2026'], ['Documento', 'Confirmacion-HSM-Chihuahua-00043.pdf', 'doc']]],
    vue: ['Emitido', 'verde', [['Ida', 'CDMX → Chihuahua · 15/06/2026 · 07:40'], ['Regreso', 'Chihuahua → CDMX · 18/06/2026 · 18:10'], ['Gestión', 'Viáticos · 11/06/2026'], ['Documento', 'Itinerario-Vuelo-00043.pdf', 'doc']]],
    ant: ['Depositado', 'verde', [['Monto depositado', '$9,090'], ['Fecha de depósito', '12/06/2026']]],
    com: ['En curso', 'azul', [['Monto sujeto a comprobación', '$9,090'], ['Comprobado a la fecha', '$0'], ['Plazo', '7 días hábiles para iniciar y 7 para concluir a partir del fin del viaje (18/06/2026)']]],
    gastos: [['Hospedaje', 0], ['Alimentos', 1200], ['Propinas', 790], ['Vuelo (referencia)', 7100]],
    hist: [['08/06/2026 10:05', 'Envió la solicitud de viaje a autorización', 'Elizabeth Sánchez Gómez', 'HSM Chihuahua · 15/06/2026 – 18/06/2026', 'Enviado', 'azul'],
      ['10/06/2026 11:20', 'Aprobó la solicitud de viaje', 'Mónica Herrera Luna', 'Pendiente autorización → Aprobada', 'Aprobado', 'verde'],
      ['12/06/2026 09:00', 'Depositó el anticipo', 'Contabilidad / Tesorería', '$9,090', 'Realizado', 'verde']] }),
  '00038': DET({ origen: 'Corporativo', pago: { tipo: 'alternativa', texto: 'Tarjeta alternativa · BBVA · Visa · cuenta •••• 2310' }, just: 'Capacitación presencial del equipo de enfermería en el protocolo de triage.', docs: [['Evidencia adicional', 'Programa-capacitacion-Veracruz.pdf', '08/04/2026']], segs: [['HSM Querétaro', '11/05/2026', '14/05/2026', 'Avión', 'hospital', ['Comida', 'Cena'], '08:15']],
    cadena: [['Director inmediato', 'Mónica Herrera Luna', 'Aprobada', '04/05/2026 13:02']],
    hos: ['Confirmado', 'verde', [['Unidad', 'HSM Querétaro · habitación 108'], ['Fechas', '11/05/2026 – 14/05/2026 · 3 noches'], ['Documento', 'Confirmacion-HSM-Queretaro-00038.pdf', 'doc']]],
    vue: ['Emitido', 'verde', [['Ida', 'CDMX → Querétaro · 11/05/2026 · 08:15'], ['Regreso', 'Querétaro → CDMX · 14/05/2026 · 19:30'], ['Documento', 'Itinerario-Vuelo-00038.pdf', 'doc']]],
    ant: ['Depositado', 'verde', [['Monto depositado', '$7,420'], ['Fecha de depósito', '06/05/2026']]],
    com: ['Validada', 'verde', [['Monto comprobado', '$7,420'], ['Saldo', '$0 · sin adeudo ni reembolso'], ['Validación', 'Viáticos · 18/05/2026'], ['Documento', 'Comprobacion-00038.pdf', 'doc']]],
    cie: ['Cerrado', 'verde', [['Fecha de cierre', '20/05/2026'], ['Estatus final', 'Finalizado'], ['Área', 'Contabilidad / Tesorería']]],
    gastos: [['Alimentos', 1950], ['Propinas', 470], ['Vuelo (referencia)', 5000]],
    hist: [['02/05/2026 09:40', 'Envió la solicitud de viaje a autorización', 'Elizabeth Sánchez Gómez', 'HSM Querétaro', 'Enviado', 'azul'], ['04/05/2026 13:02', 'Aprobó la solicitud de viaje', 'Mónica Herrera Luna', 'Aprobada', 'Aprobado', 'verde'],
      ['06/05/2026 10:00', 'Depositó el anticipo', 'Contabilidad / Tesorería', '$7,420', 'Realizado', 'verde'], ['18/05/2026 12:30', 'Validó la comprobación', 'Viáticos', 'Comprobado $7,420', 'Realizado', 'verde'], ['20/05/2026 17:00', 'Cerró el folio', 'Contabilidad / Tesorería', 'Finalizado', 'Cerrado', 'verde']] }),
  '00031': DET({ origen: 'Corporativo', pago: { tipo: 'debito', texto: 'Tarjeta de débito · ERP · terminación 4417' }, proyecto: 'Expansión Sureste 2026', just: 'Levantamiento de requerimientos del proyecto de expansión con la dirección del hospital.', docs: [['Evidencia adicional', 'Minuta-kickoff-Merida.pdf', '12/03/2026']], segs: [['HSM Mérida', '23/03/2026', '27/03/2026', 'Avión', 'hospital', ['Desayuno', 'Comida', 'Cena'], '06:50']],
    cadena: [['Director inmediato', 'Mónica Herrera Luna', 'Aprobada', '16/03/2026 10:14']],
    hos: ['Confirmado', 'verde', [['Unidad', 'HSM Mérida · habitación 302'], ['Fechas', '23/03/2026 – 27/03/2026 · 4 noches']]],
    vue: ['Emitido', 'verde', [['Ida', 'CDMX → Mérida · 23/03/2026 · 06:50'], ['Regreso', 'Mérida → CDMX · 27/03/2026 · 20:05']]],
    ant: ['Depositado', 'verde', [['Monto depositado', '$11,860'], ['Fecha de depósito', '18/03/2026']]],
    com: ['Validada', 'verde', [['Monto comprobado', '$11,860'], ['Saldo', '$0 · sin adeudo ni reembolso'], ['Validación', 'Viáticos · 31/03/2026']]],
    cie: ['Cerrado', 'verde', [['Fecha de cierre', '28/04/2026'], ['Estatus final', 'Finalizado'], ['Área', 'Contabilidad / Tesorería']]],
    gastos: [['Alimentos', 3640], ['Propinas', 620], ['Vuelo (referencia)', 7600]],
    hist: [['13/03/2026 09:10', 'Envió la solicitud de viaje a autorización', 'Elizabeth Sánchez Gómez', 'HSM Mérida', 'Enviado', 'azul'], ['16/03/2026 10:14', 'Aprobó la solicitud de viaje', 'Mónica Herrera Luna', 'Aprobada', 'Aprobado', 'verde'], ['18/03/2026 10:00', 'Depositó el anticipo', 'Contabilidad / Tesorería', '$11,860', 'Realizado', 'verde'], ['31/03/2026 12:00', 'Validó la comprobación', 'Viáticos', 'Comprobado $11,860', 'Realizado', 'verde'], ['28/04/2026 17:00', 'Cerró el folio', 'Contabilidad / Tesorería', 'Finalizado', 'Cerrado', 'verde']] }),
  '00024': DET({ origen: 'Corporativo', pago: { tipo: 'debito', texto: 'Tarjeta de débito · ERP · terminación 4417' }, just: 'Participación en el comité de calidad del hospital.', segs: [['HSM Veracruz', '26/01/2026', '28/01/2026', 'Avión', 'hospital', ['Cena'], '09:30']],
    cadena: [['Director inmediato', 'Mónica Herrera Luna', 'Aprobada', '19/01/2026 16:40']],
    cancel: { fecha: '21/01/2026', motivo: 'El comité se reprogramó sin fecha', punto: 'Aprobada · antes de solicitar el anticipo' },
    gastos: [['Alimentos', 800], ['Vuelo (referencia)', 4300]],
    hist: [['17/01/2026 10:30', 'Envió la solicitud de viaje a autorización', 'Elizabeth Sánchez Gómez', 'HSM Veracruz', 'Enviado', 'azul'], ['19/01/2026 16:40', 'Aprobó la solicitud de viaje', 'Mónica Herrera Luna', 'Aprobada', 'Aprobado', 'verde'], ['21/01/2026 09:15', 'Canceló la solicitud de viaje', 'Elizabeth Sánchez Gómez', 'Cancelada · motivo: El comité se reprogramó sin fecha', 'Cancelado', 'gris']] }),
  '00016': DET({ origen: 'Corporativo', pago: { tipo: 'corporativa', texto: 'Tarjeta corporativa' }, just: 'Acompañamiento operativo durante la implantación del nuevo sistema de abasto.', obs: 'Traslado en auto particular desde Corporativo; estacionamiento en el hospital.', docs: [['Evidencia adicional', 'Plan-implantacion-abasto.pdf', '23/10/2025']], segs: [['HSM Monterrey', '03/11/2025', '11/11/2025', 'Auto particular', 'hospital', ['Cena']]],
    cadena: [['Director inmediato', 'Mónica Herrera Luna', 'Aprobada', '27/10/2025 10:30']],
    hos: ['Confirmado', 'verde', [['Unidad', 'HSM Monterrey · habitación 405'], ['Fechas', '03/11/2025 – 11/11/2025 · 8 noches'], ['Confirmación', 'Hotelería HSM · 29/10/2025']]],
    vue: ['No aplica · ningún destino usa avión', 'gris', [['Medio', 'Auto particular']]],
    ant: ['Depositado', 'verde', [['Monto depositado', '$8,950'], ['Fecha de depósito', '30/10/2025']]],
    com: ['Validada', 'verde', [['Monto comprobado', '$8,950'], ['Saldo', '$0 · sin adeudo ni reembolso'], ['Validación', 'Viáticos · 19/11/2025']]],
    cie: ['Cerrado', 'verde', [['Fecha de cierre', '21/11/2025'], ['Estatus final', 'Finalizado'], ['Área', 'Contabilidad / Tesorería']]],
    gastos: [['Hospedaje', 0], ['Alimentos', 3200], ['Tintorería', 340], ['Gasolina', 2400], ['Casetas', 1100], ['Estacionamiento', 450], ['Propinas', 300], ['Otros gastos', 900], ['Paquetería y mensajería', 260]],
    hist: [['24/10/2025 09:15', 'Envió la solicitud de viaje a autorización', 'Elizabeth Sánchez Gómez', 'HSM Monterrey · 03/11/2025 – 11/11/2025', 'Enviado', 'azul'], ['27/10/2025 10:30', 'Aprobó la solicitud de viaje', 'Mónica Herrera Luna', 'Aprobada', 'Aprobado', 'verde'], ['30/10/2025 10:00', 'Depositó el anticipo', 'Contabilidad / Tesorería', '$8,950', 'Realizado', 'verde'], ['19/11/2025 12:00', 'Validó la comprobación', 'Viáticos', 'Comprobado $8,950', 'Realizado', 'verde'], ['21/11/2025 17:00', 'Cerró el folio', 'Contabilidad / Tesorería', 'Finalizado', 'Cerrado', 'verde']] }),
  '00019': DET({ just: 'Cierre contable mensual en sitio.', origen: 'HSM Chihuahua', segs: [['Corporativo', '02/12/2025', '03/12/2025', 'Auto particular', 'hotel', ['Comida']]], proyecto: 'Integración de servicios de laboratorio',
    cadena: [['Dirección de Hospital', 'Fernando Miranda Ruiz', 'Aprobada', '25/11/2025 12:10']],
    hos: ['Confirmado', 'verde', [['Hotel', 'Hotel externo · 1 noche'], ['Fechas', '02/12/2025 – 03/12/2025']]],
    ant: ['Depositado', 'verde', [['Monto depositado', '$4,150'], ['Fecha de depósito', '28/11/2025']]],
    com: ['Validada', 'verde', [['Monto comprobado', '$4,150'], ['Saldo', '$0 · sin adeudo ni reembolso'], ['Validación', 'Viáticos · 09/12/2025']]],
    cie: ['Cerrado', 'verde', [['Fecha de cierre', '12/12/2025'], ['Estatus final', 'Finalizado'], ['Área', 'Contabilidad / Tesorería']]],
    gastos: [['Hospedaje', 1800], ['Alimentos', 400], ['Gasolina', 1350], ['Casetas', 600]],
    hist: [['21/11/2025 11:30', 'Envió la solicitud de viaje a autorización', 'Elizabeth Sánchez Gómez', 'Corporativo', 'Enviado', 'azul'], ['25/11/2025 12:10', 'Aprobó la solicitud de viaje', 'Fernando Miranda Ruiz', 'Aprobada', 'Aprobado', 'verde'], ['28/11/2025 10:00', 'Depositó el anticipo', 'Contabilidad / Tesorería', '$4,150', 'Realizado', 'verde'], ['09/12/2025 13:00', 'Validó la comprobación', 'Viáticos', 'Comprobado $4,150', 'Realizado', 'verde'], ['12/12/2025 17:00', 'Cerró el folio', 'Contabilidad / Tesorería', 'Finalizado', 'Cerrado', 'verde']] }),
  '00041': DET({ just: 'Reunión de planeación anual con la Dirección Corporativa.', origen: 'HSM Chihuahua', segs: [['Corporativo', '24/06/2026', '25/06/2026', 'Avión', 'hotel', ['Comida'], '07:00']], cadena: [['Dirección de Hospital', 'Fernando Miranda Ruiz', 'Pendiente', '']], gastos: [['Hospedaje', 1800], ['Alimentos', 400], ['Vuelo (referencia)', 1100]],
    hist: [['18/06/2026 09:45', 'Envió la solicitud de viaje a autorización', 'Laura Miranda Torres', 'Corporativo', 'Enviado', 'azul']] }),
  '00029': DET({ pago: { tipo: 'debito', texto: 'Tarjeta de débito · ERP · terminación 8820' }, just: 'Auditoría operativa programada.', origen: 'HSM Chihuahua', segs: [['HSM Mérida', '09/03/2026', '11/03/2026', 'Avión', 'hospital', ['Cena'], '06:30']], cadena: [['Dirección de Hospital', 'Fernando Miranda Ruiz', 'Aprobada', '02/03/2026 09:30']],
    hos: ['Confirmado', 'verde', [['Unidad', 'HSM Mérida · 2 noches']]], vue: ['Emitido', 'verde', [['Ida', 'Chihuahua → Mérida · 09/03/2026'], ['Regreso', 'Mérida → Chihuahua · 11/03/2026']]],
    ant: ['Depositado', 'verde', [['Monto depositado', '$5,640'], ['Fecha de depósito', '04/03/2026']]], com: ['Validada', 'verde', [['Monto comprobado', '$5,640'], ['Saldo', '$0']]],
    cie: ['Cerrado', 'verde', [['Fecha de cierre', '20/03/2026'], ['Estatus final', 'Finalizado'], ['Área', 'Contabilidad / Tesorería']]], gastos: [['Alimentos', 1200], ['Vuelo (referencia)', 4440]],
    hist: [['27/02/2026 10:20', 'Envió la solicitud de viaje a autorización', 'Laura Miranda Torres', 'HSM Mérida', 'Enviado', 'azul'], ['02/03/2026 09:30', 'Aprobó la solicitud de viaje', 'Fernando Miranda Ruiz', 'Aprobada', 'Aprobado', 'verde'], ['04/03/2026 10:00', 'Depositó el anticipo', 'Contabilidad / Tesorería', '$5,640', 'Realizado', 'verde'], ['17/03/2026 12:00', 'Validó la comprobación', 'Viáticos', 'Comprobado $5,640', 'Realizado', 'verde'], ['20/03/2026 17:00', 'Cerró el folio', 'Contabilidad / Tesorería', 'Finalizado', 'Cerrado', 'verde']] }),
  '00040': DET({ pago: { tipo: 'debito', texto: 'Tarjeta de débito · ERP · terminación 5531' }, just: 'Revisión presupuestal del tercer trimestre en Corporativo.', origen: 'Corporativo', segs: [['Corporativo', '22/06/2026', '23/06/2026', 'Camioneta SM', 'hotel', ['Comida', 'Cena']]], cadena: [['Dirección Corporativa', 'Dirección Corporativa', 'Aprobada', '15/06/2026 10:00']],
    hos: ['En gestión', 'azul', [['Hotel', 'Hotel externo · 1 noche · Hotelería Corporativo']]], gastos: [['Hospedaje', 3200], ['Alimentos', 1300], ['Propinas', 400], ['Paquetería y mensajería', 1500]],
    hist: [['12/06/2026 11:00', 'Envió la solicitud de viaje a autorización', 'Ricardo Fuentes Ávila', 'Corporativo', 'Enviado', 'azul'], ['15/06/2026 10:00', 'Aprobó la solicitud de viaje', 'Dirección Corporativa', 'Aprobada', 'Aprobado', 'verde']] }),
  '00027': DET({ pago: { tipo: 'debito', texto: 'Tarjeta de débito · ERP · terminación 5531' }, just: 'Visita de seguimiento al comité operativo del hospital.', origen: 'Corporativo', segs: [['HSM Querétaro', '17/02/2026', '19/02/2026', 'Avión', 'hotel', ['Comida', 'Cena'], '08:00']], cadena: [['Dirección Corporativa', 'Dirección Corporativa', 'Aprobada', '10/02/2026 12:00']],
    hos: ['Confirmado', 'verde', [['Hotel', 'Hotel externo · 2 noches']]], vue: ['Emitido', 'verde', [['Ida', 'CDMX → Querétaro · 17/02/2026'], ['Regreso', 'Querétaro → CDMX · 19/02/2026']]],
    ant: ['Depositado', 'verde', [['Monto depositado', '$9,250']]], com: ['Validada', 'verde', [['Monto comprobado', '$9,250'], ['Saldo', '$0']]],
    cie: ['Cerrado', 'verde', [['Fecha de cierre', '03/03/2026'], ['Estatus final', 'Finalizado'], ['Área', 'Contabilidad / Tesorería']]], gastos: [['Hospedaje', 6400], ['Alimentos', 1300], ['Vuelo (referencia)', 1550]],
    hist: [['08/02/2026 10:15', 'Envió la solicitud de viaje a autorización', 'Ricardo Fuentes Ávila', 'HSM Querétaro', 'Enviado', 'azul'], ['10/02/2026 12:00', 'Aprobó la solicitud de viaje', 'Dirección Corporativa', 'Aprobada', 'Aprobado', 'verde'], ['12/02/2026 09:30', 'Depositó el anticipo', 'Contabilidad / Tesorería', '$9,250', 'Realizado', 'verde'], ['26/02/2026 13:00', 'Validó la comprobación', 'Viáticos', 'Comprobado $9,250', 'Realizado', 'verde'], ['03/03/2026 17:00', 'Cerró el folio', 'Contabilidad / Tesorería', 'Finalizado', 'Cerrado', 'verde']] }),
  '00046': DET({ just: 'Entrega de capacitación al personal administrativo.', origen: 'HSM Chihuahua', segs: [['HSM Chihuahua', '28/09/2026', '02/10/2026', 'Camioneta SM', 'hospital', ['Comida']]], proyecto: 'Apertura de quirófanos', cadena: [['Dirección de Hospital', 'Fernando Miranda Ruiz', 'Pendiente', '']], gastos: [['Alimentos', 1600], ['Hospedaje', 0], ['Estacionamiento', 1200], ['Paquetería y mensajería', 3400], ['Propinas', 600]],
    hist: [['22/09/2026 12:10', 'Envió la solicitud de viaje a autorización', 'María Quintero Ávalos', 'HSM Chihuahua', 'Enviado', 'azul']] }),
  '00034': DET({ just: 'Capacitación en el nuevo sistema de nómina.', origen: 'HSM Chihuahua', segs: [['HSM Veracruz', '13/04/2026', '15/04/2026', 'Avión', 'hospital', ['Cena'], '07:15']], cadena: [['Dirección de Hospital', 'Fernando Miranda Ruiz', 'Rechazada', '08/04/2026 18:20']],
    rechazo: 'La capacitación se imparte en línea; no se requiere viaje', gastos: [['Alimentos', 800], ['Propinas', 380], ['Vuelo (referencia)', 3800]],
    hist: [['06/04/2026 10:20', 'Envió la solicitud de viaje a autorización', 'María Quintero Ávalos', 'HSM Veracruz', 'Enviado', 'azul'], ['08/04/2026 18:20', 'Rechazó la solicitud de viaje', 'Fernando Miranda Ruiz', 'Rechazada · La capacitación se imparte en línea', 'Rechazado', 'rojo']] }),
  '00022': DET({ origen: 'HSM Chihuahua', segs: [['HSM Mérida', '12/01/2026', '16/01/2026', 'Avión', 'hospital', ['Comida', 'Cena'], '06:40']], cadena: [['Dirección de Hospital', 'Fernando Miranda Ruiz', 'Aprobada', '05/01/2026 10:00']],
    hos: ['Confirmado', 'verde', [['Unidad', 'HSM Mérida · 4 noches']]], vue: ['Emitido', 'verde', [['Ida', 'Chihuahua → Mérida · 12/01/2026'], ['Regreso', 'Mérida → Chihuahua · 16/01/2026']]],
    ant: ['Depositado', 'verde', [['Monto depositado', '$8,310']]], com: ['Validada', 'verde', [['Monto comprobado', '$8,310'], ['Saldo', '$0']]],
    cie: ['Cerrado', 'verde', [['Fecha de cierre', '30/01/2026'], ['Estatus final', 'Finalizado'], ['Área', 'Contabilidad / Tesorería']]], gastos: [['Alimentos', 2600], ['Vuelo (referencia)', 5710]],
    hist: [['30/12/2025 09:00', 'Envió la solicitud de viaje a autorización', 'María Quintero Ávalos', 'HSM Mérida', 'Enviado', 'azul'], ['05/01/2026 10:00', 'Aprobó la solicitud de viaje', 'Fernando Miranda Ruiz', 'Aprobada', 'Aprobado', 'verde'], ['07/01/2026 10:00', 'Depositó el anticipo', 'Contabilidad / Tesorería', '$8,310', 'Realizado', 'verde'], ['26/01/2026 12:00', 'Validó la comprobación', 'Viáticos', 'Comprobado $8,310', 'Realizado', 'verde'], ['30/01/2026 17:00', 'Cerró el folio', 'Contabilidad / Tesorería', 'Finalizado', 'Cerrado', 'verde']] })
};

// COMPROBACIÓN POR FOLIO — registro canónico ÚNICO del saldo por comprobar (DATO DEMO, sintético; no es fórmula contable).
// sujeto = monto sujeto a comprobación (anticipo depositado o, sin anticipo, gasto estimado a reembolsar) · comprobado = comprobantes registrados.
// Saldo pendiente por comprobar = sujeto − comprobado (lo calcula el Portal en un solo lugar). demo.parcial = escenario «Comprobación parcial» / «Plazo vencido».
const COMPROBACIONES = {
  '00043': { sujeto: 9090, comprobado: 0, demo: { parcial: 4840 } },
  '00041': { sujeto: 3300, comprobado: 0, demo: { parcial: 1490 } },
  '00040': { sujeto: 6400, comprobado: 0, demo: { parcial: 2150 } },
  '00048': { sujeto: 5200, comprobado: 0, demo: { parcial: 2900 } },
  '00047': { sujeto: 4600, comprobado: 0, demo: { parcial: 2100 } },
  '00035': { sujeto: 6100, comprobado: 0, demo: { parcial: 2600 } },
  '00046': { sujeto: 6800, comprobado: 0, demo: { parcial: 3060 } }
};

// CATÁLOGO CANÓNICO DE PERFILES DE VIAJERO (fuente única, regla 366): exactamente cinco. DGA es rol funcional, nunca perfil.
// «Viajero externo» = categoría del flujo de viajeros externos (no es rol del Portal); sus reglas salen de la matriz de tarifas.
// capacidades = políticas del perfil que otras funciones consultan (p. ej. ¿aplica gastos de representación?) — nunca «if perfil === 'Director'» disperso.
const PERFILES_VIAJERO = [
  { id: 'Director', interno: true, capacidades: { representacion: true } },
  { id: 'Ejecutivo', interno: true, capacidades: { representacion: false } },
  { id: 'Mando medio', interno: true, capacidades: { representacion: false } },
  { id: 'Operativo', interno: true, capacidades: { representacion: false } },
  { id: 'Viajero externo', interno: false, capacidades: { representacion: false } }
];
const perfilCap = (perfil, cap) => { const p = PERFILES_VIAJERO.find(x => x.id === (perfil && perfil.label ? perfil.label : perfil)); return !!(p && p.capacidades[cap]); };
const VIG_MAX = '31/12/9999'; // vigencia máxima admitida; en lecturas se muestra «sin fecha de cierre»
window.SMV_PERFIL = { POLITICA_EXTERNO, PERFILES_VIAJERO, perfilCap, VIG_MAX, TRIP_DETAIL, COMPROBACIONES, TODAY, GLOBAL, PROFILES, AUTO_BY_GROUP, AUTO_BY_AREA, AREA_PERSONAL_NOMBRE, ERP_PERSONAL, ESTRUCTURA_ERP, VIG_LIBRO, CONCEPTOS, TARIFAS, TARIFAS_EXTERNO, TARIFA_CATEGORIAS, TARIFA_HEREDA, TARIFA_VIG, TARIFA_VIG_ESP, TARIFA_NOTAS, TAXI, REGLAS_EXC, EXCEPCIONES, ASSIGN, ERP_EXTRA, TRIPS, INDICADORES, BUDGET, TRANSPORTES };

})(); }
