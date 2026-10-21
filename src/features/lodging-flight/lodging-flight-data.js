if (!window.SMV_HV) { (function(){
// US-11 + US-12 + US-13 · HOSPEDAJE Y VUELO — datos DEMO (sintéticos; repositorio público). REVIEW MODE · SYNC PENDING.
// UNA sola función integrada: el viajero solicita (US-11), Hotelería HSM valida su unidad (US-12) y Viáticos gestiona hotel externo y vuelo (US-13)
// sobre el MISMO registro canónico por folio (RECS). Nunca se copia el viaje: fechas, destinos, medio y tipo de hospedaje salen de la solicitud aprobada.
const SEG = (n, id, label, tipo, inicio, fin, dias, noches, medio, hospedaje, comidas, extra) => ({ n, tipo, id: 'h' + id, hospId: id, label, inicio, fin, dias, noches, medio, hospedaje, comidas, hospAlim: tipo === 'hospital', ...(extra || {}) });
const RUTA = (origen, segs) => ({ origen, tramos: segs.map((s, i) => ({ n: s.n, desde: i ? { id: segs[i - 1].id, label: segs[i - 1].label } : origen, hasta: { id: s.id, label: s.label } })) });
const DEB = ref => ({ metodo: 'debito', label: 'Tarjeta de débito', origen: 'ERP', referencia: '•••• ' + ref, texto: 'Tarjeta de débito · •••• ' + ref });
const CHI = { id: 'h1114', label: 'HSM Chihuahua' }, COR = { id: 'h1100', label: 'Corporativo' };
const AV = (h, r, t) => ({ horaVueloAprox: h, vuelo: { tipo: t || 'redondo', horaRegreso: r, equipaje: 'mano' } });
const G = (h, a, v) => [{ concepto: 'Hospedaje', importe: h, origen: 'tarifa' }, { concepto: 'Alimentos', importe: a, origen: 'tarifa' }].concat(v ? [{ concepto: 'Vuelos', importe: v, origen: 'ref' }] : []);
const CH_HOSP = { cadena: [{ label: 'Dirección de Hospital', person: 'Ricardo Fuentes Ávila' }, { label: 'Dirección Corporativa', person: 'Mónica Herrera Luna' }], cadenaIds: ['u03', 'u04'],
  cadenaInfo: [{ ctx: 'HSM Chihuahua · director del hospital (función 80001076)' }, { ctx: 'Dirección Comercial y de Negocios · autorizador corporativo de la unidad organizativa (ZA02)' }], firstLabel: 'Dirección de Hospital (Ricardo Fuentes Ávila)' };
const CH_U01 = { cadena: [{ label: 'Director inmediato', person: 'Mónica Herrera Luna' }, { label: 'DGA', person: 'Pedro Medina' }], cadenaIds: ['u04', 'u06'],
  cadenaInfo: [{ ctx: 'Directora Comercial y de Negocios · grupo E ED · estructura del ERP' }, { ctx: 'Dirección General Adjunta · el director inmediato es E ED' }], firstLabel: 'Director inmediato (Mónica Herrera Luna)' };
const CH_U13 = { cadena: [{ label: 'Director inmediato', person: 'Claudia Reyna Ortega' }], cadenaIds: ['u10'], cadenaInfo: [{ ctx: 'Coordinadora de Tesorería · estructura del ERP' }], firstLabel: 'Director inmediato (Claudia Reyna Ortega)' };
const CH_U04 = { cadena: [{ label: 'DGA', person: 'Pedro Medina' }], cadenaIds: ['u06'], cadenaInfo: [{ ctx: 'Dirección General Adjunta · director E ED' }], firstLabel: 'DGA (Pedro Medina)' };
const OK2 = (a, b, w1, w2) => [{ paso: 0, res: 'aprobada', byId: a, when: w1, canal: 'Portal web · escritorio' }, { paso: 1, res: 'aprobada', byId: b, when: w2, canal: 'Portal web · escritorio' }];
const OK1 = (a, w1) => [{ paso: 0, res: 'aprobada', byId: a, when: w1, canal: 'Portal web · escritorio' }];
const R = (o) => ({ status: 'aprobada', proyecto: '', acompanantes: [], hasta: false, exceso: false, excesos: [], evidencia: [], ...o, userId: o.userId || o.uid });

const s91 = [SEG(1, '1114', 'HSM Chihuahua', 'hospital', '26/10/2026', '29/10/2026', 4, 3, 'Avión', 'hospital', ['Comida', 'Cena'], AV('07:20', '18:30'))];
const s92 = [SEG(1, '1100', 'Corporativo', 'corporativo', '09/11/2026', '11/11/2026', 3, 2, 'Avión', 'hotel', ['Desayuno', 'Comida', 'Cena'], AV('06:40', '19:00'))];
const s93 = [SEG(1, '1125', 'HSM Monterrey', 'hospital', '23/11/2026', '25/11/2026', 3, 2, 'Avión', 'hospital', ['Comida', 'Cena'], AV('07:00', '18:00'))];
const s94 = [SEG(1, '1114', 'HSM Chihuahua', 'hospital', '18/10/2026', '19/10/2026', 2, 1, 'Autobús', 'hospital', ['Cena'])];
const s95 = [SEG(1, '1114', 'HSM Chihuahua', 'hospital', '09/11/2026', '10/11/2026', 2, 1, 'Autobús', 'hospital', ['Cena'])];
const s96 = [SEG(1, '1121', 'HSM Guadalajara', 'hospital', '10/11/2026', '12/11/2026', 3, 2, 'Avión', 'hotel', ['Comida', 'Cena'], AV('07:30', '19:30'))];
const s97 = [SEG(1, '1114', 'HSM Chihuahua', 'hospital', '27/10/2026', '28/10/2026', 2, 1, 'Autobús', 'hospital', ['Comida'])];
const s98 = [SEG(1, '1114', 'HSM Chihuahua', 'hospital', '14/12/2026', '16/12/2026', 3, 2, 'Avión', 'hospital', ['Comida', 'Cena'], AV('07:20', '18:30'))];
const s99 = [SEG(1, '1114', 'HSM Chihuahua', 'hospital', '07/12/2026', '09/12/2026', 3, 2, 'Autobús', 'hospital', ['Cena'])];
const s100 = [SEG(1, '1103', 'HSM Mérida', 'hospital', '30/11/2026', '01/12/2026', 2, 1, 'Avión', 'hotel', ['Comida', 'Cena'], AV('06:30', '20:10'))];

const SEED_REQS = [
  // A · Elizabeth: viaje aprobado, hospedaje y vuelo POR SOLICITAR (etapa recién habilitada; Inicio «Confirma hospedaje y vuelo»).
  R({ folio: '00091', uid: 'u01', motivo: 'Operación', motivoCode: 'OPER', segmentos: s91, ruta: RUTA(COR, s91), gastos: G(0, 2600, 5500), dest: 'HSM Chihuahua', fechas: '26/10/2026 – 29/10/2026', nights: '4 días · 3 noches', total: 2600,
    pago: DEB('4417'), perfilFolio: 'Mando medio', entidad: 'Dirección Comercial y de Negocios', justificacion: 'Seguimiento del plan comercial con el equipo directivo de HSM Chihuahua.', ...CH_U01,
    decisiones: OK2('u04', 'u06', '13/10/2026 12:10', '14/10/2026 09:40'), when: '12/10/2026 10:30', at: 99 }),
  // B · Laura: destino Corporativo (sin unidad hospitalaria) → hotel por política; Viáticos gestiona el hotel y prepara opciones de vuelo.
  R({ folio: '00092', uid: 'u02', motivo: 'Reunión comité', motivoCode: 'COM', segmentos: s92, ruta: RUTA(CHI, s92), gastos: G(3600, 2730, 5500), dest: 'Corporativo', fechas: '09/11/2026 – 11/11/2026', nights: '3 días · 2 noches', total: 6330,
    pago: DEB('8802'), perfilFolio: 'Mando medio', entidad: 'HSM Chihuahua', justificacion: 'Comité corporativo de Capital Humano 2027.', ...CH_HOSP,
    decisiones: OK2('u03', 'u04', '12/10/2026 11:00', '13/10/2026 10:15'), when: '11/10/2026 09:10', at: 88 }),
  // C · Elizabeth: HSM Monterrey sin disponibilidad → hotel externo (Viáticos); rechazó la 1.ª ronda de vuelos y tiene una 2.ª por elegir.
  R({ folio: '00093', uid: 'u01', motivo: 'Capacitación', motivoCode: 'CAP', segmentos: s93, ruta: RUTA(COR, s93), gastos: G(0, 1950, 5500), dest: 'HSM Monterrey', fechas: '23/11/2026 – 25/11/2026', nights: '3 días · 2 noches', total: 1950,
    pago: DEB('4417'), perfilFolio: 'Mando medio', entidad: 'Dirección Comercial y de Negocios', justificacion: 'Capacitación comercial al equipo de HSM Monterrey.', ...CH_U01,
    decisiones: OK2('u04', 'u06', '05/10/2026 12:00', '06/10/2026 09:00'), when: '04/10/2026 10:00', at: 89 }),
  // D · María: llegada en menos de 72 h (caso urgente) → Hotelería HSM Chihuahua lo ve resaltado.
  R({ folio: '00094', uid: 'u13', motivo: 'Operación', motivoCode: 'OPER', segmentos: s94, ruta: RUTA(COR, s94), gastos: G(0, 450), dest: 'HSM Chihuahua', fechas: '18/10/2026 – 19/10/2026', nights: '2 días · 1 noche', total: 450,
    pago: DEB('2210'), perfilFolio: 'Operativo', entidad: 'Corporativo', justificacion: 'Cierre contable presencial del mes.', ...CH_U13, decisiones: OK1('u10', '14/10/2026 17:00'), when: '14/10/2026 09:00', at: 80 }),
  // E · María: solicitud TOMADA por otro usuario de Hotelería HSM Chihuahua (concurrencia).
  R({ folio: '00095', uid: 'u13', motivo: 'Operación', motivoCode: 'OPER', segmentos: s95, ruta: RUTA(COR, s95), gastos: G(0, 450), dest: 'HSM Chihuahua', fechas: '09/11/2026 – 10/11/2026', nights: '2 días · 1 noche', total: 450,
    pago: DEB('2210'), perfilFolio: 'Operativo', entidad: 'Corporativo', justificacion: 'Revisión de comprobaciones del hospital.', ...CH_U13, decisiones: OK1('u10', '13/10/2026 12:00'), when: '12/10/2026 13:00', at: 79 }),
  // F · Mónica (Director · hotel): hotel externo ASIGNADO; eligió su vuelo → Viáticos registra la compra y confirma.
  R({ folio: '00096', uid: 'u04', motivo: 'Reunión comité', motivoCode: 'COM', segmentos: s96, ruta: RUTA(COR, s96), gastos: G(4400, 1950, 5500), dest: 'HSM Guadalajara', fechas: '10/11/2026 – 12/11/2026', nights: '3 días · 2 noches', total: 6350,
    pago: DEB('7720'), perfilFolio: 'Director', entidad: 'Dirección Comercial y de Negocios', justificacion: 'Comité regional de negocios de Occidente.', ...CH_U04, decisiones: OK1('u06', '07/10/2026 10:00'), when: '06/10/2026 12:00', at: 81 }),
  // G · Externa Mariana (registrada por Capital Humano HSM): hospedaje en la unidad CONFIRMADO, habitación 214.
  R({ folio: '00097', uid: 'x01', travelerType: 'externo', travelerId: 'x01', userId: 'u02', createdBy: 'u02', respId: 'u02', motivo: 'Entrevista', motivoCode: null, segmentos: s97, ruta: RUTA({ id: '', label: 'Ciudad Juárez, Chihuahua' }, s97), origenTexto: 'Ciudad Juárez, Chihuahua',
    gastos: G(0, 300), dest: 'HSM Chihuahua', fechas: '27/10/2026 – 28/10/2026', nights: '2 días · 1 noche', total: 300, pago: { metodo: 'noAplica', label: 'No aplica', origen: '', referencia: '', texto: 'No aplica · sin hotel externo' }, perfilFolio: 'Viajero externo', entidad: 'HSM Chihuahua',
    justificacion: 'Entrevista final para la jefatura de enfermería.', cadena: [{ label: 'Autorizador primer nivel', person: 'Arturo Villaseñor Peña' }, { label: 'Capital Humano Corporativo', person: 'Alfredo Cacho' }], cadenaIds: ['dcw02', 'u05'],
    cadenaInfo: [{ ctx: 'Director de Operaciones Corporativas · asignado en el registro del externo' }, { ctx: 'Cadena de autorización de viajeros externos' }], firstLabel: 'Autorizador primer nivel (Arturo Villaseñor Peña)',
    decisiones: OK2('dcw02', 'u05', '09/10/2026 12:00', '10/10/2026 10:00'), when: '08/10/2026 11:15', at: 78 }),
  // H · Elizabeth: etapa COMPLETA (habitación confirmada + vuelo confirmado con itinerario).
  R({ folio: '00098', uid: 'u01', motivo: 'Operación', motivoCode: 'OPER', segmentos: s98, ruta: RUTA(COR, s98), gastos: G(0, 1950, 5500), dest: 'HSM Chihuahua', fechas: '14/12/2026 – 16/12/2026', nights: '3 días · 2 noches', total: 1950,
    pago: DEB('4417'), perfilFolio: 'Mando medio', entidad: 'Dirección Comercial y de Negocios', justificacion: 'Cierre anual del plan comercial con HSM Chihuahua.', ...CH_U01,
    decisiones: OK2('u04', 'u06', '25/09/2026 12:00', '26/09/2026 09:00'), when: '24/09/2026 10:00', at: 74 }),
  // I · María: hospedaje CANCELADO por la viajera → reflejado en la bandeja de Hotelería (constancia de enterado pendiente).
  R({ folio: '00099', uid: 'u13', motivo: 'Operación', motivoCode: 'OPER', segmentos: s99, ruta: RUTA(COR, s99), gastos: G(0, 675), dest: 'HSM Chihuahua', fechas: '07/12/2026 – 09/12/2026', nights: '3 días · 2 noches', total: 675,
    pago: DEB('2210'), perfilFolio: 'Operativo', entidad: 'Corporativo', justificacion: 'Inventario anual del hospital.', ...CH_U13, decisiones: OK1('u10', '01/10/2026 12:00'), when: '30/09/2026 13:00', at: 75 }),
  // J · Mónica: hotel externo por política + vuelo por preparar; folio TOMADO por otra analista de Viáticos (concurrencia).
  R({ folio: '00100', uid: 'u04', motivo: 'Operación', motivoCode: 'OPER', segmentos: s100, ruta: RUTA(COR, s100), gastos: G(2200, 1300, 5500), dest: 'HSM Mérida', fechas: '30/11/2026 – 01/12/2026', nights: '2 días · 1 noche', total: 3500,
    pago: DEB('7720'), perfilFolio: 'Director', entidad: 'Dirección Comercial y de Negocios', justificacion: 'Visita a la operación comercial del Sureste.', ...CH_U04, decisiones: OK1('u06', '12/10/2026 10:00'), when: '11/10/2026 12:00', at: 82 })
];

// Aeropuertos por destino (para construir la ruta de las opciones; dato demo).
const AEROP = { 'Corporativo': 'MEX', 'HSM Chihuahua': 'CUU', 'HSM Monterrey': 'MTY', 'HSM Guadalajara': 'GDL', 'HSM Mérida': 'MID', 'HSM Querétaro': 'QRO', 'Ciudad Juárez, Chihuahua': 'CJS' };
const OP = (id, aerolinea, ida, reg, equipaje, tarifa) => ({ id, aerolinea, ida, reg, equipaje, tarifa });
const T = (vuelo, sale, llega, escalas) => ({ vuelo, sale, llega, escalas });
const EQ = ['Solo equipaje de mano (10 kg)', 'Mano + 1 maleta documentada (25 kg)', 'Mano + 2 maletas documentadas (25 kg c/u)'];

// REGISTRO CANÓNICO de hospedaje y vuelo por folio. hos[] = una solicitud por destino con noches:
// via HOS (unidad hospitalaria · Hotelería HSM) | HOT (hotel externo · Viáticos). estado HOS: pendAut · aprobada · escHC · rechazada · cancelada.
// Cliente 2026-10-20: TODA habitación de unidad hospitalaria es INDIVIDUAL. Cadena: Hotelería HSM → (rechazo) Hotelería Corporativo (escHC, hc{}) → (rechazo) Viáticos.
// hc.estado: pend · aprobada · rechazada (decisión de Hotelería Corporativo; al confirmar, la decisión de HSM pasa a rechHSM). rechazada = rechazada por HSM Y por Corporativo.
// hot.estado: enProceso · asignado · cancelado · rechazadoVia; hot.causa: politica (la planeación aprobada ya dice «hotel») | rechazoHSM (escalamiento tras el rechazo de HSM y de Corporativo).
// vue.estado: pendAsig · asignado · rechazado · pagado · confirmado · rechazadoVia. rondas[] se conservan (nunca se sobrescriben).
const RECS = [
  { folio: '00092', uid: 'u02',
    hos: [{ n: 1, via: 'HOT', unidad: 'Corporativo', entrada: '09/11/2026', salida: '11/11/2026', noches: 2, habTipo: 'Individual', obs: '', enviado: '14/10/2026 10:05', byId: 'u02', hot: { estado: 'enProceso', causa: 'politica', desde: '14/10/2026 10:05' } }],
    vue: { estado: 'pendAsig', config: 'redondo', datos: { nac: '22/07/1986', nacionalidad: 'Mexicana', equipaje: EQ[1] }, enviado: '14/10/2026 10:06', byId: 'u02', rondas: [] } },
  { folio: '00093', uid: 'u01',
    hos: [{ n: 1, via: 'HOS', unidad: 'HSM Monterrey', entrada: '23/11/2026', salida: '25/11/2026', noches: 2, habTipo: 'Individual', obs: '', enviado: '07/10/2026 09:00', byId: 'u01', estado: 'escHC',
      decision: { res: 'rechazada', when: '08/10/2026 12:30', byId: 'hh-mty', byName: 'Jorge Salinas Treviño', motivoTipo: 'Sin habitaciones disponibles en las fechas', motivo: 'Ocupación completa por la jornada médica regional.' },
      hc: { estado: 'pend', desde: '08/10/2026 12:30' } }],
    vue: { estado: 'asignado', config: 'redondo', datos: { nac: '03/02/1988', nacionalidad: 'Mexicana', equipaje: EQ[0] }, enviado: '07/10/2026 09:02', byId: 'u01',
      rondas: [
        { n: 1, when: '09/10/2026 11:00', byId: 'u09', vigencia: '10/10/2026 11:00', ops: [OP('r1a', 'Volaris', T('Y4 1211', '05:50', '07:25', 'Directo'), T('Y4 1214', '22:10', '23:45', 'Directo'), EQ[0], 3980), OP('r1b', 'Viva Aerobus', T('VB 3012', '06:15', '07:50', 'Directo'), T('VB 3019', '21:30', '23:05', 'Directo'), EQ[0], 3640)],
          rechazo: { when: '09/10/2026 18:20', byId: 'u01', motivoTipo: 'Horario no compatible con mi agenda', motivo: 'La agenda inicia a las 8:00 en HSM Monterrey; los regresos después de las 21:00 no me permiten volver el mismo día.' } },
        { n: 2, when: '14/10/2026 10:30', byId: 'u09', vigencia: '20/10/2026 10:30', ops: [OP('r2a', 'Aeroméxico', T('AM 902', '07:00', '08:35', 'Directo'), T('AM 919', '18:05', '19:40', 'Directo'), EQ[1], 5320), OP('r2b', 'Volaris', T('Y4 1213', '07:40', '09:15', 'Directo'), T('Y4 1216', '17:30', '19:05', 'Directo'), EQ[0], 4410), OP('r2c', 'Viva Aerobus', T('VB 3014', '06:55', '10:20', '1 escala (GDL)'), T('VB 3021', '18:40', '20:15', 'Directo'), EQ[1], 3890)] }] } },
  { folio: '00094', uid: 'u13',
    hos: [{ n: 1, via: 'HOS', unidad: 'HSM Chihuahua', entrada: '18/10/2026', salida: '19/10/2026', noches: 1, habTipo: 'Individual', obs: 'Llego en autobús alrededor de las 19:00.', enviado: '15/10/2026 08:40', byId: 'u13', estado: 'pendAut', urgente: true }] },
  { folio: '00095', uid: 'u13',
    hos: [{ n: 1, via: 'HOS', unidad: 'HSM Chihuahua', entrada: '09/11/2026', salida: '10/11/2026', noches: 1, habTipo: 'Individual', obs: '', enviado: '13/10/2026 09:15', byId: 'u13', estado: 'pendAut', lock: { byId: 'hh-chi2', byName: 'Gabriela Ochoa Ruiz', when: '16/10/2026 08:10' } }] },
  { folio: '00096', uid: 'u04',
    hos: [{ n: 1, via: 'HOT', unidad: 'HSM Guadalajara', entrada: '10/11/2026', salida: '12/11/2026', noches: 2, habTipo: 'Individual', obs: '', enviado: '08/10/2026 10:00', byId: 'u04',
      hot: { estado: 'asignado', causa: 'politica', desde: '08/10/2026 10:00', hotel: 'Hotel Real Minerva Guadalajara', hotelId: 'ht-gdl1', direccion: 'Av. Vallarta 3045, Vallarta Poniente, Guadalajara, Jal.', habitacion: 'Individual', desayuno: true, tarifa: 2150, tope: 2200, reserva: { name: 'Reserva-RealMinerva-00096.pdf', meta: 'PDF · 214 KB' }, when: '10/10/2026 13:20', byId: 'u09' } }],
    vue: { estado: 'asignado', config: 'redondo', datos: { nac: '12/05/1975', nacionalidad: 'Mexicana', equipaje: EQ[1] }, enviado: '08/10/2026 10:01', byId: 'u04',
      rondas: [{ n: 1, when: '11/10/2026 09:00', byId: 'u09', vigencia: '18/10/2026 09:00', ops: [OP('g1a', 'Aeroméxico', T('AM 222', '07:30', '09:05', 'Directo'), T('AM 237', '19:30', '21:05', 'Directo'), EQ[1], 5480), OP('g1b', 'Volaris', T('Y4 822', '08:10', '09:40', 'Directo'), T('Y4 829', '20:05', '21:35', 'Directo'), EQ[0], 4120)] }],
      sel: { ronda: 1, opId: 'g1a', when: '12/10/2026 08:45', byId: 'u04' } } },
  { folio: '00097', uid: 'x01',
    hos: [{ n: 1, via: 'HOS', unidad: 'HSM Chihuahua', entrada: '27/10/2026', salida: '28/10/2026', noches: 1, habTipo: 'Individual', obs: '', enviado: '10/10/2026 12:00', byId: 'u02', estado: 'aprobada',
      decision: { res: 'aprobada', hab: '214', when: '11/10/2026 10:20', byId: 'u07', coment: 'Habitación lista desde las 13:00.' } }] },
  { folio: '00098', uid: 'u01',
    hos: [{ n: 1, via: 'HOS', unidad: 'HSM Chihuahua', entrada: '14/12/2026', salida: '16/12/2026', noches: 2, habTipo: 'Individual', obs: '', enviado: '27/09/2026 09:00', byId: 'u01', estado: 'aprobada',
      decision: { res: 'aprobada', hab: '301', when: '28/09/2026 11:00', byId: 'u07' } }],
    vue: { estado: 'confirmado', config: 'redondo', datos: { nac: '03/02/1988', nacionalidad: 'Mexicana', equipaje: EQ[0] }, enviado: '27/09/2026 09:02', byId: 'u01',
      rondas: [{ n: 1, when: '29/09/2026 10:00', byId: 'u09', vigencia: '06/10/2026 10:00', ops: [OP('c1a', 'Aeroméxico', T('AM 2417', '07:20', '09:05', 'Directo'), T('AM 2420', '18:30', '20:20', 'Directo'), EQ[0], 5260), OP('c1b', 'Volaris', T('Y4 1530', '06:05', '07:50', 'Directo'), T('Y4 1533', '21:10', '22:55', 'Directo'), EQ[0], 4380)] }],
      sel: { ronda: 1, opId: 'c1a', when: '30/09/2026 09:15', byId: 'u01' }, compra: { when: '01/10/2026 12:00', byId: 'u09', costo: 5260, comprobante: { name: 'Factura-AM-00098.pdf', meta: 'PDF · 188 KB' } },
      confirm: { when: '02/10/2026 10:40', byId: 'u09', localizador: 'QXK7LM', itinerario: { name: 'Itinerario-00098.pdf', meta: 'PDF · 96 KB' } },
      // Cliente 2026-10-20 (audio): Viáticos registra el concepto «Vuelo» con su factura en la COMPROBACIÓN del colaborador (factura DEMO sin datos fiscales reales).
      factura: { name: 'Factura-Vuelo-00098-DEMO.pdf', xml: 'Factura-Vuelo-00098-DEMO.xml', meta: 'PDF · 188 KB', importe: 5260, when: '02/10/2026 11:05', byId: 'u09' } } },
  { folio: '00099', uid: 'u13',
    hos: [{ n: 1, via: 'HOS', unidad: 'HSM Chihuahua', entrada: '07/12/2026', salida: '09/12/2026', noches: 2, habTipo: 'Individual', obs: '', enviado: '02/10/2026 10:00', byId: 'u13', estado: 'cancelada',
      decision: { res: 'aprobada', hab: '215', when: '03/10/2026 09:00', byId: 'u07' }, cancel: { when: '15/10/2026 16:20', byId: 'u13', por: 'Colaborador', motivo: 'El inventario se realizará de forma remota.' } }] },
  { folio: '00100', uid: 'u04', lockVia: { byId: 'via-2', byName: 'Rosa Martínez Lugo', when: '16/10/2026 08:30' },
    hos: [{ n: 1, via: 'HOT', unidad: 'HSM Mérida', entrada: '30/11/2026', salida: '01/12/2026', noches: 1, habTipo: 'Individual', obs: '', enviado: '13/10/2026 10:00', byId: 'u04', hot: { estado: 'enProceso', causa: 'politica', desde: '13/10/2026 10:00' } }],
    vue: { estado: 'pendAsig', config: 'redondo', datos: { nac: '12/05/1975', nacionalidad: 'Mexicana', equipaje: EQ[1] }, enviado: '13/10/2026 10:01', byId: 'u04', rondas: [] } }
];

// PARÁMETROS GLOBALES (historia): antelación de la solicitud de hospedaje 72 h · cancelación 24 h · vigencia de las opciones de vuelo (demo).
const PARAMS = { antelacionHoras: 72, cancelacionHoras: 24, vigenciaOpcionesHoras: 72, minOpciones: 2, motivoMax: 500 };
const CONFIG_VUELO = [['redondo', 'Ida y vuelta'], ['ida', 'Solo ida'], ['regreso', 'Solo regreso']];
const AEROLINEAS = ['Aeroméxico', 'Volaris', 'Viva Aerobus'];
const ESCALAS = ['Directo', '1 escala', '2 escalas'];
// Catálogos DEMO (la historia pide «catálogo + texto libre»; el catálogo oficial es decisión del cliente).
// CATÁLOGO CANÓNICO «Motivos de rechazo de hospedaje» (Hotelería HSM y Hotelería Corporativo lo consumen). Valores DEMO: el catálogo oficial está PENDIENTE de configuración del cliente.
const CATALOGOS = { motivosRechazoHospedaje: { id: 'motivos-rechazo-hospedaje', nombre: 'Motivos de rechazo de hospedaje', estado: 'Demo · pendiente de configuración del cliente', otro: 'Otro motivo',
  items: ['Sin habitaciones disponibles en las fechas', 'Habitaciones en mantenimiento', 'Ocupación por evento institucional', 'Otro motivo'] } };
const MOTIVOS_RECHAZO_HSM = CATALOGOS.motivosRechazoHospedaje.items;
const HABITACION_HSM = 'Individual';
const MOTIVOS_RECHAZO_VUELO = ['Horario no compatible con mi agenda', 'Demasiadas escalas o conexiones', 'Duración total del viaje', 'Equipaje no incluido', 'Otro motivo'];
// Política de canalización entre unidades cercanas (historia: HIP ↔ ROM, TLN ↔ LPA). Nombres oficiales de ROM / TLN / LPA: pendiente del cliente.
const CANALIZACION = [['HIP', 'ROM'], ['TLN', 'LPA']];
// Hoteles de convenio (catálogo de US-24, DEMO) por destino. tarifa = tarifa de convenio por noche (referencia para Viáticos).
const HOTELES = [
  { id: 'ht-mex1', destino: 'Corporativo', nombre: 'Hotel Galería Plaza Reforma', direccion: 'Hamburgo 195, Juárez, Cuauhtémoc, Ciudad de México', tarifa: 1780 },
  { id: 'ht-mex2', destino: 'Corporativo', nombre: 'City Express Plus Insurgentes Sur', direccion: 'Av. Insurgentes Sur 1236, Del Valle, Ciudad de México', tarifa: 1450 },
  { id: 'ht-mty1', destino: 'HSM Monterrey', nombre: 'Hotel Safi Royal Luxury Valle', direccion: 'Diego Rivera 555, Del Valle, San Pedro Garza García, N.L.', tarifa: 2050 },
  { id: 'ht-mty2', destino: 'HSM Monterrey', nombre: 'Fiesta Inn Monterrey Valle', direccion: 'Av. Lázaro Cárdenas 2400, Valle Oriente, San Pedro Garza García, N.L.', tarifa: 1690 },
  { id: 'ht-gdl1', destino: 'HSM Guadalajara', nombre: 'Hotel Real Minerva Guadalajara', direccion: 'Av. Vallarta 3045, Vallarta Poniente, Guadalajara, Jal.', tarifa: 2150 },
  { id: 'ht-mid1', destino: 'HSM Mérida', nombre: 'Hotel Fiesta Americana Mérida', direccion: 'Paseo de Montejo 451, Centro, Mérida, Yuc.', tarifa: 2380 },
  { id: 'ht-mid2', destino: 'HSM Mérida', nombre: 'Holiday Inn Express Mérida', direccion: 'Calle 60 No. 345, Centro, Mérida, Yuc.', tarifa: 1520 },
  { id: 'ht-chi1', destino: 'HSM Chihuahua', nombre: 'Hotel Sicomoro Chihuahua', direccion: 'Blvd. Ortiz Mena 411, Chihuahua, Chih.', tarifa: 1650 }
];
// Ocupación de habitaciones de la unidad por fechas (detección de conflictos al capturar). Las asignaciones del Portal se suman en vivo.
const OCUPACION = [{ unidad: 'HSM Chihuahua', hab: '202', entrada: '24/10/2026', salida: '30/10/2026', ref: 'Estancia de residente médico' }];
// Datos del pasajero = DATOS DEL COLABORADOR (expediente de personal; cliente 2026-10-21): solo lectura en Hotel y vuelos, el viajero NO los captura.
// Externos: registro del viajero externo (US-05). Demo sintética para todos los usuarios del selector.
const PASAJEROS = { u01: { nac: '14/03/1990', nacionalidad: 'Mexicana' }, u02: { nac: '22/07/1986', nacionalidad: 'Mexicana' }, u03: { nac: '09/11/1971', nacionalidad: 'Mexicana' }, u04: { nac: '12/05/1975', nacionalidad: 'Mexicana' },
  u05: { nac: '30/01/1969', nacionalidad: 'Mexicana' }, u06: { nac: '18/06/1965', nacionalidad: 'Mexicana' }, u07: { nac: '05/09/1984', nacionalidad: 'Mexicana' }, u08: { nac: '27/02/1988', nacionalidad: 'Mexicana' },
  u09: { nac: '11/12/1987', nacionalidad: 'Mexicana' }, u10: { nac: '03/04/1983', nacionalidad: 'Mexicana' }, u11: { nac: '21/08/1979', nacionalidad: 'Mexicana' }, u12: { nac: '16/10/1991', nacionalidad: 'Mexicana' } };
// Personas de otras áreas de operación que aparecen en la demo (no son usuarios del selector).
const PERSONAS = { 'hh-mty': 'Jorge Salinas Treviño', 'hh-chi2': 'Gabriela Ochoa Ruiz', 'via-2': 'Rosa Martínez Lugo' };

window.SMV_HV = { CATALOGOS, HABITACION_HSM, SEED_REQS, RECS, PARAMS, CONFIG_VUELO, AEROLINEAS, ESCALAS, EQUIPAJE: EQ, MOTIVOS_RECHAZO_HSM, MOTIVOS_RECHAZO_VUELO, CANALIZACION, HOTELES, OCUPACION, AEROP, PASAJEROS, PERSONAS };
})(); }
