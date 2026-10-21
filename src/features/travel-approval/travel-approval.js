// US-09 — Aprobación de viaje
// Extracted from the cumulative prototype (prototype/Portal Viaticos.dc.html, class Component) — APPROVED · CLOSED 2026-10-21.
// Reference implementation for development: methods of the Portal logic class (they rely on this.state / this.setState and shared helpers of the same class).
// Functional rules: PDF «Propuesta visual (US-09 - Aprobación de viaje)». Demo data: see the *-data.js file in this folder.

const TravelApprovalMethods = {
  apSeed() { return ((window.SMV_US09 || {}).SEED) || []; }
  apPpl() { return window.SMV_US26 ? this.u26Users(window.SMV_US26) : []; }
  apName(id) { const p = this.apPpl().find(x => x.id === id); if (p) return p.name; const a = this.extAuth(id); return a ? a.name : (id || ''); }
  apChain(r) {
    if (!r) return [];
    const memo = this._apChainMemo || (this._apChainMemo = {});
    const info = r.cadenaInfo || [], byName = n => (this.apPpl().find(p => p.name === n) || {}).id || '';
    let steps = [], cache = false;
    if (r.cadenaIds && r.cadenaIds.length) steps = r.cadenaIds.map((pid, i) => ({ label: ((r.cadena || [])[i] || {}).label || '', personId: pid, ...(info[i] || {}) }));
    else if (r.cadena && r.cadena.length) steps = r.cadena.map((c, i) => ({ label: c.label, personId: byName(c.person), ...(info[i] || {}) }));
    else if (r.status === 'pendAut') {
      if (memo[r.folio]) return memo[r.folio];
      let ch = null;
      try { if (r.travelerType === 'externo') { const X = this.extById(r.uid); ch = X ? this.svChainExt(X) : null; }
        else { const U = (this.state.data && this.state.data.USERS) || []; const u = U.find(x => this.svUid(x) === r.uid); ch = u ? this.svChain(u, r.uid, r.perfilFolio, !!r.exceso) : null; } } catch (e) { ch = null; }
      steps = ch && !ch.auto ? ch.steps.map(st => ({ label: st.label, personId: st.person ? (st.person.employeeNumber ? this.svUid(st.person) : st.person.id) : '', ctx: st.ctx || '', kind: st.kind || '' })) : [];
      cache = !!this.state.data;
    }
    const out = steps.map(st => { const vac = /vacante/i.test(st.ctx || ''), esc = st.kind === 'esc' || vac;
      return { ...st, kind: esc ? 'esc' : (st.kind || ''), causa: st.causa || (vac ? 'vacante' : esc ? 'excedente' : ''), person: st.personId ? this.apName(st.personId) : (((r.cadena || []).find(c => c.label === st.label) || {}).person || '') }; });
    if (cache) memo[r.folio] = out;
    return out;
  }
  apPaso(r) { return ((r && r.decisiones) || []).filter(d => d.res === 'aprobada').length; }
  apTurn(r) { if (!r || r.status !== 'pendAut') return null; return this.apChain(r)[this.apPaso(r)] || null; }
  apTurnLabel(r, full) { const t = this.apTurn(r); return t ? (full && t.person ? t.label + ' (' + t.person + ')' : t.label) : (full ? (r.firstLabel || '') : String(r.firstLabel || '').split(' (')[0]); }
  // CAPACIDADES (regla 420): Consultar = navegación de la opción · Autorizar = acción AU de Autorización › Aprobación de viaje, con el MISMO resolver que el menú y Usuarios y permisos.
  // EXCEPCIONES EN SU CAMPO (regla 446): cada excedente que Creación registró (r.excesos) se marca «Excepción a la política» en el dato que lo origina
  // (Hospedaje del destino con hotel externo · Fechas del viaje para días / noches / semanas); el documento único «Autorización del excedente» dice qué cubre.
  apExcInfo(r, info) {
    const exs = (r.excesos || []).map(t => String(t).replace(/ Justifica y adjunta la autorización;.*$/, '').trim()).filter(Boolean); if (!exs.length) return info;
    const segs = r.segmentos || [], short = t => t.replace(/^Hospedaje:\s*/, ''), gen = { ...info, general: info.general.map(x => ({ ...x })), segs: (info.segs || []).map(s => ({ ...s, rows: (s.rows || []).map(x => ({ ...x })) })) };
    let hk = 0; const tag = (row, t) => { row.hasExc = true; row.exc = row.exc ? row.exc + ' · ' + t : t; row.excKey = row.excKey || ('apexc-' + r.folio + '-' + (hk++)); };
    const covers = [];
    exs.forEach(t => {
      if (/^Hospedaje/i.test(t)) { let hit = false; gen.segs.forEach((s, i) => { const sg = segs.find(x => x.n === s.n) || segs[i] || {}; if (sg.hospedaje === 'hotel') { const row = s.rows.find(x => x.k === 'Hospedaje'); if (row) { tag(row, short(t)); hit = true; } } });
        if (!hit) { const f = gen.general.find(x => x.k === 'Fechas del viaje'); if (f) tag(f, t); } covers.push('Hospedaje en hotel externo'); return; }
      const f = gen.general.find(x => x.k === 'Fechas del viaje') || gen.general[0]; if (f) tag(f, t);
      covers.push(/día/.test(t) && /por viaje/.test(t) ? 'Días por viaje' : /noche/.test(t) ? 'Noches por semana' : /semana/.test(t) ? 'Semanas con viaje en el mes' : 'Límite del perfil'); });
    const hp = row => row.hasExc ? { ...row, excHelp: this.helpTip(row.excKey, 'Excepción a la política del perfil: ' + row.exc.charAt(0).toLowerCase() + row.exc.slice(1) + (/[.)]$/.test(row.exc) ? '' : '.') + ' Cubierta por el documento «Autorización del excedente» (Documentos).') } : row;
    gen.general = gen.general.map(hp); gen.segs = gen.segs.map(s => ({ ...s, rows: s.rows.map(hp) }));
    gen.docs = (info.docs || []).map(d => d.tipo === 'Autorización del excedente' ? { ...d, hasCovers: true, covers: 'Cubre ' + (covers.length === 1 ? 'la excepción' : 'las ' + covers.length + ' excepciones') + ': ' + covers.join(' · ') } : { ...d, hasCovers: false, covers: '' });
    return gen;
  }
  apCaps(user) {
    const D = window.SMV_US26, item = (window.SMV_US01.MENU.flatMap(g => g.items)).find(i => i.id === 'aut-viaje'), cfg = D && this.u26Config(user);
    const consultar = !!item && this.visible(item, user);
    let autorizar = false;
    if (D && cfg) { const it = this.u26Items(D).find(x => x.id === 'aut-viaje'); autorizar = !!it && ['default', 'byExc', 'manual', 'manualExc'].includes(this.resolveAccess(cfg, it, 'AU', D)); }
    else autorizar = !!item && this.baseVis(item, 'AU', user.role) === '✓';
    let cambiar = false;
    if (D && cfg) { const it = this.u26Items(D).find(x => x.id === 'aut-viaje'); cambiar = !!it && ['default', 'byExc', 'manual', 'manualExc'].includes(this.resolveAccess(cfg, it, 'CE', D)); }
    else cambiar = !!item && this.baseVis(item, 'CE', user.role) === '✓';
    return { consultar, autorizar: consultar && autorizar, cambiar: consultar && cambiar };
  }
  // CAMBIO DE ESTATUS POR VIÁTICOS (cliente 2026-10-15, acción CE de Aprobación de viaje): solo en la etapa de autorización de la solicitud.
  // Cliente 2026-10-15 (corrige la versión anterior): Aprobada o Rechazada → REGRESA a Pendiente autorización y la cadena vuelve a empezar desde el paso 1.
  // Aprobada solo sin movimientos posteriores (anticipo vigente, vuelo, comprobación) · Rechazada siempre.
  apCambioElig(r, user) {
    if (!r || r.hist) return { to: null };
    if (user && r.uid === this.svUid(user)) return { to: ['aprobada', 'rechazada'].includes(r.status) ? 'pendAut' : null, ok: false, reason: 'No puedes cambiar el estatus de tu propia solicitud.' };
    if (r.status === 'rechazada') return { to: 'pendAut', ok: true, reason: '' };
    if (['enProceso', 'finalizado'].includes(r.status)) return { to: 'pendAut', ok: false, reason: 'No disponible: la solicitud ya tiene movimientos posteriores (comprobación).' };
    if (r.status !== 'aprobada') return { to: null };
    const ant = this.antRecs().some(a => a.folio === r.folio && !['cancelado', 'rechazado'].includes(a.estado));
    const movs = this.presData() ? this.presData().movs.filter(m => m.folio === r.folio && ['Anticipo', 'Vuelo', 'Comprobación'].includes(m.tipo)) : [];
    const why = ant ? 'tiene un anticipo solicitado' : movs.length ? 'tiene movimientos posteriores (' + Array.from(new Set(movs.map(m => m.tipo.toLowerCase()))).join(', ') + ')' : '';
    return { to: 'pendAut', ok: !why, reason: why ? 'No disponible: la solicitud ' + why + '.' : '' };
  }
  apCambiar(folio, to, motivo, user, isMobile) {
    if (this._apBusy) return; const caps = this.apCaps(user), cur0 = this.svAllReqs().find(x => x.folio === folio), el = this.apCambioElig(cur0, user);
    if (!caps.cambiar || !cur0 || el.to !== to || !el.ok) { this.setState(s => ({ ap: { ...s.ap, modal: null } })); this.notifySuccess({ title: 'Cambio no aplicado', message: 'El estatus de la solicitud cambió o ya no admite este cambio. No se aplicó nada.', refLabel: 'Folio', refValue: folio, status: 'Sin cambios' }); return; }
    const r0 = { ...cur0, entidad: this.apEnt(cur0) };
    this._apBusy = true;
    const now = this.nowStamp(), uid = this.svUid(user), canal = 'Portal web · ' + (isMobile ? 'teléfono' : 'escritorio'), tr = this.apTraveler(r0), S = window.SMV_US01.STATUS || {};
    const de = (S[r0.status] || {}).text || r0.status, a2 = 'Pendiente autorización', mot = String(motivo || '').trim();
    let moneyTxt = '';
    this.setState(s => {
      const reqs = s.sv.reqs || [], base = { ...(reqs.find(x => x.folio === folio) || cur0), entidad: r0.entidad };
      if (base.status !== r0.status) return null;
      // La cadena vuelve a empezar: las decisiones anteriores se conservan en decisionesPrev (historial, Bitácora, «resueltas por mí»).
      const nr = { ...base, status: 'pendAut', decisiones: [], decisionesPrev: (base.decisionesPrev || []).concat(base.decisiones || []), cambios: (base.cambios || []).concat([{ de: base.status, a: 'pendAut', motivo: mot, byId: uid, when: now, canal }]), regresoWhen: now };
      delete nr.motivoRechazo;
      let pres = s.pres, events = (s.pv.events || []).concat([{ ...this.svEvent(user, folio, 'Autorización', 'Regresó la solicitud de viaje a Pendiente autorización (Viáticos)', de, a2 + ' · paso 1 · motivo: ' + mot, { tone: 'azul', text: 'Pendiente autorización' }), field: 'Cambio de estatus · ' + canal }]);
      const ext = nr.travelerType === 'externo';
      if (base.status === 'aprobada') {
        // Lo comprometido se libera: mientras vuelve a autorizarse cuenta como Estimado por autorizar (regla 402).
        const neto = this.antReservaNeta(folio), rv = base.reserva || null;
        const bolsa = rv ? rv.bolsa : ((this.PRES && this.PRES.bolsaPara(nr.entidad, ext)) || {}).id;
        if (bolsa && neto > 0) { moneyTxt = 'Se liberaron ' + this.money(neto) + ' comprometidos; la solicitud vuelve a contar como Estimado por autorizar.';
          pres = this.presAddMov(s, { bolsa, periodo: rv && rv.periodo ? rv.periodo : undefined, tipo: 'Liberación manual', importe: -neto, folio, ...(ext ? { ext: nr.uid } : { uid: nr.uid }), evento: 'Regreso a Pendiente autorización por Viáticos · ' + mot, actor: user.name, actorRol: 'Viáticos', origen: 'Cambio en el Portal' });
          nr.reserva = null;
          events = events.concat([this.presEv(user, folio, 'Liberó el presupuesto comprometido al regresar la solicitud a Pendiente autorización', 'Comprometido', 'Comprometido −' + this.money(neto) + ' · bolsa ' + bolsa, { tone: 'gris', text: 'Liberado' })]); }
      } else moneyTxt = 'La solicitud vuelve a contar como Estimado por autorizar.';
      // Avisos: viajero (en externos, quien lo registró) + primer firmante de la cadena, como si la solicitud acabara de enviarse.
      const notices = { ...s.sv.notices }, toU = nr.userId || nr.uid, who = ext ? ' de ' + tr.name + ' (viajero externo)' : '', t1 = this.apTurn(nr);
      notices[toU] = [{ id: 'ce' + folio + Date.now(), folio, ...(ext ? { ext: nr.uid } : {}), text: 'La solicitud folio ' + folio + who + ' regresó a Pendiente autorización (cambio de estatus por Viáticos) y vuelve a recorrer su cadena de autorización. Motivo: ' + mot + '.', target: ext ? 'externos' : 'misviajes', when: 'hoy ' + now.split(' ')[1], unread: true, tone: 'azul' }].concat(notices[toU] || []);
      if (t1 && t1.personId && t1.personId !== toU) notices[t1.personId] = [{ id: 'ce1' + folio + Date.now(), folio, text: 'Solicitud folio ' + folio + ' de ' + tr.name + ' por autorizar (regresó a Pendiente autorización por Viáticos).', target: 'aut-viaje', when: 'hoy ' + now.split(' ')[1], unread: true, tone: 'azul' }].concat(notices[t1.personId] || []);
      return { sv: { ...s.sv, reqs: reqs.filter(x => x.folio !== folio).concat([nr]), notices }, pv: { ...s.pv, events }, pres, ap: { ...s.ap, modal: null, form: {} } };
    }, () => { this._apBusy = false;
      const whoGets = cur0.travelerType === 'externo' ? 'Quien registró al viajero externo' : 'El viajero';
      this.notifySuccess({ title: 'Solicitud regresada a Pendiente autorización', message: 'La solicitud pasó de ' + de + ' a ' + a2 + ' y vuelve a empezar su cadena de autorización desde el paso 1. ' + (moneyTxt ? moneyTxt + ' ' : '') + whoGets + ' y el primer autorizador recibieron el aviso; el cambio quedó en Bitácora.', refLabel: 'Folio', refValue: folio, status: a2, ack: () => this.setState(s => ({ ap: { ...s.ap, sel: null } })) }); });
  }
  // Por autorizar = solicitudes Pendiente autorización cuyo firmante EN TURNO es este usuario (nunca la propia). Fuente única de bandeja, Inicio, menú y campana.
  apPending(user) { if (!user || !this.apCaps(user).consultar) return []; const uid = this.svUid(user); return this.svAllReqs().filter(r => { const t = this.apTurn(r); return !!t && t.personId === uid && r.uid !== uid; }); }
  apResolved(user) { const uid = this.svUid(user), out = [], seen = new Set();
    this.svAllReqs().forEach(r => (r.decisionesPrev || []).concat(r.decisiones || []).forEach(d => { if (d.byId === uid) { out.push({ r, d }); seen.add(r.folio + '|' + d.paso); } }));
    (((window.SMV_US09 || {}).HISTORIAL) || []).forEach(h => { if (h.byId === uid && !seen.has(h.folio + '|' + h.paso)) out.push({ h, d: h }); });
    return out; }
  apAge(when) { const t = this.mvTs(when); if (!t) return { txt: '—', k: 0, days: 0 }; const m = Math.max(0, Math.round((Date.now() - t) / 60000)), days = Math.floor(m / 1440);
    return { txt: m < 60 ? 'Hace ' + Math.max(1, m) + ' min' : m < 1440 ? 'Hace ' + Math.floor(m / 60) + ' h' : days === 1 ? 'Hace 1 día' : 'Hace ' + days + ' días', k: m, days }; }
  // El paso en turno llegó al autorizador con el envío (paso 1) o con la autorización del paso anterior.
  apSince(r) { const p = this.apPaso(r), d = ((r.decisiones || []).filter(x => x.res === 'aprobada'))[p - 1]; return p && d ? d.when : (r.regresoWhen || r.when); }
  apDur(a, b) { const m = Math.max(0, Math.round((this.mvTs(b) - this.mvTs(a)) / 60000)), dd = Math.round(m / 1440); return m < 60 ? m + ' min' : m < 1440 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : dd + (dd === 1 ? ' día' : ' días'); }
  apTraveler(r) {
    const X = r.travelerType === 'externo' ? this.extById(r.uid) : null;
    if (X) { const G = this.extPerson(r.createdBy || X.registradorId) || {}; return { isExt: true, name: X.name, sub: 'Viajero externo · ' + (X.tipo || '—') + ' · registrado por ' + (G.name || '—'), org: this.extOrg(X), owner: this.extPseudo(X), X, G, emp: '' }; }
    const c = this.collabCell(r.uid), p = this.apPpl().find(x => x.id === r.uid) || {}, U = ((this.state.data && this.state.data.USERS) || []).find(u => this.svUid(u) === r.uid);
    return { isExt: false, name: c.who, sub: 'No. ' + (p.employeeNumber || '—') + ' · ' + c.org + ' · ' + (r.perfilFolio || this.pvPerfil(r.uid) || 'Sin perfil'), org: c.org, emp: p.employeeNumber || '', owner: U || { ...p, hospital: p.hospital || '', direccion: (p.erpInfo || {}).area || '' } };
  }
  // CONTEXTO PRESUPUESTAL (consume el modelo canónico de US-06 / US-07, sin fórmula propia): bolsa de la entidad + MES de inicio del viaje (disponiblePara).
  // live = revalidación en el momento exacto de autorizar. MODO DEMO «Presupuesto al autorizar» simula insuficiente · saldo que cambia · consulta no disponible.
  // ENTIDAD PRESUPUESTAL del folio: la guardada al enviar o, si falta, el resolver ÚNICO de adscripción (externo → entidad del responsable). Nunca vacía si existe adscripción.
  apEnt(r) { if (!r) return ''; if (r.entidad) return r.entidad; const X = r.travelerType === 'externo' ? this.extById(r.uid) : null; return (X ? this.extEntidad(X) : this.presEntityOf(r.uid)) || ''; }
  apBudget(r, user, live) {
    const P = this.PRES; if (!P || !r) return null; r = { ...r, entidad: this.apEnt(r) };
    const data = this.presData(), isExt = r.travelerType === 'externo', ini = ((r.segmentos || [])[0] || {}).inicio || String(r.fechas || '').split(' – ')[0];
    const dp = P.disponiblePara(data, r.entidad, isExt, ini) || { bolsa: null, pre: 0, mes: '—' };
    const ap = this.state.ap || {}, demo = ap.demo || 'normal', imp = Number(r.total) || 0;
    let pre = dp.pre || 0;
    if (demo === 'insuficiente') pre = Math.round(imp * 0.4 / 10) * 10;
    if (demo === 'cambio' && (live || ap.cambioVisto === r.folio)) pre = Math.max(0, imp - 1350);
    const ent = data.entidades.find(e => e.id === r.entidad) || null, pctAfter = ent && ent.base ? Math.round((ent.comprometido + imp) / ent.base * 100) : 0;
    const error = demo === 'error', ok = !error && !!dp.bolsa && pre >= imp, caps = this.presCaps(user), inScope = (caps.entidades || []).includes(r.entidad);
    const tone = error ? 'amarillo' : !ok ? 'rojo' : this.budgetTone(pctAfter);
    return { imp, pre, rest: pre - imp, falta: Math.max(0, imp - pre), mes: dp.mes || '—', bolsa: dp.bolsa, ent, pctAfter, ok, error, tone, inScope, canMonitor: !!caps.consultar && inScope, ownEnt: (caps.entidades || []).length > 1 ? 'consolidado' : ((caps.entidades || [])[0] || 'sin entidad') };
  }
  // Filas del Inicio (columnas `standard` / `operationalOrg`): misma población que la bandeja; la fila abre EXACTAMENTE ese folio.
  apHomeRows(user) {
    const S = window.SMV_US01.STATUS;
    return this.apPending(user).sort((a, b) => this.mvTs(this.apSince(a)) - this.mvTs(this.apSince(b))).map(r => { const ch = this.apChain(r), p = this.apPaso(r), st = ch[p] || {}, ag = this.apAge(this.apSince(r));
      const sub = st.kind === 'esc' ? 'Escalada: ' + (st.causa === 'vacante' ? 'Dirección de Hospital vacante' : 'excede límites del perfil') : r.travelerType === 'externo' && /externos/i.test(st.ctx || '') ? 'Escalada: viajero externo' : 'Solicitada ' + String(r.when || '').split(' ')[0];
      return { folio: r.folio, ...(r.travelerType === 'externo' ? { extId: r.uid } : { personId: r.uid }), destino: r.dest || '—', asunto: r.motivo + (r.proyecto ? ' · ' + r.proyecto : ''),
        detalle: 'Viaje ' + (r.fechas || '—') + ' · ' + this.money(r.total || 0) + ' est. · ' + sub, status: S.pendAut, statusSub: ch.length > 1 ? 'Paso ' + (p + 1) + ' de ' + ch.length : '', age: ag.txt,
        meta: 'Autorización de viaje · ' + (r.dest || '—') + ' · ' + (((r.segmentos || [])[0] || {}).inicio || '') + ' · ' + this.money(r.total || 0) + ' est.', go: () => this.go('aut-viaje', { folio: r.folio }) }; });
  }
  // Eventos de las decisiones de la semilla (las de la sesión ya viven en pv.events): seguimiento del folio en Aprobación y en Mis viajes.
  apSeedEvents(r) { if (!r || !r.decisiones) return []; const ch = this.apChain(r);
    return r.decisiones.filter(d => !d.ses).map(d => ({ when: d.when, accion: (d.res === 'aprobada' ? 'Autorizó' : 'Rechazó') + ' la solicitud de viaje (paso ' + (d.paso + 1) + ' de ' + ch.length + ' · ' + ((ch[d.paso] || {}).label || '') + ')', user: this.apName(d.byId),
      after: d.res === 'rechazada' ? 'Rechazada · motivo: ' + [d.motivoTipo, d.motivo].filter(Boolean).join(' · ') : 'Autorizado · ' + (d.canal || 'Portal web'), resultado: d.res === 'aprobada' ? { text: 'Autorizado', tone: 'verde' } : { text: 'Rechazado', tone: 'rojo' } })); }
  // DECISIÓN (autorizar / rechazar): firmante en turno · no propia · revalidación presupuestal · idempotente (una decisión por paso) · bitácora · avisos · reserva al último paso.
  apDecide(folio, res, mt, motivo, user, isMobile) {
    if (this._apBusy) return; this._apBusy = true;
    const uid = this.svUid(user), cur0 = this.svAllReqs().find(x => x.folio === folio);
    const fail = kind => { this._apBusy = false; this.setState(s => ({ ap: { ...s.ap, modal: null, conflict: kind } })); };
    if (!cur0 || cur0.status !== 'pendAut') return fail(cur0 && cur0.status === 'cancelada' ? 'cancelada' : 'resuelta');
    const turn = this.apTurn(cur0); if (!turn || turn.personId !== uid || !this.apCaps(user).autorizar) return fail('resuelta');
    if (cur0.uid === uid) return fail('propia');
    const ch = this.apChain(cur0), paso = this.apPaso(cur0), last = paso === ch.length - 1, next = ch[paso + 1] || null;
    if (res === 'aprobada') { const b = this.apBudget(cur0, user, true); if (!b || !b.ok) { this._apBusy = false; const dm = (this.state.ap || {}).demo; this.setState(s => ({ ap: { ...s.ap, modal: { kind: 'bloqueo', error: !!(b && b.error), cambio: dm === 'cambio' }, cambioVisto: dm === 'cambio' ? folio : s.ap.cambioVisto } })); return; } }
    const demoOther = ((this.state.ap || {}).demo) === 'otraSesion';
    const now = this.nowStamp(), canal = 'Portal web · ' + (demoOther ? 'teléfono (otra sesión)' : isMobile ? 'teléfono' : 'escritorio');
    const tr = this.apTraveler(cur0), stepTxt = 'paso ' + (paso + 1) + ' de ' + ch.length + ' · ' + turn.label, aten = this.apDur(this.apSince(cur0), now);
    const d = { paso, res, motivoTipo: mt || '', motivo: (motivo || '').trim(), byId: uid, when: now, at: Date.now(), canal, ses: true };
    let committed = 0;
    this.setState(s => {
      const reqs = s.sv.reqs || [], base = reqs.find(x => x.folio === folio) || cur0;
      if (base.status !== 'pendAut' || (base.decisiones || []).some(x => x.paso === paso)) return null;
      const nr = { ...base, entidad: this.apEnt(base), decisiones: (base.decisiones || []).concat([d]), cadenaIds: ch.map(c => c.personId), cadena: ch.map(c => ({ label: c.label, person: c.person })), cadenaInfo: ch.map(c => ({ ctx: c.ctx || '', kind: c.kind || '', causa: c.causa || '' })) };
      if (res === 'rechazada') { nr.status = 'rechazada'; nr.motivoRechazo = [d.motivoTipo, d.motivo].filter(Boolean).join(' · '); } else if (last) nr.status = 'aprobada';
      let pres = s.pres, events = (s.pv.events || []).concat([{ ...this.svEvent(user, folio, 'Autorización', (res === 'aprobada' ? 'Autorizó' : 'Rechazó') + ' la solicitud de viaje (' + stepTxt + ')', 'Pendiente autorización · ' + stepTxt,
        res === 'rechazada' ? 'Rechazada · motivo: ' + nr.motivoRechazo : last ? 'Aprobada · cadena completa' : 'Pendiente autorización · continúa con ' + next.label + (next.person ? ' (' + next.person + ')' : ''), res === 'aprobada' ? { tone: 'verde', text: 'Autorizado' } : { tone: 'rojo', text: 'Rechazado' }), field: 'Aprobación de viaje · ' + canal + ' · atención ' + aten }]);
      if (res === 'aprobada' && last && this.PRES) {
        const ext = nr.travelerType === 'externo', ini = ((nr.segmentos || [])[0] || {}).inicio, dp = this.PRES.disponiblePara(this.presData(), nr.entidad, ext, ini);
        const bolsa = dp && dp.bolsa ? dp.bolsa.id : (this.PRES.bolsaPara(nr.entidad, ext) || {}).id;
        if (bolsa && nr.total) { committed = nr.total;
          pres = this.presAddMov(s, { bolsa, periodo: dp ? dp.periodo : undefined, tipo: 'Reserva', importe: nr.total, folio, ...(ext ? { ext: nr.uid } : { uid: nr.uid }), evento: 'Aprobación de la planeación del viaje', actor: user.name, actorRol: turn.label, origen: 'Proceso' });
          nr.reserva = { bolsa, periodo: dp ? dp.periodo : '', importe: nr.total, when: now };
          events = events.concat([this.presEv(user, folio, 'Reserva presupuestal automática al aprobar la solicitud', 'Planeado', 'Comprometido +' + this.money(nr.total) + ' · bolsa ' + bolsa + (dp ? ' · ' + dp.periodo : ''), { tone: 'verde', text: 'Comprometido' })]); }
      }
      const notices = { ...s.sv.notices }, to = nr.userId || nr.uid, ext = nr.travelerType === 'externo', who = ext ? ' de ' + tr.name + ' (viajero externo)' : '';
      if (res === 'rechazada' || last) notices[to] = [{ id: 'apr' + folio + Date.now(), folio, ...(ext ? { ext: nr.uid } : {}), text: res === 'rechazada' ? 'La solicitud folio ' + folio + who + ' fue rechazada por ' + turn.label + '. Motivo: ' + nr.motivoRechazo + '.' : 'La solicitud folio ' + folio + who + ' fue aprobada; el presupuesto quedó comprometido.', target: ext ? 'externos' : 'misviajes', when: 'hoy ' + now.split(' ')[1], unread: true, tone: res === 'rechazada' ? 'rojo' : 'verde' }].concat(notices[to] || []);
      return { sv: { ...s.sv, reqs: reqs.filter(x => x.folio !== folio).concat([nr]), notices }, pv: { ...s.pv, events }, pres, ap: { ...s.ap, modal: null, form: {}, conflict: demoOther ? 'otraSesion' : null } };
    }, () => {
      this._apBusy = false;
      if (demoOther) return;
      const back = () => this.setState(s => ({ ap: { ...s.ap, sel: null, conflict: null } })), whoGets = cur0.travelerType === 'externo' ? 'Quien registró al viajero externo' : 'El viajero';
      this.notifySuccess(res === 'rechazada' ? { title: 'Solicitud rechazada', message: 'La solicitud quedó Rechazada y el proceso no continúa. ' + whoGets + ' recibió el aviso con el motivo.', refLabel: 'Folio', refValue: folio, status: 'Rechazada', ack: back }
        : last ? { title: 'Solicitud autorizada', message: 'Cadena completa: la solicitud quedó Aprobada y se comprometieron ' + this.money(committed || cur0.total) + ' en ' + cur0.entidad + '. ' + whoGets + ' recibió el aviso.', refLabel: 'Folio', refValue: folio, status: 'Aprobada', ack: back }
        : { title: 'Paso autorizado', message: 'La solicitud continúa con ' + next.label + (next.person ? ' (' + next.person + ')' : '') + '. El presupuesto se compromete al completarse la cadena.', refLabel: 'Folio', refValue: folio, status: 'Pendiente autorización · paso ' + (paso + 2) + ' de ' + ch.length, ack: back });
    });
  }
  // Forma de pago guardada en la solicitud (sin datos sensibles: débito = referencia enmascarada del ERP; alternativa = banco + terminación; corporativa = sin datos).
  // Modelo guardado: { metodo, label, origen, referencia (siempre enmascarada), alternativa: { banco, tipoTarjeta (código), cuenta18 } | null }.
  // La cuenta completa solo vive en el modelo; toda vista de lectura usa la referencia enmascarada.
  apRender(ctx) {
    const blank = { isAP: false, apUseTray: false, apTrayDef: null, apTabs: [], apShowTabs: false, apShowDetail: false, apBack: { label: '', go: () => {} }, apPurpose: '', apIcon: {}, apTabNote: '', apHasTabNote: false,
      apd: { found: false, notFound: false, nfText: '', banners: [], chips: [], budget: { rows: [], actions: [], lights: [] }, chain: [], devs: [], noDevs: false, info: { viajero: [], general: [], segs: [], docs: [] }, montos: [], mtot: '', hist: [], bar: { show: false } },
      apHasModal: false, apm: { rows: [], opts: [], isAprobar: false, isRechazar: false, isBloqueo: false } };
    if (!ctx.isAP || !this.PV) return blank;
    const { user, narrow, isMobile } = ctx, s = this.state, ap = s.ap || {}, T = this.TONES, uid = this.svUid(user), caps = this.apCaps(user), A = window.SMV_US09 || {}, S = window.SMV_US01.STATUS || {};
    const tone = t => T[t] || T.gris, badge = (text, t) => ({ text, bg: tone(t).bg, border: tone(t).border, fg: '#4A4F54' });
    const toTop = () => setTimeout(() => { const r0 = this.rootRef.current, m = r0 && r0.querySelector('main'); if (m) m.scrollTop = 0; }, 30);
    const setAP = p => this.setState(st => ({ ap: { ...(st.ap || {}), ...p } }));
    const open = f => { setAP({ sel: f, modal: null, conflict: null, form: {} }); toTop(); };
    const out = { ...blank, isAP: true, apIcon: { back: 'M19 12H5M11 18l-6-6 6-6', wallet: this.glyph('wallet'), chain: this.glyph('checkCircle'), list: this.glyph('list'), history: this.glyph('history'), alert: this.ICONS.amarillo, info: this.ICONS.info, file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6' },
      apPurpose: 'Aquí se resuelven las solicitudes de viaje en las que este usuario es el autorizador en turno, con el contexto presupuestal, la cadena de autorización y las desviaciones de política con su evidencia. Autorizadas y Rechazadas muestran lo resuelto por este usuario.' };
    const pend = this.apPending(user), resolved = this.apResolved(user), tabIds = (caps.autorizar || !caps.cambiar ? ['pend', 'ok', 'rej'] : []).concat(caps.cambiar ? ['v-apr', 'v-rej'] : []), tab = tabIds.includes(ap.tab) ? ap.tab : tabIds[0], P9 = A.PARAMS || { diasAtencion: 3, motivoMax: 500 };
    const origenOf = r => (r.ruta && r.ruta.origen && r.ruta.origen.label) || r.origenTexto || '—';
    const pseudo = h => ({ folio: h.folio, uid: h.uid, userId: h.uid, status: 'aprobada', dest: h.destino, fechas: h.fechas, motivo: h.motivo, proyecto: '', total: h.total, perfilFolio: h.perfil, when: h.enviada, segmentos: [], gastos: [], acompanantes: [], entidad: this.presEntityOf(h.uid) || '',
      cadenaIds: [h.byId], cadena: [{ label: h.label, person: this.apName(h.byId) }], cadenaInfo: [{ ctx: 'Folio histórico' }], decisiones: [{ paso: 0, res: 'aprobada', byId: h.byId, when: h.when, canal: h.canal }], hist: true });
    const travRow = (r, extra) => { const t = this.apTraveler(r), tipo = t.isExt ? 'Viajero externo' : r.rolGrupo === 'acompanante' ? 'Acompañante' : 'Colaborador', n = (r.segmentos || []).length;
      const row = { folio: r.folio, viajero: t.name, tipoTxt: tipo, destino: r.dest || '—', fechasTxt: r.fechas || '—', fechasK: (String(r.fechas || '').split(' – ')[0] || '').split('/').reverse().join(''), montoTxt: (r.hasta ? 'Hasta ' : '') + this.money(r.total || 0), montoN: String(Math.round(r.total || 0)).padStart(10, '0'),
        orgTxt: t.org, emp: t.emp || '', perfilTxt: r.perfilFolio || '', escTxt: 'Normal',
        _sub: { viajero: t.sub, destino: (n > 1 ? n + ' destinos · ' : '') + 'desde ' + origenOf(r), montoTxt: r.exceso ? 'Excede límites del perfil' : '' },
        _badge: { tipoTxt: tipo === 'Colaborador' ? { text: tipo, bg: '#fff', border: '#D9D8D6', fg: '#4A4F54' } : badge(tipo, tipo === 'Viajero externo' ? 'azul' : 'gris') } };
      return { ...row, ...extra, _sub: { ...row._sub, ...((extra || {})._sub || {}) }, _badge: { ...row._badge, ...((extra || {})._badge || {}) } }; };
    // ---------- BANDEJA ----------
    if (!ap.sel) {
      out.apShowTabs = true;
      out.apTabs = (caps.autorizar || !caps.cambiar ? [['pend', 'Por autorizar', pend.length], ['ok', 'Autorizadas', 0], ['rej', 'Rechazadas', 0]] : []).concat(caps.cambiar ? [['v-apr', 'Aprobadas', 0], ['v-rej', 'Rechazadas' + (caps.autorizar ? ' (todas)' : ''), 0]] : []).map(([id, label, n]) => { const on = tab === id;
        return { label, on, line: on ? '#00A7E1' : 'transparent', fg: on ? '#00A7E1' : '#4A4F54', weight: on ? 700 : 500, go: () => setAP({ tab: id, sel: null }), ...this.tabBadge(n, 'solicitud por autorizar', 'solicitudes por autorizar') }; });
      const NARROW = narrow || (s.width || 0) < 1300;
      if (tab === 'v-apr' || tab === 'v-rej') {
        const want = tab === 'v-apr' ? ['aprobada', 'enProceso', 'finalizado'] : ['rechazada'];
        const rows = this.svAllReqs().filter(r => want.includes(r.status)).map(r0 => { const r = { ...r0, entidad: this.apEnt(r0) }, el = this.apCambioElig(r, user), stx = (S[r.status] || {}).text || r.status, dl = (r.decisiones || []).slice(-1)[0] || {}, cb = (r.cambios || []).slice(-1)[0];
          return travRow(r, { estadoTxt: stx, decWhen: cb ? cb.when : dl.when || r.when || '—', decK: String(this.mvTs(cb ? cb.when : dl.when || r.when)).padStart(15, '0'), ceTxt: el.ok ? 'Disponible · a Pendiente autorización' : 'No disponible',
            _sub: { estadoTxt: r.status === 'rechazada' ? (r.motivoRechazo || '') : cb ? 'Cambio de estatus por Viáticos' : '', ceTxt: el.ok ? '' : (el.reason || '').replace(/^No disponible: /, ''), decWhen: cb ? 'Cambio de estatus' : 'Última decisión' },
            _badge: { estadoTxt: badge(stx, r.status === 'rechazada' ? 'rojo' : 'verde'), ceTxt: badge(el.ok ? 'Disponible' : 'No disponible', el.ok ? 'azul' : 'gris') } }); });
        out.apHasTabNote = true; out.apTabNote = tab === 'v-apr' ? 'Una solicitud aprobada puede regresar a Pendiente autorización solo mientras no tenga movimientos posteriores (anticipo, vuelo o comprobación); el presupuesto comprometido se libera y la cadena vuelve a empezar.' : 'Una solicitud rechazada puede regresar a Pendiente autorización: vuelve a recorrer su cadena de autorización desde el paso 1.';
        out.hasList = true;
        out.list = this.buildList('ap-' + tab, rows, [['Folio', 'folio', 'text'], ['Colaborador / Viajero', 'viajero', 'text'], ['Tipo de viajero', 'tipoTxt', 'badge'], ['Destino', 'destino', 'text'], ['Fechas', 'fechasTxt', 'text'], ['Monto estimado', 'montoTxt', 'text'], ['Estatus', 'estadoTxt', 'badge'], ['Fecha', 'decWhen', 'text'], ['Cambio de estatus', 'ceTxt', 'badge'], ['Detalle', '_a', 'action']], {
          title: tab === 'v-apr' ? 'Solicitudes aprobadas' : 'Solicitudes rechazadas', icon: 'history', toolbar: true, narrow: NARROW, pageSize: 6, leadField: 'viajero', actionLabel: 'Ver detalle',
          searchPh: 'Buscar por folio, colaborador, número o destino', searchFields: ['emp', 'orgTxt', 'perfilTxt'],
          filters: [{ key: 'tipoTxt', label: 'Tipo de viajero' }, { key: 'orgTxt', label: 'Hospital / Corporativo' }, { key: 'ceTxt', label: 'Cambio de estatus' }], sortKeys: { fechasTxt: 'fechasK', montoTxt: 'montoN', decWhen: 'decK' }, minW: '1280px',
          gridCols: 'minmax(64px,.55fr) minmax(0,1.5fr) minmax(0,.9fr) minmax(0,1.2fr) minmax(0,1.1fr) minmax(0,.8fr) minmax(0,.9fr) minmax(0,1fr) minmax(0,1.2fr) minmax(0,.7fr)',
          empty: tab === 'v-apr' ? 'No hay solicitudes aprobadas.' : 'No hay solicitudes rechazadas.', onRow: r => open(r.folio), onAction: r => open(r.folio) });
      } else if (tab === 'pend') {
        const hr = this.apHomeRows(user);
        out.apUseTray = true;
        out.apTrayDef = { title: 'Solicitudes por autorizar', columns: 'standard', target: 'aut-viaje', noCta: true, filters: ['destino'], detalleMeaning: 'Línea 1: fechas del viaje · monto estimado · Línea 2: fecha de solicitud o motivo del escalamiento', rows: hr, count: hr.length, empty: 'No hay solicitudes por autorizar.' };
      } else {
        const want = tab === 'ok' ? 'aprobada' : 'rechazada';
        const rows = resolved.filter(x => x.d.res === want).map(({ r, h, d }) => { const rr = r || pseudo(h), ch = this.apChain(rr), stx = (S[rr.status] || {}).text || rr.status;
          const nowTxt = rr.status === 'pendAut' ? 'Pendiente autorización · paso ' + (this.apPaso(rr) + 1) + ' de ' + ch.length : stx, start = d.paso ? ((rr.decisiones || [])[d.paso - 1] || {}).when : rr.when;
          return travRow(rr, { decTxt: d.res === 'aprobada' ? 'Autorizada' : 'Rechazada', decWhen: d.when, decK: String(this.mvTs(d.when)).padStart(15, '0'), estadoTxt: nowTxt,
            _sub: { decWhen: 'Paso ' + (d.paso + 1) + ' de ' + ch.length + (start ? ' · atención ' + this.apDur(start, d.when) : ''), estadoTxt: d.res === 'rechazada' ? [d.motivoTipo, d.motivo].filter(Boolean).join(' · ') : '' },
            _badge: { decTxt: badge(d.res === 'aprobada' ? 'Autorizada' : 'Rechazada', d.res === 'aprobada' ? 'verde' : 'rojo') } }); });
        out.apHasTabNote = true; out.apTabNote = 'Resueltas por este usuario: cada decisión se conserva tal como se registró (no se sobrescribe), con su fecha, canal y tiempo de atención.';
        out.hasList = true;
        out.list = this.buildList('ap-' + tab, rows, [['Folio', 'folio', 'text'], ['Colaborador / Viajero', 'viajero', 'text'], ['Tipo de viajero', 'tipoTxt', 'badge'], ['Destino', 'destino', 'text'], ['Fechas', 'fechasTxt', 'text'], ['Monto estimado', 'montoTxt', 'text'], ['Decisión', 'decTxt', 'badge'], ['Fecha de decisión', 'decWhen', 'text'], ['Estatus actual', 'estadoTxt', 'text'], ['Detalle', '_a', 'action']], {
          title: tab === 'ok' ? 'Autorizadas por mí' : 'Rechazadas por mí', icon: 'history', toolbar: true, narrow: NARROW, pageSize: 6, leadField: 'viajero', actionLabel: 'Ver detalle',
          searchPh: 'Buscar por folio, colaborador, número o destino', searchFields: ['emp', 'orgTxt', 'perfilTxt'],
          filters: [{ key: 'tipoTxt', label: 'Tipo de viajero' }, { key: 'orgTxt', label: 'Hospital / Corporativo' }], sortKeys: { fechasTxt: 'fechasK', montoTxt: 'montoN', decWhen: 'decK' }, minW: '1280px',
          gridCols: 'minmax(64px,.55fr) minmax(0,1.5fr) minmax(0,.9fr) minmax(0,1.2fr) minmax(0,1.1fr) minmax(0,.8fr) minmax(0,.8fr) minmax(0,1.1fr) minmax(0,1.2fr) minmax(0,.7fr)',
          empty: tab === 'ok' ? 'Aún no hay solicitudes autorizadas por este usuario.' : 'Aún no hay solicitudes rechazadas por este usuario.', onRow: r => open(r.folio), onAction: r => open(r.folio) });
      }
      return out;
    }
    // ---------- DETALLE PARA DECIDIR ----------
    const back = { label: 'Volver a Aprobación de viaje', go: () => { setAP({ sel: null, modal: null, conflict: null }); toTop(); } };
    out.apShowDetail = true; out.apBack = back;
    const hEnt = (A.HISTORIAL || []).find(x => x.folio === ap.sel && x.byId === uid);
    const r0 = this.svAllReqs().find(x => x.folio === ap.sel) || (hEnt ? pseudo(hEnt) : null), r = r0 ? { ...r0, entidad: this.apEnt(r0) || r0.entidad } : null;
    const ch = r ? this.apChain(r) : [], paso = r ? this.apPaso(r) : 0, turn = r ? this.apTurn(r) : null;
    const mine = !!r && (r.decisiones || []).some(d => d.byId === uid), onTurn = !!turn && turn.personId === uid && r.uid !== uid;
    const ceEl = r && caps.cambiar ? this.apCambioElig(r, user) : { to: null };
    if (!r || !(onTurn || mine || !!ceEl.to || (r.status === 'cancelada' && ch.some(c => c.personId === uid)))) {
      out.apd = { ...blank.apd, notFound: true, nfText: 'El folio ' + ap.sel + ' no está disponible para este usuario: aquí solo se muestran las solicitudes en las que es el autorizador en turno, que ya resolvió o cuyo estatus puede cambiar (Viáticos).' }; return out; }
    const tr = this.apTraveler(r), stx = S[r.status] || { text: r.status, tone: 'gris' }, last = paso >= ch.length - 1, next = ch[paso + 1] || null;
    const canDecide = onTurn && caps.autorizar && r.status === 'pendAut', b = this.apBudget(r, user, false) || { ok: true, tone: 'verde', rows: [] };
    const isComp = r.rolGrupo === 'acompanante', grp = r.grupo ? this.svAllReqs().filter(x => x.grupo === r.grupo && x.folio !== r.folio) : [];
    const decMine = (r.decisiones || []).filter(d => d.byId === uid).pop();
    // Avisos del detalle (patrón de mensaje del Portal; uno por condición, sin repetir lo que dice el encabezado)
    const ban = (tn, title, text) => ({ title, text, bg: tone(tn).bg, border: tone(tn).border, fg: tone(tn).fg, icon: tn === 'verde' ? (this.ICONS.verde || this.ICONS.info) : tn === 'rojo' ? (this.ICONS.rojo || this.ICONS.amarillo) : tn === 'amarillo' ? this.ICONS.amarillo : this.ICONS.info });
    const banners = [];
    if (ap.conflict === 'otraSesion' || ap.conflict === 'resuelta') banners.push(ban('amarillo', 'Este paso ya se resolvió en otra sesión', 'La decisión válida se registró ' + (decMine ? decMine.when + ' desde ' + decMine.canal : 'en otra sesión o dispositivo') + '. Solo existe una decisión por paso: aquí no se aplicó una segunda.'));
    if (r.status === 'cancelada') banners.push(ban('gris', 'Solicitud cancelada', 'El solicitante canceló la solicitud mientras estaba pendiente; se retiró de Por autorizar y no requiere acción.'));
    if (r.status === 'rechazada') banners.push(ban('rojo', 'Solicitud rechazada', 'Motivo: ' + (r.motivoRechazo || '—') + '. El proceso no continúa.'));
    if (r.status === 'aprobada' || ['enProceso', 'finalizado'].includes(r.status)) banners.push(ban('verde', 'Solicitud aprobada', 'Cadena completa' + (r.reserva ? ': se comprometieron ' + this.money(r.reserva.importe) + ' en la bolsa ' + r.reserva.bolsa + ' (' + r.reserva.periodo + ').' : r.hist ? ': folio histórico con su reserva presupuestal registrada.' : '.')));
    if (r.status === 'pendAut' && !onTurn && decMine) banners.push(ban('azul', 'Tu paso ya está resuelto', (decMine.res === 'aprobada' ? 'Autorizaste' : 'Rechazaste') + ' el ' + decMine.when + '. La solicitud continúa con ' + this.apTurnLabel(r, true) + ' (paso ' + (paso + 1) + ' de ' + ch.length + ').'));
    if (onTurn && !caps.autorizar) banners.push(ban('amarillo', 'Sin permiso para autorizar', 'La configuración de este usuario permite consultar la bandeja, pero no incluye la acción Autorizar de Aprobación de viaje (Usuarios y permisos).'));
    const escStep = ch.find(c => c.kind === 'esc');
    if (escStep) banners.push(ban('amarillo', 'Escalada a Capital Humano Corporativo', escStep.causa === 'vacante' ? 'Causa: Dirección de Hospital vacante. El paso que correspondía a la Dirección de Hospital lo atiende Capital Humano Corporativo.' : 'Causa: excedente de límites del perfil. La solicitud supera una regla del perfil y llega con justificación y el documento «Autorización del excedente» (Datos del viaje › Documentos).'));
    if (tr.isExt) banners.push(ban('azul', 'Viajero externo', 'Sin acceso al Portal ni datos del ERP. Lo registró y gestiona ' + ((tr.G || {}).name || '—') + ' (Capital Humano HSM), quien recibe los avisos de esta solicitud. Anticipo: no aplica.'));
    if (isComp) { const og = this.svAllReqs().find(x => x.folio === r.origenFolio);
      banners.push(ban('azul', 'Solicitud individual de acompañante', 'Viaje originado por ' + this.apName(r.origenUid) + ' (folio ' + r.origenFolio + (og ? ' · ' + ((S[og.status] || {}).text || og.status) : '') + ').')); }
    else if (grp.length) banners.push(ban('azul', 'Viaje en grupo', 'Este folio es el origen del grupo. Cada acompañante tiene su propia solicitud y su propia autorización: ' + grp.map(x => this.apName(x.uid) + ' · folio ' + x.folio + ' · ' + ((S[x.status] || {}).text || x.status)).join(' · ') + '.'));
    // Presupuesto · semáforo con el efecto de autorizar (consume uspres-data.js; cifras de la entidad solo dentro del alcance del Monitor del autorizador)
    const SEM = { verde: 'Presupuesto suficiente', amarillo: b.error ? 'Consulta no disponible' : 'Suficiente · utilización en advertencia', rojo: b.ok ? 'Suficiente · utilización crítica' : 'Presupuesto insuficiente' };
    const pendNow = r.status === 'pendAut', lights = [{ on: true, bg: tone(b.tone).border, border: tone(b.tone).border, label: b.tone === 'verde' ? 'Verde' : b.tone === 'amarillo' ? 'Ámbar' : 'Rojo' }];
    const bRows = !pendNow ? [{ k: 'Entidad presupuestal', v: r.entidad || '—' }, { k: 'Efecto', v: r.status === 'rechazada' ? 'No se comprometió presupuesto: la solicitud fue rechazada.' : r.status === 'cancelada' ? 'Sin compromiso: la solicitud se canceló antes de aprobarse.' : r.reserva ? 'Comprometido ' + this.money(r.reserva.importe) + ' · bolsa ' + r.reserva.bolsa + ' · ' + r.reserva.periodo : 'Comprometido con la aprobación' }]
      : b.inScope ? [{ k: 'Entidad presupuestal', v: r.entidad + (b.ent ? ' · ' + b.ent.tipo : '') }, { k: 'Disponible del mes · ' + b.mes, v: b.error ? 'No disponible' : this.money(b.pre) }, { k: 'Disponible restante al autorizar', v: b.error ? '—' : (b.rest < 0 ? '−' : '') + this.money(Math.abs(b.rest)) }, { k: 'Utilización anual después de autorizar', v: b.error ? '—' : b.pctAfter + ' %' }]
      : [{ k: 'Entidad presupuestal', v: r.entidad || '—' }, { k: 'Mes de la solicitud', v: b.mes }];
    const bNote = '';
    const blocked = pendNow && onTurn && !b.ok;
    const bActs = !blocked ? [] : (b.error ? [{ label: 'Reintentar validación', go: () => setAP({ demo: 'normal', cambioVisto: null }) }] : []).concat(b.canMonitor && !b.error ? [{ label: 'Ver presupuesto en el Monitor', go: () => this.go('pres-monitor', { entity: r.entidad }) }] : []);
    const budget = { tone: b.tone, sem: pendNow ? SEM[b.tone] : r.status === 'rechazada' || r.status === 'cancelada' ? 'Sin compromiso' : 'Comprometido', semBg: pendNow ? tone(b.tone).bg : '#F4F4F4', semBorder: pendNow ? tone(b.tone).border : '#D9D8D6', lights, showLights: pendNow,
      bigLabel: !pendNow ? (r.status === 'aprobada' || r.reserva ? 'Importe comprometido' : 'Importe estimado del folio') : !onTurn ? 'Se comprometerán al completarse la cadena' : last ? 'Al autorizar se comprometerán' : 'Se comprometerán al completarse la cadena', big: this.money(r.total || 0), rows: bRows, note: bNote, hasNote: !!bNote,
      hasBlock: blocked, blockTitle: b.error ? 'No fue posible consultar el presupuesto' : 'No se puede autorizar sin presupuesto',
      blockText: b.error ? 'La consulta del disponible no respondió. Autorizar se habilita cuando la validación se complete.' : 'El disponible de ' + b.mes + (b.inScope ? ' es ' + this.money(b.pre) + ': faltan ' + this.money(b.falta) + ' para el estimado.' : ' no alcanza para el estimado de esta solicitud.') + ' Los suplementos se registran por carga de archivo en Presupuesto › Monitor (Contabilidad / Tesorería); al registrarse, el disponible se actualiza y esta solicitud podrá autorizarse.',
      blockBg: b.error ? T.amarillo.bg : T.rojo.bg, blockBorder: b.error ? T.amarillo.border : T.rojo.border, blockFg: b.error ? T.amarillo.fg : T.rojo.fg, actions: bActs, hasActions: bActs.length > 0,
      help: this.helpTip('ap-pres', 'El semáforo resulta de validar el estimado contra el disponible del mes de inicio del viaje en la bolsa de la entidad presupuestal: rojo si no alcanza; ámbar o rojo si, al comprometerlo, la utilización anual de la entidad supera los umbrales configurados (' + ((this.PRES && this.PRES.CONFIG.umbrales.advertencia) || 70) + ' % / ' + ((this.PRES && this.PRES.CONFIG.umbrales.critico) || 85) + ' %).') };
    // Cadena de autorización (contexto del autorizador): quién firmó, quién sigue y el tiempo de cada paso
    const dec = r.decisiones || [];
    const chain = ch.map((c, i) => { const d = dec.find(x => x.paso === i), start = i === 0 ? r.when : (dec.find(x => x.paso === i - 1) || {}).when;
      let state, tn; if (d) { state = d.res === 'aprobada' ? 'Autorizó' : 'Rechazó'; tn = d.res === 'aprobada' ? 'verde' : 'rojo'; }
      else if (r.status === 'pendAut' && i === paso) { state = 'Pendiente'; tn = 'azul'; } else if (r.status === 'pendAut') { state = 'En espera'; tn = 'gris'; }
      else if (r.status === 'aprobada' && !dec.some(x => x.res === 'rechazada' && x.paso < i)) { state = 'Autorizó'; tn = 'verde'; } else { state = 'No aplica'; tn = 'gris'; }
      const time = d ? 'Atención: ' + (start ? this.apDur(start, d.when) : '—') + ' · ' + d.when + ' · ' + (d.canal || 'Portal web') : state === 'Pendiente' && start ? 'En espera desde ' + start + ' · ' + this.apAge(start).txt.toLowerCase() : '';
      return { n: String(i + 1), label: c.label, person: (c.person || 'Sin autorizador resuelto') + (c.personId === uid ? ' · tú' : ''), ctx: c.ctx || '', hasCtx: !!c.ctx, state, ...badge(state, tn), time, hasTime: !!time,
        isEsc: c.kind === 'esc', escTxt: c.causa === 'vacante' ? 'Escalada · Dirección de Hospital vacante' : 'Escalada · excedente de límites del perfil', hasMotivo: !!(d && d.res === 'rechazada'), motivo: d ? [d.motivoTipo, d.motivo].filter(Boolean).join(' · ') : '',
        mbg: tn === 'verde' ? '#A2C83A' : tn === 'azul' ? '#00A7E1' : tn === 'rojo' ? '#FEEDED' : '#fff', mfg: tn === 'verde' || tn === 'azul' ? '#fff' : tn === 'rojo' ? '#F25757' : '#777779', mborder: tn === 'verde' ? '#A2C83A' : tn === 'azul' ? '#00A7E1' : tn === 'rojo' ? '#F25757' : '#A9A8A9' }; });
    const chainNext = !pendNow ? '' : !onTurn ? 'En espera de ' + this.apTurnLabel(r, true) + ' (paso ' + (paso + 1) + ' de ' + ch.length + '). ' + (last ? 'Con su autorización la solicitud queda Aprobada y se compromete el presupuesto.' : 'Después continúa ' + next.label + '.') : last ? 'Último paso: al autorizar, la solicitud queda Aprobada y se compromete el presupuesto.' : 'Al autorizar el paso ' + (paso + 1) + ', la solicitud continúa con ' + next.label + (next.person ? ' (' + next.person + ')' : '') + '.';
    // Desviaciones de política con su evidencia (ámbar: regla excedida + documento) · preautorización HSM → HSM (validada en Creación)
    const docOf = k => (r.evidencia || []).find(x => x.key === k);
    const devs = (r.excesos || []).map(x => ({ title: x, tone: 'amarillo', bg: T.amarillo.bg, border: T.amarillo.border, fg: T.amarillo.fg, icon: this.ICONS.amarillo, kind: 'Excede la política del perfil', hasDoc: false, doc: '', docTipo: '', onDoc: () => {}, noDoc: !docOf('exc') }))
      .concat(docOf('preaut') ? [{ title: 'Viaje HSM → HSM con preautorización de DGA adjunta (validada al enviar la solicitud).', tone: 'azul', bg: T.azul.bg, border: T.azul.border, fg: T.azul.fg, icon: this.ICONS.info, kind: 'Evidencia requerida por el tipo de viaje', hasDoc: false, doc: '', docTipo: '', onDoc: () => {}, noDoc: false }] : []);
    // Un solo documento cubre todos los excedentes (Creación pide uno: «Autorización del excedente»); se consulta en Datos del viaje › Documentos, sin repetirlo aquí.
    const devDocNote = (r.excesos || []).length && docOf('exc') ? 'Autorización del excedente adjunta: un solo documento cubre ' + ((r.excesos || []).length === 1 ? 'esta desviación' : 'las ' + r.excesos.length + ' desviaciones') + '. Consúltalo en Datos del viaje › Documentos.' : docOf('preaut') ? 'La preautorización de DGA se consulta en Datos del viaje › Documentos.' : '';
    // Montos vs tarifas del perfil
    const perfil = r.perfilFolio || '', tf = c => { try { return this.pvTarifa(c, perfil); } catch (e) { return null; } }, t1 = tf('c1');
    const hotelN = (r.segmentos || []).filter(sg => sg.hospedaje === 'hotel').reduce((n, sg) => n + (sg.noches || 0), 0);
    let alimTxt = ''; try { alimTxt = this.pvAlimText(perfil, ' · '); } catch (e) { alimTxt = ''; }
    const montos = (r.gastos || []).map(g => { const tarifa = g.origen === 'tarifa';
      const ref = g.concepto === 'Hospedaje' ? (g.importe ? (t1 && t1.importe ? 'Tope del perfil ' + this.money(t1.importe) + ' por noche · ' + hotelN + (hotelN === 1 ? ' noche' : ' noches') + ' en hotel' : 'Tarifa del perfil') : 'Sin costo · hospedaje en hospital')
        : g.concepto === 'Alimentos' ? 'Topes por día del perfil: ' + (alimTxt || '—') : g.concepto === 'Tintorería' ? 'Tarifa del perfil a partir del ' + (this.pvTint().desdeDia || '—') + '.º día' : 'Capturado por el viajero' + (g.segmento ? ' · destino ' + g.segmento : '');
      return { k: g.concepto, v: this.money(g.importe || 0), sub: ref, tag: tarifa ? 'Tarifa del perfil' : 'Capturado', tagBg: tarifa ? T.verde.bg : '#F4F4F4', tagBorder: tarifa ? T.verde.border : '#D9D8D6' }; });
    // Datos del viaje = MISMA lectura del folio que Mis viajes (mvInfo), sin controles de edición: el autorizador no modifica la solicitud.
    const info = this.mvInfo({ r, D: null, h: null, row: { ownerId: r.uid, folio: r.folio, fechas: r.fechas || '—', perfilFolio: r.perfilFolio || '—', motivo: r.motivo, src: 'sol' }, owner: tr.owner, user, isComp, st: r.status, nm: id => this.apName(id), grp, STX: s3 => ((S[s3]) || { text: '—' }).text });
    // Seguimiento del folio: envío + decisiones (semilla) + eventos de la sesión (mismo modelo de bitácora)
    const evs = [{ when: r.when, accion: r.hist ? 'Solicitud enviada a autorización' : 'Envió la solicitud a autorización', user: tr.isExt ? ((tr.G || {}).name || '—') + ' · Capital Humano HSM' : tr.name, after: 'Pendiente autorización · estimado ' + this.money(r.total || 0), resultado: { text: 'Enviado', tone: 'azul' } }]
      .concat(this.apSeedEvents(r)).concat(((s.pv && s.pv.events) || []).filter(e => e.folio === r.folio)).filter(e => e.when).sort((a, b2) => this.mvTs(a.when) - this.mvTs(b2.when));
    const hist = evs.map(e => ({ when: e.when, accion: e.accion, user: e.user, detail: e.after || '', result: (e.resultado || {}).text || '', ...badge((e.resultado || {}).text || '', (e.resultado || {}).tone || 'gris') }));
    // Barra de decisión (fija al pie; en teléfono AUTORIZAR / RECHAZAR al 100 % y separados)
    const okBtn = canDecide && b.ok;
    const reason = !onTurn ? '' : !caps.autorizar ? 'Autorizar no disponible: el usuario no tiene la acción Autorizar.' : b.error ? 'Autorizar no disponible: la consulta de presupuesto no respondió.' : !b.ok ? 'Autorizar no disponible: presupuesto insuficiente para ' + b.mes + '.' : '';
    const ceShow = !(onTurn && r.status === 'pendAut') && !!ceEl.to && r.status !== 'pendAut', ceOk = ceShow && ceEl.ok;
    const ceReason = !ceShow ? '' : !ceEl.ok ? ceEl.reason : '';
    const ceOpen = () => { if (!ceOk) return; this._apRet = document.activeElement; setAP({ modal: { kind: 'cambio', to: ceEl.to }, form: {}, conflict: null }); setTimeout(() => { const el = this.apModalRef.current; if (el && el.focus) el.focus({ preventScroll: true }); }, 40); };
    const bar = { show: (onTurn && r.status === 'pendAut') || ceShow, totalLabel: ceShow ? 'Total de la solicitud' : 'Total a autorizar', apLabel: ceShow ? 'Regresar a Pendiente autorización' : 'Autorizar', rjLabel: 'Rechazar',
      apShow: true, rjShow: !ceShow, hint: last || !next ? 'Paso ' + (paso + 1) + ' de ' + ch.length + ' · último paso de la cadena' : 'Paso ' + (paso + 1) + ' de ' + ch.length + ' · después: ' + next.label + (next.person ? ' (' + next.person + ')' : ''), reason: ceShow ? ceReason : reason, hasReason: !!(ceShow ? ceReason : reason),
      apBg: okBtn ? '#00A7E1' : '#D0D2D3', apFg: okBtn ? '#fff' : '#777779', apCursor: okBtn ? 'pointer' : 'not-allowed', apDisabled: !okBtn, apHover: okBtn ? '#0090C2' : '#D0D2D3',
      rjDisabled: !canDecide, rjFg: canDecide ? '#F25757' : '#A9A8A9', rjBorder: canDecide ? '#F25757' : '#D0D2D3', rjCursor: canDecide ? 'pointer' : 'not-allowed',
      onApprove: () => { if (!okBtn) return; this._apRet = document.activeElement; setAP({ modal: { kind: 'aprobar' }, conflict: null }); setTimeout(() => { const el = this.apModalRef.current; if (el && el.focus) el.focus({ preventScroll: true }); }, 40); },
      onReject: () => { if (!canDecide) return; this._apRet = document.activeElement; setAP({ modal: { kind: 'rechazar' }, form: {}, conflict: null }); setTimeout(() => { const el = this.apModalRef.current; if (el && el.focus) el.focus({ preventScroll: true }); }, 40); },
      total: (r.hasta ? 'Hasta ' : '') + this.money(r.total || 0), facts: [{ k: 'Folio', v: r.folio }, { k: 'Bolsa · periodo', v: (b.bolsa ? (b.bolsa.ceco || b.bolsa.id) : (r.entidad || '—')) + ' · ' + b.mes }, { k: 'Paso', v: (paso + 1) + ' de ' + ch.length + (last || !next ? ' · último' : ' · después: ' + next.label) }],
      dir: isMobile ? 'column' : 'row', bottom: isMobile ? '-40px' : '-48px', btnW: isMobile ? '100%' : 'auto', gap: isMobile ? '16px' : '12px', btnDir: isMobile ? 'column' : 'row-reverse', align: isMobile ? 'stretch' : 'center' };
    if (ceShow) Object.assign(bar, { apBg: ceOk ? '#00A7E1' : '#D0D2D3', apFg: ceOk ? '#fff' : '#777779', apCursor: ceOk ? 'pointer' : 'not-allowed', apDisabled: !ceOk, apHover: ceOk ? '#0090C2' : '#D0D2D3',
      rjDisabled: !ceOk, rjFg: ceOk ? '#F25757' : '#A9A8A9', rjBorder: ceOk ? '#F25757' : '#D0D2D3', rjCursor: ceOk ? 'pointer' : 'not-allowed', onApprove: ceOpen, onReject: ceOpen,
      hint: (() => { const f1 = this.apChain({ ...r, decisiones: [] })[0] || {}; return 'Vuelve a autorizar desde el paso 1 · ' + (f1.label || '—') + (f1.person ? ' (' + f1.person + ')' : ''); })(), facts: [{ k: 'Folio', v: r.folio }, { k: 'Estatus actual', v: stx.text }, { k: 'Cambio disponible', v: stx.text + ' → Pendiente autorización · paso 1' }] });
    const tipo = tr.isExt ? 'Viajero externo' : isComp ? 'Acompañante' : 'Colaborador';
    out.apd = { found: true, notFound: false, folio: r.folio, destino: r.dest || '—', fechas: (r.fechas || '—') + (r.nights ? ' · ' + r.nights : ''), traveler: tr.name, travelerSub: tr.sub,
      statusText: stx.text + (pendNow ? ' · paso ' + (paso + 1) + ' de ' + ch.length : ''), sbg: tone(stx.tone).bg, sborder: tone(stx.tone).border, tipo, tbg: tipo === 'Colaborador' ? '#fff' : tipo === 'Viajero externo' ? T.azul.bg : T.gris.bg, tborder: tipo === 'Colaborador' ? '#D9D8D6' : tipo === 'Viajero externo' ? T.azul.border : T.gris.border,
      eyebrow: onTurn && pendNow ? 'Solicitud por autorizar' : 'Solicitud de viaje · consulta', banners, hasBanners: banners.length > 0, budget, chain, chainNext, hasChainNext: !!chainNext, devs, devDocNote, hasDevDocNote: !!devDocNote, hasDevs: devs.length > 0, noDevs: !devs.length,
      info: this.apExcInfo(r, { ...info, general: info.general.concat([{ k: 'Forma de pago', v: info.pago }]) }), montos, hasMontos: montos.length > 0, noMontos: !montos.length, mtot: (r.hasta ? 'Hasta ' : '') + this.money(r.total || 0), hist, hasHist: hist.length > 0, bar,
      topCols: isMobile || narrow ? 'minmax(0,1fr)' : 'minmax(0,1.05fr) minmax(0,1fr)', infoCols: isMobile ? 'minmax(0,1fr)' : 'repeat(2,minmax(0,1fr))', ordMontos: isMobile ? '5' : '3', ordDev: isMobile ? '6' : '4', ordInfo: isMobile ? '4' : '5', ordHist: '7',
      docActCol: isMobile ? '0px' : 'auto', docActDisp: isMobile ? 'none' : 'inline' };
    // Modales de decisión (patrón de confirmación del Portal: antes → efecto → confirmar; Escape / Volver cierran y devuelven el foco)
    const md = ap.modal;
    if (md) { const close = () => { setAP({ modal: null }); const r0 = this._apRet; setTimeout(() => { if (r0 && document.contains(r0) && r0.focus) r0.focus({ preventScroll: true }); }, 40); };
      const f = ap.form || {}, rows = [{ k: tr.isExt ? 'Viajero externo' : isComp ? 'Acompañante' : 'Colaborador', v: tr.name }, { k: 'Viaje', v: (r.dest || '—') + ' · ' + (r.fechas || '—') }, { k: 'Paso que resuelves', v: (paso + 1) + ' de ' + ch.length + ' · ' + ((turn || {}).label || '') }];
      const whoGets = tr.isExt ? 'Quien registró al viajero externo' : 'El viajero';
      const base = { ref: this.apModalRef, close, onKey: e => { if (e.key === 'Escape') { e.preventDefault(); close(); } }, rows, opts: [], isAprobar: false, isRechazar: false, isBloqueo: false, folio: r.folio };
      if (md.kind === 'aprobar') out.apm = { ...base, isAprobar: true, title: 'Autorizar solicitud folio ' + r.folio, effLabel: last ? 'Se comprometerán' : 'Se comprometerán al completarse la cadena', effBig: this.money(r.total || 0),
        effSub: b.inScope ? 'Disponible restante en ' + b.mes + ': ' + this.money(b.rest) + ' · ' + r.entidad : r.entidad + ' · ' + b.mes, effBg: tone(b.tone).bg, effBorder: tone(b.tone).border,
        after: last ? 'La solicitud quedará Aprobada, la reserva presupuestal se registrará ligada al folio y ' + whoGets.toLowerCase() + ' recibirá el aviso.' : 'La solicitud seguirá Pendiente autorización con ' + next.label + (next.person ? ' (' + next.person + ')' : '') + ', que recibirá el aviso.',
        primary: 'Autorizar', primaryBg: '#00A7E1', onPrimary: () => this.apDecide(r.folio, 'aprobada', '', '', user, isMobile) };
      else if (md.kind === 'cambio') { const txt = f.txt || '', fromA = r.status === 'aprobada', bad = !!f.tried && !txt.trim(), neto = fromA ? this.antReservaNeta(r.folio) : 0, first = (this.apChain({ ...r, decisiones: [] })[0]) || {};
        out.apm = { ...base, rows: [rows[0], rows[1], { k: 'Cambio de estatus', v: stx.text + ' → Pendiente autorización' }, { k: 'Vuelve a autorizar', v: 'Paso 1 · ' + (first.label || '—') + (first.person ? ' (' + first.person + ')' : '') }], isAprobar: true, isRechazar: true, title: 'Cambiar estatus · folio ' + r.folio,
          effLabel: fromA ? 'Se liberarán' : 'Presupuesto', effBig: fromA ? this.money(Math.max(0, neto)) : 'Sin movimiento', effSub: (r.entidad || '—') + ' · ' + b.mes + ' · vuelve a contar como Estimado por autorizar (' + this.money(r.total || 0) + ')',
          effBg: T.gris.bg, effBorder: T.gris.border,
          txt, txtLabel: 'Motivo del cambio *', onTxt: e => setAP({ form: { ...f, txt: e.target.value.slice(0, P9.motivoMax) } }), count: txt.length + ' / ' + P9.motivoMax,
          hasErr: bad, err: 'Escribe el motivo del cambio de estatus.', txtBorder: bad ? '#F25757' : '#D0D2D3',
          after: 'La solicitud quedará Pendiente autorización y volverá a recorrer su cadena desde el paso 1; el presupuesto se revalida cuando cada autorizador decida. ' + whoGets + ' y el primer autorizador recibirán el aviso con este motivo. Las decisiones anteriores se conservan en el historial y el cambio queda en Bitácora.',
          primary: 'Regresar a Pendiente autorización', primaryBg: '#00A7E1',
          onPrimary: () => { if (!txt.trim()) { setAP({ form: { ...f, tried: true } }); return; } this.apCambiar(r.folio, md.to, txt, user, isMobile); } }; }
      else if (md.kind === 'rechazar') { const txt = f.txt || '';
        out.apm = { ...base, isRechazar: true, title: 'Rechazar solicitud folio ' + r.folio, primary: 'Rechazar', primaryBg: '#F25757',
          txt, txtLabel: 'Detalle del motivo (opcional)', onTxt: e => setAP({ form: { ...f, txt: e.target.value.slice(0, P9.motivoMax) } }), count: txt.length + ' / ' + P9.motivoMax,
          hasErr: false, err: '', txtBorder: '#D0D2D3',
          after: 'La solicitud quedará Rechazada y el proceso no continúa. ' + whoGets + ' recibirá el aviso' + (txt.trim() ? ' con este motivo.' : '.'),
          onPrimary: () => this.apDecide(r.folio, 'rechazada', '', txt, user, isMobile) }; }
      else if (md.kind === 'bloqueo') out.apm = { ...base, isBloqueo: true, title: md.error ? 'Consulta de presupuesto no disponible' : md.cambio ? 'El saldo cambió antes de confirmar' : 'Presupuesto insuficiente',
        text: md.error ? 'No fue posible validar el disponible en este momento. La solicitud no se autorizó y sigue en Por autorizar.' : (md.cambio ? 'Al revalidar en el momento de autorizar, el disponible de ' + b.mes + ' ya no alcanza para el estimado (cambió desde que se abrió la solicitud). ' : 'El disponible de ' + b.mes + ' no alcanza para el estimado. ') + (md.cambioEst ? 'El estatus no cambió: la solicitud sigue Rechazada.' : 'La solicitud no se autorizó y sigue en Por autorizar.'),
        primary: 'Entendido', primaryBg: '#00A7E1', onPrimary: close };
      out.apHasModal = !!(out.apm.isAprobar || out.apm.isRechazar || out.apm.isBloqueo); }
    return out;
  }
};
