/* ==========================================================================
   BSSP — data store
   Everything the site displays (missions, gallery, events, messages) lives
   here as seed data, and is layered with anything the admin panel saves to
   localStorage. This makes the site "editable" from /admin.html without a
   server — see the note in admin.html about moving this to a real database
   for a multi-person production deployment.
   ========================================================================== */

const BSSP_KEYS = {
  missions: 'bssp_missions',
  gallery: 'bssp_gallery',
  messages: 'bssp_messages',
  auth: 'bssp_admin_auth'
};

const BSSP_SEED_MISSIONS = [
  {
    id: 'm1',
    title: 'वीर नारी सम्मान समारोह',
    titleEn: 'Veer Naari Samman Samaroh',
    status: 'ongoing',
    date: '2026-10-18',
    location: 'कानपुर, उत्तर प्रदेश',
    cover: 'images/gallery-2.jpg',
    summary: 'शहीद सैनिकों की वीरांगनाओं व माताओं का सम्मान — शॉल, स्मृति चिन्ह और वित्तीय सहायता राशि भेंट की जाती है।',
    summaryEn: 'Honouring the widows and mothers of martyred soldiers with mementos and financial assistance.'
  },
  {
    id: 'm2',
    title: 'शिक्षा सहायता अभियान',
    titleEn: 'Education Support Drive',
    status: 'upcoming',
    date: '2026-11-14',
    location: 'कानपुर मंडल के विद्यालय',
    cover: 'images/gallery-3.jpg',
    summary: 'वीरगति प्राप्त सैनिकों के बच्चों के लिए किताबें, वर्दी और ट्यूशन सहायता वितरित की जाएगी।',
    summaryEn: 'Books, uniforms and tuition support for the children of fallen soldiers.'
  },
  {
    id: 'm3',
    title: 'आधुनिक हथियार प्रदर्शनी एवं जागरूकता शिविर',
    titleEn: 'Modern Weapons Exhibition & Awareness Camp',
    status: 'completed',
    date: '2026-01-26',
    location: 'कानपुर छावनी',
    cover: 'images/gallery-1.jpg',
    summary: 'गणतंत्र दिवस के अवसर पर छात्रों के लिए सेना की आधुनिक हथियार प्रदर्शनी व सुरक्षा जागरूकता कार्यक्रम आयोजित किया गया।',
    summaryEn: 'Republic Day exhibition introducing students to the Army and its equipment.'
  },
  {
    id: 'm4',
    title: 'रक्षाबंधन — फौजी भाइयों को राखी',
    titleEn: 'Raksha Bandhan for Our Soldier Brothers',
    status: 'completed',
    date: '2025-08-19',
    location: 'छावनी परिसर',
    cover: 'images/events-collage.jpg',
    summary: 'स्कूली छात्राओं द्वारा सैनिकों को राखी बांधकर उनके प्रति कृतज्ञता व्यक्त की गई।',
    summaryEn: 'School students tied rakhis to serving soldiers as a gesture of gratitude.'
  },
  {
    id: 'm5',
    title: 'पेंशन एवं कल्याण सहायता शिविर',
    titleEn: 'Pension & Welfare Assistance Camp',
    status: 'upcoming',
    date: '2026-12-05',
    location: 'जिला सैनिक कल्याण कार्यालय, कानपुर',
    cover: 'images/gallery-2.jpg',
    summary: 'पूर्व सैनिकों व सैनिक विधवाओं की पेंशन संबंधी समस्याओं के समाधान हेतु शिविर।',
    summaryEn: 'A help-desk camp resolving pension issues for veterans and war widows.'
  },
  {
    id: 'm6',
    title: 'बुनियादी चिकित्सा एवं स्वास्थ्य शिविर',
    titleEn: 'Basic Medical & Health Camp',
    status: 'upcoming',
    date: '2026-11-29',
    location: 'ग्रामीण क्षेत्र, कानपुर देहात',
    cover: 'images/gallery-3.jpg',
    summary: 'पूर्व सैनिकों के परिवारों के लिए निःशुल्क स्वास्थ्य जांच व दवा वितरण शिविर।',
    summaryEn: 'Free health check-up and medicine distribution camp for veteran families.'
  }
];

const BSSP_SEED_GALLERY = [
  { id:'g1', src:'images/gallery-1.jpg', caption:'सम्मान समारोह — वरिष्ठ सैन्य अधिकारी', captionEn:'Honour ceremony with a senior Army officer' },
  { id:'g2', src:'images/gallery-2.jpg', caption:'वीर नारी सम्मान समारोह', captionEn:'Veer Naari Samman Samaroh' },
  { id:'g3', src:'images/gallery-3.jpg', caption:'फौजी भाइयों संग विद्यार्थी', captionEn:'Students meeting soldiers' },
  { id:'g4', src:'images/events-collage.jpg', caption:'हमारे आयोजन — एक झलक', captionEn:'A glimpse of our events' },
  { id:'g5', src:'images/hero-cover.jpg', caption:'सेवा, सुरक्षा, समर्पण', captionEn:'Seva, Suraksha, Samarpan' },
  { id:'g6', src:'images/donate-soldier.jpg', caption:'हर सैनिक के परिवार के साथ', captionEn:'Standing with every soldier’s family' }
];

function bsspLoad(key, seed){
  try{
    const raw = localStorage.getItem(key);
    if(!raw){ localStorage.setItem(key, JSON.stringify(seed)); return JSON.parse(JSON.stringify(seed)); }
    return JSON.parse(raw);
  }catch(e){ return JSON.parse(JSON.stringify(seed)); }
}
function bsspSave(key, data){
  localStorage.setItem(key, JSON.stringify(data));
}
function bsspGetMissions(){ return bsspLoad(BSSP_KEYS.missions, BSSP_SEED_MISSIONS); }
function bsspGetGallery(){ return bsspLoad(BSSP_KEYS.gallery, BSSP_SEED_GALLERY); }
function bsspGetMessages(){ return bsspLoad(BSSP_KEYS.messages, []); }
