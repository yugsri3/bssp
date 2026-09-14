/* ==========================================================================
   BSSP — admin panel behaviour
   IMPORTANT: This is a front-end-only demo. The password check happens in
   the browser and data is saved to this browser's localStorage only — it is
   NOT a real authentication system and nothing here is shared between
   visitors or devices. It's meant to (a) let you preview how content
   management would feel, and (b) give a developer a clear data model to
   wire up to a real backend later. See the notice on the page itself.
   ========================================================================== */

const ADMIN_PASSWORD_KEY = 'bssp_admin_password';
const DEFAULT_ADMIN_PASSWORD = 'SET_THIS_IN_LOCAL_CONFIG';

function getConfiguredAdminPassword(){
  const configured = window.BSSP_CONFIG && window.BSSP_CONFIG.adminPassword;
  if(configured && configured !== DEFAULT_ADMIN_PASSWORD) return configured;
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

document.addEventListener('DOMContentLoaded', () => {
  const configuredPassword = getConfiguredAdminPassword();
  if(!localStorage.getItem(ADMIN_PASSWORD_KEY) && configuredPassword !== DEFAULT_ADMIN_PASSWORD){
    localStorage.setItem(ADMIN_PASSWORD_KEY, configuredPassword);
  }
  initLoginGate();
  initLogout();
  initTabs();
  renderMissionsAdmin();
  renderGalleryAdmin();
  renderMessagesAdmin();
  initMissionForm();
  initGalleryForm();
  initPasswordForm();
  initResetData();
});

function initLoginGate(){
  const gate = document.getElementById('login-gate');
  const panel = document.getElementById('admin-panel');
  const form = document.getElementById('login-form');
  const isAuthed = sessionStorage.getItem(BSSP_KEYS.auth) === 'yes';

  function unlock(){
    gate.style.display = 'none';
    panel.style.display = 'block';
  }
  if(isAuthed) unlock();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = document.getElementById('login-password').value;
    const correct = getConfiguredAdminPassword();
    const err = document.getElementById('login-error');

    if(correct === DEFAULT_ADMIN_PASSWORD){
      err.textContent = 'Admin password is not configured yet. Create js/config.local.js with a secret password.';
      err.classList.add('show');
      return;
    }

    if(val === correct){
      sessionStorage.setItem(BSSP_KEYS.auth, 'yes');
      err.classList.remove('show');
      unlock();
    }else{
      err.textContent = 'ग़लत पासवर्ड। / Incorrect password.';
      err.classList.add('show');
    }
  });
}

function initLogout(){
  const btn = document.getElementById('logout-btn');
  if(!btn) return;
  btn.addEventListener('click', () => {
    sessionStorage.removeItem(BSSP_KEYS.auth);
    location.reload();
  });
}

function initTabs(){
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel-section');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

/* ---------------- Missions CRUD ---------------- */
function renderMissionsAdmin(){
  const el = document.getElementById('admin-missions-list');
  if(!el) return;
  const missions = bsspGetMissions();
  el.innerHTML = missions.length ? missions.map(m => `
    <tr>
      <td><img src="${m.cover}" alt="" style="width:56px;height:42px;object-fit:cover;border-radius:4px;"></td>
      <td>
        <strong>${escapeHtml(m.title)}</strong><br>
        <span class="small">${escapeHtml(m.titleEn || '')}</span>
      </td>
      <td><span class="badge ${m.status}">${m.status}</span></td>
      <td>${formatDate(m.date)}</td>
      <td>${escapeHtml(m.location)}</td>
      <td><button class="btn btn-ghost" style="padding:6px 12px;font-size:.78rem;" onclick="deleteMission('${m.id}')">हटाएं · Delete</button></td>
    </tr>`).join('') : `<tr><td colspan="6"><div class="empty-state">अभी कोई मिशन नहीं जोड़ा गया।</div></td></tr>`;
}

function initMissionForm(){
  const form = document.getElementById('mission-form');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const missions = bsspGetMissions();
    missions.unshift({
      id: 'm_' + Date.now(),
      title: data.title,
      titleEn: data.titleEn,
      status: data.status,
      date: data.date,
      location: data.location,
      cover: data.cover || 'images/events-collage.jpg',
      summary: data.summary,
      summaryEn: data.summaryEn || ''
    });
    bsspSave(BSSP_KEYS.missions, missions);
    form.reset();
    renderMissionsAdmin();
    flashSaved('mission-saved-msg');
  });
}
function deleteMission(id){
  if(!confirm('क्या आप वाक़ई इस मिशन को हटाना चाहते हैं? / Delete this mission?')) return;
  const missions = bsspGetMissions().filter(m => m.id !== id);
  bsspSave(BSSP_KEYS.missions, missions);
  renderMissionsAdmin();
}

