# Cierre de puntos 3, 4 y 5

## Pruebas de negocio

Build Cloudflare completo: 133 pruebas, typecheck, lint, 34 modulos y 8 bundles correctos. Typecheck independiente correcto. Service Worker actualizado a maneki-e4be814737. Trivy: cero secretos detectados en archivos publicables del proyecto; archivos de entorno privados excluidos.

46 pruebas de persistencia ejecutan TypeScript real con navegador y transporte Supabase simulados. Cubren pedido con anticipo, abono sin red, finalizacion y cobro restante, cancelacion sin materiales, restauracion de categorias/kardex, reportes, errores de almacenamiento, reinicio, borrados pendientes y respuesta perdida despues de guardar.

Corregidos dos fallos adicionales: la creacion/abono offline interrumpia el registro de sus cobros relacionados; el cobro al entregar podia no persistir en ventas cuando liquidaba todo el saldo.

No se escribieron operaciones de prueba en produccion. Estas pruebas no verifican triggers/RLS reales ni reemplazan staging. Impresion fisica, instalacion PWA y navegacion publicada siguen pendientes: navegador integrado bloquea Basic Auth. HTTP y assets se verifican por separado.

## Persistencia sin red

Cola relacional en localStorage antes de enviar; orden global, identificadores estables y reintentos mediante upsert. Solo se retira una operacion tras confirmacion. Lecturas superponen pendientes para evitar perder cambios locales. Realtime no pisa tablas con escrituras pendientes. Incluye tablas de negocio, categorias, kardex y borrados individuales explicitos.

La cola no constituye una transaccion SQL entre tablas. Los errores permanentes bloquean operaciones posteriores y requieren correccion. No resuelve edicion concurrente entre dispositivos/pestanas; los guardados de colecciones pueden sobrescribir cambios remotos. No limpiar datos del navegador mientras existan pendientes. Limite de localStorage y peticiones que no terminan siguen siendo limites operativos. Borrados masivos y mantenimiento no tienen replay offline. Restauraciones interrumpidas requieren revisar el respaldo y conciliar antes de repetir.

## Publicacion y Git

Publicado en Cloudflare Pages: https://f5aa43a9.bicho-capricho-pos.pages.dev, produccion main. Dominio habitual: https://pos.manekistore.com.mx. Basic Auth conservado y secretos fuera del repositorio. Ver CLOUDFLARE.md para reconstruir y publicar.

Cambios preparados para commit y push a la rama fresh-start del remoto github. El proyecto Pages usa carga directa; hacer push no despliega automaticamente.

## Pendientes externos al alcance 3/4/5

Auth/RLS de Supabase e incorporacion de incomes.method siguen pendientes de acceso administrativo. La proteccion de Cloudflare no restringe el endpoint publico de Supabase. No declarar cerrada la auditoria completa mientras estos puntos y las pruebas fisicas sigan abiertos.
