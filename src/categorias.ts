// ============== CATEGORIES MODULE ==============

        // R3-S30: íconos 3D propios de Bicho Capricho para la grid de categorías.
        // Solo cubre la vista visual (tarjetas de Categorías) — cat.emoji se sigue usando
        // en dropdowns, tickets y demás contextos de solo texto en toda la app.
        const CATEGORY_ICON_MAP = {
            'tazas': 'tazas', 'llaveros': 'llaveros', 'peluches': 'peluches', 'otros': 'otros',
            'ropaytextiles': 'ropa-y-textiles', 'cajasregalo': 'cajas-de-regalo',
            'vasosytumblers': 'vasos-y-tumblers', 'velas': 'velas', 'setsypacks': 'sets-y-packs',
            'cuadrosyarte': 'cuadros-y-arte', 'stickers': 'stickers', 'papeleria': 'papeleria',
            'globosydecoracion': 'globos-y-decoracion',
        };
        function _catIconSlug(name) {
            const norm = String(name || '').toLowerCase()
                .normalize('NFD').replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9]/g, '');
            return CATEGORY_ICON_MAP[norm] || null;
        }

        function renderCategoriesGrid() {
            const grid = document.getElementById('categoriesGrid');
            grid.innerHTML = categories.map(category => {
                const productCount = products.filter(p => p.category === category.id).length;
                const escColor = _esc(category.color || '#FFD166');
                const escCatId = _esc(category.id);
                const iconSlug = _catIconSlug(category.name);
                const iconHtml = iconSlug
                    ? `<img src="img/categorias/${iconSlug}.webp" alt="" style="width:34px;height:34px;object-fit:contain;">`
                    : _esc(category.emoji);
                // Use data-catid attribute to avoid JS injection from special chars in category.id
                return `
                    <div class="category-card bg-white p-6 rounded-2xl shadow-sm border-2 transition-all hover:shadow-md" style="border-color: ${escColor}20; border-top: 4px solid ${escColor}">
                        <div class="flex items-start justify-between mb-4">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style="background: ${escColor}20">${iconHtml}</div>
                            <div class="flex gap-1">
                                <button data-catid="${escCatId}" data-cataction="edit" class="cat-action-btn p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" title="Editar categoría">
                                    <i class="fas fa-edit text-sm"></i>
                                </button>
                                <button data-catid="${escCatId}" data-cataction="delete" class="cat-action-btn p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Eliminar categoría">
                                    <i class="fas fa-trash text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <h3 class="text-lg font-bold text-gray-800 mb-1">${_esc(category.name)}</h3>
                        <p class="text-sm font-medium" style="color: ${category.color || '#FFD166'}">${productCount} producto${productCount !== 1 ? 's' : ''}</p>
                    </div>
                `;
            }).join('');
        }

        // Delegated click handler for category edit/delete buttons (avoids onclick injection risk)
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.cat-action-btn[data-catid]');
            if (!btn) return;
            const catId = btn.dataset.catid;
            const action = btn.dataset.cataction;
            if (action === 'edit') editCategory(catId);
            else if (action === 'delete') deleteCategory(catId);
        });
        
        function selectCategoryColor(color) {
            _selectColorGeneric(color, 'categoryColor', 'color-btn');
        }

        // openAddCategoryModal definida globalmente arriba (con reset completo de emoji + color)

        function closeAddCategoryModal() {
            closeModal('addCategoryModal');
            document.getElementById('addCategoryForm').reset();
        }
        
        document.getElementById('addCategoryForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('categoryName').value;
            const emoji = document.getElementById('categoryEmoji').value;
            // BUG-NEW-13 FIX: el slug puede colisionar si dos categorías tienen nombres similares
            // (ej. "Aretes Plata" y "Aretes plata" → mismo slug "aretes_plata").
            // Si hay colisión, se agrega un sufijo numérico para garantizar unicidad.
            let baseId = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\u00e0-\u00ff]/g, '');
            let id = baseId;
            let suffix = 2;
            while (categories.find(c => c.id.toLowerCase() === id.toLowerCase())) {
                id = baseId + '_' + suffix++;
            }
            
            const color = document.getElementById('categoryColor')?.value || '#FFD166';
            const newCategory = {
                id: id,
                name: name,
                emoji: emoji,
                color: color
            };
            
            categories.push(newCategory);
            renderCategoriesGrid();
            updateCategorySelects();
            try {
                await saveCategories();
                if (typeof window._mkModalSaved === 'function') window._mkModalSaved('addCategoryModal');
                closeAddCategoryModal();
                manekiToastExport('✅ Categoría creada exitosamente', 'ok');
            } catch (err) {
                manekiToastExport('❌ No se pudo guardar la categoría en la nube. Revisa tu conexión e intenta de nuevo.', 'err');
            }
        });
        
        function deleteCategory(categoryId) {
            const productsInCategory = products.filter(p => p.category === categoryId).length;
            if (productsInCategory > 0) {
                manekiToastExport(`No puedes eliminar esta categoría: tiene ${productsInCategory} producto(s) asociado(s).`, 'error');
                return;
            }
            const cat = categories.find(c => c.id === categoryId);
            showConfirm(`La categoría "${cat ? cat.name : 'esta categoría'}" será eliminada permanentemente.`, '⚠️ Eliminar categoría').then(ok => {
                if (!ok) return;
                categories = categories.filter(c => c.id !== categoryId);
                renderCategoriesGrid();
                updateCategorySelects();
                if (typeof window.deleteCategoryFromDB === 'function') window.deleteCategoryFromDB(categoryId);
            });
        }
        
        function editCategory(categoryId) {
            const cat = categories.find(c => c.id === categoryId);
            if (!cat) return;
            document.getElementById('editCategoryId').value = cat.id;
            document.getElementById('editCategoryName').value = cat.name;
            document.getElementById('editCategoryEmoji').value = cat.emoji || '📦';
            document.getElementById('editSelectedEmojiDisplay').textContent = cat.emoji || '📦';
            document.getElementById('editEmojiSearch').value = '';
            document.getElementById('editCategoryColor').value = cat.color || '#FFD166';
            openModal('editCategoryModal');
            setTimeout(() => {
                selectEditColor(cat.color || '#FFD166');
                renderEditEmojiGrid();
            }, 50);
        }

        function closeEditCategoryModal() {
            closeModal('editCategoryModal');
        }

        function selectEditColor(color) {
            _selectColorGeneric(color, 'editCategoryColor', 'edit-color-btn');
        }

        function renderEditEmojiGrid(filter = '') {
            _renderEmojiPickerGrid('editEmojiGrid', emojiCategories, CATEGORY_EMOJI_KEYWORDS, filter, 'edit-emoji-btn', 'selectEditEmoji');
        }

        function selectEditEmoji(emoji) {
            _selectEmojiGeneric(emoji, 'editCategoryEmoji', 'editSelectedEmojiDisplay', 'edit-emoji-btn');
        }

        function filterEditEmojis(value) { renderEditEmojiGrid(value); }

        async function saveEditCategory() {
            const id = document.getElementById('editCategoryId').value;
            const name = document.getElementById('editCategoryName').value.trim();
            const emoji = document.getElementById('editCategoryEmoji').value || '📦';
            const color = document.getElementById('editCategoryColor').value || '#FFD166';
            if (!name) { manekiToastExport('⚠️ El nombre no puede estar vacío', 'warn'); return; }
            const idx = categories.findIndex(c => c.id === id);
            if (idx === -1) return;
            categories[idx].name = name;
            categories[idx].emoji = emoji;
            categories[idx].color = color;
            // Update emoji on all products in this category
            products.forEach(p => { if (p.category === id && !p.imageUrl) p.image = emoji; });
            renderCategoriesGrid();
            updateCategorySelects();
            saveProducts();
            try {
                await saveCategories();
                if (typeof window._mkModalSaved === 'function') window._mkModalSaved('editCategoryModal');
                closeEditCategoryModal();
                manekiToastExport('✅ Categoría actualizada', 'ok');
            } catch (err) {
                manekiToastExport('❌ No se pudo guardar la categoría en la nube. Revisa tu conexión e intenta de nuevo.', 'err');
            }
        }

        function updateCategorySelects() {
            const optionsHTML = categories.map(cat =>
                `<option value="${_esc(cat.id)}">${_esc(cat.emoji)} ${_esc(cat.name)}</option>`
            ).join('');

            // Poblar todos los selects de categoría que existan en el DOM
            // BUG-CAT-03 FIX: preservar el valor seleccionado antes de remplazar options
            ['productCategory', 'ptCategory', 'mpCategory'].forEach(id => {
                const select = document.getElementById(id);
                if (!select) return;
                const valorActual = select.value;
                select.innerHTML = optionsHTML;
                if (valorActual && select.querySelector(`option[value="${CSS.escape ? CSS.escape(valorActual) : valorActual}"]`)) {
                    select.value = valorActual;
                }
            });
        }