const splashDelayMs = 1600;
const STORAGE_KEYS = {
  splashSeen: "bg_splash_seen",
  theme: "bg_theme",
  scans: "bg_recent_scans",
  lastAnalysis: "bg_last_analysis",
  consent: "bg_consent",
  pendingImage: "bg_pending_image",
};

const ingredientCatalog = [
  {
    name: "Folic Acid",
    category: "Supplement",
    risk: "beneficial",
    label: "Beneficial",
    description: "Supports neural tube development and healthy cell growth during early pregnancy.",
    guidance: "Recommended in prenatal vitamins.",
    source: "ACOG Guidelines",
  },
  {
    name: "Hyaluronic Acid",
    category: "Skincare",
    risk: "safe",
    label: "Safe",
    description: "Hydrates skin naturally. Minimal systemic absorption.",
    guidance: "Safe for topical use during pregnancy.",
    source: "FDA Cosmetic Safety",
  },
  {
    name: "Retinol",
    category: "Skincare",
    risk: "avoid",
    label: "Avoid",
    description: "Vitamin A derivatives are linked to birth defects at high exposure.",
    guidance: "Avoid during pregnancy and nursing.",
    source: "ACOG + EMA",
  },
  {
    name: "Salicylic Acid",
    category: "Skincare",
    risk: "caution",
    label: "Caution",
    description: "Low concentrations are generally acceptable; high doses require medical guidance.",
    guidance: "Limit to <2% topical; avoid oral use.",
    source: "AAD Clinical Notes",
  },
  {
    name: "Caffeine",
    category: "Food",
    risk: "limit",
    label: "Limit",
    description: "High intake may increase pregnancy risks.",
    guidance: "Limit to <200mg/day.",
    source: "WHO + ACOG",
  },
  {
    name: "Aspartame",
    category: "Food Additives",
    risk: "caution",
    label: "Caution",
    description: "Generally safe within daily limits; avoid with PKU.",
    guidance: "Stay within ADI guidelines.",
    source: "EFSA 2013",
  },
  {
    name: "Parabens",
    category: "Skincare",
    risk: "caution",
    label: "Caution",
    description: "Potential endocrine disruption concerns at high exposure.",
    guidance: "Prefer paraben-free if possible.",
    source: "EU SCCS",
  },
  {
    name: "Niacinamide",
    category: "Skincare",
    risk: "safe",
    label: "Safe",
    description: "Supports barrier repair and reduces redness.",
    guidance: "Safe for topical use.",
    source: "Dermatology consensus",
  },
  {
    name: "Benzoyl Peroxide",
    category: "Skincare",
    risk: "caution",
    label: "Caution",
    description: "Limited data; low absorption when topical.",
    guidance: "Use sparingly; consult provider if high dose.",
    source: "Dermatology consensus",
  },
  {
    name: "Fragrance",
    category: "Skincare",
    risk: "caution",
    label: "Caution",
    description: "May trigger sensitivity or nausea during pregnancy.",
    guidance: "Opt for fragrance-free if sensitive.",
    source: "IFRA safety",
  },
  {
    name: "Omega-3 DHA",
    category: "Supplement",
    risk: "beneficial",
    label: "Beneficial",
    description: "Supports brain and eye development.",
    guidance: "Recommended in prenatal care.",
    source: "WHO + ACOG",
  },
  {
    name: "Alcohol",
    category: "Food",
    risk: "avoid",
    label: "Avoid",
    description: "No safe level of alcohol in pregnancy.",
    guidance: "Avoid completely.",
    source: "CDC",
  },
];

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
  dictionarySearch: document.getElementById("dictionary-search"),
  dictionaryResults: document.getElementById("dictionary-results"),
  dictionaryFilters: document.querySelectorAll("[data-category]"),
  trendingTags: document.querySelectorAll("[data-ingredient]"),
};

const isSplashPage = window.location.pathname.endsWith("splash.html");
const isResultPage = window.location.pathname.endsWith("result.html");
const isDictionaryPage = window.location.pathname.endsWith("dictionary.html");

const initTheme = () => {
  const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (storedTheme === "dark") {
    document.documentElement.classList.add("dark");
  }
};

const readScans = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.scans);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveScans = (scans) => {
  localStorage.setItem(STORAGE_KEYS.scans, JSON.stringify(scans.slice(0, 10)));
};

