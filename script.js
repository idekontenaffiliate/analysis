// GANTI URL DI BAWAH INI DENGAN LINK CSV DARI GOOGLE SHEETS ANDA
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSI_5dVogArMM6hfMUrTpsXCVj-7rGmD2aqklSRufNHUHN_JzOYOgZ2Qz1TZszE7kH9XTaSa1kOv6N2/pub?output=csv";

// GANTI DENGAN URL WEB APP DARI GOOGLE APPS SCRIPT
const GAS_URL = "URL_WEB_APP_ANDA_DISINI";
// 1. Definisikan semua URL Anda di sini
const URLS = {
        Awal: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6N6cAL1OoX2hCBXmL3MAmQcgxMTglDN2LtCseQdOC8zkWdDwRDCRDjKnI9NE3vMGSaXgWesgcdvGV/pub?output=csv",
        Kidung: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSasN_qIm_FKLGkh4t-clscJXdiuZJENUa0JgC3_-lwpmggsQ_xqF8DH_m-3wxCFU99j1WIj0n8nNhy/pub?output=csv",
        Acara: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBBAJPP9Cn1cyq2cBpFGpv1rJSeSQedR7ctR9mrO67wGNbVTbEcCaXCp4ZVkAOGmCKJ9yxo1Q7Yox3/pub?output=csv",
        Kegiatan: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR2W99PcE9P3GLHRXWFSO_viwtukTnH8ePHSKKr_KPgtMOhOEOLRkSHc6vMdpyay8GLEop3CB0R2gtS/pub?output=csv",
        Jemaat: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSI_5dVogArMM6hfMUrTpsXCVj-7rGmD2aqklSRufNHUHN_JzOYOgZ2Qz1TZszE7kH9XTaSa1kOv6N2/pub?output=csv"
    Firman: "LINK_CSV_FIRMAN",
    Games: "LINK_CSV_GAMES",
    SpinWell: "LINK_CSV_SPINWELL"
    // Tambahkan link lainnya sesuai kebutuhan Anda
};

let currentUser = null;
let db = {}; // Objek kosong, akan diisi dinamis

// 2. Fungsi untuk mengambil data secara paralel (lebih cepat daripada satu-satu)
async function loadAllData() {
    const keys = Object.keys(URLS);
    
    // Kita buat array janji (Promises) untuk mengambil data bersamaan
    const promises = keys.map(key => {
        return new Promise((resolve) => {
            Papa.parse(URLS[key], {
                download: true,
                header: true,
                complete: (results) => {
                    db[key] = results.data; // Simpan ke objek db
                    resolve();
                },
                error: () => {
                    console.error("Gagal memuat:", key);
                    db[key] = [];
                    resolve();
                }
            });
        });
    });

    await Promise.all(promises);
    console.log("Database siap:", db);
    // Setelah data selesai dimuat, Anda bisa mulai menampilkan login screen
    document.getElementById('loading-screen').style.display = 'none';
}

// 3. Panggil saat aplikasi dibuka
window.onload = () => {
    loadAllData();
};

