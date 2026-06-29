/* ─── PROPERTY PAGE ───────────────────────────────────────────────────────── */
function initPropertyPage() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const p  = PROPERTIES.find(x => x.id === id);

  if (!p) {
    document.getElementById('prop-hero-title').textContent = 'Property not found';
    document.getElementById('prop-hero-location').textContent = 'Please return to the listings page.';
    return;
  }

  RecentlyViewed.track(id);
  document.title = p.title + ' — The Angelo Collection';

  // Hero
  const heroImg = document.getElementById('prop-hero-img');
  if (heroImg) { heroImg.src = p.image; heroImg.alt = p.title; }
  document.getElementById('prop-hero-title').textContent    = p.title;
  document.getElementById('prop-hero-location').textContent = p.location;

  const priceEl = document.getElementById('prop-hero-price');
  if (priceEl) { priceEl.dataset.aed = p.price; priceEl.dataset.fmt = 'full'; priceEl.textContent = fmtFull(p.price); }

  const badgeEl = document.getElementById('prop-hero-badge');
  if (badgeEl && p.badge) badgeEl.innerHTML = `<span class="prop-badge-tag badge-${p.badge.toLowerCase()}">${p.badge.toUpperCase()}</span>`;

  // Specs strip
  const specsEl = document.getElementById('prop-specs-strip');
  if (specsEl) specsEl.innerHTML = [
    [p.beds, 'Bedrooms'], [p.baths, 'Bathrooms'],
    [p.sqft.toLocaleString(), 'Sq Ft'],
    [p.type, 'Type'], [p.year, 'Built'],
    [p.garage + (p.garage === 1 ? ' space' : ' spaces'), 'Garage'],
    [p.furnished ? 'Yes' : 'No', 'Furnished'],
    [p.view, 'View'],
  ].map(([val, lbl]) => `<div class="prop-spec"><span class="prop-spec-val">${val}</span><span class="prop-spec-lbl">${lbl}</span></div>`).join('');

  // Description
  const descEl = document.getElementById('prop-description');
  if (descEl) descEl.textContent = p.description;

  // Features
  const featEl = document.getElementById('prop-features-grid');
  if (featEl) featEl.innerHTML = p.features.map(f =>
    `<div class="prop-feature-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>${f}</div>`
  ).join('');

  // Map address
  const addrEl = document.getElementById('prop-map-address');
  if (addrEl) addrEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;stroke:var(--champagne-dk)"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${p.location}`;

  // Agent card
  const agent   = typeof TEAM !== 'undefined' ? TEAM[0] : null;
  const agentEl = document.getElementById('prop-agent-card');
  if (agentEl && agent) {
    const waMsg = encodeURIComponent(`Hi ${agent.name.split(' ')[0]}, I'm interested in ${p.title} (${fmtFull(p.price)}). Could we arrange a viewing?`);
    const emMsg = encodeURIComponent(`Hi ${agent.name.split(' ')[0]},\n\nI'm interested in ${p.title} (${p.location}).\n\nCould we arrange a viewing?\n\nBest regards,`);
    agentEl.innerHTML = `
      <div class="prop-agent-photo-wrap">
        <img class="prop-agent-photo" src="${agent.photo}" alt="${agent.name}" loading="lazy">
      </div>
      <div class="prop-agent-info">
        <div class="prop-agent-name">${agent.name}</div>
        <div class="prop-agent-title">${agent.title}</div>
        <div class="prop-agent-langs">${agent.languages.join(' · ')}</div>
      </div>
      <div class="prop-agent-btns">
        <a class="btn btn-primary" href="https://wa.me/971585395932?text=${waMsg}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:15px;height:15px;flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp Elsa
        </a>
        <a class="btn btn-outline" href="mailto:${agent.email}?subject=${encodeURIComponent('Property Enquiry: ' + p.title)}&body=${emMsg}">
          Email Elsa
        </a>
        <a class="btn btn-outline" href="tel:${agent.phone.replace(/\s/g,'')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;flex-shrink:0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.05z"/></svg>
          Call Elsa
        </a>
      </div>`;
  }

  // Mortgage estimate
  const monthlyEl = document.getElementById('prop-monthly');
  if (monthlyEl) {
    const res = Mortgage.calc(p.price, 20, 4.49, 25);
    monthlyEl.dataset.aed = Math.round(res.payment);
    monthlyEl.dataset.fmt = 'full';
    monthlyEl.textContent = fmtFull(Math.round(res.payment));
  }

  // Save / compare buttons
  const favBtn = document.getElementById('prop-fav-btn');
  if (favBtn) {
    const updateFav = () => {
      const on = Favourites.has(id);
      favBtn.classList.toggle('fav-active', on);
      favBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;flex-shrink:0" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>${on ? ' Saved' : ' Save Property'}`;
    };
    favBtn.onclick = () => { Favourites.toggle(id); updateFav(); };
    updateFav();
  }

  const cmpBtn = document.getElementById('prop-compare-btn');
  if (cmpBtn) {
    const updateCmp = () => cmpBtn.classList.toggle('selected', Compare.has(id));
    cmpBtn.onclick = () => { Compare.toggle(id); updateCmp(); };
    updateCmp();
  }

  // Leaflet map
  const mapEl = document.getElementById('prop-map');
  const coords = typeof PROPERTY_COORDS !== 'undefined' ? PROPERTY_COORDS[id] : null;
  if (mapEl && coords && typeof L !== 'undefined') {
    const map = L.map('prop-map').setView(coords, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);
    const icon = L.divIcon({
      html: `<div class="prop-map-pin"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
      className: '', iconSize: [38, 38], iconAnchor: [19, 38]
    });
    L.marker(coords, { icon }).addTo(map).bindPopup(`<b>${p.title}</b><br><small>${p.location}</small>`).openPopup();
  } else if (mapEl) {
    mapEl.innerHTML = `<div class="prop-map-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;stroke:var(--champagne)"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>${p.location}</span></div>`;
  }

  // Similar properties
  const similar = PROPERTIES
    .filter(x => x.id !== id && (x.area === p.area || x.type === p.type))
    .slice(0, 4);
  const simGrid = document.getElementById('similar-grid');
  if (simGrid && similar.length) {
    simGrid.innerHTML = similar.map(sp => renderCard(sp)).join('');
    Compare.updateAll();
    Currency.updateDOM();
  } else if (simGrid) {
    document.getElementById('prop-similar-section')?.style.setProperty('display','none');
  }

  // Init shared modules
  Favourites.updateBadge();
  Compare.updateAll();
  Currency.updateDOM();
  RecentlyViewed.renderBanner();
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initPropertyPage();
  Currency.init();

  document.getElementById('compare-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) Compare.closeModal();
  });
  document.getElementById('fav-overlay')?.addEventListener('click', toggleFavPanel);
});
