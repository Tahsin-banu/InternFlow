/* ================================================================
   InternFlow — script.js
   Full Vanilla JS | localStorage | No frameworks
   ================================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   1. APP STATE & CONSTANTS
────────────────────────────────────────────────────────────── */
const KEYS = {
  USERS:        'if_users',
  CURRENT_USER: 'if_current_user',
  TASKS:        'if_tasks',
  THEME:        'if_theme',
  PROFILE:      'if_profile',
  NOTIFS:       'if_notifs',
};

let currentUser   = null;
let allTasks      = [];
let notifications = [];
let deleteTargetId = null;
let calendarDate   = new Date();
let chartInstance  = null;

/* ──────────────────────────────────────────────────────────────
   2. UTILITY HELPERS
────────────────────────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const store = {
  get: (key, fallback = null) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { console.warn('Storage error', e); }
  },
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function daysFromNow(dateStr) {
  if (!dateStr) return Infinity;
  const diff = new Date(dateStr + 'T00:00:00') - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getInitials(name = '') {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function escHtml(str = '') {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ──────────────────────────────────────────────────────────────
   3. TOAST NOTIFICATIONS
────────────────────────────────────────────────────────────── */
function showToast(msg, type = 'info', duration = 3000) {
  const icons = { success: 'bx-check-circle', error: 'bx-x-circle', info: 'bx-info-circle' };
  const container = $('#toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="bx ${icons[type] || icons.info} toast-icon"></i>
    <span>${escHtml(msg)}</span>
    <i class="bx bx-x toast-close" role="button" aria-label="Close"></i>`;

  // Close on click
  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
  container.appendChild(toast);

  // Auto-remove
  const timer = setTimeout(() => removeToast(toast), duration);
  toast._timer = timer;
}

function removeToast(toast) {
  if (!toast || !toast.parentNode) return;
  clearTimeout(toast._timer);
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

/* ──────────────────────────────────────────────────────────────
   4. LOADING SCREEN
────────────────────────────────────────────────────────────── */
function hideLoader() {
  const screen = $('#loadingScreen');
  if (!screen) return;
  setTimeout(() => {
    screen.classList.add('fade-out');
    screen.addEventListener('transitionend', () => screen.remove(), { once: true });
  }, 1400);
}

/* ──────────────────────────────────────────────────────────────
   5. THEME MANAGEMENT
────────────────────────────────────────────────────────────── */
function applyTheme(isDark) {
  document.body.classList.toggle('dark-mode',  isDark);
  document.body.classList.toggle('light-mode', !isDark);

  const icon     = $('#themeIcon');
  const toggle   = $('#settingTheme');

  if (icon)   icon.className   = isDark ? 'bx bx-moon' : 'bx bx-sun';
  if (toggle) toggle.checked   = !isDark; // checked = light mode in the UI label

  store.set(KEYS.THEME, isDark ? 'dark' : 'light');
}

function toggleTheme() {
  const isDark = document.body.classList.contains('dark-mode');
  applyTheme(!isDark); // flip
}

function initTheme() {
  const saved = store.get(KEYS.THEME, 'dark');
  applyTheme(saved === 'dark');
}

/* ──────────────────────────────────────────────────────────────
   6. AUTH — REGISTER / LOGIN / LOGOUT
────────────────────────────────────────────────────────────── */
function showAuthError(elId, msg) {
  const el = $(`#${elId}`);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

function switchToRegister() {
  $('#loginForm').classList.remove('active-form');
  $('#registerForm').classList.add('active-form');
  $('#loginError').classList.add('hidden');
}

function switchToLogin() {
  $('#registerForm').classList.remove('active-form');
  $('#loginForm').classList.add('active-form');
  $('#registerError').classList.add('hidden');
}

function handleRegister(e) {
  e.preventDefault();
  const name     = $('#regName').value.trim();
  const email    = $('#regEmail').value.trim().toLowerCase();
  const password = $('#regPassword').value;

  if (!name || !email || !password)       return showAuthError('registerError', 'All fields are required.');
  if (!/\S+@\S+\.\S+/.test(email))       return showAuthError('registerError', 'Please enter a valid email.');
  if (password.length < 6)               return showAuthError('registerError', 'Password must be at least 6 characters.');

  const users = store.get(KEYS.USERS, []);
  if (users.find(u => u.email === email)) return showAuthError('registerError', 'An account with this email already exists.');

  const newUser = { id: uid(), name, email, password, createdAt: Date.now() };
  users.push(newUser);
  store.set(KEYS.USERS, users);
  store.set(KEYS.CURRENT_USER, newUser);

  showToast(`Welcome to InternFlow, ${name}! 🎉`, 'success');
  loadApp(newUser);
}

function handleLogin(e) {
  e.preventDefault();
  const email    = $('#loginEmail').value.trim().toLowerCase();
  const password = $('#loginPassword').value;

  if (!email || !password) return showAuthError('loginError', 'Both fields are required.');

  const users = store.get(KEYS.USERS, []);
  const user  = users.find(u => u.email === email && u.password === password);
  if (!user) return showAuthError('loginError', 'Invalid email or password. Please try again.');

  store.set(KEYS.CURRENT_USER, user);
  showToast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');
  loadApp(user);
}

function handleLogout() {
  store.set(KEYS.CURRENT_USER, null);
  currentUser = null;
  allTasks    = [];

  $('#appSection').classList.add('hidden');
  $('#authSection').classList.remove('hidden');
  switchToLogin();

  // Reset form fields
  $('#loginEmail').value    = '';
  $('#loginPassword').value = '';

  showToast('You have been signed out.', 'info');
}

/* ──────────────────────────────────────────────────────────────
   7. PASSWORD VISIBILITY TOGGLE
────────────────────────────────────────────────────────────── */
function setupPasswordToggles() {
  [['toggleLoginPw', 'loginPassword'], ['toggleRegPw', 'regPassword']].forEach(([btnId, inputId]) => {
    const btn   = $(`#${btnId}`);
    const input = $(`#${inputId}`);
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isText = input.type === 'text';
      input.type   = isText ? 'password' : 'text';
      btn.className = isText ? 'bx bx-hide toggle-pw' : 'bx bx-show toggle-pw';
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   8. PAGE NAVIGATION
────────────────────────────────────────────────────────────── */
const PAGE_TITLES = {
  dashboard:     'Dashboard',
  submit:        'Submit Task',
  tasks:         'My Tasks',
  calendar:      'Calendar',
  profile:       'My Profile',
  notifications: 'Notifications',
  settings:      'Settings',
};

function navigateTo(pageKey) {
  if (!PAGE_TITLES[pageKey]) return;

  // Hide all pages
  $$('.page').forEach(p => p.classList.remove('active-page'));

  // Show target
  const target = $(`#page-${pageKey}`);
  if (target) target.classList.add('active-page');

  // Update nav links
  $$('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageKey);
  });

  // Update topbar title
  const titleEl = $('#pageTitle');
  if (titleEl) titleEl.textContent = PAGE_TITLES[pageKey];

  // Close sidebar on mobile
  closeSidebarMobile();

  // Page-specific refresh
  const refreshMap = {
    dashboard:     refreshDashboard,
    tasks:         renderTasksGrid,
    calendar:      renderCalendar,
    profile:       refreshProfile,
    notifications: renderNotifications,
    settings:      refreshSettings,
    submit:        refreshSubmitPage,
  };
  if (refreshMap[pageKey]) refreshMap[pageKey]();
}

/* ──────────────────────────────────────────────────────────────
   9. SIDEBAR — MOBILE TOGGLE
────────────────────────────────────────────────────────────── */
function openSidebarMobile() {
  $('#sidebar').classList.add('open');
  $('#sidebarOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebarMobile() {
  $('#sidebar').classList.remove('open');
  $('#sidebarOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────────
   10. TASK DATA HELPERS
────────────────────────────────────────────────────────────── */
function loadTasks() {
  const all = store.get(KEYS.TASKS, []);
  allTasks  = all.filter(t => t.userId === currentUser.id);
}

function saveTasks() {
  const others = store.get(KEYS.TASKS, []).filter(t => t.userId !== currentUser.id);
  store.set(KEYS.TASKS, [...others, ...allTasks]);
}

function getUserTasks() { return [...allTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }

function getStats() {
  const tasks    = getUserTasks();
  const total    = tasks.length;
  const pending  = tasks.filter(t => t.status === 'pending').length;
  const completed= tasks.filter(t => t.status === 'completed').length;
  const now      = new Date();
  const weekAgo  = new Date(now - 7 * 86400000);
  const thisWeek = tasks.filter(t => new Date(t.createdAt) >= weekAgo).length;
  return { total, pending, completed, thisWeek };
}

/* ──────────────────────────────────────────────────────────────
   11. SUBMIT TASK PAGE
────────────────────────────────────────────────────────────── */
function refreshSubmitPage() {
  // Set today's date as default
  const dateInput = $('#taskDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

function handleTaskSubmit(e) {
  e.preventDefault();
  const title  = $('#taskTitle').value.trim();
  const desc   = $('#taskDesc').value.trim();
  const date   = $('#taskDate').value;
  const status = $('#taskStatus').value;
  const domain = $('#taskDomain').value;
  const file   = $('#fileName').textContent;

  if (!title) return showFieldError('taskError', 'Task title is required.');
  if (!desc)  return showFieldError('taskError', 'Description is required.');
  if (!date)  return showFieldError('taskError', 'Submission date is required.');

  const task = {
    id: uid(), userId: currentUser.id,
    title, desc, date, status, domain,
    fileName: file || null,
    createdAt: new Date().toISOString(),
  };

  allTasks.push(task);
  saveTasks();

  // Add notification
  addNotification(`Task "${title}" was submitted successfully. ✅`, 'success');

  showToast('Task submitted successfully! ✅', 'success');
  resetTaskForm();
  navigateTo('tasks');
}

function showFieldError(elId, msg) {
  const el = $(`#${elId}`);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

function resetTaskForm() {
  $('#taskForm').reset();
  $('#fileName').textContent = '';
  $('#taskError').classList.add('hidden');
  // Reset date
  $('#taskDate').value = new Date().toISOString().split('T')[0];
}

/* ── Drag-and-drop upload ── */
function setupDropZone() {
  const zone  = $('#dropZone');
  const input = $('#fileInput');
  const name  = $('#fileName');
  if (!zone || !input || !name) return;

  // Click to open file picker
  zone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'INPUT') input.click();
  });

  // File input change
  input.addEventListener('change', () => {
    if (input.files[0]) {
      name.textContent = `📎 ${input.files[0].name}`;
      showToast(`File attached: ${input.files[0].name}`, 'info');
    }
  });

  // Drag events
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
      name.textContent = `📎 ${file.name}`;
      showToast(`File attached: ${file.name}`, 'info');
    }
  });
}

/* ──────────────────────────────────────────────────────────────
   12. DASHBOARD
────────────────────────────────────────────────────────────── */
function refreshDashboard() {
  const stats = getStats();

  // Stats cards
  $('#statTotal').textContent     = stats.total;
  $('#statPending').textContent   = stats.pending;
  $('#statCompleted').textContent = stats.completed;
  $('#statWeek').textContent      = stats.thisWeek;

  // Welcome message
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser.name.split(' ')[0];
  $('#welcomeMsg').textContent = `${greet}, ${firstName}! 👋`;

  // Current date
  const dateEl = $('#welcomeDate');
  if (dateEl) {
    const now = new Date();
    dateEl.innerHTML = `
      <div>${now.toLocaleDateString('en-US', { weekday: 'long' })}</div>
      <div>${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>`;
  }

  renderRecentList();
  renderDeadlines();
  renderActivityChart();
}

/* ── Recent Submissions ── */
function renderRecentList() {
  const container = $('#recentList');
  if (!container) return;
  const tasks = getUserTasks().slice(0, 5);

  if (!tasks.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="bx bx-inbox"></i></div>
        <h3>No submissions yet</h3>
        <p>Submit your first task to see it here.</p>
      </div>`;
    return;
  }

  container.innerHTML = tasks.map(t => `
    <div class="recent-item">
      <div class="recent-item-icon"><i class="bx bx-file-blank"></i></div>
      <div class="recent-item-info">
        <div class="recent-item-title">${escHtml(t.title)}</div>
        <div class="recent-item-date">${formatDate(t.date)} · ${escHtml(t.domain)}</div>
      </div>
      <span class="badge ${t.status === 'completed' ? 'badge-green' : 'badge-warn'} recent-item-status">
        ${t.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
      </span>
    </div>`).join('');
}

/* ── Upcoming Deadlines ── */
function renderDeadlines() {
  const container = $('#deadlineList');
  if (!container) return;

  const upcoming = getUserTasks()
    .filter(t => t.status !== 'completed' && t.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (!upcoming.length) {
    container.innerHTML = `<li class="empty-state-small">🎉 No upcoming deadlines</li>`;
    return;
  }

  container.innerHTML = upcoming.map(t => {
    const days = daysFromNow(t.date);
    const dotColor  = days < 0 ? 'red' : days <= 3 ? 'yellow' : 'green';
    const label     = days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days}d left`;
    return `
      <li class="deadline-item">
        <span class="deadline-dot ${dotColor}"></span>
        <span style="flex:1;font-size:0.85rem;font-weight:500">${escHtml(t.title)}</span>
        <span class="deadline-meta">${formatDate(t.date)}</span>
        <span class="badge ${dotColor === 'red' ? 'badge-red' : dotColor === 'yellow' ? 'badge-warn' : 'badge-green'}">
          ${label}
        </span>
      </li>`;
  }).join('');
}

/* ── Activity Chart (vanilla canvas) ── */
function renderActivityChart() {
  const canvas = $('#activityChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Build last-7-days data
  const labels = [], counts = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    counts.push(allTasks.filter(t => t.createdAt && t.createdAt.startsWith(iso)).length);
  }

  // Responsive sizing
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = 200         * dpr;
  canvas.style.width  = rect.width + 'px';
  canvas.style.height = '200px';
  ctx.scale(dpr, dpr);

  const W = rect.width, H = 200;
  const pad = { top: 20, right: 20, bottom: 40, left: 36 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top  - pad.bottom;
  const maxVal = Math.max(...counts, 1);

  // Colors from CSS vars (resolve via computed style)
  const cs    = getComputedStyle(document.body);
  const accent = '#FF8C6B';
  const accentSoft = '#FFB4A2';
  const gridColor = 'rgba(255,255,255,0.06)';
  const textColor = cs.getPropertyValue('--text-muted').trim() || '#64748B';

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();

    // Y axis labels
    const val = Math.round(maxVal - (maxVal / 4) * i);
    ctx.fillStyle = textColor;
    ctx.font = `11px Inter, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(val, pad.left - 6, y + 4);
  }

  if (counts.length === 0) return;

  const stepX = chartW / (counts.length - 1 || 1);

  // Points
  const pts = counts.map((c, i) => ({
    x: pad.left + i * stepX,
    y: pad.top  + chartH - (c / maxVal) * chartH,
  }));

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  grad.addColorStop(0,   'rgba(255,140,107,0.30)');
  grad.addColorStop(1,   'rgba(255,140,107,0.01)');

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i-1].x + (pts[i].x - pts[i-1].x) / 2;
    ctx.bezierCurveTo(cp1x, pts[i-1].y, cp1x, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
  ctx.lineTo(pts[0].x, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i-1].x + (pts[i].x - pts[i-1].x) / 2;
    ctx.bezierCurveTo(cp1x, pts[i-1].y, cp1x, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  // Dots + X labels
  pts.forEach((pt, i) => {
    // Dot
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
    ctx.fillStyle   = counts[i] > 0 ? accent : '#2E3F55';
    ctx.strokeStyle = counts[i] > 0 ? accentSoft : '#2E3F55';
    ctx.lineWidth   = 2;
    ctx.fill();
    ctx.stroke();

    // Count label above dot
    if (counts[i] > 0) {
      ctx.fillStyle  = accent;
      ctx.font       = `bold 11px Inter, sans-serif`;
      ctx.textAlign  = 'center';
      ctx.fillText(counts[i], pt.x, pt.y - 10);
    }

    // X axis label
    ctx.fillStyle = textColor;
    ctx.font      = `11px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], pt.x, H - 8);
  });
}

/* ──────────────────────────────────────────────────────────────
   13. MY TASKS PAGE
────────────────────────────────────────────────────────────── */
function renderTasksGrid(searchVal = '', filterDateVal = '', filterStatusVal = 'all') {
  const grid = $('#tasksGrid');
  if (!grid) return;

  let tasks = getUserTasks();

  // Apply filters
  if (searchVal)       tasks = tasks.filter(t => t.title.toLowerCase().includes(searchVal.toLowerCase()));
  if (filterDateVal)   tasks = tasks.filter(t => t.date === filterDateVal);
  if (filterStatusVal !== 'all') tasks = tasks.filter(t => t.status === filterStatusVal);

  if (!tasks.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon"><i class="bx bx-task-x"></i></div>
        <h3>${allTasks.length ? 'No tasks match your filters' : 'No tasks yet'}</h3>
        <p>${allTasks.length ? 'Try adjusting the search or filters.' : 'Click "Submit Task" to add your first submission.'}</p>
      </div>`;
    return;
  }

  grid.innerHTML = tasks.map(t => {
    const days       = daysFromNow(t.date);
    const badgeClass = t.status === 'completed' ? 'badge-green' : 'badge-warn';
    const badgeLabel = t.status === 'completed' ? '✅ Completed' : '⏳ Pending';
    const urgency    = t.status !== 'completed' && days <= 3 && days >= 0
      ? `<span class="badge badge-red" style="font-size:0.72rem">🔥 Due soon</span>` : '';

    return `
      <div class="task-card" data-id="${t.id}">
        <div class="task-card-header">
          <span class="task-card-title">${escHtml(t.title)}</span>
          <span class="task-card-domain">${escHtml(t.domain || 'General')}</span>
        </div>
        <p class="task-card-desc">${escHtml(t.desc)}</p>
        <div class="task-card-meta">
          <span><i class="bx bx-calendar"></i> ${formatDate(t.date)}</span>
          <span class="badge ${badgeClass}">${badgeLabel}</span>
          ${urgency}
          ${t.fileName ? `<span class="task-card-file"><i class="bx bx-paperclip"></i> ${escHtml(t.fileName.replace('📎 ',''))}</span>` : ''}
        </div>
        <div class="task-card-actions">
          <button class="btn btn-ghost btn-sm edit-btn" data-id="${t.id}">
            <i class="bx bx-edit-alt"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${t.id}">
            <i class="bx bx-trash"></i> Delete
          </button>
        </div>
      </div>`;
  }).join('');

  // Attach card-level events
  grid.querySelectorAll('.edit-btn').forEach(btn =>
    btn.addEventListener('click', () => openEditModal(btn.dataset.id))
  );
  grid.querySelectorAll('.delete-btn').forEach(btn =>
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.id))
  );
}

/* ── Filter handling ── */
function setupTaskFilters() {
  const search = $('#searchTasks'), date = $('#filterDate'), status = $('#filterStatus');
  const run = () => renderTasksGrid(search?.value, date?.value, status?.value);
  search?.addEventListener('input',  run);
  date?.addEventListener('change',   run);
  status?.addEventListener('change', run);
  $('#clearFilters')?.addEventListener('click', () => {
    if (search)  search.value  = '';
    if (date)    date.value    = '';
    if (status)  status.value  = 'all';
    run();
  });
}

/* ── Global search in topbar ── */
function setupGlobalSearch() {
  $('#globalSearch')?.addEventListener('input', function () {
    const val = this.value.trim();
    if (!val) return;
    navigateTo('tasks');
    // Brief timeout so tasks page renders first
    setTimeout(() => {
      const searchEl = $('#searchTasks');
      if (searchEl) { searchEl.value = val; renderTasksGrid(val); }
    }, 50);
  });
}

/* ──────────────────────────────────────────────────────────────
   14. EDIT TASK MODAL
────────────────────────────────────────────────────────────── */
function openEditModal(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;

  $('#editTaskId').value     = task.id;
  $('#editTaskTitle').value  = task.title;
  $('#editTaskDesc').value   = task.desc;
  $('#editTaskDate').value   = task.date;
  $('#editTaskStatus').value = task.status;

  $('#editModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  $('#editModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function handleEditSubmit(e) {
  e.preventDefault();
  const id = $('#editTaskId').value;
  const idx = allTasks.findIndex(t => t.id === id);
  if (idx === -1) return;

  allTasks[idx] = {
    ...allTasks[idx],
    title:  $('#editTaskTitle').value.trim()  || allTasks[idx].title,
    desc:   $('#editTaskDesc').value.trim()   || allTasks[idx].desc,
    date:   $('#editTaskDate').value          || allTasks[idx].date,
    status: $('#editTaskStatus').value,
  };

  saveTasks();
  closeEditModal();
  renderTasksGrid();
  addNotification(`Task "${allTasks[idx].title}" was updated.`, 'info');
  showToast('Task updated successfully! ✏️', 'success');
}

/* ──────────────────────────────────────────────────────────────
   15. DELETE TASK MODAL
────────────────────────────────────────────────────────────── */
function openDeleteModal(taskId) {
  deleteTargetId = taskId;
  $('#deleteModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  deleteTargetId = null;
  $('#deleteModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function confirmDeleteTask() {
  if (!deleteTargetId) return;
  const task = allTasks.find(t => t.id === deleteTargetId);
  allTasks = allTasks.filter(t => t.id !== deleteTargetId);
  saveTasks();
  closeDeleteModal();
  renderTasksGrid();
  addNotification(`Task "${task?.title || 'Untitled'}" was deleted. ❌`, 'error');
  showToast('Task deleted. ❌', 'error');
  deleteTargetId = null;
}

/* ──────────────────────────────────────────────────────────────
   16. CALENDAR
────────────────────────────────────────────────────────────── */
function renderCalendar() {
  const grid    = $('#calGrid');
  const title   = $('#calMonthYear');
  if (!grid || !title) return;

  const year  = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  title.textContent = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  // Dates with tasks
  const taskDates = new Set(allTasks.map(t => t.date));

  let html = '';
  // Leading empty cells
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell other-month"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const iso   = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const cls   = ['cal-cell'];
    if (iso === today)       cls.push('today');
    if (taskDates.has(iso))  cls.push('has-task');
    html += `<div class="${cls.join(' ')}" title="${taskDates.has(iso) ? 'Task due/submitted' : ''}">${d}</div>`;
  }
  grid.innerHTML = html;
}

function prevMonth() { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); }
function nextMonth() { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); }

/* ──────────────────────────────────────────────────────────────
   17. PROFILE
────────────────────────────────────────────────────────────── */
function refreshProfile() {
  const profile = store.get(KEYS.PROFILE + '_' + currentUser.id, {});
  const stats   = getStats();

  const displayName  = profile.name  || currentUser.name;
  const displayEmail = currentUser.email;
  const initials     = getInitials(displayName);

  // Display section
  const avatarBig = $('#profileAvatarBig');
  if (avatarBig) avatarBig.textContent = initials;
  const pName = $('#profileName');
  if (pName) pName.textContent = displayName;
  const pEmail = $('#profileEmail');
  if (pEmail) pEmail.textContent = displayEmail;

  // Stats
  $('#pStatTotal').textContent     = stats.total;
  $('#pStatCompleted').textContent = stats.completed;
  $('#pStatPending').textContent   = stats.pending;

  // Edit form pre-fill
  const editName = $('#editName');
  const editRole = $('#editRole');
  const editBio  = $('#editBio');
  if (editName) editName.value = profile.name  || currentUser.name;
  if (editRole) editRole.value = profile.role  || '';
  if (editBio)  editBio.value  = profile.bio   || '';
}

function handleProfileSave(e) {
  e.preventDefault();
  const name = $('#editName').value.trim();
  const role = $('#editRole').value.trim();
  const bio  = $('#editBio').value.trim();

  const profile = { name, role, bio };
  store.set(KEYS.PROFILE + '_' + currentUser.id, profile);

  // Update currentUser display
  currentUser.name = name || currentUser.name;

  updateUserUI();
  refreshProfile();
  showToast('Profile updated! 👤', 'success');
}

/* ──────────────────────────────────────────────────────────────
   18. NOTIFICATIONS
────────────────────────────────────────────────────────────── */
function loadNotifications() {
  const stored = store.get(KEYS.NOTIFS + '_' + currentUser.id, null);
  if (stored) { notifications = stored; return; }

  // Default notifications for new users
  notifications = [
    { id: uid(), msg: 'Welcome to InternFlow! 🎉 Start by submitting your first task.', type: 'info',    time: Date.now() - 3600000, read: false },
    { id: uid(), msg: 'Your profile is incomplete. Add your role and bio!',             type: 'info',    time: Date.now() - 7200000, read: false },
    { id: uid(), msg: 'Tip: Use the calendar to track your submission deadlines. 📅',    type: 'success', time: Date.now() - 86400000, read: false },
  ];
  saveNotifications();
}

function saveNotifications() {
  store.set(KEYS.NOTIFS + '_' + currentUser.id, notifications);
}

function addNotification(msg, type = 'info') {
  notifications.unshift({ id: uid(), msg, type, time: Date.now(), read: false });
  saveNotifications();
  updateNotifBadge();
}

function updateNotifBadge() {
  const unread = notifications.filter(n => !n.read).length;
  const badge  = $('#notifBadge');
  const dot    = $('#notifDot');
  if (badge) { badge.textContent = unread || ''; badge.style.display = unread ? '' : 'none'; }
  if (dot)   dot.classList.toggle('active', unread > 0);
}

function renderNotifications() {
  const container = $('#notifList');
  if (!container) return;

  if (!notifications.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="bx bx-bell-off"></i></div>
        <h3>All caught up!</h3>
        <p>No notifications at the moment.</p>
      </div>`;
    return;
  }

  const typeIcon = { success: 'bx-check-circle', error: 'bx-x-circle', info: 'bx-info-circle' };
  container.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.read ? '' : 'notif-unread'}">
      <div class="notif-item-icon ${n.type}">
        <i class="bx ${typeIcon[n.type] || typeIcon.info}"></i>
      </div>
      <div style="flex:1">
        <p class="notif-msg">${escHtml(n.msg)}</p>
        <p class="notif-time">${timeAgo(n.time)}</p>
      </div>
      ${!n.read ? '<span class="notif-dot-inline"></span>' : ''}
    </div>`).join('');
}

function markAllNotificationsRead() {
  notifications.forEach(n => n.read = true);
  saveNotifications();
  updateNotifBadge();
  renderNotifications();
  showToast('All notifications marked as read.', 'info');
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ──────────────────────────────────────────────────────────────
   19. SETTINGS
────────────────────────────────────────────────────────────── */
function refreshSettings() {
  const isDark = document.body.classList.contains('dark-mode');
  const toggle = $('#settingTheme');
  if (toggle) toggle.checked = !isDark; // checked = light mode
}

function clearAllTasks() {
  if (!confirm('This will permanently delete ALL your tasks. Are you sure?')) return;
  allTasks = [];
  saveTasks();
  showToast('All tasks cleared.', 'error');
  navigateTo('dashboard');
}

/* ──────────────────────────────────────────────────────────────
   20. UPDATE UI WITH USER INFO
────────────────────────────────────────────────────────────── */
function updateUserUI() {
  const profile  = store.get(KEYS.PROFILE + '_' + currentUser.id, {});
  const name     = profile.name || currentUser.name;
  const initials = getInitials(name);

  const avatarEl    = $('#userAvatar');
  const initialsEl  = $('#avatarInitials');
  if (avatarEl)   avatarEl.title      = name;
  if (initialsEl) initialsEl.textContent = initials;

  // Sidebar user area (if present)
  $$('.sidebar-user-name').forEach(el => el.textContent = name);
}

/* ──────────────────────────────────────────────────────────────
   21. LOAD APP AFTER LOGIN
────────────────────────────────────────────────────────────── */
function loadApp(user) {
  currentUser = user;

  // Switch views
  $('#authSection').classList.add('hidden');
  $('#appSection').classList.remove('hidden');

  // Load data
  loadTasks();
  loadNotifications();
  updateUserUI();
  updateNotifBadge();

  // Go to dashboard
  navigateTo('dashboard');
}

/* ──────────────────────────────────────────────────────────────
   22. EVENT WIRING
────────────────────────────────────────────────────────────── */
function wireEvents() {

  /* ── Auth ── */
  $('#registerForm')?.addEventListener('submit', handleRegister);
  $('#loginForm')?.addEventListener('submit',    handleLogin);
  $('#goToRegister')?.addEventListener('click',  (e) => { e.preventDefault(); switchToRegister(); });
  $('#goToLogin')?.addEventListener('click',     (e) => { e.preventDefault(); switchToLogin(); });
  $('#logoutBtn')?.addEventListener('click',     handleLogout);

  /* ── Sidebar nav ── */
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) navigateTo(page);
    });
  });

  /* ── Navigation from data-page attributes (topbar icons, card links, etc.) ── */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-page]');
    if (!el || el.classList.contains('nav-link')) return; // nav-link handled above
    e.preventDefault();
    const page = el.dataset.page;
    if (page && PAGE_TITLES[page]) navigateTo(page);
  });

  /* ── Profile avatar click → profile page ── */
  $('#userAvatar')?.addEventListener('click', () => navigateTo('profile'));

  /* ── Topbar hamburger ── */
  $('#hamburger')?.addEventListener('click',       openSidebarMobile);
  $('#sidebarClose')?.addEventListener('click',    closeSidebarMobile);
  $('#sidebarOverlay')?.addEventListener('click',  closeSidebarMobile);

  /* ── Theme toggle (topbar button) ── */
  $('#themeToggle')?.addEventListener('click', toggleTheme);

  /* ── Theme toggle (settings page toggle switch) ── */
  $('#settingTheme')?.addEventListener('change', function () {
    applyTheme(!this.checked); // checked = light mode
  });

  /* ── Task form ── */
  $('#taskForm')?.addEventListener('submit', handleTaskSubmit);
  $('#resetTaskForm')?.addEventListener('click', resetTaskForm);

  /* ── Edit modal ── */
  $('#editForm')?.addEventListener('submit',    handleEditSubmit);
  $('#closeEditModal')?.addEventListener('click', closeEditModal);
  $('#cancelEdit')?.addEventListener('click',    closeEditModal);
  $('#editModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });

  /* ── Delete modal ── */
  $('#cancelDelete')?.addEventListener('click',  closeDeleteModal);
  $('#confirmDelete')?.addEventListener('click', confirmDeleteTask);
  $('#deleteModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });

  /* ── Calendar nav ── */
  $('#calPrev')?.addEventListener('click', prevMonth);
  $('#calNext')?.addEventListener('click', nextMonth);

  /* ── Profile form ── */
  $('#profileForm')?.addEventListener('submit', handleProfileSave);

  /* ── Notifications ── */
  $('#clearNotifs')?.addEventListener('click', markAllNotificationsRead);

  /* ── Settings — clear all tasks ── */
  $('#clearAllTasks')?.addEventListener('click', clearAllTasks);

  /* ── Notifications page toggle notifications setting ── */
  $('#settingNotifs')?.addEventListener('change', function () {
    showToast(this.checked ? 'Notifications enabled.' : 'Notifications disabled.', 'info');
  });

  /* ── Escape key closes modals ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEditModal();
      closeDeleteModal();
    }
  });

  /* ── Window resize: re-render chart ── */
  window.addEventListener('resize', debounce(() => {
    if ($('#page-dashboard.active-page')) renderActivityChart();
  }, 250));
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ──────────────────────────────────────────────────────────────
   23. INITIALISE
────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  hideLoader();
  setupPasswordToggles();
  setupDropZone();
  setupTaskFilters();
  setupGlobalSearch();
  wireEvents();

  // Auto-login if session exists
  const savedUser = store.get(KEYS.CURRENT_USER);
  if (savedUser && savedUser.id) {
    loadApp(savedUser);
  } else {
    $('#authSection').classList.remove('hidden');
    $('#appSection').classList.add('hidden');
  }
});