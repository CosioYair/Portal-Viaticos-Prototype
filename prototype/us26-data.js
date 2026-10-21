if (!window.SMV_US26) { (function(){
// US-26 mock data: usuarios y permisos + bitácora global. DEMO ONLY (synthetic data).
// SOURCE OF TRUTH: el catálogo de opciones y la visibilidad por defecto NO viven aquí — se derivan de
// window.SMV_US01.MENU (matriz aprobada en US-01). Este archivo solo aporta: catálogo de roles administrables,
// mapa opción→sección, acciones por opción, usuarios administrables con vigencias, overrides y bitácora.
// Vocabulary: «Perfil» (Director · Ejecutivo · Mando medio · Operativo), never «Nivel n». DGA = functional role only.

const TODAY = '15/09/2026'; // fecha de referencia con la que se sembraron los registros mock (el prototipo usa la fecha real del navegador para vigencias y estados)

// 12 roles administrables (sin Nómina). us01 = columna de la matriz aprobada en US-01 que define sus defaults.
// travelerEligible = si el rol admite capacidad de viajero de forma predeterminada. DERIVADO de la configuración
// aprobada en US-01 (us01-data.js › USERS.traveler: COL, CHH, DIR, CHC y DGA la tienen; HH, HC, VIA, CON, CTR y ADM no).
// Un rol sin elegibilidad normal solo obtiene capacidad de viajero mediante excepción documentada.
// homePriority = PRIORIDAD DE INICIO: cuando una persona tiene más de un rol vigente, el Portal muestra el
// Inicio del rol con la prioridad más alta (1 = más alta). Solo decide la pantalla de Inicio: no cambia los
// permisos, no desactiva los demás roles y es independiente de la capacidad de viajero.
// homeVariant = la pantalla de Inicio que corresponde al rol (varios roles podrían compartir variante).
// ORDEN DE DEMOSTRACIÓN: pendiente de confirmación del cliente; se administra desde Roles y permisos.
// Dirección de Hospital y Dirección Corporativa son roles SEPARADOS (ámbito, vigencia y asignación independientes)
// que comparten la misma fila de defaults aprobada en US-01 («DIR»).
const ROLE_CAT = [
  { code: 'COL', us01: 'COL', label: 'Colaborador SM', scope: 'none', travelerEligible: true, homePriority: 12, homeVariant: 'home-colaborador', homeUser: 'u01' },
  { code: 'CHH', us01: 'CHH', label: 'Capital Humano HSM', scope: 'hospital', travelerEligible: true, homePriority: 8, homeVariant: 'home-capital-humano', homeUser: 'u02' },
  { code: 'DIRH', us01: 'DIR', label: 'Dirección de Hospital', scope: 'hospital', travelerEligible: true, homePriority: 4, homeVariant: 'home-direccion-hospital', homeUser: 'u03' },
  { code: 'DIRC', us01: 'DIR', label: 'Dirección Corporativa', scope: 'direccion', travelerEligible: true, homePriority: 3, homeVariant: 'home-direccion-corporativa', homeUser: 'u04' },
  { code: 'CHC', us01: 'CHC', label: 'Capital Humano Corporativo', scope: 'direccion', travelerEligible: true, homePriority: 5, homeVariant: 'home-capital-humano-corporativo', homeUser: 'u05' },
  { code: 'DGA', us01: 'DGA', label: 'DGA', scope: 'consolidado', travelerEligible: true, homePriority: 1, homeVariant: 'home-dga', homeUser: 'u06' },
  { code: 'HH', us01: 'HH', label: 'Hotelería HSM', scope: 'hospital', travelerEligible: false, homePriority: 10, homeVariant: 'home-hoteleria-hsm', homeUser: 'u07' },
  { code: 'HC', us01: 'HC', label: 'Hotelería Corporativo', scope: 'consolidado', travelerEligible: false, homePriority: 9, homeVariant: 'home-hoteleria-corporativo', homeUser: 'u08' },
  { code: 'VIA', us01: 'VIA', label: 'Viáticos', scope: 'consolidado', travelerEligible: false, homePriority: 7, homeVariant: 'home-viaticos', homeUser: 'u09' },
  { code: 'CON', us01: 'CON', label: 'Contabilidad / Tesorería', scope: 'consolidado', travelerEligible: false, homePriority: 6, homeVariant: 'home-contabilidad', homeUser: 'u10' },
  { code: 'CTR', us01: 'CTR', label: 'Contraloría', scope: 'consolidado', travelerEligible: false, homePriority: 2, homeVariant: 'home-contraloria', homeUser: 'u11' },
  { code: 'ADM', us01: 'ADM', label: 'Administrador / Seguridad TI', scope: 'consolidado', travelerEligible: false, homePriority: 11, homeVariant: 'home-admin', homeUser: 'u12' }
];
const SCOPE_LABEL = { none: 'No requiere ámbito', hospital: 'Hospital', direccion: 'Dirección', consolidado: 'Consolidado' };
// NO HAY CATÁLOGO DE ÁMBITO EN us26-data.js A PROPÓSITO.
// Las opciones se DERIVAN en tiempo de ejecución de los datos aprobados en US-01 (us01-data.js › USERS:
// hospital / direccion, y roles[].scope = «Consolidado»). Nunca se inventan hospitales ni direcciones.
// El catálogo organizacional oficial (lista completa de hospitales y direcciones de Star Médica) sigue
// PENDIENTE de definición del cliente.

// Secciones = grupos del menú aprobado en US-01, en el mismo orden.
const SECTIONS = [
  { id: 's1', label: 'Planeación de viaje' },
  { id: 's2', label: 'Perfil del viajero' },
  { id: 's3', label: 'Viajeros externos' },
  { id: 's4', label: 'Presupuesto' },
  { id: 's5', label: 'Autorización' },
  { id: 's6', label: 'Reservaciones' },
  { id: 's7', label: 'Gestión de comprobaciones' },
  { id: 's8', label: 'Contabilización' },
  { id: 's9', label: 'Gestión de encuestas' },
  { id: 's10', label: 'Dashboard y reportes' },
  { id: 's11', label: 'Administración' },
  { id: 's12', label: 'Bitácora' },
  { id: 's13', label: 'Ayuda' }
];
// Opción de menú (us01-data.js › MENU) → sección de permisos. Todo id del menú aprobado debe estar aquí:
// un id sin mapear se EXCLUYE del modelo de permisos (nunca cae en Administración por defecto).
// `inicio`, `cerrar` y las utilidades del shell NO son secciones de permiso: se mapean a null.
const SECTION_OF = {
  inicio: null, cerrar: null,
  creacion: 's1', misviajes: 's1', anticipo: 's1', hospedaje: 's1', vuelo: 's1', comprobacion: 's1', representacion: 's1',
  perfil: 's2', externos: 's3', 'pres-monitor': 's4',
  'aut-viaje': 's5', 'aut-ant': 's5', 'aut-rep': 's5', 'aut-comp': 's5', 'res-hsm': 's6', 'res-hc': 's6', 'res-hotel': 's6', 'ges-comp': 's7',
  'con-plan': 's8', 'con-ant': 's8', 'con-comp': 's8', 'con-rep': 's8', encuestas: 's9',
  dashboard: 's10', reportes: 's10',
  'adm-perfiles': 's11', 'adm-catalogos': 's11', 'adm-politicas': 's11', 'adm-usuarios': 's11', 'adm-bitacora': 's12',
  'ayu-politicas': 's13', 'ayu-guia': 's13', 'ayu-encuesta': 's13'
};
// CATÁLOGO CANÓNICO DE ACCIONES — atómicas y con verbo de negocio explícito.
// NO existen permisos «paraguas»: «Gestionar» y «Administrar» se eliminaron como acciones porque agrupaban
// operaciones concretas. Cada opción del Portal declara SOLO las acciones que realmente ofrece.
const ACTIONS = [
  { code: 'CO', label: 'Consultar' }, { code: 'CR', label: 'Crear' }, { code: 'ED', label: 'Editar' },
  { code: 'EL', label: 'Eliminar' }, { code: 'AU', label: 'Autorizar' },
  // Acciones especializadas que SÍ corresponden a una operación propia del negocio:
  { code: 'VA', label: 'Validar' }, { code: 'CF', label: 'Configurar' },
  // Presupuesto › Monitor: ver Movimientos presupuestales (Carga inicial · Suplemento · Bloqueo). Viáticos no la tiene (cliente 2026-10-13).
  { code: 'MP', label: 'Ver movimientos presupuestales' },
  // Contabilización › Solicitud de anticipo (US-15, cliente 2026-10-19): el pago lo procesa el ERP; PG = confirmar complementos y registrar devoluciones bancarias.
  { code: 'PG', label: 'Complemento y devolución' },
  // Autorización › Aprobación de viaje (cliente 2026-10-15): Viáticos cambia el estatus de una solicitud resuelta (Aprobada ↔ Rechazada) con motivo y bitácora.
  { code: 'CE', label: 'Cambiar estatus' }
];
// Desglose de los antiguos «Gestionar» y «Administrar»:
// · Reservaciones (HSM / hotel y vuelos) → registrar y corregir reservas = Crear + Editar.
// · Gestión de comprobaciones y Contabilidad → revisar y dar por buena la documentación = Validar
//   (verbo del flujo aprobado: revisión de comprobaciones), con Consultar para la consulta.
// · Presupuesto · Monitor (única opción; incluye la antigua Actualización) → Consultar + Editar (cargar archivo, liberación manual, cerrar vigencia) + Ver movimientos presupuestales.
// · Encuestas → publicar y corregir cuestionarios = Crear + Editar.
// · Viajeros externos → alta, corrección y baja del registro = Crear + Editar + Eliminar.
// · Módulos de administración → «Administrar» era configuración del módulo = Configurar
//   (parámetros y vigencias), más Crear y Editar para sus registros. No existe Eliminar: la regla
//   aprobada es que nada con uso histórico se elimina, solo se cierra su vigencia.
const ITEM_ACTIONS = {
  creacion: ['CO', 'CR'], misviajes: ['CO'], anticipo: ['CO', 'CR'], hospedaje: ['CO', 'CR'], vuelo: ['CO', 'CR'], comprobacion: ['CO', 'CR'], representacion: ['CO', 'CR'],
  perfil: ['CO'],
  externos: ['CO', 'CR', 'ED', 'EL'],
  'pres-monitor': ['CO', 'ED', 'MP'],
  'aut-viaje': ['CO', 'AU', 'CE'], 'aut-ant': ['CO', 'AU'], 'aut-rep': ['CO', 'AU'], 'aut-comp': ['CO', 'AU'],
  'res-hsm': ['CO', 'CR', 'ED'], 'res-hc': ['CO', 'CR', 'ED'], 'res-hotel': ['CO', 'CR', 'ED'], 'ges-comp': ['CO', 'VA'],
  'con-plan': ['CO', 'VA'], 'con-ant': ['CO', 'VA', 'PG'], 'con-comp': ['CO', 'VA'], 'con-rep': ['CO', 'VA'], encuestas: ['CO', 'CR', 'ED'],
  dashboard: ['CO'], reportes: ['CO'], 'adm-bitacora': ['CO'],
  'adm-perfiles': ['CO', 'CR', 'ED', 'CF'], 'adm-catalogos': ['CO', 'CR', 'ED', 'CF'], 'adm-politicas': ['CO', 'CR', 'ED', 'CF'], 'adm-usuarios': ['CO', 'CR', 'ED', 'CF'],
  'ayu-politicas': ['CO'], 'ayu-guia': ['CO'], 'ayu-encuesta': ['CO', 'CR']
};

// Usuarios administrables. Los internos llegan del ERP: identidad y datos de personal (`erpInfo`) son SOLO LECTURA
// y no se crean aquí. Lo que el Portal configura: perfil, rol(es) con ámbito y vigencia, capacidad de viajero
// (`travelerCap`) y ajustes manuales de permiso. La capacidad de viajero NO se deriva del ERP.
// roles[].from/to = VIGENCIA OBLIGATORIA de la asignación (ninguna asignación manual es indefinida).
const USERS = [
  { id: 'u01', name: 'Elizabeth Sánchez Gómez', employeeNumber: '12851', puesto: 'Gerente de Estrategias Comerciales', perfil: 'Mando medio', personnelGroup: 'MM', representacion: false, estado: 'Activo',
    roles: [{ code: 'COL', from: '01/01/2026', to: '31/12/2026' }], folios: 2,
    travelerCap: true, erpInfo: { grupo: 'MM', area: 'Dirección Comercial y de Negocios', funcion: 'Gerencia comercial' }, overrides: [] },
  { id: 'u02', name: 'Laura Miranda Torres', employeeNumber: '102477', puesto: 'Coordinadora de Capital Humano', perfil: 'Mando medio', personnelGroup: 'MM', representacion: false, estado: 'Activo',
    roles: [{ code: 'CHH', scope: 'HSM Chihuahua', from: '01/01/2026', to: '31/12/2026' }, { code: 'COL', from: '01/01/2026', to: '31/12/2026' }], folios: 4,
    travelerCap: true, erpInfo: { grupo: 'MM', area: 'Dirección de Capital Humano', funcion: 'Coordinación de Capital Humano' },
    overrides: [{ id: 'o1', option: 'pres-monitor', section: 's4', action: 'CO', sense: 'agregar', from: '02/09/2026', to: '31/12/2026', motivo: 'Da seguimiento al presupuesto de viaje de su hospital', by: 'Sofía Delgado Marín', when: '02/09/2026 11:20', revoked: false }] },
  { id: 'u03', name: 'Ricardo Fuentes Ávila', employeeNumber: '102614', puesto: 'Director de Hospital', perfil: 'Director', personnelGroup: 'EJ', representacion: false, estado: 'Activo',
    roles: [{ code: 'DIRH', scope: 'HSM Chihuahua', from: '01/01/2026', to: '31/12/2026' }], folios: 6,
    travelerCap: true, erpInfo: { grupo: 'EJ', area: 'Dirección de Operación Hospitalaria', funcion: 'Dirección de hospital' }, overrides: [] },
  { id: 'u04', name: 'Mónica Herrera Luna', employeeNumber: '102751', puesto: 'Directora Comercial y de Negocios', perfil: 'Director', personnelGroup: 'ED', representacion: true, estado: 'Activo',
    roles: [{ code: 'DIRC', scope: 'Dirección Comercial y de Negocios', from: '01/01/2026', to: '31/12/2026' }], folios: 3,
    travelerCap: true, erpInfo: { grupo: 'ED', area: 'Dirección Comercial y de Negocios', funcion: 'Dirección corporativa' }, overrides: [] },
  { id: 'u05', name: 'Alfredo Cacho', employeeNumber: '102888', puesto: 'Director de Capital Humano Corporativo', perfil: 'Director', personnelGroup: 'EJ', representacion: true, estado: 'Activo',
    roles: [{ code: 'CHC', scope: 'Dirección de Capital Humano', from: '01/01/2026', to: '31/12/2026' }], folios: 5,
    travelerCap: true, erpInfo: { grupo: 'EJ', area: 'Dirección de Capital Humano', funcion: 'Dirección de área corporativa' },
    overrides: [{ id: 'o2', option: 'ges-comp', section: 's7', action: 'CO', sense: 'agregar', from: '05/09/2026', to: '30/11/2026', motivo: 'Revisión temporal de comprobaciones escaladas por política', by: 'Sofía Delgado Marín', when: '05/09/2026 16:05', revoked: false }] },
  { id: 'u06', name: 'Pedro Medina', employeeNumber: '103025', puesto: 'Director General Adjunto', perfil: 'Director', personnelGroup: 'ED', representacion: true, estado: 'Activo',
    roles: [{ code: 'DGA', scope: 'Consolidado', from: '01/01/2026', to: '31/12/2026' }], folios: 2,
    travelerCap: true, erpInfo: { grupo: 'ED', area: 'Corporativo', funcion: 'Dirección General Adjunta' }, overrides: [] },
  { id: 'u07', name: 'Andrés Palma Cordero', employeeNumber: '103162', puesto: 'Coordinador de Hotelería', perfil: 'Mando medio', personnelGroup: 'MM', representacion: false, estado: 'Activo',
    roles: [{ code: 'HH', scope: 'HSM Chihuahua', from: '01/01/2026', to: '31/12/2026' }], folios: 0,
    travelerCap: true, erpInfo: { grupo: 'MM', area: 'Dirección de Operación Hospitalaria', funcion: 'Coordinación de hotelería' },
    travelerException: { grants: true, revoked: false, motivo: 'Participa en la apertura de una nueva unidad hospitalaria durante 2026', documento: 'Autorización-DGA-2026-014.pdf', from: '08/09/2026', to: '31/12/2026', by: 'Sofía Delgado Marín', when: '08/09/2026 10:02' }, overrides: [] },
  { id: 'u08', name: 'Verónica Ibarra Cano', employeeNumber: '103299', puesto: 'Coordinadora de Hotelería Corporativa', perfil: 'Mando medio', personnelGroup: 'MM', representacion: false, estado: 'Inactivo',
    roles: [{ code: 'HC', scope: 'Consolidado', from: '01/01/2026', to: '31/12/2026' }], folios: 0, inactiveReason: 'Incapacidad médica registrada en el ERP',
    travelerCap: false, erpInfo: { grupo: 'MM', area: 'Corporativo', funcion: 'Coordinación de hotelería corporativa' },
    overrides: [{ id: 'o3', option: 'reportes', section: 's10', action: 'CO', sense: 'agregar', from: '01/07/2026', to: '31/08/2026', motivo: 'Cierre de encuestas del trimestre', by: 'Sofía Delgado Marín', when: '01/07/2026 09:40', revoked: false }] },
  { id: 'u09', name: 'Daniel Osorio Peña', employeeNumber: '103436', puesto: 'Analista de Viáticos', perfil: 'Operativo', personnelGroup: 'OP', representacion: false, estado: 'Activo',
    roles: [{ code: 'VIA', scope: 'Consolidado', from: '01/01/2026', to: '31/12/2026' }], folios: 11,
    travelerCap: false, erpInfo: { grupo: 'OP', area: 'Corporativo', funcion: 'Analista de viáticos' }, overrides: [] },
  { id: 'u10', name: 'Claudia Reyna Ortega', employeeNumber: '103573', puesto: 'Coordinadora de Tesorería', perfil: 'Mando medio', personnelGroup: 'MM', representacion: false, estado: 'Activo',
    roles: [{ code: 'CON', scope: 'Consolidado', from: '01/01/2026', to: '31/12/2026' }], folios: 7,
    travelerCap: false, erpInfo: { grupo: 'MM', area: 'Corporativo', funcion: 'Coordinación de tesorería' },
    travelerException: { grants: true, revoked: false, motivo: 'Cierre contable presencial en HSM Chihuahua', documento: 'Autorización-DGA-2026-009.pdf', from: '01/06/2026', to: '31/07/2026', by: 'Sofía Delgado Marín', when: '02/06/2026 09:15' }, overrides: [] },
  { id: 'u11', name: 'Ma. Elena', employeeNumber: '103710', puesto: 'Contralora Corporativa', perfil: 'Ejecutivo', personnelGroup: 'EJ', representacion: false, estado: 'Activo',
    roles: [{ code: 'CTR', scope: 'Consolidado', from: '01/01/2026', to: '31/12/2026' }], folios: 1,
    travelerCap: false, erpInfo: { grupo: 'EJ', area: 'Corporativo', funcion: 'Contraloría corporativa' }, overrides: [] },
  { id: 'u12', name: 'Sofía Delgado Marín', employeeNumber: '103847', puesto: 'Administradora de Seguridad TI', perfil: 'Mando medio', personnelGroup: 'MM', representacion: false, estado: 'Activo',
    roles: [{ code: 'ADM', scope: 'Consolidado', from: '01/01/2026', to: '31/12/2026' }], folios: 0,
    travelerCap: false, erpInfo: { grupo: 'MM', area: 'Tecnologías de la Información', funcion: 'Administración de seguridad' },
    overrides: [{ id: 'o4', option: 'pres-monitor', section: 's4', action: 'CO', sense: 'agregar', from: '01/09/2026', to: '31/12/2026', motivo: 'Soporte al Monitor de presupuesto durante la migración', by: 'Sofía Delgado Marín', when: '01/09/2026 08:15', revoked: false }] },
  { id: 'u13', name: 'María Quintero Ávalos', employeeNumber: '103984', puesto: 'Analista de Contabilidad', perfil: 'Operativo', personnelGroup: 'OP', representacion: false, estado: 'Activo',
    roles: [{ code: 'CON', scope: 'Consolidado', from: '01/01/2026', to: '31/12/2026' }, { code: 'COL', from: '01/03/2026', to: '31/12/2026' }], folios: 3,
    travelerCap: true, erpInfo: { grupo: 'OP', area: 'Corporativo', funcion: 'Analista de contabilidad' }, overrides: [] },
  { id: 'u14', name: 'Rubén Gálvez Mora', employeeNumber: '104021', puesto: 'Auxiliar de Hotelería', perfil: 'Operativo', personnelGroup: 'OP', representacion: false, estado: 'Inactivo',
    roles: [{ code: 'HH', scope: 'HSM Chihuahua', from: '01/01/2026', to: '29/08/2026' }], folios: 0, bajaDate: '29/08/2026', bajaNote: 'Folios reasignados a Andrés Palma Cordero antes de la desactivación',
    travelerCap: false, erpInfo: { grupo: 'OP', area: 'Dirección de Operación Hospitalaria', funcion: 'Auxiliar de hotelería' }, overrides: [] }
];

// Segregación de funciones: FUERA DEL ALCANCE del prototipo (decisión del cliente 2026-09-25). Sin pares incompatibles ni validación.

// Bitácora global (inmutable). origen = Web · APP (extensión aprobada de US-26). area = sección del portal.
const EVENT_TYPES = ['Autorización', 'Rechazo', 'Creación', 'Modificación', 'Cancelación', 'Excepción', 'Presupuesto', 'Catálogos y tarifas', 'Permisos', 'Dato sensible', 'IT0014'];
const EVENTS = [
  { id: 'e01', when: '12/09/2026 16:42', origen: 'Web', folio: '00045', user: 'Mónica Herrera Luna', role: 'DIRC', area: 'Autorización', perfil: 'Director', type: 'Autorización', accion: 'Aprobó la solicitud de viaje', resultado: { tone: 'verde', text: 'Aprobado' }, field: 'Estatus de la solicitud', before: 'Pendiente autorización', after: 'Aprobada', days: 1.2 },
  { id: 'e02', when: '12/09/2026 15:58', origen: 'APP', folio: '00045', user: 'Elizabeth Sánchez Gómez', role: 'COL', area: 'Planeación de viaje', perfil: 'Mando medio', type: 'Creación', accion: 'Creó la solicitud de viaje', resultado: { tone: 'gris', text: 'Registrado' }, field: 'Solicitud', before: '—', after: 'Folio 00045 · HSM Chihuahua · 15–18 jun 2026' },
  { id: 'e03', when: '12/09/2026 14:07', origen: 'Web', folio: '00041', user: 'Daniel Osorio Peña', role: 'VIA', area: 'Reservaciones', perfil: 'Operativo', type: 'Dato sensible', accion: 'Consultó la fecha de nacimiento para emisión de vuelo', resultado: { tone: 'azul', text: 'Consulta registrada' }, field: 'Dato sensible consultado', before: 'Sin consulta previa', after: 'Fecha de nacimiento · viajero 12851' },
  { id: 'e04', when: '12/09/2026 11:31', origen: 'Web', folio: '—', user: 'Sofía Delgado Marín', role: 'ADM', area: 'Administración', perfil: 'Mando medio', type: 'Permisos', accion: 'Agregó un ajuste manual de permiso a Laura Miranda Torres', resultado: { tone: 'verde', text: 'Aplicado' }, field: 'Dashboard y reportes · Gestionar', before: 'Sin permiso (default del rol)', after: 'Permitido por ajuste manual · vigencia 02/09/2026 – 31/12/2026' },
  { id: 'e05', when: '11/09/2026 18:12', origen: 'Web', folio: '—', user: 'Claudia Reyna Ortega', role: 'CON', area: 'Catálogos y tarifas', perfil: 'Mando medio', type: 'Catálogos y tarifas', accion: 'Modificó la tarifa de hospedaje de Mando medio', resultado: { tone: 'verde', text: 'Aplicado' }, field: 'Tarifa hospedaje · Mando medio', before: '$1,850.00 MXN', after: '$1,950.00 MXN' },
  { id: 'e06', when: '11/09/2026 17:45', origen: 'Web', folio: '—', user: 'Claudia Reyna Ortega', role: 'CON', area: 'Catálogos y tarifas', perfil: 'Mando medio', type: 'Catálogos y tarifas', accion: 'Modificó la tarifa de alimentos de Operativo', resultado: { tone: 'verde', text: 'Aplicado' }, field: 'Tarifa alimentos · Operativo', before: '$420.00 MXN', after: '$460.00 MXN' },
  { id: 'e07', when: '11/09/2026 12:20', origen: 'Web', folio: '00038', user: 'Alfredo Cacho', role: 'CHC', area: 'Autorización', perfil: 'Director', type: 'Excepción', accion: 'Aprobó una excepción por excedente de política', resultado: { tone: 'verde', text: 'Excepción aprobada' }, field: 'Excepción de política', before: 'Excedente 18% sobre tarifa autorizada', after: 'Excepción aprobada · motivo: negociación con proveedor único', days: 2.4 },
  { id: 'e08', when: '10/09/2026 19:02', origen: 'Web', folio: '00036', user: 'Ricardo Fuentes Ávila', role: 'DIRH', area: 'Autorización', perfil: 'Director', type: 'Autorización', accion: 'Aprobó la solicitud de viaje', resultado: { tone: 'verde', text: 'Aprobado' }, field: 'Estatus de la solicitud', before: 'Pendiente autorización', after: 'Aprobada', days: 4.6 },
  { id: 'e09', when: '10/09/2026 13:36', origen: 'Web', folio: '00034', user: 'Pedro Medina', role: 'DGA', area: 'Autorización', perfil: 'Director', type: 'Rechazo', accion: 'Rechazó el gasto de representación con motivo', resultado: { tone: 'rojo', text: 'Rechazado' }, field: 'Estatus del gasto de representación', before: 'Pendiente autorización', after: 'Rechazado · motivo: sin lista de asistentes', days: 3.8 },
  { id: 'e10', when: '10/09/2026 09:14', origen: 'APP', folio: '00033', user: 'Elizabeth Sánchez Gómez', role: 'COL', area: 'Comprobaciones', perfil: 'Mando medio', type: 'Modificación', accion: 'Sustituyó un comprobante de la comprobación', resultado: { tone: 'gris', text: 'Registrado' }, field: 'Comprobante línea 3', before: 'Ticket ilegible (2.1 MB)', after: 'CFDI A-8841 (312 KB)' },
  { id: 'e11', when: '09/09/2026 17:50', origen: 'Web', folio: '00031', user: 'Claudia Reyna Ortega', role: 'CON', area: 'Contabilización', perfil: 'Mando medio', type: 'IT0014', accion: 'Emitió el archivo IT0014 de descuento', resultado: { tone: 'verde', text: 'Emitido' }, field: 'IT0014', before: 'Sin archivo', after: 'IT0014-2026-09-09 · 3 registros · $6,420.00 MXN' },
  { id: 'e12', when: '09/09/2026 15:11', origen: 'Web', folio: '—', user: 'Claudia Reyna Ortega', role: 'CON', area: 'Presupuesto', perfil: 'Mando medio', type: 'Presupuesto', accion: 'Liberó presupuesto comprometido de un folio cancelado', resultado: { tone: 'verde', text: 'Liberado' }, field: 'PRE comprometido · Dirección Comercial y de Negocios', before: '$412,000.00 MXN', after: '$396,500.00 MXN' },
  { id: 'e13', when: '09/09/2026 10:26', origen: 'Web', folio: '00029', user: 'Laura Miranda Torres', role: 'CHH', area: 'Viajeros externos', perfil: 'Mando medio', type: 'Creación', accion: 'Registró a un viajero externo', resultado: { tone: 'gris', text: 'Registrado' }, field: 'Viajero externo', before: '—', after: 'Médico invitado · HSM Chihuahua · vigencia 31/12/2026' },
  { id: 'e14', when: '08/09/2026 16:33', origen: 'Web', folio: '—', user: 'Sofía Delgado Marín', role: 'ADM', area: 'Administración', perfil: 'Mando medio', type: 'Excepción', accion: 'Documentó una excepción de capacidad de viajero', resultado: { tone: 'verde', text: 'Excepción registrada' }, field: 'Capacidad de viajero · Andrés Palma Cordero', before: 'No puede viajar · el rol no lo permite de forma predeterminada', after: 'Puede viajar · por excepción documentada 08/09/2026 – 31/12/2026 · Autorización-DGA-2026-014.pdf' },
  { id: 'e15', when: '08/09/2026 11:08', origen: 'Web', folio: '00027', user: 'Mónica Herrera Luna', role: 'DIRC', area: 'Planeación de viaje', perfil: 'Director', type: 'Cancelación', accion: 'Canceló la solicitud de viaje', resultado: { tone: 'oscuro', text: 'Cancelado' }, field: 'Estatus de la solicitud', before: 'Aprobada', after: 'Cancelada · motivo: se reprograma el congreso' },
  { id: 'e16', when: '07/09/2026 18:44', origen: 'Web', folio: '—', user: 'Sofía Delgado Marín', role: 'ADM', area: 'Administración', perfil: 'Mando medio', type: 'Permisos', accion: 'Restauró el default de permisos de Verónica Ibarra Cano', resultado: { tone: 'gris', text: 'Default restaurado' }, field: 'Dashboard y reportes · Gestionar', before: 'Permitido por ajuste manual', after: 'Sin permiso (default del rol) · ajuste revocado' },
  { id: 'e17', when: '07/09/2026 09:57', origen: 'Web', folio: '00024', user: 'Daniel Osorio Peña', role: 'VIA', area: 'Reservaciones', perfil: 'Operativo', type: 'Modificación', accion: 'Asignó hotel externo y cambió la tarifa negociada', resultado: { tone: 'verde', text: 'Asignado' }, field: 'Hotel y tarifa', before: 'Sin asignar', after: 'Hotel Centro Histórico · $1,780.00 MXN por noche' },
  { id: 'e18', when: '06/09/2026 12:15', origen: 'APP', folio: '00022', user: 'Ricardo Fuentes Ávila', role: 'DIRH', area: 'Autorización', perfil: 'Director', type: 'Autorización', accion: 'Aprobó la solicitud de anticipo', resultado: { tone: 'verde', text: 'Aprobado' }, field: 'Estatus del anticipo', before: 'Pendiente autorización', after: 'Aprobado · $12,400.00 MXN', days: 5.3 },
  { id: 'e19', when: '05/09/2026 16:05', origen: 'Web', folio: '—', user: 'Sofía Delgado Marín', role: 'ADM', area: 'Administración', perfil: 'Mando medio', type: 'Permisos', accion: 'Agregó un ajuste manual de permiso a Alfredo Cacho', resultado: { tone: 'verde', text: 'Aplicado' }, field: 'Gestión de comprobaciones · Consultar', before: 'Sin permiso (default del rol)', after: 'Permitido por ajuste manual · vigencia 05/09/2026 – 30/11/2026' },
  { id: 'e20', when: '05/09/2026 10:41', origen: 'Web', folio: '00019', user: 'Ma. Elena', role: 'CTR', area: 'Autorización', perfil: 'Ejecutivo', type: 'Autorización', accion: 'Autorizó el gasto de representación posterior a DGA', resultado: { tone: 'verde', text: 'Aprobado' }, field: 'Estatus del gasto de representación', before: 'Pendiente autorización', after: 'Aprobado', days: 0.6 }
];

// Vistas predefinidas. scope: '*' = todo rol con acceso a Bitácora; arreglo = solo esos roles funcionales (US-01).
const VIEWS = [
  { id: 'v0', label: 'Todos los eventos', desc: 'Toda la actividad registrada en el rango de fechas.', kind: 'events', scope: '*' },
  { id: 'v1', label: '¿Qué excepciones se aprobaron?', desc: 'Excepciones de política, presupuesto y elegibilidad aprobadas en el rango.', kind: 'events', type: 'Excepción', scope: '*' },
  { id: 'v2', label: '¿Quién cambió tarifas?', desc: 'Cambios de catálogos y tarifas con valor anterior y nuevo.', kind: 'events', type: 'Catálogos y tarifas', scope: '*' },
  { id: 'v3', label: '¿Qué autorizaciones tardaron más de 3 días?', desc: 'Autorizaciones y rechazos con más de 3 días entre la solicitud y la decisión.', kind: 'events', slow: 3, scope: '*' },
  { id: 'v4', label: 'Accesos a datos sensibles', desc: 'Consultas a datos sensibles, por ejemplo la fecha de nacimiento para emitir un vuelo.', kind: 'events', type: 'Dato sensible', scope: ['ADM', 'CTR'] },
  { id: 'v5', label: 'Tiempos de proceso por etapa', desc: 'Duración promedio y máxima de cada etapa del folio en el rango consultado.', kind: 'stages', scope: '*' }
];
const STAGE_TIMES = [
  { etapa: 'Aprobación de viaje', casos: 128, promedio: '1.8 días', maximo: '6.4 días', fuera: '7 folios' },
  { etapa: 'Anticipo', casos: 94, promedio: '2.3 días', maximo: '8.1 días', fuera: '11 folios' },
  { etapa: 'Comprobación', casos: 87, promedio: '4.6 días', maximo: '14.2 días', fuera: '19 folios' },
  { etapa: 'Cierre', casos: 81, promedio: '1.2 días', maximo: '3.9 días', fuera: '2 folios' }
];

// Alta/actualización de personal interno que llega del ERP (mock del feed). Solo datos propiedad del ERP:
// nunca roles, perfil, ámbito ni capacidad de viajero — esos se configuran en el Portal.
const ERP_FEED = {
  updates: [
    { id: 'u09', puesto: 'Especialista de Viáticos' },
    { id: 'u02', erpInfo: { grupo: 'MM', area: 'Dirección de Capital Humano', funcion: 'Jefatura de Capital Humano' } }
  ],
  nuevos: [
    { id: 'u15', name: 'Alejandra Bustos Rivas', employeeNumber: '104168', puesto: 'Analista de Presupuesto', personnelGroup: 'OP', estado: 'Activo',
      erpInfo: { grupo: 'OP', area: 'Corporativo', funcion: 'Analista de presupuesto' } },
    { id: 'u16', name: 'Tomás Escalante Vidal', employeeNumber: '104205', puesto: 'Jefe de Mantenimiento', personnelGroup: 'MM', estado: 'Activo',
      erpInfo: { grupo: 'MM', area: 'Dirección de Operación Hospitalaria', funcion: 'Jefatura de mantenimiento' } }
  ]
};

// REGISTRO CANÓNICO DE PERSONAS: la identidad (nombre, número de colaborador, puesto, grupo de personal y
// Hospital / Corporativo) proviene de un solo registro compartido; aquí solo se guarda la configuración
// del Portal (perfil, roles, vigencias, ajustes, estado). Hospital / Corporativo es dato del ERP: solo lectura.
(function syncPeople(){
  const base = (window.SMV_US01 && window.SMV_US01.USERS) || [];
  const extra = { u13: 'Corporativo', u14: 'HSM Chihuahua' };
  USERS.forEach(u => {
    const b = base.find(x => x.id === u.id);
    if (b) { u.name = b.name; u.employeeNumber = b.employeeNumber; u.puesto = b.puesto; u.personnelGroup = b.personnelGroup; u.hospitalCorp = b.hospital || 'Corporativo'; }
    else u.hospitalCorp = extra[u.id] || 'Corporativo';
  });
  (ERP_FEED && ERP_FEED.nuevos ? ERP_FEED.nuevos : []).forEach(n => { n.hospitalCorp = n.hospitalCorp || ((n.erpInfo && /HSM/.test(n.erpInfo.area)) ? n.erpInfo.area : 'Corporativo'); });
})();

window.SMV_US26 = { TODAY, ROLE_CAT, SCOPE_LABEL, SECTIONS, SECTION_OF, ACTIONS, ITEM_ACTIONS, USERS, EVENTS, EVENT_TYPES, VIEWS, STAGE_TIMES, ERP_FEED };
})(); }
