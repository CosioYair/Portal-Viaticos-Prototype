// ADMINISTRACIÓN › PERFILES DE VIAJERO — Perfiles · Tarifas · Excepciones (US-03, APPROVED · CLOSED).
// Read views + simulator against src/data/traveler-profiles.json; business rules in ./rules.js (shared resolver).
// The approved editors (perfil · tarifa · taxi · tintorería · antelación · excepción), their confirmation summaries,
// the shared success modal and the audit events are specified in the US-03 PDF and live, interactive, in
// prototype/Portal Viaticos.dc.html (pvModal / pvAsk / pvSave*). Validations used by those editors: rules.js › validate*.
// Angular: TravelerProfileAdminModule → ProfilesTab · TariffsTab (TariffMatrix · GlobalRules · CostSimulator) · ExceptionsTab.
import { esc } from '../../config/app-config.js';
import { icon } from '../../config/icons.js';
import { applyListState, renderListToolbar, renderSortHeader, renderPager, emptyListState } from '../../shared/data-list.js';
import { helpTip } from '../home/home.js';
import { vigText, tempStatus, profileState, tariff, money, fmtRule, simulate } from './rules.js';

export const TABS = [['perfiles', 'Perfiles'], ['tarifas', 'Tarifas'], ['excepciones', 'Excepciones'], ['colaboradores', 'Colaboradores']];
const EXT = 'Viajero externo';
const STATE_TONE = { Vigente: 'verde', Futura: 'azul', Vencida: 'gris', Programado: 'azul', Vencido: 'gris', Revocado: 'rojo' };
const chip = s => `<span class="tp-chip tp-chip--${STATE_TONE[s] || 'gris'}">${esc(s)}</span>`;

export const TAB_HELP = {
  perfiles: 'Aquí se mantiene el catálogo de perfiles de viajero: rubros, límites, vigencia y documento que respalda cada cambio.',
  tarifas: 'Aquí se mantienen los importes máximos por concepto y perfil, cada uno con su base de cálculo y su vigencia. Las celdas sin tarifa vigente se señalan: sin ellas el estimado no puede completarse.',
  excepciones: 'Aquí se registran las excepciones individuales. Una excepción sustituye una regla del perfil solo durante su vigencia, siempre con motivo y documento.'
};

// st = { tab, sim:{perfil,dias,noches,comidas,hospId} } · lists = shared list state · mode = desktop | narrow | mobile · ctx = { people, profileOfUser, withoutProfile }
export function renderTravelerProfileAdmin(model, st, lists, mode, ctx) {
  const tab = st.tab || 'perfiles';
  const tabs = `<div class="tp-tabs" role="tablist" aria-label="Secciones de perfil del viajero">${TABS.map(([id, l]) =>
    `<button role="tab" class="tp-tab${tab === id ? ' is-on' : ''}" aria-selected="${tab === id}" data-action="tp:tab" data-tab="${id}">${l}</button>`).join('')}</div>`;
  const body = tab === 'tarifas' ? tariffsTab(model, st, mode) : tab === 'excepciones' ? exceptionsTab(model, lists, mode, ctx)
    : tab === 'colaboradores' ? `<section class="card state">${icon('users', 32, { stroke: 1.5 })}<p class="state__text">La consulta y asignación de perfil por colaborador se presenta en la ficha del viajero.</p></section>`
    : profilesTab(model, lists, mode, ctx);
  return `${tabs}${body}`;
}

