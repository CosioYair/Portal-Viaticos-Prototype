if (!window.SMV_US09) { (function(){
// US-09 · APROBACIÓN DE VIAJE — datos DEMO (sintéticos; repositorio público).
// SEED = solicitudes ENVIADAS con el MISMO modelo que genera Creación (us08-data.js › SEED_REQS + sv.reqs de la sesión):
// cadena por estructura del ERP (svChain / svChainExt) guardada al enviar en cadenaIds + cadenaInfo, y DECISIONES append-only por paso
// { paso, res: 'aprobada' | 'rechazada', motivoTipo, motivo, byId, when, canal }. Nunca se sobrescriben; «resueltas por mí» se reconstruye de ellas.
// Escenarios: A 00061 normal hospital · B 00062 multidestino (origen de grupo) · C 00063 viajero externo (nivel 2) · D 00065 acompañante ·
// E 00066 contexto presupuestal (ámbar; fuera del alcance de Monitor del autorizador) · F 00067 rechazada · H 00069 escalada a CH CO por excedente.
const SEG = (n, id, label, tipo, inicio, fin, dias, noches, medio, hospedaje, comidas, extra) => ({ n, tipo, id: 'h' + id, hospId: id, label, inicio, fin, dias, noches, medio, hospedaje, comidas, hospAlim: tipo === 'hospital', ...(extra || {}) });
const RUTA = (origen, segs) => ({ origen, tramos: segs.map((s, i) => ({ n: s.n, desde: i ? { id: segs[i - 1].id, label: segs[i - 1].label } : origen, hasta: { id: s.id, label: s.label } })) });
const DEB = ref => ({ metodo: 'debito', label: 'Tarjeta de débito', origen: 'ERP', referencia: '•••• ' + ref, texto: 'Tarjeta de débito · •••• ' + ref });
const CHI = { id: 'h1114', label: 'HSM Chihuahua' }, COR = { id: 'h1100', label: 'Corporativo' };

const sA = [SEG(1, '1100', 'Corporativo', 'corporativo', '27/10/2026', '28/10/2026', 2, 1, 'Autobús', 'hotel', ['Comida', 'Cena'])];
const sB = [SEG(1, '1125', 'HSM Monterrey', 'hospital', '03/11/2026', '04/11/2026', 2, 1, 'Avión', 'hospital', ['Cena'], { horaVueloAprox: '07:10', vuelo: { tipo: 'sencillo', equipaje: 'mano' } }),
  SEG(2, '1121', 'HSM Guadalajara', 'hospital', '04/11/2026', '06/11/2026', 3, 2, 'Avión', 'hotel', ['Desayuno', 'Cena'], { horaVueloAprox: '18:40', vuelo: { tipo: 'sencillo', equipaje: 'mano' } }),
  SEG(3, '1113', 'HSM Querétaro', 'hospital', '06/11/2026', '07/11/2026', 2, 1, 'Autobús', 'hospital', ['Cena'])];
const sC = [SEG(1, '1100', 'Corporativo', 'corporativo', '29/10/2026', '30/10/2026', 2, 1, 'Autobús', 'hotel', ['Comida', 'Cena'])];
const sE = [SEG(1, '1100', 'Corporativo', 'corporativo', '20/10/2026', '22/10/2026', 3, 2, 'Avión', 'hotel', ['Desayuno', 'Comida', 'Cena'], { horaVueloAprox: '06:30', vuelo: { tipo: 'redondo', horaRegreso: '19:00', equipaje: 'mano' } })];
const sF = [SEG(1, '1104', 'HSM Ciudad Juárez', 'hospital', '15/10/2026', '16/10/2026', 2, 1, 'Auto particular', 'hospital', ['Cena'])];
const sH = [SEG(1, '1103', 'HSM Mérida', 'hospital', '09/11/2026', '14/11/2026', 6, 5, 'Avión', 'hotel', ['Desayuno', 'Cena'], { horaVueloAprox: '08:15', vuelo: { tipo: 'redondo', horaRegreso: '17:30', equipaje: 'documentado' } })];

const SEED = [
  { folio: '00061', uid: 'u07', userId: 'u07', status: 'pendAut', motivo: 'Capacitación', motivoCode: 'CAP', proyecto: '', segmentos: sA, ruta: RUTA(CHI, sA),
    gastos: [{ concepto: 'Hospedaje', importe: 1950, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 1100, origen: 'tarifa' }], dest: 'Corporativo', fechas: '27/10/2026 – 28/10/2026', nights: '2 días · 1 noche', total: 3050, hasta: false, acompanantes: [],
    pago: DEB('4418'), perfilFolio: 'Mando medio', entidad: 'HSM Chihuahua', justificacion: 'Curso de actualización en normatividad de hotelería hospitalaria con sede en Corporativo.', evidencia: [{ key: 'ev1', name: 'Convocatoria-curso-hoteleria-hospitalaria.pdf' }],
    cadena: [{ label: 'Dirección de Hospital', person: 'Ricardo Fuentes Ávila' }, { label: 'Dirección Corporativa', person: 'Mónica Herrera Luna' }], cadenaIds: ['u03', 'u04'],
    cadenaInfo: [{ ctx: 'HSM Chihuahua · director del hospital (función 80001076)' }, { ctx: 'Dirección Comercial y de Negocios · autorizador corporativo de la unidad organizativa (ZA02)' }],
    firstLabel: 'Dirección de Hospital (Ricardo Fuentes Ávila)', decisiones: [], exceso: false, excesos: [], when: '12/10/2026 09:15', at: 61 },
  { folio: '00062', uid: 'u01', userId: 'u01', status: 'pendAut', motivo: 'Proyecto', motivoCode: 'PROY', proyecto: 'Expansión comercial Noreste y Bajío', segmentos: sB, ruta: RUTA(COR, sB),
    gastos: [{ concepto: 'Hospedaje', importe: 2400, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 2900, origen: 'tarifa' }], dest: 'HSM Monterrey · HSM Guadalajara · HSM Querétaro', fechas: '03/11/2026 – 07/11/2026', nights: '5 días · 4 noches', total: 5300, hasta: false,
    acompanantes: [{ personId: 'u05', addedAt: '12/10/2026 16:32', addedBy: 'u01' }], grupo: 'G-00062', rolGrupo: 'origen', participantes: [{ personId: 'u05', folio: '00065' }],
    pago: DEB('2205'), perfilFolio: 'Mando medio', entidad: 'Dirección Comercial y de Negocios', justificacion: 'Visitas a tres unidades para presentar el programa comercial 2027 a los equipos directivos.', evidencia: [{ key: 'ev1', name: 'Agenda-visitas-comerciales-noviembre.pdf' }],
    cadena: [{ label: 'Director inmediato', person: 'Mónica Herrera Luna' }, { label: 'DGA', person: 'Pedro Medina' }], cadenaIds: ['u04', 'u06'],
    cadenaInfo: [{ ctx: 'Directora Comercial y de Negocios · grupo E ED · estructura del ERP' }, { ctx: 'Dirección General Adjunta · el director inmediato es E ED' }],
    firstLabel: 'Director inmediato (Mónica Herrera Luna)', decisiones: [], exceso: false, excesos: [], when: '12/10/2026 16:40', at: 62 },
  { folio: '00063', uid: 'x01', travelerType: 'externo', travelerId: 'x01', userId: 'u02', createdBy: 'u02', respId: 'u02', status: 'pendAut', motivo: 'Entrevista', motivoCode: null, proyecto: '', segmentos: sC,
    ruta: RUTA({ id: '', label: 'Ciudad Juárez, Chihuahua' }, sC), origenTexto: 'Ciudad Juárez, Chihuahua',
    gastos: [{ concepto: 'Hospedaje', importe: 1700, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 1300, origen: 'tarifa' }], dest: 'Corporativo', fechas: '29/10/2026 – 30/10/2026', nights: '2 días · 1 noche', total: 3000, hasta: false, acompanantes: [],
    pago: { metodo: 'corporativa', label: 'Tarjeta corporativa', origen: 'Portal', referencia: '', texto: 'Tarjeta corporativa' }, perfilFolio: 'Viajero externo', entidad: 'HSM Chihuahua',
    justificacion: 'Segunda entrevista de la candidata con el comité de selección de la Gerencia de Estrategias Comerciales.', evidencia: [{ key: 'ev1', name: 'Citatorio-entrevista-comite.pdf' }],
    cadena: [{ label: 'Autorizador primer nivel', person: 'Mónica Herrera Luna' }, { label: 'Capital Humano Corporativo', person: 'Alfredo Cacho' }], cadenaIds: ['u04', 'u05'],
    cadenaInfo: [{ ctx: 'Directora Comercial y de Negocios · asignado en el registro del externo' }, { ctx: 'Cadena de autorización de viajeros externos' }],
    firstLabel: 'Autorizador primer nivel (Mónica Herrera Luna)', decisiones: [{ paso: 0, res: 'aprobada', byId: 'u04', when: '10/10/2026 11:20', canal: 'Portal web · escritorio' }], exceso: false, excesos: [], when: '09/10/2026 10:05', at: 63 },
  { folio: '00065', uid: 'u05', userId: 'u05', status: 'pendAut', motivo: 'Proyecto', motivoCode: 'PROY', proyecto: 'Expansión comercial Noreste y Bajío', segmentos: sB, ruta: RUTA(COR, sB),
    gastos: [{ concepto: 'Hospedaje', importe: 2400, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 3300, origen: 'tarifa' }], dest: 'HSM Monterrey · HSM Guadalajara · HSM Querétaro', fechas: '03/11/2026 – 07/11/2026', nights: '5 días · 4 noches', total: 5700, hasta: false, acompanantes: [],
    grupo: 'G-00062', rolGrupo: 'acompanante', origenFolio: '00062', origenUid: 'u01', pago: DEB('7731'), perfilFolio: 'Director', entidad: 'Dirección de Capital Humano', justificacion: 'Acompaña las visitas comerciales para presentar el plan de capital humano 2027 a los equipos directivos.', evidencia: [{ key: 'ev1', name: 'Agenda-visitas-comerciales-noviembre.pdf' }],
    cadena: [{ label: 'Director inmediato', person: 'Pedro Medina' }], cadenaIds: ['u06'], cadenaInfo: [{ ctx: 'Director General Adjunto · grupo E ED · estructura del ERP' }],
    firstLabel: 'Director inmediato (Pedro Medina)', decisiones: [], exceso: false, excesos: [], when: '13/10/2026 08:30', at: 65 },
  { folio: '00066', uid: 'u03', userId: 'u03', status: 'pendAut', motivo: 'Reunión comité', motivoCode: 'COM', proyecto: '', segmentos: sE, ruta: RUTA(CHI, sE),
    gastos: [{ concepto: 'Hospedaje', importe: 4800, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 3150, origen: 'tarifa' }], dest: 'Corporativo', fechas: '20/10/2026 – 22/10/2026', nights: '3 días · 2 noches', total: 7950, hasta: false, acompanantes: [],
    pago: DEB('9054'), perfilFolio: 'Director', entidad: 'HSM Chihuahua', justificacion: 'Comité trimestral de operación hospitalaria y revisión del presupuesto de la unidad.', evidencia: [{ key: 'ev1', name: 'Convocatoria-comite-operacion-hospitalaria-Q4.pdf' }],
    cadena: [{ label: 'Dirección Corporativa', person: 'Mónica Herrera Luna' }], cadenaIds: ['u04'], cadenaInfo: [{ ctx: 'Dirección Comercial y de Negocios · autorizador corporativo de la unidad organizativa (ZA02) · el viajero es el director del hospital' }],
    firstLabel: 'Dirección Corporativa (Mónica Herrera Luna)', decisiones: [], exceso: false, excesos: [], when: '11/10/2026 13:10', at: 60 },
  { folio: '00067', uid: 'u07', userId: 'u07', status: 'rechazada', motivo: 'Operación', motivoCode: 'OPER', proyecto: '', segmentos: sF, ruta: RUTA(CHI, sF),
    gastos: [{ concepto: 'Hospedaje', importe: 0, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 800, origen: 'tarifa' }, { concepto: 'Gasolina', importe: 900, origen: 'captura', segmento: 1 }, { concepto: 'Casetas', importe: 450, origen: 'captura', segmento: 1 }],
    dest: 'HSM Ciudad Juárez', fechas: '15/10/2026 – 16/10/2026', nights: '2 días · 1 noche', total: 2150, hasta: false, acompanantes: [], pago: DEB('4418'), perfilFolio: 'Mando medio', entidad: 'HSM Chihuahua',
    justificacion: 'Apoyo a la apertura del área de hospedaje de HSM Ciudad Juárez.', evidencia: [{ key: 'preaut', name: 'Preautorizacion-DGA-HSM-a-HSM-2026-031.pdf' }],
    cadena: [{ label: 'Dirección de Hospital', person: 'Ricardo Fuentes Ávila' }, { label: 'Dirección Corporativa', person: 'Mónica Herrera Luna' }], cadenaIds: ['u03', 'u04'],
    cadenaInfo: [{ ctx: 'HSM Chihuahua · director del hospital (función 80001076)' }, { ctx: 'Dirección Comercial y de Negocios · autorizador corporativo de la unidad organizativa (ZA02)' }],
    firstLabel: 'Dirección de Hospital (Ricardo Fuentes Ávila)', motivoRechazo: 'Fechas no convenientes para la operación · Las fechas coinciden con la auditoría interna del hospital; reprogramar después del 20/10.',
    decisiones: [{ paso: 0, res: 'rechazada', motivoTipo: 'Fechas no convenientes para la operación', motivo: 'Las fechas coinciden con la auditoría interna del hospital; reprogramar después del 20/10.', byId: 'u03', when: '06/10/2026 17:45', canal: 'Portal web · teléfono' }],
    exceso: false, excesos: [], when: '05/10/2026 12:00', at: 57 },
  { folio: '00069', uid: 'u04', userId: 'u04', status: 'pendAut', motivo: 'Proyecto', motivoCode: 'PROY', proyecto: 'Apertura comercial Sureste', segmentos: sH, ruta: RUTA(COR, sH),
    gastos: [{ concepto: 'Hospedaje', importe: 11500, origen: 'tarifa' }, { concepto: 'Alimentos', importe: 6300, origen: 'tarifa' }, { concepto: 'Tintorería', importe: 600, origen: 'tarifa' }], dest: 'HSM Mérida', fechas: '09/11/2026 – 14/11/2026', nights: '6 días · 5 noches', total: 18400, hasta: false, acompanantes: [],
    pago: DEB('3170'), perfilFolio: 'Director', entidad: 'Dirección Comercial y de Negocios', justificacion: 'Arranque del programa comercial con los socios médicos de la región Sureste; la agenda exige permanecer la semana completa.',
    evidencia: [{ key: 'exc', name: 'Autorizacion-excedente-noches-semana.pdf' }],
    cadena: [{ label: 'Director inmediato', person: 'Pedro Medina' }, { label: 'Capital Humano Corporativo', person: 'Alfredo Cacho' }], cadenaIds: ['u06', 'u05'],
    cadenaInfo: [{ ctx: 'Director General Adjunto · grupo E ED · estructura del ERP' }, { ctx: 'Escalamiento por excepción de límites del perfil', kind: 'esc', causa: 'excedente' }],
    firstLabel: 'Director inmediato (Pedro Medina)', decisiones: [{ paso: 0, res: 'aprobada', byId: 'u06', when: '12/10/2026 10:30', canal: 'Portal web · escritorio' }],
    exceso: true, excesos: ['Noches por semana: el perfil Director permite 3 noches por semana; la solicitud tiene 5.'], when: '11/10/2026 09:00', at: 59 }
];

// Decisiones de folios históricos (mismo actor y fecha que su movimiento «Reserva» en uspres-data.js): base del historial «resueltas por mí».
const HISTORIAL = [
  { folio: '00043', uid: 'u01', byId: 'u04', res: 'aprobada', when: '10/06/2026 16:25', paso: 0, pasos: 1, label: 'Dirección Corporativa', destino: 'HSM Chihuahua', fechas: '15/06/2026 – 18/06/2026', motivo: 'Operación', total: 9090, enviada: '09/06/2026 11:40', canal: 'Portal web · escritorio', perfil: 'Mando medio' },
  { folio: '00048', uid: 'u04', byId: 'u06', res: 'aprobada', when: '12/06/2026 17:05', paso: 0, pasos: 1, label: 'Director inmediato', destino: 'HSM Monterrey', fechas: '06/07/2026 – 07/07/2026', motivo: 'Reunión comité', total: 6300, enviada: '12/06/2026 09:20', canal: 'Portal web · escritorio', perfil: 'Director' }
];

// Opciones rápidas del rechazo (la historia pide «opciones rápidas + texto libre»; catálogo DEMO, el definitivo es decisión del cliente).
const MOTIVOS_RECHAZO = ['Fechas no convenientes para la operación', 'Viaje no justificado para la operación', 'Presupuesto de la unidad comprometido para otras prioridades', 'Información de la solicitud incompleta o incorrecta', 'Otro motivo'];
// Atención: días desde que el paso llegó al autorizador a partir de los cuales la antigüedad se resalta (vista de Bitácora «más de 3 días»).
const PARAMS = { diasAtencion: 3, motivoMax: 500 };

window.SMV_US09 = { SEED, HISTORIAL, MOTIVOS_RECHAZO, PARAMS };
})(); }
