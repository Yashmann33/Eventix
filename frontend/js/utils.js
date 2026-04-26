// =============================================
//  EVENTURA — Shared Utilities
// =============================================

const API_BASE = '/api';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

// ---- Token Management ----
const Auth = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  },
  setSession: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  isLoggedIn: () => !!localStorage.getItem('token'),
  isAdmin: () => {
    const u = Auth.getUser();
    return u && u.role === 'admin';
  },
  isProposer: () => {
    const u = Auth.getUser();
    return u && u.role === 'proposer';
  },
  isUser: () => {
    const u = Auth.getUser();
    return u && u.role === 'user';
  },
  logout: () => {
    Auth.clearSession();
    window.location.href = 'index.html';
  }
};

// ---- Fetch Wrapper ----
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data;
}

// ---- UI Helpers ----
function showAlert(containerSelector, message, type = 'error') {
  const el = document.querySelector(containerSelector);
  if (!el) return;
  const bgColor = type === 'error' ? 'rgba(239,68,68,0.1)' : type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)';
  const textColor = type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#eab308';
  const borderColor = type === 'error' ? 'rgba(239,68,68,0.2)' : type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)';
  
  el.innerHTML = `<div style="padding: 1rem; background: ${bgColor}; color: ${textColor}; border-radius: 12px; margin-bottom: 1rem; border: 1px solid ${borderColor}; font-weight: 600; font-size: 0.9rem;">${escapeHtml(message)}</div>`;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => { if (el) el.innerHTML = ''; }, 6000);
}

function getCategoryEmoji(cat) {
  // Now returns icons or text instead of emojis
  return ""; 
}

// ---- Navbar Renderer ----
function renderNavbar(activePage = '') {
  const user = Auth.getUser();
  const isLoggedIn = Auth.isLoggedIn();

  const navEl = document.getElementById('navbar');
  if (!navEl) return;

  let authLinks = '';
  if (isLoggedIn && user) {
    authLinks = `
      <div class="nav-auth">
        <span style="color: var(--text-muted); font-size: 0.9rem; margin-right: 0.5rem;">Hi, ${escapeHtml(user.name.split(' ')[0])}</span>
        <button onclick="Auth.logout()" class="btn btn-outline">Logout</button>
      </div>
    `;
  } else {
    authLinks = `
      <div class="nav-auth">
        <a href="login.html" class="btn btn-outline">Login</a>
        <a href="register.html" class="btn btn-primary">Sign Up</a>
      </div>
    `;
  }

  navEl.innerHTML = `
    <a href="index.html" class="brand">Eventura</a>
    <ul class="nav-links">
      <li><a href="events.html" class="${activePage === 'events' ? 'active' : ''}">Events</a></li>
      ${isLoggedIn ? `<li><a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>` : ''}
      ${isLoggedIn && (Auth.isProposer() || Auth.isAdmin()) ? `<li><a href="create-event.html" class="${activePage === 'create' ? 'active' : ''}">Create Event</a></li>` : ''}
    </ul>
    ${authLinks}
  `;
}


// ---- Event Card Renderer ----
function renderEventCard(event, showActions = false) {
  const user = Auth.getUser();
  const canEdit = user && (user.id === event.proposer?._id || user.id === event.proposer || user.role === 'admin');
  const imgContent = event.image
    ? `<img src="${event.image}" alt="${escapeHtml(event.title)}" class="card-image">`
    : `<div class="card-image" style="background: linear-gradient(135deg, #fef2f2, #fdf4ff); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(event.category)}</div>`;

    const attendeeCount = event.attendeesCount || 0;
    const isSaved = user && user.savedEvents && user.savedEvents.includes(event._id);
    const heartSvg = isSaved 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
    
    return `
      <div class="card" onclick="window.location.href='${Auth.isLoggedIn() ? 'dashboard.html' : 'login.html'}'" style="cursor:pointer">
        <div class="card-image-wrap">
          <button class="btn-save" onclick="event.stopPropagation(); ${Auth.isLoggedIn() ? `toggleSave(this, '${event._id}')` : `window.location.href='login.html'`}">${heartSvg}</button>
          ${imgContent}
        </div>
        <div class="card-body">
          <span style="font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">${escapeHtml(event.category)}</span>
          <h3 style="margin:0.3rem 0; font-size:1.15rem;">${escapeHtml(event.title)}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.4;">${escapeHtml((event.description || '').substring(0, 70))}...</p>
          <div class="card-meta">
            <span>📅 ${formatDate(event.date)}</span>
            <span>📍 ${escapeHtml(event.location)}</span>
          </div>
          
          <div class="social-proof">
            <div class="avatars">
              <img src="https://i.pravatar.cc/100?img=${Math.floor(Math.random()*70)}">
              <img src="https://i.pravatar.cc/100?img=${Math.floor(Math.random()*70)}">
              <img src="https://i.pravatar.cc/100?img=${Math.floor(Math.random()*70)}">
            </div>
            <span class="proof-text">${attendeeCount} attending</span>
          </div>
        </div>
      </div>
    `;
}

// ---- Toast Notifications ----
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-message">${escapeHtml(message)}</div>
    <div class="toast-close">&times;</div>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  };

  closeBtn.onclick = removeToast;
  setTimeout(removeToast, 4000);
}
