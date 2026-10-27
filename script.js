/* =====================================================
   PENGATURAN — EDIT BAGIAN INI SAJA
   ===================================================== */
const HERO_IMAGE   = "";      // contoh: "foto/hero.jpg"

// ---- FOTO: 22 file bernama foto-1.jpg ... foto-22.jpg di folder "foto/"
const PHOTO_COUNT  = 22;
const photoSrc     = n => `Foto/foto-${n}.jpeg`;
const PHOTO_CAPTIONS = {         // opsional: caption per nomor foto
  // 1: "Sore itu",
  // 2: "Di perjalanan",
};

// ---- WHATSAPP: nomor tujuan jawaban "balikan"
// Format: kode negara + nomor tanpa 0 di depan, tanpa + atau spasi. Contoh: 6281234567890
const WA_NUMBER     = "6281905082886";
const WA_TEXT_MAU   = "Aku mau balikan ♡";
const WA_TEXT_BELUM = "Aku belum bisa balikan, tapi makasih ya udah nanya.";

// ---- MUSIK: ganti dengan lagu kamu (taruh file di folder "musik/")
const TRACKS = [
  { title: "Cinta Terlarang", artist: "The Virgin", src: "Cinta Terlarang.mp3" },
  { title: "SAMPAI KAU JADI MILIKKU", artist: "Judika", src: "SAMPAI KAU JADI MILIKKU.mp3" },
  { title: "Rahasia Hati", artist: "Element", src: "Rahasia Hati.mp3" },
  { title: "Sempurna 4", artist: "Andra and The Backbone", src: "Sempurna.mp3" },
  { title: "Terbelah Jadi Dua", artist: "Glori Jessica and Ade Govinda", src: "Terbelah Jadi Dua.mp3" },
];

const PHOTOS_PER_PAGE = 12;
/* ===================================================== */

const $  = s => document.querySelector(s);
const HEART = `<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.3C1 8 3.2 4.5 6.7 4.5c2 0 3.6 1.1 5.3 3 1.7-1.9 3.3-3 5.3-3 3.5 0 5.7 3.5 4.2 7.2C19.5 16.4 12 21 12 21z"/></svg>`;
const PLAY_PATH  = '<path d="M8 5v14l11-7z"/>';
const PAUSE_PATH = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = s => isFinite(s) && s > 0 ? Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0') : '0:00';

if (HERO_IMAGE) $('#heroImg').style.setProperty('--hero', `url("${HERO_IMAGE}")`);
$('#yr').textContent = new Date().getFullYear();
$('#photoCount').textContent = `${PHOTO_COUNT} foto`;

/* ---------- Placeholder jika file belum ada ---------- */
function fakeHTML(label, i){
  const h = (i * 47 + 250) % 360;
  return `<div class="fake" style="background:linear-gradient(135deg,hsl(${h},40%,18%),hsl(${(h+40)%360},50%,38%))">${label}<br>(file belum ada)</div>`;
}
// 'error' tidak bubble → pakai capture agar gambar/video rusak diganti placeholder
document.addEventListener('error', e => {
  const el = e.target;
  if (!(el.tagName === 'IMG' || el.tagName === 'VIDEO') || !el.dataset.fallback) return;
  const holder = el.parentElement;
  if (holder && holder.classList.contains('ph')) {
    holder.querySelectorAll('img,video').forEach(n => n.remove());
    holder.insertAdjacentHTML('afterbegin', el.dataset.fallback);
  }
}, true);

