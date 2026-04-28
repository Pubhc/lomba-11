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
  const protectedPages = ['history', 'settings', 'profile-page', 'jadwal', 'chat', 'rekomendasi'];
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
  const navMap = { home: 0, articles: 1, tes: 2, dokter: 3, jadwal: 4, maps: 5, tentang: 6 };
  if (navMap[pageId] !== undefined) {
    document.querySelectorAll('.nav-link')[navMap[pageId]]?.classList.add('active');
  }

  // Init peta kalau buka halaman maps
  if (pageId === 'maps') {
    setTimeout(() => initMaps(), 100);
  }

  // Init tes kalau buka halaman tes
  if (pageId === 'tes') {
    resetTes();
  }

  // Init fitur baru
  if (pageId === 'jadwal') initJadwal();
  if (pageId === 'rekomendasi') generateRekomendasi();
  if (pageId === 'chat') initChat();

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
  updateNotifDot();

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
    closeDokterDetail();
    closeDokterModal();
  }
});

// ============================================================
//   MAPS FEATURE
// ============================================================
let map = null;
let userMarker = null;
let userLocation = null;
let dokterMarkers = [];
let activeFilter = 'semua';
let filteredDokter = [];
let activeDokterIdx = null;

// Data dummy psikiater/psikolog se-Indonesia (koordinat nyata kota-kota besar)
const dokterDatabase = [
  {
    id: 1,
    nama: 'dr. Anisa Putri, Sp.KJ',
    spesialis: 'psikiater',
    spesialisLabel: 'Psikiater',
    emoji: '👩‍⚕️',
    warna: 'linear-gradient(135deg,#6ee7b7,#0d9488)',
    rating: 4.9,
    ulasan: 120,
    status: 'online',
    statusLabel: 'Tersedia',
    alamat: 'RS Jiwa Prof. Dr. Soerojo, Jl. Ahmad Yani No.169, Semarang, Jawa Tengah',
    lat: -7.0051,
    lng: 110.4381,
    jadwal: ['Sen-Jum', '08.00–16.00', 'Online'],
    harga: 'Rp 150.000 / sesi',
    pengalaman: '12 tahun',
    tentang: 'Spesialis gangguan mood, kecemasan, dan PTSD. Lulus dari Universitas Diponegoro.'
  },
  {
    id: 2,
    nama: 'Budi Santoso, M.Psi., Psikolog',
    spesialis: 'psikolog',
    spesialisLabel: 'Psikolog Klinis',
    emoji: '👨‍⚕️',
    warna: 'linear-gradient(135deg,#60a5fa,#2563eb)',
    rating: 4.8,
    ulasan: 98,
    status: 'online',
    statusLabel: 'Tersedia',
    alamat: 'Klinik Sehat Jiwa, Jl. Sudirman No.45, Jakarta Pusat, DKI Jakarta',
    lat: -6.2088,
    lng: 106.8456,
    jadwal: ['Sen-Sab', '09.00–18.00', 'Online & Offline'],
    harga: 'Rp 200.000 / sesi',
    pengalaman: '8 tahun',
    tentang: 'Psikolog klinis berfokus pada CBT (Cognitive Behavioral Therapy) untuk dewasa dan remaja.'
  },
  {
    id: 3,
    nama: 'dr. Citra Dewi, Sp.KJ',
    spesialis: 'psikiater',
    spesialisLabel: 'Psikiater Anak',
    emoji: '👩‍⚕️',
    warna: 'linear-gradient(135deg,#f9a8d4,#ec4899)',
    rating: 5.0,
    ulasan: 45,
    status: 'busy',
    statusLabel: 'Sedang Sibuk',
    alamat: 'RSUP Dr. Sardjito, Jl. Kesehatan No.1, Yogyakarta',
    lat: -7.7685,
    lng: 110.3744,
    jadwal: ['Sel-Jum', '10.00–15.00'],
    harga: 'Rp 175.000 / sesi',
    pengalaman: '15 tahun',
    tentang: 'Spesialis kesehatan jiwa anak dan remaja, gangguan perkembangan, ADHD.'
  },
  {
    id: 4,
    nama: 'Reza Firmansyah, M.Psi., Psikolog',
    spesialis: 'psikolog',
    spesialisLabel: 'Psikolog Remaja',
    emoji: '👨‍⚕️',
    warna: 'linear-gradient(135deg,#fcd34d,#d97706)',
    rating: 4.7,
    ulasan: 67,
    status: 'online',
    statusLabel: 'Tersedia',
    alamat: 'Klinik Psikologi Sejahtera, Jl. Gajah Mada No.12, Surabaya, Jawa Timur',
    lat: -7.2575,
    lng: 112.7521,
    jadwal: ['Sen-Sab', '08.00–17.00', 'Online'],
    harga: 'Rp 130.000 / sesi',
    pengalaman: '6 tahun',
    tentang: 'Fokus pada isu remaja: bullying, identitas diri, tekanan akademik, dan hubungan keluarga.'
  },
  {
    id: 5,
    nama: 'dr. Hamdan Syukri, Sp.KJ',
    spesialis: 'psikiater',
    spesialisLabel: 'Psikiater',
    emoji: '👨‍⚕️',
    warna: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
    rating: 4.6,
    ulasan: 82,
    status: 'online',
    statusLabel: 'Tersedia',
    alamat: 'RSJ Dadi, Jl. Lanto Dg. Pasewang No.34, Makassar, Sulawesi Selatan',
    lat: -5.1477,
    lng: 119.4327,
    jadwal: ['Sen-Jum', '08.00–14.00'],
    harga: 'Rp 120.000 / sesi',
    pengalaman: '10 tahun',
    tentang: 'Spesialis depresi, skizofrenia, dan gangguan bipolar. Konsultasi dalam bahasa Indonesia dan Bugis.'
  },
  {
    id: 6,
    nama: 'Siti Rahayu, M.Psi., Psikolog',
    spesialis: 'psikolog',
    spesialisLabel: 'Psikolog',
    emoji: '👩‍⚕️',
    warna: 'linear-gradient(135deg,#6ee7b7,#059669)',
    rating: 4.9,
    ulasan: 55,
    status: 'online',
    statusLabel: 'Tersedia',
    alamat: 'Klinik Tumbuh Kembang, Jl. Gajah No.7, Medan, Sumatera Utara',
    lat: 3.5952,
    lng: 98.6722,
    jadwal: ['Sen-Sab', '09.00–19.00', 'Online'],
    harga: 'Rp 110.000 / sesi',
    pengalaman: '7 tahun',
    tentang: 'Psikolog dengan pendekatan humanistik, berfokus pada trauma, pola asuh, dan self-esteem.'
  },
  {
    id: 7,
    nama: 'Ahmad Fauzi, M.Psi., Konselor',
    spesialis: 'konselor',
    spesialisLabel: 'Konselor',
    emoji: '👨‍💼',
    warna: 'linear-gradient(135deg,#fdba74,#ea580c)',
    rating: 4.5,
    ulasan: 39,
    status: 'offline',
    statusLabel: 'Tidak Tersedia',
    alamat: 'Yayasan Peduli Jiwa, Jl. Imam Bonjol No.22, Bandung, Jawa Barat',
    lat: -6.9175,
    lng: 107.6191,
    jadwal: ['Sel-Sab', '10.00–17.00'],
    harga: 'Rp 80.000 / sesi',
    pengalaman: '4 tahun',
    tentang: 'Konselor berfokus pada isu pekerjaan, burnout, hubungan, dan transisi kehidupan.'
  },
  {
    id: 8,
    nama: 'dr. Lestari Wulandari, Sp.KJ',
    spesialis: 'psikiater',
    spesialisLabel: 'Psikiater',
    emoji: '👩‍⚕️',
    warna: 'linear-gradient(135deg,#93c5fd,#3b82f6)',
    rating: 4.8,
    ulasan: 73,
    status: 'busy',
    statusLabel: 'Sedang Sibuk',
    alamat: 'RS Universitas Udayana, Jl. PB Sudirman, Denpasar, Bali',
    lat: -8.6705,
    lng: 115.2126,
    jadwal: ['Sen-Jum', '09.00–16.00'],
    harga: 'Rp 160.000 / sesi',
    pengalaman: '9 tahun',
    tentang: 'Spesialis gangguan kecemasan, fobia, dan OCD. Pendekatan integratif dan berbasis bukti.'
  },
  {
    id: 9,
    nama: 'Putri Handayani, M.Psi., Konselor',
    spesialis: 'konselor',
    spesialisLabel: 'Konselor',
    emoji: '👩‍💼',
    warna: 'linear-gradient(135deg,#fde68a,#b45309)',
    rating: 4.6,
    ulasan: 28,
    status: 'online',
    statusLabel: 'Tersedia',
    alamat: 'Jl. Hayam Wuruk No.18, Jepara, Jawa Tengah',
    lat: -6.5871,
    lng: 110.6686,
    jadwal: ['Sen-Sab', '08.00–16.00', 'Online'],
    harga: 'Rp 90.000 / sesi',
    pengalaman: '5 tahun',
    tentang: 'Konselor berfokus pada kesehatan mental remaja dan dewasa muda di wilayah Jawa Tengah.'
  }
];

