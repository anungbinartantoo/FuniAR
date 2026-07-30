const DAFTAR_FURNITUR = ['lemari', 'meja', 'sofa'];
// ⬆️ Kalau nambah furniture baru, tinggal tambahin nama di array ini,
// pastikan namanya SAMA PERSIS dengan id marker & id model di index.html

function tampilkanStatus(pesan) {
  const status = document.querySelector('#status');
  status.textContent = pesan;
  status.classList.add('is-visible');
  window.clearTimeout(tampilkanStatus.timer);
  tampilkanStatus.timer = window.setTimeout(() => {
    status.classList.remove('is-visible');
  }, 2200);
}

// Tombol Lemari/Meja/Sofa cuma buat highlight & kasih instruksi,
// BUKAN show/hide (karena tiap furniture punya marker fisik sendiri)
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

// Pasang listener markerFound/markerLost untuk SEMUA marker di DAFTAR_FURNITUR
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

// Cek error load model untuk SEMUA model di DAFTAR_FURNITUR
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