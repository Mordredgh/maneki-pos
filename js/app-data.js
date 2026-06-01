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
  { id: "tazas", name: "Tazas", emoji: "☕" },
  { id: "llaveros", name: "Llaveros", emoji: "🔑" },
  { id: "libretas", name: "Libretas", emoji: "📓" },
  { id: "peluches", name: "Peluches", emoji: "🧸" },
  { id: "otros", name: "Otros", emoji: "🎁" }
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
  showConfirm("Este registro será eliminado. Esta acción no se puede deshacer.", "⚠️ Eliminar registro").then((ok) => {
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
  if (submitBtn) submitBtn.textContent = "💾 Actualizar";
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
  document.getElementById("cancelPedidoFolio").textContent = pedido.folio || "—";
  document.getElementById("cancelPedidoCliente").textContent = `Cliente: ${pedido.cliente || "—"} · Total: $${(pedido.total || 0).toFixed(2)}`;
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
    customer: pedido.cliente || "—",
    concept: "❌ Cancelación: " + (pedido.concepto || ""),
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
    const msgStock = regresarStock ? " ✅ Stock regresado al inventario." : tieneProductos ? " ⚠️ Stock NO regresado (producto ya terminado)." : "";
    manekiToastExport("✅ Pedido " + pedido.folio + " cancelado." + msgStock, "ok");
  }
  if (tieneProductos) {
    const lista = pedido.productosInventario.map(function(i) {
      return i.name + " x" + i.quantity;
    }).join(", ");
    showConfirm("¿Regresar productos al inventario?\n(" + lista + ")\n\nAceptar = NO está hecho, regresa al stock.\nCancelar = ya terminado.", "¿Regresar stock?").then(function(regresar) {
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
    label: "🎁 Regalos y accesorios",
    emojis: ["🎁", "🎀", "🎊", "🎉", "🎈", "🧧", "💝", "💖", "💗", "💓", "💞", "💕", "🎗️", "🛍️", "👜", "👛", "💍", "💎", "📿", "🪬"]
  },
  {
    label: "🐾 Animales",
    emojis: ["🐱", "🐶", "🐰", "🐻", "🐼", "🐨", "🦊", "🐸", "🐙", "🦋", "🐝", "🦄", "🐯", "🦁", "🐮", "🐷", "🐧", "🦆", "🐺", "🦝"]
  },
  {
    label: "☕ Hogar y cocina",
    emojis: ["☕", "🍵", "🧁", "🎂", "🍰", "🍩", "🧇", "🫖", "🥂", "🍷", "🫙", "🍶", "🥛", "🧃", "🪴", "🕯️", "🪔", "🫗", "🍽️", "🥄"]
  },
  {
    label: "👗 Moda y ropa",
    emojis: ["👗", "👘", "🥻", "👙", "👒", "🎩", "👟", "👠", "👡", "🧣", "🧤", "🧥", "👔", "👕", "🩱", "🩲", "🩳", "🧦", "🪖", "💄"]
  },
  {
    label: "📚 Papelería y arte",
    emojis: ["📚", "📓", "📒", "📔", "📕", "📗", "📘", "📙", "📝", "✏️", "🖊️", "🖌️", "🎨", "🖍️", "📐", "📏", "✂️", "🗂️", "📌", "🔖"]
  },
  {
    label: "🧸 Juguetes y bebés",
    emojis: ["🧸", "🪆", "🎮", "🎯", "🎲", "🪀", "🪁", "🧩", "🎠", "🎡", "🪄", "🎭", "🪅", "🛹", "🤸", "🧒", "👶", "🍼", "🧷", "🪃"]
  },
  {
    label: "💆 Bienestar y spa",
    emojis: ["💆", "🧘", "🛁", "🪷", "🌸", "🌺", "🌻", "🌹", "💐", "🍃", "🌿", "🌱", "🫧", "🧴", "🧼", "💅", "💊", "🩺", "🫁", "🪽"]
  },
  {
    label: "🏠 Casa y decoración",
    emojis: ["🏠", "🛋️", "🪑", "🛏️", "🪞", "🖼️", "🪟", "🚪", "🧹", "🪣", "🪤", "💡", "🔦", "🪔", "⏰", "📦", "🗑️", "🪣", "🧺", "🪴"]
  },
  {
    label: "⭐ Estrellas y símbolos",
    emojis: ["⭐", "🌟", "✨", "💫", "🌈", "☀️", "🌙", "❄️", "🔥", "💧", "🌊", "🍀", "🌺", "🌸", "🌼", "🌻", "🦋", "🌍", "🎵", "🎶"]
  },
  {
    label: "🔑 Objetos variados",
    emojis: ["🔑", "🗝️", "📷", "📸", "🎙️", "📱", "💻", "⌚", "🔮", "🪄", "🧲", "🔧", "🪛", "⚙️", "🔩", "🧰", "📦", "🗃️", "🪝", "🎪"]
  }
];
let allEmojis = emojiCategories.flatMap((cat) => cat.emojis.map((e) => ({ emoji: e, label: cat.label })));
function renderEmojiGrid(filter = "") {
  const grid = document.getElementById("emojiGrid");
  if (!grid) return;
  const q = filter.toLowerCase().trim();
  if (q) {
    const keywords = {
      "regalo": ["🎁", "🎀", "🎊", "🎉", "💝", "🛍️"],
      "caja": ["📦", "🗃️"],
      "gato": ["🐱"],
      "perro": ["🐶"],
      "conejo": ["🐰"],
      "ropa": ["👗", "👘", "👕", "👔", "🧥"],
      "taza": ["☕", "🍵", "🫖"],
      "libro": ["📚", "📓", "📒", "📔"],
      "bebe": ["👶", "🍼", "🧸", "🧷"],
      "bebé": ["👶", "🍼", "🧸", "🧷"],
      "flor": ["🌸", "🌺", "🌻", "🌹", "💐", "🌼"],
      "estrella": ["⭐", "🌟", "✨", "💫"],
      "corazon": ["💝", "💖", "💗", "💓", "💞", "💕"],
      "corazón": ["💝", "💖", "💗", "💓", "💞", "💕"],
      "joya": ["💍", "💎", "📿"],
      "joyeria": ["💍", "💎", "📿"],
      "joyería": ["💍", "💎", "📿"],
      "spa": ["💆", "🧘", "🛁", "🪷", "🌿"],
      "juguete": ["🧸", "🪆", "🎮", "🎯", "🎲"],
      "arte": ["🎨", "🖌️", "✏️", "🖍️"]
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
    label: "🖨️ Impresión",
    emojis: ["🖨️", "📠", "🖥️", "💻", "📱", "📷", "📸", "🎞️", "🗃️", "📋", "🗄️", "🖱️", "⌨️", "🖲️"]
  },
  {
    label: "⚙️ Herramientas y máquinas",
    emojis: ["⚙️", "🔧", "🪛", "🔩", "🧰", "🔨", "🪚", "⛏️", "🪝", "🪤", "🧲", "🔬", "🔭", "⚗️", "🧪", "🔋", "💡", "🔌", "🪫", "🛠️"]
  },
  {
    label: "✂️ Corte y diseño",
    emojis: ["✂️", "🪡", "🧵", "📐", "📏", "🖊️", "🖌️", "✏️", "🎨", "🖍️", "📌", "🗂️", "📎", "🖋️", "✒️"]
  },
  {
    label: "🔥 Calor y prensado",
    emojis: ["🔥", "♨️", "🌡️", "💨", "⚡", "☀️", "🌊", "❄️", "💧", "🫧", "🌬️"]
  },
  {
    label: "🤖 Tecnología",
    emojis: ["🤖", "💾", "💿", "📀", "🖧", "📡", "🛰️", "🔐", "🔑", "🗝️", "📟", "📠", "⌚", "🕹️", "🎮"]
  },
  {
    label: "📦 Producción",
    emojis: ["📦", "🏭", "🏗️", "🚜", "🔄", "♻️", "📤", "📥", "🪣", "🗑️", "📊", "📈", "📉", "🗺️", "📍"]
  }
];
const allEquipoEmojis = equipoEmojiCats.flatMap((cat) => cat.emojis);
function renderEquipoEmojiGrid(filter = "") {
  const grid = document.getElementById("equipoEmojiGrid");
  if (!grid) return;
  const q = filter.toLowerCase().trim();
  const equipoKeywords = {
    "impresora": ["🖨️", "📠"],
    "laser": ["🔬", "⚡", "💡", "🔥"],
    "cricut": ["✂️", "🪡", "🖊️"],
    "plancha": ["🔥", "♨️", "🌡️"],
    "prensa": ["🔧", "⚙️", "🛠️"],
    "dtf": ["🖨️", "🔥", "♨️"],
    "sublimacion": ["🖨️", "♨️", "🔥"],
    "sublimación": ["🖨️", "♨️", "🔥"],
    "laminadora": ["📋", "🗃️", "⚙️"],
    "3d": ["🤖", "⚙️", "🔧"],
    "rotador": ["🔄", "⚙️"],
    "atomstack": ["🔬", "⚡", "💡"],
    "mini": ["⚙️", "🔧"],
    "cpu": ["💻", "🖥️", "🖱️"],
    "computadora": ["💻", "🖥️"],
    "herramienta": ["🔧", "🪛", "🛠️", "🧰"],
    "corte": ["✂️", "🪚"],
    "calor": ["🔥", "♨️"],
    "maquina": ["⚙️", "🏭", "🤖"],
    "máquina": ["⚙️", "🏭", "🤖"]
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
  document.getElementById("categoryEmoji").value = "📦";
  document.getElementById("selectedEmojiDisplay").textContent = "📦";
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
    manekiToastExport("🔄 Página refrescada", "ok");
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
  sbSave("storeConfig", storeConfig).then(() => manekiToastExport("Tema guardado en la nube ✓", "ok")).catch(() => manekiToastExport("Error al guardar en la nube", "err"));
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
  showConfirm(`¿Convertir la cotización ${quote.folio} de ${quote.customer} en un pedido por encargo?`, "Convertir cotización").then((ok) => {
    if (!ok) return;
    const concepto = quote.products && quote.products.length > 0 ? quote.products.map((p) => `${p.quantity}x ${p.name}`).join(", ") : quote.notes || "Pedido desde cotización";
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
    manekiToastExport(`✅ Pedido ${nuevoPedido.folio} creado desde cotización`, "ok");
    showConfirm(`Pedido ${nuevoPedido.folio} creado exitosamente. ¿Ir a Pedidos para ajustar detalles?`, "✅ Pedido creado").then((ir) => {
      if (ir) showSection("pedidos");
    });
  });
}
//# sourceMappingURL=app-data.js.map
