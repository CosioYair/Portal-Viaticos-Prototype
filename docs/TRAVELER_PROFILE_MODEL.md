# TRAVELER_PROFILE_MODEL — Administración de perfiles de viajero (US-03 · APPROVED · CLOSED · FULLY SYNCED · 2026-10-08)

Canonical functional contract of the traveler-profile administration. Full client-facing specification: PDF «Propuesta visual (US-03 - Administración de perfiles de viajero)».

## 1. One model
`src/data/traveler-profiles.json` (prototype: `usperfil-data.js › SMV_PERFIL`) holds profiles, concepts, tariffs, global parameters, taxi, exceptionable rules, exceptions and profile assignments. Home, Mi perfil de viajero, the collaborator file, Creación and the estimate consume it — never a per-screen copy.

## 2. Vocabulary
Internal profiles: **Director · Ejecutivo · Mando medio · Operativo**. **Viajero externo** = tariff category (not assignable to SAP personnel). **DGA is a functional role, never a profile** (its holder travels as Director). «Nivel n» is prohibited.

## 3. Effective value (single resolver — `rules.js › effectiveValue`)
`vigente individual exception → profile policy → global parameter`; the origin is always shown in words (Excepción individual · Política del perfil · Parámetro global). Antelación mínima (r12) has a GLOBAL base.

## 4. Profile record
`{ id, perfil, from, to, anticipo Sí|No, hospedaje Hotel|Hospital, habitacion[], alimentos[], semanasMes, nochesSemana, diasMax, diasComprobar (empty → global 7), transporte[], representacion, doc }`. Validity of the same profile never overlaps; future validity = «Futura». Director: anticipo does not apply when SAP personnel group is E/ED (resolved per collaborator). Hotel → nights × tariff; Hospital → hospital room is not estimated.

## 5. Tariffs
Atomic concepts c1 Hospedaje (por noche) · c2 Alimentos (daily caps for 1·2·3 meals, cumulative, never added) · c6 Vuelos (monto máximo · referencia) · c7 Gasolina · c8 Casetas · c4 Anticipo (monto máximo autorizado) · c9 Gastos de representación (only profiles with that capability). Each amount has its own validity (no global matrix validity) and declares its base; no base is invented. Missing tariff → red cell + warning. Taxi = weekly rate per destination hospital (comprobación). Tintorería = global $85/day from day 6. Antelación = global 5 days.

## 6. Simulator (`rules.js › simulate`)
Captured quantities (days, nights, external meals per day, destination); lines are traceable `tariff × quantity = subtotal`; flights, fuel, tolls and advance are not added.

## 7. Individual exceptions
`{ userId, regla r1…r13, politica, valor, from, to, motivo, documento, by, when, revoked }`. Mandatory validity, reason and document (5 MB max). Only exceptionable rules (days to prove, tariff amounts, trip caps, minimum notice). No overlap for the same rule/collaborator; an open one is edited instead of duplicated. Status derived: Programado · Vigente · Vencido · Revocado. On expiry/revocation the value returns to the policy; the record is kept.

## 8. Frozen rules
Changing a profile, tariff or exception never alters authorized folios (snapshot «Perfil aplicado al folio»).

## 9. Audit
Every change: validate → impact → Guardar → confirmation (before → after) → apply → shared success modal → bitácora event. Opening/cancelling never audits. Nothing with historical use is deleted; validity is closed instead.

## 10. Open (not client-confirmed)
Base of Vuelos/Gasolina/Casetas · official amounts of Gasolina, Casetas, Anticipo (provisional) · Director advance amount · Gastos de representación amount · Viajero externo amounts · weekly taxi proration · antelación 5 vs 4 days · «Perfil Especial / Externos» as internal profiles.
