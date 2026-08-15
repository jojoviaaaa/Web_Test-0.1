const inputMusic = document.getElementById("inputMusic");
const songList = document.getElementById("songList");

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
        if (lagu.cover) {
          cover.style.backgroundImage = "url(/covers/" + lagu.cover + ")";
        }
        item.appendChild(cover);

        const info = document.createElement("div");
        info.className = "song-info";
        info.innerHTML = "<div class='song-title'>" + lagu.judul + "</div>" +
          "<div class='song-artist'>" + lagu.artis + "</div>";
        item.appendChild(info);

        songList.appendChild(item);
      });
    })
    .catch(function(err) {
      console.error("Gagal muat daftar lagu:", err);
    });
}

inputMusic.addEventListener("change", function() {
  const file = inputMusic.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  fetch("/settings/upload-music", {
    method: "POST",
    body: formData
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      console.log("Lagu tersimpan:", data);
      muatDaftarLagu();
    })
    .catch(function(err) {
      console.error("Gagal upload lagu:", err);
    });
});

muatDaftarLagu();