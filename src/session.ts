// ponytail: una ventana operativa por origen evita dos escritores de localStorage.
// Otros dispositivos necesitan control de concurrencia en el servidor.
(window as any)._posTabReady = new Promise<boolean>(resolve => {
    function blocked(message: string) {
        resolve(false);
        const show = () => {
            const panel = document.createElement('section');
            panel.id = 'pos-session-gate';
            panel.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fff;padding:48px;font:18px system-ui;color:#222';
            panel.textContent = message + ' Cierra la otra ventana y pulsa Recargar.';
            const button = document.createElement('button');
            button.textContent = 'Recargar';
            button.onclick = () => location.reload();
            panel.appendChild(button);
            const style = document.createElement('style');
            style.textContent='body > :not(#pos-session-gate){visibility:hidden!important} #pos-session-gate{visibility:visible!important}';
            panel.appendChild(style);
            // Inert conserva el DOM para los modulos de presentacion que ya cargaron.
            for (const child of Array.from(document.body.children)) (child as HTMLElement).inert = true;
            document.body.appendChild(panel);
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show, {once:true});
        else show();
    }
    if (!navigator.locks) {
        blocked('Este navegador no admite el bloqueo seguro del POS. Usa un navegador actualizado.');
        return;
    }
    navigator.locks.request('bicho-pos-writer', {ifAvailable:true}, lock => {
        if (!lock) { blocked('El POS ya esta abierto en otra ventana.'); return; }
        resolve(true);
        // El navegador libera el lock al cerrar; no liberar antes de terminar escrituras.
        return new Promise<void>(() => {});
    }).catch(() => blocked('No se pudo reservar una sesion segura del POS.'));
});
