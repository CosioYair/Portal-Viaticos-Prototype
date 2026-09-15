# ASSET_MANIFEST — complete visual resource inventory (US-01)

Goal: no visual resource should require guessing from a screenshot or PDF.

## 1. Branding

| Name | Type | Path | Purpose | Used by |
|---|---|---|---|---|
| Starmedica logo (official, supplied by client) | PNG, transparent | `public/assets/branding/logo-starmedica.png` | Brand mark in the header, links to Inicio. Render at **30 px high** (desktop) / **24 px** (mobile), width auto — never alter color, proportion or replace with text/initials. | `src/layout/portal-layout.js › renderHeader` (`LOGO_SRC` in `src/config/app-config.js`, `.brand__logo`) |

## 1b. Demo user photo

| Name | Type | Path | Purpose | Notes |
|---|---|---|---|---|
| Demo profile photo — client-supplied (u01) | JPG, 400 × 400 px | `public/assets/users/demo-profile-user.jpg` | Avatar in the header (36 px) and mobile drawer (40 px) — not repeated in the account dropdown, circular crop (`object-fit: cover`). Referenced from `src/data/users.json › users[].photo`; rendered by `avatar()` in `src/config/app-config.js`. | **DEMO DATA supplied by the client for the mockup** (cropped square, face untouched). Not an employee record, no external URL. Users without `photo` render initials (also the fallback if the file fails to load). Production shows the authenticated collaborator's photo. |

## 2. Typography

| Name | Source | Weights | Configured in |
|---|---|---|---|
| Roboto | Google Fonts CDN (`https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700`) | 400 Regular · 500 Medium · 700 Bold | `index.html` (link) · `--font` in `src/styles/tokens.css` |

Offline: self-host the same three weights and swap the `<link>` for `@font-face` rules. No other font is used.

## 3. Icons — strategy