// 4. Contoh cara mengakses data di modul lain
function renderModule(moduleName) {
    const data = db[moduleName]; // Akses langsung dari objek db
    if (!data) {
        alert("Data belum siap!");
        return;
    }
    // Lanjutkan logika rendering Anda di sini
}
const app = {
    user: null,
    fontSize: 16,
    dataCache: {},

    // --- KONEKSI API ---
    api: async function(payload) {
        try {
            const res = await fetch(GAS_URL, { method: 'POST', body: JSON.stringify(payload) });
            return await res.json();
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Gagal terhubung ke server' };
        }
    },

    // --- UI/UX CONTROLS ---
    toggleTheme: function() {
        document.body.classList.toggle('dark-mode');
        const icon = document.querySelector('#theme-toggle i');
        icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
    },

    changeFontSize: function(delta) {
        this.fontSize += delta;
        document.getElementById('content-area').style.fontSize = this.fontSize + 'px';
    },

    toggleSidebar: function() {
        document.getElementById('sidebar').classList.toggle('open');
    },

    // --- OTENTIKASI & MENU ---
    login: async function() {
        const u = document.getElementById('login-user').value;
        const p = document.getElementById('login-pass').value;
        document.getElementById('login-error').innerText = "Memproses...";
        
        const res = await this.api({ action: 'login', username: u, password: p });
        if (res.success) {
            this.user = res.user;
            document.getElementById('login-view').classList.remove('active');
            document.getElementById('app-view').classList.add('active');
            this.buildMenu();
            this.api({ action: 'logHistory', username: this.user.username, menu: 'Login', detail: 'Sistem diakses' });
        } else {
            document.getElementById('login-error').innerText = res.message;
        }
    },

    logout: function() {
        this.user = null;
        document.getElementById('app-view').classList.remove('active');
        document.getElementById('login-view').classList.add('active');
        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';
    },

    buildMenu: function() {
        const menuHTML = `
            <li onclick="app.loadView('Dashboard')"><i class="fas fa-chart-line"></i> Dashboard</li>
            ${this.user.tipe.map(m => `<li onclick="app.loadView('${m}')"><i class="fas fa-folder"></i> ${m}</li>`).join('')}
            <li onclick="app.loadView('Pengaturan')"><i class="fas fa-cog"></i> Pengaturan</li>
        `;
        document.getElementById('menu-list').innerHTML = menuHTML;
        this.loadView('Dashboard');
    },

    // --- ROUTER VIEW ---
    loadView: async function(view) {
        const content = document.getElementById('content-area');
        content.innerHTML = `<h2><i class="fas fa-spinner fa-spin"></i> Memuat ${view}...</h2>`;
        if (window.innerWidth < 768) this.toggleSidebar();

        this.api({ action: 'logHistory', username: this.user.username, menu: view, detail: 'Buka modul' });

        if (view === 'Dashboard') this.renderDashboard();
        else if (view === 'Kidung') this.renderKidung();
        else if (view === 'Jemaat') this.renderJemaat();
        else if (view === 'Pertanyaan kuis') this.renderKuis();
        else if (view === 'Pengaturan') this.renderPengaturan();
        else content.innerHTML = `<h2>${view}</h2><p>Modul dalam tahap integrasi database.</p>`;
    },

    // --- MODUL: DASHBOARD ---
    renderDashboard: async function() {
        const content = document.getElementById('content-area');
        content.innerHTML = `
            <h2>Dashboard Statistik</h2>
            <div class="grid" style="margin-top: 20px;">
                <div class="card"><canvas id="chartUmur"></canvas></div>
                <div class="card"><canvas id="chartGender"></canvas></div>
            </div>
        `;
        
        // Asumsi data diambil dari cache atau API Jemaat
        new Chart(document.getElementById('chartUmur'), {
            type: 'bar',
            data: { labels: ['Anak', 'Remaja', 'Pemuda', 'Kaum Saleh'], datasets: [{ label: 'Jumlah', data: [30, 20, 25, 45], backgroundColor: '#0d6efd' }] }
        });
        new Chart(document.getElementById('chartGender'), {
            type: 'pie',
            data: { labels: ['Pria', 'Wanita'], datasets: [{ data: [55, 65], backgroundColor: ['#0d6efd', '#dc3545'] }] }
        });
    },

    // --- MODUL: KUIS INTERAKTIF ---
    renderKuis: async function() {
        const content = document.getElementById('content-area');
        const res = await this.api({ action: 'getData', sheetName: 'Pertanyaan kuis' });
        
        if(!res.success) return content.innerHTML = `<p class="text-error">Gagal memuat kuis.</p>`;
        
        let kuisHTML = `<h2>Kuis Interaktif</h2><div id="kuis-container">`;
        res.data.forEach((q, i) => {
            kuisHTML += `
                <div class="card" style="margin-bottom: 15px;">
                    <p><strong>${q.no}. ${q.pertanyaan}</strong></p>
                    ${[1,2,3,4,5].map(n => q[`pilihan jawaban ke ${n}`] ? 
                        `<label style="display:block; margin:5px 0;"><input type="radio" name="q${q.no}" value="${n}"> ${q[`pilihan jawaban ke ${n}`]}</label>` 
                        : '').join('')}
                </div>
            `;
        });
        kuisHTML += `<button onclick="app.submitKuis()" class="btn-primary">Kumpulkan Jawaban</button></div>`;
        
        // Simpan data kuis di memori untuk grading
        this.dataCache.kuis = res.data;
        content.innerHTML = kuisHTML;
    },

    submitKuis: async function() {
        const dataKuis = this.dataCache.kuis;
        let nilaiTotal = 0;
        let jawabanUser = {};
        let kunci = {};

        dataKuis.forEach(q => {
            const selected = document.querySelector(`input[name="q${q.no}"]:checked`);
            const valUser = selected ? selected.value : "0";
            jawabanUser[q.no] = valUser;
            kunci[q.no] = q['kunci jawaban'];
            
            if(valUser == q['kunci jawaban']) nilaiTotal += parseInt(q.nilai || 10);
        });

        document.getElementById('kuis-container').innerHTML = `
            <h3>Kuis Selesai!</h3>
            <h1 style="color:var(--success)">Skor Anda: ${nilaiTotal}</h1>
            <button onclick="app.loadView('Dashboard')" class="btn-primary" style="margin-top:15px">Kembali ke Dashboard</button>
        `;

        await this.api({ action: 'submitQuiz', username: this.user.username, jawabanUser, nilaiTotal, kunci });
    },

    // --- MODUL: PENGATURAN (GANTI PASSWORD DENGAN REGEX) ---
    renderPengaturan: function() {
        document.getElementById('content-area').innerHTML = `
            <h2>Pengaturan Keamanan</h2>
            <div class="card" style="max-width: 400px;">
                <input type="password" id="old-pass" placeholder="Password Lama" style="width:100%; padding:10px; margin-bottom:10px;">
                <input type="password" id="new-pass" placeholder="Password Baru" style="width:100%; padding:10px; margin-bottom:10px;">
                <input type="password" id="confirm-pass" placeholder="Konfirmasi Password Baru" style="width:100%; padding:10px; margin-bottom:10px;">
                <button onclick="app.gantiPassword()" class="btn-primary">Simpan Password</button>
                <p id="pass-msg"></p>
                <ul style="font-size: 0.85em; color: var(--text-muted); margin-top:15px;">
                    <li>Minimal 8 karakter</li><li>Minimal 1 huruf besar & 1 kecil</li><li>Minimal 1 angka</li><li>Minimal 1 simbol (@$!%*?&)</li>
                </ul>
            </div>
        `;
    },

    gantiPassword: async function() {
        const oldP = document.getElementById('old-pass').value;
        const newP = document.getElementById('new-pass').value;
        const confP = document.getElementById('confirm-pass').value;
        const msg = document.getElementById('pass-msg');

        if(newP !== confP) return msg.innerHTML = `<span class="text-error">Konfirmasi password tidak cocok!</span>`;
        
        // Regex strict validation
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!regex.test(newP)) return msg.innerHTML = `<span class="text-error">Password tidak memenuhi syarat keamanan!</span>`;

        msg.innerHTML = "Memproses...";
        const res = await this.api({ action: 'changePassword', username: this.user.username, oldPassword: oldP, newPassword: newP });
        msg.innerHTML = `<span style="color:${res.success ? 'var(--success)' : 'var(--danger)'}">${res.message}</span>`;
    }
};
