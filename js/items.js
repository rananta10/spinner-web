/**
 * items.js
 * Manages the items list: add, remove, update, render.
 */

const DEFAULT_ITEMS = [
  { name: 'Boba susu', price: 25000 },
  { name: 'Snack keripik', price: 15000 },
  { name: 'Mie instan', price: 5000 },
  { name: 'Minuman kaleng', price: 12000 },
  { name: 'Cokelat batang', price: 18000 },
];

let items = [...DEFAULT_ITEMS];

/** Format angka ke Rupiah tanpa simbol */
function fmt(n) {
  return new Intl.NumberFormat('id-ID').format(Math.round(n));
}

/** Tambah item baru (kosong) */
function addItem() {
  items.push({ name: '', price: 0 });
  renderItems();
  // Focus nama input terakhir
  const inputs = document.querySelectorAll('.item-name-input');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

/** Hapus item berdasarkan index */
function removeItem(index) {
  if (items.length <= 1) {
    showError('Minimal harus ada 1 item!');
    return;
  }
  items.splice(index, 1);
  renderItems();
}

/** Update nama/harga item */
function updateItemField(index, field, value) {
  items[index][field] = field === 'price' ? (parseFloat(value) || 0) : value;
}

/** Ambil item valid (nama tidak kosong & harga > 0) */
function getValidItems() {
  return items.filter(it => it.name.trim() !== '' && it.price > 0);
}

/** Render ulang daftar item ke DOM */
function renderItems() {
  const container = document.getElementById('items-list');
  if (!container) return;

  container.innerHTML = '';
  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input
        type="text"
        class="item-name-input"
        placeholder="Nama item..."
        value="${escapeHtml(item.name)}"
        oninput="updateItemField(${i}, 'name', this.value)"
      />
      <div class="item-price-wrap">
        <span class="price-prefix">Rp</span>
        <input
          type="number"
          class="item-price-input"
          placeholder="0"
          value="${item.price || ''}"
          min="0"
          oninput="updateItemField(${i}, 'price', this.value)"
        />
      </div>
      <button class="btn-delete" onclick="removeItem(${i})" title="Hapus item">×</button>
    `;
    container.appendChild(row);
  });
}

/** Escape HTML untuk keamanan */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
