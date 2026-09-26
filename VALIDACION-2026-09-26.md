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

## Actualizacion 2026-09-26: acceso y concurrencia

Estado vigente, sustituye los pendientes anteriores de Auth/metodo/concurrencia:

- Despliegue https://1742889c.bicho-capricho-pos.pages.dev; dominio habitual con HTTP 401 anonimo y 200 autorizado. Assets 200, login incluido, SW maneki-1ed0b2f342.
- 140 pruebas, typecheck, lint y compilacion completos. npm audit: cero vulnerabilidades; Trivy: cero secretos detectados (entornos privados excluidos).
- Login Supabase con verificacion de administrador antes de cargar datos. Usuario entro en localhost y los datos cargaron tambien despues de aplicar RLS. Basic Auth Cloudflare se conserva.
- Aplicadas migraciones incomes.method, role-hardening, optimistic-writes, optimistic-store y private-rls. Se corrigio autoasignacion de roles y recursion de politica. 19 tablas privadas tienen guarda restrictiva; escrituras de productos/categorias requieren admin; visitantes solo ven productos publicados.
- SQL con ROLE anon: clientes, pedidos, ingresos y productos no publicados devolvieron cero filas. SQL con ROLE authenticated y administrador existente: alta/actualizacion de ingreso y conflicto funcionaron bajo RLS; ROLLBACK, cero filas QA restantes.
- Pruebas SQL adicionales: metodo efectivo, reenvio idempotente, conflicto de borrado y conflicto KV. Todas revertidas, sin operaciones contables de prueba persistentes.
- RPC por tabla compara snapshot previo y rechaza escritura obsoleta con 40001. Conserva cola local y permite descargar pendientes relacionales/KV. No hay conciliacion automatica ni transaccion entre tablas; cambios administrativos directos eluden el RPC. Pendientes de versiones anteriores requieren revision manual.
- Segunda pestaña del mismo origen bloqueada mediante Web Locks, comprobado en navegador. Distintos dispositivos usan deteccion de conflicto del servidor.
- Arranque offline local comprobado con datos; corregido indicador que podia anunciar conexion sin red. Manifest sin errores mediante CDP; crossorigin use-credentials y dimensiones reales de icono. No equivale a instalacion fisica PWA.
- Ticket: ventana abierta antes de await y contenido escapado contra HTML inyectado; prueba automatizada de saldo y marca.

Pendientes reales:

1. store-rls NO aplicada: espera decision del propietario sobre cortar acceso anonimo del bot antiguo. Mientras tanto, store sigue siendo via de exposicion de copias privadas. No declarar seguridad completa.
2. Impresion fisica, instalacion PWA y recorrido publicado en navegador normal (IAB bloquea Basic Auth). Usuario aun no indica impresora.
3. No existe staging separado. Pruebas reales realizadas en transacciones revertidas; no cubren cada flujo UI extremo a extremo.
4. Resolver conflictos requiere comparar cambios conservados; no limpiar almacenamiento local con pendientes. No hay cierre de sesion explicito en interfaz; dispositivo autorizado conserva datos offline.

Reversion de RLS (solo si fuera necesaria, requiere revisar exposicion): retirar unicamente politicas pos_admin_guard de las 19 tablas, pos_guard_insert/update/delete de products/categories, pos_published_products y pos_admin_categories. Politicas anteriores se conservaron. No revertir a frontend anterior sin plan: RPC requiere administrador.
