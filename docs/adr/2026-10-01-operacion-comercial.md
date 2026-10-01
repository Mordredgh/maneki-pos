# Operacion comercial

Apartado: piezas terminadas retiradas de disponibilidad, sin venta ni consumo de MP. Vive en orders.pos_detalle.ficha; inventario_descontado evita descuento doble. Liberacion/cancelacion devuelve solo piezas apartadas. No apartar un pedido cuyo inventario ya se consumio para producir.
Promocion: conjunto de lineas reales con variantes; precio combinado distribuido en centavos sin cambiar stock antes de producir/vender. La definicion reusable vive en store, los precios aplicados quedan en productos_inventario y no se recalculan como rangos normales.
Devolucion: registro agregado al pedido vendido; cantidad acumulada no supera lo vendido, reembolso acumulado no supera cobros. Recuperar stock es opcion explicita; no devuelve MP. Cambio agrega salida de nueva pieza y cobra/devuelve diferencia expresamente. Pedido/movimientos/dinero usan posRunOperation existente; recibos idempotentes y comparacion optimista. No borrar movimientos originales ni reescribir la venta cerrada despues de una devolucion.
Capacidad: piezas por entrega de pedidos confirmados/pagados/en produccion, excluyendo apartados ya terminados. Limite configurable, aviso informativo, nunca requisito para guardar.
Personalizacion: lineas de servicio con nombre, precio y unidades elegidos; sin stock/MP. Aparecen en total y documentos.
Tiempo: minutos efectivos registrados con fecha/actividad en ficha. Ganancia/hora solo con costo completo; nunca confundir cobrado con venta ni estimacion con ganancia real.
Sin nuevas dependencias, tablas, permisos ni automatizaciones de pago.
