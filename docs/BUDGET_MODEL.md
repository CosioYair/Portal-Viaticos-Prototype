# Modelo de presupuesto — US-06 / US-07 (APPROVED · CLOSED 2026-10-15)

Fuente única: `src/features/budget/budget-model.js` (`window.SMV_PRES`). Home, Monitor, Creación, Aprobación, Anticipo, cancelación y alertas lo consumen; ninguna pantalla guarda cifras propias.

## Navegación y permisos
- Una sola opción: **Presupuesto › Monitor** (no existe «Actualización»). Acciones: CO Consultar (navegación) · ED Editar (gestión: CON ✓, DIR P) · MP Movimientos presupuestales (Viáticos sin ella).
- Alcance por rol (gana el menor): Dirección de Hospital = su hospital · Dirección Corporativa / CH CO = su dirección · DGA, Viáticos, Contabilidad, Contraloría = consolidado.
- Pestañas: Resumen · Movimientos · Cargas.

## Conceptos
Planeado · Ampliado (suplementos) · Bloqueado · Comprometido (solicitudes vigentes + en tránsito + ejercido) · PRE disponible = Planeado + Suplementos − Bloqueos − Comprometido · Estimado por autorizar · En tránsito · Ejercido · Liberado por cancelación. «Consumido» prohibido.
Control **mensual sin arrastre**: lo comprometido en un mes nunca excede el presupuesto de ese mes; lo no usado de meses cerrados no se acumula. La solicitud cae en la bolsa de su entidad y en el mes de inicio del viaje (`disponiblePara`).

## Carga por archivo (única vía de cambio de importes)
Columnas: Soc. · Nombre de la Div. · Div. · Denominación · Cta.mayor · Texto explicativo · Ce.coste · Posición Ptto · CeBe + Enero…Diciembre. Llave de bolsa = Soc + Div + Ce.coste + Cta.mayor + Posición Ptto + CeBe + ejercicio.
Clasificación por bolsa + mes: primer positivo = **Carga inicial** · positivo posterior = **Suplemento** · negativo = **Bloqueo** (≤ disponible del mes). Suplemento y Bloqueo exigen documento de autorización (uno por bolsa, 5 MB). Vista previa, reporte de errores, aplicación parcial explícita, historial CAR-000n.

## Dos conceptos de movimiento (nunca mezclados)
- **Movimientos presupuestales**: Carga inicial · Suplemento · Bloqueo · Cierre de vigencia.
- **Movimientos de bolsa**: Solicitud de viaje (interno «Reserva») · Anticipo (en autorización → en tránsito · por depositar → depositado · por comprobar → comprobado) · Vuelo (en tránsito → confirmado = consumo directo, sin anticipo) · Comprobación · Liberación manual · Cierre de vigencia (Cambio en el Portal).
- Encabezado: Solicitudes de viaje vigentes + Anticipos depositados por comprobar + Vuelos por confirmar + Comprobaciones = Comprometido.
- Movimientos solo se agregan; sin «Historial de cambios».

## Gestión (detalle de bolsa)
Liberación manual (folio + importe ≤ comprometido del folio + motivo) · Cerrar vigencia (motivo; Inactiva, nada se borra). Toda mutación: confirmación antes → después + movimiento + Bitácora (área Presupuesto).

## Creación (US-06)
Precondición de entrada (bolsa activa + disponible del mes) y revalidación al enviar: insuficiente · el saldo cambió · consulta no disponible (Reintentar). La solicitud no se envía y queda En proceso. «Avisar a mi Director» con aviso + Bitácora. Mensajes al colaborador sin cifras de la entidad.

## Exportación (especificación para desarrollo)
«Exportar monitor» = SOLO el detalle de movimientos con toda la información (tipo, periodo, fecha, importe con signo, datos de carga de la bolsa, folio, viajero, evento, responsable, fuente, carga/archivo, documento), respetando alcance y filtros.

## Pendientes del cliente
Documento por bolsa o por movimiento · mapeo oficial División → entidad (SAP) · umbrales 70/85 vs 80/90 · visibilidad de liberaciones · integración real con vuelos · si Viáticos ve Ampliado/Bloqueado · Proyecto como dimensión.