const addScan = (scan) => {
  const scans = readScans();
  scans.unshift({ ...scan, timestamp: Date.now() });
  saveScans(scans);
};

const parseIngredientText = (text) =>
  text
    .split(/[,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeName = (name) => name.toLowerCase();

const findIngredientMatch = (name) =>
  ingredientCatalog.find((entry) => normalizeName(entry.name) === normalizeName(name));

const analyzeIngredients = (ingredients) => {
  const findings = ingredients.map((ingredient) => {
    const match = findIngredientMatch(ingredient);
    if (match) {
      return { ...match, original: ingredient };
    }
    return {
      name: ingredient,
      original: ingredient,
      category: "Unknown",
      risk: "caution",
      label: "Review",
      description: "No direct data match. Review with a clinician or trusted source.",
      guidance: "Provide ingredient label to a professional.",
      source: "Manual review",
    };
  });

  const riskScore = findings.reduce((score, item) => {
    if (item.risk === "avoid") return score + 3;
    if (item.risk === "caution" || item.risk === "limit") return score + 2;
    return score + 1;
  }, 0);

  const overall =
    findings.some((item) => item.risk === "avoid")
      ? "Avoid"
      : findings.some((item) => item.risk === "caution" || item.risk === "limit")
        ? "Caution"
        : "Safe";

  return {
    overall,
    findings,
    score: riskScore,
  };
};

const buildAnalysis = ({ productName, mode, ingredients, image }) => {
  const analysis = analyzeIngredients(ingredients);
  const summary =
    analysis.overall === "Safe"
      ? "No high-risk ingredients detected. Safe to proceed with normal use."
      : analysis.overall === "Caution"
        ? "Some ingredients require limits or caution. Review usage amount."
        : "High-risk ingredients detected. Avoid during pregnancy or nursing.";

  return {
    id: `scan_${Date.now()}`,
    productName: productName || "Untitled Product",
    mode,
    ingredients,
    overall: analysis.overall,
    summary,
    findings: analysis.findings,
    image,
    createdAt: new Date().toISOString(),
  };
};

const saveAnalysis = (analysis) => {
  localStorage.setItem(STORAGE_KEYS.lastAnalysis, JSON.stringify(analysis));
  addScan({
    title: analysis.productName,
    status: analysis.overall,
    icon: analysis.overall === "Avoid" ? "close" : analysis.overall === "Caution" ? "warning" : "check",
  });
};

const readLastAnalysis = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.lastAnalysis);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const renderScans = () => {
  if (!elements.recentScansContainer) return;
  const scans = readScans();
  if (!scans.length) {
    elements.recentScansContainer.innerHTML =
      "<p class=\"text-sm text-slate-500 dark:text-slate-400\">No scans yet. Try scanning an ingredient label.</p>";
    return;
  }
  elements.recentScansContainer.innerHTML = scans
    .slice(0, 3)
    .map((scan) => {
      const badgeColor = scan.status === "Avoid" ? "text-rose-500" : scan.status === "Caution" ? "text-yellow-500" : "text-primary";
      const badgeIcon = scan.status === "Avoid" ? "warning" : scan.status === "Caution" ? "report" : "verified_user";
      const badgeBg =
        scan.status === "Avoid"
          ? "bg-rose-100 dark:bg-rose-900/30"
          : scan.status === "Caution"
            ? "bg-yellow-100 dark:bg-yellow-900/30"
            : "bg-primary/20";
      return `\n      <div class=\"flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700\">\n        <div class=\"bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16\" style=\"background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgrV7H9BdHRnkN_r9tv6-UhpBhVhK3OSdBF6Qf4jcfO1-Tc4uPe2BaGdjoi5SgehLNrZBQ9VPdpEfzO0xrVbuAYDmdsqdHB08G8gKq-s8550iEPXlVtPsmBGlUn4N2gqBDi34PSQUmY3b9B4rycuWEySjXB-pCfQT57mH1UEUpSjL3Y_fEdlA7HzSD2AhM_dqzcD8rALAj2n9aggyws3xS2UtfuBZsXLKtXSogVxsrM_DyAh4WKquaKyPwRf1w7wnOF1IKaqCF2r4');\"></div>\n        <div class=\"flex flex-col justify-center flex-1\">\n          <p class=\"text-[#111814] dark:text-white text-base font-bold leading-none mb-1\">${scan.title}</p>\n          <div class=\"flex items-center gap-1\">\n            <span class=\"material-symbols-outlined ${badgeColor} text-sm\">${badgeIcon}</span>\n            <p class=\"${badgeColor} text-xs font-extrabold uppercase tracking-wider\">${scan.status}</p>\n          </div>\n        </div>\n        <div class=\"shrink-0 pr-2\">\n          <div class=\"${badgeBg} ${badgeColor} p-1.5 rounded-full flex items-center justify-center\">\n            <span class=\"material-symbols-outlined !text-xl\">${scan.icon ?? "check"}</span>\n          </div>\n        </div>\n      </div>`;\n    })\n    .join("");
};

const renderHistory = () => {
  if (!elements.historyList) return;
  const scans = readScans();
  if (!scans.length) {
    elements.historyList.innerHTML = "<p class=\"text-sm text-slate-500 dark:text-slate-400\">No scan history yet.</p>";
    return;
  }
  elements.historyList.innerHTML = scans
    .map((scan) => {
      const statusColor = scan.status === "Avoid" ? "text-rose-500" : scan.status === "Caution" ? "text-yellow-500" : "text-primary";
      return `<div class=\"flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm\">\n        <div>\n          <p class=\"text-sm font-bold text-slate-900 dark:text-white\">${scan.title}</p>\n          <p class=\"text-xs text-slate-500 dark:text-slate-400\">${new Date(scan.timestamp).toLocaleString()}</p>\n        </div>\n        <span class=\"text-xs font-bold uppercase ${statusColor}\">${scan.status}</span>\n      </div>`;
    })
    .join("");
};

const renderResult = () => {
  if (!isResultPage) return;
  const analysis = readLastAnalysis();
  if (!analysis) return;

  const statusText = analysis.overall.toUpperCase();
  const badgeColor =
    analysis.overall === "Avoid" ? "bg-rose-500" : analysis.overall === "Caution" ? "bg-yellow-500" : "bg-primary";

  if (elements.resultBadge) {
    elements.resultBadge.innerHTML = `<div class=\"w-32 h-32 ${badgeColor} rounded-full flex flex-col items-center justify-center shadow-lg\">\n      <span class=\"material-symbols-outlined text-white text-4xl mb-1\">${analysis.overall === "Avoid" ? "dangerous" : analysis.overall === "Caution" ? "warning" : "verified_user"}</span>\n      <span class=\"text-white font-extrabold text-lg\">${statusText}</span>\n    </div>`;
  }
  if (elements.resultTitle) elements.resultTitle.textContent = analysis.productName;
  if (elements.resultSummary) elements.resultSummary.textContent = analysis.summary;
  if (elements.resultCount) elements.resultCount.textContent = `${analysis.ingredients.length} ingredients total`;
  if (elements.resultImage) {
    if (analysis.image) {
      elements.resultImage.src = analysis.image;
      elements.resultImage.classList.remove("hidden");
    } else {
      elements.resultImage.classList.add("hidden");
    }
  }
  if (elements.resultIngredients) {
    elements.resultIngredients.innerHTML = analysis.findings
      .map((item) => {
        const colorMap = {
          avoid: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
          caution: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
          limit: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
          safe: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
          beneficial: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        };
        const pillColor = colorMap[item.risk] || "bg-slate-100 text-slate-600";
        return `<div class=\"bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-4\">\n          <div class=\"mt-1 w-2 h-2 rounded-full ${item.risk === "avoid" ? "bg-rose-500" : item.risk === "caution" || item.risk === "limit" ? "bg-yellow-500" : "bg-primary"} flex-shrink-0\"></div>\n          <div class=\"flex-1\">\n            <div class=\"flex justify-between items-start mb-1\">\n              <h4 class=\"font-bold text-slate-900 dark:text-white\">${item.name}</h4>\n              <span class=\"text-[10px] font-bold px-2 py-0.5 rounded ${pillColor} uppercase\">${item.label}</span>\n            </div>\n            <p class=\"text-sm text-slate-500 dark:text-slate-400 leading-relaxed\">${item.description}</p>\n            <p class=\"mt-2 text-xs text-slate-400\">Guidance: ${item.guidance}</p>\n            <p class=\"text-[10px] text-slate-400 mt-1\">Source: ${item.source}</p>\n          </div>\n        </div>`;
      })
      .join("");
  }
  if (elements.resultAlternatives) {
    const alternatives = ingredientCatalog
      .filter((item) => item.risk === "safe" || item.risk === "beneficial")
      .slice(0, 3);
    elements.resultAlternatives.innerHTML = alternatives
      .map((item) => {
        return `<div class=\"min-w-[180px] snap-center bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm p-4\">\n          <p class=\"text-xs text-primary font-bold uppercase tracking-tighter mb-1\">Suggested</p>\n          <h5 class=\"font-bold text-sm text-slate-900 dark:text-white\">${item.name}</h5>\n          <p class=\"text-xs text-slate-500 dark:text-slate-400\">${item.description}</p>\n        </div>`;
      })
      .join("");
  }
};

const renderDictionary = () => {
  if (!isDictionaryPage || !elements.dictionaryResults) return;
  const query = elements.dictionarySearch?.value?.toLowerCase() ?? "";
  const activeCategory =
    [...elements.dictionaryFilters].find((button) => button.dataset.active === "true")?.dataset.category || "All";

  const filtered = ingredientCatalog.filter((entry) => {
    const matchesQuery = !query || entry.name.toLowerCase().includes(query);
    const matchesCategory = activeCategory === "All" || entry.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  elements.dictionaryResults.innerHTML = filtered
    .map((entry) => {
      const badgeColor =
        entry.risk === "avoid"
          ? "bg-avoid/10 text-avoid"
          : entry.risk === "caution" || entry.risk === "limit"
            ? "bg-caution/10 text-caution"
            : "bg-safe/10 text-safe";
      const icon =
        entry.risk === "avoid" ? "dangerous" : entry.risk === "caution" || entry.risk === "limit" ? "warning" : "check_circle";
      return `<div class=\"bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm\">\n        <div class=\"flex justify-between items-start mb-2\">\n          <div>\n            <h3 class=\"font-bold text-slate-900 dark:text-white\">${entry.name}</h3>\n            <p class=\"text-xs text-slate-500 dark:text-slate-400\">${entry.category}</p>\n          </div>\n          <div class=\"flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase ${badgeColor}\">\n            <span class=\"material-symbols-outlined text-[16px]\">${icon}</span>\n            <span>${entry.label}</span>\n          </div>\n        </div>\n        <p class=\"text-sm text-slate-600 dark:text-slate-400\">${entry.description}</p>\n        <p class=\"text-xs text-slate-400 mt-2\">Guidance: ${entry.guidance}</p>\n        <p class=\"text-[10px] text-slate-400 mt-1\">Source: ${entry.source}</p>\n      </div>`;
    })
    .join("");
};

const updateDictionaryFilter = (category) => {
  elements.dictionaryFilters.forEach((button) => {
    if (button.dataset.category === category) {
      button.dataset.active = "true";
      button.classList.add("bg-primary", "text-slate-900", "border-primary");
      button.classList.remove("bg-white", "dark:bg-slate-800", "text-slate-600", "dark:text-slate-300");
    } else {
      button.dataset.active = "false";
      button.classList.remove("bg-primary", "text-slate-900", "border-primary");
      button.classList.add("bg-white", "dark:bg-slate-800", "text-slate-600", "dark:text-slate-300");
    }
  });
  renderDictionary();
};

const showConsent = () => {
  if (!elements.consentModal) return;
  if (localStorage.getItem(STORAGE_KEYS.consent)) return;
  elements.consentModal.classList.remove("hidden");
};

const hideConsent = () => {
  if (!elements.consentModal) return;
  elements.consentModal.classList.add("hidden");
};

const setupCamera = () => {
  if (!elements.scannerVideo) return;
  let stream;

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      if (elements.scannerStatus) elements.scannerStatus.textContent = "Camera not supported on this device.";
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      elements.scannerVideo.srcObject = stream;
      await elements.scannerVideo.play();
      if (elements.scannerStatus) elements.scannerStatus.textContent = "Camera ready. Align the label and capture.";
    } catch (error) {
      if (elements.scannerStatus) elements.scannerStatus.textContent = "Camera permission denied. Upload an image instead.";
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    elements.scannerVideo.pause();
    elements.scannerVideo.srcObject = null;
  };

  if (elements.scannerStart) elements.scannerStart.addEventListener("click", startCamera);
  if (elements.scannerStop) elements.scannerStop.addEventListener("click", stopCamera);

  return { startCamera, stopCamera, get stream() { return stream; } };
};

const captureFrame = () => {
  if (!elements.scannerVideo || !elements.scannerCanvas || !elements.scannerPreview) return null;
  const width = elements.scannerVideo.videoWidth;
  const height = elements.scannerVideo.videoHeight;
  if (!width || !height) return null;
  elements.scannerCanvas.width = width;
  elements.scannerCanvas.height = height;
  const context = elements.scannerCanvas.getContext("2d");
  context.drawImage(elements.scannerVideo, 0, 0, width, height);
  const dataUrl = elements.scannerCanvas.toDataURL("image/jpeg", 0.9);
  elements.scannerPreview.src = dataUrl;
  elements.scannerPreview.classList.remove("hidden");
  localStorage.setItem(STORAGE_KEYS.pendingImage, dataUrl);
  return dataUrl;
};

const handleAnalyze = (sourceImage) => {
  const mode = [...elements.scannerModeInputs].find((input) => input.checked)?.value || "Food";
  const productName = elements.scannerProduct?.value || `${mode} Product`;
  const ingredientsText = elements.scannerIngredients?.value || "";
  const ingredientList = ingredientsText ? parseIngredientText(ingredientsText) : sampleIngredientSets[mode] || [];
  const image = sourceImage || localStorage.getItem(STORAGE_KEYS.pendingImage);

  const analysis = buildAnalysis({
    productName,
    mode,
    ingredients: ingredientList.length ? ingredientList : ["Unknown Ingredient"],
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
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(STORAGE_KEYS.pendingImage, reader.result);
      const analysis = buildAnalysis({
        productName: file.name.replace(/\.[^/.]+$/, ""),
        mode: "Food",
        ingredients: sampleIngredientSets.Food,
        image: reader.result,
      });
      saveAnalysis(analysis);
      window.location.href = "result.html";
    };
    reader.readAsDataURL(file);
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
    localStorage.setItem(STORAGE_KEYS.theme, mode);
  });
}

if (elements.consentAccept) {
  elements.consentAccept.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEYS.consent, "accepted");
    hideConsent();
  });
}

