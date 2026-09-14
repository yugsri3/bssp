document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('footer-placeholder');
  if(!el) return;
  el.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="brand-foot">
            <img src="images/logo.jpeg" alt="BSSP Logo">
            <div>
              <strong style="color:#fff;">भारतीय सैनिक सहायता परिषद</strong><br>
              <span class="small" style="color:#8f9ac3;">Bhartiya Sainik Sahayta Parishad</span>
            </div>
          </div>
          <p style="color:#8f9ac3; font-size:.9rem;">वीरगति प्राप्त व पूर्व सैनिकों के परिवारों की शिक्षा, वित्तीय व भावनात्मक सहायता हेतु समर्पित एक गैर-लाभकारी संस्था।</p>
          <div class="social-row">
            <a href="https://www.facebook.com/bssp2020/" aria-label="Facebook">f</a>
            <a href="https://twitter.com/bssp2020" aria-label="Twitter">𝕏</a>
            <a href="https://www.instagram.com/invites/contact/?i=1cxjv952318p1&utm_content=mp1k1cf" aria-label="Instagram">◎</a>
            <a href="https://youtube.com/channel/UCCBNr_TM0PqXvwgngwAQhQA" aria-label="YouTube">▶</a>
          </div>
        </div>
        <div>
          <h4>क्विक लिंक</h4>
          <ul>
            <li><a href="about.html">हमारे बारे में</a></li>
            <li><a href="missions.html">मिशन</a></li>
            <li><a href="gallery.html">गैलरी</a></li>
            <li><a href="donate.html">दान करें</a></li>
            <li><a href="contact.html">संपर्क करें</a></li>
          </ul>
        </div>
        <div>
          <h4>संपर्क सूत्र</h4>
          <ul>
            <li>📍 P.P.N. Market, कानपुर, उत्तर प्रदेश</li>
            <li>📞 <a href="tel:+917607222333">+91-7607222333</a></li>
            <li>✉️ <a href="mailto:support@bssp.co.in">support@bssp.co.in</a></li>
            <li>🌐 <a href="https://www.bssp.co.in">www.bssp.co.in</a></li>
          </ul>
        </div>
        <div>
          <h4>बैंक विवरण</h4>
          <ul>
            <li>Indian Bank, P.P.N. Market</li>
            <li>A/c: 7959254842</li>
            <li>IFSC: IDIB000K587</li>
            <li>UPI: bssb@indianbk</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span data-year></span> Bhartiya Sainik Sahayta Parishad. सर्वाधिकार सुरक्षित।</span>
        <span><a href="admin.html">Admin Login</a></span>
      </div>
    </div>
  </footer>`;
  if (typeof initYear === 'function') initYear();
  document.querySelectorAll('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
});
