import { it, expect } from 'vitest';
import worker from '../cloudflare/auth-worker.mjs';

it('bloquea HTML y JavaScript sin credenciales antes de consultar los assets', async () => {
  const env = { POS_USER: 'usuario-prueba', POS_PASSWORD: 'clave-prueba',
    ASSETS: { fetch() { throw new Error('No debe servir assets'); } } };
  for (const path of ['/', '/js/core.bundle.js', '/sw.js']) {
    const response = await worker.fetch(new Request('https://pos.example' + path), env);
    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toContain('Basic');
    expect(response.headers.get('cache-control')).toContain('no-store');
  }
});

it('sirve assets solo con credenciales validas y evita cache publica', async () => {
  const env = { POS_USER: 'usuario-prueba', POS_PASSWORD: 'clave-prueba',
    ASSETS: { async fetch(req) {
      expect(req.headers.has('Authorization')).toBe(false);
      return new Response('POS protegido', { headers: { 'Content-Type': 'text/html' } });
    } } };
  const response = await worker.fetch(new Request('https://pos.example/', {
    headers: { Authorization: 'Basic ' + btoa('usuario-prueba:clave-prueba') }
  }), env);
  expect(response.status).toBe(200);
  expect(await response.text()).toBe('POS protegido');
  expect(response.headers.get('cache-control')).toBe('private, no-store');
});

it.each(['Basic %%%', 'Bearer cualquiera', 'Basic ' + btoa('usuario-prueba:incorrecta')])(
  'rechaza credenciales incorrectas o malformadas: %s', async authorization => {
    const response = await worker.fetch(new Request('https://pos.example/', {
      headers: { Authorization: authorization }
    }), { POS_USER: 'usuario-prueba', POS_PASSWORD: 'clave-prueba' });
    expect(response.status).toBe(401);
  });

it('queda cerrado si no se configuraron los secretos', async () => {
  expect((await worker.fetch(new Request('https://pos.example/'), {})).status).toBe(503);
});

it('redirige HTTP a HTTPS antes de pedir credenciales', async () => {
  const response = await worker.fetch(new Request('http://pos.example/'), {});
  expect(response.status).toBe(308);
  expect(response.headers.get('location')).toBe('https://pos.example/');
});