/* ---------------- Gallery CRUD ---------------- */
function renderGalleryAdmin(){
  const el = document.getElementById('admin-gallery-list');
  if(!el) return;
  const items = bsspGetGallery();
  el.innerHTML = items.length ? items.map(g => `
    <div class="card">
      <div class="thumb"><img src="${g.src}" alt=""></div>
      <div class="body">
        <p class="small" style="margin-bottom:10px;">${escapeHtml(g.caption || '')}</p>
        <button class="btn btn-ghost btn-block" style="padding:8px;font-size:.8rem;" onclick="deleteGalleryItem('${g.id}')">हटाएं · Delete</button>
      </div>
    </div>`).join('') : `<div class="empty-state">अभी कोई फ़ोटो नहीं जोड़ी गई।</div>`;
}
function initGalleryForm(){
  const form = document.getElementById('gallery-form');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if(!data.src){ return; }
    const items = bsspGetGallery();
    items.unshift({ id: 'g_' + Date.now(), src: data.src, caption: data.caption, captionEn: data.captionEn || '' });
    bsspSave(BSSP_KEYS.gallery, items);
    form.reset();
    renderGalleryAdmin();
    flashSaved('gallery-saved-msg');
  });
}
function deleteGalleryItem(id){
  if(!confirm('क्या आप वाक़ई इस फ़ोटो को हटाना चाहते हैं? / Delete this photo?')) return;
  const items = bsspGetGallery().filter(g => g.id !== id);
  bsspSave(BSSP_KEYS.gallery, items);
  renderGalleryAdmin();
}

/* ---------------- Contact messages (read-only) ---------------- */
function renderMessagesAdmin(){
  const el = document.getElementById('admin-messages-list');
  if(!el) return;
  const messages = bsspGetMessages();
  el.innerHTML = messages.length ? messages.map(m => `
    <tr>
      <td><strong>${escapeHtml(m.name)}</strong></td>
      <td>${escapeHtml(m.email)}<br><span class="small">${escapeHtml(m.phone || '—')}</span></td>
      <td>${escapeHtml(m.subject || 'general')}</td>
      <td>${escapeHtml(m.message)}</td>
      <td class="small">${new Date(m.receivedAt).toLocaleString('en-IN')}</td>
    </tr>`).join('') : `<tr><td colspan="5"><div class="empty-state">अभी कोई संदेश प्राप्त नहीं हुआ।</div></td></tr>`;
}

/* ---------------- Settings: change password / reset data ---------------- */
function initPasswordForm(){
  const form = document.getElementById('password-form');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = document.getElementById('new-password').value.trim();
    if(val.length < 6){
      alert('पासवर्ड कम से कम 6 अक्षर का होना चाहिए। / Password must be at least 6 characters.');
      return;
    }
    localStorage.setItem(ADMIN_PASSWORD_KEY, val);
    form.reset();
    alert('पासवर्ड सफलतापूर्वक बदल दिया गया। / Password updated.');
  });
}
function initResetData(){
  const btn = document.getElementById('reset-data-btn');
  if(!btn) return;
  btn.addEventListener('click', () => {
    if(!confirm('यह सभी मिशन, गैलरी व संदेश डेटा हटाकर मूल डेमो डेटा पर वापस कर देगा। जारी रखें? / This resets all data back to the original demo content. Continue?')) return;
    localStorage.removeItem(BSSP_KEYS.missions);
    localStorage.removeItem(BSSP_KEYS.gallery);
    localStorage.removeItem(BSSP_KEYS.messages);
    location.reload();
  });
}

function flashSaved(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}
