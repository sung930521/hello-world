const galleryInput = document.getElementById("gallery-input");
const galleryButton = document.getElementById("open-gallery");
const takePhotoButton = document.getElementById("take-photo");
const searchInput = document.getElementById("ingredient-search");
const themeToggle = document.getElementById("toggle-theme");
const recentScansContainer = document.getElementById("recent-scans");
const scannerCapture = document.getElementById("scanner-capture");
const scannerGallery = document.getElementById("scanner-gallery");
const splashDelayMs = 1600;

const STORAGE_KEYS = {
  splashSeen: "bg_splash_seen",
  theme: "bg_theme",
  scans: "bg_recent_scans",
};

const sampleScans = [
  { title: "Oatmeal Snack Bar", status: "Safe", color: "text-primary", icon: "check" },
  { title: "Retinol Night Cream", status: "Avoid", color: "text-rose-500", icon: "close" },
  { title: "Greek Yogurt (Plain)", status: "Safe", color: "text-primary", icon: "check" },
];

const isSplashPage = window.location.pathname.endsWith("splash.html");

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
  localStorage.setItem(STORAGE_KEYS.scans, JSON.stringify(scans.slice(0, 6)));
};

const addScan = (scan) => {
  const scans = readScans();
  scans.unshift({ ...scan, timestamp: Date.now() });
  saveScans(scans);
};

const renderScans = () => {
  if (!recentScansContainer) return;
  const scans = readScans();
  if (!scans.length) return;
  recentScansContainer.innerHTML = scans
    .slice(0, 3)
    .map((scan) => {
      const badgeColor = scan.status === "Avoid" ? "text-rose-500" : "text-primary";
      const badgeIcon = scan.status === "Avoid" ? "warning" : "verified_user";
      const badgeBg = scan.status === "Avoid" ? "bg-rose-100 dark:bg-rose-900/30" : "bg-primary/20";
      return `\n      <div class=\"flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700\">\n        <div class=\"bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16\" style=\"background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgrV7H9BdHRnkN_r9tv6-UhpBhVhK3OSdBF6Qf4jcfO1-Tc4uPe2BaGdjoi5SgehLNrZBQ9VPdpEfzO0xrVbuAYDmdsqdHB08G8gKq-s8550iEPXlVtPsmBGlUn4N2gqBDi34PSQUmY3b9B4rycuWEySjXB-pCfQT57mH1UEUpSjL3Y_fEdlA7HzSD2AhM_dqzcD8rALAj2n9aggyws3xS2UtfuBZsXLKtXSogVxsrM_DyAh4WKquaKyPwRf1w7wnOF1IKaqCF2r4');\"></div>\n        <div class=\"flex flex-col justify-center flex-1\">\n          <p class=\"text-[#111814] dark:text-white text-base font-bold leading-none mb-1\">${scan.title}</p>\n          <div class=\"flex items-center gap-1\">\n            <span class=\"material-symbols-outlined ${badgeColor} text-sm\">${badgeIcon}</span>\n            <p class=\"${badgeColor} text-xs font-extrabold uppercase tracking-wider\">${scan.status}</p>\n          </div>\n        </div>\n        <div class=\"shrink-0 pr-2\">\n          <div class=\"${badgeBg} ${badgeColor} p-1.5 rounded-full flex items-center justify-center\">\n            <span class=\"material-symbols-outlined !text-xl\">${scan.icon ?? "check"}</span>\n          </div>\n        </div>\n      </div>`;\n    })\n    .join(\"\");\n};

const initTheme = () => {
  const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (storedTheme === "dark") {
    document.documentElement.classList.add("dark");
  }
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

if (galleryButton && galleryInput) {
  galleryButton.addEventListener("click", () => galleryInput.click());
}

if (scannerCapture) {
  scannerCapture.addEventListener("click", () => {
    addScan(sampleScans[0]);
    window.location.href = "result.html";
  });
}

if (scannerGallery) {
  scannerGallery.addEventListener("click", () => {
    addScan(sampleScans[1]);
    window.location.href = "result.html";
  });
}

if (takePhotoButton) {
  takePhotoButton.addEventListener("click", () => {
    addScan(sampleScans[0]);
    window.location.href = "scanner.html";
  });
}

if (galleryInput) {
  galleryInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) {
      addScan(sampleScans[1]);
      window.location.href = "result.html";
    }
  });
}

if (searchInput) {
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addScan(sampleScans[2]);
      window.location.href = "dictionary.html";
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const mode = document.documentElement.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem(STORAGE_KEYS.theme, mode);
  });
}

renderScans();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}
