const inputMusic = document.getElementById("inputMusic");
const songList = document.getElementById("songList");
const audioPlayer = document.getElementById("audioPlayer");
const nowPlaying = document.getElementById("nowPlaying");

function namaBersih(namaFile) {
  return namaFile.replace(/^\d+-/, "");
}

function muatDaftarLagu() {
  songList.innerHTML = "";
  fetch("/songs")
    .then(function(res) { return res.json(); })
    .then(function(daftarLagu) {
      daftarLagu.forEach(function(namaFile) {
        const item = document.createElement("div");
        item.className = "song-item";
        item.textContent = namaBersih(namaFile);
        item.addEventListener("click", function() {
          putarLagu(namaFile);
        });
        songList.appendChild(item);
      });
    })
    .catch(function(err) {
      console.error("Gagal muat daftar lagu:", err);
    });
}

function putarLagu(namaFile) {
  audioPlayer.src = "/music-files/" + namaFile;
  audioPlayer.play();
  nowPlaying.textContent = namaBersih(namaFile);
}

inputMusic.addEventListener("change", function() {
  const file = inputMusic.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  fetch("/upload-music", {
    method: "POST",
    body: formData
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      console.log("Lagu berhasil disimpan:", data);
      muatDaftarLagu();
    })
    .catch(function(err) {
      console.error("Gagal upload lagu:", err);
    });
});

muatDaftarLagu();