(function() {
  "use strict";
  const _activated = /* @__PURE__ */ new Set();
  function _activate(sectionId) {
    if (_activated.has(sectionId)) return;
    const section = document.getElementById(sectionId);
    if (!section) return;
    const tpl = section.querySelector("template");
    if (!tpl) return;
    section.appendChild(tpl.content.cloneNode(true));
    tpl.remove();
    _activated.add(sectionId);
    if (sectionId === "configuracion-section") {
      if (typeof loadStoreConfigUI === "function") loadStoreConfigUI();
      if (typeof loadLogoUI === "function") loadLogoUI();
    }
  }
  window._mkActivateTemplate = _activate;
  const _poll = setInterval(() => {
    if (!window.showSection || !window.showSection._mk4) return;
    clearInterval(_poll);
    const _prev = window.showSection;
    window.showSection = function(name) {
      _activate(name + "-section");
      return _prev.apply(this, arguments);
    };
    window.showSection._mk4 = _prev._mk4;
  }, 150);
  setTimeout(() => clearInterval(_poll), 15e3);
})();
//# sourceMappingURL=templates.js.map
