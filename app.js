const DAFTAR_FURNITUR = ['kursi', 'meja', 'sofa'];

function tampilkanStatus(pesan) {
  const status = document.querySelector('#status');
  status.textContent = pesan;
  status.classList.add('is-visible');
  window.clearTimeout(tampilkanStatus.timer);
  tampilkanStatus.timer = window.setTimeout(() => {
    status.classList.remove('is-visible');
  }, 2200);
}

function pilihFurnitur(namaFurnitur, tombol) {
  DAFTAR_FURNITUR.forEach((furnitur) => {
    const entitas = document.getElementById(`furnitur-${furnitur}`);
    if (entitas) entitas.setAttribute('visible', furnitur === namaFurnitur);
  });

  document.querySelectorAll('[data-furnitur]').forEach((button) => {
    button.classList.toggle('active', button === tombol);
  });
}

function initUI() {
  const sheet = document.querySelector('#selection-sheet');
  const moreButton = document.querySelector('#more-button');

  moreButton.addEventListener('click', () => {
    sheet.classList.toggle('is-open');
  });

  document.querySelectorAll('[data-furnitur]').forEach((button) => {
    button.addEventListener('click', () => {
      pilihFurnitur(button.dataset.furnitur, button);
      sheet.classList.remove('is-open');
    });
  });

  document.querySelector('#place-button').addEventListener('click', () => {
    document.body.classList.toggle('is-placed');
    const sudahDiletakkan = document.body.classList.contains('is-placed');
    tampilkanStatus(
      sudahDiletakkan
        ? 'Furniture placed'
        : 'Move and turn to fit it into place'
    );
  });

  document.querySelector('#close-button').addEventListener('click', () => {
    tampilkanStatus('Tap the product card to change furniture');
  });
}

function initMarkerStatus() {
  const marker = document.querySelector('#hiro-marker');
  if (!marker) return;

  marker.addEventListener('markerFound', () => {
    tampilkanStatus('Marker detected');
  });
  marker.addEventListener('markerLost', () => {
    tampilkanStatus('Point camera at the Hiro marker');
  });
}

function initModelDebug() {
  const model = document.querySelector('#furnitur-kursi');
  if (!model) return;

  model.addEventListener('model-error', () => {
    tampilkanStatus('Furniture model could not be loaded');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initMarkerStatus();
  initModelDebug();
});