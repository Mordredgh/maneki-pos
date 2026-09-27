# Pruebas aisladas

1. `npm ci`
2. `npm run build:cloudflare`
3. `npm run staging`
4. Abrir http://127.0.0.1:8978/

Usar un correo ficticio y cualquier contraseña ficticia si aparece el acceso. No introducir credenciales reales: la autenticacion esta simulada. El banner morado identifica las pruebas.

Una taza de $100 con 10 unidades y un cliente ficticio permiten probar alta, anticipo, cobro final, inventario y conflictos. La base es PostgreSQL en memoria mediante PGlite; cerrar el proceso borra solo esta base. La cola local del navegador sobrevive y puede reintentarse al abrir. No publicar este servidor.

Ejecutar `npm test` para regresiones, incluidas transacciones, UUID y reenvios. Ver limites en `../CONTEXT.md`.
