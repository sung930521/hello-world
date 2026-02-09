export const STORAGE_KEYS = {
  splashSeen: "bg_splash_seen",
  theme: "bg_theme",
  scans: "bg_recent_scans",
  lastAnalysis: "bg_last_analysis",
  consent: "bg_consent",
  pendingImage: "bg_pending_image",
};

const readJSON = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const readScans = () => readJSON(STORAGE_KEYS.scans, []);

export const saveScans = (scans) => {
  localStorage.setItem(STORAGE_KEYS.scans, JSON.stringify(scans.slice(0, 10)));
};

export const addScan = (scan) => {
  const scans = readScans();
  scans.unshift({ ...scan, timestamp: Date.now() });
  saveScans(scans);
};

export const saveAnalysis = (analysis) => {
  localStorage.setItem(STORAGE_KEYS.lastAnalysis, JSON.stringify(analysis));
  addScan({
    title: analysis.productName,
    status: analysis.overall,
    icon: analysis.overall === "Avoid" ? "close" : analysis.overall === "Caution" ? "warning" : analysis.overall === "Review" ? "help" : "check",
  });
};

export const readLastAnalysis = () => readJSON(STORAGE_KEYS.lastAnalysis, null);

export const setTheme = (theme) => {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
};

export const getTheme = () => localStorage.getItem(STORAGE_KEYS.theme);

export const setConsent = (value) => {
  localStorage.setItem(STORAGE_KEYS.consent, value);
};

export const getConsent = () => localStorage.getItem(STORAGE_KEYS.consent);

export const setPendingImage = (dataUrl) => {
  if (dataUrl) {
    localStorage.setItem(STORAGE_KEYS.pendingImage, dataUrl);
  } else {
    localStorage.removeItem(STORAGE_KEYS.pendingImage);
  }
};

export const getPendingImage = () => localStorage.getItem(STORAGE_KEYS.pendingImage);