// ---------- Perfiles ----------
function profilesTab(model, lists, mode, ctx) {
  const today = model.today;
  const rows = model.profiles.map(p => ({ ...p, estadoTxt: profileState(p, today), vig: vigText(p.from, p.to, true),
    limites: `${p.semanasMes} semanas/mes · ${p.nochesSemana} noches/semana · ${p.diasMax} días máx.`,
    hosp: `${p.hospedaje} · ${(p.habitacion || []).join(' · ')}`, meals: (p.alimentos || []).join(' · '),
    ant: p.anticipo === 'No' ? 'No' : p.perfil === 'Director' ? 'Sí (no aplica para grupo de personal E o ED)' : 'Sí',
    repr: p.representacion || 'No' }))
    .concat([{ id: 'pf-ext', perfil: EXT, estadoTxt: 'Vigente', vig: 'Según la matriz de tarifas', limites: 'Flujo de viajeros externos', hosp: 'Tarifas de la categoría', meals: '«Sin tarifa» donde no esté configurada', ant: '—', repr: 'No', colaboradores: '—', ext: true }]);
  const cols = [['Perfil', 'perfil'], ['Vigencia', 'vig'], ['Estado', 'estadoTxt'], ['Límites', 'limites'], ['Anticipo', 'ant'], ['Hospedaje y habitación', 'hosp'], ['Gastos de representación', 'repr'], ['Colaboradores', 'colaboradores']];
  const key = 'tp:perfiles', ls = lists[key] || emptyListState(), view = applyListState(rows, cols, ls, {}, 8);
  const alert = ctx.withoutProfile > 0 ? `<div class="msgbar msgbar--amarillo" role="alert">${icon('warning', 22)}<span>${ctx.withoutProfile} colaborador${ctx.withoutProfile === 1 ? '' : 'es'} activo${ctx.withoutProfile === 1 ? '' : 's'} sin perfil asignado: no puede${ctx.withoutProfile === 1 ? '' : 'n'} crear solicitudes de viaje</span></div>` : '';
  const narrow = mode !== 'desktop';
  const list = narrow
    ? view.rows.map(r => `<div class="tp-cardrow"><div class="tp-cardrow__head"><b>${esc(r.perfil)}</b>${chip(r.estadoTxt)}</div><div>${esc(r.vig)}</div>
        <div><span class="tp-k">Límites:</span> ${esc(r.limites)}</div><div><span class="tp-k">Anticipo:</span> ${esc(r.ant)}</div><div><span class="tp-k">Hospedaje y habitación:</span> ${esc(r.hosp)}</div>
        <div><span class="tp-k">Gastos de representación:</span> ${esc(r.repr)}</div><div><span class="tp-k">Colaboradores:</span> ${esc(r.colaboradores)}</div></div>`).join('')
    : `<div class="ttable tp-grid tp-grid--perfiles" role="table"><div class="ttable__row ttable__row--head" role="row">${cols.map(([h, f]) => renderSortHeader(key, h, f, ls)).join('')}</div>
      ${view.rows.map(r => `<div class="ttable__row" role="row"><div role="cell"><b>${esc(r.perfil)}</b>${r.estadoTxt === 'Futura' ? `<div class="tp-sub">Entra en vigor el ${esc(r.from)}</div>` : ''}</div>
        <div role="cell">${esc(r.vig)}</div><div role="cell">${chip(r.estadoTxt)}</div><div role="cell">${esc(r.limites)}${r.ext ? '' : `<div class="tp-sub">${esc((r.diasComprobar ?? model.global.diasComprobar.dias) + ' días hábiles para comprobar')}</div>`}</div>
        <div role="cell">${esc(r.ant)}</div><div role="cell">${esc(r.hosp)}<div class="tp-sub">${esc(r.meals)}</div></div><div role="cell">${esc(r.repr)}</div><div role="cell">${esc(r.colaboradores)}</div></div>`).join('')}</div>`;
  return `${alert}<section class="card tp-card"><header class="tp-card__head">${icon('user', 18)}<h2>Perfiles de viajero</h2><span class="tp-count">${rows.length}</span></header>
    ${renderListToolbar(key, 'Perfiles de viajero', rows, cols, ['estadoTxt'], ls, {}, view)}${list}${renderPager(key, view)}</section>`;
}

