// ponytail: Basic Auth en el servidor; las credenciales solo viven en secretos de Pages.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol !== 'https:') {
      url.protocol = 'https:';
      return Response.redirect(url.href, 308);
    }
    if (!env.POS_USER || !env.POS_PASSWORD) {
      return new Response('Acceso pendiente de configuracion.', {
        status: 503, headers: { 'Cache-Control': 'no-store' }
      });
    }
    let supplied = '';
    const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(request.headers.get('Authorization') || '');
    try { if (match) supplied = atob(match[1]); } catch { /* Credencial invalida. */ }
    const encoder = new TextEncoder();
    const [actual, expected] = await Promise.all([supplied, env.POS_USER + ':' + env.POS_PASSWORD]
      .map(value => crypto.subtle.digest('SHA-256', encoder.encode(value))));
    const a = new Uint8Array(actual), b = new Uint8Array(expected);
    let difference = 0;
    for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
    if (difference !== 0) {
      return new Response('Se requiere usuario y contrasena.', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Bicho Capricho POS", charset="UTF-8"', 'Cache-Control': 'no-store' }
      });
    }
    const cleanRequest = new Request(request);
    cleanRequest.headers.delete('Authorization');
    const asset = await env.ASSETS.fetch(cleanRequest);
    const response = new Response(asset.body, asset);
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }
};
