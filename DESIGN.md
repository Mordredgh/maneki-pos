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
Crafty acompana pedidos/cotizaciones y bienvenida; Estampilla acompana Inventario; Tago acompana categorias/Balance y estados vacios. Archivos originales del propietario, exportados a WebP de 240px (menos de 19KB en conjunto). Imagenes decorativas con alt vacio, sin interaccion ni animacion permanente.

## Superficies
Inventario en tabla mantiene densidad y acciones; tarjetas destacan foto completa sin recorte, precio/costo y variantes. Kanban mantiene cliente/producto primero, entrega/saldo, nota crema y acciones existentes. Balance mantiene importes alineados y etiquetas legibles. Formularios, tabs y botones comparten css/bicho-brand.css en toda la aplicacion.

## Estados y limites
Tema oscuro con superficies verdes profundas y contraste claro. Foco uva, hover sin saltos, disabled visible, movimiento reducido respetado. No agregar confirmaciones, checklist ni requisitos para avanzar pedidos. Preservar configuracion de negocio, filtros, densidad y preferencia de tabla/tarjetas. Cache SW incluye tipografia/estilos e imagenes de marca. No SQL, autenticacion ni logica financiera modificados.
