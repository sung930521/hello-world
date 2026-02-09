import { buildAnalysis, parseIngredientText } from "./analysis.js";
import { readScans, readLastAnalysis, saveAnalysis, setTheme, getTheme, setConsent, getConsent, setPendingImage, getPendingImage, STORAGE_KEYS } from "./storage.js";
import { setupCamera, captureFrame, readImageFile, extractTextFromImage } from "./scan.js";
import { renderScans, renderHistory, renderResult, renderDictionary, updateDictionaryFilter, showConsent, hideConsent, showToast } from "./ui.js";

const splashDelayMs = 1600;
const sampleIngredientSets = {
  Food: ["Oats", "Honey", "Caffeine", "Omega-3 DHA"],
  Cosmetic: ["Hyaluronic Acid", "Niacinamide", "Fragrance", "Salicylic Acid"],
};

const elements = {
  galleryInput: document.getElementById("gallery-input"),
  galleryButton: document.getElementById("open-gallery"),
  takePhotoButton: document.getElementById("take-photo"),
  searchInput: document.getElementById("ingredient-search"),
  themeToggle: document.getElementById("toggle-theme"),
  recentScansContainer: document.getElementById("recent-scans"),
  consentModal: document.getElementById("consent-modal"),
  consentAccept: document.getElementById("consent-accept"),
  consentDecline: document.getElementById("consent-decline"),
  scannerCapture: document.getElementById("scanner-capture"),
  scannerGallery: document.getElementById("scanner-gallery"),
  scannerStart: document.getElementById("start-camera"),
  scannerStop: document.getElementById("stop-camera"),
  scannerVideo: document.getElementById("camera-stream"),
  scannerCanvas: document.getElementById("capture-canvas"),
  scannerPreview: document.getElementById("capture-preview"),
  scannerStatus: document.getElementById("scanner-status"),
  scannerAnalyze: document.getElementById("analyze-ingredients"),
  scannerModeInputs: document.querySelectorAll("input[name='mode']"),
  scannerIngredients: document.getElementById("ingredient-input"),
  scannerProduct: document.getElementById("product-name"),
  scannerFileInput: document.getElementById("scanner-file-input"),
  resultBadge: document.getElementById("result-badge"),
  resultTitle: document.getElementById("result-title"),
  resultSummary: document.getElementById("result-summary"),
  resultIngredients: document.getElementById("result-ingredients"),
  resultCount: document.getElementById("ingredient-count"),
  resultImage: document.getElementById("result-image"),
  resultAlternatives: document.getElementById("result-alternatives"),
  historyList: document.getElementById("history-list"),
  seeAll: document.getElementById("see-all"),
  categoryButtons: document.querySelectorAll("[data-category-button]"),
  flashToggle: document.getElementById("flash-toggle"),
  shareResult: document.getElementById("share-result"),
  voiceSearch: document.getElementById("voice-search"),
  dictionarySearch: document.getElementById("dictionary-search"),
  dictionaryResults: document.getElementById("dictionary-results"),
  dictionaryFilters: document.querySelectorAll("[data-category]"),
  trendingTags: document.querySelectorAll("[data-ingredient]"),
};

const isSplashPage = window.location.pathname.endsWith("splash.html");
const isResultPage = window.location.pathname.endsWith("result.html");
const isDictionaryPage = window.location.pathname.endsWith("dictionary.html");
const isHomePage = window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/");

const initTheme = () => {
  const storedTheme = getTheme();
  if (storedTheme === "dark") {
    document.documentElement.classList.add("dark");
  }
};

const handleAnalyze = async ({ imageOverride } = {}) => {
  const mode = [...elements.scannerModeInputs].find((input) => input.checked)?.value || "Food";
  const productName = elements.scannerProduct?.value || `${mode} Product`;
  const ingredientsText = elements.scannerIngredients?.value || "";
  const image = imageOverride || getPendingImage();

  let ingredientList = [];
  if (ingredientsText) {
    ingredientList = parseIngredientText(ingredientsText);
  } else if (image) {
    const ocrResult = await extractTextFromImage(image);
    ingredientList = ocrResult.ingredients;
    if (ocrResult.warnings?.length) {
      showToast(ocrResult.warnings[0]);
    }
  }

  if (!ingredientList.length) {
    ingredientList = [];
  }

  const analysis = buildAnalysis({
    productName,
    mode,
    ingredients: ingredientList.length ? ingredientList : [],
    image,
  });
  saveAnalysis(analysis);
  window.location.href = "result.html";
};

initTheme();

if (!localStorage.getItem(STORAGE_KEYS.splashSeen) && !isSplashPage) {
  localStorage.setItem(STORAGE_KEYS.splashSeen, "true");
  window.location.replace("splash.html");
}

if (isSplashPage) {
  setTimeout(() => {
    window.location.replace("index.html");
  }, splashDelayMs);
}

if (elements.galleryButton && elements.galleryInput) {
  elements.galleryButton.addEventListener("click", () => elements.galleryInput.click());
}

if (elements.takePhotoButton) {
  elements.takePhotoButton.addEventListener("click", () => {
    window.location.href = "scanner.html";
  });
}

if (elements.galleryInput) {
  elements.galleryInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFile(file);
      setPendingImage(dataUrl);
      const analysis = buildAnalysis({
        productName: file.name.replace(/\.[^/.]+$/, ""),
        mode: "Food",
        ingredients: [],
        image: dataUrl,
      });
      saveAnalysis(analysis);
      window.location.href = "result.html";
    } catch (error) {
      console.error(error);
      showToast("Unable to read image file.");
    }
  });
}