/* ---------- Fungsi pagination umum ---------- */
function paginate({ total, perPage, gridEl, pagerEl, renderItem, afterRender }){
  const pages = Math.ceil(total / perPage);
  let page = 1;
  function draw(){
    const start = (page - 1) * perPage;
    const end = Math.min(total, start + perPage);
    let html = '';
    for (let i = start + 1; i <= end; i++) html += renderItem(i);
    gridEl.innerHTML = html;

    let p = `<button class="arrow" data-p="prev">←</button>`;
    for (let n = 1; n <= pages; n++) p += `<button class="${n===page?'on':''}" data-p="${n}">${n}</button>`;
    p += `<button class="arrow" data-p="next">→</button>`;
    pagerEl.innerHTML = p;
    if (afterRender) afterRender();
  }
  pagerEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const v = b.dataset.p;
    page = Math.min(pages, Math.max(1, v === 'prev' ? page - 1 : v === 'next' ? page + 1 : +v));
    draw();
    gridEl.closest('section').scrollIntoView({ behavior: 'smooth' });
  });
  draw();
  return { goToItem(n){ page = Math.ceil(n / perPage); draw(); } };
}

/* =====================================================
   FOTO
   ===================================================== */
const likes = JSON.parse(localStorage.getItem('likes') || '{}');
function photoInner(n){
  return `<img src="${photoSrc(n)}" alt="Foto ${n}" loading="lazy" data-fallback='${fakeHTML("Foto " + n, n)}'>`;
}
paginate({
  total: PHOTO_COUNT, perPage: PHOTOS_PER_PAGE,
  gridEl: $('#grid'), pagerEl: $('#pager'),
  renderItem: n => `
    <div class="polaroid" data-n="${n}" style="--r:${((n*37)%7-3)*0.5}deg;--tr:${(n%5-2)*3}deg">
      <div class="tape"></div>
      <div class="ph">${photoInner(n)}</div>
      <span class="heart ${likes[n]?'on':''}" data-like="${n}">${HEART}</span>
      <span class="cap script">${esc(PHOTO_CAPTIONS[n] || '')}</span>
    </div>`
});

/* ---- Lightbox foto ---- */
let lbN = 1;
function openLb(n){
  lbN = ((n - 1 + PHOTO_COUNT) % PHOTO_COUNT) + 1;
  $('#lbCard').innerHTML =
    `<div class="ph">${photoInner(lbN)}</div><div class="cap-big script">${esc(PHOTO_CAPTIONS[lbN] || 'Foto ' + lbN + ' / ' + PHOTO_COUNT)}</div>`;
  $('#lb').classList.add('show');
}
$('#grid').addEventListener('click', e => {
  const like = e.target.closest('[data-like]');
  if (like) {
    const n = like.dataset.like;
    likes[n] = !likes[n];
    localStorage.setItem('likes', JSON.stringify(likes));
    like.classList.toggle('on');
    return;
  }
  const card = e.target.closest('.polaroid');
  if (card) openLb(+card.dataset.n);
});
$('#lbPrev').onclick = e => { e.stopPropagation(); openLb(lbN - 1); };
$('#lbNext').onclick = e => { e.stopPropagation(); openLb(lbN + 1); };
$('#lbClose').onclick = () => $('#lb').classList.remove('show');
$('#lb').addEventListener('click', e => { if (e.target.id === 'lb') $('#lb').classList.remove('show'); });

/* =====================================================
   MUSIK
   ===================================================== */
const audio = $('#audio');
let cur = -1, shuffle = false, repeat = false;
audio.volume = 0.8;

