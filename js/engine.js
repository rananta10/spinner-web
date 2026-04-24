/**
 * engine.js
 * Core logic: mencari kombinasi item yang totalnya paling mendekati budget.
 */

/**
 * Cari semua kombinasi tepat sebanyak `count` item
 * yang totalnya SAMA PERSIS dengan `budget`.
 * Kalau tidak ada, kembalikan array kosong.
 */
function findExactCombinations(validItems, budget, count) {
  const result = [];
  const n = validItems.length;

  function backtrack(start, current, total) {
    if (current.length === count) {
      if (total === budget) {
        result.push([...current]);
      }
      return;
    }
    const remaining = count - current.length;
    for (let i = start; i <= n - remaining; i++) {
      const newTotal = total + validItems[i].price;
      // Pruning: kalau sudah melebihi budget, skip
      if (newTotal > budget) continue;
      current.push(validItems[i]);
      backtrack(i + 1, current, newTotal);
      current.pop();
    }
  }

  backtrack(0, [], 0);
  return result;
}

/**
 * Cari kombinasi yang paling mendekati budget (fallback).
 * Mengembalikan array kombinasi yang total-nya paling dekat.
 */
function findClosestCombinations(validItems, budget, count) {
  const n = validItems.length;
  const allCombos = [];

  if (n < count) return null;

  function backtrack(start, current, total) {
    if (current.length === count) {
      allCombos.push({ items: [...current], total, diff: Math.abs(total - budget) });
      return;
    }
    const remaining = count - current.length;
    for (let i = start; i <= n - remaining; i++) {
      current.push(validItems[i]);
      backtrack(i + 1, current, total + validItems[i].price);
      current.pop();
    }
  }

  backtrack(0, [], 0);

  if (allCombos.length === 0) return null;

  // Urutkan berdasarkan selisih terkecil
  allCombos.sort((a, b) => a.diff - b.diff);

  // Ambil semua yang selisihnya sama dengan minimum
  const minDiff = allCombos[0].diff;
  return allCombos.filter(c => c.diff === minDiff).map(c => c.items);
}

/**
 * Fungsi utama: dapatkan kombinasi untuk 1 spin.
 * Prioritas: exact → closest.
 * Mengacak hasil agar tiap spin berbeda.
 *
 * @param {Array} validItems  - item yang valid
 * @param {number} budget     - budget total
 * @param {number} count      - jumlah item per spin
 * @param {Array} usedKeys    - array string key kombinasi yang sudah dipakai
 * @returns {{ combo: Array, isExact: boolean, total: number } | null}
 */
function getSpinCombo(validItems, budget, count, usedKeys) {
  if (validItems.length < count) {
    // Kurang item, pakai semua yang ada
    count = validItems.length;
  }

  // Acak urutan item untuk variasi
  const shuffled = [...validItems].sort(() => Math.random() - 0.5);

  // Coba exact dulu
  let pool = findExactCombinations(shuffled, budget, count);
  const isExact = pool.length > 0;

  if (!isExact) {
    pool = findClosestCombinations(shuffled, budget, count);
    if (!pool) return null;
  }

  // Acak pool
  pool.sort(() => Math.random() - 0.5);

  // Pilih yang belum pernah dipakai jika memungkinkan
  const makeKey = (combo) => combo.map(it => it.name).sort().join('|');

  let chosen = pool[0];
  for (const candidate of pool) {
    const key = makeKey(candidate);
    if (!usedKeys.includes(key)) {
      chosen = candidate;
      break;
    }
  }

  const total = chosen.reduce((s, it) => s + it.price, 0);

  return {
    combo: chosen,
    isExact,
    total,
    key: makeKey(chosen),
  };
}
