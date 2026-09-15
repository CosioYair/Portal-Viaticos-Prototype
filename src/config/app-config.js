// APP CONFIG — the few values JavaScript needs for behavior. Visual tokens live in src/styles/tokens.css.

// Breakpoints measured on the shell CONTAINER width (ResizeObserver), so embeds behave like the full window.
//   < 760   mobile  → hamburger + full-screen drawer, compact header, stacked content
//   < 1180  narrow  → sidebar persists, tray tables become cards
//   ≥ 1180  desktop
export const BREAKPOINT_MOBILE = 760;
export const BREAKPOINT_NARROW = 1180;

export function viewportMode(width) {
  return width < BREAKPOINT_MOBILE ? 'mobile' : width < BREAKPOINT_NARROW ? 'narrow' : 'desktop';
}

// Real Starmedica logo (supplied by client — never redraw or replace)
export const LOGO_SRC = 'public/assets/branding/logo-starmedica.png';

// Mock data files loaded at startup (src/app.js)
export const DATA_FILES = ['users', 'navigation', 'statuses', 'home', 'notifications'];

// Utilities shared by templates
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('');
// Avatar: DEMO photo when the user has one (users.json › photo — asset supplied by the client for the mockup, never an employee record); initials otherwise / as fallback.
// The <img> sits over the initials; if the file is missing the browser shows nothing and the initials remain visible (alt="" + transparent).
export const avatar = (user, cls = '') =>
  `<span class="avatar ${cls}" aria-hidden="true"><span>${esc(initials(user.name))}</span>${user.photo ? `<img class="avatar__img" src="${user.photo}" alt="">` : ''}</span>`;
