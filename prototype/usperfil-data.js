if (!window.SMV_PERFIL) { (function(){
// PERFIL DEL VIAJERO — datos mock del modelo único de perfil de viajero (catálogo, tarifas, excepciones,
// asignaciones, viajes y saldo aplicable). DEMO ONLY (datos sintéticos).
// UN SOLO MODELO: el catálogo y las asignaciones de aquí son la fuente del perfil efectivo que consumen
// el Inicio del colaborador, la ficha del colaborador y la resolución de permisos condicionados a perfil.
// El personal (identidad, puesto, datos de personal) sigue llegando de SAP y vive en us26-data.js (solo lectura).
// Vocabulario de perfil aprobado: Director · Ejecutivo · Mando medio · Operativo · DGA (nunca «Nivel n»).

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
  // + CLIENT CLARIFICATION: Lavandería = Tintorería (se conserva el término del Portal). Regla GLOBAL: misma para todos los perfiles, DGA y Viajero externo.
  // Sustituye la regla provisional anterior («viajes continuos de más de 12 días», monto por perfil).
  tintoreria: { label: 'Tintorería', importe: 85, unidad: 'por día', desdeDia: 6, impuesto: 'Incluido', value: '$85 por día a partir del 6.º día del viaje · Impuesto incluido' },
  antelacion: { label: 'Antelación mínima para solicitar', dias: 4, value: '4 días' } // Dias_Ant del alcance (solicitud de viaje). El anticipo conserva su propia antelación de 5 días.
};

// ---------------------------------------------------------------------------
// CATÁLOGO DE PERFILES — rubros, límites, cadena de autorización y vigencia.
// Los rubros provienen del alcance aprobado: anticipo · hospedaje · habitación · alimentos ·
// transporte · límites (semanas/noches/días) · cadena de autorización · gastos de representación.
// La cadena de autorización distingue colaborador de hospital y de corporativo (flujo aprobado).
// ---------------------------------------------------------------------------
// IMÁGENES DE REFERENCIA entregadas por el cliente, asociadas al PERFIL existente (no al colaborador).
// MODOS de transporte permitidos (≠ tarifas: los importes de vuelos, gasolina y casetas son conceptos de tarifa propios).
const TRANSPORTES = ['Avión', 'Camioneta SM', 'Autobús', 'Renta de auto', 'Auto particular', 'Taxi'];
const PROFILES = [
  { id: 'pf-dir', perfil: 'Director', estado: 'Vigente', from: '01/01/2026', to: '31/12/2026',
    semanasMes: 3, nochesSemana: 6, diasMax: 18, diasComprobar: 7,
    anticipo: 'Sí',
    hospedaje: 'Hotel de convenio', habitacion: ['Individual'], alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'Sí, con autorización de DGA y revisión de Contraloría',
    transporte: ['Avión', 'Camioneta SM', 'Renta de auto', 'Auto particular', 'Taxi'],
    cadenaHospital: 'Dirección de Hospital → Dirección Corporativa', cadenaCorporativo: 'Dirección Corporativa → DGA',
    doc: 'Política-de-viaje-2026-Direccion.pdf', colaboradores: 3 },
  { id: 'pf-dga', perfil: 'DGA', estado: 'Vigente', from: '01/01/2026', to: '31/12/2026',
    semanasMes: 4, nochesSemana: 6, diasMax: 20, diasComprobar: 7,
    anticipo: 'No', hospedaje: 'Hotel de convenio', habitacion: ['Individual'], alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'Sí, con revisión de Contraloría',
    transporte: ['Avión', 'Camioneta SM', 'Renta de auto', 'Auto particular', 'Taxi'],
    cadenaHospital: 'No aplica', cadenaCorporativo: 'Aprobación propia al capturar (sin superior)',
    doc: 'Política-de-viaje-2026-DGA.pdf', colaboradores: 1 },
  { id: 'pf-eje', perfil: 'Ejecutivo', estado: 'Vigente', from: '01/01/2026', to: '31/12/2026',
    semanasMes: 3, nochesSemana: 5, diasMax: 15, diasComprobar: 7,
    anticipo: 'Sí', hospedaje: 'Hotel de convenio', habitacion: ['Individual'], alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'No',
    transporte: ['Avión', 'Camioneta SM', 'Autobús', 'Auto particular', 'Taxi'],
    cadenaHospital: 'Dirección de Hospital → Dirección Corporativa', cadenaCorporativo: 'Director inmediato → Dirección Corporativa',
    doc: 'Política-de-viaje-2026-Ejecutivo.pdf', colaboradores: 2 },
  { id: 'pf-mm', perfil: 'Mando medio', estado: 'Vigente', from: '01/01/2026', to: '31/12/2026',
    semanasMes: 2, nochesSemana: 5, diasMax: 12, diasComprobar: 7,
    anticipo: 'Sí', hospedaje: 'Hotel de convenio', habitacion: ['Individual', 'Compartida'], alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'No',
    transporte: ['Avión', 'Camioneta SM', 'Autobús', 'Auto particular', 'Taxi'],
    cadenaHospital: 'Dirección de Hospital → Dirección Corporativa', cadenaCorporativo: 'Director inmediato → Dirección Corporativa',
    doc: 'Política-de-viaje-2026-Mando-medio.pdf', colaboradores: 6 },
  { id: 'pf-op', perfil: 'Operativo', estado: 'Vigente', from: '01/01/2026', to: '31/12/2026',
    semanasMes: 2, nochesSemana: 4, diasMax: 8, diasComprobar: 7,
    anticipo: 'Sí', hospedaje: 'Hotel de convenio', habitacion: ['Compartida'], alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'No',
    transporte: ['Autobús', 'Camioneta SM', 'Auto particular', 'Taxi'],
    cadenaHospital: 'Dirección de Hospital → Dirección Corporativa', cadenaCorporativo: 'Director inmediato → Dirección Corporativa',
    doc: 'Política-de-viaje-2026-Operativo.pdf', colaboradores: 4 },
  // Vigencia futura: demuestra el estado «Futura» («entrará en vigor el…») sin tocar la vigente.
  { id: 'pf-mm-2027', perfil: 'Mando medio', estado: 'Futura', from: '01/01/2027', to: '31/12/2027',
    semanasMes: 2, nochesSemana: 5, diasMax: 12, diasComprobar: 7,
    anticipo: 'Sí', hospedaje: 'Hotel de convenio', habitacion: ['Individual'], alimentos: ['Desayuno', 'Comida', 'Cena'],
    representacion: 'No',
    transporte: ['Avión', 'Camioneta SM', 'Autobús', 'Auto particular', 'Taxi'],
    cadenaHospital: 'Dirección de Hospital → Dirección Corporativa', cadenaCorporativo: 'Director inmediato → Dirección Corporativa',
    doc: 'Política-de-viaje-2027-Mando-medio.pdf', colaboradores: 6 }
];

// PERFIL AUTOMÁTICO propuesto por el grupo de personal de SAP (E/ED → Director, EJ → Ejecutivo,
// MM → Mando medio, OP → Operativo). La tabla oficial del cliente sigue pendiente de confirmación;
// una asignación distinta a esta propuesta se trata como excepción y exige documento.
const AUTO_BY_GROUP = { E: 'Director', ED: 'Director', EJ: 'Ejecutivo', MM: 'Mando medio', OP: 'Operativo' };

// ---------------------------------------------------------------------------
// TARIFAS MÁXIMAS — fuente por concepto (clasificación que debe sobrevivir a futuras sesiones):
//   c1 Hospedaje  · CLIENT CONFIRMED (GREEN WORKBOOK «Hotel autorizadas») + CLARIFICATION: importe POR NOCHE, máximo autorizado.
//   c2 Alimentos  · CLIENT CONFIRMED («Tarifas de alimentos») + CLARIFICATION: TOPES DIARIOS ACUMULADOS por número de comidas (1 · 2 · 3).
//   TAXI          · CLIENT CONFIRMED («Tarifas de taxis»): por HOSPITAL DESTINO y POR SEMANA, igual para todos los perfiles (ya no es tarifa por perfil).
//   Tintorería    · CLIENT CONFIRMED: regla GLOBAL (GLOBAL.tintoreria). Dejó de ser concepto por perfil.
//   c6 Vuelos · c7 Gasolina · c8 Casetas · c4 Anticipo · PROVISIONAL MOCK (el libro no los confirma; se conservan como importes máximos).
// DGA hereda los importes de Director en los conceptos confirmados (CLARIFICATION); rol funcional y perfil siguen separados.
// Impuesto «Incluido» = atributo confirmado de las tarifas del libro (se muestra donde aporta valor).
// ---------------------------------------------------------------------------
const CONCEPTOS = [
  { id: 'c1', label: 'Hospedaje', unidad: 'por noche', duracion: 'noches', fuente: 'confirmada', impuesto: 'Incluido' },
  { id: 'c2', label: 'Alimentos', unidad: 'tope diario por comidas', duracion: 'dias', fuente: 'confirmada', tiers: true, impuesto: 'Incluido' },
  // Conceptos atómicos PROVISIONALES (ids estables c6 vuelos · c7 gasolina · c8 casetas). Base de cálculo NO definida en las fuentes.
  { id: 'c6', label: 'Vuelos', unidad: 'monto máximo', duracion: null, fuente: 'provisional' },
  { id: 'c7', label: 'Gasolina', unidad: 'monto máximo', duracion: null, fuente: 'provisional' },
  { id: 'c8', label: 'Casetas', unidad: 'monto máximo', duracion: null, fuente: 'provisional' },
  { id: 'c4', label: 'Anticipo', unidad: 'monto máximo autorizado', duracion: null, fuente: 'provisional' }
];
// Perfiles que heredan la tarifa de otro perfil en los conceptos CONFIRMADOS (DGA = Director).
const TARIFA_HEREDA = { DGA: { de: 'Director', conceptos: ['c1', 'c2'] } };
// importe null = sin tarifa vigente (se señala en la matriz). c2 = [tope 1 comida, tope 2 comidas, tope 3 comidas] (acumulados, NO se suman).
const TARIFAS = {
  c1: { Director: 2800, Ejecutivo: 2000, 'Mando medio': 1800, Operativo: 1700 },
  c2: { Director: [560, 810, 1055], Ejecutivo: [475, 725, 985], 'Mando medio': [400, 650, 910], Operativo: [250, 420, 635], 'Viajero externo': [400, 650, 910] },
  // PROVISIONAL MOCK (importes reales pendientes del cliente): c6 · c7 · c8 · c4
  c6: { Director: 9000, DGA: 12000, Ejecutivo: 7500, 'Mando medio': 6000, Operativo: 4500 },
  c7: { Director: 2500, DGA: 2500, Ejecutivo: 2000, 'Mando medio': 1800, Operativo: 1500 },
  c8: { Director: 1200, DGA: 1200, Ejecutivo: 1000, 'Mando medio': 900, Operativo: 800 },
  c4: { Director: null, DGA: 24000, Ejecutivo: 18000, 'Mando medio': 12000, Operativo: 8000 }
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
const TARIFA_VIG_ESP = { 'c2|Director': [{ from: '01/06/2026', to: '31/08/2026' }, { from: '01/09/2026', to: '31/12/9999' }] };
// Nota de política del libro (Ejecutivo): se conserva tal cual como contexto confirmado; no se generaliza a otros perfiles.
const TARIFA_NOTAS = { 'c2|Ejecutivo': 'Este perfil toma desayuno y comida en el hospital. En días de traslado puede presentar factura hasta el tope diario; las facturas de días de traslado pueden presentarse en cualquier día del viaje.' };

// TAXI — CLIENT CONFIRMED (GREEN WORKBOOK): tarifa SEMANAL por hospital destino, igual para Niveles 1–5 (todos los perfiles y el viajero externo).
// Hospitales con tarifa específica (idhospital del catálogo canónico): 1101 Morelia · 1113 Querétaro · 1102 Aguascalientes · 1105 San Luis Potosí.
// OPEN CLIENT DECISION: cómo aplica «por semana» a viajes menores a una semana, semanas parciales o de varias semanas → el Portal muestra
// la TARIFA SEMANAL DE REFERENCIA y no calcula ningún total prorrateado.
const TAXI = { label: 'Taxi', unidad: 'por semana', impuesto: 'Incluido',
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
  { id: 'r4', label: 'Noches máximas por semana', kind: 'int', unidad: 'noches', policy: 'nochesSemana' },
  { id: 'r5', label: 'Semanas máximas por mes', kind: 'int', unidad: 'semanas', policy: 'semanasMes' },
  { id: 'r7', label: 'Días máximos por viaje', kind: 'int', unidad: 'días', policy: 'diasMax' }
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
    documento: 'Autorización-DirCorp-2026-004.pdf', by: 'Sofía Delgado Marín', when: '10/09/2026 12:05', revoked: false }
];

// ---------------------------------------------------------------------------
// ASIGNACIONES DE PERFIL por colaborador (histórico + vigente, sin traslapes ni huecos).
// origen: 'automatico' (propuesto por el grupo de personal) | 'libre' (excepción: exige documento).
// Los colaboradores sin asignación quedan «Sin perfil asignado» (bloqueados para viajar).
// ---------------------------------------------------------------------------
const ASSIGN = {
  u01: [{ perfil: 'Mando medio', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por grupo de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' },
        { perfil: 'Operativo', from: '01/01/2025', to: '31/12/2025', origen: 'automatico', motivo: 'Perfil vigente en 2025', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2025 08:40' }],
  u02: [{ perfil: 'Mando medio', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por grupo de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u03: [{ perfil: 'Director', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por grupo de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u04: [{ perfil: 'Director', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por grupo de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u05: [{ perfil: 'Director', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por grupo de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u06: [{ perfil: 'DGA', from: '01/01/2026', to: '', origen: 'libre', motivo: 'Perfil DGA por designación de la Dirección General', documento: 'Autorización-DG-2026-001.pdf', by: 'Sofía Delgado Marín', when: '02/01/2026 09:20' }],
  u07: [{ perfil: 'Mando medio', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por grupo de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u09: [{ perfil: 'Operativo', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por grupo de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u10: [{ perfil: 'Mando medio', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por grupo de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u11: [{ perfil: 'Ejecutivo', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por grupo de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  u12: [{ perfil: 'Mando medio', from: '01/01/2026', to: '', origen: 'automatico', motivo: 'Alta anual del perfil por grupo de personal', documento: '', by: 'Sofía Delgado Marín', when: '02/01/2026 09:12' }],
  // u13 (activa), u08 y u14 (inactivos en el Portal) no tienen asignación vigente → «Sin perfil asignado».
  // La alerta de la pantalla de colaboradores cuenta SOLO a los activos: son los que requieren acción.
  // u13 conserva folios con su perfil congelado, para demostrar que un folio autorizado no pierde sus reglas.
};

// ---------------------------------------------------------------------------
// DATOS DE SAP COMPLEMENTARIOS del encabezado del perfil (solo lectura):
// sociedad · CECO · unidad organizativa · grupoPersonal + areaPersonal (códigos de SAP; ≠ perfil de viajero y ≠ personnelGroup,
// que es la clasificación interna E/ED/EJ/MM/OP usada solo para proponer el perfil) · funcionId + funcionNombre · posicionId (el
// nombre de la posición es el puesto canónico USERS.puesto) — demo, sin catálogo ni regla derivada · datos bancarios enmascarados (visibles solo a roles autorizados).
// sociedad = CÓDIGO de sociedad de SAP (dato de personal simulado; CLIENT CLARIFICATION: viene de SAP, NUNCA se deriva de hospital, rol, perfil
// o CECO). La razón social se resuelve del catálogo confirmado uscat-data.js › SOCIEDADES cuando la pantalla la necesita.
// ---------------------------------------------------------------------------
const SAP_EXTRA = {
  u01: { sociedad: '1100', unidadOrg: 'Estrategias Comerciales', ceco: 'CECO 4102-CO', grupoPersonal: 'A', areaPersonal: 'GR', funcionId: '80000626', funcionNombre: 'Gerencia comercial', posicionId: '70007351', banco: '**** **** **** 4417', clabe: '0141 **** **** **** 27' },
  u02: { sociedad: '1100', unidadOrg: 'Capital Humano HSM Chihuahua', ceco: 'CECO 2210-HSMCH', funcionId: '80000412', funcionNombre: 'Coordinación de Capital Humano', posicionId: '70004120', banco: '**** **** **** 8802', clabe: '0141 **** **** **** 55' },
  u03: { sociedad: '1100', unidadOrg: 'Dirección HSM Chihuahua', ceco: 'CECO 2001-HSMCH', funcionId: '80000201', funcionNombre: 'Dirección de hospital', posicionId: '70002015', banco: '**** **** **** 1190', clabe: '0141 **** **** **** 03' },
  u04: { sociedad: '4100', unidadOrg: 'Dirección Comercial y de Negocios', ceco: 'CECO 4100-CO', funcionId: '80000110', funcionNombre: 'Dirección corporativa', posicionId: '70001102', banco: '**** **** **** 7745', clabe: '0141 **** **** **** 81' },
  u05: { sociedad: '4100', unidadOrg: 'Capital Humano Corporativo', ceco: 'CECO 4300-CO', funcionId: '80000123', funcionNombre: 'Dirección de área corporativa', posicionId: '70001230', banco: '**** **** **** 2036', clabe: '0141 **** **** **** 12' },
  u06: { sociedad: '1100', unidadOrg: 'Dirección General Adjunta', ceco: 'CECO 4000-CO', funcionId: '80000100', funcionNombre: 'Dirección General Adjunta', posicionId: '70001001', banco: '**** **** **** 5521', clabe: '0141 **** **** **** 90' },
  u07: { sociedad: '1100', unidadOrg: 'Hotelería HSM Chihuahua', ceco: 'CECO 2230-HSMCH', funcionId: '80000431', funcionNombre: 'Coordinación de hotelería', posicionId: '70004310', banco: '**** **** **** 6614', clabe: '0141 **** **** **** 44' },
  u08: { sociedad: '4800', unidadOrg: 'Hotelería Corporativa', ceco: 'CECO 4420-CO', funcionId: '80000542', funcionNombre: 'Coordinación de hotelería corporativa', posicionId: '70005420', banco: '**** **** **** 3390', clabe: '0141 **** **** **** 67' },
  u09: { sociedad: '4800', unidadOrg: 'Viáticos', ceco: 'CECO 4210-CO', funcionId: '80000610', funcionNombre: 'Analista de viáticos', posicionId: '70006105', banco: '**** **** **** 7028', clabe: '0141 **** **** **** 31' },
  u10: { sociedad: '4800', unidadOrg: 'Tesorería', ceco: 'CECO 4205-CO', funcionId: '80000621', funcionNombre: 'Coordinación de tesorería', posicionId: '70006210', banco: '**** **** **** 9163', clabe: '0141 **** **** **** 74' },
  u11: { sociedad: '1100', unidadOrg: 'Contraloría Corporativa', ceco: 'CECO 4220-CO', funcionId: '80000632', funcionNombre: 'Contraloría corporativa', posicionId: '70006320', banco: '**** **** **** 4480', clabe: '0141 **** **** **** 19' },
  u12: { sociedad: '4100', unidadOrg: 'Seguridad TI', ceco: 'CECO 4600-CO', funcionId: '80000664', funcionNombre: 'Administración de seguridad', posicionId: '70006640', banco: '**** **** **** 2255', clabe: '0141 **** **** **** 58' },
  u13: { sociedad: '4800', unidadOrg: 'Contabilidad', ceco: 'CECO 4206-CO', funcionId: '80000622', funcionNombre: 'Analista de contabilidad', posicionId: '70006215', banco: '**** **** **** 8817', clabe: '0141 **** **** **** 26' },
  u14: { sociedad: '1100', unidadOrg: 'Hotelería HSM Chihuahua', ceco: 'CECO 2231-HSMCH', funcionId: '80000432', funcionNombre: 'Auxiliar de hotelería', posicionId: '70004318', banco: '**** **** **** 1002', clabe: '0141 **** **** **** 48' }
};

// ---------------------------------------------------------------------------
// VIAJES del colaborador (Mis viajes / ficha): folio, destino, fechas, motivo, monto, estatus, UUID de factura.
// status = clave de window.SMV_US01.STATUS. uuid = folio fiscal de la factura principal del folio.
// ---------------------------------------------------------------------------
const TRIPS = {
  u01: [
    { perfilFolio: 'Mando medio', folio: '00043', destino: 'HSM Chihuahua', fechas: '15/06/2026 – 18/06/2026', motivo: 'Operación', monto: '$9,090', status: 'enProceso', uuid: 'A1B2C3D4-5E6F-4711-8A90-1122334455AA', saldo: 'Anticipo por comprobar $9,090' },
    { perfilFolio: 'Mando medio', folio: '00038', destino: 'HSM Querétaro', fechas: '11/05/2026 – 14/05/2026', motivo: 'Capacitación', monto: '$7,420', status: 'finalizado', uuid: 'B2C3D4E5-6F70-4822-9BA1-2233445566BB', saldo: 'Sin saldo pendiente' },
    { perfilFolio: 'Operativo', folio: '00031', destino: 'HSM Mérida', fechas: '23/03/2026 – 27/03/2026', motivo: 'Operación', monto: '$11,860', status: 'finalizado', uuid: 'C3D4E5F6-7081-4933-ACB2-3344556677CC', saldo: 'Sin saldo pendiente' },
    { perfilFolio: 'Operativo', folio: '00024', destino: 'HSM Veracruz', fechas: '26/01/2026 – 28/01/2026', motivo: 'Reunión comité', monto: '$0', status: 'cancelada', uuid: '—', saldo: 'Presupuesto liberado' },
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

window.SMV_PERFIL = { COMPROBACIONES, TODAY, GLOBAL, PROFILES, AUTO_BY_GROUP, CONCEPTOS, TARIFAS, TARIFAS_EXTERNO, TARIFA_CATEGORIAS, TARIFA_HEREDA, TARIFA_VIG, TARIFA_VIG_ESP, TARIFA_NOTAS, TAXI, REGLAS_EXC, EXCEPCIONES, ASSIGN, SAP_EXTRA, TRIPS, INDICADORES, BUDGET, TRANSPORTES };

})(); }
