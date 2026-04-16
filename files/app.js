/* ==============================
   MINDCHECK INDONESIA — app.js
   ============================== */

// ============ STATE ============
let currentUser = null;
let isLoggedIn = false;

// Data history dummy
const historyData = {
  tes: [
    { icon: '🧠', iconBg: '#dcfce7', title: 'Tes Depresi PHQ-9', desc: '12 April 2025', badge: 'Selesai', badgeClass: 'badge-selesai' },
    { icon: '😰', iconBg: '#fef3c7', title: 'Tes Kecemasan GAD-7', desc: '5 April 2025', badge: 'Selesai', badgeClass: 'badge-selesai' },
    { icon: '😴', iconBg: '#e0f2fe', title: 'Tes Kualitas Tidur', desc: '1 April 2025', badge: 'Selesai', badgeClass: 'badge-selesai' },
  ],
  konsul: [
    { icon: '👩‍⚕️', iconBg: '#fce7f3', title: 'Konsultasi dengan dr. Anisa Putri', desc: '10 April 2025 · 30 menit', badge: 'Selesai', badgeClass: 'badge-selesai' },
    { icon: '🗓️', iconBg: '#dcfce7', title: 'Konsultasi dengan Budi Santoso', desc: '20 April 2025', badge: 'Terjadwal', badgeClass: 'badge-sedang' },
  ],
  artikel: [
    { icon: '📖', iconBg: '#ede9fe', title: 'Cara Mengelola Stres di Era Modern', desc: 'Dibaca 13 April 2025', badge: 'Selesai', badgeClass: 'badge-selesai' },
    { icon: '🌙', iconBg: '#fef3c7', title: 'Pentingnya Istirahat untuk Kesehatan Mental', desc: 'Dibaca 11 April 2025', badge: 'Selesai', badgeClass: 'badge-selesai' },
    { icon: '💬', iconBg: '#dbeafe', title: 'Membangun Koneksi Sosial yang Sehat', desc: 'Dibaca 8 April 2025', badge: 'Selesai', badgeClass: 'badge-selesai' },
    { icon: '💪', iconBg: '#dcfce7', title: 'Membangun Resiliensi Mental yang Kuat', desc: 'Dibaca 3 April 2025', badge: 'Selesai', badgeClass: 'badge-selesai' },
  ]
};

// ============ PAGE ROUTING ============
function showPage(pageId) {
  // Semua page disembunyikan
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

  // Cek apakah halaman butuh login
  const protectedPages = ['history', 'settings', 'profile-page'];
  if (protectedPages.includes(pageId) && !isLoggedIn) {
    showToast('Silakan masuk terlebih dahulu', 'error');
    openModal('login');
    document.getElementById('page-home').classList.remove('hidden');
    return;
  }

  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.remove('hidden');
  } else {
    document.getElementById('page-home').classList.remove('hidden');
  }

  // Update nav link active state
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navMap = { home: 0, articles: 1, dokter: 2, tentang: 3 };
  if (navMap[pageId] !== undefined) {
    document.querySelectorAll('.nav-link')[navMap[pageId]]?.classList.add('active');
  }

  // Kalau halaman history, tampilkan tes by default
  if (pageId === 'history') {
    renderHistory('tes');
    const tabs = document.querySelectorAll('.htab');
    tabs.forEach(t => t.classList.remove('active'));
    tabs[0].classList.add('active');
  }

  // Kalau halaman profile, isi data
  if (pageId === 'profile-page') {
    fillProfilePage();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ MODAL ============
function openModal(type) {
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('authModal');
  overlay.classList.add('active');
  modal.classList.add('active');
  switchForm(type);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('authModal').classList.remove('active');
}

function switchForm(type) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (type === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  }
}

// ============ AUTH ============
function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value.trim();

  if (!email || !pass) {
    showToast('Email dan kata sandi wajib diisi', 'error');
    return;
  }
  if (!isValidEmail(email)) {
    showToast('Format email tidak valid', 'error');
    return;
  }

  // Simulasi login (tanpa backend)
  const nama = email.split('@')[0];
  const namaFormatted = nama.charAt(0).toUpperCase() + nama.slice(1);

  loginSuccess({ name: namaFormatted, email: email });
}

function doRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  const pass2 = document.getElementById('regPass2').value.trim();

  if (!name || !email || !pass || !pass2) {
    showToast('Semua field wajib diisi', 'error');
    return;
  }
  if (!isValidEmail(email)) {
    showToast('Format email tidak valid', 'error');
    return;
  }
  if (pass.length < 8) {
    showToast('Kata sandi minimal 8 karakter', 'error');
    return;
  }
  if (pass !== pass2) {
    showToast('Konfirmasi kata sandi tidak cocok', 'error');
    return;
  }

  loginSuccess({ name: name, email: email });
}

function loginSuccess(user) {
  currentUser = user;
  isLoggedIn = true;

  // Update navbar
  document.getElementById('nav-guest').classList.add('hidden');
  document.getElementById('nav-user').classList.remove('hidden');
  document.getElementById('navAvatar').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('navName').textContent = user.name;

  // Update sidebar
  document.getElementById('sidebarAvatar').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('sidebarName').textContent = user.name;
  document.getElementById('sidebarEmail').textContent = user.email;

  closeModal();
  showToast('Selamat datang, ' + user.name + '! 👋', 'success');

  // Clear form inputs
  ['loginEmail','loginPass','regName','regEmail','regPass','regPass2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function logout() {
  currentUser = null;
  isLoggedIn = false;

  document.getElementById('nav-guest').classList.remove('hidden');
  document.getElementById('nav-user').classList.add('hidden');

  closeSidebar();
  showPage('home');
  showToast('Berhasil keluar. Sampai jumpa! 👋');
}

// ============ SIDEBAR ============
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('active');
  }
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

// ============ HISTORY ============
function switchHistoryTab(tab, el) {
  document.querySelectorAll('.htab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderHistory(tab);
}

function renderHistory(tab) {
  const container = document.getElementById('historyContent');
  const data = historyData[tab];

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-inbox"></i>
        <p>Belum ada riwayat ${tab === 'tes' ? 'tes' : tab === 'konsul' ? 'konsultasi' : 'artikel'}</p>
      </div>`;
    return;
  }

  container.innerHTML = data.map(item => `
    <div class="history-item">
      <div class="history-icon" style="background:${item.iconBg}">${item.icon}</div>
      <div class="history-info">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
      <span class="history-badge ${item.badgeClass}">${item.badge}</span>
    </div>
  `).join('');
}

// ============ SETTINGS ============
function saveSettings() {
  const name = document.getElementById('settingName').value.trim();
  const email = document.getElementById('settingEmail').value.trim();
  const pass = document.getElementById('settingPass').value.trim();

  if (name && currentUser) {
    currentUser.name = name;
    document.getElementById('navAvatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('navName').textContent = name;
    document.getElementById('sidebarAvatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('sidebarName').textContent = name;
  }
  if (email && currentUser) {
    currentUser.email = email;
    document.getElementById('sidebarEmail').textContent = email;
  }
  if (pass && pass.length < 8) {
    showToast('Kata sandi minimal 8 karakter', 'error');
    return;
  }

  showToast('Pengaturan berhasil disimpan ✓', 'success');
  document.getElementById('settingName').value = '';
  document.getElementById('settingEmail').value = '';
  document.getElementById('settingPass').value = '';
}

function toggleDark(checkbox) {
  if (checkbox.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    showToast('Mode gelap diaktifkan 🌙');
  } else {
    document.documentElement.removeAttribute('data-theme');
    showToast('Mode terang diaktifkan ☀️');
  }
}

function confirmDelete() {
  const confirmed = confirm('Apakah kamu yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.');
  if (confirmed) {
    logout();
    showToast('Akun berhasil dihapus', 'error');
  }
}

// ============ PROFILE PAGE ============
function fillProfilePage() {
  if (!currentUser) return;
  const initial = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('profileAvatarBig').textContent = initial;
  document.getElementById('profileFullName').textContent = currentUser.name;
  document.getElementById('profileFullEmail').textContent = currentUser.email;
}

// ============ TOGGLE PASSWORD ============
function togglePass(inputId, icon) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// ============ TOAST ============
function showToast(msg, type = 'default') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ============ UTILS ============
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============ KEYBOARD: ESC TO CLOSE ============
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeSidebar();
  }
});

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
});