// ---------- Tarifas ----------
function tariffsTab(model, st, mode) {
  const perfiles = model.profiles.filter(p => profileState(p, model.today) === 'Vigente').map(p => p.perfil).concat([EXT]);
  const missing = [];
  const cell = (c, pf) => {
    if (c.soloCapacidad && pf !== 'Director') return { cls: 'is-na', main: 'No aplica', sub: 'Perfil sin ' + c.label.toLowerCase(), vig: '' };
    const t = tariff(model, c.id, pf);
    if (!t) { missing.push(c.label + ' · ' + pf); return { cls: 'is-missing', main: 'Sin tarifa', sub: 'Definir tarifa vigente', vig: '' }; }
    return { cls: '', main: c.tiers ? `${money(t.importe)} · 3 comidas` : `${money(t.importe)} ${c.unidad}`, sub: c.tiers ? `1 comida ${money(t.tiers[0])} · 2 comidas ${money(t.tiers[1])}` : '', vig: 'Vigencia: ' + vigText(t.from, t.to) };
  };
  const rows = model.concepts.map(c => ({ c, cells: perfiles.map(pf => cell(c, pf)) }));
  const warn = missing.length ? `<div class="msgbar msgbar--rojo" role="alert">${icon('warning', 22)}<span>Sin tarifa vigente: ${esc(missing.join(' · '))}. Los conceptos que se calculan por duración del viaje (hospedaje y alimentos) no pueden estimarse sin su tarifa; en los demás, el perfil queda sin importe máximo autorizado.</span></div>` : '';
  const head = c => `<div class="tp-concept"><b>${esc(c.label)}</b><div class="tp-sub">${esc(c.tiers ? 'tope diario por número de comidas' : c.unidad)}</div>${c.fuente !== 'confirmada' ? '<div class="tp-prov">Importe provisional</div>' : ''}</div>`;
  const cellHtml = x => `<div class="tp-cell ${x.cls}"><div>${esc(x.main)}</div>${x.sub ? `<div class="tp-sub">${esc(x.sub)}</div>` : ''}${x.vig ? `<div class="tp-sub">${esc(x.vig)}</div>` : ''}</div>`;
  const matrix = mode === 'desktop'
    ? `<div class="tp-matrix"><div class="tp-matrix__grid" role="table" style="grid-template-columns:minmax(180px,1.2fr) repeat(${perfiles.length},minmax(140px,1fr))">
        <div class="tp-h tp-sticky" role="columnheader">Concepto</div>${perfiles.map(p => `<div class="tp-h" role="columnheader">${esc(p)}</div>`).join('')}
        ${rows.map(r => `<div class="tp-sticky" role="rowheader">${head(r.c)}</div>${r.cells.map(cellHtml).join('')}`).join('')}</div></div>`
    : rows.map(r => `<div class="tp-stack">${head(r.c)}${r.cells.map((x, i) => `<div class="tp-stack__item ${x.cls}"><span>${esc(perfiles[i])}</span><b>${esc(x.cls === 'is-missing' ? 'Sin tarifa vigente' : x.main)}</b>${x.sub ? `<small>${esc(x.sub)}</small>` : ''}${x.vig ? `<small class="tp-muted">${esc(x.vig)}</small>` : ''}</div>`).join('')}</div>`).join('');
  const taxiRows = Object.keys(model.taxi.porHospital).map(id => ({ k: `${id} · ${model.taxi.hospitalNames[id] || id}`, v: model.taxi.porHospital[id] })).concat([{ k: model.taxi.otrosLabel, v: model.taxi.otros }]);
  const tint = model.global.tintoreria, ant = model.global.antelacion;
  const sim = st.sim || { perfil: 'Mando medio', dias: 4, noches: 3, comidas: 3, hospId: '' };
  const r = simulate(model, sim);
  const pfOpts = perfiles.filter(p => p !== EXT);
  return `<section class="card tp-card"><header class="tp-card__head"><div><h2>Tarifas máximas por concepto y perfil</h2>
      <p class="tp-sub">Cada importe tiene su propia vigencia y su base de cálculo · Alimentos: tope diario acumulado según el número de comidas (1 · 2 · 3) · el titular del rol DGA viaja con perfil Director</p></div></header>
    ${warn}${matrix}
    <div class="tp-globals">
      <div><h3>Taxi · tarifa semanal por hospital destino</h3><p class="tp-sub">Aplica en la comprobación de gastos (no es medio de la solicitud de viaje) · misma tarifa para todos los perfiles y para el viajero externo</p>
        ${taxiRows.map(t => `<div class="tp-box"><div>${esc(t.k)}</div><b>${money(t.v)} ${esc(model.taxi.unidad)}</b><div class="tp-sub">Impuesto ${esc(model.taxi.impuesto.toLowerCase())} · Vigencia: ${esc(vigText(model.taxi.from, model.taxi.to))}</div></div>`).join('')}</div>
      <div><h3>Tintorería · regla global</h3><div class="tp-box"><b>${money(tint.importe)} ${esc(tint.unidad)}</b><div>A partir del ${tint.desdeDia}.º día del viaje · Impuesto ${esc(String(tint.impuesto).toLowerCase())} · Todos los perfiles y el viajero externo</div><div class="tp-sub">Vigencia: ${esc(vigText(tint.from, tint.to))}</div></div></div>
      <div><h3>Antelación mínima para solicitar · parámetro global</h3><div class="tp-box"><b>${ant.dias} días</b><div>Se aplica a la fecha de inicio del primer destino · Todos los perfiles · Una excepción individual vigente lo sustituye para un colaborador</div></div></div>
    </div>
    <div class="tp-sim"><h3>Simulador de costo estimado</h3>
      <div class="tp-sim__fields">
        <label>Perfil<select data-action="tp:sim" data-field="perfil">${pfOpts.map(p => `<option${p === sim.perfil ? ' selected' : ''}>${esc(p)}</option>`).join('')}</select></label>
        <label>Días de viaje<input inputmode="numeric" data-action="tp:sim" data-field="dias" value="${sim.dias}"><small>Solo el número de días</small></label>
        <label>Noches de hospedaje<input inputmode="numeric" data-action="tp:sim" data-field="noches" value="${sim.noches}"><small>Solo el número de noches</small></label>
        <label>Comidas externas por día<select data-action="tp:sim" data-field="comidas">${[0, 1, 2, 3].map(n => `<option${n === sim.comidas ? ' selected' : ''}>${n}</option>`).join('')}</select><small>Las que no proporciona el hospital</small></label>
        <label>Destino<select data-action="tp:sim" data-field="hospId"><option value="">${esc(model.taxi.otrosLabel)}</option>${Object.keys(model.taxi.hospitalNames).map(id => `<option value="${id}"${id === sim.hospId ? ' selected' : ''}>${esc(model.taxi.hospitalNames[id])}</option>`).join('')}</select></label>
      </div>
      <div class="tp-sim__result"><div>Viaje de ${sim.dias} días con ${sim.noches} noches · perfil ${esc(sim.perfil)}</div>
        ${r.lines.map(l => `<div class="tp-line"><span>${esc(l.k)}</span><span>${esc(l.v)}</span></div>`).join('')}
        ${r.missing.length ? `<div class="tp-err">Sin tarifa vigente de ${esc(r.missing.join(' y '))} para este perfil: el estimado queda incompleto.</div>` : ''}
        <div class="tp-line tp-line--total"><span>Costo estimado calculable</span><b>${money(r.total)}</b></div>
        <p class="tp-sub">Hospedaje se calcula por noche y alimentos por día con el tope del número de comidas externas (los tramos no se suman). Vuelos, gasolina y casetas dependen del medio de transporte de cada solicitud. El anticipo es el monto máximo autorizado, no un gasto adicional.</p></div>
    </div></section>`;
}

