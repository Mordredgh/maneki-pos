# Bicho Capricho POS - Taller creativo

Direccion autorizada por el propietario el 2026-09-30. Modo Operate: pedidos, existencias y cobros en un taller, escritorio/movil, luz cotidiana. La marca acompana tareas legibles y controles familiares.

## Autoridad visual
BICHO CAPRICHO - MASTER en F:/Gerardo Brain/01 - PROYECTOS/Bicho Capricho. Continuidad con verde bosque, crema y objetos de vinil mate. No hay nueva identidad comercial ni cambios de flujo.

## Paleta y material
- Verde bosque #1c4f32: navegacion, texto y seleccion.
- Crema #f8f4ec: fondo; blanco mate: superficies de trabajo.
- Mantequilla #ffd166: accion principal, texto verde oscuro.
- Lavanda #dfbfff, uva #9669c4, rosa #ffb4c8 y lima #c3ec9f: acentos acotados. Estados criticos conservan texto explicito y colores semanticos.
- Superficies con sombra baja desplazada, sin halo ni brillo. Radio 16px para fichas, 10px para controles. Controles secundarios con borde y sin sombra.

## Tipografia y controles
Nunito variable 400-900 para datos/formularios, Fredoka One 400 para titulo de seccion y marca. Ambas autoalojadas en WOFF2 latino, con licencias OFL. Importes con cifras tabulares. Botones primarios mantequilla, secundarios neutros, seleccion verde, eliminacion rosa con texto oscuro. Objetivos tactiles de al menos 44px en controles modificados.

## Ilustracion
Una mascota por seccion: Mugsy en Inicio, Crafty en Pedidos, Garabato en Cotizaciones, Estampilla en Inventario, Tago en Balance, Tote en Clientes y Ticker en Categorias. WebP originales del propietario con transparencia, sin superficies blancas ni marcos CSS. Las pantallas vacias de Balance conservan texto y acciones sin repetir Tago.

## Superficies
Inventario en tabla mantiene densidad y acciones; tarjetas destacan foto completa sin recorte, precio/costo y variantes. Kanban mantiene cliente/producto primero, entrega/saldo, nota crema y acciones existentes. Balance mantiene importes alineados y etiquetas legibles. Formularios, tabs y botones comparten css/bicho-brand.css en toda la aplicacion.

## Estados y limites
Tema oscuro con superficies verdes profundas y contraste claro. Foco uva, hover sin saltos, disabled visible, movimiento reducido respetado. No agregar confirmaciones, checklist ni requisitos para avanzar pedidos. Preservar configuracion de negocio, filtros, densidad y preferencia de tabla/tarjetas. Cache SW incluye tipografia/estilos e imagenes de marca. No SQL, autenticacion ni logica financiera modificados.


## Tabla y documentos - 2026-10-01
Tabla: folio secundario, cliente destacado y descripcion que permite varias lineas. Total/Cobrado/Saldo alineados; Pagado con texto ademas de color. Hoy/Manana/Vencido conserva fecha exacta. Acciones 2x2 estables, secundarias en Mas; columnas opcionales locales. Compacto reduce espacio sin esconder cliente/fecha/saldo. Busqueda y accion primaria fijas, tres filas compactas en movil. Formularios usan separadores suaves y detalles opcionales; muestras de color nunca reemplazan nombre/talla. Ticket/PDF/cotizacion/orden usan logo Bicho, Nunito, bosque/crema y totales legibles.


Operacion comercial: herramientas secundarias desde tabla/historial; dialogos nativos con bosque/crema, campos relacionados y botones consistentes. Apartados distinguidos con texto; capacidad informativa sin bloquear. Formularios de devolucion muestran diferencia de dinero antes de guardar. Controles tactiles de 44px, tabla de capacidad adaptable y foco visible.

Revision de molestias: selector de mes/resumen/exportacion de Balance se distribuyen en filas en movil, sin recorte. Flechas 44px, texto/superficie por tokens del tema. Botones secundarios y cierre de dialogos comparten estilo en claro/oscuro; controles nativos usan color-scheme oscuro. KPI financieros de Pedidos con separadores de miles. Sin cambios de identidad ni pasos de captura.


Fluidez2026-10-03: cliente/acciones fijados en tabla desde1100px, hover/foco suave y seleccion visible. Una accion crear en tabla; cobro mantiene resumen con lista desplegable. Movil densidad/columnas44px en segunda fila. Indicador de carga por tokens de tema, espacio reservado320px y fotos con dimensiones. No nueva identidad ni pasos obligatorios.
