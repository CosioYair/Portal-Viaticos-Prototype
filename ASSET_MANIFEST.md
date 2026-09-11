# ASSET_MANIFEST — complete visual resource inventory (US-01)

Goal: no visual resource should require guessing from a screenshot or PDF.

## 1. Branding

| Name | Type | Path | Purpose | Used by |
|---|---|---|---|---|
| Starmedica logo (official, supplied by client) | PNG, transparent | `public/assets/branding/logo-starmedica.png` | Brand mark in the header, links to Inicio. Render at **30 px high** (desktop) / **24 px** (mobile), width auto — never alter color, proportion or replace with text/initials. | `src/layout/portal-layout.js › renderHeader` (`LOGO_SRC` in `src/config/app-config.js`, `.brand__logo`) |

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
- **Rule:** SAME FUNCTION = SAME ICON, independent of role. each menu item in `src/data/navigation.json` names its icon once, so e.g. `checkSquare` is used for Comprobación (traveler), Gestión › Comprobaciones (Viáticos) and Contabilización › Comprobación alike.

### 3a. Navigation icons (menu item → icon)

| Menu item id | Icon key | Lucide name | File |
|---|---|---|---|
| inicio | `home` | `house` | public/assets/icons/home.svg |
| creacion | `plus` | `plus` | public/assets/icons/plus.svg |
| misviajes | `suitcase` | `briefcase` | public/assets/icons/suitcase.svg |
| anticipo | `money` | `dollar-sign` | public/assets/icons/money.svg |
| hospedaje | `bed` | `bed` | public/assets/icons/bed.svg |
| vuelo | `plane` | `plane` | public/assets/icons/plane.svg |
| comprobacion | `checkSquare` | `square-check-big` | public/assets/icons/checkSquare.svg |
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
| ges-comp | `checkSquare` | `square-check-big` | public/assets/icons/checkSquare.svg |
| con-plan | `list` | `list` | public/assets/icons/list.svg |
| con-ant | `money` | `dollar-sign` | public/assets/icons/money.svg |
| con-comp | `checkSquare` | `square-check-big` | public/assets/icons/checkSquare.svg |
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
| `chevronsLeft` | `chevrons-left` | public/assets/icons/chevronsLeft.svg | Sidebar — «Contraer menú», 20 px |
| `chevronsRight` | `chevrons-right` | public/assets/icons/chevronsRight.svg | Sidebar rail — «Expandir menú», 20 px |
| `close` | `x` | public/assets/icons/close.svg | Mobile drawer — close, 22 px |
| `logOut` | `log-out` | public/assets/icons/logOut.svg | Account menu — «Cerrar sesión», 18 px |
| `arrowRight` | `arrow-right` | public/assets/icons/arrowRight.svg | Home trip card — «Siguiente paso», 20 px #00A7E1 |
| `check` | `check` | public/assets/icons/check.svg | Home trip card — completed stage, 14 px stroke 3, white on #A2C83A |
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
| Avatar | CSS (initials) | `.avatar` in `styles/layout.css` | 36 px (40 px in account menu / drawer), #E6F6FC bg, #0077A8 initials Bold 13/14 px. No image asset. |
| Skeleton shimmer | CSS keyframes | `@keyframes smv-shimmer` in `styles/global.css` | Loading state |
| Scrollbars | CSS | `styles/global.css`, `styles/layout.css` | 6 px, thumb gray 22 % / white 30 % on blue, no track |

No other images, illustrations or icon fonts are used in US-01.
