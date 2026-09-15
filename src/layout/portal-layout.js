// PORTAL LAYOUT — the application shell. Anatomy: Encabezado → Menú → Título → Barra de mensajes → Área de trabajo.
// Owns the shell state and renders: header, account menu, notifications panel, sidebar/drawer (navigation.js),
// the message bar and the work area (Home or a shell state). Plain string templates; one render() per state change.
// Angular: LayoutComponent + HeaderComponent + AccountMenuComponent + NotificationsComponent (+ a small StateService).
import { icon, TONE_ICON } from '../config/icons.js';
import { LOGO_SRC, esc, avatar, viewportMode } from '../config/app-config.js';
import { resolveNavigation, findItem, canSee, isTraveler, renderSidebar, renderDrawer } from './navigation.js';
import { renderHome } from '../features/home/home.js';
import { listReducer } from '../shared/data-list.js';
import { renderDemoBar, renderDemoTag, loadDemoUserId, saveDemoUserId, DEMO_LOADING_MS } from '../demo/demo.js'; // DEMO ONLY

// ---------- shared fragments (used by features too) ----------
export function statusChip(status) {                       // color + icon + text, never color only
  return `<span class="status status--${status.tone}">${icon(status.icon, 16)}<span>${esc(status.text)}</span></span>`;
}
export function messageBar(tone, text) {                    // the single, state-switching bar under the title
  return `<div class="msgbar msgbar--${tone}" role="status">${icon(TONE_ICON[tone] || 'info', 22, { cls: `tone-${tone}` })}<span>${esc(text)}</span></div>`;
}

// ---------- header ----------
function renderHeader({ user, mode, loading, deadline, unread, bellOpen, accountOpen }) {
  const mobile = mode === 'mobile';
  return `
<header class="header">
  ${mobile ? `<button class="icon-btn header__hamburger" data-action="drawer:open" aria-label="Abrir menú">${icon('menu', 24)}</button>` : ''}
  <button class="brand" data-action="go" data-route="inicio" aria-label="Ir al inicio">
    <img class="brand__logo" src="${LOGO_SRC}" alt="Star Médica">${mobile ? '' : '<span class="brand__portal">Portal de Viáticos</span>'}
  </button>
  <div class="header__spacer"></div>
  ${deadline && !loading ? `<button class="deadline" data-action="go" data-route="${deadline.target}" title="Ir al folio">${icon('clock', 18, { color: '#B37D00' })}${mobile ? '' : `<span class="deadline__text">${esc(deadline.text)}</span>`}</button>` : ''}
  <div style="position:relative"><button class="icon-btn${bellOpen ? ' is-open' : ''}" data-action="bell:toggle" aria-label="Avisos">${icon('bell', 22)}${unread > 0 ? `<span class="badge">${unread}</span>` : ''}</button></div>
  ${loading
    ? `<div class="hskel"><div class="hskel__avatar"></div>${mobile ? '' : '<div class="hskel__lines"><div class="hskel__l1"></div><div class="hskel__l2"></div></div>'}</div>`
    : `<div style="position:relative;min-width:0">
    <button class="account-btn${accountOpen ? ' is-open' : ''}" data-action="account:toggle" aria-haspopup="menu" aria-expanded="${accountOpen}" aria-label="Cuenta">
      ${avatar(user)}
      ${mobile ? '' : `<span class="account-btn__id"><span class="account-btn__name">${esc(user.name)}</span><span class="account-btn__role">${esc(user.roleLabel)}</span></span>`}
      ${icon('chevronDown', 16, { color: '#777779', cls: 'account-btn__chevron' })}
    </button></div>`}
</header>`;
}