if (elements.consentDecline) {
  elements.consentDecline.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEYS.consent, "declined");
    hideConsent();
  });
}

if (elements.scannerGallery) {
  elements.scannerGallery.addEventListener("click", () => elements.scannerFileInput?.click());
}

if (elements.scannerFileInput) {
  elements.scannerFileInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (elements.scannerPreview) {
        elements.scannerPreview.src = reader.result;
        elements.scannerPreview.classList.remove("hidden");
      }
      localStorage.setItem(STORAGE_KEYS.pendingImage, reader.result);
      if (elements.scannerStatus) elements.scannerStatus.textContent = "Image uploaded. Ready to analyze.";
    };
    reader.readAsDataURL(file);
  });
}

if (elements.scannerCapture) {
  elements.scannerCapture.addEventListener("click", () => {
    const image = captureFrame();
    if (elements.scannerStatus) elements.scannerStatus.textContent = "Captured frame. Ready to analyze.";
    if (!image && elements.scannerStatus) elements.scannerStatus.textContent = "Capture failed. Start camera first.";
  });
}

if (elements.scannerAnalyze) {
  elements.scannerAnalyze.addEventListener("click", () => handleAnalyze());
}

if (isDictionaryPage) {
  updateDictionaryFilter("All");
  if (elements.dictionarySearch) {
    elements.dictionarySearch.addEventListener("input", renderDictionary);
  }
  elements.dictionaryFilters.forEach((button) => {
    button.addEventListener("click", () => updateDictionaryFilter(button.dataset.category));
  });
  elements.trendingTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      if (elements.dictionarySearch) {
        elements.dictionarySearch.value = tag.dataset.ingredient;
        renderDictionary();
      }
    });
  });
}

renderScans();
renderHistory();
renderResult();
showConsent();
setupCamera();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}
