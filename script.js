// GANTI URL DI BAWAH INI DENGAN LINK CSV DARI GOOGLE SHEETS ANDA
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSI_5dVogArMM6hfMUrTpsXCVj-7rGmD2aqklSRufNHUHN_JzOYOgZ2Qz1TZszE7kH9XTaSa1kOv6N2/pub?output=csv";

let jemaatData = [];

// Fungsi Navigasi Tab
function showSection(sectionId) {
    document.getElementById('jemaat-section').style.display = sectionId === 'jemaat' ? 'block' : 'none';
    document.getElementById('kegiatan-section').style.display = sectionId === 'kegiatan' ? 'block' : 'none';
    
    document.getElementById('btn-jemaat').classList.toggle('active', sectionId === 'jemaat');
    document.getElementById('btn-kegiatan').classList.toggle('active', sectionId === 'kegiatan');
}

// Ambil Data dari Google Sheets menggunakan PapaParse
if (sheetURL !== "MASUKKAN_LINK_CSV_GOOGLE_SHEET_ANDA_DISINI") {
    Papa.parse(sheetURL, {
        download: true,
        header: true,
        complete: function(results) {
            jemaatData = results.data.filter(row => row['Nama Lengkap'] && row['Nama Lengkap'].trim() !== "");
            renderJemaat(jemaatData);
        },
        error: function(error) {
            document.getElementById('jemaat-grid').innerHTML = `<p style="color:red;">Gagal memuat data. Pastikan link CSV benar dan sheet sudah dipublikasikan.</p>`;
        }
    });
} else {
    document.getElementById('jemaat-grid').innerHTML = `<p style="color:red;">Silakan masukkan URL CSV Google Sheets di dalam file script.js terlebih dahulu.</p>`;
}

// Render Data Jemaat ke Grid
function renderJemaat(data) {
    const grid = document.getElementById('jemaat-grid');
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = '<p>Tidak ada data ditemukan.</p>';
        return;
    }

    data.forEach((orang, index) => {
        // Tentukan Foto Default berdasarkan Gender
        let fotoURL = orang['Link Foto'];
        if (!fotoURL || fotoURL.trim() === "") {
            const gender = (orang['Gender'] || '').toLowerCase();
            if (gender.includes('wanita') || gender.includes('perempuan')) {
                fotoURL = 'https://api.dicebear.com/7.x/avataaars/svg?seed=female' + index; // Icon wanita acak
            } else {
                fotoURL = 'https://api.dicebear.com/7.x/avataaars/svg?seed=male' + index; // Icon pria acak
            }
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => showJemaatDetail(orang, fotoURL);
        
        card.innerHTML = `
            <img src="${fotoURL}" alt="Foto ${orang['Nama Panggilan']}">
            <h3>${orang['Nama Panggilan']}</h3>
            <span class="badge">${orang['Kategori']}</span>
        `;
        grid.appendChild(card);
    });
}

// Filter Pencarian dan Kategori
function filterJemaat() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const kategoriFilter = document.getElementById('kategoriFilter').value;

    const filteredData = jemaatData.filter(orang => {
        const matchName = (orang['Nama Lengkap'] || '').toLowerCase().includes(searchText) || 
                          (orang['Nama Panggilan'] || '').toLowerCase().includes(searchText);
        const matchKategori = kategoriFilter === "Semua" || orang['Kategori'] === kategoriFilter;
        return matchName && matchKategori;
    });

    renderJemaat(filteredData);
}

