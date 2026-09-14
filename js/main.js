/* ==========================================================================
   BSSP — site behaviour
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initYear();
  renderMissionsPreview();
  renderMissionsFull();
  renderGalleryPreview();
  renderGalleryFull();
  initLightbox();
  initContactForm();
  initDonateAmounts();
  animateCounters();
});

/* ---- Mobile nav ---- */
function initNav(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if(!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));

  // Mark the active link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if(href === path) a.classList.add('active');
  });
}

function initYear(){
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}

/* ---- Missions: homepage preview (max 3, ongoing/upcoming first) ---- */
function renderMissionsPreview(){
  const el = document.getElementById('missions-preview');
  if(!el) return;
  const missions = bsspGetMissions()
    .slice()
    .sort((a,b) => statusRank(a.status) - statusRank(b.status) || new Date(a.date) - new Date(b.date))
    .slice(0,3);
  el.innerHTML = missions.map(missionCard).join('');
}

function statusRank(s){ return s === 'upcoming' ? 0 : s === 'ongoing' ? 1 : 2; }

/* ---- Missions: full listing page with filters ---- */
function renderMissionsFull(){
  const el = document.getElementById('missions-full');
  if(!el) return;
  const all = bsspGetMissions().slice().sort((a,b) => new Date(a.date) - new Date(b.date));

  function draw(filter){
    const list = filter === 'all' ? all : all.filter(m => m.status === filter);
    el.innerHTML = list.length ? list.map(missionCard).join('')
      : `<div class="empty-state">इस श्रेणी में अभी कोई मिशन उपलब्ध नहीं है। / No missions in this category yet.</div>`;
  }
  draw('all');

  document.querySelectorAll('.filter-row [data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-row [data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      draw(btn.dataset.filter);
    });
  });
}

function missionCard(m){
  const badgeClass = m.status === 'upcoming' ? 'upcoming' : m.status === 'ongoing' ? 'ongoing' : 'completed';
  const badgeLabel = m.status === 'upcoming' ? 'आगामी · Upcoming' : m.status === 'ongoing' ? 'जारी · Ongoing' : 'सम्पन्न · Completed';
  const dateStr = formatDate(m.date);
  return `
  <article class="card">
    <div class="thumb"><img src="${m.cover}" alt="${escapeHtml(m.titleEn || m.title)}" loading="lazy"></div>
    <div class="body">
      <span class="badge ${badgeClass}">${badgeLabel}</span>
      <h3>${escapeHtml(m.title)}</h3>
      <p>${escapeHtml(m.summary)}</p>
      <div class="meta">
        <span>📅 ${dateStr}</span>
        <span>📍 ${escapeHtml(m.location)}</span>
      </div>
    </div>
  </article>`;
}

/* ---- Gallery ---- */
function renderGalleryPreview(){
  const el = document.getElementById('gallery-preview');
  if(!el) return;
  const items = bsspGetGallery().slice(0,4);
  el.innerHTML = items.map(galleryFigure).join('');
}
function renderGalleryFull(){
  const el = document.getElementById('gallery-full');
  if(!el) return;
  const items = bsspGetGallery();
  el.innerHTML = items.map(galleryFigure).join('');
}
function galleryFigure(g){
  return `<figure data-full="${g.src}" data-caption="${escapeHtml(g.caption || '')}">
    <img src="${g.src}" alt="${escapeHtml(g.captionEn || g.caption || 'BSSP event photo')}" loading="lazy">
  </figure>`;
}
function initLightbox(){
  const lb = document.getElementById('lightbox');
  if(!lb) return;
  const img = lb.querySelector('img');
  const cap = lb.querySelector('.lb-caption');
  document.addEventListener('click', (e) => {
    const fig = e.target.closest('[data-full]');
    if(fig){
      img.src = fig.dataset.full;
      if(cap) cap.textContent = fig.dataset.caption || '';
      lb.classList.add('open');
    }
    if(e.target.closest('.lb-close') || e.target === lb){
      lb.classList.remove('open');
    }
  });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') lb.classList.remove('open'); });
}

/* ---- Contact form (client-side demo: stores to localStorage) ---- */
function initContactForm(){
  const form = document.getElementById('contact-form');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if(!data.name || !data.email || !data.message){
      showAlert(form, 'error', 'कृपया सभी आवश्यक फ़ील्ड भरें। / Please fill all required fields.');
      return;
    }
    const messages = bsspGetMessages();
    messages.unshift({ ...data, id: 'msg_' + Date.now(), receivedAt: new Date().toISOString() });
    bsspSave(BSSP_KEYS.messages, messages);
    form.reset();
    showAlert(form, 'success', 'धन्यवाद! आपका संदेश प्राप्त हो गया है — हम शीघ्र संपर्क करेंगे। / Thank you, your message has been received.');
  });
}
function showAlert(form, type, msg){
  const alertEl = form.querySelector('.alert');
  if(!alertEl) return;
  alertEl.className = 'alert show alert-' + type;
  alertEl.textContent = msg;
  alertEl.scrollIntoView({ behavior:'smooth', block:'center' });
}

/* ---- Donate amount pills ---- */
function initDonateAmounts(){
  const wrap = document.querySelector('.amount-pills');
  const input = document.getElementById('donate-amount');
  if(!wrap || !input) return;
  wrap.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      input.value = btn.dataset.amount;
    });
  });
}

/* ---- Counters ---- */
function animateCounters(){
  const counters = document.querySelectorAll('[data-count]');
  if(!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const dur = 1400;
      const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.floor(p * target).toLocaleString('en-IN') + (p === 1 && el.dataset.suffix ? el.dataset.suffix : '');
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: .4 });
  counters.forEach(c => obs.observe(c));
}

/* ---- Helpers ---- */
function formatDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  }catch(e){ return iso; }
}
function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}
