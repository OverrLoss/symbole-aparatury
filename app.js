const MODES = [
  { id: 'draw', label: 'Rysuj i sprawdź' },
  { id: 'match', label: 'Dopasuj nazwę' },
  { id: 'type', label: 'Pisz z pamięci' }
];

const ALIASES = {
  'I-4': ['zbiornik kulisty', 'kula'],
  'II-6': ['smoczek'],
  'III-5': ['sito wibracyjne', 'sito'],
  'V-1': ['odstojnik'],
  'IV-7': ['wężownica'],
  'VII-6': ['suszarka bębnowa']
};

const state = {
  mode: 'draw', cat: 'all', random: false,
  queue: [], i: 0, correct: 0, answered: false, options: []
};

const $ = (s) => document.querySelector(s);
const stage = () => $('#stage');
const current = () => state.queue[state.i];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newSession() {
  state.queue = SYMBOLS.filter(s => state.cat === 'all' || s.cat === state.cat);
  if (state.random) shuffle(state.queue);
  state.i = 0;
  state.correct = 0;
  render();
}

/* ---------- rysowanie symboli na canvasie ---------- */

function drawSymbol(canvas, sym, color = '#16243a', width = 1.7, dots = true) {
  const ctx = canvas.getContext('2d');
  const s = canvas.width / 120;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(0, 0);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  sym.p.forEach(d => ctx.stroke(new Path2D(d)));
  if (dots && sym.dots) {
    sym.dots.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.restore();
}

function inkPoints(canvas, step = 2) {
  const ctx = canvas.getContext('2d');
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pts = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 60) pts.push([x, y]);
    }
  }
  return pts;
}

function normalizeInk(pts, cols = 72, rows = 54) {
  if (pts.length < 8) return null;
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  for (const [x, y] of pts) {
    if (x < minx) minx = x;
    if (x > maxx) maxx = x;
    if (y < miny) miny = y;
    if (y > maxy) maxy = y;
  }
  const sx = cols / Math.max(1, maxx - minx);
  const sy = rows / Math.max(1, maxy - miny);
  const grid = new Uint8Array(cols * rows);
  for (const [x, y] of pts) {
    const gx = Math.min(cols - 1, Math.floor((x - minx) * sx));
    const gy = Math.min(rows - 1, Math.floor((y - miny) * sy));
    grid[gy * cols + gx] = 1;
  }
  return grid;
}

function dilate(g, cols, rows) {
  const out = new Uint8Array(g.length);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!g[y * cols + x]) continue;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) out[ny * cols + nx] = 1;
        }
      }
    }
  }
  return out;
}

function compareInk(target, user) {
  const cols = 72, rows = 54;
  const t = normalizeInk(inkPoints(target));
  const u = normalizeInk(inkPoints(user));
  if (!u) return -1;
  const ud = dilate(u, cols, rows);
  const td = dilate(t, cols, rows);
  let hit = 0, tc = 0, near = 0, uc = 0;
  for (let i = 0; i < t.length; i++) {
    if (t[i]) { tc++; if (ud[i]) hit++; }
    if (u[i]) { uc++; if (td[i]) near++; }
  }
  const recall = hit / Math.max(1, tc);
  const precision = near / Math.max(1, uc);
  return Math.round(200 * precision * recall / Math.max(0.0001, precision + recall));
}

/* ---------- wspólny szkielet ---------- */

function render() {
  const sym = current();
  $('#modeTabs').innerHTML = MODES.map(m =>
    `<button class="tab ${state.mode === m.id ? 'active' : ''}" data-mode="${m.id}">${m.label}</button>`
  ).join('');
  $('#catChips').innerHTML =
    `<button class="chip ${state.cat === 'all' ? 'active' : ''}" data-cat="all">Wszystkie (${SYMBOLS.length})</button>` +
    CATEGORIES.map(c => {
      const n = SYMBOLS.filter(s => s.cat === c.id).length;
      return `<button class="chip ${state.cat === c.id ? 'active' : ''}" data-cat="${c.id}" title="${c.name}">${c.id} (${n})</button>`;
    }).join('') +
    `<button class="chip ${state.random ? 'active' : ''}" id="randBtn" title="Losowa kolejność">🔀 Losowo</button>`;

  const total = state.queue.length;
  const done = total ? Math.round(100 * state.i / total) : 0;
  $('#progressBar').style.width = done + '%';
  $('#scoreBox').innerHTML = total
    ? `<strong>${state.i + 1}/${total}</strong><span>trafienia: ${state.correct}</span>`
    : '<span>brak symboli</span>';

  if (!sym) {
    stage().innerHTML = '<div class="card empty">Brak symboli w tej kategorii.</div>';
    return;
  }
  if (state.mode === 'draw') renderDraw(sym);
  else if (state.mode === 'match') renderMatch(sym);
  else renderType(sym);
}

