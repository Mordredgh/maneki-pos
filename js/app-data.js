function _validateImgUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (!["https:", "http:", "blob:", "data:"].includes(u.protocol)) return "";
    return url;
  } catch {
    return url.startsWith("data:image/") ? url : "";
  }
}
const defaultCategories = [
  { id: "tazas", name: "Tazas", emoji: "\u2615" },
  { id: "llaveros", name: "Llaveros", emoji: "\u{1F511}" },
  { id: "libretas", name: "Libretas", emoji: "\u{1F4D3}" },
  { id: "peluches", name: "Peluches", emoji: "\u{1F9F8}" },
  { id: "otros", name: "Otros", emoji: "\u{1F381}" }
];
let categories = [];
let products = [];
let clients = [];
let salesHistory = [];
let quotes = [];
let incomes = [];
let expenses = [];
let receivables = [];
let payables = [];
let categoryChart = null;
let salesWeekChart = null;
let currentVariants = [];
let currentProductImage = null;
let currentProductImageFile = null;
let currentQuoteProducts = [];
function deleteBalanceItem(type, id) {
  showConfirm("Este registro ser\xE1 eliminado. Esta acci\xF3n no se puede deshacer.", "\u26A0\uFE0F Eliminar registro").then((ok) => {
    if (!ok) return;
    if (type === "income") {
      incomes = incomes.filter((i) => String(i.id) !== String(id));
      saveIncomes();
    } else if (type === "expense") {
      expenses = expenses.filter((e) => String(e.id) !== String(id));
      saveExpenses();
    }
    renderBalance();
    updateDashboard();
  });
}
function editBalanceItem(type, id) {
  const list = type === "income" ? incomes : expenses;
  const item = list.find((i) => String(i.id) === String(id));
  if (!item) return;
  const typeMap = {
    income: "income",
    expense: "expense"
  };
  document.getElementById("transactionType").value = typeMap[type];
  document.getElementById("transactionModalTitle").textContent = type === "income" ? "Editar Ingreso" : "Editar Egreso";
  document.getElementById("transactionConcept").value = item.concept || item.concepto || "";
  document.getElementById("transactionAmount").value = item.amount || item.monto || 0;
  document.getElementById("transactionDate").value = item.date || item.fecha || "";
  const clientField = document.getElementById("clientFieldContainer");
  const clientInput = document.getElementById("transactionClient");
  if (clientField) clientField.classList.remove("hidden");
  if (clientInput) clientInput.value = item.client || item.cliente || "";
  const editModal = document.getElementById("transactionModal");
  editModal.dataset.editId = id;
  editModal.dataset.editType = type;
  const submitBtn = document.getElementById("transactionSubmitBtn");
  if (submitBtn) submitBtn.textContent = "\u{1F4BE} Actualizar";
  openModal(editModal);
}
function closeTransactionModal() {
  const modal = document.getElementById("transactionModal");
  closeModal(modal);
  modal.dataset.editId = "";
  modal.dataset.editType = "";
  document.getElementById("transactionForm").reset();
}
let pedidoACancelar = null;
function openCancelPedidoModal(pedidoId) {
  const pedido = pedidos.find((p) => p.id === pedidoId);
  if (!pedido) return;
  pedidoACancelar = pedidoId;
  document.getElementById("cancelPedidoFolio").textContent = pedido.folio || "\u2014";
  document.getElementById("cancelPedidoCliente").textContent = `Cliente: ${pedido.cliente || "\u2014"} \xB7 Total: $${(pedido.total || 0).toFixed(2)}`;
  document.getElementById("cancelMotivo").value = "";
  openModal("cancelPedidoModal");
}
function closeCancelPedidoModal() {
  pedidoACancelar = null;
  closeModal("cancelPedidoModal");
}
function confirmarCancelPedido() {
  const pedido = pedidos.find((p) => p.id === pedidoACancelar);
  if (!pedido) return;
  const motivo = document.getElementById("cancelMotivo").value.trim();
  const fecha = typeof _fechaHoy === "function" ? _fechaHoy() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const hora = (/* @__PURE__ */ new Date()).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const cancelacion = {
    id: mkId(),
    tipo: "cancelacion_pedido",
    folio: pedido.folio,
    cliente: pedido.cliente,
    concepto: pedido.concepto,
    total: pedido.total,
    anticipo: pedido.anticipo || 0,
    motivo: motivo || "Sin motivo especificado",
    fecha,
    hora
  };
  salesHistory.push({
    id: mkId(),
    folio: pedido.folio + "-CANCEL",
    date: fecha,
    time: hora,
    customer: pedido.cliente || "\u2014",
    concept: "\u274C Cancelaci\xF3n: " + (pedido.concepto || ""),
    note: "Motivo: " + (motivo || "Sin motivo especificado"),
    products: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    method: "Cancelado",
    cancelacion
  });
  saveSalesHistory();
  if (typeof _allVentasCache !== "undefined") _allVentasCache = null;
  const tieneProductos = pedido.productosInventario && pedido.productosInventario.length > 0;
  function _ejecutarCancelacion(regresarStock) {
    if (regresarStock) {
      pedido.productosInventario.forEach(function(item) {
        const prod = products.find(function(p) {
          return String(p.id) === String(item.id);
        });
        if (prod) prod.stock += item.quantity;
      });
      saveProducts();
      renderInventoryTable();
    }
    pedidos = pedidos.filter(function(p) {
      return p.id !== pedidoACancelar;
    });
    savePedidos();
    limpiarRoiDePedido(pedidoACancelar);
    closeCancelPedidoModal();
    renderPedidosTable();
    updateDashboard();
    const msgStock = regresarStock ? " \u2705 Stock regresado al inventario." : tieneProductos ? " \u26A0\uFE0F Stock NO regresado (producto ya terminado)." : "";
    manekiToastExport("\u2705 Pedido " + pedido.folio + " cancelado." + msgStock, "ok");
  }
  if (tieneProductos) {
    const lista = pedido.productosInventario.map(function(i) {
      return i.name + " x" + i.quantity;
    }).join(", ");
    showConfirm("\xBFRegresar productos al inventario?\n(" + lista + ")\n\nAceptar = NO est\xE1 hecho, regresa al stock.\nCancelar = ya terminado.", "\xBFRegresar stock?").then(function(regresar) {
      _ejecutarCancelacion(regresar);
    });
  } else {
    _ejecutarCancelacion(false);
  }
}
let storeLogo = null;
function switchLogoTab(tab) {
  storeConfig.logoMode = "image";
  updateStorePreview();
}
async function handleLogoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 6e5) {
    manekiToastExport("La imagen es muy grande. Por favor usa una imagen menor a 500kb.", "err");
    return;
  }
  const previewUrl = URL.createObjectURL(file);
  const container = document.getElementById("logoPreviewContainer");
  container.innerHTML = `<img src="${_validateImgUrl(previewUrl)}" class="w-full h-full object-contain rounded-xl">`;
  document.getElementById("removeLogoBtn").classList.remove("hidden");
  try {
    const ext = file.name.split(".").pop();
    const fileName = `logo_tienda.${ext}`;
    const { data, error } = await db.storage.from("product-images").upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = db.storage.from("product-images").getPublicUrl(fileName);
    storeLogo = urlData.publicUrl;
  } catch (e) {
    console.warn("Storage no disponible, guardando logo localmente:", e);
    storeLogo = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.readAsDataURL(file);
    });
  }
  storeConfig.logo = storeLogo;
  updateStorePreview();
}
function removeLogo() {
  storeLogo = null;
  storeConfig.logo = null;
  document.getElementById("logoPreviewContainer").innerHTML = '<span class="text-gray-300 text-xs text-center">Sin logo</span>';
  document.getElementById("removeLogoBtn").classList.add("hidden");
  document.getElementById("logoFileInput").value = "";
  updateStorePreview();
}
function loadLogoUI() {
  storeConfig.logoMode = "image";
  if (storeConfig.logo) {
    storeLogo = storeConfig.logo;
    const container = document.getElementById("logoPreviewContainer");
    if (container) {
      container.innerHTML = `<img src="${_validateImgUrl(storeLogo)}" class="w-full h-full object-contain rounded-xl">`;
      document.getElementById("removeLogoBtn")?.classList.remove("hidden");
    }
  }
  updateStorePreview();
}
const emojiCategories = [
  {
    label: "\u{1F381} Regalos y accesorios",
    emojis: ["\u{1F381}", "\u{1F380}", "\u{1F38A}", "\u{1F389}", "\u{1F388}", "\u{1F9E7}", "\u{1F49D}", "\u{1F496}", "\u{1F497}", "\u{1F493}", "\u{1F49E}", "\u{1F495}", "\u{1F397}\uFE0F", "\u{1F6CD}\uFE0F", "\u{1F45C}", "\u{1F45B}", "\u{1F48D}", "\u{1F48E}", "\u{1F4FF}", "\u{1FAAC}"]
  },
  {
    label: "\u{1F43E} Animales",
    emojis: ["\u{1F431}", "\u{1F436}", "\u{1F430}", "\u{1F43B}", "\u{1F43C}", "\u{1F428}", "\u{1F98A}", "\u{1F438}", "\u{1F419}", "\u{1F98B}", "\u{1F41D}", "\u{1F984}", "\u{1F42F}", "\u{1F981}", "\u{1F42E}", "\u{1F437}", "\u{1F427}", "\u{1F986}", "\u{1F43A}", "\u{1F99D}"]
  },
  {
    label: "\u2615 Hogar y cocina",
    emojis: ["\u2615", "\u{1F375}", "\u{1F9C1}", "\u{1F382}", "\u{1F370}", "\u{1F369}", "\u{1F9C7}", "\u{1FAD6}", "\u{1F942}", "\u{1F377}", "\u{1FAD9}", "\u{1F376}", "\u{1F95B}", "\u{1F9C3}", "\u{1FAB4}", "\u{1F56F}\uFE0F", "\u{1FA94}", "\u{1FAD7}", "\u{1F37D}\uFE0F", "\u{1F944}"]
  },
  {
    label: "\u{1F457} Moda y ropa",
    emojis: ["\u{1F457}", "\u{1F458}", "\u{1F97B}", "\u{1F459}", "\u{1F452}", "\u{1F3A9}", "\u{1F45F}", "\u{1F460}", "\u{1F461}", "\u{1F9E3}", "\u{1F9E4}", "\u{1F9E5}", "\u{1F454}", "\u{1F455}", "\u{1FA71}", "\u{1FA72}", "\u{1FA73}", "\u{1F9E6}", "\u{1FA96}", "\u{1F484}"]
  },
  {
    label: "\u{1F4DA} Papeler\xEDa y arte",
    emojis: ["\u{1F4DA}", "\u{1F4D3}", "\u{1F4D2}", "\u{1F4D4}", "\u{1F4D5}", "\u{1F4D7}", "\u{1F4D8}", "\u{1F4D9}", "\u{1F4DD}", "\u270F\uFE0F", "\u{1F58A}\uFE0F", "\u{1F58C}\uFE0F", "\u{1F3A8}", "\u{1F58D}\uFE0F", "\u{1F4D0}", "\u{1F4CF}", "\u2702\uFE0F", "\u{1F5C2}\uFE0F", "\u{1F4CC}", "\u{1F516}"]
  },
  {
    label: "\u{1F9F8} Juguetes y beb\xE9s",
    emojis: ["\u{1F9F8}", "\u{1FA86}", "\u{1F3AE}", "\u{1F3AF}", "\u{1F3B2}", "\u{1FA80}", "\u{1FA81}", "\u{1F9E9}", "\u{1F3A0}", "\u{1F3A1}", "\u{1FA84}", "\u{1F3AD}", "\u{1FA85}", "\u{1F6F9}", "\u{1F938}", "\u{1F9D2}", "\u{1F476}", "\u{1F37C}", "\u{1F9F7}", "\u{1FA83}"]
  },
  {
    label: "\u{1F486} Bienestar y spa",
    emojis: ["\u{1F486}", "\u{1F9D8}", "\u{1F6C1}", "\u{1FAB7}", "\u{1F338}", "\u{1F33A}", "\u{1F33B}", "\u{1F339}", "\u{1F490}", "\u{1F343}", "\u{1F33F}", "\u{1F331}", "\u{1FAE7}", "\u{1F9F4}", "\u{1F9FC}", "\u{1F485}", "\u{1F48A}", "\u{1FA7A}", "\u{1FAC1}", "\u{1FABD}"]
  },
  {
    label: "\u{1F3E0} Casa y decoraci\xF3n",
    emojis: ["\u{1F3E0}", "\u{1F6CB}\uFE0F", "\u{1FA91}", "\u{1F6CF}\uFE0F", "\u{1FA9E}", "\u{1F5BC}\uFE0F", "\u{1FA9F}", "\u{1F6AA}", "\u{1F9F9}", "\u{1FAA3}", "\u{1FAA4}", "\u{1F4A1}", "\u{1F526}", "\u{1FA94}", "\u23F0", "\u{1F4E6}", "\u{1F5D1}\uFE0F", "\u{1FAA3}", "\u{1F9FA}", "\u{1FAB4}"]
  },
  {
    label: "\u2B50 Estrellas y s\xEDmbolos",
    emojis: ["\u2B50", "\u{1F31F}", "\u2728", "\u{1F4AB}", "\u{1F308}", "\u2600\uFE0F", "\u{1F319}", "\u2744\uFE0F", "\u{1F525}", "\u{1F4A7}", "\u{1F30A}", "\u{1F340}", "\u{1F33A}", "\u{1F338}", "\u{1F33C}", "\u{1F33B}", "\u{1F98B}", "\u{1F30D}", "\u{1F3B5}", "\u{1F3B6}"]
  },
  {
    label: "\u{1F511} Objetos variados",
    emojis: ["\u{1F511}", "\u{1F5DD}\uFE0F", "\u{1F4F7}", "\u{1F4F8}", "\u{1F399}\uFE0F", "\u{1F4F1}", "\u{1F4BB}", "\u231A", "\u{1F52E}", "\u{1FA84}", "\u{1F9F2}", "\u{1F527}", "\u{1FA9B}", "\u2699\uFE0F", "\u{1F529}", "\u{1F9F0}", "\u{1F4E6}", "\u{1F5C3}\uFE0F", "\u{1FA9D}", "\u{1F3AA}"]
  }
];
let allEmojis = emojiCategories.flatMap((cat) => cat.emojis.map((e) => ({ emoji: e, label: cat.label })));
function renderEmojiGrid(filter = "") {
  const grid = document.getElementById("emojiGrid");
  if (!grid) return;
  const q = filter.toLowerCase().trim();
  if (q) {
    const keywords = {
      "regalo": ["\u{1F381}", "\u{1F380}", "\u{1F38A}", "\u{1F389}", "\u{1F49D}", "\u{1F6CD}\uFE0F"],
      "caja": ["\u{1F4E6}", "\u{1F5C3}\uFE0F"],
      "gato": ["\u{1F431}"],
      "perro": ["\u{1F436}"],
      "conejo": ["\u{1F430}"],
      "ropa": ["\u{1F457}", "\u{1F458}", "\u{1F455}", "\u{1F454}", "\u{1F9E5}"],
      "taza": ["\u2615", "\u{1F375}", "\u{1FAD6}"],
      "libro": ["\u{1F4DA}", "\u{1F4D3}", "\u{1F4D2}", "\u{1F4D4}"],
      "bebe": ["\u{1F476}", "\u{1F37C}", "\u{1F9F8}", "\u{1F9F7}"],
      "beb\xE9": ["\u{1F476}", "\u{1F37C}", "\u{1F9F8}", "\u{1F9F7}"],
      "flor": ["\u{1F338}", "\u{1F33A}", "\u{1F33B}", "\u{1F339}", "\u{1F490}", "\u{1F33C}"],
      "estrella": ["\u2B50", "\u{1F31F}", "\u2728", "\u{1F4AB}"],
      "corazon": ["\u{1F49D}", "\u{1F496}", "\u{1F497}", "\u{1F493}", "\u{1F49E}", "\u{1F495}"],
      "coraz\xF3n": ["\u{1F49D}", "\u{1F496}", "\u{1F497}", "\u{1F493}", "\u{1F49E}", "\u{1F495}"],
      "joya": ["\u{1F48D}", "\u{1F48E}", "\u{1F4FF}"],
      "joyeria": ["\u{1F48D}", "\u{1F48E}", "\u{1F4FF}"],
      "joyer\xEDa": ["\u{1F48D}", "\u{1F48E}", "\u{1F4FF}"],
      "spa": ["\u{1F486}", "\u{1F9D8}", "\u{1F6C1}", "\u{1FAB7}", "\u{1F33F}"],
      "juguete": ["\u{1F9F8}", "\u{1FA86}", "\u{1F3AE}", "\u{1F3AF}", "\u{1F3B2}"],
      "arte": ["\u{1F3A8}", "\u{1F58C}\uFE0F", "\u270F\uFE0F", "\u{1F58D}\uFE0F"]
    };
    let found = [];
    Object.entries(keywords).forEach(([key, emojis]) => {
      if (key.includes(q) || q.includes(key)) found.push(...emojis);
    });
    if (found.length === 0) found = allEmojis.map((e) => e.emoji);
    grid.innerHTML = `
            <div class="flex flex-wrap gap-2">
                ${[...new Set(found)].map((e) => `
                    <button type="button" onclick="selectEmoji('${e}')"
                            class="emoji-btn w-10 h-10 text-2xl rounded-lg hover:bg-yellow-50 hover:scale-125 transition-all flex items-center justify-center">
                        ${e}
                    </button>
                `).join("")}
            </div>
        `;
    return;
  }
  grid.innerHTML = emojiCategories.map((cat) => `
        <div class="mb-3">
            <p class="text-xs font-semibold text-gray-400 mb-2">${cat.label}</p>
            <div class="flex flex-wrap gap-1">
                ${cat.emojis.map((e) => `
                    <button type="button" onclick="selectEmoji('${e}')"
                            class="emoji-btn w-9 h-9 text-xl rounded-lg hover:bg-yellow-50 hover:scale-125 transition-all flex items-center justify-center">
                        ${e}
                    </button>
                `).join("")}
            </div>
        </div>
    `).join("");
}
function selectEmoji(emoji) {
  document.getElementById("categoryEmoji").value = emoji;
  document.getElementById("selectedEmojiDisplay").textContent = emoji;
  document.querySelectorAll(".emoji-btn").forEach((btn) => {
    btn.style.background = btn.textContent.trim() === emoji ? "#FFF9F0" : "";
    btn.style.border = btn.textContent.trim() === emoji ? "2px solid #C5A572" : "";
  });
}
function filterEmojis(value) {
  renderEmojiGrid(value);
}
const equipoEmojiCats = [
  {
    label: "\u{1F5A8}\uFE0F Impresi\xF3n",
    emojis: ["\u{1F5A8}\uFE0F", "\u{1F4E0}", "\u{1F5A5}\uFE0F", "\u{1F4BB}", "\u{1F4F1}", "\u{1F4F7}", "\u{1F4F8}", "\u{1F39E}\uFE0F", "\u{1F5C3}\uFE0F", "\u{1F4CB}", "\u{1F5C4}\uFE0F", "\u{1F5B1}\uFE0F", "\u2328\uFE0F", "\u{1F5B2}\uFE0F"]
  },
  {
    label: "\u2699\uFE0F Herramientas y m\xE1quinas",
    emojis: ["\u2699\uFE0F", "\u{1F527}", "\u{1FA9B}", "\u{1F529}", "\u{1F9F0}", "\u{1F528}", "\u{1FA9A}", "\u26CF\uFE0F", "\u{1FA9D}", "\u{1FAA4}", "\u{1F9F2}", "\u{1F52C}", "\u{1F52D}", "\u2697\uFE0F", "\u{1F9EA}", "\u{1F50B}", "\u{1F4A1}", "\u{1F50C}", "\u{1FAAB}", "\u{1F6E0}\uFE0F"]
  },
  {
    label: "\u2702\uFE0F Corte y dise\xF1o",
    emojis: ["\u2702\uFE0F", "\u{1FAA1}", "\u{1F9F5}", "\u{1F4D0}", "\u{1F4CF}", "\u{1F58A}\uFE0F", "\u{1F58C}\uFE0F", "\u270F\uFE0F", "\u{1F3A8}", "\u{1F58D}\uFE0F", "\u{1F4CC}", "\u{1F5C2}\uFE0F", "\u{1F4CE}", "\u{1F58B}\uFE0F", "\u2712\uFE0F"]
  },
  {
    label: "\u{1F525} Calor y prensado",
    emojis: ["\u{1F525}", "\u2668\uFE0F", "\u{1F321}\uFE0F", "\u{1F4A8}", "\u26A1", "\u2600\uFE0F", "\u{1F30A}", "\u2744\uFE0F", "\u{1F4A7}", "\u{1FAE7}", "\u{1F32C}\uFE0F"]
  },
  {
    label: "\u{1F916} Tecnolog\xEDa",
    emojis: ["\u{1F916}", "\u{1F4BE}", "\u{1F4BF}", "\u{1F4C0}", "\u{1F5A7}", "\u{1F4E1}", "\u{1F6F0}\uFE0F", "\u{1F510}", "\u{1F511}", "\u{1F5DD}\uFE0F", "\u{1F4DF}", "\u{1F4E0}", "\u231A", "\u{1F579}\uFE0F", "\u{1F3AE}"]
  },
  {
    label: "\u{1F4E6} Producci\xF3n",
    emojis: ["\u{1F4E6}", "\u{1F3ED}", "\u{1F3D7}\uFE0F", "\u{1F69C}", "\u{1F504}", "\u267B\uFE0F", "\u{1F4E4}", "\u{1F4E5}", "\u{1FAA3}", "\u{1F5D1}\uFE0F", "\u{1F4CA}", "\u{1F4C8}", "\u{1F4C9}", "\u{1F5FA}\uFE0F", "\u{1F4CD}"]
  }
];
const allEquipoEmojis = equipoEmojiCats.flatMap((cat) => cat.emojis);
function renderEquipoEmojiGrid(filter = "") {
  const grid = document.getElementById("equipoEmojiGrid");
  if (!grid) return;
  const q = filter.toLowerCase().trim();
  const equipoKeywords = {
    "impresora": ["\u{1F5A8}\uFE0F", "\u{1F4E0}"],
    "laser": ["\u{1F52C}", "\u26A1", "\u{1F4A1}", "\u{1F525}"],
    "cricut": ["\u2702\uFE0F", "\u{1FAA1}", "\u{1F58A}\uFE0F"],
    "plancha": ["\u{1F525}", "\u2668\uFE0F", "\u{1F321}\uFE0F"],
    "prensa": ["\u{1F527}", "\u2699\uFE0F", "\u{1F6E0}\uFE0F"],
    "dtf": ["\u{1F5A8}\uFE0F", "\u{1F525}", "\u2668\uFE0F"],
    "sublimacion": ["\u{1F5A8}\uFE0F", "\u2668\uFE0F", "\u{1F525}"],
    "sublimaci\xF3n": ["\u{1F5A8}\uFE0F", "\u2668\uFE0F", "\u{1F525}"],
    "laminadora": ["\u{1F4CB}", "\u{1F5C3}\uFE0F", "\u2699\uFE0F"],
    "3d": ["\u{1F916}", "\u2699\uFE0F", "\u{1F527}"],
    "rotador": ["\u{1F504}", "\u2699\uFE0F"],
    "atomstack": ["\u{1F52C}", "\u26A1", "\u{1F4A1}"],
    "mini": ["\u2699\uFE0F", "\u{1F527}"],
    "cpu": ["\u{1F4BB}", "\u{1F5A5}\uFE0F", "\u{1F5B1}\uFE0F"],
    "computadora": ["\u{1F4BB}", "\u{1F5A5}\uFE0F"],
    "herramienta": ["\u{1F527}", "\u{1FA9B}", "\u{1F6E0}\uFE0F", "\u{1F9F0}"],
    "corte": ["\u2702\uFE0F", "\u{1FA9A}"],
    "calor": ["\u{1F525}", "\u2668\uFE0F"],
    "maquina": ["\u2699\uFE0F", "\u{1F3ED}", "\u{1F916}"],
    "m\xE1quina": ["\u2699\uFE0F", "\u{1F3ED}", "\u{1F916}"]
  };
  if (q) {
    let found = [];
    Object.entries(equipoKeywords).forEach(([key, emojis]) => {
      if (key.includes(q) || q.includes(key)) found.push(...emojis);
    });
    if (found.length === 0) found = allEquipoEmojis;
    const unique = [...new Set(found)];
    grid.innerHTML = `<div class="flex flex-wrap gap-1">${unique.map((e) => `
            <button type="button" onclick="selectEquipoEmoji('${e}')"
                    class="equipo-emoji-btn w-9 h-9 text-xl rounded-lg hover:bg-amber-50 hover:scale-125 transition-all flex items-center justify-center">
                ${e}
            </button>`).join("")}</div>`;
    return;
  }
  grid.innerHTML = equipoEmojiCats.map((cat) => `
        <div class="mb-2">
            <p class="text-xs font-semibold text-gray-400 mb-1">${cat.label}</p>
            <div class="flex flex-wrap gap-1">
                ${cat.emojis.map((e) => `
                    <button type="button" onclick="selectEquipoEmoji('${e}')"
                            class="equipo-emoji-btn w-9 h-9 text-xl rounded-lg hover:bg-amber-50 hover:scale-125 transition-all flex items-center justify-center">
                        ${e}
                    </button>`).join("")}
            </div>
        </div>`).join("");
}
function selectEquipoEmoji(emoji) {
  document.getElementById("equipoEmoji").value = emoji;
  const display = document.getElementById("equipoEmojiDisplay");
  if (display) display.textContent = emoji;
  document.querySelectorAll(".equipo-emoji-btn").forEach((btn) => {
    const isSelected = btn.textContent.trim() === emoji;
    btn.style.background = isSelected ? "#FFF9F0" : "";
    btn.style.border = isSelected ? "2px solid #C5A572" : "";
  });
}
function filterEquipoEmojis(value) {
  renderEquipoEmojiGrid(value);
}
const _origOpenAddCategoryModal = typeof openAddCategoryModal === "function" ? openAddCategoryModal : null;
function openAddCategoryModal() {
  openModal("addCategoryModal");
  document.getElementById("categoryEmoji").value = "\u{1F4E6}";
  document.getElementById("selectedEmojiDisplay").textContent = "\u{1F4E6}";
  document.getElementById("emojiSearch").value = "";
  document.getElementById("categoryColor").value = "#C5A572";
  setTimeout(() => selectCategoryColor("#C5A572"), 50);
  renderEmojiGrid();
}
function refrescarPagina() {
  const icon = document.getElementById("iconRefrescar");
  if (icon) {
    icon.style.transition = "transform 0.6s ease";
    icon.style.transform = "rotate(360deg)";
    setTimeout(() => {
      icon.style.transform = "";
    }, 650);
  }
  const seccion = localStorage.getItem("maneki_activeSection") || "bienvenida";
  try {
    if (seccion === "dashboard") {
      updateDashboard();
      initChart();
    } else if (seccion === "inventory") {
      renderInventoryTable();
    } else if (seccion === "pedidos") {
      renderPedidosTable();
    } else if (seccion === "balance") {
      renderBalance && renderBalance();
    } else if (seccion === "clientes") {
      renderClientsTable && renderClientsTable();
    } else if (seccion === "categorias") {
      renderCategoriesGrid && renderCategoriesGrid();
    } else if (seccion === "analisis") {
      renderAnalisis && renderAnalisis();
    } else if (seccion === "reportes") {
      renderSalesHistory && renderSalesHistory();
      initCategoryChart && initCategoryChart();
    } else if (seccion === "equipos") {
      renderEquiposGrid();
      renderRoiHistorial();
    }
    manekiToastExport("\u{1F504} P\xE1gina refrescada", "ok");
  } catch (e) {
    location.reload();
  }
}
let darkMode = false;
function toggleDarkMode() {
  darkMode = !darkMode;
  applyDarkMode(darkMode);
  localStorage.setItem("maneki_darkMode", darkMode ? "1" : "0");
}
function applyDarkMode(enabled) {
  const body = document.body;
  const icon = document.getElementById("darkModeIcon");
  const btn = document.getElementById("darkModeBtn");
  if (enabled) {
    body.classList.add("dark");
    if (icon) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    }
    if (btn) btn.title = "Modo claro";
  } else {
    body.classList.remove("dark");
    if (icon) {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
    if (btn) btn.title = "Modo oscuro";
  }
}
(function() {
  const saved = localStorage.getItem("maneki_darkMode");
  if (saved === "1") {
    darkMode = true;
    document.addEventListener("DOMContentLoaded", () => applyDarkMode(true));
  }
})();
const themes = {
  dorado: {
    primary: "#C5A572",
    primaryDark: "#B8965F",
    primaryLight: "#FFF9F0",
    secondary: "#D8BFD8",
    secondaryLight: "#E6D5E6",
    accent: "#C5A572",
    sidebarBg: "linear-gradient(180deg, #FFFFFF 0%, #FAF9F7 100%)",
    borderColor: "#C5A572"
  },
  rosas: {
    primary: "#E91E8C",
    primaryDark: "#C2177A",
    primaryLight: "#FFF0F5",
    secondary: "#FFB6C1",
    secondaryLight: "#FFE4EC",
    accent: "#E91E8C",
    sidebarBg: "linear-gradient(180deg, #FFFFFF 0%, #FFF5F8 100%)",
    borderColor: "#E91E8C"
  },
  morado: {
    primary: "#7C3AED",
    primaryDark: "#6D28D9",
    primaryLight: "#F5F3FF",
    secondary: "#C4B5FD",
    secondaryLight: "#EDE9FE",
    accent: "#7C3AED",
    sidebarBg: "linear-gradient(180deg, #FFFFFF 0%, #FAF8FF 100%)",
    borderColor: "#7C3AED"
  },
  verde: {
    primary: "#059669",
    primaryDark: "#047857",
    primaryLight: "#ECFDF5",
    secondary: "#A7F3D0",
    secondaryLight: "#D1FAE5",
    accent: "#059669",
    sidebarBg: "linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)",
    borderColor: "#059669"
  },
  azul: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    primaryLight: "#EFF6FF",
    secondary: "#BFDBFE",
    secondaryLight: "#DBEAFE",
    accent: "#2563EB",
    sidebarBg: "linear-gradient(180deg, #FFFFFF 0%, #F0F7FF 100%)",
    borderColor: "#2563EB"
  },
  coral: {
    primary: "#F97316",
    primaryDark: "#EA6C0A",
    primaryLight: "#FFF7ED",
    secondary: "#FED7AA",
    secondaryLight: "#FFEDD5",
    accent: "#F97316",
    sidebarBg: "linear-gradient(180deg, #FFFFFF 0%, #FFFAF5 100%)",
    borderColor: "#F97316"
  }
};
let currentTheme = "dorado";
function selectTheme(themeName) {
  currentTheme = themeName;
  applyTheme(themeName);
  document.querySelectorAll(".theme-option").forEach((el) => {
    el.classList.remove("active");
    el.style.borderColor = "#E5E7EB";
    el.style.background = "white";
  });
  const selected = document.querySelector(`[data-theme="${themeName}"]`);
  if (selected) {
    selected.classList.add("active");
    selected.style.borderColor = themes[themeName].primary;
    selected.style.background = themes[themeName].primaryLight;
  }
  storeConfig.theme = themeName;
  sbSave("storeConfig", storeConfig).then(() => manekiToastExport("Tema guardado en la nube \u2713", "ok")).catch(() => manekiToastExport("Error al guardar en la nube", "err"));
}
function applyTheme(themeName) {
  const t = themes[themeName];
  if (!t) return;
  const root = document.documentElement;
  root.style.setProperty("--color-gold", t.primary);
  root.style.setProperty("--color-purple", t.secondary);
  root.style.setProperty("--color-light-purple", t.secondaryLight);
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.background = t.sidebarBg;
  let styleEl = document.getElementById("dynamicTheme");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "dynamicTheme";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
        .sidebar-item.active {
            background: linear-gradient(135deg, ${t.primary} 0%, ${t.primaryDark} 100%) !important;
            color: white !important;
        }
        .sidebar-item:hover {
            background: ${t.primaryLight} !important;
        }
        .btn-primary {
            background: linear-gradient(135deg, ${t.primary} 0%, ${t.primaryDark} 100%) !important;
        }
        .btn-primary:hover {
            box-shadow: 0 8px 16px ${t.primary}66 !important;
        }
        .stat-card:hover {
            box-shadow: 0 12px 24px ${t.primary}33 !important;
        }
        .product-card:hover {
            box-shadow: 0 8px 16px ${t.primary}4D !important;
        }
        #dashGoalBar {
            background: linear-gradient(90deg, ${t.primary}, ${t.primaryDark}) !important;
        }
        input:focus, textarea:focus, select:focus {
            ring-color: ${t.primary} !important;
            border-color: ${t.primary} !important;
            box-shadow: 0 0 0 2px ${t.primary}33 !important;
        }
        [style*="color: #C5A572"], [style*="color:#C5A572"] {
            color: ${t.primary} !important;
        }
        [style*="background: #E6D5E6"], [style*="background:#E6D5E6"] {
            background: ${t.secondaryLight} !important;
        }
        [style*="background: #FFF9F0"], [style*="background:#FFF9F0"] {
            background: ${t.primaryLight} !important;
        }
        [style*="border-color: #C5A572"], [style*="border-color:#C5A572"] {
            border-color: ${t.primary} !important;
        }
        .badge-vip {
            background: linear-gradient(135deg, ${t.primary}, ${t.primaryDark}) !important;
        }
        .receipt-header {
            border-bottom-color: ${t.primary} !important;
        }
    `;
}
function loadThemeUI() {
  const themeName = storeConfig.theme || "dorado";
  currentTheme = themeName;
  document.querySelectorAll(".theme-option").forEach((el) => {
    el.style.borderColor = "#E5E7EB";
    el.style.background = "white";
    el.classList.remove("active");
  });
  const selected = document.querySelector(`[data-theme="${themeName}"]`);
  if (selected && themes[themeName]) {
    selected.classList.add("active");
    selected.style.borderColor = themes[themeName].primary;
    selected.style.background = themes[themeName].primaryLight;
  }
  applyTheme(themeName);
}
async function convertQuoteToPedido(quoteId) {
  const quote = quotes.find((q) => q.id === quoteId);
  if (!quote) return;
  showConfirm(`\xBFConvertir la cotizaci\xF3n ${quote.folio} de ${quote.customer} en un pedido por encargo?`, "Convertir cotizaci\xF3n").then((ok) => {
    if (!ok) return;
    const concepto = quote.products && quote.products.length > 0 ? quote.products.map((p) => `${p.quantity}x ${p.name}`).join(", ") : quote.notes || "Pedido desde cotizaci\xF3n";
    const _dCot = /* @__PURE__ */ new Date();
    const hoy = `${_dCot.getFullYear()}-${String(_dCot.getMonth() + 1).padStart(2, "0")}-${String(_dCot.getDate()).padStart(2, "0")}`;
    const fechaEntrega = new Date(_dCot);
    fechaEntrega.setDate(fechaEntrega.getDate() + 15);
    const fechaEntregaStr = `${fechaEntrega.getFullYear()}-${String(fechaEntrega.getMonth() + 1).padStart(2, "0")}-${String(fechaEntrega.getDate()).padStart(2, "0")}`;
    const nuevoPedido = {
      id: mkId(),
      folio: generarFolioPedido(),
      cliente: quote.customer,
      telefono: "",
      redes: "",
      fecha: hoy,
      entrega: fechaEntregaStr,
      concepto,
      cantidad: quote.products ? quote.products.reduce((s, p) => s + p.quantity, 0) : 1,
      costo: 0,
      anticipo: 0,
      total: quote.total,
      resta: quote.total,
      notas: quote.notes || "",
      status: "confirmado",
      fechaCreacion: hoy,
      productosInventario: quote.productosInventario || quote.products || [],
      fromQuote: quote.folio
    };
    pedidos.push(nuevoPedido);
    savePedidos();
    quote.convertedToPedido = true;
    quote.status = "approved";
    saveQuotes();
    if (typeof renderQuotesTable === "function") renderQuotesTable();
    renderPedidosTable();
    updateDashboard();
    manekiToastExport(`\u2705 Pedido ${nuevoPedido.folio} creado desde cotizaci\xF3n`, "ok");
    showConfirm(`Pedido ${nuevoPedido.folio} creado exitosamente. \xBFIr a Pedidos para ajustar detalles?`, "\u2705 Pedido creado").then((ir) => {
      if (ir) showSection("pedidos");
    });
  });
}
//# sourceMappingURL=app-data.js.map
