// TEMP self-test for the upsert-sin-delete rule. Delete after verifying.
// Cases are padded apart by >12 lines so each one's context window is isolated.

function caseBuggyFilter(x: string) {
    incomes = incomes.filter(i => String(i.id) !== x);  // BUG: no delete → should FLAG
    window.incomes = incomes;
    saveIncomes();
    renderBalance();
    updateDashboard();
}
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
function caseBuggySplice(idx: number) {
    window.pedidos.splice(idx, 1);  // BUG: no delete → should FLAG
    savePedidos();
    renderPedidosTable();
}
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
function caseOkWithDelete(x: string) {
    clients = clients.filter(c => String(c.id) !== x);  // OK: delete below
    saveClients();
    if (typeof (window as any).deleteClientFromDB === 'function') (window as any).deleteClientFromDB(x);
}
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
function caseOkBatched(p: any, _idsFinalizadosLote: string[]) {
    _idsFinalizadosLote.push(String(p.id));
    window.pedidosFinalizados.splice(0, 1);  // OK: id collected for batch delete
    savePedidosFinalizados();
}
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
function caseOkEscape(x: string) {
    expenses = expenses.filter(e => String(e.id) !== x); // footgun-ok: self-test escape
    saveExpenses();
}
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
// pad ───────────────────────────────────────
function caseReadNotFlagged(x: string) {
    const ids = salesHistory.filter(s => s.id === x).map(s => s.id);  // OK: read, not reassign
    return ids;
}