function renderPlaylist(){
  $('#playlist').innerHTML = TRACKS.map((t, i) => `
    <li data-i="${i}" class="${i === cur ? 'active' : ''}">
      <span class="no">${String(i + 1).padStart(2, '0')}</span>
      <span class="tt"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></span>
      <span class="eq"><i></i><i></i><i></i></span>
    </li>`).join('');
}
function loadTrack(i){
  cur = i;
  const t = TRACKS[i];
  audio.src = t.src;
  $('#nowTitle').textContent = t.title;
  $('#nowArtist').textContent = t.artist;
  $('#miniTitle').textContent = t.title;
  $('#musicMsg').textContent = '';
  renderPlaylist();
  syncUI();
}
function playTrack(i){
  if (i !== undefined && i !== cur) loadTrack(i);
  if (cur < 0) loadTrack(0);
  audio.play().catch(() => {});
}
function toggle(){ audio.paused ? playTrack() : audio.pause(); }
function next(dir = 1){
  if (!TRACKS.length) return;
  let i;
  if (shuffle && TRACKS.length > 1) { do { i = Math.floor(Math.random() * TRACKS.length); } while (i === cur); }
  else i = (cur + dir + TRACKS.length) % TRACKS.length;
  loadTrack(i); audio.play().catch(() => {});
}
function syncUI(){
  const playing = !audio.paused;
  ['#miniIcon', '#bigIcon'].forEach(s => $(s).innerHTML = playing ? PAUSE_PATH : PLAY_PATH);
  $('#disc').classList.toggle('spin', playing);
  const li = document.querySelector('.playlist li.active');
  document.querySelectorAll('.playlist li').forEach(x => x.classList.remove('playing'));
  if (li && playing) li.classList.add('playing');
}

$('#miniPlay').onclick = toggle;
$('#bigPlay').onclick  = toggle;
$('#nextBtn').onclick  = () => next(1);
$('#prevBtn').onclick  = () => (audio.currentTime > 3 ? (audio.currentTime = 0) : next(-1));
$('#shuffleBtn').onclick = e => { shuffle = !shuffle; e.currentTarget.classList.toggle('on', shuffle); };
$('#repeatBtn').onclick  = e => { repeat = !repeat; audio.loop = repeat; e.currentTarget.classList.toggle('on', repeat); };
$('#vol').oninput = e => audio.volume = e.target.value;
$('#playlist').addEventListener('click', e => {
  const li = e.target.closest('li'); if (!li) return;
  const i = +li.dataset.i;
  (i === cur) ? toggle() : playTrack(i);
});

audio.addEventListener('play', syncUI);
audio.addEventListener('pause', syncUI);
audio.addEventListener('ended', () => next(1));
audio.addEventListener('error', () => {
  if (cur >= 0) $('#musicMsg').textContent = 'File lagu tidak ditemukan: ' + TRACKS[cur].src;
  syncUI();
});
audio.addEventListener('loadedmetadata', () => {
  $('#bigDur').textContent = fmt(audio.duration);
  $('#miniDur').textContent = fmt(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  const pct = (audio.currentTime / audio.duration * 100) || 0;
  $('#bigFill').style.width = pct + '%';
  $('#miniFill').style.width = pct + '%';
  $('#bigCur').textContent = fmt(audio.currentTime);
  $('#miniCur').textContent = fmt(audio.currentTime);
});
['#bigBar', '#miniBar'].forEach(s => $(s).addEventListener('click', e => {
  const r = e.currentTarget.getBoundingClientRect();
  if (audio.duration) audio.currentTime = (e.clientX - r.left) / r.width * audio.duration;
}));
renderPlaylist();

/* =====================================================
   BALIKAN (jawab lewat WhatsApp)
   ===================================================== */
const waLink = t => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;
$('#btnMau').href   = waLink(WA_TEXT_MAU);
$('#btnBelum').href = waLink(WA_TEXT_BELUM);

/* =====================================================
   TEMA, KEYBOARD, MENU AKTIF
   ===================================================== */
const root = document.documentElement;
root.dataset.theme = localStorage.getItem('theme') || 'dark';
$('#themeBtn').onclick = () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', root.dataset.theme);
};

document.addEventListener('keydown', e => {
  if ($('#lb').classList.contains('show')) {
    if (e.key === 'Escape') $('#lb').classList.remove('show');
    if (e.key === 'ArrowLeft') openLb(lbN - 1);
    if (e.key === 'ArrowRight') openLb(lbN + 1);
  }
});

const links = document.querySelectorAll('.topnav a, .side-nav a');
const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-40% 0px -50% 0px' });
document.querySelectorAll('main section').forEach(s => io.observe(s));
