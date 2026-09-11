# US-01 · Approved direction, assumptions and decisions (from the design notes of the prototype)

Status: internally approved 2026-09-10 · pending client validation.

## Approved direction
- Real Starmedica logo (30 px / 24 px mobile), never redrawn.
- Sidebar Digital Blue **#00A7E1** (institutional default), full viewport height (container = viewport − 64 px header), content scrolls internally with a thin subtle scrollbar. Expanded 284 px / collapsed rail 72 px with tooltips. Mobile = full-screen drawer (no bottom bar).
- Header: compact identity (name + role, + area in the account menu), no SAP fields; avatar/name/chevron opens the account menu with «Cerrar sesión» (no standalone «Cerrar»); bell in header.
- Same function = same icon (`NAVIGATION_ICONS`). Concise labels, wrap to 2 lines, never ellipsis.
- Component-level contrast on blue: Medium labels; active item = white surface + #4A4F54 text + blue icon; counters white + #0077A8; hover white 18 %; focus ring.
- One message/help bar per screen (state-switching). Folio indicator only on folio screens, below the message bar (not in US-01).
- Status grays: #A9A8A9 captura / #4A4F54 cancelado. Status always color + icon + text. Buttons 42 / 40 / text.
- Demo switcher labeled MODO DEMO · SOLO PROTOTIPO, visually separate (dark strip with dashed border + fixed tag).

## Assumptions / decisions
- White on #00A7E1 measures 2.7:1 (AA for large text only) → contrast handled at component level as above. The dark blue #007DB0 / #0B5C7E is only an optional secondary variant, never the default (not included in this source package).
- Warning yellow is not defined by Starmedica guidelines nor the common spec → proposed **#E9A800** (border) / **#FFF6DC** (background), text always #4A4F54, icon #B37D00.
- Role Homes share a structure: own trip (if traveler) → indicators → trays with folio, responsible, detail, status and age. The Colaborador Home is detailed in US-02.
- Operational roles with traveler capability (Capital Humano HSM, DGA, Dirección) also see Planeación de viaje and a compact card of their own trip. No duplicated screens.
- Menu by matrix: ✓ visible, V traveler only, V+PF profile, L with «Lectura» tag, P hidden (US-26). Menu reordered by functional blocks; names avoid «Módulo».
- Unbuilt sections show the story that designs them; no dead links. «Cerrar sesión» is visual.
- Switching demo user clears state and reloads Inicio.
