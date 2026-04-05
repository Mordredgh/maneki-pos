// ============== CATEGORIES MODULE ==============
        
        function renderCategoriesGrid() {
            const grid = document.getElementById('categoriesGrid');
            grid.innerHTML = categories.map(category => {
                const productCount = products.filter(p => p.category === category.id).length;
                const escColor = _esc(category.color || '#C5A572');
                const escCatId = _esc(category.id);
                // Use data-catid attribute to avoid JS injection from special chars in category.id
                return `
                    <div class="category-card bg-white p-6 rounded-2xl shadow-sm border-2 transition-all hover:shadow-md" style="border-color: ${escColor}20; border-top: 4px solid ${escColor}">
                        <div class="flex items-start justify-between mb-4">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style="background: ${escColor}20">${_esc(category.emoji)}</div>
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
                        <p class="text-sm font-medium" style="color: ${category.color || '#C5A572'}">${productCount} producto${productCount !== 1 ? 's' : ''}</p>
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
    document.getElementById('categoryColor').value = color;
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.style.borderColor = btn.dataset.color === color ? '#374151' : 'transparent';
        btn.style.transform = btn.dataset.color === color ? 'scale(1.2)' : 'scale(1)';
    });
}

        // openAddCategoryModal definida globalmente arriba (con reset completo de emoji + color)

        function closeAddCategoryModal() {
            closeModal('addCategoryModal');
            document.getElementById('addCategoryForm').reset();
        }
        
        document.getElementById('addCategoryForm').addEventListener('submit', function(e) {
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
            
            const color = document.getElementById('categoryColor')?.value || '#C5A572';
            const newCategory = {
                id: id,
                name: name,
                emoji: emoji,
                color: color
            };
            
            categories.push(newCategory);
            saveCategories();
            renderCategoriesGrid();
            updateCategorySelects();
            closeAddCategoryModal();
            
            manekiToastExport('✅ Categoría creada exitosamente', 'ok');
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
                saveCategories();
                renderCategoriesGrid();
                updateCategorySelects();
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
            document.getElementById('editCategoryColor').value = cat.color || '#C5A572';
            openModal('editCategoryModal');
            setTimeout(() => {
                selectEditColor(cat.color || '#C5A572');
                renderEditEmojiGrid();
            }, 50);
        }

        function closeEditCategoryModal() {
            closeModal('editCategoryModal');
        }

        function selectEditColor(color) {
            document.getElementById('editCategoryColor').value = color;
            document.querySelectorAll('.edit-color-btn').forEach(btn => {
                btn.style.borderColor = btn.dataset.color === color ? '#374151' : 'transparent';
                btn.style.transform = btn.dataset.color === color ? 'scale(1.2)' : 'scale(1)';
            });
        }

        function renderEditEmojiGrid(filter = '') {
            const grid = document.getElementById('editEmojiGrid');
            if (!grid) return;
            const q = filter.toLowerCase().trim();
            const allE = emojiCategories.flatMap(cat => cat.emojis);
            if (q) {
                const found = allE.filter((_, i) => true); // show all on search
                const keywords = { 'regalo':['🎁','🎀','🎊'], 'ropa':['👗','👕','👔'], 'taza':['☕','🍵'], 'llave':['🔑','🗝️'], 'peluche':['🧸','🐻'], 'joya':['💍','💎'] };
                let res = [];
                Object.entries(keywords).forEach(([k,v]) => { if(k.includes(q)||q.includes(k)) res.push(...v); });
                if (res.length === 0) res = allE;
                grid.innerHTML = `<div class="flex flex-wrap gap-1">${[...new Set(res)].map(e => `<button type="button" onclick="selectEditEmoji('${e}')" class="edit-emoji-btn w-9 h-9 text-xl rounded-lg hover:bg-yellow-50 hover:scale-125 transition-all flex items-center justify-center">${e}</button>`).join('')}</div>`;
                return;
            }
            grid.innerHTML = emojiCategories.map(cat => `
                <div class="mb-2">
                    <p class="text-xs font-semibold text-gray-400 mb-1">${cat.label}</p>
                    <div class="flex flex-wrap gap-1">
                        ${cat.emojis.map(e => `<button type="button" onclick="selectEditEmoji('${e}')" class="edit-emoji-btn w-9 h-9 text-xl rounded-lg hover:bg-yellow-50 hover:scale-125 transition-all flex items-center justify-center">${e}</button>`).join('')}
                    </div>
                </div>`).join('');
        }

        function selectEditEmoji(emoji) {
            document.getElementById('editCategoryEmoji').value = emoji;
            document.getElementById('editSelectedEmojiDisplay').textContent = emoji;
            document.querySelectorAll('.edit-emoji-btn').forEach(btn => {
                btn.style.background = btn.textContent.trim() === emoji ? '#FFF9F0' : '';
                btn.style.border = btn.textContent.trim() === emoji ? '2px solid #C5A572' : '';
            });
        }

        function filterEditEmojis(value) { renderEditEmojiGrid(value); }

        function saveEditCategory() {
            const id = document.getElementById('editCategoryId').value;
            const name = document.getElementById('editCategoryName').value.trim();
            const emoji = document.getElementById('editCategoryEmoji').value || '📦';
            const color = document.getElementById('editCategoryColor').value || '#C5A572';
            if (!name) { manekiToastExport('⚠️ El nombre no puede estar vacío', 'warn'); return; }
            const idx = categories.findIndex(c => c.id === id);
            if (idx === -1) return;
            categories[idx].name = name;
            categories[idx].emoji = emoji;
            categories[idx].color = color;
            // Update emoji on all products in this category
            products.forEach(p => { if (p.category === id && !p.imageUrl) p.image = emoji; });
            saveCategories();
            saveProducts();
            renderCategoriesGrid();
            updateCategorySelects();
            closeEditCategoryModal();
            manekiToastExport('✅ Categoría actualizada', 'ok');
        }

        function updateCategorySelects() {
            const optionsHTML = categories.map(cat =>
                `<option value="${_esc(cat.id)}">${_esc(cat.emoji)} ${_esc(cat.name)}</option>`
            ).join('');

            // Poblar todos los selects de categoría que existan en el DOM
            ['productCategory', 'ptCategory', 'mpCategory'].forEach(id => {
                const select = document.getElementById(id);
                if (select) select.innerHTML = optionsHTML;
            });
        }