function head(sym, task) {
  const cat = CATEGORIES.find(c => c.id === sym.cat);
  return `<div class="card head">
    <div class="tag">${sym.cat} · ${sym.num}</div>
    <h2>${sym.name}</h2>
    <p>${task}</p>
    <div class="catname">${cat.name}</div>
  </div>`;
}

function navButtons(extra = '') {
  return `<div class="actions">
    ${extra}
    <button class="btn" id="nextBtn" ${state.answered ? '' : 'disabled'}>Następny →</button>
  </div>`;
}

function bindCommon() {
  $('#nextBtn').addEventListener('click', () => {
    state.i = (state.i + 1) % state.queue.length;
    state.answered = false;
    render();
  });
}

function verdictHTML(ok, text, score) {
  return `<div class="verdict ${ok ? 'ok' : 'bad'}">
    <span class="mark">${ok ? '✓' : '✗'}</span>
    <div><strong>${text}</strong>${score !== undefined ? `<small>Dokładność: ${score}%</small>` : ''}</div>
  </div>`;
}

/* ---------- tryb 1: rysowanie ---------- */

function renderDraw(sym) {
  stage().innerHTML = `
    ${head(sym, 'Narysuj ten symbol odręcznie, potem naciśnij „Sprawdź”. Kliknij „Pokaż wzór”, jeśli potrzebujesz podpowiedzi.')}
    <div class="card drawcard">
      <div class="canvas-wrap">
        <canvas id="drawCanvas" width="600" height="450"></canvas>
        <canvas id="ghostCanvas" class="ghost hidden" width="600" height="450"></canvas>
      </div>
      <canvas id="targetCanvas" class="hidden" width="600" height="450"></canvas>
      <div id="drawFeedback"></div>
      <div class="actions">
        <button class="btn" id="clearBtn">Wyczyść</button>
        <button class="btn" id="hintBtn">Pokaż wzór</button>
        <button class="btn primary" id="checkBtn">Sprawdź</button>
        <button class="btn" id="nextBtn" disabled>Następny →</button>
      </div>
    </div>`;
  bindCommon();

  const target = $('#targetCanvas');
  drawSymbol(target, sym);

  const canvas = $('#drawCanvas');
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2563eb';
  let drawing = false, px = 0, py = 0;

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height];
  };
  const down = (e) => {
    e.preventDefault();
    drawing = true;
    [px, py] = pos(e);
    ctx.beginPath();
    ctx.moveTo(px, py);
    canvas.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drawing) return;
    const [x, y] = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    px = x; py = y;
  };
  const up = () => { drawing = false; };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  $('#clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $('#drawFeedback').innerHTML = '';
    state.answered = false;
    $('#nextBtn').disabled = true;
  });
  $('#hintBtn').addEventListener('click', () => {
    const ghost = $('#ghostCanvas');
    drawSymbol(ghost, sym, '#94a3b8', 1.6);
    ghost.classList.toggle('hidden');
  });
  $('#checkBtn').addEventListener('click', () => {
    const score = compareInk(target, canvas);
    state.answered = true;
    $('#nextBtn').disabled = false;
    if (score < 0) {
      $('#drawFeedback').innerHTML = verdictHTML(false, 'Najpierw narysuj symbol.');
      return;
    }
    const ok = score >= 60;
    if (ok) state.correct++;
    const ghost = $('#ghostCanvas');
    drawSymbol(ghost, sym, ok ? '#16a34a' : '#dc2626', 2);
    ghost.classList.remove('hidden');
    $('#drawFeedback').innerHTML = verdictHTML(ok,
      ok ? 'Poprawnie — kształt się zgadza!' : 'Nie do końca — porównaj z wzorem.', score);
    $('#scoreBox').innerHTML = `<strong>${state.i + 1}/${state.queue.length}</strong><span>trafienia: ${state.correct}</span>`;
  });
}

/* ---------- tryb 2: dopasowanie ---------- */

function makeOptions(sym) {
  const pool = SYMBOLS.filter(s => s.id !== sym.id && s.cat === sym.cat);
  const src = pool.length >= 3 ? pool : SYMBOLS.filter(s => s.id !== sym.id);
  const wrong = shuffle(src.slice()).slice(0, 3).map(s => s.name);
  return shuffle([sym.name, ...wrong]);
}

