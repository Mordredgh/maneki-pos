# Experiencia diaria del POS — 2026-09-29

Objetivo autorizado: inventario visual, alta de producto guiada, reposiciones,
versiones de diseño y personalización del inicio.

Decisiones:
- Las tarjetas de inventario usan los mismos datos, filtros, orden y paginación
  que la tabla. La preferencia de vista vive en este navegador; no altera stock.
- El formulario PT conserva sus campos y guardado existentes. Las opciones
  avanzadas se agrupan visualmente; editar muestra todo.
- Una reposición es un registro del pedido original (motivo, fecha y costo), no
  una venta, cobro ni movimiento de stock automático. Suma al costo real del
  pedido para calcular margen sin duplicar ingresos.
- Las versiones de arte viven en `posDetalle`. Se identifican por nombre y URL
  opcional HTTPS; una sola puede estar aprobada. Cambiar la versión aprobada
  exige nueva confirmación y firma. Los pedidos anteriores conservan su
  aprobación si no tienen versiones explícitas.
- La selección de paneles del inicio vive en localStorage y admite restablecer.
  Los datos empresariales siguen en Supabase, sin nueva tabla ni permiso.

Verificación: pruebas TDD en los límites de HTML y modelo de pedido; build,
staging ficticio, despliegue y comprobación de acceso/SW.
