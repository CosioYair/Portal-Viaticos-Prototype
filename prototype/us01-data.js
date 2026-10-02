if (!window.SMV_US01) { (function(){
// US-01 mock data: users, menu catalog, visibility matrix, per-role Inicio. Demo only.
const ROLES = {
  COL: 'Colaborador', CHH: 'Capital Humano HSM', DIR: 'Dirección', CHC: 'Capital Humano Corporativo', DGA: 'DGA',
  HH: 'Hotelería HSM', HC: 'Hotelería Corporativo', VIA: 'Viáticos', CON: 'Contabilidad / Tesorería', CTR: 'Contraloría', ADM: 'Admin / Seguridad TI'
};
const ROLE_KIND = { COL: 'colaborador', CHH: 'gestor', DIR: 'autorizador', CHC: 'autorizador', DGA: 'autorizador', HH: 'gestor', HC: 'gestor', VIA: 'gestor', CON: 'gestor', CTR: 'autorizador', ADM: 'administrador' };

// hospital = Hospital / Corporativo: afiliación organizacional del colaborador que llega de SAP (solo personal hospitalario;
// el personal corporativo no tiene valor → se muestra «Corporativo» y el panel de cuenta omite el campo).
// El nombre de un rol funcional NO determina esta afiliación: Capital Humano es corporativo (aclaración del cliente).
// perfil.label = client-approved vocabulary: Director · Ejecutivo · Mando medio · Operativo · DGA (never «Nivel n»).
// personnelGroup = SAP personnel group of the collaborator (mock): E / ED = executive-director groups, EJ = executive, MM = mandos medios, OP = operativo.
// ANTICIPO RULE (client, final: «Solo a Director grupo E ED»): Anticipo does NOT apply when perfil is exactly Director AND personnelGroup is E or ED. DGA is a distinct profile and does NOT inherit this rule.
// perfil.anticipo is DERIVED below by anticipoApplies(); never hardcode it per user.
const NO_ANTICIPO_GROUPS = ['E', 'ED'];
const anticipoApplies = (u) => !(u.perfil && u.perfil.label === 'Director' && NO_ANTICIPO_GROUPS.includes(u.personnelGroup));
const USERS = [
  { id: 'u01', name: 'Elizabeth Sánchez Gómez', employeeNumber: '12851', role: 'COL', roleLabel: 'Colaborador', direccion: 'Dirección Comercial y de Negocios', puesto: 'Gerente de Estrategias Comerciales', personnelGroup: 'MM', traveler: true, perfil: { label: 'Mando medio', representacion: false }, photo: 'assets/users/elizabeth-sanches-gomes.jpg' }, // photo = fotografía canónica ACTIVA de u01 (entregada por el cliente 2026-09-24). La anterior, assets/users/demo-profile-user.jpg, sigue en el catálogo de recursos (usvisual-img.js) para otro usuario demo.
  { id: 'u02', name: 'Laura Miranda Torres', employeeNumber: '102477', role: 'CHH', roleLabel: 'Capital Humano HSM', direccion: 'Dirección de Capital Humano', puesto: 'Coordinadora de Capital Humano', personnelGroup: 'MM', traveler: true, perfil: { label: 'Mando medio', representacion: false } },
  { id: 'u03', name: 'Ricardo Fuentes Ávila', employeeNumber: '102614', role: 'DIR', roleLabel: 'Dirección de Hospital', direccion: 'Dirección de Operación Hospitalaria', hospital: 'HSM Chihuahua', puesto: 'Director de Hospital', personnelGroup: 'EJ', traveler: true, perfil: { label: 'Director', representacion: false } }, // Director with group EJ → Anticipo applies
  { id: 'u04', name: 'Mónica Herrera Luna', employeeNumber: '102751', role: 'DIR', roleLabel: 'Dirección Corporativa', direccion: 'Dirección Comercial y de Negocios', puesto: 'Directora Comercial y de Negocios', personnelGroup: 'ED', traveler: true, perfil: { label: 'Director', representacion: true } }, // Director with group ED → Anticipo = No aplica
  { id: 'u05', name: 'Alfredo Cacho', employeeNumber: '102888', role: 'CHC', roleLabel: 'Capital Humano Corporativo', direccion: 'Dirección de Capital Humano', puesto: 'Director de Capital Humano Corporativo', personnelGroup: 'EJ', traveler: true, perfil: { label: 'Director', representacion: true } }, // V2: CH CO is also a traveler in the demo; group EJ → Anticipo applies
  { id: 'u06', name: 'Pedro Medina', employeeNumber: '103025', role: 'DGA', roleLabel: 'Dirección General Adjunta', direccion: 'Corporativo', puesto: 'Director General Adjunto', personnelGroup: 'ED', traveler: true, perfil: { label: 'DGA', representacion: true } }, // unique DGA profile: Anticipo applies (the Director E/ED rule does not cover DGA)
  { id: 'u07', name: 'Andrés Palma Cordero', employeeNumber: '103162', role: 'HH', roleLabel: 'Hotelería HSM', direccion: 'Dirección de Operación Hospitalaria', hospital: 'HSM Chihuahua', puesto: 'Coordinador de Hotelería', personnelGroup: 'MM', traveler: false },
  { id: 'u08', name: 'Verónica Ibarra Cano', employeeNumber: '103299', role: 'HC', roleLabel: 'Hotelería Corporativo', direccion: 'Corporativo', puesto: 'Coordinadora de Hotelería Corporativa', personnelGroup: 'MM', traveler: false },
  { id: 'u09', name: 'Daniel Osorio Peña', employeeNumber: '103436', role: 'VIA', roleLabel: 'Viáticos', direccion: 'Corporativo', puesto: 'Analista de Viáticos', personnelGroup: 'OP', traveler: false },
  { id: 'u10', name: 'Claudia Reyna Ortega', employeeNumber: '103573', role: 'CON', roleLabel: 'Contabilidad / Tesorería', direccion: 'Corporativo', puesto: 'Coordinadora de Tesorería', personnelGroup: 'MM', traveler: false },
  { id: 'u11', name: 'Ma. Elena', employeeNumber: '103710', role: 'CTR', roleLabel: 'Contraloría', direccion: 'Corporativo', puesto: 'Contralora Corporativa', personnelGroup: 'EJ', traveler: false },
  { id: 'u12', name: 'Sofía Delgado Marín', employeeNumber: '103847', role: 'ADM', roleLabel: 'Admin / Seguridad TI', direccion: 'Tecnologías de la Información', puesto: 'Administradora de Seguridad TI', personnelGroup: 'MM', traveler: false },
];
USERS.forEach(u => { if (u.perfil) u.perfil.anticipo = anticipoApplies(u); });
// ANTICIPO NO APLICA (regla 253): además de Director E/ED, todo perfil configurado con anticipo = «No» (p. ej. DGA) — lo resuelve el Portal con la
// configuración del perfil (usperfil-data.js › PROFILES[].anticipo), nunca con el nombre del rol en el renderizador del trayecto.

// vis: map role -> '✓' | 'V' | 'VPF' | 'L' | 'P' | undefined(—). pf: perfil flag required for VPF.
const ALL = ['COL','CHH','DIR','CHC','DGA','HH','HC','VIA','CON','CTR','ADM'];
const all = (v) => Object.fromEntries(ALL.map(r => [r, v]));
const travelerBase = { ...all('V'), COL: '✓' };
const MENU = [
  { group: null, items: [{ id: 'inicio', label: 'Inicio', us: 'US-01', vis: all('✓') }] },
  { group: 'Planeación de viaje', items: [
    { id: 'creacion', label: 'Creación', us: 'US-08', fn: 'Crear solicitud de viaje', vis: travelerBase },
    { id: 'misviajes', label: 'Mis viajes', us: 'US-11', fn: 'Expediente de folios propios', vis: travelerBase },
    { id: 'anticipo', label: 'Anticipo', us: 'US-15', vis: all('VPF'), pf: 'anticipo' },
    { id: 'hospedaje', label: 'Hospedaje', us: 'US-12', vis: travelerBase },
    { id: 'vuelo', label: 'Vuelos', us: 'US-12', vis: travelerBase },
    { id: 'comprobacion', label: 'Comprobación', us: 'US-19', vis: travelerBase },
    { id: 'representacion', label: 'Gastos de representación', us: 'US-20', vis: { ...all('VPF'), DGA: '✓' }, pf: 'representacion' }
  ] },
  { group: null, items: [{ id: 'perfil', label: 'Perfil del viajero', us: 'US-04', fn: 'Consulta y actualización del perfil de viajero (Viáticos: consulta en solo lectura)', vis: { ...all('V'), COL: '✓', VIA: 'L' } }] },
  { group: null, items: [{ id: 'externos', label: 'Viajeros externos', us: 'US-05', fn: 'Gestión de colaboradores externos', vis: { CHH: '✓', VIA: 'L' } }] },
  { group: 'Presupuesto', items: [
    { id: 'pres-monitor', label: 'Monitor', us: 'US-06', vis: { DIR: '✓', CHC: '✓', DGA: '✓', VIA: '✓', CON: '✓', CTR: '✓', ADM: 'P' } },
    { id: 'pres-act', label: 'Actualización', us: 'US-07', vis: { CON: '✓', CTR: 'L', DIR: 'P' } }
  ] },
  { group: 'Autorización', items: [
    { id: 'aut-viaje', label: 'Aprobación de viaje', us: 'US-09', vis: { DIR: '✓', CHC: '✓', DGA: '✓' } },
    { id: 'aut-rep', label: 'Gastos de representación', us: 'US-20', vis: { DGA: '✓', CTR: '✓' } },
    { id: 'aut-comp', label: 'Comprobaciones', us: 'US-20', fn: 'Evidencias de gastos de representación (DGA)', vis: { DGA: '✓' } }
  ] },
  { group: 'Reservaciones', items: [
    { id: 'res-hsm', label: 'Hospedaje HSM', us: 'US-13', vis: { HH: '✓' } },
    { id: 'res-hotel', label: 'Hotel y vuelos', us: 'US-14', fn: 'Hotel externo y ciclo de vuelos', vis: { VIA: '✓' } }
  ] },
  { group: 'Gestión', items: [{ id: 'ges-comp', label: 'Comprobaciones', us: 'US-21', fn: 'Validación de comprobaciones', vis: { VIA: '✓' } }] },
  { group: 'Contabilización', items: [
    { id: 'con-plan', label: 'Planeación de viaje', us: 'US-11', vis: { CON: '✓' } },
    { id: 'con-ant', label: 'Solicitud de anticipo', us: 'US-16', vis: { CON: '✓' } },
    { id: 'con-comp', label: 'Comprobación', us: 'US-22', vis: { CON: '✓' } },
    { id: 'con-rep', label: 'Gastos de representación', us: 'US-22', vis: { CON: '✓' } }
  ] },
  { group: null, items: [{ id: 'encuestas', label: 'Gestión de encuestas', us: 'US-18', vis: { HC: '✓' } }] },
  { group: null, items: [
    { id: 'dashboard', label: 'Dashboard', us: 'US-23', vis: { DIR: '✓', CHC: '✓', DGA: '✓', HC: '✓', VIA: '✓', CON: '✓', CTR: '✓', ADM: 'P' } },
    { id: 'reportes', label: 'Reportes', us: 'US-24', vis: { CHH: '✓', DIR: '✓', CHC: '✓', DGA: '✓', HC: '✓', VIA: '✓', CON: '✓', CTR: '✓', ADM: '✓' } }
  ] },
  { group: 'Administración', items: [
    { id: 'adm-perfiles', label: 'Perfiles de viajero', us: 'US-03', vis: { ADM: '✓' } },
    { id: 'adm-catalogos', label: 'Catálogos y parámetros', us: 'US-25', fn: 'Catálogos, parámetros globales y mantenimiento', vis: { ADM: '✓' } },
    { id: 'adm-politicas', label: 'Políticas y guías', us: 'US-27', vis: { ADM: '✓' } },
    { id: 'adm-usuarios', label: 'Usuarios y permisos', us: 'US-26', vis: { ADM: '✓' } },
    { id: 'adm-bitacora', label: 'Bitácora', us: 'US-26', vis: { ADM: '✓', CHH: 'L', DIR: 'L', CHC: 'L', CON: 'L', CTR: 'L' } }
  ] },
  { group: 'Ayuda', items: [
    { id: 'ayu-politicas', label: 'Políticas', us: 'US-27', vis: all('✓') },
    { id: 'ayu-guia', label: 'Guía de usuario', us: 'US-27', vis: all('✓') },
    { id: 'ayu-encuesta', label: 'Encuesta', us: 'US-18', fn: 'Responder encuesta de hospedaje HSM', vis: { ...all('V'), COL: '✓', CHH: '✓', DGA: undefined } }
  ] }
];

// Pending counters per user id -> { menuItemId: n }
const COUNTS = {
  u01: { comprobacion: 1, 'ayu-encuesta': 1 },
  u02: { externos: 2 },
  u03: { 'aut-viaje': 3 },
  u04: { 'aut-viaje': 5, 'aut-rep': 0 },
  u05: { 'aut-viaje': 2 },
  u06: { 'aut-viaje': 1, 'aut-rep': 2, 'aut-comp': 1 },
  u07: { 'res-hsm': 2 },
  u08: { encuestas: 6, 'res-hotel': 2 },
  u09: { 'res-hotel': 5, 'ges-comp': 9 },
  u10: { 'con-ant': 2, 'con-comp': 7 },
  u11: { 'aut-rep': 2 },
  u12: {}
};

// VIAJEROS EXTERNOS: entidad propia, separada del registro de usuarios del Portal. Solo atributos ya presentes en los datos
// aprobados del prototipo (nombre · hospital de la visita · tipo · área que lo registra). Sin No. de colaborador, perfil ni sociedad.
const EXTERNALS = {
  x01: { name: 'Mariana López Cruz', hospital: 'HSM Chihuahua', tipo: 'Externo', registradoPor: 'Capital Humano HSM' },
  x02: { name: 'Raúl Estrada Pineda', hospital: 'HSM Monterrey', tipo: 'Externo', registradoPor: 'Capital Humano HSM' }
};
const S = {
  pendiente: { text: 'Pendiente', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  captura: { text: 'En captura', tone: 'gris', icon: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z' },
  pendAut: { text: 'Pendiente autorización', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  pendAsig: { text: 'Pendiente asignación', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  pendVal: { text: 'Pendiente validación', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  enProceso: { text: 'En proceso', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  aprobada: { text: 'Aprobada', tone: 'verde', icon: 'M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3' },
  asignado: { text: 'Asignado', tone: 'verde', icon: 'M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3' },
  realizado: { text: 'Realizado', tone: 'verde', icon: 'M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3' },
  finalizado: { text: 'Finalizado', tone: 'verde', icon: 'M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3' },
  rechazada: { text: 'Rechazada', tone: 'rojo', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM15 9l-6 6M9 9l6 6' },
  cancelada: { text: 'Cancelada', tone: 'oscuro', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM4.9 4.9l14.2 14.2' },
  notificado: { text: 'Notificado a colaborador', tone: 'verde', icon: 'M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3' },
  confirmado: { text: 'Confirmado', tone: 'verde', icon: 'M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3' },
  pendTransf: { text: 'Pendiente de transferencia', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  transferido: { text: 'Transferido', tone: 'verde', icon: 'M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3' },
  pcAnt: { text: 'Pendiente contabilización anticipo', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  pcComp: { text: 'Pendiente contabilización comprobación', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  pcVue: { text: 'Pendiente contabilización vuelos', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  pcRep: { text: 'Pendiente contabilización gastos de representación', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  pDevol: { text: 'Pendiente devolución', tone: 'amarillo', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  pAdeudo: { text: 'Pendiente adeudo a colaborador', tone: 'amarillo', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  pendAutCtr: { text: 'Pendiente de autorización', tone: 'azul', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  vencido: { text: 'Plazo vencido', tone: 'emergencia', icon: 'M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01' }
};
const STATUS = S;

const trip = { folio: '00043', dest: 'HSM Chihuahua', dates: '15 – 18 jun 2026', nights: '4 días · 3 noches', motivo: 'Operación' };

// Inicio per user. ROLE/SCOPE-AWARE: summary.scope = personal (own travel figures) | operational (own work queue) | organizational (budget of the unit the role is responsible for — Dirección de Hospital / Dirección Corporativa / CH CO (own dirección) / Contraloría). summaries[] = several KPI blocks in order (else summary). kpi.valueTone = true paints the VALUE in the tone color (e.g. Nivel de rechazos in red; no threshold rule).
// BUDGET block (client, final): Planeado · Ejercido · Comprometido · PRE disponible, where PRE disponible = Planeado − Comprometido (Ejercido is the consumed part of Comprometido and does not change the formula).
// myTrip always carries the 4 canonical stages (shared journey progress); stage.state = done | current | todo | na («No aplica»: the stage stays in place, gray, never renumbered).
// trays[].columns = personal | externos | standard | operational | operationalOrg | hosted | traveling | bitacora (see COLS in the prototype / TABLE_LIST_STANDARD.md). Each column set fixes what every field means; Detalle/meta has ONE meaning per table (see tray.detalleMeaning). Scalable trays get search + contextual filters + sortable columns + pagination (tray.filters, tray.pageSize).
const HOMES = {
  u01: {
    title: 'Inicio', help: 'Aquí se muestra el viaje actual, lo que falta por hacer y los indicadores de viaje correspondientes al perfil.',
    myTrip: { ...trip, stage: 3, status: S.enProceso, next: 'Registra tus gastos y comprobantes de este viaje desde Comprobación.', deadline: { text: 'Quedan 2 días hábiles para comprobar', severity: 'warning' }, nextCta: 'Comprobar gastos', nextTarget: 'comprobacion',
      stages: [{ label: 'Aprobación de viaje', state: 'done', note: 'Aprobada 10 jun' }, { label: 'Anticipo', state: 'done', note: 'Depositado 12 jun · $9,090' }, { label: 'Comprobación', state: 'current', note: 'Vence 22 jun' }, { label: 'Cierre', state: 'todo', note: 'Contabilidad' }] },
    summary: { scope: 'personal', title: 'Tu actividad de viaje', kpis: [{ label: 'Comprometido', value: '$9,090', hint: 'Anticipo autorizado · folio 00043' }, { label: 'En tránsito', value: '$9,090', hint: 'Anticipo depositado, por comprobar', tone: 'amarillo' }, { label: 'Gasto acumulado 2026', value: '$14,350', hint: '2 viajes comprobados' }, { label: 'Uso de presupuesto asignado', value: '56 %', hint: 'Del presupuesto de viáticos asignado al colaborador', tone: 'verde' }] }, // USER-SCOPE only: % of the collaborator's own assigned budget (mock display value, not a business formula). Never Dirección totals/%.
    trays: [{ title: 'Mis viajes anteriores', count: 3, cta: 'Ver mis viajes', target: 'misviajes', columns: 'personal', filters: ['status'], rows: [
      { folio: '00038', destino: 'HSM Querétaro', asunto: 'Capacitación', status: S.finalizado, age: 'Cerrado 20 may 2026' },
      { folio: '00031', destino: 'HSM Mérida', asunto: 'Operación', status: S.finalizado, age: 'Cerrado 28 mar 2026' },
      { folio: '00024', destino: 'HSM Veracruz', asunto: 'Reunión comité', status: S.cancelada, age: 'Cancelada 28 ene 2026' } ] }]
  },
  u02: {
    title: 'Inicio', help: 'Aquí se muestran los viajeros externos registrados por este usuario y sus pendientes. El viaje propio y sus etapas aparecen cuando existe una solicitud reciente.',
    myTrip: { folio: '00041', dest: 'Corporativo', dates: '24 – 25 jun 2026', nights: '2 días · 1 noche', motivo: 'Reunión comité', stage: 1, status: S.pendAut, next: 'Tu solicitud espera la autorización de Dirección de Hospital.', nextCta: 'Ver solicitud', nextTarget: 'misviajes',
      stages: [{ label: 'Aprobación de viaje', state: 'current', note: 'Pendiente Dirección de Hospital' }, { label: 'Anticipo', state: 'todo', note: 'Después de la aprobación' }, { label: 'Comprobación', state: 'todo', note: 'Después del viaje' }, { label: 'Cierre', state: 'todo', note: 'Contabilidad' }] },
    summary: { scope: 'operational', title: 'Viajeros externos a tu cargo', kpis: [{ label: 'Externos activos', value: '6' }, { label: 'Con viaje en curso', value: '2', tone: 'azul' }, { label: 'Requieren actualización', value: '1', hint: 'Perfil sin vigencia', tone: 'rojo' }] },
    trays: [{ title: 'Viajeros externos con pendientes', count: 2, cta: 'Ver todos los externos', target: 'externos', columns: 'externos', detalleMeaning: 'Fechas de viaje · fecha clave de la comprobación', filters: ['status'], empty: 'Sin viajeros externos con pendientes. Los externos registrados aparecen aquí cuando requieren una acción.', rows: [
      { folio: '00044', extId: 'x01', destino: 'Corporativo', asunto: 'Entrevista · candidata', detalle: 'Viaje 8 – 9 jun 2026 · Comprobación vence 15 jun 2026', status: S.enProceso, age: 'Notificado hace 1 día' },
      { folio: '00040', extId: 'x02', destino: 'HSM Monterrey', asunto: 'Reunión sindical', detalle: 'Viaje 17 – 18 jun 2026 · Comprobación abre 18 jun 2026', status: S.aprobada, age: 'Aprobada hace 3 días' } ] }]
  },
  u03: {
    title: 'Inicio', help: 'Aquí se muestran las solicitudes por autorizar del hospital y el presupuesto de viáticos de la unidad. Las solicitudes también llegan a la APP.',
    // Organizational budget (own hospital): Planeado · Ejercido · Comprometido · PRE disponible (client V2: Ejercido added; «PRE disponible» kept as documented in the approved flow, final naming pending client confirmation)
    summary: { scope: 'organizational', title: 'Presupuesto de viáticos · HSM Chihuahua', kpis: [{ label: 'Planeado 2026', value: '$1,200,000', hint: 'HSM Chihuahua' }, { label: 'Ejercido', value: '$612,000', hint: 'Gasto comprobado y contabilizado' }, { label: 'Comprometido', value: '$912,000', hint: 'Incluye lo ejercido y las reservas vigentes' }, { label: 'PRE disponible', value: '$288,000', hint: 'Planeado − Estimado · 76 % utilizado', tone: 'amarillo' }, { label: 'Por autorizar', value: '3', tone: 'azul' }] },
    // Budget severity lives in the PRE disponible KPI (rule 245): no page banner that restates it.
    trays: [{ title: 'Solicitudes por autorizar', count: 3, cta: 'Ir a Aprobación de viaje', target: 'aut-viaje', columns: 'standard', detalleMeaning: 'Línea 1: fechas del viaje · monto estimado · Línea 2: fecha de solicitud', filters: ['destino'], rows: [
      { folio: '00045', personId: 'u09', destino: 'HSM Ciudad Juárez', asunto: 'Capacitación', detalle: 'Viaje 22 – 23 jun 2026 · $6,200 est. · Solicitada 9 jun 2026', status: S.pendAut, age: 'Hace 2 h' },
      { folio: '00044', extId: 'x01', destino: 'Corporativo', asunto: 'Entrevista · candidata', detalle: 'Viaje 20 jun 2026 · $4,800 est. · Solicitada 8 jun 2026', status: S.pendAut, age: 'Hace 1 día' },
      { folio: '00042', personId: 'u07', destino: 'HSM Monterrey', asunto: 'Operación', detalle: 'Viaje 19 jun 2026 · $3,900 est. · Solicitada 6 jun 2026', status: S.pendAut, age: 'Hace 3 días' } ] },
    // Client (V2 final): who is hosted at THIS hospital right now — own hospital scope only. Hospital / Corporativo = origin of the guest.
    { title: 'Hospedados actualmente · HSM Chihuahua', count: 3, cta: 'Ver hospedaje del hospital', target: 'dashboard', columns: 'hosted', filters: ['status', 'org'], rows: [
      // Estatus «Pendiente» (cliente): llegada registrada sin habitación asignada todavía; la transición exacta queda por definir.
      { folio: '00049', personId: 'u10', entrada: '28 sep 2026', salida: '2 oct 2026', status: S.pendiente, age: 'Por asignar' },
      { folio: '00043', personId: 'u01', entrada: '15 jun 2026', salida: '18 jun 2026', status: S.asignado, age: 'Hab. 402' },
      { folio: '00040', extId: 'x02', entrada: '17 jun 2026', salida: '18 jun 2026', status: S.asignado, age: 'Hab. 413' },
      { folio: '00036', personId: 'u11', entrada: '16 jun 2026', salida: '19 jun 2026', status: S.asignado, age: 'Hab. 407' } ] }]
  },
  u04: {
    title: 'Inicio', help: 'Aquí se muestran las solicitudes de la dirección en segunda instancia, el presupuesto de viáticos de la dirección corporativa y el viaje propio.',
    // Own trip of a perfil Director with personnelGroup ED → Anticipo = No aplica (stage 2 stays in place, gray, never renumbered).
    myTrip: { folio: '00048', dest: 'HSM Monterrey', dates: '6 – 7 jul 2026', nights: '2 días · 1 noche', motivo: 'Reunión comité', stage: 1, status: S.aprobada, next: 'Viaje aprobado. Confirma hospedaje y vuelo.', nextCta: 'Confirmar hospedaje', nextTarget: 'hospedaje',
      
      stages: [{ label: 'Aprobación de viaje', state: 'done', note: 'Aprobada 12 jun' }, { label: 'Anticipo', state: 'na', note: 'No aplica · Director grupo ED' }, { label: 'Comprobación', state: 'current', note: 'Al concluir el viaje · 7 jul' }, { label: 'Cierre', state: 'todo', note: 'Contabilidad' }] },
    summary: { scope: 'organizational', monitorCta: true, title: 'Presupuesto de viáticos · Dirección Comercial y de Negocios', kpis: [{ label: 'Planeado 2026', value: '$550,000', hint: 'Dirección Comercial y de Negocios' }, { label: 'Ejercido', value: '$198,000', hint: 'Gasto comprobado y contabilizado' }, { label: 'Comprometido', value: '$309,000', hint: 'Incluye lo ejercido y las reservas vigentes' }, { label: 'PRE disponible', value: '$241,000', hint: 'Planeado − Estimado · 56 % utilizado', tone: 'verde' }, { label: 'Por autorizar', value: '5', tone: 'azul' }] },
    trays: [{ title: 'Solicitudes por autorizar', count: 5, cta: 'Ir a Aprobación de viaje', target: 'aut-viaje', columns: 'standard', detalleMeaning: 'Línea 1: fechas del viaje · monto estimado · Línea 2: fecha de solicitud', filters: ['destino'], rows: [
      { folio: '00046', personId: 'u11', destino: 'HSM Mérida', asunto: 'Proyecto', detalle: 'Viaje 23 – 25 jun 2026 · $7,100 est. · Solicitada 9 jun 2026', status: S.pendAut, age: 'Hace 40 min' },
      { folio: '00045', personId: 'u09', destino: 'HSM Ciudad Juárez', asunto: 'Capacitación', detalle: 'Viaje 22 – 23 jun 2026 · $6,200 est. · Solicitada 9 jun 2026', status: S.pendAut, age: 'Hace 2 h' },
      { folio: '00017', personId: 'u07', destino: 'Corporativo', asunto: 'Reunión comité', detalle: 'Viaje 21 jun 2026 · $5,400 est. · Solicitada 8 jun 2026', status: S.pendAut, age: 'Hace 1 día' },
      { folio: '00041', personId: 'u02', destino: 'Corporativo', asunto: 'Reunión comité', detalle: 'Viaje 24 – 25 jun 2026 · $4,050 est. · Solicitada 7 jun 2026', status: S.pendAut, age: 'Hace 2 días' },
      { folio: '00038', personId: 'u10', destino: 'HSM Veracruz', asunto: 'Operación', detalle: 'Viaje 26 jun 2026 · $2,900 est. · Solicitada 5 jun 2026', status: S.pendAut, age: 'Hace 4 días' } ] },
    // Client (V2 final): collaborators of THIS dirección currently traveling — own organizational scope only, never the whole company.
    { title: 'Colaboradores en viaje · Dirección Comercial y de Negocios', count: 2, cta: 'Ver viajes de la dirección', target: 'dashboard', columns: 'traveling', filters: ['status', 'org'], rows: [
      { folio: '00043', personId: 'u01', destino: 'HSM Chihuahua', asunto: 'Operación', fechas: '15 – 18 jun 2026', status: S.enProceso, age: 'Regresa en 3 días' },
      { folio: '00018', personId: 'u07', destino: 'Corporativo', asunto: 'Capacitación', fechas: '14 – 16 jun 2026', status: S.enProceso, age: 'Regresa en 1 día' } ] }]
  },
  u05: {
    // CH CO (Dirección de Capital Humano Corporativo). V2: traveler-capable in the demo (own trip card), own dirección budget on top, escalated cases kept below. Distinct from Capital Humano HSM.
    // ORDEN DEL CLIENTE (regla 264, supersede 252 para CH CO): Presupuesto · Casos escalados · Solicitudes por autorizar · Colaboradores en viaje ·
    // Perfil de viajero · Tu viaje · Nueva solicitud (viajero solo con perfil vigente; manejo estándar de «Sin perfil vigente»).
    order: ['sum0', 'sum1', 'tray0', 'tray1', 'perfil', 'trip', 'nueva'],
    title: 'Inicio', help: 'Aquí llegan solo los casos escalados de: hospitales con Dirección vacante, excedentes de política o presupuesto, autorizaciones específicas.',
    myTrip: { folio: '00047', dest: 'HSM Guadalajara', dates: '2 – 3 jul 2026', nights: '2 días · 1 noche', motivo: 'Reunión comité', stage: 1, status: S.pendAut, next: 'Tu solicitud espera la autorización de Dirección Corporativa.', nextCta: 'Ver solicitud', nextTarget: 'misviajes',
      stages: [{ label: 'Aprobación de viaje', state: 'current', note: 'Pendiente Dirección Corporativa' }, { label: 'Anticipo', state: 'todo', note: 'Después de la aprobación' }, { label: 'Comprobación', state: 'todo', note: 'Después del viaje' }, { label: 'Cierre', state: 'todo', note: 'Contabilidad' }] },
    summaries: [
      { scope: 'organizational', monitorCta: true, chart: true, conceptDots: true, title: 'Presupuesto de viáticos · Dirección de Capital Humano', kpis: [{ label: 'Planeado 2026', value: '$420,000', hint: 'Dirección de Capital Humano' }, { label: 'Ejercido', value: '$151,000', hint: 'Gasto comprobado y contabilizado' }, { label: 'Comprometido', value: '$240,000', hint: 'Incluye lo ejercido y las reservas vigentes' }, { label: 'PRE disponible', value: '$180,000', hint: 'Planeado − Estimado · 57 % utilizado', tone: 'verde' }] },
      { scope: 'operational', title: 'Casos escalados', kpis: [{ label: 'Escalados por autorizar', value: '2', tone: 'azul' }, { label: 'Hospitales con Dirección vacante', value: '1', hint: 'HSM Monterrey', tone: 'amarillo' }, { label: 'Excepciones aprobadas este mes', value: '4' }] }
    ],
    trays: [{ title: 'Solicitudes por autorizar', count: 2, cta: 'Ir a Aprobación de viaje', target: 'aut-viaje', columns: 'standard', detalleMeaning: 'Línea 1: fechas del viaje · monto estimado · Línea 2: motivo del escalamiento', filters: ['destino'], rows: [
      { folio: '00039', personId: 'u12', destino: 'Corporativo', asunto: 'Operación', detalle: 'Viaje 19 jun 2026 · $4,300 est. · Escalada: Dirección de Hospital vacante', status: S.pendAut, age: 'Hace 5 h' },
      { folio: '00037', personId: 'u13', destino: 'HSM Mérida', asunto: 'Operación', detalle: 'Viaje 24 – 29 jun 2026 · $9,800 est. · Escalada: excede noches del perfil (5 de 3)', status: S.pendAut, age: 'Hace 2 días' } ] },
    // Client (V2 final): «Sí, pero los suyos (no todos)» — collaborators of the Dirección de Capital Humano currently traveling.
    { title: 'Colaboradores en viaje · Dirección de Capital Humano', count: 2, cta: 'Ver viajes de la dirección', target: 'dashboard', columns: 'traveling', filters: ['status', 'org'], rows: [
      { folio: '00030', personId: 'u02', destino: 'HSM Ciudad Juárez', asunto: 'Operación', fechas: '13 – 16 jun 2026', status: S.enProceso, age: 'Regresa en 1 día' },
      { folio: '00034', personId: 'u13', destino: 'HSM Guadalajara', asunto: 'Capacitación', fechas: '15 – 17 jun 2026', status: S.enProceso, age: 'Regresa en 2 días' } ] }]
  },
  u06: {
    title: 'Inicio', help: 'Aquí se muestran las autorizaciones de viaje pendientes, los gastos de representación por autorizar y el viaje propio. Con la autorización previa de DGA el caso continúa a Contraloría.',
    // DGA own travel: Aprobación de viaje starts APPROVED at capture. Anticipo = NO APLICA (client 2026-09-30): el perfil DGA se configura sin anticipo;
    // el trayecto lo muestra gris «No aplica» por la configuración del perfil (regla 253), no por el nombre del rol.
    // ORDEN DEL CLIENTE (regla 252): Presupuesto de su Dirección · Perfil de viajero · Tu viaje · Autorizaciones pendientes.
    order: ['sum0', 'perfil', 'trip', 'nueva', 'sum1', 'tray0'],
    myTrip: { folio: '00035', dest: 'HSM Monterrey', dates: '30 jun – 1 jul 2026', nights: '2 días · 1 noche', motivo: 'Reunión comité', stage: 1, status: S.aprobada, next: 'Viaje aprobado. Confirma hospedaje y vuelo.', nextCta: 'Confirmar hospedaje', nextTarget: 'hospedaje',
      stages: [{ label: 'Aprobación de viaje', state: 'done', note: 'Aprobada al capturar · 20 jun' }, { label: 'Anticipo', state: 'na', note: 'No aplica · reembolso al comprobar' }, { label: 'Comprobación', state: 'todo', note: 'Después del viaje' }, { label: 'Cierre', state: 'todo', note: 'Contabilidad' }] },
    summaries: [
      // DATO DEMO: presupuesto de la Dirección General Adjunta (valores sintéticos; mismo componente y umbrales que Dirección).
      { scope: 'organizational', monitorCta: true, title: 'Presupuesto de viáticos · Dirección General Adjunta', kpis: [{ label: 'Planeado 2026', value: '$800,000', hint: 'Dirección General Adjunta' }, { label: 'Ejercido', value: '$296,000', hint: 'Gasto comprobado y contabilizado' }, { label: 'Comprometido', value: '$472,000', hint: 'Incluye lo ejercido y las reservas vigentes' }, { label: 'PRE disponible', value: '$328,000', hint: 'Planeado − Estimado · 59 % utilizado', tone: 'verde' }] },
      { scope: 'operational', title: 'Autorizaciones pendientes', kpis: [{ label: 'Autorizaciones de viaje pendientes', value: '1', tone: 'azul' }, { label: 'Representación por autorizar', value: '2', tone: 'azul' }, { label: 'Comprobaciones DGA por revisar', value: '1' }] }
    ],
    trays: [{ title: 'Pendientes de autorización', count: 4, cta: 'Ver todos', target: 'aut-rep', columns: 'operationalOrg', detalleMeaning: 'Tipo de autorización · concepto · fecha · monto', filters: ['status', 'org'], rows: [
      { folio: '00036', personId: 'u04', meta: 'Gasto de representación · Cena con proveedor · 5 jun 2026 · $4,200', status: S.pendAut, age: 'Hace 3 h' },
      { folio: '00034', personId: 'u03', meta: 'Gasto de representación · Comida con autoridades · 3 jun 2026 · $2,800', status: S.pendAut, age: 'Hace 1 día' },
      { folio: '00033', personId: 'u11', meta: 'Autorización de viaje · HSM Puebla → HSM Querétaro · 26 jun 2026 · $5,800 est.', status: S.pendAut, age: 'Hace 2 días' },
      { folio: '00031', personId: 'u11', meta: 'Comprobación de representación · Desayuno con auditores · 28 may 2026 · $1,950', status: S.pendVal, age: 'Hace 3 días' } ] }]
  },
  u07: {
    // HOTELERÍA HSM · Inicio operativo (cliente 2026-09-30): Bandeja «Hospedaje HSM · <hospital>» · Indicadores de hospedaje · Solicitudes de hospedaje.
    // {hospital} = hospital asignado de la persona (registro canónico). Secciones del viajero solo si la persona tiene perfil vigente, al final (regla 252).
    order: ['sum0', 'sum1', 'tray0'],
    title: 'Inicio', help: 'Confirma habitación o rechaza por falta de disponibilidad. Las solicitudes rechazadas continúan su gestión fuera del hospital.',
    summaries: [
      { scope: 'operational', title: 'Hospedaje HSM · {hospital}', kpis: [{ label: 'Solicitudes pendientes', value: '2', tone: 'azul' }, { label: 'Habitaciones ocupadas hoy', value: '3 de 5' }, { label: 'Llegadas esta semana', value: '5' }] },
      // DATOS DEMO (valores sintéticos, no reglas): «Nivel de rechazos» siempre en rojo (regla 19; sin umbral).
      { scope: 'operational', title: 'Indicadores de hospedaje · {hospital}', kpis: [{ label: 'Promedio de satisfacción del huésped', value: '4.4 / 5', hint: 'Encuesta de hospedaje', tone: 'verde' }, { label: 'Estancia promedio del mes', value: '2.6 noches', hint: 'Septiembre 2026' }, { label: 'Nivel de rechazos', value: '8 %', hint: 'Rechazadas / solicitadas del mes', tone: 'rojo', valueTone: true }] }
    ],
    trays: [{ title: 'Solicitudes de hospedaje · {hospital}', count: 4, cta: 'Ir a Hospedaje HSM', target: 'res-hsm', columns: 'operationalOrg', detalleMeaning: 'Fechas de estancia · noches · tipo de habitación', filters: ['status'], rows: [
      { folio: '00043', personId: 'u01', meta: '15 – 18 jun 2026 · 3 noches · Habitación individual', status: S.pendAut, age: 'Llega en 6 días' },
      { folio: '00045', personId: 'u09', meta: '22 – 23 jun 2026 · 1 noche · Habitación compartida', status: S.pendAut, age: 'Llega en 13 días' },
      { folio: '00040', extId: 'x02', meta: '17 – 18 jun 2026 · 1 noche · Habitación individual', status: S.asignado, age: 'Hab. 413 asignada' },
      { folio: '00036', personId: 'u11', meta: '16 – 19 jun 2026 · 3 noches · Habitación individual', status: S.asignado, age: 'Hab. 407 asignada' } ] }]
  },
  u08: {
    title: 'Inicio', help: 'Administra la encuesta de hospedaje HSM y consulta sus resultados por unidad.',
    summary: { scope: 'operational', title: 'Encuestas de hospedaje', kpis: [{ label: 'Encuestas pendientes de respuesta', value: '6', tone: 'azul' }, { label: 'Respondidas este mes', value: '18' }, { label: 'Satisfacción promedio', value: '4.3 / 5', tone: 'verde' }] },
    trays: [
      // BANDEJA DE TRABAJO (cliente 2026-09-30): solicitudes de hospedaje RECHAZADAS por Hotelería HSM que siguen el flujo de Hotelería Corporativo. Datos demo.
      { title: 'Bandeja de trabajo · Rechazadas por Hotelería HSM', count: 2, cta: 'Ir a Hotel y vuelos', target: 'res-hotel', columns: 'collabOrg', detalleMeaning: 'Línea 1: fechas de estancia · Línea 2: noches solicitadas', filters: ['destino'], rows: [
        { folio: '00052', personId: 'u13', destino: 'HSM Guadalajara', meta: '6 – 8 oct 2026', metaSub: '2 noches', status: S.rechazada, statusSub: 'Rechazada por HSM hace 2 h', age: 'Viaja en 6 días' },
        { folio: '00053', personId: 'u02', destino: 'HSM Monterrey', meta: '13 – 14 oct 2026', metaSub: '1 noche', status: S.rechazada, statusSub: 'Rechazada por HSM hace 1 día', age: 'Viaja en 13 días' } ] },
      { title: 'Encuestas sin responder', count: 6, cta: 'Ir a Gestión de encuestas', target: 'encuestas', columns: 'operationalOrg', detalleMeaning: 'Estancia evaluada · fechas · recordatorios enviados', filters: ['status', 'org'], rows: [
      { folio: '00038', personId: 'u01', meta: 'Estancia HSM Querétaro · 3 – 5 may 2026 · Sin recordatorio', status: S.enProceso, age: 'Enviada hace 12 días' },
      { folio: '00032', personId: 'u10', meta: 'Estancia HSM Mérida · 20 – 22 abr 2026 · 1 recordatorio (10 jun 2026)', status: S.enProceso, age: 'Enviada hace 30 días' } ] }]
  },
  u09: {
    // ORDEN DEL CLIENTE (regla 267): Hotel externo y vuelos antes que Comprobaciones por validar (solo cambia el orden).
    order: ['sum0', 'tray1', 'tray0'],
    title: 'Inicio', help: 'Bandejas de trabajo: hotel externo, vuelos y validación de comprobaciones. Al tomar una solicitud nadie más puede validarla mientras esté asignada.',
    summary: { scope: 'operational', title: 'Bandejas de trabajo', kpis: [{ label: 'Hotel externo', value: '2', tone: 'azul' }, { label: 'Vuelos', value: '3', tone: 'azul' }, { label: 'Comprobaciones', value: '9', hint: '2 con plazo vencido', tone: 'emergencia' }, { label: 'Tiempo promedio de atención', value: '1.8 días' }] },
    trays: [
      { title: 'Comprobaciones por validar', count: 9, cta: 'Ir a Validación de comprobaciones', target: 'ges-comp', columns: 'collabOrg', detalleMeaning: 'Monto comprobado vs. anticipo · diferencia', filters: ['status', 'org'], rows: [
        // personId → registro canónico de personas (nombre, No., Hospital / Corporativo, perfil y sociedad se proyectan; no se copian aquí).
        { folio: '00029', personId: 'u01', destino: 'HSM Chihuahua', meta: '$8,450 comprobados de $8,000 · Pendiente de reembolso $450', status: S.vencido, age: 'Venció hace 2 días' },
        { folio: '00030', personId: 'u03', destino: 'Corporativo', meta: '$3,200 comprobados de $3,200 · Sin diferencia', status: S.pendVal, age: 'Hace 1 día · Atiende: Rosa M.' },
        { folio: '00028', personId: 'u02', destino: 'HSM Querétaro', meta: '$5,100 comprobados de $5,400 · Excedente por devolver $300', status: S.pendVal, age: 'Hace 3 días' },
        { folio: '00027', personId: 'u06', destino: 'HSM Monterrey', meta: '$6,900 comprobados de $6,900 · Sin diferencia', status: S.pendVal, age: 'Hace 3 días' },
        { folio: '00026', personId: 'u05', destino: 'HSM Monterrey', meta: '$2,100 comprobados de $2,600 · Excedente por devolver $500', status: S.vencido, age: 'Venció hace 1 día' },
        { folio: '00025', personId: 'u04', destino: 'HSM Guadalajara', meta: '$3,100 comprobados de $3,100 · Sin diferencia', status: S.pendVal, age: 'Hace 4 días' } ] },
      // HOTEL EXTERNO Y VUELOS (cliente 2026-09-30): Hotel = solo rechazadas por Hotelería HSM que pasan a hotel externo · Vuelo = trabajo de vuelos de Viáticos.
      // legs = tramos del vuelo (DATO DEMO); el Detalle los muestra como ruta «A → B | B → A». Antigüedad = cercanía del viaje («Viaja en X días»).
      { title: 'Hotel externo y vuelos', count: 5, cta: 'Ir a Hotel y vuelos', target: 'res-hotel', columns: 'collabOrg', detalleMeaning: 'Vuelo: ruta · fecha de viaje · Hotel: fechas de estancia · noches', filters: ['servicio', 'status'], rows: [
        { folio: '00043', personId: 'u01', servicio: 'Vuelo', destino: 'HSM Chihuahua', legs: [['CD. MX', 'CUU'], ['CUU', 'CD. MX']], fechaViaje: '15 – 18 jun 2026', status: S.pendAsig, age: 'Viaja en 6 días' },
        { folio: '00047', personId: 'u05', servicio: 'Vuelo', destino: 'HSM Guadalajara', legs: [['CD. MX', 'GDL'], ['GDL', 'CD. MX']], fechaViaje: '2 – 3 jul 2026', status: S.asignado, age: 'Viaja en 23 días' },
        { folio: '00048', personId: 'u04', servicio: 'Vuelo', destino: 'HSM Monterrey', legs: [['CD. MX', 'MTY'], ['MTY', 'CD. MX']], fechaViaje: '6 – 7 jul 2026', status: S.confirmado, statusSub: 'Notificado: 08/06/2026', age: 'Viaja en 27 días' },
        { folio: '00046', personId: 'u02', servicio: 'Hotel', destino: 'HSM Mérida', meta: '23 – 25 jun 2026', metaSub: '2 noches', status: S.notificado, statusSub: 'hace 3 h', age: 'Viaja en 14 días' },
        { folio: '00042', personId: 'u07', servicio: 'Hotel', destino: 'HSM Monterrey', meta: '19 – 20 jun 2026', metaSub: '1 noche', status: S.pendAsig, age: 'Viaja en 10 días' } ] }
    ]
  },
  u10: {
    title: 'Inicio', help: 'Anticipos autorizados por transferir y contabilizaciones de lo que Viáticos ya validó y aprobó. Cada movimiento actualiza el presupuesto en tiempo real.',
    summary: { scope: 'operational', title: 'Contabilización', kpis: [{ label: 'Anticipos por transferir', value: '2', hint: '$10,250', tone: 'azul' }, { label: 'Contabilizaciones pendientes', value: '7', tone: 'azul' }] },
    trays: [
      // ANTICIPOS AUTORIZADOS: solo anticipos ya autorizados; Estatus Pendiente de transferencia / Transferido. Detalle: CECO · monto · fecha de autorización.
      { title: 'Anticipos autorizados', count: 3, cta: 'Ir a Solicitud de anticipo', target: 'con-ant', columns: 'anticipos', detalleMeaning: 'Línea 1: CECO · monto · Línea 2: fecha de autorización de la solicitud', filters: ['status'], rows: [
      { folio: '00045', personId: 'u09', meta: 'CECO CHI11000 · Por transferir: $6,200', metaSub: 'Autorizada 10 jun 2026', status: S.pendTransf, age: 'Autorizado hace 1 h' },
      { folio: '00041', personId: 'u02', meta: 'CECO CHI12000 · Por transferir: $4,050', metaSub: 'Autorizada 10 jun 2026', status: S.pendTransf, age: 'Autorizado hace 5 h' },
      { folio: '00039', personId: 'u12', meta: 'CECO MTY11000 · Transferido: $4,300', metaSub: 'Autorizada 9 jun 2026', status: S.transferido, age: 'Transferido hace 2 h' } ] },
      // CONTABILIZACIONES PENDIENTES: SOLO registros que Viáticos ya VALIDÓ y APROBÓ. Importe con signo tal cual (dato demo): su lectura contable no está definida.
      { title: 'Contabilizaciones pendientes', count: 7, pageSize: 7, cta: 'Ir a Comprobación', target: 'con-comp', columns: 'anticipos', detalleMeaning: 'Línea 1: concepto · importe · Línea 2: validación de Viáticos', filters: ['status'], rows: [
      { folio: '00044', personId: 'u13', meta: 'Anticipo · $5,400', metaSub: 'Validado por Viáticos 10 jun 2026', status: S.pcAnt, age: 'Hace 2 h' },
      { folio: '00030', personId: 'u02', meta: 'Comprobación · +$450', metaSub: 'Validado por Viáticos 9 jun 2026', status: S.pcComp, age: 'Hace 1 día' },
      { folio: '00025', personId: 'u04', meta: 'Comprobación · −$300', metaSub: 'Validado por Viáticos 8 jun 2026', status: S.pcComp, age: 'Hace 2 días' },
      { folio: '00043', personId: 'u01', meta: 'Vuelos · $7,850', metaSub: 'Validado por Viáticos 9 jun 2026', status: S.pcVue, age: 'Hace 1 día' },
      { folio: '00027', personId: 'u06', meta: 'Gastos de representación · $6,900', metaSub: 'Validado por Viáticos 8 jun 2026', status: S.pcRep, age: 'Hace 2 días' },
      { folio: '00028', personId: 'u02', meta: 'Devolución · $300', metaSub: 'Validado por Viáticos 7 jun 2026', status: S.pDevol, age: 'Hace 3 días' },
      { folio: '00029', personId: 'u01', meta: 'Adeudo a colaborador · $450', metaSub: 'Validado por Viáticos 7 jun 2026', status: S.pAdeudo, age: 'Hace 3 días' } ] }]
  },
  u11: {
    // CONTRALORÍA · Inicio (cliente 2026-09-30): sin indicador de presupuesto; foco en Gastos de representación. Antigüedad = desde que el caso llegó a Contraloría.
    title: 'Inicio', help: 'Revisa gastos de representación. Solo llegan casos con solicitud del colaborador y autorización previa de DGA.',
    summary: { scope: 'operational', title: 'Gastos de representación', kpis: [{ label: 'Por autorizar', value: '2', tone: 'azul' }, { label: 'Revisados este mes', value: '7' }] },
    trays: [{ title: 'Gastos de representación por autorizar', count: 2, cta: 'Ir a Gastos de representación', target: 'aut-rep', columns: 'repr', detalleMeaning: 'Línea 1: fecha · monto · Línea 2: fecha de autorización DGA', filters: [], rows: [
      { folio: '00027', personId: 'u06', asunto: 'Cena con consejo médico', meta: '2 jun 2026 · $6,900', metaSub: 'Autorizó DGA 3 jun 2026', status: S.pendAutCtr, age: 'Hace 2 días' },
      { folio: '00025', personId: 'u04', asunto: 'Comida con aseguradora', meta: '27 may 2026 · $3,100', metaSub: 'Autorizó DGA 28 may 2026', status: S.pendAutCtr, age: 'Hace 3 h' } ] }]
  },
  u12: {
    title: 'Inicio', help: 'Administra usuarios, permisos, perfiles de viajero, catálogos, parámetros, políticas y guías. Todo cambio queda en bitácora.',
    summary: { scope: 'operational', title: 'Configuración del portal', kpis: [{ label: 'Usuarios activos', value: '1,284' }, { label: 'Tipos de perfil configurados', value: '5', hint: 'Director · Ejecutivo · Mando medio · Operativo · DGA' }, { label: 'Políticas vigentes', value: '3', hint: '1 vence el 30 jun 2026', tone: 'amarillo' }, { label: 'Cambios en bitácora hoy', value: '14' }] },
    // Bitácora tray (client V2 final): Fecha y hora · Folio · Usuario · Área · Perfil · Acción · Resultado. folio '—' when the event has none; perfil = traveler profile of the affected user/record ('—' for system/global events). Never «Nivel».
    trays: [{ title: 'Actividad reciente en bitácora', count: 14, cta: 'Ver bitácora', target: 'adm-bitacora', columns: 'bitacora', detalleMeaning: 'Acción registrada: qué cambió y sobre qué registro', filters: ['status', 'perfil'], pageSize: 5, rows: [
      { folio: '—', who: 'Sofía Delgado Marín', area: 'Perfiles de viajero', perfil: 'Mando medio', meta: 'Noches máximas por semana del perfil: 3 → 4', status: S.realizado, age: 'Hoy 09:12' },
      { folio: '—', who: 'Sofía Delgado Marín', area: 'Usuarios y permisos', perfil: 'Operativo', meta: 'Alta de usuario con rol Hotelería HSM · Andrés Palma Cordero', status: S.realizado, age: 'Hoy 08:47' },
      { folio: '00045', who: 'Ricardo Fuentes Ávila', area: 'Aprobación de viaje', perfil: 'Operativo', meta: 'Solicitud aprobada · Fernando Miranda Ruiz · HSM Chihuahua → HSM Ciudad Juárez', status: S.realizado, age: 'Hoy 08:15' },
      { folio: '00029', who: 'Rosa Martínez Lugo', area: 'Comprobaciones', perfil: 'Mando medio', meta: 'Comprobación tomada para validación · Sofía Gutiérrez Mena', status: S.realizado, age: 'Hoy 07:52' },
      { folio: '00046', who: 'Andrés Palma Cordero', area: 'Hospedaje HSM', perfil: 'Ejecutivo', meta: 'Solicitud de habitación rechazada · sin disponibilidad · pasa a Viáticos', status: S.rechazada, age: 'Ayer 19:20' },
      { folio: '—', who: 'Sistema', area: 'Catálogos y parámetros', perfil: '—', meta: 'Parámetro Días_antes_sol: 4 días · vigente desde 1 jun 2026', status: S.realizado, age: 'Ayer 18:00' },
      { folio: '00036', who: 'Pedro Medina', area: 'Gastos de representación', perfil: 'Director', meta: 'Autorización previa registrada · Mónica Herrera Luna · $4,200', status: S.realizado, age: 'Ayer 17:35' } ] }]
  }
};

// Notices (bell) per user — when = notification timestamp, rendered as «Notificado: …»; business dates live in text. Folio rule: in prose a request number is always introduced as «folio 000nn».
const NOTICES = {
  u01: [
    { id: 'n1', text: 'Comprobación del folio 00043 vence en 2 días hábiles. Registra tus gastos.', target: 'comprobacion', when: 'hoy 08:00', unread: true, tone: 'amarillo' },
    { id: 'n2', text: 'Anticipo del folio 00043 depositado: $9,090.', target: 'misviajes', when: '12 jun', unread: true, tone: 'verde' },
    { id: 'n3', text: 'Vuelo del folio 00043 confirmado. Descarga tu itinerario.', target: 'vuelo', when: '11 jun', unread: false, tone: 'verde' }
  ],
  u02: [{ id: 'n1', text: 'La solicitud folio 00044 de Mariana López Cruz (viajero externo) está pendiente de comprobación; vence en 3 días.', target: 'externos', when: 'ayer 17:30', unread: true, tone: 'amarillo' }],
  u03: [{ id: 'n1', text: 'Nueva solicitud folio 00045 de Fernando Miranda Ruiz por autorizar.', target: 'aut-viaje', when: 'Hace 2 h', unread: true, tone: 'azul' }, { id: 'n2', text: 'Presupuesto de HSM Chihuahua al 76 % de utilización.', target: 'pres-monitor', when: 'hoy 07:00', unread: true, tone: 'amarillo' }],
  u04: [{ id: 'n1', text: 'Nueva solicitud folio 00046 de Denisse Pérez Arango por autorizar.', target: 'aut-viaje', when: 'Hace 40 min', unread: true, tone: 'azul' }],
  u05: [{ id: 'n1', text: 'Solicitud folio 00039 escalada: Dirección de HSM Monterrey vacante.', target: 'aut-viaje', when: 'Hace 5 h', unread: true, tone: 'azul' }],
  u06: [{ id: 'n1', text: 'Gasto de representación folio 00036 de Mónica Herrera Luna requiere tu autorización previa.', target: 'aut-rep', when: 'Hace 3 h', unread: true, tone: 'azul' }],
  u07: [{ id: 'n1', text: 'Nueva solicitud de hospedaje folio 00045 para el 22 jun.', target: 'res-hsm', when: 'Hace 2 h', unread: true, tone: 'azul' }],
  u08: [],
  u09: [{ id: 'n1', text: 'Comprobación del folio 00029 con plazo vencido hace 2 días.', target: 'ges-comp', when: 'hoy 07:00', unread: true, tone: 'emergencia' }, { id: 'n2', text: 'HSM Mérida rechazó hospedaje del folio 00046. Gestiona hotel externo.', target: 'res-hotel', when: 'Hace 4 h', unread: true, tone: 'azul' }],
  u10: [{ id: 'n1', text: 'Anticipo del folio 00045 autorizado por Dirección Corporativa. Procesa la transferencia.', target: 'con-ant', when: 'Hace 1 h', unread: true, tone: 'azul' }],
  u11: [],
  u12: []
};

// Header deadline alert per user (persistent) — null when none
const DEADLINES = {
  u01: { text: 'Comprobación del folio 00043 vence en 2 días hábiles', target: 'comprobacion', folio: '00043' },
  u09: { text: '2 comprobaciones con plazo vencido en tu bandeja', target: 'ges-comp' }
};

// Definitive icon per menu item (outline, 24 viewBox, stroke 2). Same function = same icon across roles (client V2: every «Comprobación/Comprobaciones» item = document + check).
const I = {
  home: 'M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10',
  plus: 'M12 5v14M5 12h14',
  suitcase: 'M3 7h18v13H3zM8 7V4h8v3M8 7v13M16 7v13',
  money: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  bed: 'M2 4v16M2 8h18a2 2 0 012 2v10M2 17h20M6 8v9',
  plane: 'M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2',
  checkSquare: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  receipt: 'M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2zM8 8h8M8 12h8M8 16h5',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8',
  userPlus: 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3a4 4 0 100 8 4 4 0 000-8M20 8v6M23 11h-6',
  chart: 'M3 3v18h18M7 14l4-4 4 4 5-6',
  refresh: 'M21 12a9 9 0 11-3-6.7M21 3v6h-6',
  checkCircle: 'M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3',
  fileCheck: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15l2 2 4-4',
  hospital: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01',
  hotel: 'M2 20h20M4 20V10a2 2 0 012-2h12a2 2 0 012 2v10M12 8V4M8 14h.01M12 14h.01M16 14h.01',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  fileText: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  message: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  grid: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  key: 'M21 2l-2 2m-7.6 7.6a5.5 5.5 0 11-7.8 7.8 5.5 5.5 0 017.8-7.8zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3',
  history: 'M12 8v4l3 3M3.05 11a9 9 0 11.5 4M3 3v5h5',
  help: 'M12 22a10 10 0 100-20 10 10 0 000 20zM9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01',
  survey: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2zM9 10h.01M12 10h.01M15 10h.01',
  // Iconos semánticos compartidos (misma familia outline): resumen del perfil de viajero, ayuda contextual, cuenta.
  utensils: 'M3 2v7a3 3 0 006 0V2M6 2v20M6 9v13M21 15V2a5 5 0 00-5 5v6h5M21 15v7',
  car: 'M5 17H3v-5l2-6h14l2 6v5h-2M5 17a2 2 0 104 0 2 2 0 00-4 0zM15 17a2 2 0 104 0 2 2 0 00-4 0zM9 17h6M3 12h18',
  route: 'M6 21a3 3 0 100-6 3 3 0 000 6zM18 9a3 3 0 100-6 3 3 0 000 6zM6 15V9a4 4 0 014-4h5M9 5l-3 3M18 9v6a4 4 0 01-4 4H9',
  wallet: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H6a2 2 0 00-2 2v2M16 14h.01',
  circleUser: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 13a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM5.5 19a7 7 0 0113 0',
  helpCircle: 'M12 22a10 10 0 100-20 10 10 0 000 20zM9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01',
  badgeCheck: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  calendar: 'M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2zM16 2v4M8 2v4M3 10h18',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6'
};
const ICONS = {
  inicio: I.home, creacion: I.plus, misviajes: I.suitcase, anticipo: I.money, hospedaje: I.bed, vuelo: I.plane, comprobacion: I.fileCheck, representacion: I.receipt,
  perfil: I.user, externos: I.userPlus, 'pres-monitor': I.chart, 'pres-act': I.refresh,
  'aut-viaje': I.checkCircle, 'aut-rep': I.receipt, 'aut-comp': I.fileCheck,
  'res-hsm': I.hospital, 'res-hotel': I.hotel, 'ges-comp': I.fileCheck,
  'con-plan': I.list, 'con-ant': I.money, 'con-comp': I.fileCheck, 'con-rep': I.receipt,
  encuestas: I.survey, dashboard: I.grid, reportes: I.fileText,
  'adm-perfiles': I.users, 'adm-catalogos': I.book, 'adm-politicas': I.shield, 'adm-usuarios': I.key, 'adm-bitacora': I.history,
  'ayu-politicas': I.shield, 'ayu-guia': I.help, 'ayu-encuesta': I.survey
};
const ICON_NAMES = { inicio:'home', creacion:'plus', misviajes:'briefcase', anticipo:'dollar-sign', hospedaje:'bed', vuelo:'plane', comprobacion:'file-check', representacion:'receipt', perfil:'user', externos:'user-plus', 'pres-monitor':'bar-chart', 'pres-act':'refresh-cw', 'aut-viaje':'check-circle', 'aut-rep':'receipt', 'aut-comp':'file-check', 'res-hsm':'hospital', 'res-hotel':'hotel', 'ges-comp':'file-check', 'con-plan':'list', 'con-ant':'dollar-sign', 'con-comp':'file-check', 'con-rep':'receipt', encuestas:'message-square-dots', dashboard:'layout-grid', reportes:'file-text', 'adm-perfiles':'users', 'adm-catalogos':'book-open', 'adm-politicas':'shield', 'adm-usuarios':'key', 'adm-bitacora':'history', 'ayu-politicas':'shield', 'ayu-guia':'help-circle', 'ayu-encuesta':'message-square-dots' };

// GLYPHS = catálogo local de iconos por nombre (un solo origen para toda la interfaz; sin CDN ni dependencias externas).
// ORDEN DEL MENÚ POR ROL (solo presentación; regla 265): reordena opciones dentro de un grupo. No cambia permisos, rutas ni visibilidad.
const ROLE_MENU_ORDER = { CHC: { 'Planeación de viaje': ['creacion', 'misviajes', 'hospedaje', 'vuelo', 'anticipo', 'comprobacion', 'representacion'] } };
// COLOR FIJO POR CONCEPTO PRESUPUESTAL (regla 264): identifica la categoría, nunca la severidad (la severidad sigue en el % de PRE disponible).
// Colores definidos por el cliente para «Presupuesto de viáticos · Dirección de Capital Humano» (captura del cliente): Planeado verde · Ejercido naranja ·
// Comprometido amarillo · PRE disponible conserva su familia celeste. Son identificadores de concepto; la severidad sigue en el % de PRE disponible.
const BUDGET_CONCEPT_COLORS = { Planeado: '#A2C83A', Ejercido: '#F08A24', Comprometido: '#E9C200', 'PRE disponible': '#8DD3F0' };
window.SMV_US01 = { ROLE_MENU_ORDER, BUDGET_CONCEPT_COLORS, EXTERNALS, ROLES, ROLE_KIND, USERS, MENU, COUNTS, STATUS, HOMES, NOTICES, DEADLINES, ICONS, ICON_NAMES, GLYPHS: I };

})(); }
