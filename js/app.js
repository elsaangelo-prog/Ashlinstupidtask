/* ─── UTILS ──────────────────────────────────────────────────────────────── */
const fmt = n => 'AED ' + (n >= 1000000
  ? (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'M'
  : (n / 1000).toFixed(0) + 'K');
const fmtFull = n => 'AED ' + n.toLocaleString();
const fmtAED  = n => n.toLocaleString('en-AE', { style:'currency', currency:'AED', maximumFractionDigits:0 });

/* ─── FAVOURITES ─────────────────────────────────────────────────────────── */
const Favourites = {
  key: 'angelo_favs',
  get()  { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  has(id){ return this.get().includes(id); },
  toggle(id) {
    const favs = this.get();
    const idx  = favs.indexOf(id);
    if (idx === -1) favs.push(id); else favs.splice(idx, 1);
    localStorage.setItem(this.key, JSON.stringify(favs));
    this.updateBadge();
    this.updateButtons(id);
    if (document.getElementById('fav-panel')?.classList.contains('open')) this.renderPanel();
  },
  updateBadge() {
    const count = this.get().length;
    document.querySelectorAll('.fav-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },
  updateButtons(id) {
    document.querySelectorAll(`[data-fav="${id}"]`).forEach(btn => {
      btn.classList.toggle('active', this.has(id));
      btn.setAttribute('aria-label', this.has(id) ? 'Remove from favourites' : 'Save to favourites');
    });
  },
  renderPanel() {
    const panel = document.getElementById('fav-list');
    if (!panel) return;
    const favs  = this.get();
    const props  = PROPERTIES.filter(p => favs.includes(p.id));
    if (props.length === 0) {
      panel.innerHTML = `<div class="fav-empty">
        <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <p>No saved properties yet.</p>
        <p style="font-size:.8rem;margin-top:.5rem">Click the heart on any listing to save it here.</p>
      </div>`;
      return;
    }
    panel.innerHTML = props.map(p => `
      <div class="fav-item">
        <img class="fav-item-img" src="${p.image}" alt="${p.title}" loading="lazy">
        <div class="fav-item-info">
          <div class="fav-item-title">${p.title}</div>
          <div class="fav-item-loc">${p.location}</div>
          <div class="fav-item-price">${fmt(p.price)}</div>
        </div>
        <button class="fav-item-remove" onclick="Favourites.toggle(${p.id})" aria-label="Remove">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`).join('');
  }
};

/* ─── COMPARE ─────────────────────────────────────────────────────────────── */
const Compare = {
  key: 'angelo_compare',
  max: 5,
  get()  { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  has(id){ return this.get().includes(id); },
  toggle(id) {
    const list = this.get();
    const idx  = list.indexOf(id);
    if (idx === -1) {
      if (list.length >= this.max) { alert(`You can compare up to ${this.max} properties at a time.`); return; }
      list.push(id);
    } else { list.splice(idx, 1); }
    localStorage.setItem(this.key, JSON.stringify(list));
    this.updateAll();
  },
  clear() {
    localStorage.removeItem(this.key);
    this.updateAll();
  },
  updateAll() {
    const list  = this.get();
    const bar   = document.getElementById('compare-bar');
    if (bar) {
      bar.classList.toggle('visible', list.length > 0);
      this.renderBar(list);
    }
    document.querySelectorAll('[data-compare]').forEach(btn => {
      const id = parseInt(btn.dataset.compare);
      btn.classList.toggle('selected', this.has(id));
      btn.textContent = this.has(id) ? '✓ Added' : '+ Compare';
    });
    const countEl = document.getElementById('compare-count');
    if (countEl) countEl.textContent = `${list.length} / ${this.max} selected`;
  },
  renderBar(list) {
    const slots = document.getElementById('compare-slots');
    if (!slots) return;
    slots.innerHTML = list.map(id => {
      const p = PROPERTIES.find(x => x.id === id);
      if (!p) return '';
      return `<div class="compare-slot filled">
        <img class="compare-slot-img" src="${p.image}" alt="">
        <div class="compare-slot-text">
          <div class="compare-slot-title">${p.title}</div>
          <div class="compare-slot-price">${fmt(p.price)}</div>
        </div>
        <span class="compare-slot-remove" onclick="Compare.toggle(${p.id})">✕</span>
      </div>`;
    }).join('');
    for (let i = list.length; i < this.max; i++) {
      slots.innerHTML += `<div class="compare-slot"><span>Add property ${i + 1}</span></div>`;
    }
  },
  openModal() {
    const list  = this.get();
    if (list.length < 2) { alert('Select at least 2 properties to compare.'); return; }
    const props = list.map(id => PROPERTIES.find(x => x.id === id)).filter(Boolean);
    const modal = document.getElementById('compare-modal');
    if (!modal) return;

    const cards = props.map(p => `
      <div class="compare-card">
        <img class="compare-card-img" src="${p.image}" alt="${p.title}" loading="lazy">
        <div class="compare-card-body">
          <div class="compare-card-price">${fmt(p.price)}</div>
          <div class="compare-card-title">${p.title}</div>
          <div class="compare-card-loc">${p.location}</div>
        </div>
      </div>`).join('');

    const maxPrice = Math.max(...props.map(p => p.price));
    const minPrice = Math.min(...props.map(p => p.price));
    const maxSqft  = Math.max(...props.map(p => p.sqft));
    const maxBeds  = Math.max(...props.map(p => p.beds));

    const rows = [
      ['Price', p => fmtFull(p.price), p => p.price === minPrice ? 'best' : ''],
      ['Type', p => p.type, () => ''],
      ['Location', p => p.area, () => ''],
      ['Bedrooms', p => p.beds + ' BR', p => p.beds === maxBeds ? 'best' : ''],
      ['Bathrooms', p => p.baths + ' BA', () => ''],
      ['Area (sq ft)', p => p.sqft.toLocaleString(), p => p.sqft === maxSqft ? 'best' : ''],
      ['Price / sq ft', p => 'AED ' + Math.round(p.price / p.sqft).toLocaleString(), () => ''],
      ['Year', p => p.year, () => ''],
      ['Furnished', p => p.furnished ? '✓ Yes' : '✗ No', () => ''],
      ['View', p => p.view, () => ''],
      ['Garage', p => p.garage + ' spaces', () => ''],
    ];

    const tbody = rows.map(([label, val, cls]) =>
      `<tr><th>${label}</th>${props.map(p => `<td class="${cls(p)} value-cell">${val(p)}</td>`).join('')}</tr>`
    ).join('');

    const featureSet = [...new Set(props.flatMap(p => p.features))];
    const featureRows = featureSet.map(f =>
      `<tr><td>${f}</td>${props.map(p => `<td>${p.features.includes(f) ? '<span style="color:var(--forest);font-weight:700">✓</span>' : '<span style="color:var(--gray-lt)">—</span>'}</td>`).join('')}</tr>`
    ).join('');

    document.getElementById('compare-cards').innerHTML = cards;
    document.getElementById('compare-tbody').innerHTML = tbody;
    document.getElementById('compare-features-tbody').innerHTML = featureRows;
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
  },
  closeModal() {
    const modal = document.getElementById('compare-modal');
    if (modal) modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }
};

/* ─── MORTGAGE CALCULATOR ─────────────────────────────────────────────────── */
const Mortgage = {
  calc(price, downPct, rate, years) {
    const loan     = price * (1 - downPct / 100);
    const monthly  = rate / 100 / 12;
    const n        = years * 12;
    const payment  = monthly === 0 ? loan / n
      : loan * (monthly * Math.pow(1 + monthly, n)) / (Math.pow(1 + monthly, n) - 1);
    const total    = payment * n;
    const interest = total - loan;
    const dld      = price * 0.04;
    const regFee   = loan * 0.0025 + 290;
    const agentFee = price * 0.02;
    return { loan, payment, total, interest, downAmt: price * downPct / 100, dld, regFee, agentFee };
  },
  init() {
    const el = id => document.getElementById(id);
    const r  = (sel, val) => { const e = document.querySelector(sel); if (e) e.textContent = val; };

    const update = () => {
      const price   = parseFloat(el('calc-price')?.value || 0);
      const downPct = parseFloat(el('calc-down')?.value || 20);
      const rate    = parseFloat(el('calc-rate')?.value || 4.49);
      const years   = parseFloat(el('calc-years')?.value || 25);

      r('#calc-price-val',  fmtFull(price));
      r('#calc-down-val',   downPct + '% — ' + fmt(price * downPct / 100));
      r('#calc-rate-val',   rate.toFixed(2) + '%');
      r('#calc-years-val',  years + ' years');

      if (!price) return;
      const res = this.calc(price, downPct, rate, years);

      r('#monthly-payment', fmtFull(Math.round(res.payment)));
      r('#total-loan',      fmtFull(Math.round(res.loan)));
      r('#down-amount',     fmtFull(Math.round(res.downAmt)));
      r('#total-interest',  fmtFull(Math.round(res.interest)));
      r('#total-payment',   fmtFull(Math.round(res.total)));
      r('#dld-fee',         fmtFull(Math.round(res.dld)));
      r('#reg-fee',         fmtFull(Math.round(res.regFee)));
      r('#agent-fee',       fmtFull(Math.round(res.agentFee)));

      const interestRatio = Math.round((res.interest / res.total) * 100);
      const barFill = document.getElementById('interest-bar');
      if (barFill) barFill.style.width = interestRatio + '%';
      r('#interest-pct', interestRatio + '%');
      r('#principal-pct', (100 - interestRatio) + '%');
    };

    ['calc-price','calc-down','calc-rate','calc-years'].forEach(id => {
      const el2 = el(id);
      if (el2) { el2.addEventListener('input', update); }
    });
    update();
  }
};

/* ─── RENDER CARDS ───────────────────────────────────────────────────────── */
function renderCard(p) {
  const isFav  = Favourites.has(p.id);
  const isCmp  = Compare.has(p.id);
  const badge  = p.badge ? `<div class="card-badge badge-${p.badge.toLowerCase()}">${p.badge}</div>` : '';
  return `
  <div class="property-card" id="prop-${p.id}">
    <div class="card-image-wrap">
      <img src="${p.image}" alt="${p.title}" loading="lazy">
      ${badge}
      <button class="card-fav-btn ${isFav ? 'active' : ''}" data-fav="${p.id}"
        onclick="Favourites.toggle(${p.id})" aria-label="${isFav ? 'Remove from favourites' : 'Save to favourites'}">
        <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <div class="card-compare-wrap">
        <button class="card-compare-btn ${isCmp ? 'selected' : ''}" data-compare="${p.id}"
          onclick="Compare.toggle(${p.id})">${isCmp ? '✓ Added' : '+ Compare'}</button>
      </div>
    </div>
    <div class="card-body">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem">
        <div class="card-price">${fmt(p.price)}</div>
        <span class="card-type-tag">${p.type}</span>
      </div>
      <div class="card-title">${p.title}</div>
      <div class="card-location">
        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${p.location}
      </div>
      <div class="card-meta">
        <div class="card-meta-item">
          <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          ${p.beds} BR
        </div>
        <div class="card-meta-item">
          <svg viewBox="0 0 24 24"><path d="M9 6 C9 4.34 7.66 3 6 3 C4.34 3 3 4.34 3 6 L3 20 L21 20 L21 11 C21 9.34 19.66 8 18 8 L9 8 L9 6 Z"/></svg>
          ${p.baths} BA
        </div>
        <div class="card-meta-item">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          ${p.sqft.toLocaleString()} sqft
        </div>
      </div>
    </div>
    <div class="card-footer">
      <button class="btn btn-outline" style="font-size:.68rem;padding:.55rem .8rem"
        onclick="Compare.toggle(${p.id})">${isCmp ? '✓ Comparing' : '+ Compare'}</button>
      <button class="btn btn-primary" style="font-size:.68rem;padding:.55rem .8rem"
        onclick="showPropertyDetail(${p.id})">View Details</button>
    </div>
  </div>`;
}

/* ─── PROPERTY DETAIL MODAL ──────────────────────────────────────────────── */
function showPropertyDetail(id) {
  const p = PROPERTIES.find(x => x.id === id);
  if (!p) return;
  const overlay = document.getElementById('detail-modal');
  if (!overlay) return;

  document.getElementById('detail-modal-content').innerHTML = `
    <div class="modal-header">
      <div>
        <h3>${p.title}</h3>
        <div style="color:var(--champagne);font-size:.8rem;margin-top:.2rem">${p.location}</div>
      </div>
      <button class="modal-close" onclick="closeDetailModal()">✕</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
      <div>
        <img src="${p.image}" alt="${p.title}" style="width:100%;height:360px;object-fit:cover">
      </div>
      <div style="padding:2rem">
        <div style="font-family:'Cormorant Garamond',serif;font-size:2.2rem;color:var(--forest);margin-bottom:.75rem">${fmtFull(p.price)}</div>
        <div style="display:flex;gap:1.5rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border-lt)">
          <span style="font-size:.85rem"><strong>${p.beds}</strong> Bedrooms</span>
          <span style="font-size:.85rem"><strong>${p.baths}</strong> Bathrooms</span>
          <span style="font-size:.85rem"><strong>${p.sqft.toLocaleString()}</strong> sqft</span>
          <span style="font-size:.85rem"><strong>${p.type}</strong></span>
        </div>
        <p style="font-size:.88rem;line-height:1.75;color:var(--gray-dk);margin-bottom:1.5rem">${p.description}</p>
        <div style="margin-bottom:1.5rem">
          <div style="font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--forest);margin-bottom:.75rem">Key Features</div>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem">
            ${p.features.map(f => `<span style="padding:.3rem .75rem;background:var(--cream);border-radius:4px;font-size:.75rem;color:var(--forest)">${f}</span>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:.75rem;margin-top:1.5rem">
          <button class="btn btn-primary" onclick="closeDetailModal()">Request Viewing</button>
          <button class="btn btn-gold" onclick="Favourites.toggle(${p.id});closeDetailModal()">♡ Save</button>
        </div>
      </div>
    </div>`;

  overlay.classList.add('open');
  document.body.classList.add('no-scroll');
}
function closeDetailModal() {
  document.getElementById('detail-modal')?.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

/* ─── FILTER ENGINE ──────────────────────────────────────────────────────── */
const Filter = {
  state: { area: '', type: '', minPrice: '', maxPrice: '', beds: '', baths: '', features: [], sort: 'featured' },

  apply() {
    const s = this.state;
    let results = [...PROPERTIES];

    if (s.area)     results = results.filter(p => p.area === s.area);
    if (s.type)     results = results.filter(p => p.type === s.type);
    if (s.beds)     results = results.filter(p => s.beds === '7+' ? p.beds >= 7 : p.beds >= parseInt(s.beds));
    if (s.baths)    results = results.filter(p => p.baths >= parseInt(s.baths));
    if (s.minPrice) results = results.filter(p => p.price >= parseFloat(s.minPrice));
    if (s.maxPrice) results = results.filter(p => p.price <= parseFloat(s.maxPrice));
    if (s.features.length) results = results.filter(p => s.features.every(f => p.features.includes(f)));

    switch (s.sort) {
      case 'price-high': results.sort((a, b) => b.price - a.price); break;
      case 'price-low':  results.sort((a, b) => a.price - b.price); break;
      case 'sqft-high':  results.sort((a, b) => b.sqft  - a.sqft);  break;
      case 'newest':     results.sort((a, b) => b.year  - a.year);  break;
    }

    return results;
  },

  renderResults() {
    const grid   = document.getElementById('listings-grid');
    const countEl = document.getElementById('listings-count');
    if (!grid) return;
    const results = this.apply();
    if (countEl) countEl.textContent = `${results.length} ${results.length === 1 ? 'property' : 'properties'} found`;
    const countEl2 = document.getElementById('listings-count-main');
    if (countEl2) countEl2.textContent = `${results.length} ${results.length === 1 ? 'property' : 'properties'}`;
    grid.innerHTML = results.length
      ? results.map(p => renderCard(p)).join('')
      : `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--gray)">
          <div style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:var(--forest);margin-bottom:.5rem">No properties found</div>
          <p>Try adjusting your filters.</p>
          <button class="btn btn-outline" onclick="Filter.clearAll()" style="margin-top:1rem">Clear Filters</button>
        </div>`;
    Compare.updateAll();
  },

  clearAll() {
    this.state = { area: '', type: '', minPrice: '', maxPrice: '', beds: '', baths: '', features: [], sort: 'featured' };
    document.querySelectorAll('.filter-select').forEach(el => { el.value = ''; });
    document.querySelectorAll('.price-input').forEach(el => { el.value = ''; });
    document.querySelectorAll('.bed-btn').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.filter-check-item input').forEach(el => { el.checked = false; });
    this.renderResults();
  }
};

/* ─── NAV BEHAVIOUR ──────────────────────────────────────────────────────── */
function initNav() {
  const nav  = document.querySelector('.nav');
  if (!nav) return;
  const hero = document.querySelector('.hero');

  if (hero) {
    nav.classList.add('transparent');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled',    window.scrollY > 60);
      nav.classList.toggle('transparent', window.scrollY <= 60);
    }, { passive: true });
  } else {
    nav.classList.add('dark-page');
  }

  // Mobile menu
  const hamburger  = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuClose  = document.getElementById('mobile-menu-close');
  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.add('open');
    document.body.classList.add('no-scroll');
  });
  menuClose?.addEventListener('click', closeMobileMenu);
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
}
function closeMobileMenu() {
  document.getElementById('mobile-menu')?.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

/* ─── FAVOURITES PANEL ───────────────────────────────────────────────────── */
function toggleFavPanel() {
  const panel = document.getElementById('fav-panel');
  const isOpen = panel?.classList.toggle('open');
  if (isOpen) { Favourites.renderPanel(); document.body.classList.add('no-scroll'); }
  else         document.body.classList.remove('no-scroll');
}

/* ─── TESTIMONIALS CAROUSEL ──────────────────────────────────────────────── */
let testiIdx = 0;

function initTestimonials() {
  const track = document.getElementById('testimonials-track');
  if (!track || typeof TESTIMONIALS === 'undefined' || !TESTIMONIALS.length) return;

  track.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <span class="testimonial-quote-mark">"</span>
      <p class="testimonial-text">${t.quote}</p>
      <div class="testimonial-author">
        <img class="testimonial-photo" src="${t.photo}" alt="${t.name}" loading="lazy">
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-detail">${t.detail}</div>
        </div>
      </div>
    </div>`).join('');

  const pageCount = Math.ceil(TESTIMONIALS.length / 3);
  const dots = document.getElementById('testi-dots');
  if (dots) {
    dots.innerHTML = Array.from({length: pageCount}, (_, i) =>
      `<button class="testi-dot${i===0?' active':''}" onclick="testiGoTo(${i*3})" aria-label="Page ${i+1}"></button>`
    ).join('');
  }

  testiSetCardWidths();
  updateTestiNav();
  window.addEventListener('resize', () => { testiSetCardWidths(); updateTestiNav(); }, { passive:true });
}

function testiSetCardWidths() {
  const viewport = document.getElementById('testi-viewport');
  const track    = document.getElementById('testimonials-track');
  if (!viewport || !track) return;
  const isMobile = window.innerWidth <= 768;
  const visible  = isMobile ? 1 : 3;
  const gap      = isMobile ? 16 : 32;
  const w        = viewport.offsetWidth;
  const cardW    = Math.floor((w - (visible - 1) * gap) / visible);
  track.querySelectorAll('.testimonial-card').forEach(c => { c.style.width = cardW + 'px'; });
}

function testiNav(dir) {
  const visible = window.innerWidth <= 768 ? 1 : 3;
  testiGoTo(testiIdx + dir * visible);
}

function testiGoTo(idx) {
  const visible = window.innerWidth <= 768 ? 1 : 3;
  const total   = typeof TESTIMONIALS !== 'undefined' ? TESTIMONIALS.length : 0;
  testiIdx = Math.max(0, Math.min(idx, total - visible));
  updateTestiNav();
}

function updateTestiNav() {
  const track = document.getElementById('testimonials-track');
  if (!track) return;
  const cards   = track.querySelectorAll('.testimonial-card');
  if (!cards.length) return;
  const isMobile = window.innerWidth <= 768;
  const visible  = isMobile ? 1 : 3;
  const gap      = isMobile ? 16 : 32;
  const cardW    = cards[0].offsetWidth;
  const total    = typeof TESTIMONIALS !== 'undefined' ? TESTIMONIALS.length : 0;

  track.style.transform = `translateX(-${testiIdx * (cardW + gap)}px)`;

  const prev = document.getElementById('testi-prev');
  const next = document.getElementById('testi-next');
  if (prev) prev.disabled = testiIdx <= 0;
  if (next) next.disabled = testiIdx >= total - visible;

  const pageIdx = Math.round(testiIdx / 3);
  document.querySelectorAll('.testi-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === pageIdx);
  });
}

/* ─── ADVISORS ───────────────────────────────────────────────────────────── */
function initAdvisors() {
  const grid = document.getElementById('advisors-grid');
  if (!grid || typeof TEAM === 'undefined' || !TEAM.length) return;
  grid.innerHTML = TEAM.map(m => `
    <div class="advisor-card">
      <div class="advisor-photo-wrap">
        <img src="${m.photo}" alt="${m.name}" loading="lazy">
        <div class="advisor-photo-overlay"></div>
      </div>
      <div class="advisor-info">
        <div class="advisor-name">${m.name}</div>
        <div class="advisor-title">${m.title}</div>
        <p class="advisor-bio">${m.bio}</p>
        <div class="advisor-contact">
          <a href="tel:${m.phone}">
            <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.05z"/></svg>
            ${m.phone}
          </a>
          <a href="mailto:${m.email}">
            <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Email
          </a>
        </div>
      </div>
    </div>`).join('');
}

/* ─── LISTINGS PAGE INIT ─────────────────────────────────────────────────── */
function initListingsPage() {
  const grid = document.getElementById('listings-grid');
  if (!grid) return;

  Filter.renderResults();

  // Area filter
  document.getElementById('filter-area')?.addEventListener('change', e => {
    Filter.state.area = e.target.value; Filter.renderResults();
  });
  document.getElementById('filter-type')?.addEventListener('change', e => {
    Filter.state.type = e.target.value; Filter.renderResults();
  });
  document.getElementById('sort-select')?.addEventListener('change', e => {
    Filter.state.sort = e.target.value; Filter.renderResults();
  });
  document.getElementById('filter-min-price')?.addEventListener('input', e => {
    Filter.state.minPrice = e.target.value; Filter.renderResults();
  });
  document.getElementById('filter-max-price')?.addEventListener('input', e => {
    Filter.state.maxPrice = e.target.value; Filter.renderResults();
  });

  // Bed buttons
  document.querySelectorAll('.bed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.beds;
      if (Filter.state.beds === val) { Filter.state.beds = ''; btn.classList.remove('active'); }
      else {
        document.querySelectorAll('.bed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Filter.state.beds = val;
      }
      Filter.renderResults();
    });
  });

  // Feature checkboxes
  document.querySelectorAll('.feature-check').forEach(cb => {
    cb.addEventListener('change', () => {
      Filter.state.features = [...document.querySelectorAll('.feature-check:checked')].map(el => el.value);
      Filter.renderResults();
    });
  });

  // View toggle
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const grid2 = document.getElementById('listings-grid');
      if (btn.dataset.view === 'list') grid2?.classList.add('list-view');
      else grid2?.classList.remove('list-view');
    });
  });

  // Clear
  document.getElementById('clear-filters')?.addEventListener('click', () => Filter.clearAll());
  document.getElementById('apply-filters')?.addEventListener('click', () => Filter.renderResults());
}

/* ─── HOME PAGE: FEATURED LISTINGS ──────────────────────────────────────── */
function initHomeFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const featured = PROPERTIES.filter(p => p.badge === 'Exclusive').slice(0, 9);
  grid.innerHTML = featured.map(p => renderCard(p)).join('');
  Compare.updateAll();
}

/* ─── MAIN INIT ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  Favourites.updateBadge();
  Compare.updateAll();
  initTestimonials();
  initAdvisors();
  initHomeFeatured();
  initListingsPage();
  Mortgage.init();

  // Close modals on overlay click
  document.getElementById('compare-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) Compare.closeModal();
  });
  document.getElementById('detail-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDetailModal();
  });

  // Fav panel overlay close
  document.getElementById('fav-overlay')?.addEventListener('click', toggleFavPanel);
});
