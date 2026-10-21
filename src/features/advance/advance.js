// US-14 · US-15 — Anticipo
// Extracted from the cumulative prototype (prototype/Portal Viaticos.dc.html, class Component) — APPROVED · CLOSED 2026-10-21.
// Reference implementation for development: methods of the Portal logic class (they rely on this.state / this.setState and shared helpers of the same class).
// Functional rules: docs/ADVANCE_MODEL.md + PDFs «Propuesta visual (US-14/15 …)». Demo data: see the *-data.js file in this folder.

const AdvanceMethods = {
  anticipoNA(u) {
    if (!u) return false;
    if (u.external) return true; // viajero externo: el anticipo no existe (en pantalla y en servidor)
    const perf = this.PV ? this.pvPerfil(this.svUid(u)) : (u.perfil && u.perfil.label);
    const prof = this.PV && (this.PV.PROFILES || []).find(p => p.perfil === perf && p.estado === 'Vigente');
    if (prof && prof.anticipo === 'No') return true;
    return perf === 'Director' && ['E', 'ED'].includes(u.personnelGroup);
  }
  anticipoNote(u) { if (u && u.external) return 'No aplica · viajero externo'; const perf = this.PV ? this.pvPerfil(this.svUid(u)) : ''; return perf === 'Director' && ['E', 'ED'].includes(u.personnelGroup) ? 'No aplica · Director grupo ' + u.personnelGroup : 'No aplica · reembolso al comprobar'; }
  // SALDO PENDIENTE POR COMPROBAR (regla 262): único cálculo = comprobacion.sujeto − comprobacion.comprobado del viaje propio (nunca negativo).
  // Los estados de vista previa solo cambian «comprobado» con los escenarios del mismo registro (demo.parcial); no hay importes duplicados.
  get ANT() { return window.SMV_ANT; }
  antPar() { return (this.ANT && this.ANT.PARAMS) || { antelacionDias: 5, editables: ['Taxi', 'Autobús'], propinaMaxPct: 10, plazoIniciar: 7, plazoConcluir: 7, motivoMax: 500, abiertos: ['pendAut', 'autorizado', 'contabilizado', 'porTransferir', 'realizado', 'devuelto'] }; }
  antM(n) { n = Number(n) || 0; return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  ANT_ST = { pendAut: ['Por contabilizar', 'azul'], autorizado: ['Por contabilizar', 'azul'], contabilizado: ['Programado para pago', 'azul'], porTransferir: ['Programado para pago', 'azul'],
    realizado: ['Realizado · depositado', 'verde'], devuelto: ['Transferencia devuelta', 'amarillo'], rechazado: ['Rechazado', 'rojo'], cancelado: ['Cancelado', 'gris'] };
  antStText(e) { return (this.ANT_ST[e] || [e])[0]; }
  // Cliente 2026-10-19: sin cadena de Director (regla 450) y sin «Por programar»: todo anticipo contabilizado queda «Programado para pago» (fecha prevista en pp.fechaPago).
  antNorm(a) { const x = { ...a, cadenaIds: [], decisiones: [] }; if (x.estado === 'pendAut') x.estado = 'autorizado'; if (x.estado === 'contabilizado') x.estado = 'porTransferir';
    if (x.estado === 'porTransferir' && !(x.pp && x.pp.fechaPago)) { const w = (x.pp && x.pp.when) || (x.contab || {}).when || x.enviado; x.pp = { ...(x.pp || {}), when: w, byId: (x.contab || {}).byId, fechaPago: this.antProgPago(w) }; } return x; }
  antRecs() { const ses = ((this.state.an || {}).recs) || [], seed = ((this.ANT || {}).ANTICIPOS || []).filter(a => !ses.some(x => x.id === a.id)).map(a => this.antNorm(a)); return seed.concat(ses); }
  // FECHAS POSIBLES DE DEPÓSITO (cliente 2026-10-16): Contabilidad contabiliza y programa el pago en los días de pago (demo: martes y jueves), a partir de 2 días hábiles del envío.
  antFechasDep(stamp) { const p = String(stamp || '').split(' ')[0].split('/'), b0 = p.length === 3 ? new Date(+p[2], +p[1] - 1, +p[0]) : null, hoy = new Date(this.antToday()), base = b0 && b0 > hoy ? b0 : hoy, dias = this.antPar().diasPago || [2, 4], N = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const d = new Date(base); let hab = 0; while (hab < 2) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) hab++; } const out = []; while (out.length < 2) { if (dias.includes(d.getDay())) out.push({ fecha: [d.getDate(), d.getMonth() + 1].map(x => String(x).padStart(2, '0')).join('/') + '/' + d.getFullYear(), dia: N[d.getDay()] }); d.setDate(d.getDate() + 1); } return out; }
  antFechaPago(a) { const f = (a && a.pp && a.pp.fechaPago) || null; return f ? f.dia + ' ' + f.fecha : this.antFechasTxt(this.antFechasDep(this.nowStamp()).slice(0, 1)); }
  antProgPago(stamp) { return this.antFechasDep(stamp)[0]; }
  antFechasTxt(fs) { return fs.map(x => x.dia + ' ' + x.fecha).join(' o '); }
  ANT_CON_TABS = { contab: 'Por contabilizar', transf: 'Programados para pago', real: 'Realizados', term: 'Rechazados y cancelados', comp: 'Complemento' };
  antConTabOf(a, tab) { if (!a) return 'contab'; if (tab === 'comp' && (a.transfers || []).some(x => x.n > 1)) return 'comp'; return a.estado === 'autorizado' ? 'contab' : ['porTransferir', 'contabilizado', 'devuelto'].includes(a.estado) ? 'transf' : a.estado === 'realizado' ? 'real' : 'term'; }
  ANT_EXTRA = ['Autobús', 'Casetas', 'Gasolina', 'Estacionamiento', 'Tintorería', 'Otros gastos de viaje'];
  // Propuesta de la captura + conceptos AGREGADOS por el colaborador (cliente 2026-10-16, p. ej. Autobús): sin tarifa, editables, con el tope del anticipo como límite del total.
  antPropForm(r, f) { const p = this.antPropuesta(r), ex = Object.keys((f && f.extra) || {}), cap = p.tope ? p.tope.importe : p.total;
    const lines = p.lines.filter(l => !(l.na && ex.includes(l.concepto))).concat(ex.map(c => ({ concepto: c, max: cap, editable: true, extra: true, origen: 'solicitado', origenTxt: 'Concepto agregado por el colaborador', calc: 'Agregado por ti · sin tarifa en la propuesta: lo comprobarás con sus comprobantes', detail: [] })));
    return { ...p, lines, limite: ex.length ? cap : p.total }; }
  antOf(folio) { const all = this.antRecs().filter(a => a.folio === folio), op = this.antPar().abiertos; return all.find(a => op.includes(a.estado)) || all[all.length - 1] || null; }
  antReq(folio) { return this.svAllReqs().find(r => r.folio === folio) || null; }
  antOwner(r) { if (!r) return null; if (r.travelerType === 'externo') { const X = this.extById(r.uid); return X ? this.extPseudo(X) : { id: r.uid, name: r.uid, external: true }; }
    const U = (this.state.data && this.state.data.USERS) || []; return U.find(u => u.id === r.uid) || (this.apPpl().find(p => p.id === r.uid)) || { id: r.uid, name: this.apName(r.uid) }; }
  antToday() { return this.parseD(this.T26); }
  antBizAdd(d, n) { const x = new Date(d); let k = 0; while (k < n) { x.setDate(x.getDate() + 1); const w = x.getDay(); if (w !== 0 && w !== 6) k++; } return x; }
  antPlazos(r) { const s = r && r.segmentos || [], fin = s.length ? this.parseD(s[s.length - 1].fin) : null, P = this.antPar(); if (!fin) return null;
    const a = this.antBizAdd(fin, P.plazoIniciar), b = this.antBizAdd(a, P.plazoConcluir); return { fin: this.fmtD(fin), iniciar: this.fmtD(a), concluir: this.fmtD(b),
      text: 'Al concluir tu viaje (' + this.fmtD(fin) + ') tendrás ' + P.plazoIniciar + ' días hábiles para iniciar tu comprobación (hasta el ' + this.fmtD(a) + ') y ' + P.plazoConcluir + ' más para concluirla (hasta el ' + this.fmtD(b) + ').' }; }
  // Tope del anticipo: excepción individual vigente (regla r14) → tarifa «Anticipo · monto máximo autorizado» del perfil (US-03). Sin tarifa → bloqueo.
  antTope(r) { const uid = r.uid, perfil = r.perfilFolio || this.pvPerfil(uid), e = this.pvExcepciones(uid).find(x => x.estado === 'Vigente' && x.regla === 'r14');
    if (e) return { importe: Number(e.valor), origen: 'excepcion', label: 'Excepción individual vigente (' + this.vigText(e.from, e.to) + ')', perfil };
    const t = this.pvTarifa('c4', perfil); return t && t.importe != null ? { importe: t.importe, origen: 'politica', label: 'Tarifa «Anticipo · monto máximo autorizado» del perfil ' + perfil, perfil } : null; }
  // PROPUESTA MÁXIMA por concepto con los VALORES EFECTIVOS (excepción individual → política del perfil → parámetro global), derivada de los destinos del folio.
  antPropuesta(r) {
    const P = this.antPar(), uid = r.uid, perfil = r.perfilFolio || this.pvPerfil(uid), segs = r.segmentos || [], ex = rid => this.pvExcepciones(uid).find(x => x.estado === 'Vigente' && x.regla === rid);
    const O = (o, txt) => ({ origen: o, origenTxt: txt || (o === 'excepcion' ? 'Excepción individual' : o === 'global' ? 'Parámetro global' : o === 'destino' ? 'Por hospital destino' : 'Política del perfil') });
    const L = []; const pl = (n, a, b) => n + ' ' + (n === 1 ? a : b);
    const hot = segs.filter(s => s.hospedaje === 'hotel'), nH = hot.reduce((n, s) => n + (s.noches || 0), 0), eH = ex('r3'), tH = this.pvTarifa('c1', perfil), rH = eH ? Number(eH.valor) : (tH ? tH.importe : 0);
    L.push(nH ? { concepto: 'Hospedaje', max: nH * rH, calcT: pl(nH, 'noche', 'noches') + ' en hotel externo', calc: pl(nH, 'noche', 'noches') + ' × ' + this.antM(rH) + ' — ' + (eH ? 'excepción individual' : 'tarifa del perfil ' + perfil), ...O(eH ? 'excepcion' : 'politica'), detail: hot.map(s => s.label + ': ' + pl(s.noches, 'noche', 'noches') + ' en hotel externo × ' + this.antM(rH)) }
      : { concepto: 'Hospedaje', max: 0, na: true, why: segs.some(s => s.hospedaje === 'hospital') ? 'Sin costo · hospedaje en hospital' : 'No aplica · sin noches de hospedaje', ...O('politica'), detail: [] });
    const eA = ex('r2'), al = segs.map(s => { const k = (s.comidas || []).length, cap = !k ? 0 : (eA && k === 3 ? Number(eA.valor) : (this.pvAlimCap(perfil, k) || 0)); return { s, k, cap, imp: (s.dias || 0) * cap }; }).filter(x => x.k), nA = al.reduce((n, x) => n + x.imp, 0);
    L.push(nA ? { concepto: 'Alimentos', max: nA, calcT: pl(al.reduce((n, x) => n + (x.s.dias || 0), 0), 'día', 'días') + ' con comidas externas', calc: pl(al.reduce((n, x) => n + (x.s.dias || 0), 0), 'día', 'días') + ' con comidas externas — ' + (eA ? 'excepción individual' : 'topes diarios del perfil ' + perfil), ...O(eA ? 'excepcion' : 'politica'), detail: al.map(x => x.s.label + ': ' + pl(x.s.dias, 'día', 'días') + ' × ' + this.antM(x.cap) + ' (' + x.s.comidas.join(', ') + ')') }
      : { concepto: 'Alimentos', max: 0, na: true, why: 'No aplica · sin comidas externas (las del hospital no tienen costo)', ...O('politica'), detail: [] });
    const as = segs.map(s => this.parseD(s.inicio)).filter(Boolean), bs = segs.map(s => this.parseD(s.fin)).filter(Boolean), days = as.length && bs.length ? Math.round((Math.max(...bs) - Math.min(...as)) / 864e5) + 1 : 0, ti = this.pvTint();
    if (days >= ti.desdeDia) L.push({ concepto: 'Tintorería', max: (days - ti.desdeDia + 1) * ti.importe, calcT: pl(days - ti.desdeDia + 1, 'día', 'días') + ' a partir del ' + ti.desdeDia + '.º día del viaje', calc: pl(days - ti.desdeDia + 1, 'día', 'días') + ' × ' + this.antM(ti.importe) + ' — a partir del ' + ti.desdeDia + '.º día del viaje', ...O('global'), detail: [] });
    const auto = segs.some(s => s.medio === 'Auto particular');
    [['Gasolina', 'c7', 'r10'], ['Casetas', 'c8', 'r11']].forEach(([lb, c, rid]) => { if (!auto) return; const e = ex(rid), t = this.pvTarifa(c, perfil), v = e ? Number(e.valor) : (t ? t.importe : 0); if (v) L.push({ concepto: lb, max: v, calcT: 'Viaje en auto particular · monto por viaje', calc: 'Monto máximo por viaje en auto particular — ' + (e ? 'excepción individual' : 'tarifa del perfil ' + perfil), ...O(e ? 'excepcion' : 'politica'), detail: [] }); });
    const tx = segs.map(s => { const t = this.pvTaxi(s.hospId), w = Math.max(1, Math.ceil((s.dias || 1) / 7)); return { s, t, w, imp: t ? t.importe * w : 0 }; }).filter(x => x.imp);
    if (tx.length) L.push({ concepto: 'Taxi', max: tx.reduce((n, x) => n + x.imp, 0), calcT: pl(tx.reduce((n, x) => n + x.w, 0), 'semana', 'semanas') + ' en destino · captura el importe que necesitas', calc: 'Tarifa semanal por hospital destino × ' + pl(tx.reduce((n, x) => n + x.w, 0), 'semana', 'semanas'), ...O('destino'), editable: P.editables.includes('Taxi'), detail: tx.map(x => x.s.label + ': ' + pl(x.w, 'semana', 'semanas') + ' × ' + this.antM(x.t.importe) + (x.t.especifica ? ' (tarifa del hospital)' : ' (tarifa general)')) });
    if (segs.some(s => s.medio === 'Autobús')) L.push({ concepto: 'Autobús', max: 0, na: true, why: 'Sin tarifa configurada para anticipo: el boleto se comprueba al regresar', ...O('politica'), detail: [] });
    if (segs.some(s => s.medio === 'Avión')) L.push({ concepto: 'Vuelos', max: 0, na: true, why: 'No forma parte del anticipo: el vuelo lo compra Viáticos', ...O('politica'), detail: [] });
    const suma = L.reduce((n, l) => n + l.max, 0), tope = this.antTope(r), cap = tope ? tope.importe : null;
    let total = cap == null ? suma : Math.min(suma, cap), ajustada = cap != null && suma > cap;
    if (ajustada) { const act = L.filter(l => l.max > 0), f = cap / suma; act.forEach(l => { l.maxOrig = l.max; l.max = Math.floor(l.max * f * 100) / 100; }); const dif = Math.round((cap - act.reduce((n, l) => n + l.max, 0)) * 100) / 100; const big = act.slice().sort((a, b) => b.max - a.max)[0]; if (big) big.max = Math.round((big.max + dif) * 100) / 100; }
    return { lines: L.map(l => ({ editable: false, ...l })), suma, tope, total, ajustada, perfil, dias: days, diasMax: (this.pvProfileOf(perfil) || {}).diasMax || null };
  }
  // Propuesta CONGELADA: la del registro (enviada) o, para la semilla, la calculada una sola vez (misma referencia auditable).
  antProp(rec) { if (rec.propuesta) return rec.propuesta; const m = this._antPropMemo || (this._antPropMemo = {}); if (!m[rec.id]) { const r = this.antReq(rec.folio); m[rec.id] = r ? { ...this.antPropuesta(r), congeladaEn: rec.enviado } : { lines: [], total: 0, suma: 0 }; } return m[rec.id]; }
  // Cliente 2026-10-19: Contabilidad NO modifica importes (sin «Aprobado» ni «Diferencia»): lo contabilizado = lo solicitado; tApr queda solo como alias de tSol.
  antLines(rec) { const p = this.antProp(rec), sol = rec.sol || {};
    const lines = p.lines.map(l => { const s = l.na ? 0 : (sol[l.concepto] != null ? Number(sol[l.concepto]) : l.max); return { ...l, sol: s, apr: s }; });
    const tSol = Math.round(lines.reduce((n, l) => n + l.sol, 0) * 100) / 100; return { p, lines, tSol, tApr: tSol }; }
  antTransferido(rec) { return (rec.transfers || []).filter(t => t.estado === 'aplicada').reduce((n, t) => n + t.importe, 0); }
  // Cuenta de depósito = cuenta de nómina del ERP (solo lectura, enmascarada, con titular). Vigencia según ERP (MODO DEMO simula «no vigente»).
  antCuenta(uid) { const sp = ((this.PV && this.PV.ERP_PERSONAL) || {})[uid] || {}, A = this.ANT || {}, demo = ((this.state.an || {}).demo) || 'normal', tr = this.antOwner({ uid });
    const ok = !(A.CUENTA_NO_VIGENTE || []).includes(uid) && !(demo === 'cuenta' && uid === this.svUid(this.svUser() || {}));
    const ref = sp.cuentaBancaria ? '•••• ' + String(sp.cuentaBancaria).replace(/\D/g, '').slice(-4) : '—';
    return { ref, banco: (A.BANCO_ERP || {})[uid] || 'Banco registrado en el ERP', titular: (tr && tr.name) || '—', vigente: ok, vigHasta: ((A.VIGENCIA_CUENTA || {})[uid]) || A.VIGENCIA_ERP_DEFAULT || '31/12/9999', texto: 'Transferencia a cuenta de nómina · ' + ((A.BANCO_ERP || {})[uid] || 'banco del ERP') + ' · ' + ref }; }
  // ELEGIBILIDAD (servidor y pantalla, un solo resolver): externo y perfil sin anticipo = la etapa no existe / No aplica; luego aprobación, unicidad, tarifa, vigencia, antelación y cuenta.
  antElig(r) {
    if (!r) return { k: 'none' };
    const owner = this.antOwner(r), P = this.antPar(), demo = ((this.state.an || {}).demo) || 'normal';
    if (r.travelerType === 'externo') return { k: 'na', text: 'No aplica · viajero externo', long: 'El anticipo no existe para viajeros externos: sus gastos se gestionan sin anticipo.' };
    const prof = this.pvProfileOf(r.perfilFolio || this.pvPerfil(r.uid));
    if (this.anticipoNA(owner) || (prof && prof.anticipo === 'No')) return { k: 'na', text: this.anticipoNote(owner) || 'No aplica', long: 'Tu perfil aplica reembolso posterior: registra tus gastos en Comprobación al regresar del viaje.' };
    if (['captura', 'pendAut'].includes(r.status)) return { k: 'antes', text: 'Después de la aprobación' };
    if (['rechazada', 'cancelada'].includes(r.status)) return { k: 'dead', text: 'No aplica · solicitud ' + (r.status === 'rechazada' ? 'rechazada' : 'cancelada') };
    const rec = this.antOf(r.folio);
    if (rec && P.abiertos.includes(rec.estado)) return { k: 'existe', rec };
    // Cliente 2026-10-19: un importe incorrecto se RECHAZA y el colaborador vuelve a solicitar con el importe correcto (igual que tras una cancelación).
    if (r.status !== 'aprobada') return rec && rec.estado === 'rechazado' ? { k: 'rechazado', rec } : { k: 'cerrado', text: 'Sin anticipo solicitado' };
    const tope = this.antTope(r);
    if (!tope) return { k: 'block', b: 'sinTarifa', title: 'Sin tarifa vigente de anticipo', text: 'El perfil ' + (r.perfilFolio || '') + ' no tiene tarifa vigente de «Anticipo · monto máximo autorizado»: el anticipo no se puede solicitar. Podrás comprobar tus gastos al regresar; la tarifa la configura Admin / Seguridad TI en Perfiles de viajero.' };
    const segs = r.segmentos || [], ini = this.parseD((segs[0] || {}).inicio), fin = this.parseD((segs[segs.length - 1] || {}).fin), hoy = this.antToday();
    if (demo === 'vencido' || (fin && hoy > fin) || (ini && hoy >= ini)) return { k: 'block', b: 'vencido', title: 'Viaje vencido', text: 'El viaje ya inició o concluyó: el anticipo no se solicita con un viaje vencido. Podrás comprobar tus gastos al regresar.' };
    const dd = ini ? Math.round((ini - hoy) / 864e5) : 99;
    if (dd < P.antelacionDias) return { k: 'block', b: 'antelacion', title: 'Fuera de antelación', text: 'El anticipo se solicita con al menos ' + P.antelacionDias + ' días de antelación al inicio del viaje (' + (segs[0] || {}).inicio + '); faltan ' + dd + (dd === 1 ? ' día' : ' días') + '. Podrás comprobar tus gastos al regresar.' };
    const cu = this.antCuenta(r.uid);
    if (!cu.vigente) return { k: 'block', b: 'cuenta', title: 'Cuenta bancaria no vigente', text: 'Tu cuenta de nómina registrada en el ERP no está vigente. Actualízala con Capital Humano HSM o Capital Humano Corporativo (ERP) y vuelve a esta pantalla para solicitar tu anticipo.' };
    return { k: 'disponible', rec };
  }
  // Etapa 2 del trayecto (MISMO componente compartido): derivada del registro real.
  antStage(r) {
    const e = this.antElig(r);
    if (e.k === 'na' || e.k === 'dead') return ['na', e.text];
    if (e.k === 'antes') return ['todo', e.text];
    if (e.k === 'disponible') return ['current', e.rec && e.rec.estado === 'cancelado' ? 'Cancelado · puedes solicitar otro' : e.rec && e.rec.estado === 'rechazado' ? 'Rechazado por Contabilidad · solicítalo de nuevo' : 'Disponible para solicitar'];
    if (e.k === 'block') return ['current', 'No disponible · ' + e.title.toLowerCase()];
    if (e.k === 'rechazado') return ['stop', 'Rechazado por Contabilidad'];
    if (e.k === 'cerrado') return ['na', 'Sin anticipo solicitado'];
    const a = e.rec, ch = a.cadenaIds || [], p = this.antPaso(a);

    if (a.estado === 'realizado') { const t = (a.transfers || []).filter(x => x.estado === 'aplicada'); return ['done', 'Depositado ' + ((t[0] || {}).fecha || '') + ' · ' + this.antM(this.antTransferido(a))]; }
    if (a.estado === 'devuelto') return ['current', 'Transferencia devuelta · en reproceso'];
    return ['current', a.estado === 'autorizado' || a.estado === 'pendAut' ? 'Enviado · por contabilizar · depósito ' + this.antFechasTxt(a.fechasDep || this.antFechasDep(a.enviado)) : 'Contabilizado · programado para pago · depósito ' + this.antFechaPago(a)];
  }
  antCta(folio) { const r = this.antReq(folio), e = this.antElig(r); if (e.k === 'disponible') return { label: 'Solicitar anticipo', go: () => this.go('anticipo', { folio }) };
    if (['existe', 'rechazado', 'block'].includes(e.k)) return { label: 'Ver anticipo', go: () => this.go('anticipo', { folio }) }; return null; }
  antNext(r, owner) { const e = this.antElig(r), pz = this.antPlazos(r);
    if (e.k === 'disponible') return e.rec && e.rec.estado === 'rechazado' ? 'Contabilidad rechazó tu anticipo. Motivo: ' + this.antMotivo(e.rec) + '. Solicítalo de nuevo con el importe correcto.' : 'Solicitud aprobada. El siguiente paso es solicitar tu anticipo.';
    if (e.k === 'block') return e.title + ': ' + e.text;
    if (e.k === 'rechazado') return 'Anticipo rechazado por Contabilidad. Motivo: ' + this.antMotivo(e.rec) + '. Podrás comprobar tus gastos al regresar.';
    if (e.k === 'existe') { const a = e.rec, ch = a.cadenaIds || [];
      if (a.estado === 'pendAut' || a.estado === 'autorizado') return 'Contabilidad / Tesorería contabiliza tu anticipo y lo programa para pago. Fechas posibles de depósito: ' + this.antFechasTxt(a.fechasDep || this.antFechasDep(a.enviado)) + '.';
      if (a.estado === 'realizado') return 'Anticipo depositado. ' + (pz ? pz.text : '');
      if (a.estado === 'devuelto') return 'El banco devolvió la transferencia de tu anticipo; Contabilidad la reprocesa.';
      return 'Anticipo contabilizado y programado para pago: depósito previsto el ' + this.antFechaPago(a) + '. Te avisaremos cuando el ERP lo deposite.'; }
    return null; }
  antMotivo(a) { const d = (a.decisiones || []).find(x => x.res === 'rechazada'); return String(a.motivo || (d ? [d.motivoTipo, d.motivo].filter(Boolean).join(' · ') : 'sin motivo registrado')).trim().replace(/[.\s]+$/, ''); }
  // CADENA DEL ANTICIPO (US-15: Director inmediato → Dirección Corporativa), por estructura del ERP; sin pasos repetidos ni autoautorización. No es la cadena del viaje.
  antChain(uid) {
    const U = (this.state.data && this.state.data.USERS) || [], ES = (this.PV && this.PV.ESTRUCTURA_ERP) || { hospital: {}, corporativo: {} }, CAT = window.SMV_CAT, byId = id => U.find(u => u.id === id) || null;
    const u = byId(uid) || {}; let steps = [];
    if (u.hospital) { const h = CAT && CAT.hospByAlias ? CAT.hospByAlias(u.hospital) : null, e = (h && ES.hospital[h.id]) || {};
      steps.push({ label: 'Director inmediato', ctx: u.hospital + ' · director del hospital', person: e.director ? byId(e.director) : U.find(x => x.roleLabel === 'Dirección de Hospital' && x.hospital === u.hospital) });
      steps.push({ label: 'Dirección Corporativa', ctx: 'Autorizador corporativo de la unidad organizativa', person: e.autorizadorCorp ? byId(e.autorizadorCorp) : null });
    } else { const c = ES.corporativo[uid] || {};
      steps.push({ label: 'Director inmediato', ctx: 'Estructura del ERP · grupo ' + (c.jefeGrupo || '—'), person: c.jefe ? byId(c.jefe) : null });
      steps.push({ label: 'Dirección Corporativa', ctx: u.direccion || '', person: U.find(x => x.roleLabel === 'Dirección Corporativa' && x.direccion === u.direccion) || null }); }
    const seen = new Set(); return steps.filter(s => s.person && s.person.id !== uid && !seen.has(s.person.id) && seen.add(s.person.id)).map(s => ({ ...s, personId: s.person.id })); }
  antPaso(a) { return ((a && a.decisiones) || []).filter(d => d.res === 'aprobada').length; }
  antTurn(a) { return a && a.estado === 'pendAut' ? ((a.cadenaIds || [])[this.antPaso(a)] || null) : null; }
  antCapOf(itemId, ac, user) { const D = window.SMV_US26, item = (window.SMV_US01.MENU.flatMap(g => g.items)).find(i => i.id === itemId); if (!item || !user || !this.visible(item, user)) return false; if (ac === 'CO') return true;
    const cfg = D && this.u26Config(user); if (D && cfg) { const it = this.u26Items(D).find(x => x.id === itemId); return !!it && ['default', 'byExc', 'manual', 'manualExc'].includes(this.resolveAccess(cfg, it, ac, D)); } return this.baseVis(item, ac, user.role) === '✓'; }
  antPending(user) { if (!user || !this.antCapOf('aut-ant', 'CO', user)) return []; const uid = this.svUid(user); return this.antRecs().filter(a => this.antTurn(a) === uid && a.uid !== uid); }
  antConCaps(user) { return { co: this.antCapOf('con-ant', 'CO', user), va: this.antCapOf('con-ant', 'VA', user), pg: this.antCapOf('con-ant', 'PG', user) }; }
  antLockedByOther(a, uid) { return !!(a.lock && a.lock.byId && a.lock.byId !== uid); }
  antConPops(user) { const uid = this.svUid(user), R = this.antRecs();
    // Cliente 2026-10-19: sin «Por programar». Programados para pago = contabilizados en espera del ERP (por transferir o devueltos); Complemento = segunda transferencia del MISMO anticipo.
    const comp = R.filter(a => (a.transfers || []).some(t => t.n > 1));
    return { contab: R.filter(a => a.estado === 'autorizado' && !this.antLockedByOther(a, uid)), sel: R.filter(a => a.estado === 'autorizado' && !this.antLockedByOther(a, uid) && this.antCuenta(a.uid).vigente),
      transf: R.filter(a => ['porTransferir', 'contabilizado', 'devuelto'].includes(a.estado)), comp, compPend: comp.filter(a => (a.transfers || []).some(t => t.n > 1 && t.estado === 'porTransferir')) }; }
  antPrevPend(uid, folio) { const out = this.antRecs().filter(a => a.uid === uid && a.folio !== folio && a.estado === 'realizado').map(a => 'Folio ' + a.folio + ' · anticipo depositado ' + this.antM(this.antTransferido(a)) + ' por comprobar');
    this.pvTrips(uid).filter(t => /^Anticipo por comprobar/.test(t.saldo || '')).forEach(t => out.push('Folio ' + t.folio + ' · ' + t.saldo.toLowerCase())); return out; }
  // ---------- PRESUPUESTO (modelo canónico, sin redefinir fórmulas) ----------
  // El folio aprobado YA está Comprometido (Reserva de US-09). Autorizar el anticipo solo compromete la DIFERENCIA si excede la reserva del folio (p. ej. taxi, que no forma
  // parte del estimado del viaje); el depósito confirmado registra el renglón «Anticipo» (Movimientos de bolsa → En tránsito); la devolución bancaria lo revierte con signo negativo.
  antBolsa(r) { const P = this.PRES, data = this.presData(); if (!P || !data || !r) return null; const rv = data.movs.filter(m => m.folio === r.folio && m.tipo === 'Reserva').pop();
    if (rv) return { bolsa: rv.bolsa, periodo: rv.periodo }; const b = P.bolsaPara(this.apEnt(r), r.travelerType === 'externo'); const t = String(((r.segmentos || [])[0] || {}).inicio || '').split('/');
    return b ? { bolsa: b.id, periodo: P.MESES[Number(t[1]) - 1] + ' ' + t[2] } : null; }
  antReservaNeta(folio) { const data = this.presData(); return data ? data.movs.filter(m => m.folio === folio && (m.tipo === 'Reserva' || /^Liberación/.test(m.tipo))).reduce((n, m) => n + m.importe, 0) : 0; }
  antSeedMovs() { if (this._antSeedMovs) return this._antSeedMovs; const P = this.PRES, A = this.ANT; if (!P || !A) return []; const out = [], S = A.SEED_REQS || [];
    const bol = r => { const b = P.bolsaPara(r.travelerType === 'externo' ? r.entidad : (r.entidad || this.presEntityOf(r.uid)), r.travelerType === 'externo'); const t = String(((r.segmentos || [])[0] || {}).inicio || '').split('/'); return b ? { bolsa: b.id, periodo: P.MESES[Number(t[1]) - 1] + ' ' + t[2] } : null; };
    S.forEach((r, i) => { const b = bol(r); if (!b) return; const d = (r.decisiones || []).slice(-1)[0] || {};
      out.push({ id: 'AS-R' + r.folio, when: d.when || r.when, bolsa: b.bolsa, periodo: b.periodo, tipo: 'Reserva', importe: r.total, folio: r.folio, ...(r.travelerType === 'externo' ? { ext: r.uid } : { uid: r.uid }), evento: 'Aprobación de la planeación del viaje', actor: this.apName(d.byId), actorRol: 'Autorizador', fuente: 'Portal', origen: 'Web' }); });
    (A.ANTICIPOS || []).forEach(a => { const r = S.find(x => x.folio === a.folio); if (!r) return; const b = bol(r); if (!b) return;
      if (['contabilizado', 'porTransferir', 'realizado', 'devuelto'].includes(a.estado)) { this._antSeedMovs = []; const l = this.antLines(a); const extra = Math.round((l.tSol - r.total) * 100) / 100; this._antSeedMovs = null;
        if (extra > 0) out.push({ id: 'AS-C' + a.folio, when: (a.contab || {}).when || ((a.decisiones || []).slice(-1)[0] || {}).when, bolsa: b.bolsa, periodo: b.periodo, tipo: 'Reserva', importe: extra, folio: a.folio, uid: a.uid, evento: 'Contabilización del anticipo · compromiso adicional sobre la reserva del folio', actor: this.apName((a.contab || {}).byId || ((a.decisiones || []).slice(-1)[0] || {}).byId), actorRol: 'Contabilidad / Tesorería', fuente: 'Portal', origen: 'Web' }); }
      (a.transfers || []).forEach(t => { if (t.estado === 'aplicada' || t.estado === 'devuelta') out.push({ id: 'AS-A' + a.folio + t.n, when: t.when, bolsa: b.bolsa, periodo: b.periodo, tipo: 'Anticipo', importe: t.importe, folio: a.folio, uid: a.uid, evento: (t.n > 1 ? 'Segunda transferencia · ' + t.tipo.toLowerCase() : 'Transferencia del anticipo · depósito confirmado') + ' · ref. ' + t.referencia, actor: this.apName(t.byId), actorRol: 'Contabilidad / Tesorería', fuente: 'ERP', origen: 'Web' });
        if (t.estado === 'devuelta' && t.devolucion) out.push({ id: 'AS-D' + a.folio + t.n, when: t.devolucion.when, bolsa: b.bolsa, periodo: b.periodo, tipo: 'Anticipo', importe: -t.importe, folio: a.folio, uid: a.uid, evento: 'Devolución bancaria del anticipo · ' + t.devolucion.causa, actor: this.apName(t.devolucion.byId), actorRol: 'Contabilidad / Tesorería', fuente: 'ERP', origen: 'Web' }); }); });
    this._antSeedMovs = out; return out; }
  // ---------- TRANSICIONES (una sola vía: registro + bitácora + presupuesto + avisos en UNA actualización; idempotentes) ----------
  antEv(user, folio, type, accion, before, after, res, area) { return { ...this.svEvent(user, folio, type, accion, before, after, res), area: area || 'Anticipo', field: 'Estatus del anticipo' }; }
  antPut(s, rec) { const an = s.an || {}; return { ...an, recs: (an.recs || []).filter(x => x.id !== rec.id).concat([rec]) }; }
  antNotice(notices, uid, n) { if (!uid) return notices; return { ...notices, [uid]: [{ id: 'antn' + Date.now() + Math.round(Math.random() * 9999), when: 'hoy ' + this.nowStamp().split(' ')[1], unread: true, tone: 'azul', ...n }].concat(notices[uid] || []) }; }
  antValidate(prop, sol) { const errs = {}; let t = 0;
    prop.lines.forEach(l => { if (l.na) return; const raw = sol[l.concepto], v = raw == null || raw === '' ? (l.editable || l.extra ? 0 : l.max) : this.presNum(raw);
      if (l.extra && !isNaN(v) && v <= 0) errs[l.concepto] = 'Captura el importe del concepto agregado o quítalo.';
      else if (!l.editable && v !== l.max) errs[l.concepto] = 'Concepto no editable: se solicita el monto propuesto.';
      else if (isNaN(v)) errs[l.concepto] = 'Captura un importe válido, hasta 2 decimales (o $0 si no lo necesitas).';
      else if (v > l.max) errs[l.concepto] = 'El importe de ' + l.concepto + ' excede el máximo permitido por la política. Captura un monto menor.';
      if (!isNaN(v)) t += v; });
    t = Math.round(t * 100) / 100; const lim = prop.limite != null ? prop.limite : prop.total; if (!Object.keys(errs).length && t > lim) errs._total = 'El total excede el monto máximo permitido para tu anticipo. Reduce los importes para enviar.';
    if (!Object.keys(errs).length && t <= 0) errs._total = 'El anticipo debe ser mayor a $0.';
    return { errs, total: t, ok: !Object.keys(errs).length }; }
  antSubmit(folio, user) {
    if (this._antBusy) return; const r = this.antReq(folio), uid = this.svUid(user);
    const fail = msg => this.notifySuccess({ title: 'No se envió el anticipo', message: msg, refLabel: 'Folio', refValue: folio, status: 'Sin cambios' });
    if (!r || r.uid !== uid) return fail('Solo el titular del folio puede solicitar su anticipo.');
    const e = this.antElig(r); if (e.k !== 'disponible') return fail(e.k === 'existe' ? 'Ya existe un anticipo abierto para este viaje (un solo anticipo abierto por viaje).' : (e.text || 'El anticipo no está disponible para este folio.'));
    const f = ((this.state.an || {}).form || {}), prop = this.antPropForm(r, f), v = this.antValidate(prop, { ...(f.sol || {}), ...(f.extra || {}) }); if (!v.ok || !f.decl) return fail('Revisa los importes y acepta la declaración de uso.');
    this._antBusy = true; const when = this.nowStamp(), n = this.antRecs().filter(a => a.folio === folio).length + 1;
    const sol = {}, fs = f.sol || {}; prop.lines.forEach(l => { if (l.na) return; sol[l.concepto] = l.extra ? this.presNum(f.extra[l.concepto]) : l.editable ? (fs[l.concepto] != null && fs[l.concepto] !== '' ? this.presNum(fs[l.concepto]) : 0) : l.max; });
    const fdep = this.antFechasDep(when);
    const cu = this.antCuenta(uid), rec = { id: 'ANT-' + folio + (n > 1 ? '-' + n : ''), folio, uid, estado: 'autorizado', fechasDep: fdep, propuesta: { ...prop, congeladaEn: when }, sol, declaracion: { acepta: true, when }, pago: { texto: cu.texto, ref: cu.ref, banco: cu.banco, titular: cu.titular, origen: 'ERP' },
      cadenaIds: [], cadenaLbl: [], decisiones: [], creado: when, enviado: when, canal: 'Portal web' };
    this.setState(s => ({ an: { ...this.antPut(s, rec), form: {}, tried: false },
      pv: { ...s.pv, events: (s.pv.events || []).concat([this.antEv(user, folio, 'Creación', 'Generó la propuesta de anticipo calculada por el sistema (congelada)', '—', 'Máximo propuesto ' + this.antM(prop.total) + ' · ' + prop.lines.filter(l => !l.na).map(l => l.concepto + ' ' + this.antM(l.max)).join(' · '), { tone: 'gris', text: 'Calculado' }),
        this.antEv(user, folio, 'Creación', 'Solicitó el anticipo', 'En proceso', 'Por contabilizar · depósito ' + this.antFechasTxt(fdep) + ' · ' + this.antM(v.total) + ' solicitado de ' + this.antM(prop.total) + ' propuesto · declaración de uso aceptada', { tone: 'azul', text: 'Enviado' })]) } }),
      () => { this._antBusy = false; this.notifySuccess({ title: 'Anticipo solicitado', message: 'Tu solicitud de anticipo por ' + this.antM(v.total) + ' pasó a Contabilidad / Tesorería, que la contabiliza y la programa para pago. Fechas posibles de depósito: ' + this.antFechasTxt(fdep) + '.', refLabel: 'Folio', refValue: folio, status: 'Por contabilizar' }); });
  }
  antCancelOwn(a, user) {
    if (!['pendAut', 'autorizado'].includes(a.estado) || a.contab || a.uid !== this.svUid(user)) return;
    this.askConfirm({ title: 'Cancelar la solicitud de anticipo · folio ' + a.folio, summary: 'Una solicitud de anticipo enviada no se edita: se cancela y, si lo necesitas, se solicita otra. La cancelación queda auditada con su motivo; el viaje no cambia.',
      rows: [{ label: 'Estatus del anticipo', before: 'Por contabilizar', after: 'Cancelado' }, { k: 'Monto solicitado', v: this.antM(this.antLines(a).tSol) }], field: { label: 'Motivo de la cancelación *', key: 'motivo', placeholder: 'Describe brevemente el motivo' }, cta: 'Cancelar anticipo', danger: true,
      onPrimary: vals => { const m = String((vals && vals.motivo) || '').trim(); if (!m) return false; const cur = this.antRecs().find(x => x.id === a.id); if (!cur || !['pendAut', 'autorizado'].includes(cur.estado) || cur.contab) return true;
        const rec = { ...cur, estado: 'cancelado', motivo: m, cancelado: { byId: this.svUid(user), when: this.nowStamp(), motivo: m } };
        this.setState(s => ({ an: this.antPut(s, rec), pv: { ...s.pv, events: (s.pv.events || []).concat([this.antEv(user, a.folio, 'Cancelación', 'Canceló su solicitud de anticipo', 'Por contabilizar', 'Cancelado · ' + m, { tone: 'gris', text: 'Cancelado' })]) } }),
          () => this.notifySuccess({ title: 'Anticipo cancelado', message: 'La solicitud de anticipo quedó cancelada. Puedes solicitar otro mientras el viaje cumpla las condiciones.', refLabel: 'Folio', refValue: a.folio, status: 'Cancelado' })); return true; } });
  }
  antDecide(id, res, mt, motivo, user) {
    if (this._antBusy) return; const uid = this.svUid(user), a0 = this.antRecs().find(x => x.id === id);
    if (!a0 || this.antTurn(a0) !== uid || a0.uid === uid || !this.antCapOf('aut-ant', 'AU', user)) { this.notifySuccess({ title: 'Paso ya resuelto', message: 'Este paso del anticipo ya no está en tu turno (se resolvió en otra sesión o no tienes permiso de autorizar). No se aplicó ningún cambio.', refLabel: 'Folio', refValue: a0 ? a0.folio : '—', status: 'Sin cambios' }); return; }
    this._antBusy = true; const when = this.nowStamp(), ch = a0.cadenaIds || [], p = this.antPaso(a0), last = res === 'aprobada' && p + 1 >= ch.length, r = this.antReq(a0.folio), l = this.antLines(a0), tr = this.antOwner(r);
    const d = { paso: p, res, byId: uid, when, canal: 'Portal web · ' + (((this.state.width || 1200) < 760) ? 'teléfono' : 'escritorio'), ...(res === 'rechazada' ? { motivoTipo: mt, motivo } : {}) };
    const rec = { ...a0, decisiones: (a0.decisiones || []).concat([d]), estado: res === 'rechazada' ? 'rechazado' : last ? 'autorizado' : 'pendAut', ...(res === 'rechazada' ? { motivo: [mt, motivo].filter(Boolean).join(' · ') } : {}) };
    const extra = last ? Math.round((l.tSol - this.antReservaNeta(a0.folio)) * 100) / 100 : 0, bol = extra > 0 ? this.antBolsa(r) : null;
    const cons = ((this.state.data && this.state.data.USERS) || []).filter(u => u.role === 'CON');
    this.setState(s => { let notices = { ...s.sv.notices };
      if (res === 'rechazada') notices = this.antNotice(notices, a0.uid, { text: 'Anticipo del folio ' + a0.folio + ' rechazado. Motivo: ' + rec.motivo + '.', target: 'anticipo', folio: a0.folio, tone: 'rojo' });
      if (last) { notices = this.antNotice(notices, a0.uid, { text: 'Anticipo del folio ' + a0.folio + ' autorizado por ' + this.antM(l.tSol) + '. Contabilidad / Tesorería procesa la transferencia.', target: 'anticipo', folio: a0.folio, tone: 'verde' }); }
      return { an: this.antPut(s, rec), pres: bol ? this.presAddMov(s, { bolsa: bol.bolsa, periodo: bol.periodo, tipo: 'Reserva', importe: extra, folio: a0.folio, uid: a0.uid, evento: 'Autorización del anticipo · compromiso adicional sobre la reserva del folio', actor: user.name, actorRol: user.roleLabel, origen: 'Proceso' }) : s.pres,
        sv: { ...s.sv, notices }, pv: { ...s.pv, events: (s.pv.events || []).concat([this.antEv(user, a0.folio, 'Autorización', (res === 'aprobada' ? 'Autorizó' : 'Rechazó') + ' el anticipo (paso ' + (p + 1) + ' de ' + ch.length + ')', 'Pendiente autorización', res === 'rechazada' ? 'Rechazado · ' + rec.motivo : last ? 'Autorizado · ' + this.antM(l.tSol) + ' comprometido' : 'Pendiente autorización · sigue ' + this.apName(ch[p + 1]), { tone: res === 'aprobada' ? 'verde' : 'rojo', text: res === 'aprobada' ? 'Autorizado' : 'Rechazado' }, 'Autorización')])
          .concat(bol ? [{ ...this.presEv(user, a0.folio, 'Comprometió la diferencia del anticipo sobre la reserva del folio', this.antM(this.antReservaNeta(a0.folio)) + ' reservado', '+ ' + this.antM(extra) + ' comprometido', { tone: 'azul', text: 'Comprometido' }), field: 'Comprometido · ' + this.apEnt(r) }] : []) } }; },
      () => { this._antBusy = false; this.setState(s => ({ an: { ...s.an, sel: null } })); this.notifySuccess({ title: res === 'aprobada' ? 'Anticipo autorizado' : 'Anticipo rechazado', message: res === 'rechazada' ? 'El anticipo quedó rechazado; ' + (tr ? tr.name : 'el viajero') + ' recibirá el motivo en su folio.' : last ? 'Se completó la cadena: el anticipo pasa a Contabilidad / Tesorería para contabilizarse y transferirse.' + (extra > 0 ? ' Se comprometieron ' + this.antM(extra) + ' adicionales a la reserva del folio.' : ' El importe ya estaba comprometido por la reserva del folio.') : 'El anticipo sigue Pendiente autorización con ' + this.apName(ch[p + 1]) + '.', refLabel: 'Folio', refValue: a0.folio, status: this.antStText(rec.estado) }); });
  }
  antErpFail(fn) { if (((this.state.an || {}).demo) !== 'erpData') return false; this._antRetry = fn; this.setState({ af: { kind: 'erpError', v: {}, tried: false } }); return true; }
  antTake(a, user) { const uid = this.svUid(user), cur = this.antRecs().find(x => x.id === a.id); if (!cur || this.antLockedByOther(cur, uid)) return;
    const rec = { ...cur, lock: { byId: uid, when: this.nowStamp() } }; this.setState(s => ({ an: this.antPut(s, rec), pv: { ...s.pv, events: (s.pv.events || []).concat([this.antEv(user, a.folio, 'Modificación', 'Tomó el anticipo para gestionarlo', 'Sin asignar', 'Tomado por ' + user.name, { tone: 'azul', text: 'Tomado' }, 'Contabilización')]) } })); }
  // CONTABILIZAR (cliente 2026-10-19): Contabilidad valida y contabiliza con el importe SOLICITADO (inmutable); si un importe no corresponde, RECHAZA.
  // Queda «Programado para pago»: el pago lo procesa Contabilidad / Tesorería en el ERP y el Portal consulta su estatus (por transferir · fecha de depósito → Realizado).
  antPoliza(when, i) { return 'PZ-' + when.split(' ')[0].split('/').reverse().join('').slice(0, 6) + '-' + String(Math.floor(Math.random() * 8000) + 1000 + (i || 0)); }
  antContabRec(c, user, when, pol) { const uid = this.svUid(user); return { ...c, estado: 'porTransferir', contab: { byId: uid, when, poliza: pol }, lock: null, pp: { when, byId: uid, fechaPago: this.antProgPago(when) } }; }
  antContab(a, user) {
    const uid = this.svUid(user), cur = this.antRecs().find(x => x.id === a.id); if (!cur || cur.estado !== 'autorizado' || this.antLockedByOther(cur, uid) || !this.antConCaps(user).va || !this.antCuenta(cur.uid).vigente) return;
    if (this.antErpFail(() => this.antContab(a, user))) return;
    const l = this.antLines(cur), rq = this.antReq(cur.folio), resN = this.antReservaNeta(cur.folio), extra = Math.round((l.tSol - resN) * 100) / 100, bolX = extra > 0 ? this.antBolsa(rq) : null, fp0 = this.antProgPago(this.nowStamp());
    this.askConfirm({ title: 'Contabilizar el anticipo · folio ' + a.folio, summary: 'Se contabiliza con el importe solicitado por el colaborador, sin modificarlo. El pago se procesa en el ERP; el Portal consulta su estatus y avisa al colaborador cuando se deposite.',
      rows: [{ label: 'Estatus', before: 'Por contabilizar', after: 'Programado para pago' }, { k: 'Importe a contabilizar', v: this.antM(l.tSol) + ' (solicitado)' }, { k: 'Depósito previsto', v: fp0.dia + ' ' + fp0.fecha },
        { k: 'Efecto presupuestal', v: extra > 0 ? 'Se comprometen ' + this.antM(extra) + ' adicionales a la reserva del folio (' + this.antM(resN) + '); todo pasará a En tránsito cuando el ERP confirme el depósito.' : 'Sin movimiento nuevo: el importe ya está Comprometido por la reserva del folio; pasará a En tránsito cuando el ERP confirme el depósito.' }], cta: 'Contabilizar anticipo',
      onPrimary: () => { const c2 = this.antRecs().find(x => x.id === a.id); if (!c2 || c2.estado !== 'autorizado' || this.antLockedByOther(c2, uid)) return true; const when = this.nowStamp(), pol = this.antPoliza(when), rec = this.antContabRec(c2, user, when, pol), fp = rec.pp.fechaPago;
        this.setState(s => ({ an: { ...this.antPut(s, rec), form: {}, tried: false }, pres: bolX ? this.presAddMov(s, { bolsa: bolX.bolsa, periodo: bolX.periodo, tipo: 'Reserva', importe: extra, folio: a.folio, uid: a.uid, evento: 'Contabilización del anticipo · compromiso adicional sobre la reserva del folio', actor: user.name, actorRol: user.roleLabel, origen: 'Proceso' }) : s.pres,
          sv: { ...s.sv, notices: this.antNotice(s.sv.notices, c2.uid, { text: this.antNotifText(rec), target: 'anticipo', folio: a.folio, tone: 'azul' }) },
          pv: { ...s.pv, events: (s.pv.events || []).concat([this.antEv(user, a.folio, 'Modificación', 'Contabilizó el anticipo · póliza ' + pol, 'Por contabilizar · ' + this.antM(l.tSol) + ' solicitado', 'Programado para pago · ' + this.antM(l.tSol) + ' contabilizado sin cambios · depósito previsto ' + fp.dia + ' ' + fp.fecha, { tone: 'verde', text: 'Contabilizado' }, 'Contabilización')]) } }),
          () => this.notifySuccess({ title: 'Anticipo contabilizado', message: 'El anticipo quedó contabilizado (póliza ' + pol + ') y programado para pago: depósito previsto el ' + fp.dia + ' ' + fp.fecha + '.' + (extra > 0 ? ' Se comprometieron ' + this.antM(extra) + ' adicionales a la reserva del folio.' : ''), refLabel: 'Folio', refValue: a.folio, status: 'Programado para pago' })); return true; } });
  }
  // SELECCIÓN MÚLTIPLE (uno, varios o todos): solo los seleccionados que siguen elegibles; cada anticipo recibe su póliza; nunca se modifica un importe.
  antContabLote(ids, user) { const uid = this.svUid(user); if (!this.antConCaps(user).va) return; const R0 = this.antRecs().filter(a => ids.includes(a.id) && a.estado === 'autorizado' && !this.antLockedByOther(a, uid) && this.antCuenta(a.uid).vigente); if (!R0.length) return;
    if (this.antErpFail(() => this.antContabLote(ids, user))) return;
    const fp0 = this.antProgPago(this.nowStamp()), tot = R0.reduce((n, a) => n + this.antLines(a).tSol, 0), one = R0.length === 1;
    this.askConfirm({ title: 'Contabilizar ' + R0.length + (one ? ' anticipo' : ' anticipos'), summary: 'Se contabiliza' + (one ? '' : 'n') + ' de un solo paso con el importe solicitado por cada colaborador, sin modificarlo; cada anticipo recibe su póliza. El pago se procesa en el ERP y el Portal consulta su estatus (por transferir o fecha de depósito).',
      rows: [{ k: one ? 'Folio' : 'Folios', v: R0.map(a => a.folio + ' · ' + this.antM(this.antLines(a).tSol)).join(' · ') }, { k: 'Importe total', v: this.antM(tot) }, { label: 'Estatus', before: 'Por contabilizar', after: 'Programado para pago' }, { k: 'Depósito previsto', v: fp0.dia + ' ' + fp0.fecha }], cta: 'Contabilizar',
      onPrimary: () => { const when = this.nowStamp(), R1 = R0.map(a => this.antRecs().find(x => x.id === a.id)).filter(c => c && c.estado === 'autorizado' && !this.antLockedByOther(c, uid)), pols = R1.map((c, i) => this.antPoliza(when, i)); if (!R1.length) return true;
        this.setState(s => { let an = { ...(s.an || {}), selIds: [] }, pres = s.pres, notices = { ...s.sv.notices }; const evs = [];
          R1.forEach((c, i) => { const l = this.antLines(c), pol = pols[i], rec = this.antContabRec(c, user, when, pol), fp = rec.pp.fechaPago, r = this.antReq(c.folio), extra = Math.round((l.tSol - this.antReservaNeta(c.folio)) * 100) / 100, b = extra > 0 ? this.antBolsa(r) : null; an = this.antPut({ an }, rec);
            if (b) pres = this.presAddMov({ pres }, { bolsa: b.bolsa, periodo: b.periodo, tipo: 'Reserva', importe: extra, folio: c.folio, uid: c.uid, evento: 'Contabilización del anticipo · compromiso adicional sobre la reserva del folio', actor: user.name, actorRol: user.roleLabel, origen: 'Proceso' });
            notices = this.antNotice(notices, c.uid, { text: this.antNotifText(rec), target: 'anticipo', folio: c.folio, tone: 'azul' });
            evs.push(this.antEv(user, c.folio, 'Modificación', 'Contabilizó el anticipo (selección múltiple) · póliza ' + pol, 'Por contabilizar · ' + this.antM(l.tSol), 'Programado para pago · contabilizado sin cambios · depósito previsto ' + fp.dia + ' ' + fp.fecha, { tone: 'verde', text: 'Contabilizado' }, 'Contabilización')); });
          return { an, pres, sv: { ...s.sv, notices }, pv: { ...s.pv, events: (s.pv.events || []).concat(evs) } }; },
          () => this.notifySuccess({ title: R1.length === 1 ? 'Anticipo contabilizado' : 'Anticipos contabilizados', message: R1.length + (R1.length === 1 ? ' anticipo quedó contabilizado y programado' : ' anticipos quedaron contabilizados y programados') + ' para pago: depósito previsto el ' + fp0.dia + ' ' + fp0.fecha + '. Pólizas: ' + R1.map((c, i) => c.folio + ' · ' + pols[i]).join(' · ') + '.', refLabel: R1.length === 1 ? 'Folio' : 'Folios', refValue: R1.map(c => c.folio).join(', '), status: 'Programado para pago' })); return true; } });
  }
  // CONSULTA DE ESTATUS AL ERP (cliente 2026-10-19): en producción el Portal la ejecuta los martes y jueves; el ERP regresa «Por transferir» o la fecha en que se depositó (→ Realizado).
  // En el prototipo la dispara el control «Simulación» (MODO DEMO); «Condición del anticipo» simula la respuesta («Por transferir» · falla de integración). No hay integración real.
  antJobErp(user) { const R0 = this.antRecs().filter(a => (a.estado === 'porTransferir' || a.estado === 'devuelto') && this.antCuenta(a.uid).vigente); if (!R0.length) { this.notifySuccess({ title: 'Consulta al ERP sin cambios', message: 'No hay anticipos programados para pago.', status: 'Sin cambios', negative: false }); return; }
    if (this.antErpFail(() => this.antJobErp(user))) return; const when = this.nowStamp(), sys = { ...user, name: 'Proceso automático · consulta de estatus al ERP', roleLabel: 'Sistema' };
    if (((this.state.an || {}).demo) === 'erpPend') { this.setState(s => { let an = s.an; R0.forEach(a => { an = this.antPut({ an }, { ...a, erp: { when, estatus: 'Por transferir' } }); });
        return { an, pv: { ...s.pv, events: (s.pv.events || []).concat(R0.map(a => this.antEv(sys, a.folio, 'Consulta', 'Consultó el estatus del pago en el ERP', 'Programado para pago', 'ERP: por transferir', { tone: 'azul', text: 'Por transferir' }, 'Contabilización'))) } }; },
        () => this.notifySuccess({ title: 'Estatus consultado en el ERP', message: 'Simulación: el ERP regresó «Por transferir» para ' + R0.length + (R0.length === 1 ? ' anticipo; sigue' : ' anticipos; siguen') + ' en Programados para pago.', refLabel: R0.length > 1 ? 'Folios' : 'Folio', refValue: R0.map(a => a.folio).join(', '), status: 'Por transferir', negative: false })); return; }
    this.antTransfer(R0.map(a => a.id), sys, null, 'ERP-TRF-' + String(Math.floor(Math.random() * 90000) + 10000), null, null, true); }
  // Confirmación de depósito (individual o lote): fecha no futura + referencia; → ANT_Realizado + renglón «Anticipo» (En tránsito) + aviso al colaborador.
  antTransfer(ids, user, fecha, ref, importeInd, justInd, job) {
    const uid = this.svUid(user), R = this.antRecs().filter(a => ids.includes(a.id) && (a.estado === 'porTransferir' || a.estado === 'devuelto') && !this.antLockedByOther(a, uid)); if (!R.length) return; const when = this.nowStamp();
    if (!job && this.antErpFail(() => this.antTransfer(ids, user, fecha, ref, importeInd, justInd))) return;
    const fecha0 = fecha; this.setState(s => { let an = s.an, pres = s.pres, notices = { ...s.sv.notices }, evs = [];
      R.forEach((a, i) => { const r = this.antReq(a.folio), l = this.antLines(a), dev = (a.transfers || []).filter(t => t.estado === 'devuelta').slice(-1)[0], base = dev ? dev.importe : l.tApr, imp = R.length === 1 && importeInd != null ? importeInd : base, rf = R.length > 1 ? ref + '-' + (i + 1) : ref;
        const n = (a.transfers || []).length + 1, b = this.antBolsa(r), cu = this.antCuenta(a.uid), pz = this.antPlazos(r), fecha = fecha0 || ((a.pp || {}).fechaPago || {}).fecha || this.nowStamp().split(' ')[0];
        an = this.antPut({ an }, { ...a, estado: 'realizado', ...(job ? { erp: { when, estatus: 'Depositado' } } : {}), transfers: (a.transfers || []).concat([{ n, tipo: dev ? 'Anticipo · reproceso de la devolución' : 'Anticipo', importe: imp, fecha, referencia: rf, estado: 'aplicada', byId: uid, when, ...(job ? { auto: true, aviso: 'Correo + Portal' } : {}), ...(imp !== base ? { justificacion: justInd } : {}) }]) });
        if (b) pres = this.presAddMov({ pres }, { bolsa: b.bolsa, periodo: b.periodo, tipo: 'Anticipo', importe: imp, folio: a.folio, uid: a.uid, evento: 'Transferencia del anticipo · depósito confirmado' + (job ? ' por consulta automática al ERP' : '') + ' · ref. ' + rf, actor: user.name, actorRol: job ? 'Sistema' : 'Contabilidad / Tesorería', fuente: 'ERP', origen: 'Web' });
        notices = this.antNotice(notices, a.uid, { text: 'Anticipo del folio ' + a.folio + ' depositado: ' + this.antM(imp) + ' en tu cuenta ' + cu.ref + '.' + (pz ? ' Tu plazo de comprobación corre al concluir el viaje: inicia a más tardar el ' + pz.iniciar + '.' : ''), target: 'anticipo', folio: a.folio, tone: 'verde' });
        evs.push(this.antEv(user, a.folio, 'Modificación', (job ? 'Consulta de estatus al ERP: depositado, aviso enviado por correo y Portal' : 'Confirmó el depósito del anticipo') + ' · ref. ' + rf + ' · fecha de aplicación ' + fecha, 'Transferencia en proceso', 'Realizado · ' + this.antM(imp) + (imp !== base ? ' (aprobado ' + this.antM(base) + ') · ' + justInd : ''), { tone: 'verde', text: 'Depositado' }, 'Contabilización'),
          { ...this.presEv(user, a.folio, 'Registró el anticipo en tránsito', this.antM(imp) + ' comprometido', this.antM(imp) + ' en tránsito', { tone: 'azul', text: 'En tránsito' }), field: 'En tránsito · ' + this.apEnt(r) }); });
      return { an, pres, sv: { ...s.sv, notices }, af: null, pv: { ...s.pv, events: (s.pv.events || []).concat(evs) } }; },
      () => this.notifySuccess({ title: R.length > 1 ? 'Depósitos confirmados' : 'Depósito confirmado', message: (job ? 'Simulación de la consulta al ERP: estatus «Depositado». ' : '') + (R.length > 1 ? R.length + ' anticipos quedaron' : 'El anticipo quedó') + ' Realizado; ' + (R.length > 1 ? 'cada colaborador recibió' : 'el colaborador recibió') + ' el aviso con el monto y la cuenta' + (job ? ' por correo y en el Portal' : '') + '. El importe pasó a En tránsito en su bolsa.', refLabel: R.length > 1 ? 'Folios' : 'Folio', refValue: R.map(a => a.folio).join(', '), status: 'Realizado' }));
  }
  antAjuste(a, user, fecha, ref) { const cur = this.antRecs().find(x => x.id === a.id), t0 = cur && (cur.transfers || []).find(t => t.estado === 'porTransferir'); if (!t0) return; const r = this.antReq(a.folio), b = this.antBolsa(r), when = this.nowStamp(), uid = this.svUid(user);
    const rec = { ...cur, transfers: cur.transfers.map(t => t === t0 ? { ...t, estado: 'aplicada', fecha, referencia: ref, byId: uid, when } : t) };
    this.setState(s => ({ an: this.antPut(s, rec), af: null, pres: b ? this.presAddMov(s, { bolsa: b.bolsa, periodo: b.periodo, tipo: 'Anticipo', importe: t0.importe, folio: a.folio, uid: a.uid, evento: 'Segunda transferencia · ' + t0.tipo.toLowerCase() + ' · ref. ' + ref, actor: user.name, actorRol: 'Contabilidad / Tesorería', fuente: 'ERP', origen: 'Web' }) : s.pres,
      sv: { ...s.sv, notices: this.antNotice(s.sv.notices, a.uid, { text: 'Complemento del anticipo del folio ' + a.folio + ' depositado: ' + this.antM(t0.importe) + ' (' + t0.tipo.toLowerCase() + ').', target: 'anticipo', folio: a.folio, tone: 'verde' }) },
      pv: { ...s.pv, events: (s.pv.events || []).concat([this.antEv(user, a.folio, 'Modificación', 'Confirmó el complemento del anticipo (' + t0.tipo.toLowerCase() + ') · ref. ' + ref, 'Complemento por transferir', 'Complemento aplicado · ' + this.antM(t0.importe), { tone: 'verde', text: 'Depositado' }, 'Contabilización')]) } }),
      () => this.notifySuccess({ title: 'Complemento confirmado', message: 'El complemento se registró como segunda transferencia del MISMO anticipo (no es un anticipo nuevo) y pasó a En tránsito.', refLabel: 'Folio', refValue: a.folio, status: 'Realizado' })); }
  antDevolucion(a, user, causa, det) { const cur = this.antRecs().find(x => x.id === a.id); if (!cur || cur.estado !== 'realizado') return; const tl = (cur.transfers || []).filter(t => t.estado === 'aplicada').slice(-1)[0]; if (!tl) return;
    const r = this.antReq(a.folio), b = this.antBolsa(r), when = this.nowStamp(), uid = this.svUid(user), cz = causa + (det ? ' · ' + det : '');
    const rec = { ...cur, estado: 'devuelto', transfers: cur.transfers.map(t => t === tl ? { ...t, estado: 'devuelta', devolucion: { causa: cz, when, byId: uid } } : t) };
    this.setState(s => ({ an: this.antPut(s, rec), af: null, pres: b ? this.presAddMov(s, { bolsa: b.bolsa, periodo: b.periodo, tipo: 'Anticipo', importe: -tl.importe, folio: a.folio, uid: a.uid, evento: 'Devolución bancaria del anticipo · ' + cz, actor: user.name, actorRol: 'Contabilidad / Tesorería', fuente: 'ERP', origen: 'Web' }) : s.pres,
      sv: { ...s.sv, notices: this.antNotice(s.sv.notices, a.uid, { text: 'El banco devolvió la transferencia del anticipo del folio ' + a.folio + ': ' + cz + '. Si tu cuenta cambió, actualízala con Capital Humano (ERP).', target: 'anticipo', folio: a.folio, tone: 'amarillo' }) },
      pv: { ...s.pv, events: (s.pv.events || []).concat([this.antEv(user, a.folio, 'Modificación', 'Registró la devolución bancaria del anticipo', 'Realizado · ' + this.antM(tl.importe), 'Transferencia devuelta · reabierto · ' + cz, { tone: 'amarillo', text: 'Devuelto' }, 'Contabilización'), { ...this.presEv(user, a.folio, 'Revirtió el anticipo en tránsito por devolución bancaria', this.antM(tl.importe) + ' en tránsito', this.antM(tl.importe) + ' comprometido', { tone: 'amarillo', text: 'Revertido' }), field: 'En tránsito · ' + this.apEnt(r) }]) } }),
      () => this.notifySuccess({ title: 'Devolución registrada', message: 'El anticipo se reabrió con la causa visible, conservando todo su historial. Queda en Programados para pago hasta que el ERP lo deposite de nuevo.', refLabel: 'Folio', refValue: a.folio, status: 'Transferencia devuelta' })); }
  antRechazarCon(a, user, tipo, mt, det) { const cur = this.antRecs().find(x => x.id === a.id); if (!cur || cur.estado !== 'autorizado' || !this.antConCaps(user).va) return; const r = this.antReq(a.folio), when = this.nowStamp(), m = [mt, det].filter(Boolean).join(' · ').trim().replace(/[.\s]+$/, '');
    const extra = this.presData() ? this.presData().movs.filter(x => x.folio === a.folio && x.tipo === 'Reserva' && /anticipo/i.test(x.evento || '')).reduce((n, x) => n + x.importe, 0) : 0, b = extra > 0 ? this.antBolsa(r) : null;
    const rec = { ...cur, estado: tipo, motivo: m, lock: null, [tipo === 'rechazado' ? 'rechazoCon' : 'cancelado']: { byId: this.svUid(user), when, motivo: m } };
    this.setState(s => ({ an: this.antPut(s, rec), af: null, pres: b ? this.presAddMov(s, { bolsa: b.bolsa, periodo: b.periodo, tipo: 'Liberación por cancelación', importe: -extra, folio: a.folio, uid: a.uid, evento: (tipo === 'rechazado' ? 'Rechazo' : 'Cancelación') + ' del anticipo por Contabilidad · ' + m, actor: 'Proceso automático', actorRol: 'Sistema', origen: 'Proceso' }) : s.pres,
      sv: { ...s.sv, notices: this.antNotice(s.sv.notices, a.uid, { text: 'Anticipo del folio ' + a.folio + ' ' + (tipo === 'rechazado' ? 'rechazado' : 'cancelado') + ' por Contabilidad. Motivo: ' + m + '.' + (tipo === 'rechazado' ? ' Solicítalo de nuevo con el importe correcto.' : ''), target: 'anticipo', folio: a.folio, tone: 'rojo' }) },
      pv: { ...s.pv, events: (s.pv.events || []).concat([this.antEv(user, a.folio, tipo === 'rechazado' ? 'Autorización' : 'Cancelación', (tipo === 'rechazado' ? 'Rechazó' : 'Canceló') + ' el anticipo (Contabilidad)', this.antStText(cur.estado), this.antStText(tipo) + ' · ' + m, { tone: tipo === 'rechazado' ? 'rojo' : 'gris', text: this.antStText(tipo) }, 'Contabilización')]) } }),
      () => this.notifySuccess({ title: 'Anticipo ' + (tipo === 'rechazado' ? 'rechazado' : 'cancelado'), message: 'El colaborador recibió el motivo en su folio y puede solicitar de nuevo el anticipo con el importe correcto.' + (b ? ' Se liberó el compromiso adicional del anticipo (' + this.antM(extra) + ').' : ' La reserva del viaje no cambia.'), refLabel: 'Folio', refValue: a.folio, status: this.antStText(tipo) })); }
  // Diálogos de captura (mismo diálogo compartido del Portal): motivo con catálogo + texto, confirmación de depósito, devolución, error de integración.
  antHist(a) { const ev = [], N = id => this.apName(id), ch = a.cadenaIds || [], l = this.antLines(a);
    ev.push({ when: a.enviado, accion: 'Solicitó el anticipo', user: N(a.uid), detail: this.antM(l.tSol) + ' solicitado de ' + this.antM(l.p.total) + ' propuesto por el sistema · declaración de uso aceptada', res: ['Enviado', 'azul'] });
    (a.decisiones || []).forEach(d => ev.push({ when: d.when, accion: (d.res === 'aprobada' ? 'Autorizó' : 'Rechazó') + ' el anticipo · paso ' + (d.paso + 1) + ' de ' + ch.length, user: N(d.byId), detail: (d.res === 'rechazada' ? 'Motivo: ' + [d.motivoTipo, d.motivo].filter(Boolean).join(' · ') + ' · ' : '') + (d.canal || 'Portal web'), res: d.res === 'aprobada' ? ['Autorizado', 'verde'] : ['Rechazado', 'rojo'] }));
    if (a.cancelado) ev.push({ when: a.cancelado.when, accion: 'Canceló el anticipo', user: N(a.cancelado.byId), detail: 'Motivo: ' + a.cancelado.motivo, res: ['Cancelado', 'gris'] });
    if (a.lock && a.lock.byId) ev.push({ when: a.lock.when, accion: 'Tomó el anticipo para gestionarlo', user: N(a.lock.byId), detail: 'Contabilidad / Tesorería', res: ['Tomado', 'azul'] });
    if (a.contab) ev.push({ when: a.contab.when, accion: 'Contabilizó el anticipo · póliza ' + a.contab.poliza, user: N(a.contab.byId), detail: this.antM(l.tSol) + ' contabilizado sin cambios (importe solicitado)', res: ['Contabilizado', 'verde'] });
    if (a.erp && a.erp.estatus === 'Por transferir') ev.push({ when: a.erp.when, accion: 'Consulta de estatus al ERP', user: 'Proceso automático', detail: 'ERP: por transferir', res: ['Por transferir', 'azul'] });
    (a.transfers || []).forEach(t => { if (t.estado !== 'porTransferir') ev.push({ when: t.when, accion: (t.n > 1 ? 'Confirmó el complemento · ' : t.auto ? 'El ERP reportó el depósito · ' : 'Confirmó la transferencia · ') + t.tipo.toLowerCase(), user: t.auto ? 'Proceso automático · consulta al ERP' : N(t.byId), detail: this.antM(t.importe) + ' · aplicada el ' + t.fecha + ' · ref. ' + t.referencia, res: ['Depositado', 'verde'] });
      else ev.push({ when: t.when, accion: 'Registró un complemento por transferir · ' + t.tipo.toLowerCase(), user: 'Viáticos', detail: this.antM(t.importe) + ' · ' + (t.motivo || ''), res: ['Por transferir', 'azul'] });
      if (t.devolucion) ev.push({ when: t.devolucion.when, accion: 'Registró la devolución bancaria', user: N(t.devolucion.byId), detail: 'Causa: ' + t.devolucion.causa, res: ['Devuelto', 'amarillo'] }); });
    if (a.rechazoCon) ev.push({ when: a.rechazoCon.when, accion: 'Rechazó el anticipo (Contabilidad)', user: N(a.rechazoCon.byId), detail: 'Motivo: ' + a.rechazoCon.motivo, res: ['Rechazado', 'rojo'] });
    return ev.filter(e => e.when).sort((x, y) => this.mvTs(x.when) - this.mvTs(y.when)).map((e, i, arr) => ({ ...e, result: e.res[0], ...(this.TONES[e.res[1]] ? { bg: this.TONES[e.res[1]].bg, border: this.TONES[e.res[1]].border } : {}), dur: i ? this.apDur(arr[i - 1].when, e.when) : '—' })); }
  antRender(ctx) {
    const bl = { notif: { when: '', text: '' }, hasNotif: false, showCalcBtn: false, rows: [], banners: [], trip: [], heads: [], lines: [], totals: [], pago: [], info: [], budget: [], warns: [], chain: [], transfers: [], hist: [], bar: { show: false, btns: [] }, decl: {}, dep: { show: false, dates: [] }, add: { show: false, opts: [] } };
    const blank = { isAN: false, anShowTabs: false, anTabs: [], anHasTabNote: false, anTabNote: '', anHasActs: false, anActs: [], anCrumbs: [], anHasActNote: false, anActNote: '', anShowPanel: false, anPanel: {}, anShowDetail: false, anBack: { label: '', go: () => {} }, anPurpose: '', and: { found: false, notFound: false, ...bl } };
    if (!ctx.isAN || !this.PV || !this.ANT) return blank;
    const { user, narrow, isMobile, route } = ctx, s = this.state, an = s.an || {}, T = this.TONES, uid = this.svUid(user), P = this.antPar(), S = (this.PV.ERP_EXTRA || {});
    const tone = t => T[t] || T.gris, bdg = (text, t) => ({ text, bg: tone(t).bg, border: tone(t).border, fg: '#4A4F54' });
    const setAN = p => this.setState(st => ({ an: { ...(st.an || {}), ...p } }));
    const toTop = () => setTimeout(() => { const r0 = this.rootRef.current, m = r0 && r0.querySelector('main'); if (m) m.scrollTop = 0; }, 30);
    const open = f => { setAN({ sel: f, form: {}, tried: false, showCalc: false }); toTop(); };
    const out = { ...blank, isAN: true, anIcon: { back: 'M19 12H5M11 18l-6-6 6-6', money: this.glyph('money'), wallet: this.glyph('wallet'), chain: this.glyph('checkCircle'), list: this.glyph('list'), history: this.glyph('history'), route: this.glyph('route'), file: this.glyph('fileText'), alert: this.ICONS.amarillo } };
    const stOf = a => { const x = this.ANT_ST[a.estado] || [a.estado, 'gris']; return { text: x[0], tone: x[1] }; };
    const orgOf = id => { const u0 = ((s.data && s.data.USERS) || []).find(x => x.id === id) || {}; return u0.hospital || u0.direccion || '—'; };
    const ageOf = w => this.apAge(w).txt;
    // ---------- detalle compartido (viajero · autorizador · Contabilidad) ----------
    const detail = (r, a, mode) => {
      const owner = this.antOwner(r), e = this.antElig(r), lockMe = a && a.lock && a.lock.byId === uid, lockOther = a && this.antLockedByOther(a, uid), cc = this.antConCaps(user), cu = this.antCuenta(r.uid), pz = this.antPlazos(r);
      const form = mode === 'trav' && e.k === 'disponible', f = an.form || {}, prop = form ? this.antPropForm(r, f) : null, lin = a && !form ? this.antLines(a) : null;
      const isCon = mode === 'con';
      const st = form ? { text: e.rec && e.rec.estado === 'cancelado' ? 'En proceso · nueva solicitud' : 'En proceso · capturando', tone: 'azul' } : a ? stOf(a) : e.k === 'na' ? { text: 'No aplica', tone: 'gris' } : e.k === 'block' ? { text: 'No disponible', tone: 'amarillo' } : { text: e.text || '—', tone: 'gris' };
      const banners = [], B = (tn, title, text, act) => banners.push({ ...tone(tn), icon: this.ICONS[tn] || this.ICONS.info, title, text, hasAct: !!act, actLabel: act ? act.label : '', onAct: act ? act.go : () => {} });
      if (e.k === 'na') B('info', 'Anticipo · No aplica', e.long || e.text, r.travelerType === 'externo' ? null : { label: 'Ir a Comprobación', go: () => this.goFolio('comprobacion', r.folio) });
      if (e.k === 'block') B(e.b === 'cuenta' ? 'amarillo' : 'rojo', e.title, e.text, e.b === 'cuenta' ? null : { label: 'Ver viaje', go: () => this.mvOpenFolio(r.folio) });
      if (form && e.rec && e.rec.estado === 'cancelado') B('info', 'Solicitud anterior cancelada', 'Cancelada el ' + (e.rec.cancelado || {}).when + ' · motivo: ' + e.rec.motivo + '. Puedes solicitar un nuevo anticipo.');
      if (form && e.rec && e.rec.estado === 'rechazado') B('rojo', 'Solicitud anterior rechazada por Contabilidad', 'Motivo: ' + this.antMotivo(e.rec) + '. Solicita de nuevo el anticipo con el importe correcto.');
      if (a && a.estado === 'rechazado') B('rojo', 'Anticipo rechazado por Contabilidad', 'Motivo: ' + this.antMotivo(a) + '.' + (a.rechazoCon ? ' Rechazado por ' + this.apName(a.rechazoCon.byId) + ' el ' + a.rechazoCon.when + '.' : '') + (mode === 'trav' ? ' Solicita de nuevo el anticipo con el importe correcto mientras el viaje cumpla las condiciones.' : ''));
      if (a && a.estado === 'cancelado' && !form) B('info', 'Anticipo cancelado', 'Motivo: ' + a.motivo + '.');
      if (a && a.estado === 'devuelto') { const dv = (a.transfers || []).filter(t => t.estado === 'devuelta').slice(-1)[0] || {}; B('amarillo', 'Transferencia devuelta por el banco · reabierto', 'Causa: ' + ((dv.devolucion || {}).causa || '—') + ' (' + ((dv.devolucion || {}).when || '') + '). ' + (mode === 'trav' ? 'Contabilidad reprocesa el depósito; si tu cuenta cambió, actualízala con Capital Humano (ERP).' : 'Sigue en Programados para pago: el ERP reprocesa el depósito cuando la cuenta esté vigente.')); }
      if (a && a.estado === 'realizado' && mode === 'trav' && pz) B('verde', 'Anticipo depositado', this.antM(this.antTransferido(a)) + ' en tu cuenta ' + cu.ref + '. ' + pz.text, { label: 'Ir a Comprobación', go: () => this.goFolio('comprobacion', r.folio) });
      if (mode === 'aut' && a && a.estado === 'pendAut' && this.antTurn(a) !== uid) B('info', 'Paso no disponible', 'Este paso ya no está en tu turno: se resolvió en otra sesión o lo atiende otro autorizador.');
      if (mode === 'aut' && a && this.antTurn(a) === uid && !this.antCapOf('aut-ant', 'AU', user)) B('amarillo', 'Solo lectura', 'Tu configuración de Usuarios y permisos no incluye «Autorizar» en Autorización › Anticipos.');
      if (mode === 'con' && lockOther) B('amarillo', 'Tomado por otro analista', 'Lo gestiona ' + this.apName(a.lock.byId) + ' desde el ' + a.lock.when + '. Para evitar operaciones dobles, el folio queda bloqueado para los demás analistas.');
      if (mode === 'con' && a && !cu.vigente && ['contabilizado', 'porTransferir', 'devuelto', 'autorizado'].includes(a.estado)) B('rojo', 'Cuenta bancaria no vigente', 'La cuenta de nómina del colaborador no está vigente en el ERP: el anticipo no se contabiliza ni se paga hasta que se actualice (Capital Humano HSM / ERP).');
      if (mode !== 'trav' && a && ['pendAut', 'autorizado', 'contabilizado'].includes(a.estado)) { const pv = this.antPrevPend(a.uid, a.folio); if (pv.length) B('amarillo', 'Anticipos previos sin comprobar', pv.join(' · ')); }
      // resumen del viaje (solo lo necesario para no confundir el folio)
      const segs = r.segmentos || [], av = segs.filter(x => x.medio === 'Avión'), hot = segs.filter(x => x.hospedaje === 'hotel'), nN = segs.reduce((n, x) => n + (x.noches || 0), 0);
      const trip = [{ k: 'Origen', v: (r.ruta && r.ruta.origen && r.ruta.origen.label) || r.origenTexto || '—' }, { k: segs.length > 1 ? 'Ruta' : 'Destino', v: segs.length > 1 ? segs.map(x => x.label).join(' → ') : (r.dest || '—') }, { k: 'Fechas', v: (r.fechas || '—') + (r.nights ? ' · ' + r.nights : '') },
        { k: 'Vuelo', v: av.length ? 'Avión · ' + av.map(x => x.label + (x.vuelo && x.vuelo.tipo === 'redondo' ? ' (ida y regreso)' : ' (solo ida)')).join(' · ') + ' · lo gestiona Viáticos' : 'Sin vuelo · ' + [...new Set(segs.map(x => x.medio))].join(' · ') },
        { k: 'Hospedaje', v: (() => { const pl2 = n => n + (n === 1 ? ' noche' : ' noches'), nHot = hot.reduce((n, x) => n + (x.noches || 0), 0), nHos = nN - nHot; return !nN ? 'Sin hospedaje' : [nHot ? 'Hotel externo: ' + pl2(nHot) : '', nHos > 0 ? 'en hospital: ' + pl2(nHos) : ''].filter(Boolean).join(' · ').replace(/^en/, 'En'); })() }, { k: 'Perfil aplicado al folio', v: r.perfilFolio || '—' }]
        .concat(r.rolGrupo === 'acompanante' ? [{ k: 'Viaje en grupo', v: 'Acompañante del folio ' + r.origenFolio + ' · este anticipo es solo de este folio' }] : r.rolGrupo === 'origen' ? [{ k: 'Viaje en grupo', v: 'Cada acompañante solicita su propio anticipo en su folio' }] : []);
      // conceptos
      // Cliente 2026-10-19: sin «Aprobado» ni «Diferencia». Contabilidad compara lo solicitado (inmutable) con el MONTO MÁXIMO POR POLÍTICA; el viajero nunca ve ese máximo.
      const heads = ['Concepto', form ? 'Monto solicitado' : 'Solicitado'].concat(isCon ? ['Monto máximo por política'] : []);
      const cardMode = isMobile || (isCon && narrow), lineCols = cardMode ? 'repeat(auto-fit,minmax(min(100%,150px),1fr))' : 'minmax(220px,2fr) ' + heads.slice(1).map(() => form ? 'minmax(200px,1.2fr)' : 'minmax(130px,1fr)').join(' ');
      const RO = this.RULE_ORIGIN, oTag = o => { if (o === 'solicitado') return { tag: 'Agregado por el colaborador', tagBg: '#F4F4F4', tagBorder: '#A9A8A9', tagFg: '#4A4F54' }; const x = RO[o] || RO.politica, c = o === 'destino' ? RO.politica : x; return { tag: x.tag, tagBg: c.bg, tagBorder: c.border, tagFg: c.fg }; };
      const vf = form ? this.antValidate(prop, { ...(f.sol || {}), ...(f.extra || {}) }) : null, tried = !!an.tried;
      const setExtra = (c, val) => this.setState(st2 => { const fm = ((st2.an || {}).form || {}), ex = { ...(fm.extra || {}) }; if (val === null) delete ex[c]; else ex[c] = val; return { an: { ...(st2.an || {}), form: { ...fm, extra: ex } } }; });
      const src = form ? prop.lines.map(l => ({ ...l, sol: l.max })) : lin ? lin.lines : [];
      const lines = src.map(l => { const sv = form ? (l.extra ? String((f.extra || {})[l.concepto] || '') : (f.sol || {})[l.concepto] != null ? (f.sol || {})[l.concepto] : (l.na ? '0' : l.editable ? '' : String(l.max))) : null, err = form && vf.errs[l.concepto] && (tried || (l.editable && (l.extra ? String((f.extra || {})[l.concepto] || '') !== '' : (f.sol || {})[l.concepto] != null))) ? vf.errs[l.concepto] : '';
        const trav = mode === 'trav', edTxt = form ? (l.extra ? 'Captura el importe que necesitas' : l.editable ? 'Editable · el sistema valida el máximo permitido' : 'Monto fijo por ' + (l.origen === 'global' ? 'parámetro global' : 'política')) : isCon && l.editable && !l.na ? 'Importe capturado por el colaborador' : '';
        const cells = [{ isConcept: true, lbl: '', name: l.concepto, calc: l.na ? l.why : trav ? (l.calcT || (l.extra ? l.calc : '')) : l.calc, ...oTag(l.origen), hasTag: !l.na, hasDetail: isCon && !!an.showCalc && (l.detail || []).length > 0, detail: l.detail || [], adj: isCon && l.maxOrig ? 'Ajustado al tope del perfil (calculado ' + this.antM(l.maxOrig) + ')' : '', hasAdj: isCon && !!l.maxOrig, edit: edTxt, hasEdit: !l.na && !!edTxt, editFg: form && l.editable ? '#0077A8' : '#777779', hasRemove: form && !!l.extra, onRemove: () => setExtra(l.concepto, null) }];
        if (form && l.editable && !l.na) cells.push({ isInput: true, lbl: 'Monto solicitado', value: sv, max: '', aria: 'Monto solicitado de ' + l.concepto, border: err ? '#F25757' : '#D0D2D3', err, hasErr: !!err,
          onChange: ev => { const val = ev.target.value; if (l.extra) { setExtra(l.concepto, val); return; } this.setState(st2 => ({ an: { ...(st2.an || {}), form: { ...((st2.an || {}).form || {}), sol: { ...(((st2.an || {}).form || {}).sol || {}), [l.concepto]: val } } } })); } });
        else cells.push({ isMoney: true, lbl: form ? 'Monto solicitado' : 'Solicitado', text: l.na ? '$0' : this.antM(form ? l.max : l.sol), fg: l.na ? '#777779' : '#4A4F54' });
        if (isCon) cells.push({ isMoney: true, lbl: 'Monto máximo por política', text: l.na ? (l.concepto === 'Autobús' ? 'Sin tarifa configurada' : 'No aplica') : l.extra ? 'Hasta ' + this.antM(l.max) + ' · tope del anticipo' : this.antM(l.max), fg: l.na ? '#777779' : '#4A4F54' });
        return { cells: cells.map(c => ({ isConcept: false, isMoney: false, isInput: false, ...c, showLbl: cardMode && !!c.lbl, span: cardMode && c.isConcept ? '1 / -1' : 'auto' })), bg: l.na ? '#F9F9F9' : '#fff' }; });
      const tSolF = form ? vf.total : lin ? lin.tSol : 0;
      const pr = form ? prop : lin ? lin.p : null;
      const totals = pr ? (isCon ? [{ k: 'Monto máximo determinado por sistema', v: this.antM(pr.total), sub: pr.tope ? (pr.ajustada ? 'La suma de conceptos (' + this.antM(pr.suma) + ') excede el tope; se ajustó a ' : 'Tope del anticipo: ') + this.antM(pr.tope.importe) + ' · ' + pr.tope.label : 'Sin tope configurado', big: false }] : [])
        .concat([{ k: form ? 'Monto de anticipo solicitado' : 'Solicitado', v: this.antM(tSolF), sub: isCon ? 'Importe capturado por el colaborador. Contabilidad no lo modifica: si no corresponde, rechaza la solicitud.' : '', big: true }]) : [];
      const totErr = form && vf.errs._total && tried ? vf.errs._total : '';
      // forma de pago + declaración
      const pago = [{ k: 'Forma de pago', v: (a && a.pago ? a.pago.texto : cu.texto) }, { k: 'Origen del dato', v: 'ERP · solo lectura · ' + (cu.vigente ? 'cuenta vigente' : 'cuenta NO vigente') }];
      const declOn = !!f.decl, declErr = form && tried && !declOn;
      const decl = { show: form, ...this.chk(declErr ? 'error' : declOn ? 'on' : 'off'), toggle: () => setAN({ form: { ...(an.form || {}), decl: !declOn } }), hasErr: declErr, text: 'Declaro que los recursos del anticipo se usarán exclusivamente para los gastos de este viaje conforme a la política de viáticos, que comprobaré su uso en los plazos establecidos y que cualquier importe no comprobado se reintegra o se descuenta vía nómina. La propina máxima comprobable es del ' + P.propinaMaxPct + ' % (se valida en la comprobación).' };
      // información operativa (Contabilidad / autorizador)
      const sx = S[r.uid] || {}, bol = mode !== 'trav' ? this.antBolsa(r) : null, resN = mode !== 'trav' ? this.antReservaNeta(r.folio) : 0;
      const info = mode === 'trav' ? [] : [{ k: 'Política aplicable', v: (r.perfilFolio || '—') + (pr && pr.tope ? ' · tope ' + this.antM(pr.tope.importe) + ' (' + (pr.tope.origen === 'excepcion' ? 'excepción individual' : 'política del perfil') + ')' : '') }, { k: 'Sociedad', v: this.socLabel(sx.sociedad) }, { k: 'CECO', v: sx.ceco || '—' }]
        .concat(mode === 'con' ? [{ k: 'Banco (ERP)', v: cu.banco }, { k: 'Cuenta', v: cu.ref }, { k: 'Vigencia de la cuenta', v: cu.vigente ? cu.vigHasta + ' · fecha del ERP' : 'No vigente · actualizar en Capital Humano HSM / ERP' }, { k: 'Póliza contable', v: a && a.contab ? a.contab.poliza : '— (se asigna al contabilizar)' }] : []);
      const enT = a ? this.antTransferido(a) : 0;
      const budget = mode === 'con' && a ? [{ k: 'Entidad · bolsa', v: this.apEnt(r) + (bol ? ' · ' + bol.bolsa + ' · ' + bol.periodo : ' · sin bolsa activa') }, { k: 'Comprometido del folio', v: this.antM(resN) + ' (reserva al aprobar el viaje' + (resN > r.total ? ' + compromiso adicional del anticipo' : '') + ')' },
        { k: 'Efecto al confirmar el depósito', v: a.estado === 'realizado' ? this.antM(enT) + ' ya en tránsito' : this.antM(lin ? lin.tApr : 0) + ' pasa de Comprometido a En tránsito (renglón «Anticipo» en Movimientos de bolsa)' }] : [];
      // Contabilización y pago (cliente 2026-10-19): sin cadena de Director; un solo paso de Contabilidad / Tesorería, la ÚNICA que rechaza el anticipo en esta etapa.
      const cst = !a ? null : a.estado === 'realizado' ? ['Depositado', 'verde'] : a.estado === 'devuelto' ? ['Devuelto', 'amarillo'] : a.estado === 'autorizado' ? ['Por contabilizar', 'azul'] : a.estado === 'rechazado' ? ['Rechazado', 'rojo'] : a.estado === 'cancelado' ? ['Cancelado', 'gris'] : ['Programado para pago', 'azul'];
      const mk = (tn, o) => ({ ...bdg(o.state, tn), mbg: tn === 'verde' ? '#A2C83A' : tn === 'azul' ? '#00A7E1' : tn === 'rojo' ? '#FEEDED' : '#fff', mfg: tn === 'verde' || tn === 'azul' ? '#fff' : tn === 'rojo' ? '#F25757' : '#777779', mborder: tn === 'verde' ? '#A2C83A' : tn === 'azul' ? '#00A7E1' : tn === 'rojo' ? '#F25757' : '#A9A8A9', hasTime: !!o.time, hasMotivo: !!o.motivo, n: 1, label: 'Contabilidad / Tesorería', ...o });
      const chain = form ? [mk('gris', { person: 'Contabiliza el anticipo; el pago se procesa en el ERP (sin autorización adicional)', state: 'Al enviar', time: '', motivo: '' })]
        : a ? [mk(cst[1], { state: cst[0], person: a.contab ? this.apName(a.contab.byId) : a.rechazoCon ? this.apName(a.rechazoCon.byId) : a.estado === 'cancelado' ? 'Cancelado por el colaborador' : 'Valida y contabiliza el anticipo; el pago se procesa en el ERP',
            time: a.contab ? 'Contabilizado ' + a.contab.when + ' · póliza ' + a.contab.poliza : a.rechazoCon ? 'Rechazado ' + a.rechazoCon.when : a.cancelado ? 'Cancelado ' + a.cancelado.when : '', motivo: a.estado === 'rechazado' || a.estado === 'cancelado' ? this.antMotivo(a) : '' })] : [];
      const prog = a && a.estado === 'porTransferir' && a.pp && a.pp.fechaPago, fdep = form ? this.antFechasDep(this.nowStamp()) : prog ? [a.pp.fechaPago] : a && ['autorizado', 'contabilizado', 'devuelto'].includes(a.estado) ? (a.fechasDep || this.antFechasDep(a.enviado)) : null;
      const dep = { show: !!fdep, title: form ? 'Fechas posibles de depósito si envías hoy' : prog ? 'Depósito programado' : 'Fechas posibles de depósito', dates: (fdep || []).map(x => ({ fecha: x.fecha, dia: x.dia.charAt(0).toUpperCase() + x.dia.slice(1) })), note: isCon ? (prog ? 'El pago se procesa en el ERP. El Portal consulta su estatus los martes y jueves («Por transferir» o fecha de depósito) y avisa al colaborador por correo y en el Portal.' : 'Al contabilizarse queda programado para el siguiente día de pago (martes o jueves); el pago se procesa en el ERP.') : prog ? 'El ERP transfiere los martes y jueves. Ese día el Portal confirma tu depósito y te avisa por correo y en el Portal.' : 'Contabilidad / Tesorería contabiliza el anticipo y lo programa para el siguiente día de pago (martes o jueves). Cuando el ERP lo deposite te avisaremos por correo y en el Portal.' };
      const addOpts = form ? this.ANT_EXTRA.filter(c => !prop.lines.some(l => l.concepto === c && !l.na)) : [];
      const add = { show: form && addOpts.length > 0, opts: [{ v: '', t: 'Selecciona un concepto' }].concat(addOpts.map(c => ({ v: c, t: c }))), onAdd: ev => { const c = ev.target.value; if (c) setExtra(c, ''); }, note: 'Por ejemplo Autobús: agrega los conceptos que tu viaje necesita y no están en la propuesta.' };
      const transfers = a ? (a.transfers || []).map(t => ({ k: (t.n > 1 ? 'Complemento · ' : '') + t.tipo, v: this.antM(t.importe) + ' · ' + (t.estado === 'porTransferir' ? 'por transferir' : 'aplicada el ' + t.fecha + ' · ref. ' + t.referencia) + (t.devolucion ? ' · DEVUELTA: ' + t.devolucion.causa : ''), sub: t.motivo || '', hasSub: !!t.motivo })) : [];
      if (isCon && a && a.erp && a.estado !== 'realizado') transfers.push({ k: 'Estatus en el ERP', v: a.erp.estatus + ' · consultado ' + a.erp.when, sub: '', hasSub: false });
      // barra de acciones
      const btns = [], Bt = (label, go, kind, dis, why) => btns.push({ label, go: dis ? () => {} : go, primary: kind === 'p', danger: kind === 'd', secondary: kind !== 'p' && kind !== 'd', disabled: !!dis, bg: dis ? '#D0D2D3' : kind === 'p' ? '#00A7E1' : '#fff', fg: dis ? '#777779' : kind === 'p' ? '#fff' : kind === 'd' ? '#F25757' : '#00A7E1', border: dis ? '#D0D2D3' : kind === 'd' ? '#F25757' : '#00A7E1', hover: kind === 'p' ? '#0090C2' : kind === 'd' ? '#FEEDED' : '#E6F6FC', cursor: dis ? 'not-allowed' : 'pointer', why: why || '' });
      let barTotal = '', barLabel = '', reason = '';
      if (mode === 'trav') {
        if (form) { barLabel = 'Monto de anticipo solicitado'; barTotal = this.antM(tSolF); const okF = vf.ok && declOn; reason = !vf.ok && tried ? (vf.errs._total || 'Corrige los importes señalados.') : !declOn ? 'Para enviar, acepta la declaración de uso de recursos.' : '';
          Bt('Solicitar anticipo', () => { if (!vf.ok || !declOn) { setAN({ tried: true }); setTimeout(() => this.jumpToError([], this.rootRef.current), 30); return; }
            const fd = this.antFechasDep(this.nowStamp());
            this.askConfirm({ title: 'Solicitar anticipo · folio ' + r.folio, summary: 'Revisa el resumen. Al enviar, el anticipo pasa directamente a Contabilidad / Tesorería, que lo contabiliza y lo programa para pago. Una solicitud enviada no se edita: solo puede cancelarse mientras no esté contabilizada.',
              rows: [{ k: 'Viaje', v: (r.dest || '') + ' · ' + (r.fechas || '') }, { k: 'Monto solicitado', v: this.antM(vf.total) }, { k: 'Fechas posibles de depósito', v: this.antFechasTxt(fd) + ' (martes o jueves, al contabilizarse)' }, { k: 'Depósito', v: cu.texto }, { k: 'Compromiso de comprobación', v: pz ? pz.text : '' }],
              cta: 'Enviar solicitud', run: () => this.antSubmit(r.folio, user) }); }, 'p', !okF && tried);
          Bt('Volver al viaje', () => this.mvOpenFolio(r.folio), 's'); }
        else if (a && ['pendAut', 'autorizado'].includes(a.estado) && !a.contab) { barLabel = 'Solicitado'; barTotal = this.antM(lin.tSol); Bt('Cancelar solicitud de anticipo', () => this.antCancelOwn(a, user), 'd'); Bt('Ver viaje', () => this.mvOpenFolio(r.folio), 's'); }
        else if (a && a.estado === 'realizado') { barLabel = 'Depositado'; barTotal = this.antM(enT); Bt('Ir a Comprobación', () => this.goFolio('comprobacion', r.folio), 'p'); }
      }
      if (mode === 'aut' && a && a.estado === 'pendAut' && this.antTurn(a) === uid) { const au = this.antCapOf('aut-ant', 'AU', user); barLabel = 'Monto a autorizar'; barTotal = this.antM(lin.tSol); reason = au ? '' : 'Sin permiso de autorizar: consulta en solo lectura.';
        Bt('Autorizar', () => { const ch = a.cadenaIds || [], p = this.antPaso(a), last = p + 1 >= ch.length, extra = Math.round((lin.tSol - this.antReservaNeta(a.folio)) * 100) / 100;
          this.askConfirm({ title: 'Autorizar anticipo · folio ' + a.folio, summary: last ? 'Es la última firma: el anticipo pasa a Contabilidad / Tesorería para contabilizarse y transferirse.' : 'El anticipo sigue con ' + this.apName(ch[p + 1]) + ' (' + (a.cadenaLbl || [])[p + 1] + ').',
            rows: [{ k: 'Colaborador', v: this.apName(a.uid) }, { k: 'Monto solicitado', v: this.antM(lin.tSol) + ' de ' + this.antM(lin.p.total) + ' propuesto' }, { label: 'Estatus', before: 'Pendiente autorización', after: last ? 'Autorizado' : 'Pendiente autorización · paso ' + (p + 2) + ' de ' + ch.length },
              { k: 'Efecto presupuestal', v: !last ? 'Ninguno hasta completar la cadena' : extra > 0 ? 'Se comprometen ' + this.antM(extra) + ' adicionales a la reserva del folio (' + this.antM(this.antReservaNeta(a.folio)) + ')' : 'Ya comprometido por la reserva del folio (' + this.antM(this.antReservaNeta(a.folio)) + '); sin movimiento nuevo' }], cta: 'Autorizar', run: () => this.antDecide(a.id, 'aprobada', '', '', user) }); }, 'p', !au);
        Bt('Rechazar', () => this.antOpenModal('rechazar', a), 'd', !au); }
      if (mode === 'con' && a) { const R2 = this.antConCaps(user), inComp = an.tab === 'comp', aj = (a.transfers || []).find(t => t.n > 1 && t.estado === 'porTransferir');
        barLabel = inComp && aj ? 'Complemento' : a.estado === 'realizado' ? 'Depositado' : 'Solicitado'; barTotal = this.antM(inComp && aj ? aj.importe : a.estado === 'realizado' ? enT : lin.tSol);
        if (a.estado === 'autorizado' && !lockOther && R2.va) { reason = cu.vigente ? '' : 'Cuenta de nómina no vigente en el ERP: no se puede contabilizar.'; Bt('Contabilizar anticipo', () => this.antContab(a, user), 'p', !cu.vigente, 'Cuenta no vigente'); Bt('Rechazar anticipo', () => this.antOpenModal('con-rechazar', a), 'd'); }
        if (inComp && aj && R2.pg) Bt('Confirmar complemento', () => this.antOpenModal('ajuste', a), 'p');
        if (!inComp && a.estado === 'realizado' && R2.pg) Bt('Registrar devolución bancaria', () => this.antOpenModal('devolucion', a), 's');
        if (lockOther) reason = 'Tomado por ' + this.apName(a.lock.byId) + ': solo consulta.'; }
      const tr = this.apTraveler(r), sxo = S[r.uid] || {};
      return { found: true, notFound: false, eyebrow: mode === 'trav' ? 'Anticipo del viaje' : mode === 'aut' ? 'Anticipo por autorizar' : 'Solicitud de anticipo · ' + this.ANT_CON_TABS[this.antConTabOf(a, an.tab)], folio: r.folio, traveler: tr.name, travelerSub: tr.isExt ? 'Viajero externo' : [r.perfilFolio, orgOf(r.uid), owner && owner.employeeNumber ? 'No. ' + owner.employeeNumber : ''].filter(Boolean).join(' · '),
        destino: r.dest || '—', fechas: (r.fechas || '—') + (r.nights ? ' · ' + r.nights : ''), statusText: st.text, sbg: tone(st.tone).bg, sborder: tone(st.tone).border, banners, hasBanners: banners.length > 0, trip,
        hasLines: lines.length > 0, heads, headCols: lineCols, showHeads: !cardMode, lineCols, lines, totals: totals.map(x => ({ ...x, hasSub: !!x.sub, size: x.big ? '24px' : '16px' })), hasTotErr: !!totErr, totErr, calcLabel: an.showCalc ? 'Ocultar detalle del cálculo' : 'Consultar el detalle del cálculo', toggleCalc: () => setAN({ showCalc: !an.showCalc }),
        conceptTitle: form ? 'Conceptos del anticipo' : isCon ? 'Conceptos: solicitado y monto máximo' : 'Conceptos solicitados', conceptIntro: form ? 'El sistema calcula los montos con los valores de tu perfil y de tu viaje. Los conceptos fijos por política no se editan; en los editables captura el importe que necesitas: el sistema valida que no exceda el máximo permitido. Puedes agregar otros conceptos que tu viaje necesite.' : isCon ? 'Compara lo solicitado por el colaborador con el monto máximo por política de cada concepto (calculado y congelado el ' + ((lin && lin.p.congeladaEn) || (a && a.enviado) || '—') + '). Si un importe no corresponde, rechaza la solicitud: el colaborador la vuelve a solicitar con el importe correcto.' : 'Importes que enviaste a Contabilidad / Tesorería. Una solicitud enviada no se edita: solo puede cancelarse mientras no esté contabilizada.',
        showCalcBtn: isCon,
        showPago: mode === 'trav' && (form || !!a), pago, decl, compromiso: pz ? pz.text : '', hasCompromiso: form && !!pz,
        hasInfo: info.length > 0, info, hasBudget: budget.length > 0, budget, hasChain: chain.length > 0, chain, dep, add, hasTransfers: transfers.length > 0, transfers,
        hist: a ? this.antHist(a) : [], hasHist: !!a && !isCon, hasNotif: isCon && !!a, canResend: isCon && !!a && a.estado === 'realizado', notif: isCon && a ? { ...this.antNotifInfo(a), bg: T.verde.bg, border: T.verde.border } : { when: '', text: '' }, onResend: () => { if (a) this.antResend(a, user); }, histTable: !narrow, histCards: narrow, cols2: narrow ? 'minmax(0,1fr)' : 'minmax(0,1.5fr) minmax(0,1fr)',
        bar: { show: btns.length > 0, btns, hasTotal: !!barTotal, total: barTotal, label: barLabel, hasReason: !!reason, reason, dir: isMobile ? 'column' : 'row', align: isMobile ? 'stretch' : 'center', btnDir: isMobile ? 'column' : 'row-reverse', btnW: isMobile ? '100%' : 'auto', gap: isMobile ? '16px' : '12px', pos: isMobile ? 'sticky' : 'sticky' } };
    };
    const notFound = (txt, back) => ({ ...out, anShowDetail: true, anBack: back, and: { ...blank.and, notFound: true, nfText: txt } });
    // ---------- PLANEACIÓN DE VIAJE › ANTICIPO (viajero) ----------
    if (route === 'anticipo') {
      out.anPurpose = 'Aquí se solicita el anticipo de un viaje aprobado: el sistema calcula los montos según la política, el perfil y las tarifas y valida el máximo permitido de cada concepto. También se sigue el estado de cada anticipo.';
      const mine = this.svTripsFor(uid).propias, sel = an.sel;
      if (sel) { const r = mine.find(x => x.folio === sel); const back = { label: 'Volver a Anticipo', go: () => { setAN({ sel: null, form: {}, tried: false }); toTop(); } };
        if (!r) return notFound('El folio ' + sel + ' no existe o no es un viaje propio de este usuario.', back);
        const a0 = this.antOf(r.folio), e0 = this.antElig(r), a = e0.k === 'disponible' ? null : a0;
        return { ...out, anShowDetail: true, anBack: back, and: detail(r, a, 'trav') }; }
      const na = this.anticipoNA(user);
      if (na) { out.anShowPanel = true; out.anPanel = { title: 'Anticipo · No aplica', text: 'Tu perfil aplica reembolso posterior (' + this.anticipoNote(user) + '): no se solicita anticipo. Registra tus gastos y comprobantes en Comprobación al regresar del viaje.', cta: 'Ir a Comprobación', go: () => this.go('comprobacion') }; return out; }
      const rows = mine.filter(r => !['captura'].includes(r.status) && r.travelerType !== 'externo').map(r => { const e = this.antElig(r), a = ['existe', 'rechazado'].includes(e.k) ? e.rec : null, l = a ? this.antLines(a) : null, st = this.antStage(r);
        const txt = a ? this.antStText(a.estado) : e.k === 'disponible' ? (e.rec && e.rec.estado === 'rechazado' ? 'Rechazado · solicítalo de nuevo' : 'Disponible para solicitar') : e.k === 'block' ? 'No disponible · ' + e.title.toLowerCase() : e.k === 'antes' ? 'Después de la aprobación' : e.text || 'Sin anticipo', tn = a ? stOf(a).tone : e.k === 'disponible' ? (e.rec && e.rec.estado === 'rechazado' ? 'amarillo' : 'azul') : e.k === 'block' ? 'amarillo' : 'gris';
        return { folio: r.folio, destino: r.dest || '—', fechas: r.fechas || '—', fechasK: String((((r.segmentos || [])[0]) || {}).inicio || '').split('/').reverse().join(''), monto: a ? this.antM(l.tSol) + ' solicitado' : e.k === 'disponible' ? 'Por solicitar' : '—', est: txt,
          _badge: { est: bdg(txt, tn) }, _sub: { destino: r.rolGrupo === 'acompanante' ? 'Como acompañante · folio origen ' + r.origenFolio : '' }, _actLabel: e.k === 'disponible' ? 'Solicitar anticipo' : 'Ver anticipo', ord: e.k === 'disponible' ? 0 : a && P.abiertos.includes(a.estado) ? 1 : 2 }; }).sort((x, y) => x.ord - y.ord || x.fechasK.localeCompare(y.fechasK));
      out.hasList = true; out.list = this.buildList('ant-mios', rows, [['Folio', 'folio', 'text'], ['Destino', 'destino', 'text'], ['Fechas', 'fechas', 'text'], ['Monto', 'monto', 'text'], ['Estatus', 'est', 'badge'], ['', '_a', 'action']], {
        title: 'Mis anticipos', icon: 'money', toolbar: true, narrow: narrow || (s.width || 0) < 1100, pageSize: 6, leadField: 'destino', actionLabel: 'Ver anticipo', searchPh: 'Buscar por folio o destino',
        filters: [{ key: 'est', label: 'Estatus' }], gridCols: 'minmax(70px,.6fr) minmax(0,1.4fr) minmax(0,1.2fr) minmax(0,1fr) minmax(0,1.2fr) max-content', sortKeys: { fechas: 'fechasK' },
        empty: 'Aún no hay viajes aprobados. El anticipo se solicita después de la aprobación del viaje.', onRow: r => open(r.folio), onAction: r => open(r.folio) });
      return out;
    }
    // ---------- AUTORIZACIÓN › ANTICIPOS (Director inmediato → Dirección Corporativa) ----------
    if (route === 'aut-ant') {
      out.anPurpose = 'Aquí se autorizan los anticipos en los que este usuario es el firmante en turno de la cadena Director inmediato → Dirección Corporativa, con la propuesta calculada por el sistema y lo solicitado por el colaborador.';
      const pend = this.antPending(user), mineRes = this.antRecs().filter(a => (a.decisiones || []).some(d => d.byId === uid)), tab = an.tab || 'pend';
      if (an.sel) { const a = this.antRecs().find(x => x.id === an.sel), r = a && this.antReq(a.folio), back = { label: 'Volver a Anticipos', go: () => { setAN({ sel: null }); toTop(); } };
        if (!a || !r || !(pend.includes(a) || mineRes.includes(a))) return notFound('El anticipo no existe o no forma parte de tus autorizaciones.', back);
        return { ...out, anShowDetail: true, anBack: back, and: detail(r, a, 'aut') }; }
      out.anShowTabs = true; out.anTabs = [['pend', 'Por autorizar', pend.length], ['res', 'Resueltos por mí', 0]].map(([id, label, n]) => { const on = tab === id; return { label, on, ...this.tabBadge(n, 'anticipo por autorizar', 'anticipos por autorizar'), go: () => setAN({ tab: id }), line: on ? '#00A7E1' : 'transparent', fg: on ? '#4A4F54' : '#777779', weight: on ? 700 : 500 }; });
      const src = tab === 'pend' ? pend : mineRes;
      const rows = src.map(a => { const r = this.antReq(a.folio) || {}, l = this.antLines(a), ch = a.cadenaIds || [], p = this.antPaso(a), my = (a.decisiones || []).find(d => d.byId === uid), st = tab === 'pend' ? stOf(a) : my && my.res === 'rechazada' ? { text: 'Rechazado por mí', tone: 'rojo' } : { text: 'Autorizado por mí', tone: 'verde' };
        return { id: a.id, folio: a.folio, who: this.apName(a.uid), viaje: (r.dest || '—'), monto: this.antM(l.tSol), paso: tab === 'pend' ? 'Paso ' + (p + 1) + ' de ' + ch.length : 'Estatus actual: ' + this.antStText(a.estado), est: st.text, age: ageOf(tab === 'pend' ? (p ? (a.decisiones[p - 1] || {}).when : a.enviado) : (my || {}).when), ageK: String(this.mvTs(a.enviado)),
          _sub: { who: [r.perfilFolio, orgOf(a.uid)].filter(Boolean).join(' · '), viaje: r.fechas || '', monto: 'de ' + this.antM(l.p.total) + ' propuesto' }, _badge: { est: bdg(st.text, st.tone) } }; });
      out.hasList = true; out.list = this.buildList('ant-aut-' + tab, rows, [['Folio', 'folio', 'text'], ['Colaborador', 'who', 'text'], ['Viaje', 'viaje', 'text'], ['Monto solicitado', 'monto', 'text'], ['Paso', 'paso', 'text'], ['Estatus', 'est', 'badge'], ['Antigüedad', 'age', 'text'], ['', '_a', 'action']], {
        title: tab === 'pend' ? 'Anticipos por autorizar' : 'Anticipos resueltos por mí', icon: 'money', toolbar: true, narrow: narrow || (s.width || 0) < 1200, pageSize: 6, leadField: 'who', actionLabel: tab === 'pend' ? 'Revisar' : 'Ver detalle', searchPh: 'Buscar por folio o colaborador',
        filters: [{ key: 'viaje', label: 'Destino' }], gridCols: 'minmax(70px,.6fr) minmax(0,1.5fr) minmax(0,1.2fr) minmax(0,1fr) minmax(0,.9fr) minmax(0,1.1fr) minmax(0,.8fr) max-content', sortKeys: { age: 'ageK' },
        empty: tab === 'pend' ? 'No hay anticipos por autorizar.' : 'Aún no has resuelto anticipos.', onRow: r => { setAN({ sel: r.id }); toTop(); }, onAction: r => { setAN({ sel: r.id }); toTop(); } });
      return out;
    }
    // ---------- CONTABILIZACIÓN › SOLICITUD DE ANTICIPO (Contabilidad / Tesorería) ----------
    if (route === 'con-ant') {
      out.anPurpose = 'Aquí Contabilidad / Tesorería valida los anticipos que envían los colaboradores: compara lo solicitado con el monto máximo por política y los contabiliza (uno, varios o todos) o los rechaza con motivo; no modifica importes. El pago se procesa en el ERP y el Portal consulta su estatus hasta que se deposita.';
      const cc = this.antConCaps(user), pops = this.antConPops(user), R = this.antRecs(), tab = this.ANT_CON_TABS[an.tab] ? an.tab : 'contab';
      if (an.sel) { const a = R.find(x => x.id === an.sel), r = a && this.antReq(a.folio), back = { label: 'Volver a Solicitud de anticipo', go: () => { setAN({ sel: null, form: {}, tried: false }); toTop(); } };
        if (!a || !r) return notFound('El anticipo no existe.', back);
        return { ...out, anShowDetail: true, anBack: back, anCrumbs: [this.ANT_CON_TABS[this.antConTabOf(a, tab)], 'Folio ' + a.folio], and: detail(r, a, 'con') }; }
      // Cliente 2026-10-19: Por contabilizar · Programados para pago · Realizados · Rechazados y cancelados · Complemento (sin «Por programar»).
      const TABS = [['contab', R.filter(a => a.estado === 'autorizado'), cc.va ? pops.contab.length : 0], ['transf', pops.transf, 0], ['real', R.filter(a => a.estado === 'realizado'), 0], ['term', R.filter(a => a.estado === 'rechazado' || a.estado === 'cancelado'), 0], ['comp', pops.comp, cc.pg ? pops.compPend.length : 0]];
      out.anShowTabs = true; out.anTabs = TABS.map(([id, , n]) => { const on = tab === id; return { label: this.ANT_CON_TABS[id], on, ...this.tabBadge(n, 'anticipo pendiente', 'anticipos pendientes'), go: () => setAN({ tab: id }), line: on ? '#00A7E1' : 'transparent', fg: on ? '#4A4F54' : '#777779', weight: on ? 700 : 500 }; });
      const src = (TABS.find(x => x[0] === tab) || TABS[0])[1], listNarrow = narrow || (s.width || 0) < 1360;
      out.anHasTabNote = true; out.anTabNote = { contab: 'Anticipos enviados por los colaboradores. Contabiliza uno, varios o todos con «Contabilizar seleccionados», o revisa cada uno en «Gestionar». Quedan programados para el siguiente martes o jueves.', transf: 'Consulta de anticipos contabilizados. El pago se procesa en el ERP; el Portal consulta su estatus los martes y jueves: «Por transferir» o la fecha en que se depositó.', real: 'Anticipos que el ERP reporta como depositados: el importe está En tránsito en la bolsa del folio.', term: 'Anticipos rechazados por Contabilidad, con su motivo, o cancelados por el colaborador.', comp: 'Complementos de anticipos ya depositados (segunda transferencia del mismo anticipo, p. ej. por cambio de hospedaje). Confírmalos en «Gestionar».' }[tab];
      // Selección múltiple (casilla estándar): solo anticipos elegibles (no tomados por otro analista y con cuenta vigente); el contador del botón = seleccionados.
      const elig = pops.sel.map(a => a.id), selIds = (an.selIds || []).filter(id => elig.includes(id)), allOn = elig.length > 0 && selIds.length === elig.length, withSel = tab === 'contab' && cc.va;
      const toggleSel = id => this.setState(st => { const cur = ((st.an || {}).selIds || []).filter(x => elig.includes(x)); return { an: { ...(st.an || {}), selIds: cur.includes(id) ? cur.filter(x => x !== id) : cur.concat([id]) } }; });
      const toggleAll = () => this.setState(st => ({ an: { ...(st.an || {}), selIds: allOn ? [] : elig.slice() } }));
      if (withSel && pops.contab.length) out.anActs = [{ label: 'Contabilizar seleccionados (' + selIds.length + ')', go: () => { if (selIds.length) this.antContabLote(selIds, user); }, primary: true, disabled: !selIds.length }].concat(listNarrow && elig.length ? [{ label: allOn ? 'Quitar selección' : 'Seleccionar todos (' + elig.length + ')', go: toggleAll }] : []);
      if (tab === 'transf' && src.some(a => a.estado === 'porTransferir' || a.estado === 'devuelto')) { out.anActs = [{ label: 'Simulación · Consultar estatus ERP', go: () => this.antJobErp(user), demo: true }, { label: 'Descargar propuesta de pago (Excel)', go: () => this.antExportPago(user) }]; out.anHasActNote = true; out.anActNote = 'MODO DEMO · solo prototipo: en producción el Portal consulta el estatus en el ERP automáticamente los martes y jueves. «Condición del anticipo» simula la respuesta («Por transferir» o falla de integración).'; }
      out.anActs = (out.anActs || []).map(x => ({ ...x, bg: x.disabled ? '#D0D2D3' : x.primary ? '#00A7E1' : '#fff', fg: x.disabled ? '#777779' : x.primary ? '#fff' : '#00A7E1', border: x.disabled ? '#D0D2D3' : '#00A7E1', cursor: x.disabled ? 'not-allowed' : 'pointer', aria: !!x.disabled })); out.anHasActs = out.anActs.length > 0;
      const rows = src.map(a => { const r = this.antReq(a.folio) || {}, l = this.antLines(a), sx = S[a.uid] || {}, cu = this.antCuenta(a.uid), cp = (a.transfers || []).filter(x => x.n > 1).slice(-1)[0];
        const st = tab === 'comp' && cp ? (cp.estado === 'porTransferir' ? { text: 'Complemento por transferir', tone: 'azul' } : { text: 'Complemento depositado', tone: 'verde' }) : stOf(a);
        const lk = a.lock && a.lock.byId ? (a.lock.byId === uid ? 'Tomado por mí' : 'Tomado por ' + this.apName(a.lock.byId)) : '';
        const erp = tab === 'transf' ? (a.estado === 'devuelto' ? 'ERP: transferencia devuelta' : 'ERP: ' + (a.erp ? a.erp.estatus.toLowerCase() + ' · ' + String(a.erp.when).split(' ')[0] : 'por transferir') + ' · previsto ' + this.antFechaPago(a)) : '';
        return { id: a.id, folio: a.folio, who: this.apName(a.uid), num: (this.antOwner({ uid: a.uid }) || {}).employeeNumber || '', det: tab === 'comp' && cp ? 'Complemento ' + this.antM(cp.importe) : a.estado === 'realizado' ? this.antM(this.antTransferido(a)) + ' depositado' : this.antM(l.tSol) + ' solicitado', pol: a.contab ? a.contab.poliza : '—', soc: this.socLabel(sx.sociedad), ceco: sx.ceco || '—', est: st.text, age: ageOf(a.contab ? a.contab.when : a.enviado), ageK: String(this.mvTs(a.enviado)),
          _sel: withSel ? { can: elig.includes(a.id), on: selIds.includes(a.id), toggle: () => toggleSel(a.id), aria: 'Seleccionar el anticipo del folio ' + a.folio } : null,
          _sub: { who: [r.perfilFolio, orgOf(a.uid)].filter(Boolean).join(' · '), det: tab === 'comp' && cp ? cp.tipo : 'Cuenta ' + cu.ref + (cu.vigente ? '' : ' · no vigente'), est: lk || erp }, _badge: { est: bdg(st.text, st.tone) } }; });
      const cols = (withSel ? [['', '_sel', 'select']] : []).concat([['Folio', 'folio', 'text'], ['Colaborador', 'who', 'text'], ['Detalle', 'det', 'text'], ['Póliza', 'pol', 'text'], ['Sociedad', 'soc', 'text'], ['CECO', 'ceco', 'text'], ['Estatus', 'est', 'badge'], ['Antigüedad', 'age', 'text'], ['', '_a', 'action']]);
      out.hasList = true; out.list = this.buildList('ant-con-' + tab, rows, cols, {
        title: this.ANT_CON_TABS[tab], icon: 'money', toolbar: true, narrow: listNarrow, pageSize: 6, leadField: 'who', actionLabel: 'Gestionar', searchPh: 'Buscar por folio, colaborador, póliza o número de colaborador', searchFields: ['num'],
        select: withSel ? { allOn, anyElig: elig.length > 0, toggleAll, aria: allOn ? 'Quitar la selección de todos los anticipos' : 'Seleccionar todos los anticipos elegibles' } : null,
        filters: [{ key: 'est', label: 'Estatus' }, { key: 'soc', label: 'Sociedad' }, { key: 'ceco', label: 'CECO' }], gridCols: (withSel ? '52px ' : '') + 'minmax(64px,.5fr) minmax(0,1.4fr) minmax(0,1.2fr) minmax(0,1fr) minmax(0,1.1fr) minmax(0,.9fr) minmax(0,1.1fr) minmax(0,.7fr) max-content', sortKeys: { age: 'ageK' },
        empty: { contab: 'No hay anticipos por contabilizar.', transf: 'No hay anticipos programados para pago.', real: 'Aún no hay anticipos depositados.', term: 'No hay anticipos rechazados ni cancelados.', comp: 'No hay complementos de anticipo.' }[tab], onRow: r => { setAN({ sel: r.id, form: {}, tried: false }); toTop(); }, onAction: r => { setAN({ sel: r.id, form: {}, tried: false }); toTop(); } });
      return out;
    }
    return out;
  }
  // Sección «Anticipo» del detalle del folio (Mis viajes): estado real + importes propios (nunca cifras de la entidad).
  antSec(r) { const e = this.antElig(r); if (['antes', 'dead', 'none'].includes(e.k)) return null;
    if (e.k === 'na') return { status: 'No aplica', tone: 'gris', rows: [{ k: 'Motivo', v: e.text }] };
    if (e.k === 'disponible') { const rj = e.rec && e.rec.estado === 'rechazado'; return { status: rj ? 'Rechazado · por solicitar de nuevo' : 'Disponible para solicitar', tone: rj ? 'amarillo' : 'azul', rows: (rj ? [{ k: 'Motivo del rechazo (Contabilidad)', v: this.antMotivo(e.rec) }] : []).concat([{ k: 'Antelación mínima', v: this.antPar().antelacionDias + ' días antes del inicio del viaje' }]) }; }
    if (e.k === 'block') return { status: 'No disponible · ' + e.title.toLowerCase(), tone: 'amarillo', rows: [{ k: 'Motivo', v: e.text }] };
    if (e.k === 'cerrado') return { status: 'Sin anticipo solicitado', tone: 'gris', rows: [] };
    const a = e.rec, l = this.antLines(a), st = this.ANT_ST[a.estado] || [a.estado, 'gris'], pz = this.antPlazos(r);
    return { status: st[0], tone: st[1], rows: [{ k: 'Solicitado', v: this.antM(l.tSol) }]
      .concat(this.antTransferido(a) ? [{ k: 'Depositado', v: this.antM(this.antTransferido(a)) + ' · ' + this.antCuenta(a.uid).ref }] : []).concat(a.estado === 'rechazado' ? [{ k: 'Motivo del rechazo (Contabilidad)', v: this.antMotivo(a) }] : []).concat(a.estado === 'realizado' && pz ? [{ k: 'Plazos de comprobación', v: 'Iniciar a más tardar el ' + pz.iniciar + ' · concluir a más tardar el ' + pz.concluir + ' (desde el fin del viaje)' }] : []) }; }
  // Avisos «Requieren mi acción» derivados del MISMO registro que las bandejas (autorizador en turno · Contabilidad).
  antActionNotices(user) { const out = [];
    this.antPending(user).forEach(a => { const ch = a.cadenaIds || [], p = this.antPaso(a); out.push({ id: 'antp' + a.id + '-' + p, folio: a.folio, action: true, target: 'aut-ant', when: p ? (a.decisiones[p - 1] || {}).when : a.enviado, unread: true, tone: 'azul', text: 'Anticipo del folio ' + a.folio + ' de ' + this.apName(a.uid) + ' por autorizar · ' + this.antM(this.antLines(a).tSol) + (ch.length > 1 ? ' · paso ' + (p + 1) + ' de ' + ch.length : '') + '.' }); });
    if (this.antConCaps(user).va) this.antConPops(user).contab.forEach(a => out.push({ id: 'antc' + a.id, folio: a.folio, action: true, target: 'con-ant', tab: 'contab', when: ((a.decisiones || []).slice(-1)[0] || {}).when || a.enviado, unread: true, tone: 'azul', text: 'Anticipo del folio ' + a.folio + ' por contabilizar · ' + this.antM(this.antLines(a).tSol) + '. Valídalo y contabilízalo o recházalo.' }));
    return out; }
  antHomeRows(user) { const S1 = (window.SMV_US01 || {}).STATUS || {}, SX = (this.PV && this.PV.ERP_EXTRA) || {};
    return this.antRecs().filter(a => ['autorizado', 'contabilizado', 'porTransferir', 'devuelto', 'realizado'].includes(a.estado)).map(a => { const l = this.antLines(a), dv = a.estado === 'devuelto', done = a.estado === 'realizado', st = this.ANT_ST[a.estado];
      return { folio: a.folio, personId: a.uid, meta: (SX[a.uid] || {}).ceco + ' · ' + (done ? 'Depositado: ' : a.estado === 'autorizado' ? 'Solicitado: ' : 'Por transferir: ') + this.antM(done ? this.antTransferido(a) : l.tApr) + ' · cuenta ' + this.antCuenta(a.uid).ref, metaSub: a.contab ? 'Contabilizado ' + String(a.contab.when).split(' ')[0] + ' · póliza ' + a.contab.poliza : 'Enviado ' + String(a.enviado || '').split(' ')[0],
        status: { ...(done ? S1.transferido : S1.pendTransf), text: st[0], tone: st[1] }, age: this.apAge(done ? ((a.transfers || []).slice(-1)[0] || {}).when : (a.contab || {}).when || a.enviado).txt, go: () => this.go('con-ant', { id: a.id }), _o: done ? 1 : 0 }; }).sort((x, y) => x._o - y._o); }
  // NOTIFICACIÓN AL COLABORADOR (cliente 2026-10-19): el detalle de Contabilidad muestra arriba la última notificación enviada y permite reenviarla.
  // PROPUESTA DE PAGO (cliente 2026-10-20): salida a Excel de TODOS los anticipos pendientes de pago (Programados para pago: por transferir + transferencia devuelta), sin importar filtros.
  antExportPago(user) { const R0 = this.antRecs().filter(a => a.estado === 'porTransferir' || a.estado === 'devuelto'); if (!R0.length) return; const S = (this.PV && this.PV.ERP_EXTRA) || {};
    const rows = R0.map(a => { const sx = S[a.uid] || {}, cu = this.antCuenta(a.uid), o = this.antOwner({ uid: a.uid }) || {}; return [a.folio, this.apName(a.uid), o.employeeNumber || '', this.socLabel(sx.sociedad), sx.ceco || '', a.contab ? a.contab.poliza : '', this.antLines(a).tSol.toFixed(2), 'MXN', cu.banco, cu.ref, cu.vigente ? 'Vigente' : 'No vigente', a.estado === 'devuelto' ? 'Transferencia devuelta' : 'Por transferir', this.antFechaPago(a)]; });
    this.presCSV('Propuesta-de-pago-anticipos-' + this.nowStamp().split(' ')[0].split('/').reverse().join('') + '.csv', ['Folio', 'Colaborador', 'No. colaborador', 'Sociedad', 'CECO', 'Póliza', 'Importe', 'Moneda', 'Banco', 'Cuenta', 'Vigencia cuenta', 'Estatus', 'Fecha prevista de pago'], rows);
    this.setState(s => ({ pv: { ...s.pv, events: (s.pv.events || []).concat([this.antEv(user, R0.map(a => a.folio).join(', '), 'Consulta', 'Descargó la propuesta de pago (' + R0.length + ' anticipos pendientes de pago)', 'Programados para pago', 'Archivo Excel', { tone: 'azul', text: 'Descargado' }, 'Contabilización')]) } })); }
  antNotifText(a) { const f = a.folio;
    if (a.estado === 'rechazado') return 'Tu anticipo del folio ' + f + ' fue rechazado por Contabilidad. Motivo: ' + this.antMotivo(a) + '. Solicítalo de nuevo con el importe correcto.';
    if (a.estado === 'cancelado') return 'Tu solicitud de anticipo del folio ' + f + ' quedó cancelada.';
    if (a.estado === 'realizado') return 'Tu anticipo del folio ' + f + ' fue depositado: ' + this.antM(this.antTransferido(a)) + ' en tu cuenta ' + this.antCuenta(a.uid).ref + '.';
    if (a.estado === 'devuelto') return 'El banco devolvió la transferencia del anticipo del folio ' + f + '; Contabilidad la reprocesa.';
    if (a.estado === 'autorizado') return 'Tu solicitud de anticipo del folio ' + f + ' está en Contabilidad / Tesorería. Fechas posibles de depósito: ' + this.antFechasTxt(a.fechasDep || this.antFechasDep(a.enviado)) + '.';
    return 'Tu anticipo del folio ' + f + ' quedó contabilizado y programado para pago: depósito previsto el ' + this.antFechaPago(a) + '.'; }
  antNotifInfo(a) { const last = (a.notifs || []).slice(-1)[0]; if (last) return { when: last.when, text: 'Reenviada por ' + this.apName(last.byId) };
    const t0 = (a.transfers || []).filter(x => x.estado === 'aplicada').slice(-1)[0], w = a.rechazoCon ? a.rechazoCon.when : a.cancelado ? a.cancelado.when : t0 ? t0.when : a.contab ? a.contab.when : a.enviado;
    return { when: w || '—', text: a.rechazoCon ? 'Rechazo y motivo' : a.cancelado ? 'Cancelación' : t0 ? 'Depósito realizado' : a.contab ? 'Contabilizado y programado para pago' : 'Solicitud recibida' }; }
  antResend(a, user) { const cur = this.antRecs().find(x => x.id === a.id); if (!cur || cur.estado !== 'realizado' || !this.antConCaps(user).co) return; const when = this.nowStamp(), txt = this.antNotifText(cur), rec = { ...cur, notifs: (cur.notifs || []).concat([{ when, byId: this.svUid(user), text: txt }]) };
    this.setState(s => ({ an: this.antPut(s, rec), sv: { ...s.sv, notices: this.antNotice(s.sv.notices, cur.uid, { text: txt, target: 'anticipo', folio: cur.folio, tone: cur.estado === 'rechazado' ? 'rojo' : 'azul' }) },
      pv: { ...s.pv, events: (s.pv.events || []).concat([this.antEv(user, cur.folio, 'Modificación', 'Reenvió la notificación del anticipo al colaborador', this.antStText(cur.estado), 'Notificación reenviada · ' + txt, { tone: 'azul', text: 'Reenviada' }, 'Contabilización')]) } }),
      () => this.notifySuccess({ title: 'Notificación reenviada', message: 'El colaborador recibió de nuevo el aviso por correo y en el Portal: ' + txt, refLabel: 'Folio', refValue: cur.folio, status: this.antStText(cur.estado) })); }
  antOpenModal(kind, a, extra) { this.setState({ af: { kind, id: a ? a.id : null, v: {}, tried: false, ...(extra || {}) } }); }
};
