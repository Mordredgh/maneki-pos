// ── Navegación entre secciones (extraído de reportes.js) ─────────────────
function showSection(sectionName) {
    localStorage.setItem('maneki_activeSection', sectionName);

    if (window._posSearchTimeout) { clearTimeout(window._posSearchTimeout); window._posSearchTimeout = null; }

    if (typeof window._mkMorphTo === 'function') window._mkMorphTo(sectionName);

    if (sectionName !== 'bienvenida' && window._bienvenidaClock) {
        clearInterval(window._bienvenidaClock); window._bienvenidaClock = null;
    }
    if (sectionName !== 'dashboard' && window._dashClock) {
        clearInterval(window._dashClock); window._dashClock = null;
    }

    document.querySelectorAll('main > section, section').forEach(s => {
        s.classList.add('hidden'); s.style.animation = '';
    });

    const target = document.getElementById(`${sectionName}-section`);
    if (target) {
        target.classList.remove('hidden');
        // Usar CSS animation-name:none + rAF en vez de void offsetWidth para evitar forced reflow
        target.style.animationName = 'none';
        requestAnimationFrame(() => {
            target.style.animationName = '';
            target.style.animation = 'mkSectionIn 0.38s cubic-bezier(0.16,1,0.3,1) both';
        });
    }

    // Hero moment del dashboard: solo al entrar a la sección, no en cada refresh de datos
    if (sectionName === 'dashboard' && typeof (window as any)._mkAnimateDashboardHero === 'function') {
        (window as any)._mkAnimateDashboardHero();
    }

    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    const sidebarBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (sidebarBtn) {
        sidebarBtn.classList.add('active');
        if (typeof (window as any)._mkMoveSidebarIndicator === 'function') {
            (window as any)._mkMoveSidebarIndicator(sidebarBtn);
        }
    }

    if (window.innerWidth < 768) document.getElementById('sidebar')?.classList.add('collapsed');

    if (sectionName === 'reportes') {
        salesHistoryPage = 1;
        const si = document.getElementById('salesSearchInput'); if (si) si.value = '';
        setTimeout(() => {
            if (typeof initCategoryChart === 'function') initCategoryChart();
            if (typeof renderSalesHistory === 'function') renderSalesHistory();
            if (typeof initComparativaMeses === 'function') initComparativaMeses();
            if (typeof initTopProductosChart === 'function') initTopProductosChart();
            if (typeof initMargenCategoriaChart === 'function') initMargenCategoriaChart();
        }, 150);
    }
    if (sectionName === 'analisis')   setTimeout(() => { if (typeof renderAnalisis === 'function') renderAnalisis(); }, 100);
    if (sectionName === 'equipos') {
        const pctInput = document.getElementById('roiPorcentajeGlobal');
        if (pctInput && typeof roiConfig !== 'undefined') pctInput.value = roiConfig.porcentaje;
        if (typeof renderEquiposGrid   === 'function') renderEquiposGrid();
        if (typeof renderRoiHistorial  === 'function') renderRoiHistorial();
        setTimeout(() => { if (typeof renderGraficaROI === 'function') renderGraficaROI(); }, 300);
    }
    if (sectionName === 'dashboard') {
        if (typeof window.updateDashboard === 'function') setTimeout(window.updateDashboard, 50);
        setTimeout(() => { if (typeof renderTopClientes === 'function') renderTopClientes(); }, 300);
        if (typeof window._mkAnimateKPIs === 'function') setTimeout(window._mkAnimateKPIs, 220);
    }
    if (sectionName === 'bienvenida') if (typeof renderBienvenida === 'function') renderBienvenida();
    if (sectionName === 'inventory') {
        setTimeout(() => { const s = document.getElementById('inventorySearch'); if (s) s.focus(); }, 200);
        if (typeof patchInventoryButtons === 'function') setTimeout(patchInventoryButtons, 100);
    }
    if (sectionName === 'clientes')   if (typeof renderClientsTable  === 'function') renderClientsTable();
    if (sectionName === 'categorias') if (typeof renderCategoriesGrid === 'function') renderCategoriesGrid();
    if (typeof window._mkUpdateBreadcrumb === 'function') window._mkUpdateBreadcrumb(sectionName);
    if (typeof window._lazyLoad === 'function') window._lazyLoad(sectionName);
}
window.showSection = showSection;
window.showSection._mk4 = true;

// Flush queue del stub definido en index.html
(function(){
    var realFn = showSection;
    var queue  = window._showSectionQueue || [];
    window._showSectionStub = false;
    if (queue.length) {
        var last = queue[queue.length - 1];
        try { realFn(last); } catch(e) {}
    }
    window._showSectionQueue = [];
})();

window.safeCall = function(fn, ...args) {
    if (typeof window[fn] === 'function') window[fn](...args);
    else document.addEventListener('DOMContentLoaded', () => { if (typeof window[fn] === 'function') window[fn](...args); });
};