if (elements.searchInput) {
  elements.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      window.location.href = "dictionary.html";
    }
  });
}

if (elements.themeToggle) {
  elements.themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const mode = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(mode);
  });
}

if (elements.consentAccept) {
  elements.consentAccept.addEventListener("click", () => {
    setConsent("accepted");
    hideConsent(elements.consentModal);
  });
}

if (elements.consentDecline) {
  elements.consentDecline.addEventListener("click", () => {
    setConsent("declined");
    hideConsent(elements.consentModal);
  });
}

if (elements.scannerGallery) {
  elements.scannerGallery.addEventListener("click", () => elements.scannerFileInput?.click());
}

if (elements.scannerFileInput) {
  elements.scannerFileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFile(file);
      if (elements.scannerPreview) {
        elements.scannerPreview.src = dataUrl;
        elements.scannerPreview.classList.remove("hidden");
      }
      setPendingImage(dataUrl);
      if (elements.scannerStatus) elements.scannerStatus.textContent = "Image uploaded. Ready to analyze.";
    } catch (error) {
      console.error(error);
      showToast("Unable to read image file.");
    }
  });
}

if (elements.scannerCapture) {
  elements.scannerCapture.addEventListener("click", () => {
    const image = captureFrame({
      video: elements.scannerVideo,
      canvas: elements.scannerCanvas,
      preview: elements.scannerPreview,
      status: elements.scannerStatus,
    });
    if (!image && elements.scannerStatus) elements.scannerStatus.textContent = "Capture failed. Start camera first.";
  });
}

if (elements.scannerAnalyze) {
  elements.scannerAnalyze.addEventListener("click", () => handleAnalyze());
}

if (isDictionaryPage) {
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get("category") || "All";
  updateDictionaryFilter(elements, initialCategory);
  renderDictionary(
    elements,
    elements.dictionarySearch?.value?.toLowerCase() ?? "",
    initialCategory
  );
  if (elements.dictionarySearch) {
    elements.dictionarySearch.addEventListener("input", () => {
      const query = elements.dictionarySearch?.value?.toLowerCase() ?? "";
      const activeCategory =
        [...elements.dictionaryFilters].find((button) => button.dataset.active === "true")?.dataset.category || "All";
      renderDictionary(elements, query, activeCategory);
    });
  }
  elements.dictionaryFilters.forEach((button) => {
    button.addEventListener("click", () => {
      updateDictionaryFilter(elements, button.dataset.category);
      const query = elements.dictionarySearch?.value?.toLowerCase() ?? "";
      renderDictionary(elements, query, button.dataset.category);
    });
  });
  elements.trendingTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      if (elements.dictionarySearch) {
        elements.dictionarySearch.value = tag.dataset.ingredient;
        const activeCategory =
          [...elements.dictionaryFilters].find((button) => button.dataset.active === "true")?.dataset.category || "All";
        renderDictionary(elements, tag.dataset.ingredient.toLowerCase(), activeCategory);
      }
    });
  });
}

if (elements.seeAll) {
  elements.seeAll.addEventListener("click", () => {
    window.location.href = "result.html#history";
  });
}

if (elements.categoryButtons?.length) {
  elements.categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.categoryButton;
      window.location.href = `dictionary.html?category=${encodeURIComponent(category)}`;
    });
  });
}

if (elements.flashToggle) {
  elements.flashToggle.addEventListener("click", () => {
    showToast("Flash control is not supported in this web demo.");
  });
}

if (elements.shareResult) {
  elements.shareResult.addEventListener("click", async () => {
    const analysis = readLastAnalysis();
    const message = analysis ? `${analysis.productName} — ${analysis.overall}` : "Scan result";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Scan Result", text: message });
      } catch (error) {
        console.error(error);
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      showToast("Result copied to clipboard.");
    } else {
      showToast("Sharing is not supported.");
    }
  });
}

if (elements.voiceSearch) {
  elements.voiceSearch.addEventListener("click", () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      showToast("Voice search not supported on this device.");
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (elements.dictionarySearch) {
        elements.dictionarySearch.value = transcript;
        const activeCategory =
          [...elements.dictionaryFilters].find((button) => button.dataset.active === "true")?.dataset.category || "All";
        renderDictionary(elements, transcript.toLowerCase(), activeCategory);
      }
    };
    recognition.start();
  });
}

if (elements.searchInput) {
  elements.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = elements.searchInput.value.trim();
      const url = query
        ? `dictionary.html?category=All&query=${encodeURIComponent(query)}`
        : "dictionary.html";
      window.location.href = url;
    }
  });
}

renderScans(elements.recentScansContainer, readScans());
renderHistory(elements.historyList, readScans());
if (isResultPage) {
  renderResult(elements, readLastAnalysis());
}
if (isDictionaryPage) {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query")?.toLowerCase() ?? elements.dictionarySearch?.value?.toLowerCase() ?? "";
  const activeCategory =
    [...elements.dictionaryFilters].find((button) => button.dataset.active === "true")?.dataset.category || "All";
  renderDictionary(elements, query, activeCategory);
}
showConsent(elements.consentModal, getConsent());
setupCamera({
  video: elements.scannerVideo,
  startButton: elements.scannerStart,
  stopButton: elements.scannerStop,
  status: elements.scannerStatus,
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}
