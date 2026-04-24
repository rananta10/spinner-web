/**
 * spinner.js
 * Animasi drum spinner: mengacak item di layar sebelum settle.
 */

/**
 * Jalankan animasi spinner drum, lalu panggil callback setelah selesai.
 *
 * @param {Array}    allItems    - semua item valid (untuk pool animasi)
 * @param {Array}    finalItems  - item hasil kombinasi (yang akan settle)
 * @param {string}   labelText   - label di atas spinner, misal "Spin 1 dari 3"
 * @param {Function} callback    - fungsi dipanggil setelah animasi selesai
 */
function runSpinnerAnimation(allItems, finalItems, labelText, callback) {
  const stage = document.getElementById('spinner-stage');
  const track = document.getElementById('drum-track');
  const label = document.getElementById('spinner-label');

  label.textContent = labelText;
  stage.style.display = 'flex';

  // Bangun pool animasi:
  // beberapa item acak dulu, lalu finalItems di akhir
  const PADDING_ITEMS = 20; // item palsu sebelum settle
  const pool = buildAnimPool(allItems, finalItems, PADDING_ITEMS);

  // Render semua item ke drum
  track.innerHTML = pool
    .map(item => `
      <div class="drum-item">
        <div class="drum-item-name">${escapeHtml(item.name)}</div>
        <div class="drum-item-price">Rp ${fmt(item.price)}</div>
      </div>
    `)
    .join('');

  const ITEM_HEIGHT = 140; // sesuai CSS .drum-item height
  const totalItems = pool.length;

  // Target: halt di item terakhir dalam pool (= finalItems[0])
  const targetIndex = totalItems - finalItems.length;
  const targetTop = -(targetIndex * ITEM_HEIGHT);

  let currentTop = 0;
  let speed = 35; // px per frame
  const DECEL_START_OFFSET = ITEM_HEIGHT * 5; // mulai decel 5 item sebelum target

  track.style.transition = 'none';
  track.style.top = '0px';

  let rafId;
  let settled = false;

  function animate() {
    currentTop -= speed;

    const distToTarget = Math.abs(currentTop - targetTop);

    // Decelerate saat mendekati target
    if (distToTarget < DECEL_START_OFFSET) {
      const factor = Math.max(0.88, distToTarget / DECEL_START_OFFSET);
      speed = Math.max(2, speed * factor);
    }

    // Settle
    if (currentTop <= targetTop) {
      if (!settled) {
        settled = true;
        track.style.top = targetTop + 'px';
        cancelAnimationFrame(rafId);

        // Bounce kecil
        bounceEffect(track, targetTop, () => {
          setTimeout(() => {
            stage.style.display = 'none';
            callback();
          }, 400);
        });
      }
      return;
    }

    track.style.top = currentTop + 'px';
    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);
}

/**
 * Bangun pool animasi: item acak + finalItems di akhir.
 */
function buildAnimPool(allItems, finalItems, paddingCount) {
  const pool = [];

  // Isi padding dengan item acak berulang
  for (let i = 0; i < paddingCount; i++) {
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    pool.push(randomItem);
  }

  // Tambahkan semua finalItems di akhir
  finalItems.forEach(item => pool.push(item));

  return pool;
}

/**
 * Efek bounce kecil setelah settle.
 */
function bounceEffect(el, targetTop, callback) {
  const BOUNCE_UP = 12;
  const BOUNCE_DURATION = 120;

  el.style.transition = `top ${BOUNCE_DURATION}ms ease-out`;
  el.style.top = (targetTop - BOUNCE_UP) + 'px';

  setTimeout(() => {
    el.style.transition = `top ${BOUNCE_DURATION * 0.8}ms ease-in`;
    el.style.top = targetTop + 'px';
    setTimeout(callback, BOUNCE_DURATION * 0.8);
  }, BOUNCE_DURATION);
}
