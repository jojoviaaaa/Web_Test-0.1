const inputFile = document.getElementById("inputFile");
const galeri = document.getElementById("galeri");

function tebakTipe(namaFile) {
  const ext = namaFile.split(".").pop().toLowerCase();
  const gambarExt = ["jpg", "jpeg", "png", "gif", "webp"];
  const videoExt = ["mp4", "webm", "mov"];
  if (gambarExt.includes(ext)) return "image";
  if (videoExt.includes(ext)) return "video";
  return "lainnya";
}

function tambahKeGaleri(url, namaFile, tipe) {
  const wadah = document.createElement("div");

  const info = document.createElement("p");
  info.textContent = namaFile;
  wadah.appendChild(info);

  if (tipe === "image") {
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    wadah.appendChild(img);
  } else if (tipe === "video") {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.style.maxWidth = "100%";
    wadah.appendChild(video);
  } else {
    const link = document.createElement("a");
    link.href = url;
    link.textContent = "Buka file";
    link.target = "_blank";
    link.style.color = "#c80000";
    wadah.appendChild(link);
  }

  galeri.appendChild(wadah);
}

function muatGaleri() {
  galeri.innerHTML = "";
  fetch("/files")
    .then(function(res) { return res.json(); })
    .then(function(daftarFile) {
      daftarFile.forEach(function(namaFile) {
        const url = "/uploads/" + namaFile;
        tambahKeGaleri(url, namaFile, tebakTipe(namaFile));
      });
    })
    .catch(function(err) {
      console.error("Gagal memuat galeri:", err);
    });
}

inputFile.addEventListener("change", function() {
  const file = inputFile.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  fetch("/upload", {
    method: "POST",
    body: formData
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      console.log("Berhasil disimpan:", data);
      muatGaleri();
    })
    .catch(function(err) {
      console.error("Gagal memuat file:", err);
    });
});

muatGaleri();