// ---------- Excepciones ----------
function exceptionsTab(model, lists, mode, ctx) {
  const rows = model.exceptions.map(e => { const p = ctx.people[e.userId] || {}; const rule = model.exceptionRules.find(r => r.id === e.regla) || {};
    return { ...e, colaborador: p.name || e.userId, _search: `${p.employeeNumber || ''} ${e.motivo}`, sub: `No. ${p.employeeNumber || '—'} · ${p.puesto || ''}`,
      reglaLabel: rule.label || e.regla, perfil: ctx.profileOfUser(e.userId) || 'sin perfil', politicaTxt: fmtRule(model, e.regla, e.politica), valorTxt: fmtRule(model, e.regla, e.valor),
      vig: vigText(e.from, e.to, true), estadoTxt: tempStatus(e, model.today) }; });
  const cols = [['Colaborador', 'colaborador'], ['Regla afectada', 'reglaLabel'], ['Valor de política', 'politicaTxt'], ['Valor excepcional', 'valorTxt'], ['Vigencia', 'vig'], ['Estado', 'estadoTxt']];
  const key = 'tp:excepciones', ls = lists[key] || emptyListState(), view = applyListState(rows, cols, ls, {}, 6);
  const list = mode !== 'desktop'
    ? view.rows.map(r => `<div class="tp-cardrow"><div class="tp-cardrow__head"><b>${esc(r.colaborador)}</b>${chip(r.estadoTxt)}</div><div class="tp-sub">${esc(r.sub)}</div>
        <div><span class="tp-k">Regla:</span> ${esc(r.reglaLabel)}</div><div><span class="tp-k">Política → excepción:</span> ${esc(r.politicaTxt)} → ${esc(r.valorTxt)}</div><div>${esc(r.vig)}</div></div>`).join('')
    : `<div class="ttable tp-grid tp-grid--exc" role="table"><div class="ttable__row ttable__row--head" role="row">${cols.map(([h, f]) => renderSortHeader(key, h, f, ls)).join('')}</div>
      ${view.rows.map(r => `<div class="ttable__row" role="row"><div role="cell"><b>${esc(r.colaborador)}</b><div class="tp-sub">${esc(r.sub)}</div></div><div role="cell">${esc(r.reglaLabel)}<div class="tp-sub">Perfil ${esc(r.perfil)}</div></div>
        <div role="cell">${esc(r.politicaTxt)}</div><div role="cell">${esc(r.valorTxt)}</div><div role="cell">${esc(r.vig)}</div><div role="cell">${chip(r.estadoTxt)}</div></div>`).join('')}</div>`;
  return `<section class="card tp-card"><header class="tp-card__head">${icon('fileText', 18)}<h2>Excepciones individuales</h2><span class="tp-count">${rows.length}</span></header>
    ${renderListToolbar(key, 'Excepciones individuales', rows, cols, ['estadoTxt', 'reglaLabel'], ls, {}, view)}${list}${renderPager(key, view)}</section>`;
}

export { helpTip };