// Tampilkan Modal Detail Jemaat
function showJemaatDetail(orang, fotoURL) {
    const modalBody = document.getElementById('modal-jemaat-body');
    
    // Format Ibadah
    let ibadah = orang['Ibadah yang Diikuti'] ? orang['Ibadah yang Diikuti'].trim() : "";
    let statusIbadah = ibadah === "" ? "<span style='color:red;'>Tidak mengikuti ibadah</span>" : ibadah;

    modalBody.innerHTML = `
        <img src="${fotoURL}" class="modal-detail-img">
        <h2 style="text-align:center;">${orang['Nama Lengkap']}</h2>
        <div class="info-grid">
            <strong>No Efata:</strong> <span>${orang['No_EfataID'] || '-'}</span>
            <strong>Usia:</strong> <span>${orang['Usia'] || '-'} Tahun</span>
            <strong>Tanggal Lahir:</strong> <span>${orang['Tanggal Lahir'] || '-'}</span>
            <strong>Tanggal Baptis:</strong> <span>${orang['Tanggal Baptis'] || '-'}</span>
            <strong>Alamat:</strong> <span>${orang['Alamat'] || '-'}</span>
            <strong>Pelayanan:</strong> <span>${orang['Pelayanan'] || '-'}</span>
            <strong>Rata-rata Hadir:</strong> <span>${orang['Rata-rata Hadir'] || '-'}</span>
            <strong>Keikutsertaan Ibadah:</strong> <span>${statusIbadah}</span>
        </div>
        <p style="font-size:0.8rem; color:#888; text-align:center; margin-top:20px;">Data diupdate: ${orang['Tanggal Update'] || '-'}</p>
    `;
    
    document.getElementById('jemaatModal').style.display = 'block';
}

// --- DATA KEGIATAN (Bisa diatur di sini) ---
const kegiatanData = [
    {
        nama: "SPR Siang",
        gambar: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        tujuan: "Berkumpul bersama untuk memuji Tuhan, mendengarkan Firman, dan mempererat persekutuan seluruh jemaat dari berbagai usia.",
        pic_nama: "Gembala Distrik dan Penatua",
        pic_foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=andreas"
    },
    {
        nama: "SPR Pagi",
        gambar: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        tujuan: "Berkumpul bersama untuk memuji Tuhan, mendengarkan Firman, dan mempererat persekutuan seluruh jemaat dari berbagai usia.",
        pic_nama: "Gembala Distrik",
        pic_foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=andreas"
    },
    {
        nama: "Sidang Anak",
        gambar: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        tujuan: "Usia 6-12 Tahun.",
        pic_nama: "Gembala Anak-anak",
        pic_foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=andreas"
    },
    {
        nama: "Sidang Remaja",
        gambar: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        tujuan: "Usia 13-18 Tahun.",
        pic_nama: "Gembala Remaja",
        pic_foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=andreas"
    },
    {
        nama: "Persekutuan Pemuda",
        gambar: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        tujuan: "Membekali generasi muda dengan nilai-nilai Kristiani dalam menghadapi tantangan dunia modern.",
        pic_nama: "Gembala Pemuda",
        pic_foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=budi"
    }
];

// Render Data Kegiatan
function renderKegiatan() {
    const grid = document.getElementById('kegiatan-grid');
    kegiatanData.forEach(kegiatan => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => showKegiatanDetail(kegiatan);
        card.innerHTML = `
            <img src="${kegiatan.gambar}" alt="${kegiatan.nama}" style="border-radius:10px; width:100%;">
            <h3>${kegiatan.nama}</h3>
        `;
        grid.appendChild(card);
    });
}

function showKegiatanDetail(kegiatan) {
    const modalBody = document.getElementById('modal-kegiatan-body');
    modalBody.innerHTML = `
        <h2 style="margin-top:0;">${kegiatan.nama}</h2>
        <img src="${kegiatan.gambar}" style="width:100%; border-radius:10px; margin-bottom:15px;">
        <p><strong>Tujuan Ibadah:</strong><br>${kegiatan.tujuan}</p>
        <hr style="border:1px solid #eee; margin:15px 0;">
        <div style="display:flex; align-items:center; gap:15px;">
            <img src="${kegiatan.pic_foto}" style="width:60px; height:60px; border-radius:50%;">
            <div>
                <strong style="display:block; color:#2c3e50;">PIC Bertugas:</strong>
                <span>${kegiatan.pic_nama}</span>
            </div>
        </div>
    `;
    document.getElementById('kegiatanModal').style.display = 'block';
}

// Tutup Modal & Jalankan Inisiasi
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Tutup modal jika klik di luar box
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}

// Jalankan saat pertama load
renderKegiatan();
