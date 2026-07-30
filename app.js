const DAFTAR_FURNITUR = ['lemari', 'meja', 'sofa'];

function tampilkanStatus(pesan) {
  const status = document.querySelector('#status');
  status.textContent = pesan;
  status.classList.add('is-visible');
  window.clearTimeout(tampilkanStatus.timer);
  tampilkanStatus.timer = window.setTimeout(() => {
    status.classList.remove('is-visible');
  }, 2200);
}

// Catatan: karena tiap furniture sekarang punya marker fisik sendiri-sendiri
// (marker-lemari, marker-meja, marker-sofa), tombol pilihan di bawah cuma
// dipakai sebagai info highlight, BUKAN untuk toggle visible/invisible seperti
// versi lama (single-marker). Model otomatis muncul saat markernya kedeteksi.
function highlightPilihan(namaFurnitur, tombol) {
  document.querySelectorAll('[data-furnitur]').forEach((button) => {
    button.classList.toggle('active', button === tombol);
  });
  tampilkanStatus(`Arahkan kamera ke marker ${namaFurnitur}`);
}

function initUI() {
  const sheet = document.querySelector('#selection-sheet');
  const moreButton = document.querySelector('#more-button');

  moreButton.addEventListener('click', () => {
    sheet.classList.toggle('is-open');
  });

  document.querySelectorAll('[data-furnitur]').forEach((button) => {
    button.addEventListener('click', () => {
      highlightPilihan(button.dataset.furnitur, button);
      sheet.classList.remove('is-open');
    });
  });

  document.querySelector('#place-button').addEventListener('click', () => {
    document.body.classList.toggle('is-placed');
    const sudahDiletakkan = document.body.classList.contains('is-placed');
    tampilkanStatus(
      sudahDiletakkan
        ? 'Furniture placed'
        : 'Arahkan kamera ke salah satu marker'
    );
  });

  document.querySelector('#close-button').addEventListener('click', () => {
    tampilkanStatus('Tap kartu produk untuk ganti furniture');
  });
}

// Pasang listener markerFound/markerLost untuk KETIGA marker sekaligus
function initMarkerStatus() {
  DAFTAR_FURNITUR.forEach((nama) => {
    const marker = document.querySelector(`#marker-${nama}`);
    if (!marker) return;

    marker.addEventListener('markerFound', () => {
      tampilkanStatus(`Marker ${nama} terdeteksi`);
    });
    marker.addEventListener('markerLost', () => {
      tampilkanStatus('Arahkan kamera ke salah satu marker');
    });
  });
}

// Cek error load model untuk KETIGA model glb
function initModelDebug() {
  DAFTAR_FURNITUR.forEach((nama) => {
    const model = document.querySelector(`#furnitur-${nama}`);
    if (!model) return;

    model.addEventListener('model-error', () => {
      tampilkanStatus(`Model ${nama} gagal dimuat`);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initMarkerStatus();
  initModelDebug();
});

// ============================================================
// FIX: paksa video kamera full-screen.
// AR.js suka nge-set ukuran video lewat inline style JS, yang bisa
// menang duluan dari CSS kita. Jadi kita paksa juga lewat JS,
// dan diulang beberapa kali karena AR.js kadang nge-set ulang
// inline style-nya setelah kamera selesai load.
// ============================================================
let sedangMemaksa = false;

function paksaVideoFullscreen() {
  const video = document.querySelector('video');
  if (!video || sedangMemaksa) return;
  sedangMemaksa = true;

  const terapkanStyleVideo = (el) => {
    el.style.setProperty('position', 'fixed', 'important');
    el.style.setProperty('top', '0', 'important');
    el.style.setProperty('left', '0', 'important');
    el.style.setProperty('width', '100vw', 'important');
    el.style.setProperty('height', '100vh', 'important');
    el.style.setProperty('object-fit', 'cover', 'important');
    el.style.setProperty('max-width', 'none', 'important');
    el.style.setProperty('max-height', 'none', 'important');
    // Reset transform/scale yang mungkin dipasang AR.js buat nyesuain
    // rasio video ke ukuran aslinya (ini kemungkinan penyebab kepotong)
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('transform-origin', 'unset', 'important');
  };

  terapkanStyleVideo(video);

  // Naik ke SEMUA induk elemen sampai <body>, hapus batasan tinggi/overflow
  // yang mungkin nge-clip video (overflow:hidden, max-height, dsb)
  let parent = video.parentElement;
  while (parent && parent !== document.body) {
    parent.style.setProperty('width', '100vw', 'important');
    parent.style.setProperty('height', '100vh', 'important');
    parent.style.setProperty('max-width', 'none', 'important');
    parent.style.setProperty('max-height', 'none', 'important');
    parent.style.setProperty('overflow', 'visible', 'important');
    parent.style.setProperty('position', 'fixed', 'important');
    parent.style.setProperty('top', '0', 'important');
    parent.style.setProperty('left', '0', 'important');
    parent = parent.parentElement;
  }

  // Debug: print struktur parent video ke console biar kelihatan
  // elemen apa aja yang membungkus video (buat ketauan kalau masih
  // ada yang nge-clip setelah ini)
  if (!paksaVideoFullscreen._logged) {
    let el = video;
    const chain = [];
    while (el) {
      chain.push(`${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className : ''}`);
      el = el.parentElement;
    }
    console.log('[AR debug] Struktur parent video:', chain.join(' -> '));
    paksaVideoFullscreen._logged = true;
  }

  // Kasih jeda dikit sebelum matiin flag, biar mutation yang kepicu
  // dari perubahan kita sendiri (barusan) sempat "kelewat" tanpa
  // memicu pemaksaan berulang tak terbatas (infinite loop).
  window.setTimeout(() => {
    sedangMemaksa = false;
  }, 50);
}

window.addEventListener('load', paksaVideoFullscreen);
window.addEventListener('resize', paksaVideoFullscreen);

// ============================================================
// FIX UTAMA: AR.js terus-menerus nge-set ulang style video
// (video.style.height = "xxxpx") lewat JS-nya sendiri, jadi
// paksaan kita ketiban lagi walau udah dipaksa di awal.
// Solusinya: pantau elemen videonya pakai MutationObserver,
// tiap kali attribute "style" berubah (diubah AR.js), kita
// langsung paksa balik ke fullscreen lagi seketika itu juga.
// ============================================================
function pantauVideoTerusMenerus() {
  const video = document.querySelector('video');
  if (!video) {
    // video belum ada di DOM, coba lagi sebentar
    window.setTimeout(pantauVideoTerusMenerus, 200);
    return;
  }

  paksaVideoFullscreen();

  const observer = new MutationObserver(() => {
    paksaVideoFullscreen();
  });

  observer.observe(video, {
    attributes: true,
    attributeFilter: ['style'],
  });

  console.log('[AR debug] MutationObserver terpasang di video, akan terus jaga ukurannya.');
}

pantauVideoTerusMenerus();