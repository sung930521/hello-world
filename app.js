const galleryInput = document.getElementById("gallery-input");
const galleryButton = document.getElementById("open-gallery");
const takePhotoButton = document.getElementById("take-photo");
const searchInput = document.getElementById("ingredient-search");
const themeToggle = document.getElementById("toggle-theme");

if (galleryButton && galleryInput) {
  galleryButton.addEventListener("click", () => galleryInput.click());
}

if (takePhotoButton) {
  takePhotoButton.addEventListener("click", () => {
    window.location.href = "scanner.html";
  });
}

if (galleryInput) {
  galleryInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) {
      window.location.href = "result.html";
    }
  });
}

if (searchInput) {
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      window.location.href = "dictionary.html";
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
  });
}
