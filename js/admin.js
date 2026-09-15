/* ==========================================================================
   BSSP — admin panel behaviour
   IMPORTANT: This is a front-end-only demo. The password check happens in
   the browser and data is saved to this browser's localStorage only — it is
   NOT a real authentication system and nothing here is shared between
   visitors or devices. It's meant to (a) let you preview how content
   management would feel, and (b) give a developer a clear data model to
   wire up to a real backend later. See the notice on the page itself.
   ========================================================================== */

const ADMIN_SUPABASE_URL = (window.BSSP_CONFIG && window.BSSP_CONFIG.supabaseUrl) || 'https://YOUR_PROJECT_URL.supabase.co';
const ADMIN_SUPABASE_ANON_KEY = (window.BSSP_CONFIG && window.BSSP_CONFIG.supabaseAnonKey) || 'YOUR_SUPABASE_ANON_KEY';
const adminSupabase = (window.supabase && window.BSSP_CONFIG && window.BSSP_CONFIG.supabaseUrl && window.BSSP_CONFIG.supabaseAnonKey)
  ? window.supabase.createClient(window.BSSP_CONFIG.supabaseUrl, window.BSSP_CONFIG.supabaseAnonKey)
  : null;
const MEDIA_BUCKET = 'site-media';

document.addEventListener('DOMContentLoaded', () => {
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

async function initLoginGate(){
  const gate = document.getElementById('login-gate');
  const panel = document.getElementById('admin-panel');
  const form = document.getElementById('login-form');
  function unlock(){
    gate.style.display = 'none';
    panel.style.display = 'block';
  }
  try {
    const response = await fetch('/api/admin-login', { credentials: 'same-origin' });
    if(response.ok) unlock();
  } catch(error) {
    console.error(error);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = document.getElementById('login-password').value;
    const err = document.getElementById('login-error');
    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: val })
      });
      if(response.ok){
        document.getElementById('login-password').value = '';
        err.classList.remove('show');
        unlock();
      }else{
        err.textContent = response.status === 500
          ? 'Admin authentication is not configured on Vercel.'
          : 'ग़लत पासवर्ड। / Incorrect password.';
        err.classList.add('show');
      }
    } catch(error) {
      console.error(error);
      err.textContent = 'Admin login service is unavailable.';
      err.classList.add('show');
    }
  });
}

function initLogout(){
  const btn = document.getElementById('logout-btn');
  if(!btn) return;
  btn.addEventListener('click', async () => {
    await fetch('/api/admin-login', { method: 'DELETE', credentials: 'same-origin' });
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

async function uploadAdminImage(file){
  if(!file) return '';
  if(!adminSupabase) throw new Error('Supabase is not configured.');
  if(!file.type.startsWith('image/')) throw new Error('Please select an image file.');
  if(file.size > 8 * 1024 * 1024) throw new Error('Image must be smaller than 8 MB.');

  const extension = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await adminSupabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  });
  if(error) throw error;
  return adminSupabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function initMissionForm(){
  const form = document.getElementById('mission-form');
  if(!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const uploadedCover = await uploadAdminImage(form.elements.coverFile.files[0]);
    const missions = bsspGetMissions();
    missions.unshift({
      id: 'm_' + Date.now(),
      title: data.title,
      titleEn: data.titleEn,
      status: data.status,
      date: data.date,
      location: data.location,
      cover: uploadedCover || data.cover || 'images/events-collage.jpg',
      summary: data.summary,
      summaryEn: data.summaryEn || ''
    });
    bsspSave(BSSP_KEYS.missions, missions);
    form.reset();
    renderMissionsAdmin();
    flashSaved('mission-saved-msg');
    } catch(error) {
      console.error(error);
      alert(`Image upload failed: ${error.message}`);
    } finally {
      submitButton.disabled = false;
    }
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
async function initGalleryForm(){
  const form = document.getElementById('gallery-form');
  if(!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const uploadedImage = await uploadAdminImage(form.elements.imageFile.files[0]);
      const imageSource = uploadedImage || data.src;
      if(!imageSource) throw new Error('Select an image or enter an image URL.');
      const items = bsspGetGallery();
      items.unshift({ id: 'g_' + Date.now(), src: imageSource, caption: data.caption, captionEn: data.captionEn || '' });
      bsspSave(BSSP_KEYS.gallery, items);
      form.reset();
      renderGalleryAdmin();
      flashSaved('gallery-saved-msg');
    } catch(error) {
      console.error(error);
      alert(`Image upload failed: ${error.message}`);
    } finally {
      submitButton.disabled = false;
    }
  });
}
function deleteGalleryItem(id){
  if(!confirm('क्या आप वाक़ई इस फ़ोटो को हटाना चाहते हैं? / Delete this photo?')) return;
  const items = bsspGetGallery().filter(g => g.id !== id);
  bsspSave(BSSP_KEYS.gallery, items);
  renderGalleryAdmin();
}

/* ---------------- Contact messages (read-only) ---------------- */
async function renderMessagesAdmin(){
  const el = document.getElementById('admin-messages-list');
  if(!el) return;

  if(adminSupabase){
    const { data, error } = await adminSupabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if(error){
      el.innerHTML = `<tr><td colspan="5"><div class="empty-state">Unable to load contact submissions. Add a SELECT policy for this table in Supabase.</div></td></tr>`;
      console.error(error);
      return;
    }

    el.innerHTML = (data || []).length ? data.map(m => `
      <tr>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td>${escapeHtml(m.email)}<br><span class="small">${escapeHtml(m.phone || '—')}</span></td>
        <td>${escapeHtml(m.subject || 'general')}</td>
        <td>${escapeHtml(m.message)}</td>
        <td class="small">${new Date(m.created_at).toLocaleString('en-IN')}</td>
      </tr>`).join('') : `<tr><td colspan="5"><div class="empty-state">अभी कोई संदेश प्राप्त नहीं हुआ।</div></td></tr>`;
    return;
  }

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
    form.reset();
    alert('पासवर्ड बदलने के लिए Vercel में ADMIN_PASSWORD environment variable update करके redeploy करें।');
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
