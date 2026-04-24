/**
 * app.js
 * Controller utama: menghubungkan semua modul & mengelola state aplikasi.
 */

// ─── STATE ────────────────────────────────────────────────────────────────────

const state = {
  budget: 100000,
  totalSpins: 3,
  itemsPerSpin: 3,
  results: [],       // Array of { combo, isExact, total }
  usedKeys: [],      // Mencegah duplikasi kombinasi
  currentSpin: 0,    // Index spin yang sedang berjalan
  isRunning: false,
};

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderItems();
  syncSpinCountDisplay();
  syncItemsPerSpinDisplay();
});

// ─── CONFIG CONTROLS ──────────────────────────────────────────────────────────

function adjustSpin(delta) {
  const input = document.getElementById('spin-count');
  const display = document.getElementById('spin-count-display');
  let val = parseInt(input.value) + delta;
  val = Math.max(1, Math.min(10, val));
  input.value = val;
  display.textContent = val;
}

function adjustItemsPerSpin(delta) {
  const input = document.getElementById('items-per-spin');
  const display = document.getElementById('items-per-spin-display');
  let val = parseInt(input.value) + delta;
  val = Math.max(1, Math.min(10, val));
  input.value = val;
  display.textContent = val;
}

function syncSpinCountDisplay() {
  const input = document.getElementById('spin-count');
  const display = document.getElementById('spin-count-display');
  if (input && display) display.textContent = input.value;
}

function syncItemsPerSpinDisplay() {
  const input = document.getElementById('items-per-spin');
  const display = document.getElementById('items-per-spin-display');
  if (input && display) display.textContent = input.value;
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────

function showError(msg) {
  const el = document.getElementById('error-msg');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function hideError() {
  const el = document.getElementById('error-msg');
  if (el) el.style.display = 'none';
}

function validateInputs() {
  const validItems = getValidItems();
  const budget = parseFloat(document.getElementById('budget').value) || 0;
  const itemsPerSpin = parseInt(document.getElementById('items-per-spin').value) || 3;

  if (validItems.length === 0) {
    showError('Tambahkan minimal 1 item dengan nama dan harga!');
    return false;
  }

  if (budget <= 0) {
    showError('Budget harus lebih dari 0!');
    return false;
  }

  if (validItems.length < itemsPerSpin) {
    showError(`Butuh minimal ${itemsPerSpin} item valid untuk ${itemsPerSpin} item per spin. Sekarang hanya ada ${validItems.length}.`);
    return false;
  }

  const cheapestCombo = validItems
    .slice()
    .sort((a, b) => a.price - b.price)
    .slice(0, itemsPerSpin)
    .reduce((s, it) => s + it.price, 0);

  if (cheapestCombo > budget) {
    showError(`Budget terlalu kecil! Kombinasi termurah (${itemsPerSpin} item) sudah Rp ${fmt(cheapestCombo)}.`);
    return false;
  }

  return true;
}

// ─── MAIN FLOW ────────────────────────────────────────────────────────────────

function startAllSpins() {
  if (state.isRunning) return;
  if (!validateInputs()) return;

  hideError();

  // Ambil config terbaru
  state.budget = parseFloat(document.getElementById('budget').value) || 100000;
  state.totalSpins = parseInt(document.getElementById('spin-count').value) || 3;
  state.itemsPerSpin = parseInt(document.getElementById('items-per-spin').value) || 3;
  state.results = [];
  state.usedKeys = [];
  state.currentSpin = 0;
  state.isRunning = true;

  // Sembunyikan hasil lama, tampilkan idle dulu
  document.getElementById('results-area').style.display = 'none';
  document.getElementById('idle-state').style.display = 'none';
  document.getElementById('btn-spin').disabled = true;

  runNextSpin();
}

function runNextSpin() {
  const validItems = getValidItems();

  // Hitung kombinasi
  const result = getSpinCombo(
    validItems,
    state.budget,
    state.itemsPerSpin,
    state.usedKeys
  );

  if (!result) {
    showError('Tidak ditemukan kombinasi yang cocok. Coba tambah lebih banyak item atau sesuaikan budget.');
    finishSpins();
    return;
  }

  state.usedKeys.push(result.key);

  const spinNum = state.currentSpin + 1;
  const label = `Spin ${spinNum} dari ${state.totalSpins}`;

  // Jalankan animasi untuk SETIAP item dalam combo secara sequential
  // Karena drum cuma satu slot, kita spin untuk finalItems[0] sebagai representasi
  runSpinnerAnimation(
    validItems,
    result.combo,
    label,
    () => {
      // Simpan hasil
      state.results.push(result);
      state.currentSpin++;

      // Render results yang sudah ada
      renderResults();

      if (state.currentSpin < state.totalSpins) {
        // Spin berikutnya dengan delay kecil
        setTimeout(runNextSpin, 600);
      } else {
        finishSpins();
      }
    }
  );
}

function finishSpins() {
  state.isRunning = false;
  document.getElementById('btn-spin').disabled = false;
}

function resetAll() {
  state.results = [];
  state.usedKeys = [];
  state.currentSpin = 0;
  state.isRunning = false;

  document.getElementById('results-area').style.display = 'none';
  document.getElementById('spinner-stage').style.display = 'none';
  document.getElementById('idle-state').style.display = 'flex';
  document.getElementById('btn-spin').disabled = false;
}

// ─── RENDER RESULTS ───────────────────────────────────────────────────────────

function renderResults() {
  const area = document.getElementById('results-area');
  const list = document.getElementById('results-list');

  area.style.display = 'flex';

  list.innerHTML = state.results.map((res, i) => {
    const selisih = Math.abs(res.total - state.budget);
    const badgeClass = res.isExact ? 'badge-exact' : 'badge-close';
    const badgeText = res.isExact ? '✓ Pas budget!' : `Selisih Rp ${fmt(selisih)}`;

    return `
      <div class="result-card ${res.isExact ? 'exact' : ''}">
        <div class="result-card-header">
          <span class="result-spin-label">Spin ${i + 1} dari ${state.totalSpins}</span>
          <span class="result-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="combo-tags">
          ${res.combo.map(item => `
            <div class="combo-tag">
              <span class="tag-name">${escapeHtml(item.name)}</span>
              <span class="tag-price">Rp ${fmt(item.price)}</span>
            </div>
          `).join('')}
        </div>
        <div class="result-total-row">
          <span class="result-total-label">Total belanja</span>
          <span class="result-total-val">Rp ${fmt(res.total)}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ─── COPY RESULTS ─────────────────────────────────────────────────────────────

function copyResults() {
  if (state.results.length === 0) return;

  const lines = [
    `=== Budget Spinner — Hasil ===`,
    `Budget: Rp ${fmt(state.budget)}`,
    ``,
    ...state.results.map((res, i) => {
      const lines = [`Spin ${i + 1}:`];
      res.combo.forEach(item => lines.push(`  • ${item.name} — Rp ${fmt(item.price)}`));
      lines.push(`  Total: Rp ${fmt(res.total)} ${res.isExact ? '(pas!)' : `(selisih Rp ${fmt(Math.abs(res.total - state.budget))})`}`);
      return lines.join('\n');
    }),
  ];

  const text = lines.join('\n');

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-copy');
      const original = btn.textContent;
      btn.textContent = 'Tersalin!';
      setTimeout(() => { btn.textContent = original; }, 2000);
    });
  } else {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}
