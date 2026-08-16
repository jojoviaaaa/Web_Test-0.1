const inputMusic = document.getElementById("inputMusic");
const songList = document.getElementById("songList");
const previewPlayer = document.getElementById("previewPlayer");

function muatDaftarLagu() {
  songList.innerHTML = "";
  fetch("/songs")
    .then(function(res) { return res.json(); })
    .then(function(daftarLagu) {
      daftarLagu.slice().reverse().forEach(function(lagu) {
        const item = document.createElement("div");
        item.className = "song-row";

        const cover = document.createElement("div");
        cover.className = "song-cover";
        if (lagu.cover) cover.style.backgroundImage = "url(/covers/" + lagu.cover + ")";
        item.appendChild(cover);

        const info = document.createElement("div");
        info.className = "song-info";
        info.innerHTML = "<div class='song-title'>" + lagu.judul + "</div>" +
          "<div class='song-artist'>" + lagu.artis + "</div>";
        item.appendChild(info);

        item.addEventListener("click", function() {
          previewPlayer.src = "/music-files/" + lagu.filename;
          previewPlayer.play();
          localStorage.setItem("lastSongId", lagu.id);
        });

        songList.appendChild(item);
      });
    })
    .catch(function(err) { console.error("Gagal muat daftar lagu:", err); });
}

inputMusic.addEventListener("change", function() {
  const file = inputMusic.files[0];
  document.getElementById("fileNameMusic").textContent = file ? file.name : "Belum ada file dipilih";
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  fetch("/settings/upload-music", { method: "POST", body: formData })
    .then(function(res) { return res.json(); })
    .then(function(data) { console.log("Lagu tersimpan:", data); muatDaftarLagu(); })
    .catch(function(err) { console.error("Gagal upload lagu:", err); });
});

muatDaftarLagu();

const formKarya = document.getElementById("formKarya");
const karyaListSettings = document.getElementById("karyaListSettings");

document.getElementById("inputFotoKarya").addEventListener("change", function() {
  const jumlah = this.files.length;
  document.getElementById("fileNameFoto").textContent = jumlah > 0 ? jumlah + " foto dipilih" : "Belum ada foto dipilih";
});

function muatDaftarKarya() {
  karyaListSettings.innerHTML = "";
  fetch("/api/karya")
    .then(function(res) { return res.json(); })
    .then(function(daftarKarya) {
      daftarKarya.slice().reverse().forEach(function(karya) {
        const thumb = document.createElement("div");
        thumb.className = "photo-thumb";
        thumb.style.backgroundImage = "url(/photo-files/" + karya.cover + ")";
        thumb.title = karya.judul;
        karyaListSettings.appendChild(thumb);
      });
    })
    .catch(function(err) { console.error("Gagal muat karya:", err); });
}

formKarya.addEventListener("submit", function(e) {
  e.preventDefault();
  const files = document.getElementById("inputFotoKarya").files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) formData.append("foto", files[i]);
  formData.append("judul", document.getElementById("inputJudul").value);
  formData.append("kategori", document.getElementById("inputKategori").value);
  formData.append("deskripsi", document.getElementById("inputDeskripsi").value);

  fetch("/settings/upload-karya", { method: "POST", body: formData })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      console.log("Karya tersimpan:", data);
      formKarya.reset();
      document.getElementById("fileNameFoto").textContent = "Belum ada foto dipilih";
      muatDaftarKarya();
    })
    .catch(function(err) { console.error("Gagal simpan karya:", err); });
});

muatDaftarKarya();