// NAVIGATION — (1) permission resolution and (2) rendering of the desktop sidebar and the mobile drawer.
// Angular: SidebarComponent + MobileDrawerComponent + a NavigationService holding resolveNavigation().
import { icon } from '../config/icons.js';
import { esc, initials } from '../config/app-config.js';

// ---------- 1. PERMISSION RESOLUTION (the only place) ----------
// active user + role + traveler capability + traveler profile + configured permissions → visible navigation.
//   ✓     visible by default
//   V     requires traveler capability (user.traveler; Colaborador is always a traveler)
//   V+PF  requires traveler capability AND the profile flag in navigation.profileRules (e.g. perfil.anticipo)
//   L     visible, read-only → «Lectura» tag
//   P     requires a manually configured permission (user.permissions includes the item id); hidden otherwise
//   —     (role missing in item.visibility) not visible
export function isTraveler(user) { return user.role === 'COL' || !!user.traveler; }

export function canSee(item, user, profileRules) {
  const rule = item.visibility[user.role];
  if (rule === '✓' || rule === 'L') return true;
  if (rule === 'V') return isTraveler(user);
  if (rule === 'V+PF') return isTraveler(user) && !!(user.perfil && user.perfil[profileRules[item.id]]);
  if (rule === 'P') return (user.permissions || []).includes(item.id);
  return false;
}

// Returns the groups (catalog order) with only the items this user can see, plus readOnly / count / active flags.
export function resolveNavigation(navigation, user, counters, activeRoute) {
  return navigation.groups
    .map(g => ({
      group: g.group,
      items: g.items.filter(it => canSee(it, user, navigation.profileRules)).map(it => ({
        ...it, readOnly: it.visibility[user.role] === 'L', count: counters[it.id] || 0, active: it.id === activeRoute
      }))
    }))
    .filter(g => g.items.length);
}

export function findItem(navigation, id) {
  for (const g of navigation.groups) for (const it of g.items) if (it.id === id) return { ...it, group: g.group };
  return null;
}

// ---------- 2. RENDERING ----------
function navItem(it, cls, collapsed) {
  return `
<button class="${cls}${it.active ? ' is-active' : ''}" data-action="go" data-route="${it.id}" data-tip="${esc(it.label)}"${it.active ? ' aria-current="page"' : ''}>
  ${icon(it.icon, 20)}
  ${collapsed ? '' : `<span class="nav-item__label">${esc(it.label)}</span>${it.readOnly ? '<span class="nav-item__ro">Lectura</span>' : ''}`}
  ${it.count > 0 ? `<span class="nav-item__count">${it.count}</span>` : ''}
</button>`;
}

// Desktop sidebar: #00A7E1, full height under the header, expanded 284 px / collapsed 72 px rail with tooltips.
export function renderSidebar(groups, { collapsed, loading }) {
  let first = true;
  const body = loading
    ? '<div class="sidebar__skel"><span></span><span style="width:70%"></span><span style="width:85%"></span><span style="width:60%"></span></div>'
    : groups.map(g => {
      const showLabel = !!g.group && !collapsed, showDivider = !!g.group && collapsed && !first;
      first = false;
      return `
<div class="nav-group${showLabel ? ' has-label' : ''}">
  ${showLabel ? `<div class="nav-group__label">${esc(g.group)}</div>` : ''}
  ${showDivider ? '<div class="nav-group__divider"></div>' : ''}
  ${g.items.map(it => navItem(it, 'nav-item', collapsed)).join('')}
</div>`;
    }).join('');
  const label = collapsed ? 'Expandir menú' : 'Contraer menú';
  return `
<nav class="sidebar${collapsed ? ' is-collapsed' : ''}" aria-label="Menú principal">
  <div class="sidebar__scroll">
    <button class="sidebar__toggle" data-action="sidebar:toggle" data-tip="Expandir menú" aria-label="${label}" title="${label}">
      ${icon(collapsed ? 'chevronsRight' : 'chevronsLeft', 20)}${collapsed ? '' : '<span>Contraer menú</span>'}
    </button>
    ${body}
  </div>
</nav>`;
}

// Mobile drawer (< 760 px): full-screen, identity + same navigation + «Cerrar sesión».
export function renderDrawer(groups, user) {
  return `
<div class="drawer" role="dialog" aria-label="Menú principal">
  <div class="drawer__head">
    <div class="drawer__avatar">${esc(initials(user.name))}</div>
    <div class="drawer__id"><div class="drawer__name">${esc(user.name)}</div><div class="drawer__role">${esc(user.roleLabel.toUpperCase())} · ${esc(user.area)}</div></div>
    <button class="drawer__close" data-action="drawer:close" aria-label="Cerrar menú">${icon('close', 22)}</button>
  </div>
  <nav class="drawer__nav">
    ${groups.map(g => `
    <div class="nav-group${g.group ? ' has-label' : ''}">
      ${g.group ? `<div class="nav-group__label">${esc(g.group)}</div>` : ''}
      ${g.items.map(it => navItem(it, 'drawer__item', false)).join('')}
    </div>`).join('')}
    <button class="drawer__logout" data-action="go" data-route="cerrar">Cerrar sesión</button>
  </nav>
</div>`;
}
