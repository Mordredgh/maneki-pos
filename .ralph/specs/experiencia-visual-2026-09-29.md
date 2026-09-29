# Experiencia visual y operativa

- Reutilizar los datos, formulas y guardados existentes. Vistas nuevas no crean ventas ni movimientos de inventario.
- El Kanban permanece interactivo mientras se abre una ficha no modal a la derecha. Botones dentro de la tarjeta conservan sus funciones. Navegacion anterior/siguiente sigue el orden visible.
- La cuadricula de variantes distingue existencias terminadas, fabricacion posible desde materiales compartidos y falta de combinacion/material. Nunca suma la misma capacidad entre tallas.
- La linea de Balance representa entradas y salidas reales por fecha; deduplica sales_history e incomes por id como caja. No confundir facturacion con flujo de efectivo.
- Vista previa de pedido es paso previo de confirmacion, no modifica datos; usa exactamente los valores que se van a guardar y devuelve al formulario para corregir. La edicion de finalizados conserva su flujo.
- Visores de imagen e impresion solo muestran datos existentes y usan controles accesibles. Imprimir exige una accion explicita tras revisar.
- Estado de guardado por ficha refleja la cola y conflictos reales, sin prometer persistencia prematura.
- Preferir mejoras locales a nuevas tablas o servicios. Verificar escritorio y pantalla movil, teclado, foco y carga.
