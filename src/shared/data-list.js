// DATA LIST — the ONE shared helper for scalable lists (client rule: filtering, sorting and pagination wherever a collection can grow).
// Pure pipeline, easy to translate to an Angular service/pipe:   dataset + filter state + sort state + page state → displayed rows.
// Used by features/home (trays). Reference: docs/TABLE_LIST_STANDARD.md
import { esc } from '../config/app-config.js';
import { icon } from '../config/icons.js';

export const DEFAULT_PAGE_SIZE = 5;
export const SORTABLE_FIELDS = ['folio', 'who', 'viajero', 'destino', 'asunto', 'org', 'entrada', 'salida', 'fechas', 'perfil', 'area', 'status', 'age'];
export const FILTER_LABELS = { status: 'Estatus', org: 'Hospital / Corporativo', perfil: 'Perfil', destino: 'Destino', servicio: 'Servicio', estadoTxt: 'Estado', reglaLabel: 'Regla' };

export const emptyListState = () => ({ q: '', f: {}, sort: null, dir: 'asc', page: 1 });

// Text used for search / filter / sort of one field (status resolves to its visible text).
export function fieldText(row, field, statuses) {
  return field === 'status' ? (statuses[row.status] ? statuses[row.status].text : '') : String(row[field] ?? '');
}

// rows: the tray dataset · columns: [[header, field]] · state: { q, f:{field:value}, sort, dir, page } · pageSize
export function applyListState(rows, columns, state, statuses, pageSize = DEFAULT_PAGE_SIZE) {
  const q = state.q.trim().toLowerCase();
  let out = rows.map((r, i) => ({ ...r, _i: i }));                       // _i keeps the original (newest-first) order for «Antigüedad»
  // Search covers EVERY visible value, incl. all lines of a compound person cell and the second line of Detalle / status (row._search, built by the feature).
  if (q) out = out.filter(r => columns.some(([, f]) => fieldText(r, f, statuses).toLowerCase().includes(q)) || (r.area || '').toLowerCase().includes(q) || (r._search || '').toLowerCase().includes(q));
  for (const f of Object.keys(state.f)) if (state.f[f]) out = out.filter(r => fieldText(r, f, statuses) === state.f[f]);
  if (state.sort) {
    const dir = state.dir === 'desc' ? -1 : 1;
    out.sort((a, b) => state.sort === 'age' ? (a._i - b._i) * dir : fieldText(a, state.sort, statuses).localeCompare(fieldText(b, state.sort, statuses), 'es', { numeric: true }) * dir);
  }
  const total = out.length, pages = Math.max(1, Math.ceil(total / pageSize)), page = Math.min(state.page, pages), from = (page - 1) * pageSize;
  return { rows: out.slice(from, from + pageSize), total, page, pages, from, to: Math.min(from + pageSize, total) };
}

// Toolbar: search + contextual filters (only the ones the tray declares in tray.filters and that exist as columns) + visible range.
// data-list = tray key; the shell routes input/change events to list:search / list:filter.
export function renderListToolbar(key, title, allRows, columns, filterKeys, state, statuses, view) {
  const filters = (filterKeys || []).filter(f => columns.some(([, c]) => c === f) || allRows.some(r => r[f] != null)).map(f => {
    const options = [...new Set(allRows.map(r => fieldText(r, f, statuses)))].sort();
    return `<label class="list-filter"><span>${FILTER_LABELS[f] || f}</span>
      <select data-action="list:filter" data-list="${key}" data-field="${f}" aria-label="Filtrar por ${FILTER_LABELS[f] || f}">
        <option value="">Todos</option>${options.map(o => `<option value="${esc(o)}"${state.f[f] === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}
      </select></label>`;
  }).join('');
  return `
<div class="list-toolbar">
  <label class="list-search">${icon('search', 16)}<input type="search" data-action="list:search" data-list="${key}" value="${esc(state.q)}" placeholder="Buscar en la lista" aria-label="Buscar en ${esc(title)}"></label>
  ${filters}
  <span class="list-toolbar__spacer"></span>
  <span class="list-range">${view.total ? `${view.from + 1}–${view.to} de ${view.total}` : '0 de 0'}</span>
</div>`;
}

// Sortable column header (aria-sort + arrow). Non-sortable fields render a plain header.
export function renderSortHeader(key, header, field, state) {
  if (!SORTABLE_FIELDS.includes(field)) return `<div class="ttable__h" role="columnheader">${esc(header)}</div>`;
  const active = state.sort === field, arrow = active ? (state.dir === 'desc' ? '↓' : '↑') : '↕';
  return `<div class="ttable__h" role="columnheader" aria-sort="${active ? (state.dir === 'desc' ? 'descending' : 'ascending') : 'none'}">
    <button class="ttable__sort${active ? ' is-active' : ''}" data-action="list:sort" data-list="${key}" data-field="${field}" title="Ordenar por ${esc(header)}"><span>${esc(header)}</span><span aria-hidden="true">${arrow}</span></button></div>`;
}

// Pager: «Página x de y» + previous / next (disabled at the edges).
export function renderPager(key, view) {
  return `
<div class="list-pager">
  <span>Página ${view.page} de ${view.pages}</span>
  <button class="list-pager__btn" data-action="list:page" data-list="${key}" data-dir="-1" aria-label="Página anterior"${view.page <= 1 ? ' disabled' : ''}>${icon('chevronLeft', 16)}</button>
  <button class="list-pager__btn" data-action="list:page" data-list="${key}" data-dir="1" aria-label="Página siguiente"${view.page >= view.pages ? ' disabled' : ''}>${icon('chevronRight', 16)}</button>
</div>`;
}

// State reducers used by the shell actions (portal-layout.js)
export function listReducer(state, action, payload) {
  const st = state || emptyListState();
  if (action === 'list:search') return { ...st, q: payload.value, page: 1 };
  if (action === 'list:filter') return { ...st, f: { ...st.f, [payload.field]: payload.value }, page: 1 };
  if (action === 'list:sort') return { ...st, sort: payload.field, dir: st.sort === payload.field && st.dir === 'asc' ? 'desc' : 'asc', page: 1 };
  if (action === 'list:page') return { ...st, page: Math.max(1, st.page + Number(payload.dir)) };
  return st;
}
