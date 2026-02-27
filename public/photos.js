const photoGrid = document.querySelector("#photoGrid");

function renderMessage(message) {
  photoGrid.textContent = "";
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = message;
  photoGrid.append(empty);
}

function renderPhotos(photos) {
  photoGrid.textContent = "";

  photos.forEach((photo) => {
    const article = document.createElement("article");
    article.className = "photo-card";

    const image = document.createElement("img");
    image.className = "photo-image";
    image.src = photo.url;
    image.alt = photo.name;
    image.loading = "lazy";

    const caption = document.createElement("p");
    caption.className = "photo-caption";
    caption.textContent = photo.name;

    article.append(image, caption);
    photoGrid.append(article);
  });
}

async function loadPhotos() {
  const response = await fetch("/api/v1/photos");
  if (!response.ok) {
    throw new Error("Unable to load photos");
  }

  const payload = await response.json();
  return payload.data;
}

loadPhotos()
  .then((photos) => {
    if (!photos.length) {
      renderMessage("No photos found yet. Add files into public/photos and refresh this page.");
      return;
    }

    renderPhotos(photos);
  })
  .catch(() => {
    renderMessage("Could not load photos from API. Please check server status.");
  });