// Hitung jarak (Haversine formula) dalam km
function hitungJarak(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
}

function formatJarak(km) {
  if (km < 1) return Math.round(km * 1000) + ' m';
  return km + ' km';
}

// ============ INIT MAPS ============
function initMaps() {
  if (map) {
    map.invalidateSize();
    return;
  }

  // Default center: tengah Indonesia
  const defaultCenter = [-2.5, 118.0];
  const defaultZoom = 5;

  map = L.map('mainMap', {
    center: defaultCenter,
    zoom: defaultZoom,
    zoomControl: true,
  });

  // Tile layer OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Tampilkan dokter tanpa jarak dulu
  renderDokterOnMap(dokterDatabase);
  renderDokterList(dokterDatabase);

  // Ambil lokasi user
  dapatkanLokasi();
}

// ============ AMBIL LOKASI USER ============
function dapatkanLokasi() {
  const bar = document.getElementById('mapsLocationBar');
  bar.innerHTML = '<i class="fa fa-circle-notch fa-spin"></i> Mendeteksi lokasi kamu...';
  bar.className = 'maps-location-bar';

  if (!navigator.geolocation) {
    bar.innerHTML = '<i class="fa fa-exclamation-triangle"></i> GPS tidak didukung browser ini';
    bar.className = 'maps-location-bar error';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      onLocationFound(userLocation);
    },
    (err) => {
      // Gunakan lokasi default Jepara (sesuai user)
      userLocation = { lat: -6.5871, lng: 110.6686 };
      bar.innerHTML = '<i class="fa fa-map-marker-alt"></i> Lokasi default: Jepara, Jawa Tengah';
      bar.className = 'maps-location-bar';
      onLocationFound(userLocation, true);
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

function onLocationFound(loc, isDefault = false) {
  const bar = document.getElementById('mapsLocationBar');

  // Reverse geocode sederhana (tampilkan koordinat)
  if (!isDefault) {
    bar.innerHTML = `<i class="fa fa-check-circle"></i> Lokasi ditemukan ✓`;
    bar.className = 'maps-location-bar found';
  }

  // Tambahkan marker user
  if (userMarker) map.removeLayer(userMarker);
  const userIcon = L.divIcon({
    className: '',
    html: '<div class="user-marker"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
  userMarker = L.marker([loc.lat, loc.lng], { icon: userIcon })
    .addTo(map)
    .bindPopup('<b>📍 Lokasi Kamu</b><br><small>Saya berada di sini</small>');

  // Zoom ke lokasi user
  map.setView([loc.lat, loc.lng], 10);

  // Hitung jarak ke semua dokter & re-render
  const dokterDenganJarak = dokterDatabase.map(d => ({
    ...d,
    jarak: parseFloat(hitungJarak(loc.lat, loc.lng, d.lat, d.lng))
  })).sort((a, b) => a.jarak - b.jarak);

  filteredDokter = dokterDenganJarak;
  renderDokterOnMap(dokterDenganJarak);
  renderDokterList(dokterDenganJarak);

  // Tampilkan dokter terdekat di bar jika bukan default
  if (!isDefault) {
    const terdekat = dokterDenganJarak[0];
    bar.innerHTML = `<i class="fa fa-map-marker-alt"></i> Lokasi kamu · ${terdekat.nama.split(',')[0]} terdekat (${formatJarak(terdekat.jarak)})`;
  }
}

// ============ RENDER MARKER DI PETA ============
function renderDokterOnMap(data) {
  // Hapus marker lama
  dokterMarkers.forEach(m => map.removeLayer(m));
  dokterMarkers = [];

  data.forEach((d, idx) => {
    const icon = L.divIcon({
      className: '',
      html: `<div class="custom-marker" style="border-color:${d.status === 'online' ? '#22c55e' : d.status === 'busy' ? '#f59e0b' : '#94a3b8'}">
               <span>${d.emoji}</span>
             </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    const jarakTeks = userLocation
      ? `<div class="popup-jarak">📍 ${formatJarak(d.jarak || hitungJarak(userLocation.lat, userLocation.lng, d.lat, d.lng))} dari kamu</div>`
      : '';

    const marker = L.marker([d.lat, d.lng], { icon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width:180px">
          <div class="popup-name">${d.nama}</div>
          <div class="popup-sp">${d.spesialisLabel}</div>
          <div class="popup-sp">⭐ ${d.rating} · ${d.ulasan} ulasan</div>
          ${jarakTeks}
          <button class="popup-btn" onclick="showDokterDetail(${d.id})">Lihat Detail</button>
        </div>
      `);

    marker.on('click', () => {
      highlightDokterCard(d.id);
    });

    dokterMarkers.push(marker);
  });
}

// ============ RENDER LIST PANEL KIRI ============
function renderDokterList(data) {
  const list = document.getElementById('mapsDokterList');
  const count = document.getElementById('dokterCount');
  count.textContent = `${data.length} dokter ditemukan`;

  if (data.length === 0) {
    list.innerHTML = `<div class="empty-state"><i class="fa fa-search"></i><p>Tidak ada dokter yang cocok</p></div>`;
    return;
  }

  list.innerHTML = data.map(d => {
    const jarakHtml = d.jarak != null
      ? `<span class="jarak-badge"><i class="fa fa-map-marker-alt"></i> ${formatJarak(d.jarak)}</span>`
      : '';
    const dotClass = d.status === 'online' ? '' : d.status === 'busy' ? 'busy' : 'offline';
    return `
      <div class="mdokter-card" id="mcard-${d.id}" onclick="focusDokter(${d.id})">
        <div class="mdokter-avatar" style="background:${d.warna}">${d.emoji}</div>
        <div class="mdokter-info">
          <h4>${d.nama}</h4>
          <span class="mdokter-spesialis sp-${d.spesialis}">${d.spesialisLabel}</span>
          <div class="mdokter-meta">
            <span class="rating-star">⭐ ${d.rating}</span>
            <span>·</span>
            <span>${d.ulasan} ulasan</span>
            ${jarakHtml}
          </div>
        </div>
        <div class="mdokter-status">
          <div class="status-dot ${dotClass}"></div>
          <span class="status-label">${d.statusLabel}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ============ FOKUS KE DOKTER ============
function focusDokter(id) {
  const d = dokterDatabase.find(x => x.id === id);
  if (!d || !map) return;

  // Zoom ke marker
  map.setView([d.lat, d.lng], 14, { animate: true });

  // Buka popup
  const idx = filteredDokter.findIndex(x => x.id === id);
  if (idx >= 0 && dokterMarkers[idx]) {
    setTimeout(() => dokterMarkers[idx].openPopup(), 400);
  }

  highlightDokterCard(id);
  showDokterDetail(id);
}

function highlightDokterCard(id) {
  document.querySelectorAll('.mdokter-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById('mcard-' + id);
  if (card) {
    card.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============ DETAIL CARD (di bawah peta) ============
function showDokterDetail(id) {
  const d = dokterDatabase.find(x => x.id === id);
  if (!d) return;

  const jarakHtml = (userLocation && d.jarak != null)
    ? `<span><i class="fa fa-map-marker-alt"></i> ${formatJarak(d.jarak)}</span>`
    : '';

  const html = `
    <div class="detail-dokter-header">
      <div class="detail-avatar" style="background:${d.warna}">${d.emoji}</div>
      <div class="detail-info">
        <h3>${d.nama}</h3>
        <div class="detail-tags">
          <span class="mdokter-spesialis sp-${d.spesialis}">${d.spesialisLabel}</span>
        </div>
        <div class="detail-meta">
          <span>⭐ ${d.rating} (${d.ulasan} ulasan)</span>
          <span><i class="fa fa-briefcase"></i> ${d.pengalaman}</span>
          ${jarakHtml}
        </div>
      </div>
    </div>
    <div class="detail-address">
      <i class="fa fa-map-marker-alt"></i>
      <span>${d.alamat}</span>
    </div>
    <div class="detail-schedule">
      ${d.jadwal.map(j => `<span class="sch-chip">${j}</span>`).join('')}
      <span class="sch-chip" style="background:#fef3c7;color:#92400e;">${d.harga}</span>
    </div>
    <p style="font-size:0.84rem;color:var(--mid);margin-bottom:14px;line-height:1.6;">${d.tentang}</p>
    <div class="detail-actions">
      <button class="btn-konsul-maps" onclick="handleKonsul(${d.id})">
        <i class="fa fa-comments"></i> Konsultasi Sekarang
      </button>
      <button class="btn-direction" onclick="openDirections(${d.lat}, ${d.lng})">
        <i class="fa fa-directions"></i> Rute
      </button>
    </div>
  `;

  document.getElementById('detailInner').innerHTML = html;
  document.getElementById('mapsDetailCard').classList.remove('hidden');

  // Juga isi modal (untuk mobile)
  document.getElementById('dokterModalContent').innerHTML = html;
}

function closeDokterDetail() {
  document.getElementById('mapsDetailCard').classList.add('hidden');
}

function openDirections(lat, lng) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
}

function handleKonsul(id) {
  if (!isLoggedIn) {
    closeDokterDetail();
    openModal('login');
    showToast('Silakan masuk untuk berkonsultasi', 'error');
  } else {
    showToast('Menghubungkan ke dokter... 🩺', 'success');
  }
}

function closeDokterModal() {
  document.getElementById('dokterModalOverlay').classList.remove('active');
  document.getElementById('dokterModal').classList.remove('active');
}

// ============ GO TO MY LOCATION ============
function goToMyLocation() {
  if (userLocation && map) {
    map.setView([userLocation.lat, userLocation.lng], 12, { animate: true });
    if (userMarker) userMarker.openPopup();
  } else {
    dapatkanLokasi();
  }
}

// ============ TOGGLE PANEL ============
function toggleMapPanel() {
  const panel = document.getElementById('mapsPanel');
  panel.classList.toggle('hidden-panel');
  setTimeout(() => map && map.invalidateSize(), 350);
}

// ============ FILTER & SORT ============
function setFilter(filter, el) {
  activeFilter = filter;
  document.querySelectorAll('.mfilter').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  applyFilterSort();
}

function filterDokterList() {
  applyFilterSort();
}

function sortDokterList() {
  applyFilterSort();
}

function applyFilterSort() {
  const search = document.getElementById('mapsSearch').value.toLowerCase();
  const sort = document.getElementById('sortSelect').value;

  let data = dokterDatabase.map(d => ({
    ...d,
    jarak: userLocation ? parseFloat(hitungJarak(userLocation.lat, userLocation.lng, d.lat, d.lng)) : null
  }));

  // Filter spesialis
  if (activeFilter !== 'semua') {
    data = data.filter(d => d.spesialis === activeFilter);
  }

  // Filter search
  if (search) {
    data = data.filter(d =>
      d.nama.toLowerCase().includes(search) ||
      d.spesialisLabel.toLowerCase().includes(search) ||
      d.alamat.toLowerCase().includes(search)
    );
  }

  // Sort
  if (sort === 'jarak' && userLocation) {
    data.sort((a, b) => a.jarak - b.jarak);
  } else if (sort === 'rating') {
    data.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'nama') {
    data.sort((a, b) => a.nama.localeCompare(b.nama));
  }

  filteredDokter = data;
  renderDokterList(data);
  renderDokterOnMap(data);
}

// ============ TES MENTAL ============

const tesQuestions = [
  {
    id: 1,
    category: '😴 Tidur & Energi',
    categoryColor: 'background:#e0f2fe;color:#0369a1',
    text: 'Bagaimana kualitas tidur kamu belakangan ini?',
    hint: 'Pilih yang paling menggambarkan kondisimu dalam 2 minggu terakhir',
    type: 'option',
    options: [
      { icon: '😴', label: 'Tidur nyenyak seperti biasa', desc: 'Tidak ada masalah berarti', value: 0 },
      { icon: '🌙', label: 'Sedikit terganggu', desc: 'Kadang sulit tidur atau bangun kecapaian', value: 1 },
      { icon: '😵', label: 'Sering susah tidur / tidur berlebihan', desc: 'Hampir setiap malam terganggu', value: 2 },
      { icon: '🚫', label: 'Tidak bisa tidur sama sekali / tidur terus-menerus', desc: 'Sangat parah dan mengganggu aktivitas', value: 3 },
    ]
  },
  {
    id: 2,
    category: '😟 Suasana Hati',
    categoryColor: 'background:#fef3c7;color:#92400e',
    text: 'Seberapa sering kamu merasa sedih, kosong, atau kehilangan semangat?',
    hint: 'Jujurlah, tidak ada jawaban yang salah di sini',
    type: 'option',
    options: [
      { icon: '😊', label: 'Jarang atau tidak pernah', desc: 'Suasana hati cukup baik', value: 0 },
      { icon: '😐', label: 'Beberapa hari dalam seminggu', desc: 'Kadang-kadang merasa tidak bersemangat', value: 1 },
      { icon: '😔', label: 'Hampir setiap hari', desc: 'Perasaan ini sulit dihilangkan', value: 2 },
      { icon: '😢', label: 'Setiap hari, sepanjang waktu', desc: 'Sangat mengganggu kehidupan sehari-hari', value: 3 },
    ]
  },
  {
    id: 3,
    category: '😰 Kecemasan',
    categoryColor: 'background:#fce7f3;color:#9d174d',
    text: 'Apakah kamu sering merasa cemas, khawatir berlebihan, atau takut tanpa alasan jelas?',
    hint: 'Termasuk rasa panik mendadak, jantung berdebar, atau pikiran yang tidak bisa berhenti',
    type: 'option',
    options: [
      { icon: '😌', label: 'Tidak, saya cukup tenang', desc: 'Kecemasan masih dalam batas wajar', value: 0 },
      { icon: '😬', label: 'Ya, kadang-kadang', desc: 'Terkontrol tapi cukup mengganggu', value: 1 },
      { icon: '😰', label: 'Ya, cukup sering dan sulit dikontrol', desc: 'Mengganggu pekerjaan atau hubungan', value: 2 },
      { icon: '😱', label: 'Ya, hampir setiap saat dan sangat intens', desc: 'Sering panik, tidak bisa berfungsi normal', value: 3 },
    ]
  },
  {
    id: 4,
    category: '🧠 Pikiran & Konsentrasi',
    categoryColor: 'background:#ede9fe;color:#5b21b6',
    text: 'Bagaimana kemampuan fokus dan konsentrasi kamu saat ini?',
    hint: 'Contoh: saat bekerja, belajar, atau melakukan aktivitas sehari-hari',
    type: 'option',
    options: [
      { icon: '🎯', label: 'Fokus baik seperti biasa', desc: 'Tidak ada gangguan berarti', value: 0 },
      { icon: '🤔', label: 'Agak susah fokus belakangan ini', desc: 'Mudah terdistraksi, tapi masih bisa diatasi', value: 1 },
      { icon: '😵‍💫', label: 'Sering kehilangan fokus dan lupa', desc: 'Mengganggu produktivitas harian', value: 2 },
      { icon: '🌀', label: 'Tidak bisa berkonsentrasi sama sekali', desc: 'Pikiran kacau, sulit menyelesaikan tugas sederhana', value: 3 },
    ]
  },
  {
    id: 5,
    category: '👥 Hubungan Sosial',
    categoryColor: 'background:#dbeafe;color:#1e40af',
    text: 'Apakah kamu menarik diri dari orang-orang di sekitarmu?',
    hint: 'Termasuk keluarga, teman, atau rekan kerja',
    type: 'option',
    options: [
      { icon: '🤝', label: 'Tidak, hubungan sosial saya baik-baik saja', desc: 'Tetap aktif berinteraksi', value: 0 },
      { icon: '🤷', label: 'Sedikit berkurang, tapi masih bersosialisasi', desc: 'Lebih suka menyendiri dari biasanya', value: 1 },
      { icon: '🚪', label: 'Sering menghindari orang lain', desc: 'Terasa berat untuk berinteraksi', value: 2 },
      { icon: '🏠', label: 'Mengisolasi diri sepenuhnya', desc: 'Tidak mau bertemu siapapun', value: 3 },
    ]
  },
  {
    id: 6,
    category: '💊 Gejala Fisik',
    categoryColor: 'background:#dcfce7;color:#166534',
    text: 'Apakah kamu mengalami gejala fisik yang tidak jelas penyebabnya? (sakit kepala, nyeri, mual, jantung berdebar)',
    hint: 'Gejala fisik sering menjadi tanda dari kondisi mental tertentu',
    type: 'option',
    options: [
      { icon: '💪', label: 'Tidak ada gejala fisik yang tidak biasa', desc: 'Kondisi fisik baik', value: 0 },
      { icon: '🤕', label: 'Ada gejala ringan, muncul sesekali', desc: 'Tidak terlalu mengganggu', value: 1 },
      { icon: '😩', label: 'Cukup sering dan mengganggu aktivitas', desc: 'Sakit kepala, nyeri, atau pusing berulang', value: 2 },
      { icon: '🏥', label: 'Gejala fisik berat dan intens', desc: 'Sudah ke dokter tapi tidak ada penyebab medis', value: 3 },
    ]
  },
  {
    id: 7,
    category: '⚡ Riwayat & Intensitas',
    categoryColor: 'background:#fef9c3;color:#713f12',
    text: 'Sudah berapa lama kamu merasakan keluhan-keluhan ini?',
    hint: 'Durasi membantu kami memahami tingkat keparahan kondisimu',
    type: 'option',
    options: [
      { icon: '⚡', label: 'Baru-baru ini (kurang dari 1 minggu)', desc: 'Mungkin reaksi terhadap situasi tertentu', value: 0 },
      { icon: '📅', label: 'Beberapa minggu (1–4 minggu)', desc: 'Perlu diperhatikan lebih serius', value: 1 },
      { icon: '🗓️', label: 'Lebih dari sebulan', desc: 'Sudah cukup lama dan perlu penanganan', value: 2 },
      { icon: '📆', label: 'Lebih dari 3 bulan', desc: 'Sudah kronis, sangat perlu bantuan ahli', value: 3 },
    ]
  },
  {
    id: 8,
    category: '🆘 Pikiran Berbahaya',
    categoryColor: 'background:#fee2e2;color:#991b1b',
    text: 'Apakah kamu pernah memiliki pikiran untuk menyakiti diri sendiri atau merasa lebih baik tidak ada?',
    hint: 'Pertanyaan ini penting untuk keselamatanmu. Jawabanmu aman dan rahasia.',
    type: 'option',
    options: [
      { icon: '💚', label: 'Tidak pernah', desc: 'Tidak ada pikiran seperti itu', value: 0 },
      { icon: '💭', label: 'Pernah muncul tapi hanya sebentar', desc: 'Sudah berlalu dan tidak serius', value: 1 },
      { icon: '⚠️', label: 'Cukup sering muncul', desc: 'Pikiran ini mengganggu dan sulit pergi', value: 2 },
      { icon: '🆘', label: 'Sangat sering dan intens', desc: 'Saya butuh bantuan segera', value: 3 },
    ]
  }
];

// Data dokter untuk hasil
const dokterRekomenData = {
  psikiater: [
    { emoji: '👩‍⚕️', warna: 'linear-gradient(135deg,#6ee7b7,#0d9488)', nama: 'dr. Anisa Putri', sp: 'Psikiater · Spesialis Jiwa', rating: '4.9', lokasi: 'Jakarta Selatan' },
    { emoji: '👨‍⚕️', warna: 'linear-gradient(135deg,#60a5fa,#2563eb)', nama: 'dr. Hendra Wijaya', sp: 'Psikiater · RSJ Prof. Soerojo', rating: '4.8', lokasi: 'Semarang' },
    { emoji: '👩‍⚕️', warna: 'linear-gradient(135deg,#f9a8d4,#ec4899)', nama: 'dr. Citra Dewi', sp: 'Psikiater Anak & Remaja', rating: '5.0', lokasi: 'Bandung' },
  ],
  psikolog: [
    { emoji: '🧑‍💼', warna: 'linear-gradient(135deg,#fde68a,#f59e0b)', nama: 'Budi Santoso, M.Psi', sp: 'Psikolog Klinis', rating: '4.8', lokasi: 'Jakarta Pusat' },
    { emoji: '👩‍💼', warna: 'linear-gradient(135deg,#c4b5fd,#7c3aed)', nama: 'Sari Dewi, S.Psi', sp: 'Psikolog · CBT Specialist', rating: '4.9', lokasi: 'Yogyakarta' },
    { emoji: '🧑‍💼', warna: 'linear-gradient(135deg,#fcd34d,#d97706)', nama: 'Reza Firmansyah, M.Psi', sp: 'Psikolog Remaja & Keluarga', rating: '4.7', lokasi: 'Surabaya' },
  ]
};

// State tes
let tesCurrent = 0;
let tesAnswers = [];
let tesUserLocation = null;

function resetTes() {
  tesCurrent = 0;
  tesAnswers = new Array(tesQuestions.length).fill(null);
  showTesStep('0');
}

function showTesStep(step) {
  document.querySelectorAll('.tes-step').forEach(s => s.classList.add('hidden'));
  document.getElementById('tes-step-' + step).classList.remove('hidden');
}

function tesMulai() {
  tesCurrent = 0;
  showTesStep('questions');
  renderTesQuestion();
  // Coba dapatkan lokasi untuk hasil nanti
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => { tesUserLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
      () => { tesUserLocation = null; }
    );
  }
}

function renderTesQuestion() {
  const q = tesQuestions[tesCurrent];
  const total = tesQuestions.length;

  // Progress
  const pct = ((tesCurrent) / total) * 100;
  document.getElementById('tesProgressBar').style.width = pct + '%';
  document.getElementById('tesStepLabel').textContent = `Pertanyaan ${tesCurrent + 1} dari ${total}`;

  // Tombol back
  document.getElementById('tesBtnBack').style.opacity = tesCurrent === 0 ? '0.4' : '1';
  document.getElementById('tesBtnBack').disabled = tesCurrent === 0;

  // Reset next button
  const nextBtn = document.getElementById('tesBtnNext');
  nextBtn.disabled = tesAnswers[tesCurrent] === null;
  nextBtn.textContent = tesCurrent === total - 1 ? 'Lihat Hasil ✓' : 'Lanjut →';

  // Render question
  const card = document.getElementById('tesQuestionCard');
  card.innerHTML = `
    <div class="tes-q-category">
      <span style="${q.categoryColor};padding:4px 12px;border-radius:50px;font-size:0.76rem;font-weight:700;">${q.category}</span>
    </div>
    <div class="tes-q-text">${q.text}</div>
    ${q.hint ? `<div class="tes-q-hint">💡 ${q.hint}</div>` : ''}
    <div class="tes-options">
      ${q.options.map((opt, i) => `
        <button class="tes-option ${tesAnswers[tesCurrent] === opt.value ? 'selected' : ''}"
          onclick="pilihJawaban(${opt.value}, this)">
          <span class="tes-option-icon">${opt.icon}</span>
          <div>
            <div class="tes-option-label">${opt.label}</div>
            <div class="tes-option-desc">${opt.desc}</div>
          </div>
        </button>
      `).join('')}
    </div>
  `;
}

function pilihJawaban(value, el) {
  tesAnswers[tesCurrent] = value;
  document.querySelectorAll('.tes-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('tesBtnNext').disabled = false;
}

function tesNext() {
  if (tesAnswers[tesCurrent] === null) return;
  if (tesCurrent < tesQuestions.length - 1) {
    tesCurrent++;
    renderTesQuestion();
  } else {
    showTesHasil();
  }
}

function tesPrev() {
  if (tesCurrent > 0) {
    tesCurrent--;
    renderTesQuestion();
  }
}

function showTesHasil() {
  const total = tesAnswers.reduce((a, b) => a + (b || 0), 0);
  const maxScore = tesQuestions.length * 3;
  const pct = Math.round((total / maxScore) * 100);
  const q8 = tesAnswers[7] || 0; // pikiran berbahaya

  // Tentukan level
  let level, levelColor, headerBg, emoji, judulHasil, deskHasil;

  if (q8 >= 2) {
    level = '🆘 Perlu Bantuan Segera';
    levelColor = '#dc2626';
    headerBg = 'linear-gradient(135deg, #dc2626, #7f1d1d)';
    emoji = '🆘';
    judulHasil = 'Segera Cari Bantuan Profesional';
    deskHasil = 'Kamu menunjukkan tanda-tanda yang memerlukan perhatian segera. Jangan hadapi ini sendirian — ada ahli yang siap membantu.';
  } else if (pct <= 20) {
    level = '💚 Kondisi Baik';
    levelColor = '#16a34a';
    headerBg = 'linear-gradient(135deg, #22c55e, #0d9488)';
    emoji = '😊';
    judulHasil = 'Kondisi Mentalmu Cukup Baik';
    deskHasil = 'Tidak ada tanda serius yang terdeteksi. Tetap jaga kesehatan mental dengan rutinitas positif dan konsultasi ringan jika butuh panduan.';
  } else if (pct <= 45) {
    level = '💛 Perlu Perhatian';
    levelColor = '#d97706';
    headerBg = 'linear-gradient(135deg, #f59e0b, #d97706)';
    emoji = '🤔';
    judulHasil = 'Ada Beberapa Hal yang Perlu Diperhatikan';
    deskHasil = 'Kamu mengalami beberapa gejala ringan hingga sedang. Berbicara dengan psikolog bisa sangat membantu sebelum kondisi ini berkembang lebih jauh.';
  } else if (pct <= 70) {
    level = '🟠 Membutuhkan Bantuan';
    levelColor = '#ea580c';
    headerBg = 'linear-gradient(135deg, #f97316, #dc2626)';
    emoji = '😔';
    judulHasil = 'Kamu Membutuhkan Dukungan Profesional';
    deskHasil = 'Gejalamu cukup signifikan dan sudah mempengaruhi kualitas hidup. Sangat disarankan untuk segera berkonsultasi dengan tenaga ahli kesehatan mental.';
  } else {
    level = '🔴 Kondisi Serius';
    levelColor = '#dc2626';
    headerBg = 'linear-gradient(135deg, #dc2626, #7f1d1d)';
    emoji = '😰';
    judulHasil = 'Kondisi Memerlukan Penanganan Segera';
    deskHasil = 'Kamu mengalami gejala yang cukup berat. Jangan tunda — segera cari bantuan dari psikiater atau psikolog terdekat. Kamu tidak harus hadapi ini sendiri.';
  }

  // Tentukan rekomendasi: Psikiater vs Psikolog
  const needsPsikiater = pct > 50 || q8 >= 2 || (tesAnswers[0] >= 3) || total >= 14;
  const primaryRek = needsPsikiater ? 'psikiater' : 'psikolog';
  const secondaryRek = needsPsikiater ? 'psikolog' : 'psikiater';

  // Deteksi gejala berdasarkan jawaban
  const gejalaList = [];
  if (tesAnswers[0] >= 2) gejalaList.push({ icon: '😴', label: 'Gangguan Tidur', bg: '#e0f2fe', color: '#0369a1' });
  if (tesAnswers[1] >= 2) gejalaList.push({ icon: '😔', label: 'Suasana Hati Rendah', bg: '#fef3c7', color: '#92400e' });
  if (tesAnswers[2] >= 2) gejalaList.push({ icon: '😰', label: 'Kecemasan Tinggi', bg: '#fce7f3', color: '#9d174d' });
  if (tesAnswers[3] >= 2) gejalaList.push({ icon: '🧠', label: 'Gangguan Konsentrasi', bg: '#ede9fe', color: '#5b21b6' });
  if (tesAnswers[4] >= 2) gejalaList.push({ icon: '🚪', label: 'Penarikan Sosial', bg: '#dbeafe', color: '#1e40af' });
  if (tesAnswers[5] >= 2) gejalaList.push({ icon: '💊', label: 'Gejala Fisik', bg: '#dcfce7', color: '#166534' });
  if (tesAnswers[6] >= 2) gejalaList.push({ icon: '🗓️', label: 'Gejala Berkepanjangan', bg: '#fef9c3', color: '#713f12' });
  if (tesAnswers[7] >= 1) gejalaList.push({ icon: '⚠️', label: 'Pikiran Negatif', bg: '#fee2e2', color: '#991b1b' });
  if (gejalaList.length === 0) gejalaList.push({ icon: '💚', label: 'Tidak ada gejala signifikan', bg: '#dcfce7', color: '#166534' });

  // Lokasi user
  const lokasiHtml = tesUserLocation
    ? `<div class="hasil-lokasi">
        <div class="lokasi-bar">
          <i class="fa fa-map-marker-alt"></i>
          <span>Lokasi terdeteksi — dokter di bawah ini dipilih berdasarkan wilayah terdekat</span>
        </div>
       </div>`
    : `<div class="hasil-lokasi">
        <div class="lokasi-bar">
          <i class="fa fa-map-marker-alt"></i>
          <span>Aktifkan lokasi untuk melihat dokter terdekat dari posisimu</span>
          <button onclick="aktifkanLokasi()" style="margin-left:auto;padding:5px 12px;border-radius:50px;background:var(--green-light);color:var(--green-dark);font-weight:700;font-size:0.78rem;border:none;cursor:pointer;">Aktifkan</button>
        </div>
       </div>`;

  // Rekomen dokter
  const dokterHtml = dokterRekomenData[primaryRek].map(d => `
    <div class="hasil-dokter-card">
      <div class="hd-avatar" style="background:${d.warna}">${d.emoji}</div>
      <h4>${d.nama}</h4>
      <p class="sp">${d.sp}</p>
      <p style="font-size:0.75rem;color:var(--gray);margin-bottom:8px;">⭐ ${d.rating} · ${d.lokasi}</p>
      <button class="btn-hd-konsul" onclick="handleKonsulHasil()">Konsultasi</button>
    </div>
  `).join('');

  const rekomenLabel = {
    psikiater: { icon: '🏥', nama: 'Psikiater (Dokter Spesialis Jiwa)', desc: 'Dokter medis yang bisa mendiagnosis, meresepkan obat, dan menangani gangguan mental yang lebih kompleks atau biologis.', chips: ['Depresi Berat', 'Gangguan Bipolar', 'Skizofrenia', 'Gangguan Panik Berat'] },
    psikolog: { icon: '🧑‍💼', nama: 'Psikolog Klinis', desc: 'Ahli kesehatan mental yang fokus pada terapi psikologis, konseling, dan perubahan perilaku tanpa resep obat.', chips: ['Kecemasan Ringan-Sedang', 'Stres', 'Masalah Hubungan', 'Trauma Ringan'] }
  };

  // Pesan darurat untuk q8 tinggi
  const daruratHtml = q8 >= 2 ? `
    <div style="background:#fee2e2;border:2px solid #fca5a5;border-radius:var(--radius);padding:1.2rem;margin-bottom:1rem;">
      <p style="font-size:0.92rem;font-weight:700;color:#991b1b;">⚠️ Penting: Kamu tidak sendirian</p>
      <p style="font-size:0.85rem;color:#7f1d1d;margin-top:6px;line-height:1.6;">Jika kamu memiliki pikiran untuk menyakiti diri sendiri, segera hubungi <strong>Into The Light Indonesia: 119 ext 8</strong> atau pergi ke IGD rumah sakit terdekat.</p>
    </div>
  ` : '';

  const wrap = document.getElementById('tesHasilWrap');
  wrap.innerHTML = `
    ${daruratHtml}
    <div class="hasil-header" style="background:${headerBg}">
      <span class="hasil-level-badge">${level}</span>
      <span class="hasil-icon">${emoji}</span>
      <h2>${judulHasil}</h2>
      <p>${deskHasil}</p>
    </div>

    <div class="hasil-score-section">
      <div class="hasil-score-label">
        <span>Skor Gejalamu</span>
        <span style="color:${levelColor};font-size:1.1rem;">${pct}%</span>
      </div>
      <div class="hasil-score-bar-wrap">
        <div class="hasil-score-bar" id="hasildBar" style="width:0%;background:${headerBg}"></div>
      </div>
    </div>

    <div class="hasil-gejala">
      <h3>🔍 Gejala yang Terdeteksi</h3>
      <div class="gejala-list">
        ${gejalaList.map(g => `
          <span class="gejala-tag" style="background:${g.bg};color:${g.color};">${g.icon} ${g.label}</span>
        `).join('')}
      </div>
    </div>

    <div class="hasil-rekomendasi">
      <h3>🎯 Rekomendasi Untuk Kamu</h3>

      <div class="rekomen-card utama" onclick="showPage('maps')">
        <div class="rekomen-badge-utama">✓ Direkomendasikan</div>
        <div class="rekomen-icon">${rekomenLabel[primaryRek].icon}</div>
        <div class="rekomen-info">
          <h4>${rekomenLabel[primaryRek].nama}</h4>
          <p>${rekomenLabel[primaryRek].desc}</p>
          <div class="rekomen-cocok">
            ${rekomenLabel[primaryRek].chips.map(c => `<span class="rekomen-chip">${c}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="rekomen-card alternatif" onclick="showPage('maps')">
        <div class="rekomen-icon">${rekomenLabel[secondaryRek].icon}</div>
        <div class="rekomen-info">
          <h4>${rekomenLabel[secondaryRek].nama} <span style="font-size:0.75rem;font-weight:500;color:var(--gray)">(Alternatif)</span></h4>
          <p>${rekomenLabel[secondaryRek].desc}</p>
          <div class="rekomen-cocok">
            ${rekomenLabel[secondaryRek].chips.map(c => `<span class="rekomen-chip">${c}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>

    ${lokasiHtml}

    <div class="hasil-dokter">
      <h3>👨‍⚕️ ${needsPsikiater ? 'Psikiater' : 'Psikolog'} yang Bisa Kamu Hubungi</h3>
      <div class="hasil-dokter-grid">
        ${dokterHtml}
      </div>
    </div>

    <div class="hasil-footer">
      <button class="btn-cari-dokter" onclick="showPage('maps')">
        <i class="fa fa-map-marker-alt"></i> Cari Dokter Terdekat di Peta
      </button>
      <button class="btn-tes-ulang" onclick="tesMulai()">🔄 Ulangi Tes</button>
    </div>
  `;

  showTesStep('hasil');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Animasi score bar
  setTimeout(() => {
    document.getElementById('hasildBar').style.width = pct + '%';
  }, 300);
}

function handleKonsulHasil() {
  if (!isLoggedIn) {
    openModal('login');
    showToast('Masuk dulu untuk konsultasi', 'error');
  } else {
    showToast('Menghubungkan ke dokter... 🩺', 'success');
  }
}

function aktifkanLokasi() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        tesUserLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        showToast('Lokasi berhasil dideteksi 📍', 'success');
        showTesHasil(); // re-render hasil dengan lokasi
      },
      () => showToast('Gagal mendapatkan lokasi', 'error')
    );
  }
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
});

// ==============================================
//  JADWAL
// ==============================================

const allDokterData = [
  { id: 1, nama: 'dr. Anisa Putri', sp: 'Psikiater', emoji: '👩‍⚕️', warna: 'linear-gradient(135deg,#6ee7b7,#0d9488)' },
  { id: 2, nama: 'Budi Santoso, M.Psi', sp: 'Psikolog Klinis', emoji: '🧑‍💼', warna: 'linear-gradient(135deg,#fde68a,#f59e0b)' },
  { id: 3, nama: 'dr. Citra Dewi', sp: 'Psikiater Anak', emoji: '👩‍⚕️', warna: 'linear-gradient(135deg,#f9a8d4,#ec4899)' },
  { id: 4, nama: 'Sari Dewi, S.Psi', sp: 'Psikolog Klinis', emoji: '👩‍💼', warna: 'linear-gradient(135deg,#c4b5fd,#7c3aed)' },
  { id: 5, nama: 'dr. Hendra Wijaya', sp: 'Psikiater', emoji: '👨‍⚕️', warna: 'linear-gradient(135deg,#60a5fa,#2563eb)' },
];

// Jadwal tersimpan
let jadwalList = [
  {
    id: 'j001', dokterID: 1, pasienNama: 'Demo User', pasienEmail: 'demo@mail.com',
    tanggal: '2025-05-10', jam: '09:00', jenis: 'online',
    keluhan: 'Sering merasa cemas dan sulit tidur dalam 2 minggu terakhir.',
    status: 'pending'
  },
  {
    id: 'j002', dokterID: 3, pasienNama: 'Demo User', pasienEmail: 'demo@mail.com',
    tanggal: '2025-05-12', jam: '14:00', jenis: 'offline',
    keluhan: 'Anak saya sering tantrum dan sulit fokus di sekolah.',
    status: 'diterima'
  }
];

let selectedSlot = null;
let jadwalMode = 'user';

const SLOTS = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00'];
const PENUH_SLOTS = ['10:00','13:00']; // simulasi slot terisi

function initJadwal() {
  setJadwalMode('user', document.getElementById('jmodeUser'));
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookTanggal').min = today;
  selectedSlot = null;
}

function setJadwalMode(mode, el) {
  jadwalMode = mode;
  document.querySelectorAll('.jmode').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('jadwal-user-view').classList.toggle('hidden', mode !== 'user');
  document.getElementById('jadwal-dokter-view').classList.toggle('hidden', mode !== 'dokter');
  if (mode === 'user') renderUserJadwal();
  if (mode === 'dokter') renderDokterJadwal();
}

function updateSlotTime() {
  const dokterID = document.getElementById('bookDokter').value;
  const tgl = document.getElementById('bookTanggal').value;
  const grid = document.getElementById('slotGrid');
  if (!dokterID || !tgl) {
    grid.innerHTML = '<p style="color:var(--gray);font-size:0.85rem;">Pilih dokter & tanggal terlebih dahulu</p>';
    return;
  }
  selectedSlot = null;
  document.getElementById('tesBtnNext') && (document.getElementById('tesBtnNext').disabled = false);
  grid.innerHTML = SLOTS.map(s => {
    const penuh = PENUH_SLOTS.includes(s);
    return `<button class="slot-btn ${penuh ? 'penuh' : ''}" onclick="${penuh ? '' : `pilihSlot('${s}', this)`}">${s}${penuh ? ' (Penuh)' : ''}</button>`;
  }).join('');
}

function pilihSlot(jam, el) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  selectedSlot = jam;
}

function submitBooking() {
  const dokterID = parseInt(document.getElementById('bookDokter').value);
  const tgl = document.getElementById('bookTanggal').value;
  const keluhan = document.getElementById('bookKeluhan').value.trim();
  const jenis = document.querySelector('input[name="jenis"]:checked')?.value || 'online';

  if (!dokterID) { showToast('Pilih dokter terlebih dahulu', 'error'); return; }
  if (!tgl) { showToast('Pilih tanggal terlebih dahulu', 'error'); return; }
  if (!selectedSlot) { showToast('Pilih waktu konsultasi', 'error'); return; }
  if (!keluhan) { showToast('Tuliskan keluhan singkat kamu', 'error'); return; }

  const newJadwal = {
    id: 'j' + Date.now(),
    dokterID, pasienNama: currentUser?.name || 'User',
    pasienEmail: currentUser?.email || '-',
    tanggal: tgl, jam: selectedSlot, jenis, keluhan,
    status: 'pending'
  };
  jadwalList.push(newJadwal);

  // Reset form
  document.getElementById('bookDokter').value = '';
  document.getElementById('bookTanggal').value = '';
  document.getElementById('bookKeluhan').value = '';
  document.getElementById('slotGrid').innerHTML = '<p style="color:var(--gray);font-size:0.85rem;">Pilih dokter & tanggal terlebih dahulu</p>';
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  selectedSlot = null;

  showToast('Permintaan jadwal terkirim! Menunggu konfirmasi dokter ⏳', 'success');
  renderUserJadwal();
  updateNotifDot();
}

function renderUserJadwal() {
  const list = document.getElementById('userJadwalList');
  const myJadwal = jadwalList.filter(j => j.pasienNama === (currentUser?.name || 'User'));
  if (myJadwal.length === 0) {
    list.innerHTML = `<div class="empty-state"><i class="fa fa-calendar-times"></i><p>Belum ada jadwal konsultasi</p></div>`;
    return;
  }
  list.innerHTML = myJadwal.map(j => {
    const dok = allDokterData.find(d => d.id === j.dokterID) || {};
    const statusLabel = { pending: '⏳ Menunggu', diterima: '✅ Diterima', ditolak: '❌ Ditolak' }[j.status];
    const chatBtn = j.status === 'diterima'
      ? `<button class="jadwal-chat-btn" onclick="openChatWithDokter(${j.dokterID})"><i class="fa fa-comments"></i> Chat</button>` : '';
    return `
      <div class="jadwal-item status-${j.status}">
        <div class="jadwal-doc-avatar" style="background:${dok.warna||'var(--green-light)'}">${dok.emoji||'👨‍⚕️'}</div>
        <div class="jadwal-info">
          <h4>${dok.nama||'Dokter'}</h4>
          <p>${j.tanggal} · ${j.jam} · ${j.jenis === 'online' ? '💻 Online' : '🏥 Tatap Muka'}</p>
        </div>
        <span class="jadwal-status-badge ${j.status}">${statusLabel}</span>
        ${chatBtn}
      </div>`;
  }).join('');
}

function renderDokterJadwal() {
  const list = document.getElementById('dokterJadwalList');
  if (jadwalList.length === 0) {
    list.innerHTML = `<div class="empty-state"><i class="fa fa-inbox"></i><p>Belum ada permintaan jadwal</p></div>`;
    return;
  }
  list.innerHTML = jadwalList.map(j => {
    const dok = allDokterData.find(d => d.id === j.dokterID) || {};
    const initial = (j.pasienNama || 'U').charAt(0).toUpperCase();
    if (j.status !== 'pending') {
      return `
        <div class="dokter-jadwal-item">
          <div class="djadwal-header">
            <div class="djadwal-pasien-avatar">${initial}</div>
            <div class="djadwal-info">
              <h4>${j.pasienNama}</h4>
              <p>untuk ${dok.nama} · ${j.tanggal} ${j.jam}</p>
            </div>
          </div>
          <div class="djadwal-status-bar ${j.status}">
            ${j.status === 'diterima' ? '✅ Jadwal Diterima' : '❌ Jadwal Ditolak'}
          </div>
        </div>`;
    }
    return `
      <div class="dokter-jadwal-item" id="djadwal-${j.id}">
        <div class="djadwal-header">
          <div class="djadwal-pasien-avatar">${initial}</div>
          <div class="djadwal-info">
            <h4>${j.pasienNama}</h4>
            <p>Permintaan ke ${dok.nama}</p>
          </div>
        </div>
        <div class="djadwal-detail">
          📅 <strong>${j.tanggal}</strong> · ⏰ <strong>${j.jam}</strong> · ${j.jenis === 'online' ? '💻 Online' : '🏥 Tatap Muka'}
        </div>
        <div class="djadwal-keluhan">
          💬 <strong>Keluhan:</strong> ${j.keluhan}
        </div>
        <div class="djadwal-actions">
          <button class="btn-terima" onclick="updateJadwalStatus('${j.id}', 'diterima')">
            <i class="fa fa-check"></i> Terima
          </button>
          <button class="btn-tolak" onclick="updateJadwalStatus('${j.id}', 'ditolak')">
            <i class="fa fa-times"></i> Tolak
          </button>
        </div>
      </div>`;
  }).join('');
}

function updateJadwalStatus(jid, status) {
  const idx = jadwalList.findIndex(j => j.id === jid);
  if (idx < 0) return;
  jadwalList[idx].status = status;
  const label = status === 'diterima' ? 'Jadwal diterima ✅' : 'Jadwal ditolak ❌';
  showToast(label, status === 'diterima' ? 'success' : 'error');
  renderDokterJadwal();
  updateNotifDot();
}

function updateNotifDot() {
  const dot = document.getElementById('notifDot');
  if (!dot) return;
  const hasPending = jadwalList.some(j => j.status === 'pending' || j.status === 'diterima');
  dot.classList.toggle('hidden', !hasPending);
}

// ==============================================
//  REKOMENDASI
// ==============================================

const rekDokterPool = [
  { id: 1, emoji: '👩‍⚕️', warna: 'linear-gradient(135deg,#6ee7b7,#0d9488)', nama: 'dr. Anisa Putri', sp: 'Psikiater', rating: '4.9', ulasan: 120, tags: ['Depresi', 'Kecemasan', 'Trauma'], match: 98 },
  { id: 2, emoji: '🧑‍💼', warna: 'linear-gradient(135deg,#fde68a,#f59e0b)', nama: 'Budi Santoso, M.Psi', sp: 'Psikolog Klinis', rating: '4.8', ulasan: 98, tags: ['Stres', 'CBT', 'Karir'], match: 91 },
  { id: 3, emoji: '👩‍⚕️', warna: 'linear-gradient(135deg,#f9a8d4,#ec4899)', nama: 'dr. Citra Dewi', sp: 'Psikiater Anak', rating: '5.0', ulasan: 45, tags: ['Anak', 'Remaja', 'ADHD'], match: 87 },
  { id: 4, emoji: '👩‍💼', warna: 'linear-gradient(135deg,#c4b5fd,#7c3aed)', nama: 'Sari Dewi, S.Psi', sp: 'Psikolog Klinis', rating: '4.9', ulasan: 76, tags: ['Hubungan', 'Self-Esteem', 'Mindfulness'], match: 85 },
  { id: 5, emoji: '👨‍⚕️', warna: 'linear-gradient(135deg,#60a5fa,#2563eb)', nama: 'dr. Hendra Wijaya', sp: 'Psikiater', rating: '4.8', ulasan: 88, tags: ['Bipolar', 'Skizofrenia', 'Gangguan Panik'], match: 82 },
];

const rekArtikelPool = [
  { emoji: '🧘', bg: '#dcfce7', color: '#166534', judul: 'Teknik Pernapasan untuk Atasi Kecemasan', sub: 'Mindfulness · 5 menit baca' },
  { emoji: '😴', bg: '#e0f2fe', color: '#0369a1', judul: 'Tidur Lebih Nyenyak dengan Rutinitas Malam', sub: 'Self-Care · 4 menit baca' },
  { emoji: '💬', bg: '#fce7f3', color: '#9d174d', judul: 'Cara Berkomunikasi dengan Terapis Pertama Kali', sub: 'Panduan · 6 menit baca' },
  { emoji: '🌱', bg: '#fef9c3', color: '#713f12', judul: 'Memulai Jurnal Harian untuk Kesehatan Mental', sub: 'Kebiasaan Positif · 3 menit baca' },
];

function generateRekomendasi() {
  const container = document.getElementById('rekomendasiContent');
  // Shuffle sedikit untuk simulasi "fresh"
  const shuffledDokter = [...rekDokterPool].sort(() => 0.3 - Math.random()).slice(0, 3);
  const shuffledArtikel = [...rekArtikelPool].sort(() => 0.3 - Math.random()).slice(0, 3);

  container.innerHTML = `
    <div class="rek-section">
      <div class="rek-section-title">👨‍⚕️ Dokter yang Cocok Untukmu</div>
      <div class="rek-dokter-grid">
        ${shuffledDokter.map(d => `
          <div class="rek-dokter-card">
            <span class="rek-match-badge">✓ ${d.match}% Cocok</span>
            <div class="rek-doc-top">
              <div class="rek-doc-avatar" style="background:${d.warna}">${d.emoji}</div>
              <div class="rek-doc-info">
                <h4>${d.nama}</h4>
                <p>${d.sp}</p>
              </div>
            </div>
            <div class="rek-doc-tags">
              ${d.tags.map(t => `<span class="rek-tag">${t}</span>`).join('')}
            </div>
            <div class="rek-doc-meta">
              <span>⭐ ${d.rating} · ${d.ulasan} ulasan</span>
              <button class="btn-rek-chat" onclick="openChatWithDokter(${d.id})">
                <i class="fa fa-comments"></i> Chat
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="rek-section">
      <div class="rek-section-title">📖 Artikel yang Relevan Untukmu</div>
      <div class="rek-artikel-list">
        ${shuffledArtikel.map(a => `
          <div class="rek-artikel-item">
            <div class="rek-artikel-icon" style="background:${a.bg};color:${a.color}">${a.emoji}</div>
            <div class="rek-artikel-info">
              <h4>${a.judul}</h4>
              <p>${a.sub}</p>
            </div>
            <i class="fa fa-chevron-right" style="color:var(--gray);font-size:0.8rem;"></i>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="rek-section">
      <div class="rek-section-title">📅 Jadwal Tersedia Minggu Ini</div>
      <div style="background:var(--white);border-radius:var(--radius);padding:1.2rem;box-shadow:var(--shadow);">
        ${rekDokterPool.slice(0,2).map(d => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-light);">
            <div style="width:38px;height:38px;border-radius:50%;background:${d.warna};display:flex;align-items:center;justify-content:center;font-size:1.1rem;">${d.emoji}</div>
            <div style="flex:1;">
              <p style="font-weight:700;font-size:0.88rem;color:var(--navy);">${d.nama}</p>
              <p style="font-size:0.76rem;color:var(--gray);">Slot tersedia: Senin–Jumat</p>
            </div>
            <button onclick="showPage('jadwal')" style="padding:7px 14px;background:var(--green-light);color:var(--green-dark);border-radius:50px;font-size:0.78rem;font-weight:700;border:none;cursor:pointer;">Booking</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==============================================
//  CHAT
// ==============================================

const chatDokterList = [
  { id: 1, emoji: '👩‍⚕️', warna: 'linear-gradient(135deg,#6ee7b7,#0d9488)', nama: 'dr. Anisa Putri', sp: 'Psikiater', status: 'online' },
  { id: 2, emoji: '🧑‍💼', warna: 'linear-gradient(135deg,#fde68a,#f59e0b)', nama: 'Budi Santoso, M.Psi', sp: 'Psikolog', status: 'online' },
  { id: 3, emoji: '👩‍⚕️', warna: 'linear-gradient(135deg,#f9a8d4,#ec4899)', nama: 'dr. Citra Dewi', sp: 'Psikiater Anak', status: 'offline' },
  { id: 4, emoji: '👩‍💼', warna: 'linear-gradient(135deg,#c4b5fd,#7c3aed)', nama: 'Sari Dewi, S.Psi', sp: 'Psikolog Klinis', status: 'online' },
  { id: 5, emoji: '👨‍⚕️', warna: 'linear-gradient(135deg,#60a5fa,#2563eb)', nama: 'dr. Hendra Wijaya', sp: 'Psikiater', status: 'offline' },
];

// Pesan awal per dokter
const chatInitMessages = {
  1: [{ from: 'dokter', text: 'Halo! Saya dr. Anisa Putri. Ada yang bisa saya bantu hari ini? 😊', time: '09:00' }],
  2: [{ from: 'dokter', text: 'Selamat datang! Saya Budi Santoso. Ceritakan apa yang sedang kamu rasakan.', time: '10:30' }],
  3: [{ from: 'dokter', text: 'Halo! Saya dr. Citra. Saya siap membantu kamu dan keluarga.', time: 'Kemarin' }],
  4: [{ from: 'dokter', text: 'Hi! Saya Sari Dewi. Jangan ragu untuk cerita ya, ini ruang aman. 💚', time: '14:00' }],
  5: [{ from: 'dokter', text: 'Selamat datang! Saya dr. Hendra. Apa yang ingin kamu konsultasikan?', time: 'Senin' }],
};

// Balasan otomatis dokter per topik
const autoReplies = [
  'Terima kasih sudah berbagi. Bisa ceritakan lebih lanjut?',
  'Saya mengerti perasaan kamu. Sudah berapa lama mengalami ini?',
  'Itu wajar untuk dirasakan. Mari kita cari solusi bersama 🌿',
  'Apakah kamu sudah mencoba teknik relaksasi sebelumnya?',
  'Saya sarankan kita jadwalkan sesi konsultasi lebih mendalam. Apakah kamu setuju?',
  'Kondisi seperti ini memang bisa terasa berat. Tapi dengan langkah yang tepat, akan membaik 💚',
  'Bagus sekali kamu mau berbagi. Itu langkah pertama yang penting.',
];

let chatState = {
  activeID: null,
  conversations: {},
  allItems: [],
};

function initChat() {
  // Inisialisasi conversations dari dummy data
  chatDokterList.forEach(d => {
    if (!chatState.conversations[d.id]) {
      chatState.conversations[d.id] = {
        dokter: d,
        messages: [...(chatInitMessages[d.id] || [])],
        unread: d.id === 1 ? 1 : 0,
      };
    }
  });
  renderChatList();
  document.getElementById('chatEmpty').classList.remove('hidden');
  document.getElementById('chatActive').classList.add('hidden');
}

function renderChatList(filter = '') {
  const list = document.getElementById('chatList');
  const convs = Object.values(chatState.conversations);
  const filtered = filter
    ? convs.filter(c => c.dokter.nama.toLowerCase().includes(filter.toLowerCase()))
    : convs;

  list.innerHTML = filtered.map(c => {
    const lastMsg = c.messages[c.messages.length - 1];
    const isActive = chatState.activeID === c.dokter.id;
    const dotClass = c.dokter.status === 'online' ? 'online' : 'offline';
    return `
      <div class="chat-list-item ${isActive ? 'active' : ''}" onclick="openChat(${c.dokter.id})">
        <div class="cli-avatar" style="background:${c.dokter.warna}">
          ${c.dokter.emoji}
          <div class="cli-online-dot ${dotClass}"></div>
        </div>
        <div class="cli-info">
          <div class="cli-name">${c.dokter.nama}</div>
          <div class="cli-preview">${lastMsg ? lastMsg.text : 'Mulai percakapan...'}</div>
        </div>
        <div class="cli-meta">
          <span class="cli-time">${lastMsg ? lastMsg.time : ''}</span>
          ${c.unread > 0 ? `<span class="cli-unread">${c.unread}</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

function openChat(dokterID) {
  chatState.activeID = dokterID;
  const conv = chatState.conversations[dokterID];
  if (!conv) return;
  conv.unread = 0;

  // Update header
  document.getElementById('chatHeaderAvatar').style.background = conv.dokter.warna;
  document.getElementById('chatHeaderAvatar').textContent = conv.dokter.emoji;
  document.getElementById('chatHeaderName').textContent = conv.dokter.nama;
  document.getElementById('chatHeaderStatus').textContent =
    conv.dokter.status === 'online' ? '🟢 Online' : '⚫ Offline';

  document.getElementById('chatEmpty').classList.add('hidden');
  document.getElementById('chatActive').classList.remove('hidden');

  renderMessages();
  renderChatList();
  document.getElementById('chatInput').focus();

  // Mobile: hide sidebar
  document.getElementById('chatSidebar').classList.add('chat-hidden');
}

function closeChatActive() {
  chatState.activeID = null;
  document.getElementById('chatEmpty').classList.remove('hidden');
  document.getElementById('chatActive').classList.add('hidden');
  document.getElementById('chatSidebar').classList.remove('chat-hidden');
  renderChatList();
}

function renderMessages() {
  const conv = chatState.conversations[chatState.activeID];
  if (!conv) return;
  const container = document.getElementById('chatMessages');

  container.innerHTML = `<div class="msg-system">Percakapan dimulai — semua informasi bersifat rahasia 🔒</div>` +
    conv.messages.map(m => {
      const isSent = m.from === 'user';
      return `
        <div class="msg-row ${isSent ? 'sent' : 'received'}">
          ${!isSent ? `<div class="msg-avatar-small" style="background:${conv.dokter.warna}">${conv.dokter.emoji}</div>` : ''}
          <div>
            <div class="msg-bubble">${m.text}</div>
            <div class="msg-time">${m.time}</div>
          </div>
        </div>`;
    }).join('');

  container.scrollTop = container.scrollHeight;
}

function handleChatKey(e) {
  if (e.key === 'Enter') sendMessage();
}

function sendMessage() {
  if (!chatState.activeID) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const conv = chatState.conversations[chatState.activeID];
  const now = new Date();
  const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

  conv.messages.push({ from: 'user', text, time });
  input.value = '';
  renderMessages();
  renderChatList();

  // Typing indicator
  const container = document.getElementById('chatMessages');
  const typingHTML = `<div class="msg-row received typing-indicator" id="typingRow">
    <div class="msg-avatar-small" style="background:${conv.dokter.warna}">${conv.dokter.emoji}</div>
    <div class="msg-bubble"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>
  </div>`;
  container.insertAdjacentHTML('beforeend', typingHTML);
  container.scrollTop = container.scrollHeight;

  // Auto reply
  setTimeout(() => {
    const typing = document.getElementById('typingRow');
    if (typing) typing.remove();
    const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
    const replyTime = new Date();
    const rTime = replyTime.getHours().toString().padStart(2,'0') + ':' + replyTime.getMinutes().toString().padStart(2,'0');
    conv.messages.push({ from: 'dokter', text: reply, time: rTime });
    renderMessages();
    renderChatList();
  }, 1200 + Math.random() * 800);
}

function filterChat(val) {
  renderChatList(val);
}

function showNewChatModal() {
  const overlay = document.getElementById('newChatOverlay');
  const modal = document.getElementById('newChatModal');
  overlay.classList.add('active');
  modal.classList.add('active');

  document.getElementById('newChatDokterList').innerHTML = chatDokterList.map(d => `
    <div class="new-chat-item" onclick="startNewChat(${d.id})">
      <div class="nc-avatar" style="background:${d.warna}">${d.emoji}</div>
      <div class="nc-info">
        <h4>${d.nama}</h4>
        <p>${d.sp}</p>
      </div>
      <span class="nc-status ${d.status}">${d.status === 'online' ? '🟢 Online' : '⚫ Offline'}</span>
    </div>
  `).join('');
}

function closeNewChatModal() {
  document.getElementById('newChatOverlay').classList.remove('active');
  document.getElementById('newChatModal').classList.remove('active');
}

function startNewChat(dokterID) {
  closeNewChatModal();
  showPage('chat');
  setTimeout(() => openChat(dokterID), 100);
}

function openChatWithDokter(dokterID) {
  showPage('chat');
  setTimeout(() => openChat(dokterID), 150);
}

function openVideoCall() {
  showToast('Fitur video call akan segera hadir! 🎥', 'success');
}

function openScheduleFromChat() {
  showPage('jadwal');
  closeSidebar();
}

