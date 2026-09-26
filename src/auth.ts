async function requirePOSAdmin(client: any): Promise<boolean> {
    async function authorized(session: any) {
        if (!session?.user?.id) return false;
        // Offline conserva acceso al dispositivo ya autorizado; RLS decide cada peticion remota.
        if (!navigator.onLine) return localStorage.getItem('pos_verified_admin') === session.user.id;
        const {data,error} = await client.rpc('is_admin', {_user_id:session.user.id});
        if (error) throw new Error('No se pudo verificar el permiso. Revisa la conexion y vuelve a entrar.');
        if (data === true) {
            localStorage.setItem('pos_verified_admin', session.user.id);
            return true;
        }
        localStorage.removeItem('pos_verified_admin');
        return false;
    }
    try {
        const {data} = await client.auth.getSession();
        if (await authorized(data?.session)) return true;
    } catch (_) { /* Mostrar acceso; nunca cargar datos por fallo de autenticacion. */ }
    if (document.readyState === 'loading') await new Promise<void>(r => document.addEventListener('DOMContentLoaded',()=>r(),{once:true}));
    const hidden = Array.from(document.body.children).map(el => [el, (el as HTMLElement).inert] as const);
    hidden.forEach(([el]) => (el as HTMLElement).inert=true);
    const overlay = document.createElement('section');
    overlay.id='pos-auth-gate';
    overlay.style.cssText='position:fixed;inset:0;z-index:2147483646;background:#f8f4ec;display:grid;place-items:center;padding:24px;color:#241335;font:16px system-ui';
    overlay.innerHTML=`<style>body > :not(#pos-auth-gate){visibility:hidden!important} #pos-auth-gate{visibility:visible!important}</style><form style="background:white;padding:32px;border-radius:20px;max-width:420px;width:100%;display:grid;gap:16px">
      <h1 style="margin:0">Bicho Capricho</h1><p>Entra con tu cuenta administradora.</p>
      <label>Correo<input name="email" type="email" autocomplete="username" required style="display:block;width:100%;padding:12px"></label>
      <label>Contraseña<input name="password" type="password" autocomplete="current-password" required style="display:block;width:100%;padding:12px"></label>
      <p role="status" aria-live="polite"></p><button type="submit" style="padding:12px;background:#ffd166;border:0;border-radius:8px">Entrar</button>
    </form>`;
    document.body.appendChild(overlay);
    const form=overlay.querySelector('form')!;
    const status=overlay.querySelector('[role=status]')!;
    const button=overlay.querySelector('button')!;
    return new Promise(resolve => {
        form.addEventListener('submit',async event => {
            event.preventDefault();
            if(button.disabled)return;
            button.disabled=true; status.textContent='Comprobando acceso…';
            const password=form.elements.namedItem('password') as HTMLInputElement;
            try {
                const {data,error}=await client.auth.signInWithPassword({
                    email:(form.elements.namedItem('email') as HTMLInputElement).value.trim(), password:password.value
                });
                password.value='';
                if(error)throw new Error('No se pudo iniciar sesion. Comprueba correo y contraseña.');
                if(!await authorized(data?.session))throw new Error('Esta cuenta no tiene permiso de administrador.');
                overlay.remove(); hidden.forEach(([el,inert])=>(el as HTMLElement).inert=inert);
                resolve(true);
            } catch(e:any) { status.textContent=e.message || 'No se pudo iniciar sesion.'; }
            finally { button.disabled=false; }
        });
    });
}