- **Runtime:** inline SVG paths from the single map `src/config/icons.js` (`ICONS`), rendered by its `icon()` helper. No icon library dependency.
- **Files:** every icon is also exported as `public/assets/icons/<key>.svg` (`viewBox 0 0 24 24`, `stroke="currentColor"`, `stroke-width 2`, round caps/joins, `fill none`).
- **Library equivalence:** geometry follows **Lucide** (https://lucide.dev, ISC). If the production team prefers the package (e.g. `lucide-angular`), the equivalent Lucide icon name is listed below for every glyph. Use Lucide ≥ 0.400 for these names.
- **Sizes:** menu 20 px · header bell 22 px · hamburger 24 px · chevron (account) 16 px · status chips 16 px · message bar 22 px · notices 20 px · empty/blocked states 32–40 px (stroke 1.5) · deadline chip 18 px.
- **Rule:** SAME FUNCTION = SAME ICON, independent of role. Each menu item in `src/data/navigation.json` names its icon once. Client V2 (2026-09-14): every Comprobación / Comprobaciones item (traveler `comprobacion`, DGA `aut-comp`, Viáticos `ges-comp`, Contabilidad `con-comp`) uses `fileCheck` (document + check); `checkSquare` stays in the catalog for statuses/other uses.

### 3a. Navigation icons (menu item → icon)

| Menu item id | Icon key | Lucide name | File |
|---|---|---|---|
| inicio | `home` | `house` | public/assets/icons/home.svg |
| creacion | `plus` | `plus` | public/assets/icons/plus.svg |
| misviajes | `suitcase` | `briefcase` | public/assets/icons/suitcase.svg |
| anticipo | `money` | `dollar-sign` | public/assets/icons/money.svg |
| hospedaje | `bed` | `bed` | public/assets/icons/bed.svg |
| vuelo (Vuelos) | `plane` | `plane` | public/assets/icons/plane.svg |
| comprobacion | `fileCheck` | `file-check` | public/assets/icons/fileCheck.svg |
| representacion | `receipt` | `receipt` | public/assets/icons/receipt.svg |
| perfil | `user` | `user` | public/assets/icons/user.svg |
| externos | `userPlus` | `user-plus` | public/assets/icons/userPlus.svg |
| pres-monitor | `chart` | `chart-line` | public/assets/icons/chart.svg |
| pres-act | `refresh` | `refresh-cw` | public/assets/icons/refresh.svg |
| aut-viaje | `checkCircle` | `circle-check-big` | public/assets/icons/checkCircle.svg |
| aut-rep | `receipt` | `receipt` | public/assets/icons/receipt.svg |
| aut-comp | `fileCheck` | `file-check` | public/assets/icons/fileCheck.svg |
| res-hsm | `hospital` | `building-2` | public/assets/icons/hospital.svg |
| res-hotel | `hotel` | `hotel` | public/assets/icons/hotel.svg |
| ges-comp | `fileCheck` | `file-check` | public/assets/icons/fileCheck.svg |
| con-plan | `list` | `list` | public/assets/icons/list.svg |
| con-ant | `money` | `dollar-sign` | public/assets/icons/money.svg |
| con-comp | `fileCheck` | `file-check` | public/assets/icons/fileCheck.svg |
| con-rep | `receipt` | `receipt` | public/assets/icons/receipt.svg |
| encuestas | `survey` | `message-square-more` | public/assets/icons/survey.svg |
| dashboard | `grid` | `layout-dashboard` | public/assets/icons/grid.svg |
| reportes | `fileText` | `file-text` | public/assets/icons/fileText.svg |
| adm-perfiles | `users` | `users` | public/assets/icons/users.svg |
| adm-catalogos | `book` | `book-open` | public/assets/icons/book.svg |
| adm-politicas | `shield` | `shield` | public/assets/icons/shield.svg |
| adm-usuarios | `key` | `key` | public/assets/icons/key.svg |
| adm-bitacora | `history` | `history` | public/assets/icons/history.svg |
| ayu-politicas | `shield` | `shield` | public/assets/icons/shield.svg |
| ayu-guia | `help` | `circle-help` | public/assets/icons/help.svg |
| ayu-encuesta | `survey` | `message-square-more` | public/assets/icons/survey.svg |

### 3b. Shell / UI icons

| Icon key | Lucide name | File | Where used |
|---|---|---|---|
| `menu` | `menu` | public/assets/icons/menu.svg | Header (mobile) — open navigation drawer, 24 px |
| `bell` | `bell` | public/assets/icons/bell.svg | Header — Avisos button 22 px; notices empty state 32 px (#A9A8A9, stroke 1.5) |
| `chevronDown` | `chevron-down` | public/assets/icons/chevronDown.svg | Header — account button, 16 px #777779 (rotates 180° when open) |
| `chevronRight` | `chevron-right` | public/assets/icons/chevronRight.svg | Home trays — row affordance, 16 px #A9A8A9 |
| `chevronsLeft` | `chevrons-left` | public/assets/icons/chevronsLeft.svg | Sidebar fixed utility footer — «Contraer menú», 18 px |
| `chevronsRight` | `chevrons-right` | public/assets/icons/chevronsRight.svg | Sidebar rail fixed utility footer — «Expandir menú», 18 px (title + aria-label) |
| `close` | `x` | public/assets/icons/close.svg | Mobile drawer — close, 22 px |
| `logOut` | `log-out` | public/assets/icons/logOut.svg | Account menu — «Cerrar sesión», 18 px |
| `arrowRight` | `arrow-right` | public/assets/icons/arrowRight.svg | Home trip card — «Siguiente paso», 20 px #00A7E1 |
| `check` | `check` | public/assets/icons/check.svg | Journey progress — completed stage, 18 px stroke 3, white on #A2C83A (40 px marker, 36 px mobile) |
| `lock` | `lock` | public/assets/icons/lock.svg | «Sin permiso» state, 40 px #A9A8A9 stroke 1.5 |
| `wrench` | `wrench` | public/assets/icons/wrench.svg | «Sección no construida» state, 40 px #A9A8A9 stroke 1.5 |
| `spinner` | `loader-circle` | public/assets/icons/spinner.svg | Loading state footer, 18 px #00A7E1 |

### 3c. Status / message-tone icons

| Icon key | Lucide name | File | Where used |
|---|---|---|---|
| `info` | `info` | public/assets/icons/info.svg | Message bar (help/info) · demo bar tag |
| `clock` | `clock` | public/assets/icons/clock.svg | Deadline chip (18 px #B37D00) · statuses Pendiente autorización / asignación / validación, En proceso · azul notices |
| `warning` | `triangle-alert` | public/assets/icons/warning.svg | Message bar advertencia · «Plazo vencido» status (emergencia) · amarillo/emergencia notices |
| `xCircle` | `circle-x` | public/assets/icons/xCircle.svg | Message bar error · «Rechazada» status |
| `checkCircle` | `circle-check-big` | public/assets/icons/checkCircle.svg | Statuses Aprobada / Asignado / Realizado / Finalizado · verde notices · success bar · menu «Aprobación de viaje» |
| `edit` | `pencil` | public/assets/icons/edit.svg | «En captura» status |
| `slashCircle` | `ban` | public/assets/icons/slashCircle.svg | «Cancelada» status |

Tone → icon mapping lives in `TONE_ICON` (`src/config/icons.js`); status → icon in `src/data/statuses.json`.

## 4. Other visual resources

| Name | Type | Where | Notes |
|---|---|---|---|
| Avatar | Photo (§1b) over CSS initials | `.avatar`, `.avatar__img` in `styles/layout.css` | Circle 36 px (40 px in the mobile drawer). Photo covers the initials; fallback #E6F6FC bg, #0077A8 initials Bold 13/14 px. |
| Journey-step marker | CSS | `.journey__marker` in `styles/global.css` | Circle 40 px (36 px mobile) — semantic circle, allowed exception to the 0 px corner standard. |
| Skeleton shimmer | CSS keyframes | `@keyframes smv-shimmer` in `styles/global.css` | Loading state |
| Scrollbars | CSS | `styles/global.css`, `styles/layout.css` | 6 px, thumb gray 22 % / white 30 % on blue, no track |

No other images, illustrations or icon fonts are used in US-01.

## 5. Corner standard
All rectangular UI surfaces: `--radius-default: 0px`. Only semantic circles (avatar, journey-step marker, status dot, kpi dot) use `--radius-circle: 50%`. No pill buttons/chips.
