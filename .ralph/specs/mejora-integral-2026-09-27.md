# Mejora integral autorizada

Estado: investigacion y alcance registrados; implementacion nueva pendiente.

## Base comprobada

- R2 privado activo, 24 tablas cifradas verificadas y tarea Windows con resultado 0. No incluye binarios Storage ni funciona con el equipo apagado.
- 170 pruebas existentes pasan el 2026-09-27. No acredita las nuevas funciones.
- El grafo MCP fue reindexado porque los snippets anteriores estaban desplazados respecto al codigo actual.
- Ya existen `posSyncStatus`, checklist de pedido, historial de estados y calculo de materiales por variante. Extenderlos; no crear sistemas paralelos.
- El inventario se descuenta al pasar a produccion, con `inventarioDescontado` para impedir repetirlo. Finalizar tambien descuenta si aun no se habia hecho.
- Storage usado por el POS: `product-images` y `pedidos-referencias`. Enumerar con paginacion y verificar objetos; no suponer que una lista parcial es el respaldo completo.

## Criterios de aceptacion

1. Salud: diferenciar conectividad del navegador y comprobacion real del servicio. Mostrar cola, conflictos y respaldo confirmado por el proceso remoto, no una fecha inventada por el navegador. Un fallo de consulta debe decir desconocido/error, nunca saludable.
2. Respaldo cloud: conservar cifrado y comprobacion posterior a la subida. Incluir catalogo de imagenes, contenido e integridad; ensayar recuperacion en entorno aislado. No declarar completado si falta un objeto. Seleccionar mecanismo compatible con los limites de la cuenta sin activar pagos. Conservar copias actuales; acordar retencion antes de borrar archivos. La clave requiere destino separado elegido por el propietario.
3. Variantes: filas por talla, columnas por color y etiquetas legibles. Distinguir piezas terminadas, capacidad por material y demanda pendiente. No restar otra vez pedidos con inventario ya descontado. No sumar capacidad que comparte materia prima como si fueran existencias independientes. Los ajustes requieren motivo, validacion y guardado atomico con kardex; rechazar combinaciones repetidas.
4. Pedido: reunir datos existentes en una ficha, preservar referencias e historial. Aprobacion de diseno con fecha y referencia identificable; no inventar aprobaciones para historicos. Revisar checklist al producir/entregar y comprobar persistencia despues de recargar. No cambiar cobros ni existencias al abrir una ficha.
5. Rentabilidad: conservar el estimado tomado del pedido y registrar costos reales por categoria. Ausencia de costo real significa sin capturar, no costo cero. No duplicar empaques o envio entre categorias. Trabajar en centavos y mantener este analisis separado de los cobros/egresos registrados en Balance.
6. Diseno: reutilizar controles actuales, retirar duplicacion acotada y verificar contraste, foco, teclado, estados de guardado/error y ancho movil. Revisar modales principales, no solo capturas de la pantalla inicial.

## Pruebas propuestas

Pregunta enviada al propietario conforme a `F:/.agents/skills/tdd/SKILL.md`: respaldo y recuperacion; salud/sincronizacion; variantes; ficha/aprobacion; costos/rentabilidad. No se han escrito pruebas nuevas mientras esta pendiente la respuesta.

Usar staging aislado con datos ficticios para los recorridos. Los cambios de JS/CSS deben actualizar el hash de SW mediante build. Publicar solo despues de validar las nuevas funciones. No afirmar pruebas fisicas de impresora/PWA desde una simulacion.