// ---------- account menu: complementary account fields → «Cerrar sesión» ----------
// Client rule (identity redundancy): the HEADER is the identity area (photo · name · role). The dropdown must NOT repeat them;
// it starts directly with Número de colaborador · Dirección · Hospital (only when user.hospital exists: hospital-based users) · Puesto · Perfil (readable label, never internal level codes).
function renderAccountMenu(user) {
  const rows = [['Número de colaborador', user.employeeNumber], ['Dirección', user.direccion]];
  if (user.hospital) rows.push(['Hospital', user.hospital]);
  rows.push(['Puesto', user.puesto]);
  if (isTraveler(user) && user.perfil) rows.push(['Perfil', user.perfil.label]);
  return `
<div class="panel panel--account" role="menu" data-stop>
  <dl class="account__fields">${rows.map(([k, v]) => `<div class="account__field"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <div class="account__sep"></div>
  <button class="account__item" role="menuitem" data-action="go" data-route="cerrar">${icon('logOut', 18)}Cerrar sesión</button>
</div>`;
}

// ---------- notifications panel ----------
function renderNotifications(notices, unread) {
  const list = notices.length ? `<div class="notices__list">${notices.map(n => `
    <button class="notice${n.unread ? ' is-unread' : ''}" data-action="notice:open" data-id="${n.id}" data-route="${n.target}">
      ${icon(TONE_ICON[n.tone] || 'info', 20, { cls: `tone-${n.tone}` })}
      <span style="display:block"><span class="notice__text">${esc(n.text)}</span>
      <span class="notice__foot"><span>Notificado: ${esc(n.notifiedAt)}</span><span class="notice__go">Ir a ${esc(n.targetLabel)} ›</span></span></span>
    </button>`).join('')}</div>`
    : `<div class="notices__empty">${icon('bell', 32, { color: '#A9A8A9', stroke: 1.5 })}<div class="notices__empty-title">Sin avisos nuevos</div><div class="notices__empty-text">Aquí aparecerán los pasos que requieran tu atención.</div></div>`;
  return `
<div class="panel panel--notices" data-stop>
  <div class="notices__head"><span class="notices__title">Avisos</span><span class="notices__meta">${unread ? `${unread} sin leer` : 'Todo leído'}</span></div>
  ${list}
</div>`;
}

// ---------- shell states ----------
const skeleton = () => `<div class="mskel"><div class="mskel__title"></div><div class="mskel__bar"></div><div class="mskel__grid"><div></div><div></div><div></div></div><div class="mskel__block"></div><div class="mskel__foot">${icon('spinner', 18)}Cargando el portal…</div></div>`;
const deniedState = (roleLabel) => `<section class="card state">${icon('lock', 40, { stroke: 1.5 })}<h2 class="state__title">Esta sección no está disponible para tu rol</h2><p class="state__text">Rol activo: <strong>${esc(roleLabel)}</strong>. Los permisos los administra Admin / Seguridad TI.</p><p class="state__text state__text--last">Si necesitas este acceso, solicítalo a través de tu área.</p><button class="btn" data-action="go" data-route="inicio">Volver al inicio</button></section>`;
const notBuiltState = (title, us) => `<section class="card state state--dashed">${icon('wrench', 40, { stroke: 1.5 })}<h2 class="state__title">${esc(title)} se diseña en ${esc(us)}</h2><p class="state__text state__text--last">El prototipo aún no incluye esta pantalla. El menú y la ruta ya son los definitivos.</p><div class="state__actions"><button class="btn btn--secondary" data-action="go" data-route="inicio">Volver al inicio</button></div></section>`;
const closedState = () => `<section class="card state"><h2 class="state__title state__title--first">Sesión cerrada</h2><p class="state__text state__text--last">En el portal real, esta acción regresa al acceso de Star Médica. En el prototipo puedes volver al inicio o cambiar de usuario en el modo demo.</p><button class="btn" data-action="go" data-route="inicio">Volver al inicio</button></section>`;

// ---------- shell ----------
export function mountPortal(root, data) {
  const { users, navigation, statuses, home, notifications } = data;
  const state = {
    userId: loadDemoUserId(users.users, users.defaultUserId),   // DEMO ONLY (production: session user)
    route: 'inicio', loading: true, collapsed: false,
    bellOpen: false, accountOpen: false, drawerOpen: false,
    read: {},                                                    // notice ids read in this session
    lists: {},                                                   // per-tray list state { q, f, sort, dir, page } (src/shared/data-list.js), key = userId:trayIndex
    mode: viewportMode(root.clientWidth || 1200)
  };
  const set = (patch) => { Object.assign(state, patch); render(); };
  const currentUser = () => users.users.find(u => u.id === state.userId) || users.users[0];
  let loadTimer;
  const startLoading = () => { clearTimeout(loadTimer); set({ loading: true }); loadTimer = setTimeout(() => set({ loading: false }), DEMO_LOADING_MS); };

  const actions = {
    go: (el) => {
      const route = el.dataset.route, item = findItem(navigation, route);
      const allowed = ['inicio', 'cerrar', 'denied'].includes(route) || (item && canSee(item, currentUser(), navigation.profileRules));
      set({ route: allowed ? route : 'denied', bellOpen: false, accountOpen: false, drawerOpen: false });
    },
    'bell:toggle':    () => set({ bellOpen: !state.bellOpen, accountOpen: false }),
    'account:toggle': () => set({ accountOpen: !state.accountOpen, bellOpen: false }),
    'sidebar:toggle': () => set({ collapsed: !state.collapsed }),
    'drawer:open':    () => set({ drawerOpen: true }),
    'drawer:close':   () => set({ drawerOpen: false }),
    'notice:open':    (el) => { state.read[el.dataset.id] = true; actions.go(el); },
    // scalable lists: search / filter / sort / page (client rule) — one reducer, state per tray
    'list:search':    (el) => { state.lists[el.dataset.list] = listReducer(state.lists[el.dataset.list], 'list:search', { value: el.value }); renderKeepingFocus(el); },
    'list:filter':    (el) => set({ lists: { ...state.lists, [el.dataset.list]: listReducer(state.lists[el.dataset.list], 'list:filter', { field: el.dataset.field, value: el.value }) } }),
    'list:sort':      (el) => set({ lists: { ...state.lists, [el.dataset.list]: listReducer(state.lists[el.dataset.list], 'list:sort', { field: el.dataset.field }) } }),
    'list:page':      (el) => set({ lists: { ...state.lists, [el.dataset.list]: listReducer(state.lists[el.dataset.list], 'list:page', { dir: el.dataset.dir }) } }),
    'demo:user':      (el) => { saveDemoUserId(el.value); set({ userId: el.value, route: 'inicio', bellOpen: false, accountOpen: false, drawerOpen: false, read: {}, lists: {} }); startLoading(); } // DEMO ONLY
  };
  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el && el.tagName !== 'SELECT') return actions[el.dataset.action]?.(el);
    if ((state.bellOpen || state.accountOpen) && !e.target.closest('[data-stop]')) set({ bellOpen: false, accountOpen: false }); // click outside closes panels
  });
  root.addEventListener('change', (e) => { const el = e.target.closest('[data-action]'); if (el && el.dataset.action !== 'list:search') actions[el.dataset.action]?.(el); });
  root.addEventListener('input', (e) => { const el = e.target.closest('[data-action="list:search"]'); if (el) actions['list:search'](el); });
  // re-render while typing in a search box without losing the caret (plain-string templates rebuild the DOM)
  function renderKeepingFocus(input) { const key = input.dataset.list, pos = input.selectionStart; render(); const again = root.querySelector(`[data-action="list:search"][data-list="${key}"]`); if (again) { again.focus(); again.setSelectionRange(pos, pos); } }
  new ResizeObserver(es => { const m = viewportMode(es[0].contentRect.width); if (m !== state.mode) requestAnimationFrame(() => set({ mode: m, drawerOpen: m === 'mobile' && state.drawerOpen })); }).observe(root);

  function render() {
    const user = currentUser(), mobile = state.mode === 'mobile', collapsed = !mobile && state.collapsed;
    const groups = resolveNavigation(navigation, user, notifications.counters[user.id] || {}, state.route);
    const item = findItem(navigation, state.route);
    const notices = (notifications.notices[user.id] || []).map(n => ({ ...n, unread: n.unread && !state.read[n.id], targetLabel: findItem(navigation, n.target)?.label || 'la sección' }));
    const unread = notices.filter(n => n.unread).length;
    const userHome = home.homes[user.id];

    const isHome = state.route === 'inicio', isDenied = state.route === 'denied', isClosed = state.route === 'cerrar', isNotBuilt = !isHome && !isDenied && !isClosed;
    const title = isHome ? 'Inicio' : isDenied ? 'Sección sin permiso' : isClosed ? 'Cerrar' : (item ? item.label : 'Sección');
    const crumbs = isNotBuilt && item ? [item.group, item.label].filter(Boolean) : isDenied ? ['Sin permiso'] : [];
    const bar = isHome ? (userHome.alert ? messageBar(userHome.alert.tone, userHome.alert.text) : messageBar('info', userHome.help))
      : isDenied ? messageBar('rojo', 'No es posible abrir esta sección: tu rol no tiene permiso. Vuelve al inicio o solicita el acceso a Admin / Seguridad TI.')
      : isClosed ? messageBar('info', 'La sesión se cerró correctamente (simulación).')
      : messageBar('amarillo', `Esta pantalla se diseña en la historia ${item ? item.us : ''}. Todavía no está disponible en el prototipo; el acceso desde el menú ya es el definitivo.`);

    const work = state.loading ? skeleton() : `
      ${crumbs.length ? `<nav class="crumbs" aria-label="Ruta"><button class="crumbs__home" data-action="go" data-route="inicio">Inicio</button>${crumbs.map(c => `<span>›</span><span>${esc(c)}</span>`).join('')}</nav>` : ''}
      <div class="title-row"><h1 class="title">${esc(title)}</h1>${isHome && !mobile ? '<span class="title-row__meta">Actualizado hoy · 10:42</span>' : ''}</div>
      ${bar}
      ${isDenied ? deniedState(user.roleLabel) : isNotBuilt ? notBuiltState(title, item ? item.us : '') : isClosed ? closedState() : renderHome(userHome, user, statuses.statuses, state.mode, state.lists)}`;

    root.className = `shell${mobile ? ' is-mobile is-narrow' : state.mode === 'narrow' ? ' is-narrow' : ''}`;
    root.innerHTML = `
      ${renderDemoBar(users.users, user)}
      <div class="header-wrap">
        ${renderHeader({ user, mode: state.mode, loading: state.loading, deadline: notifications.deadlines[user.id], unread, bellOpen: state.bellOpen, accountOpen: state.accountOpen })}
        ${state.bellOpen ? renderNotifications(notices, unread) : ''}
        ${state.accountOpen && !state.loading ? renderAccountMenu(user) : ''}
      </div>
      <div class="body">
        ${mobile ? '' : renderSidebar(groups, { collapsed, loading: state.loading })}
        <main class="main">${work}</main>
      </div>
      ${state.drawerOpen && mobile ? renderDrawer(groups, user) : ''}
      ${renderDemoTag()}`;                                          // DEMO ONLY
  }
  render();
  startLoading();                                                    // DEMO ONLY (simulated load)
}
