# US-01 · Menu catalog and default role visibility matrix

**Status: US-01 LAYOUT BASELINE APPROVED (2026-09-15).** This matrix is the approved baseline; future User Stories extend it (new items / permissions of their own scope) and never silently rewrite approved visibility.

Generated from `src/data/navigation.json` (source of truth). Legend: ✓ visible by default · V requires traveler capability · V+PF traveler + profile permission · L read-only («Lectura» tag) · P additional configured permission (hidden by default) · — not visible.

Roles: COL Colaborador · CHH Capital Humano HSM · DIR Dirección (Hospital / Corporativa) · CHC Capital Humano Corporativo · DGA · HH Hotelería HSM · HC Hotelería Corporativo · VIA Viáticos · CON Contabilidad/Tesorería · CTR Contraloría · ADM Admin/Seguridad TI.

| Group | Item (id) | Icon | US | COL | CHH | DIR | CHC | DGA | HH | HC | VIA | CON | CTR | ADM |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| — | Inicio (`inicio`) | home → house | US-01 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Planeación de viaje | Creación (`creacion`) | plus → plus | US-08 | ✓ | V | V | V | V | V | V | V | V | V | V |
| Planeación de viaje | Mis viajes (`misviajes`) | suitcase → briefcase | US-11 | ✓ | V | V | V | V | V | V | V | V | V | V |
| Planeación de viaje | Anticipo (`anticipo`) | money → dollar-sign | US-15 | V+PF | V+PF | V+PF | V+PF | V+PF | V+PF | V+PF | V+PF | V+PF | V+PF | V+PF |
| Planeación de viaje | Hospedaje (`hospedaje`) | bed → bed | US-12 | ✓ | V | V | V | V | V | V | V | V | V | V |
| Planeación de viaje | Vuelos (`vuelo`) | plane → plane | US-12 | ✓ | V | V | V | V | V | V | V | V | V | V |
| Planeación de viaje | Comprobación (`comprobacion`) | fileCheck → file-check | US-19 | ✓ | V | V | V | V | V | V | V | V | V | V |
| Planeación de viaje | Gastos de representación (`representacion`) | receipt → receipt | US-20 | V+PF | V+PF | V+PF | V+PF | ✓ | V+PF | V+PF | V+PF | V+PF | V+PF | V+PF |
| — | Perfil del viajero (`perfil`) | user → user | US-04 | ✓ | V | V | V | V | V | V | L | V | V | V |
| — | Viajeros externos (`externos`) | userPlus → user-plus | US-05 | — | ✓ | — | — | — | — | — | L | — | — | — |
| Presupuesto | Monitor (`pres-monitor`) | chart → chart-line | US-06 | — | — | ✓ | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | P |
| Presupuesto | Actualización (`pres-act`) | refresh → refresh-cw | US-07 | — | — | P | — | — | — | — | — | ✓ | L | — |
| Autorización | Aprobación de viaje (`aut-viaje`) | checkCircle → circle-check-big | US-09 | — | — | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| Autorización | Gastos de representación (`aut-rep`) | receipt → receipt | US-20 | — | — | — | — | ✓ | — | — | — | — | ✓ | — |
| Autorización | Comprobaciones (`aut-comp`) | fileCheck → file-check | US-20 | — | — | — | — | ✓ | — | — | — | — | — | — |
| Reservaciones | Hospedaje HSM (`res-hsm`) | hospital → building-2 | US-13 | — | — | — | — | — | ✓ | — | — | — | — | — |
| Reservaciones | Hotel y vuelos (`res-hotel`) | hotel → hotel | US-14 | — | — | — | — | — | — | — | ✓ | — | — | — |
| Gestión | Comprobaciones (`ges-comp`) | fileCheck → file-check | US-21 | — | — | — | — | — | — | — | ✓ | — | — | — |
| Contabilización | Planeación de viaje (`con-plan`) | list → list | US-11 | — | — | — | — | — | — | — | — | ✓ | — | — |
| Contabilización | Solicitud de anticipo (`con-ant`) | money → dollar-sign | US-16 | — | — | — | — | — | — | — | — | ✓ | — | — |
| Contabilización | Comprobación (`con-comp`) | fileCheck → file-check | US-22 | — | — | — | — | — | — | — | — | ✓ | — | — |
| Contabilización | Gastos de representación (`con-rep`) | receipt → receipt | US-22 | — | — | — | — | — | — | — | — | ✓ | — | — |
| — | Gestión de encuestas (`encuestas`) | survey → message-square-more | US-18 | — | — | — | — | — | — | ✓ | — | — | — | — |
| — | Dashboard (`dashboard`) | grid → layout-dashboard | US-23 | — | — | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | P |
| — | Reportes (`reportes`) | fileText → file-text | US-24 | — | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Administración | Perfiles de viajero (`adm-perfiles`) | users → users | US-03 | — | — | — | — | — | — | — | — | — | — | ✓ |
| Administración | Catálogos y parámetros (`adm-catalogos`) | book → book-open | US-25 | — | — | — | — | — | — | — | — | — | — | ✓ |
| Administración | Políticas y guías (`adm-politicas`) | shield → shield | US-27 | — | — | — | — | — | — | — | — | — | — | ✓ |
| Administración | Usuarios y permisos (`adm-usuarios`) | key → key | US-26 | — | — | — | — | — | — | — | — | — | — | ✓ |
| Administración | Bitácora (`adm-bitacora`) | history → history | US-26 | — | L | L | L | — | — | — | — | L | L | ✓ |
| Ayuda | Políticas (`ayu-politicas`) | shield → shield | US-27 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ayuda | Guía de usuario (`ayu-guia`) | help → circle-help | US-27 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ayuda | Encuesta (`ayu-encuesta`) | survey → message-square-more | US-18 | ✓ | ✓ | V | V | — | V | V | V | V | V | V |

Profile rules (V+PF): `anticipo` → resolved by `navigation.js › anticipoApplies(user)`: **No aplica ONLY when perfil is Director AND personnelGroup is E or ED** (DGA is a distinct profile and does not inherit it); every other profile/group keeps Anticipo · `representacion` → perfil.representacion.

Viáticos › Perfil del viajero = **L (Lectura)**, client V2 final: Viáticos consults the traveler-profile information of any user; it never edits it (no edit actions).

CH CO (V2): traveler-capable in the demo → Planeación de viaje (Creación, Mis viajes, Anticipo by rule, Hospedaje, Vuelos, Comprobación, Gastos de representación by profile), Perfil del viajero and Ayuda › Encuesta are added by V / V+PF; Autorización › Aprobación de viaje stays ✓ (escalated cases only).

Icon rule (client V2, 2026-09-14): same function = same icon across roles — every Comprobación / Comprobaciones item (`comprobacion`, `aut-comp`, `ges-comp`, `con-comp`) uses `fileCheck` (document + check). Module/menu naming uses the plural «Vuelos» (`vuelo`, `res-hotel`); prose about a single flight is unchanged.