function renderMatch(sym) {
  if (!state.answered) state.options = makeOptions(sym);
  stage().innerHTML = `
    ${head(sym, 'Która nazwa odpowiada temu symbolowi?').replace(`<h2>${sym.name}</h2>`, '<h2>Rozpoznaj symbol</h2>')}
    <div class="card matchcard">
      <canvas id="symbolCanvas" width="480" height="360"></canvas>
      <div class="options">
        ${state.options.map((o, i) => `<button class="opt" data-opt="${i}">${String.fromCharCode(65 + i)}. ${o}</button>`).join('')}
      </div>
      <div id="matchFeedback"></div>
      ${navButtons()}
    </div>`;
  drawSymbol($('#symbolCanvas'), sym, '#16243a', 2);
  bindCommon();

  document.querySelectorAll('[data-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.answered) return;
      const chosen = state.options[+btn.dataset.opt];
      const ok = chosen === sym.name;
      state.answered = true;
      if (ok) state.correct++;
      document.querySelectorAll('[data-opt]').forEach((b, i) => {
        b.classList.add(state.options[i] === sym.name ? 'right' : (i === +btn.dataset.opt ? 'wrong' : 'muted'));
      });
      $('#matchFeedback').innerHTML = verdictHTML(ok, ok ? 'Poprawnie!' : `Poprawna nazwa: ${sym.name}`);
      $('#nextBtn').disabled = false;
      $('#scoreBox').innerHTML = `<strong>${state.i + 1}/${state.queue.length}</strong><span>trafienia: ${state.correct}</span>`;
    });
  });
}

/* ---------- tryb 3: pisanie z pamięci ---------- */

function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

function checkTyped(sym, input) {
  const a = norm(input);
  if (!a) return false;
  const base = norm(sym.name);
  const variants = [base, norm(sym.name.replace(/\(.*?\)/g, ''))
    , ...(ALIASES[sym.id] || []).map(norm)];
  if (variants.some(v => v === a)) return true;
  return a.length >= base.length * 0.72 && base.includes(a);
}

function renderType(sym) {
  stage().innerHTML = `
    ${head(sym, 'Wpisz nazwę symbolu z pamięci. Wielkość liter i znaki diakrytyczne nie mają znaczenia.').replace(`<h2>${sym.name}</h2>`, '<h2>Wpisz nazwę</h2>')}
    <div class="card typecard">
      <canvas id="symbolCanvas" width="480" height="360"></canvas>
      <div class="inputrow">
        <input id="typeInput" type="text" autocomplete="off" spellcheck="false" placeholder="Nazwa symbolu…" ${state.answered ? 'disabled' : ''}>
        <button class="btn primary" id="typeCheck" ${state.answered ? 'disabled' : ''}>Sprawdź</button>
      </div>
      <div id="typeFeedback"></div>
      ${navButtons('<button class="btn" id="hintName">Podpowiedź</button>')}
    </div>`;
  drawSymbol($('#symbolCanvas'), sym, '#16243a', 2);
  bindCommon();

  const input = $('#typeInput');
  if (!state.answered) input.focus();
  const submit = () => {
    if (state.answered) return;
    const ok = checkTyped(sym, input.value);
    state.answered = true;
    if (ok) state.correct++;
    input.disabled = true;
    $('#typeCheck').disabled = true;
    $('#typeFeedback').innerHTML = verdictHTML(ok,
      ok ? 'Poprawnie!' : `Poprawna nazwa: ${sym.name}`);
    $('#nextBtn').disabled = false;
    $('#scoreBox').innerHTML = `<strong>${state.i + 1}/${state.queue.length}</strong><span>trafienia: ${state.correct}</span>`;
  };
  $('#typeCheck').addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  $('#hintName').addEventListener('click', () => {
    const words = sym.name.split(' ').slice(0, 2).join(' ');
    input.value = words + '…';
    input.focus();
  });
}

/* ---------- start ---------- */

document.addEventListener('click', e => {
  const m = e.target.closest('[data-mode]');
  if (m) { state.mode = m.dataset.mode; state.answered = false; render(); return; }
  const c = e.target.closest('[data-cat]');
  if (c) { state.cat = c.dataset.cat; newSession(); return; }
  if (e.target.closest('#randBtn')) { state.random = !state.random; newSession(); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' && state.answered && $('#nextBtn')) $('#nextBtn').click();
});

$('#app').innerHTML = `
  <div class="topbar">
    <div class="brand"><span class="logo">▣</span>
      <div><h1>Symbole aparatury</h1><p>Nauka symboli na kartach aparatury chemicznej</p></div>
    </div>
    <div class="score" id="scoreBox"></div>
  </div>
  <div class="toolbar">
    <div class="tabs" id="modeTabs"></div>
    <div class="filters" id="catChips"></div>
  </div>
  <div class="progress"><div class="bar" id="progressBar"></div></div>
  <main id="stage"></main>
  <footer>Wzory wg karty aparatury chemicznej · tryb rysowania porównuje kształt, nie wielkość.</footer>
`;
newSession();
