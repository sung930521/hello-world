import { ingredientCatalog } from "./analysis.js";

export const renderScans = (container, scans) => {
  if (!container) return;
  if (!scans.length) {
    container.innerHTML = "<p class=\"text-sm text-slate-500 dark:text-slate-400\">No scans yet. Try scanning an ingredient label.</p>";
    return;
  }
  container.innerHTML = scans
    .slice(0, 3)
    .map((scan) => {
      const badgeColor =
        scan.status === "Avoid" ? "text-rose-500" : scan.status === "Caution" ? "text-yellow-500" : scan.status === "Review" ? "text-slate-500" : "text-primary";
      const badgeIcon =
        scan.status === "Avoid" ? "warning" : scan.status === "Caution" ? "report" : scan.status === "Review" ? "help" : "verified_user";
      const badgeBg =
        scan.status === "Avoid"
          ? "bg-rose-100 dark:bg-rose-900/30"
          : scan.status === "Caution"
            ? "bg-yellow-100 dark:bg-yellow-900/30"
            : scan.status === "Review"
              ? "bg-slate-100 dark:bg-slate-800"
              : "bg-primary/20";
      return `\n      <div class=\"flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700\">\n        <div class=\"bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16\" style=\"background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgrV7H9BdHRnkN_r9tv6-UhpBhVhK3OSdBF6Qf4jcfO1-Tc4uPe2BaGdjoi5SgehLNrZBQ9VPdpEfzO0xrVbuAYDmdsqdHB08G8gKq-s8550iEPXlVtPsmBGlUn4N2gqBDi34PSQUmY3b9B4rycuWEySjXB-pCfQT57mH1UEUpSjL3Y_fEdlA7HzSD2AhM_dqzcD8rALAj2n9aggyws3xS2UtfuBZsXLKtXSogVxsrM_DyAh4WKquaKyPwRf1w7wnOF1IKaqCF2r4');\"></div>\n        <div class=\"flex flex-col justify-center flex-1\">\n          <p class=\"text-[#111814] dark:text-white text-base font-bold leading-none mb-1\">${scan.title}</p>\n          <div class=\"flex items-center gap-1\">\n            <span class=\"material-symbols-outlined ${badgeColor} text-sm\">${badgeIcon}</span>\n            <p class=\"${badgeColor} text-xs font-extrabold uppercase tracking-wider\">${scan.status}</p>\n          </div>\n        </div>\n        <div class=\"shrink-0 pr-2\">\n          <div class=\"${badgeBg} ${badgeColor} p-1.5 rounded-full flex items-center justify-center\">\n            <span class=\"material-symbols-outlined !text-xl\">${scan.icon ?? "check"}</span>\n          </div>\n        </div>\n      </div>`;\n    })
    .join("");
};

export const renderHistory = (container, scans) => {
  if (!container) return;
  if (!scans.length) {
    container.innerHTML = "<p class=\"text-sm text-slate-500 dark:text-slate-400\">No scan history yet.</p>";
    return;
  }
  container.innerHTML = scans
    .map((scan) => {
      const statusColor = scan.status === "Avoid" ? "text-rose-500" : scan.status === "Caution" ? "text-yellow-500" : scan.status === "Review" ? "text-slate-500" : "text-primary";
      return `<div class=\"flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm\">\n        <div>\n          <p class=\"text-sm font-bold text-slate-900 dark:text-white\">${scan.title}</p>\n          <p class=\"text-xs text-slate-500 dark:text-slate-400\">${new Date(scan.timestamp).toLocaleString()}</p>\n        </div>\n        <span class=\"text-xs font-bold uppercase ${statusColor}\">${scan.status}</span>\n      </div>`;
    })
    .join("");
};

export const renderResult = (elements, analysis) => {
  if (!analysis) return;
  const statusText = analysis.overall.toUpperCase();
  const badgeColor =
    analysis.overall === "Avoid" ? "bg-rose-500" : analysis.overall === "Caution" ? "bg-yellow-500" : analysis.overall === "Review" ? "bg-slate-500" : "bg-primary";

  if (elements.resultBadge) {
    elements.resultBadge.innerHTML = `<div class=\"w-32 h-32 ${badgeColor} rounded-full flex flex-col items-center justify-center shadow-lg\">\n      <span class=\"material-symbols-outlined text-white text-4xl mb-1\">${analysis.overall === "Avoid" ? "dangerous" : analysis.overall === "Caution" ? "warning" : analysis.overall === "Review" ? "help" : "verified_user"}</span>\n      <span class=\"text-white font-extrabold text-lg\">${statusText}</span>\n    </div>`;
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
          review: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        };
        const pillColor = colorMap[item.risk] || "bg-slate-100 text-slate-600";
        return `<div class=\"bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-4\">\n          <div class=\"mt-1 w-2 h-2 rounded-full ${item.risk === "avoid" ? "bg-rose-500" : item.risk === "caution" || item.risk === "limit" ? "bg-yellow-500" : item.risk === "review" ? "bg-slate-500" : "bg-primary"} flex-shrink-0\"></div>\n          <div class=\"flex-1\">\n            <div class=\"flex justify-between items-start mb-1\">\n              <h4 class=\"font-bold text-slate-900 dark:text-white\">${item.name}</h4>\n              <span class=\"text-[10px] font-bold px-2 py-0.5 rounded ${pillColor} uppercase\">${item.label}</span>\n            </div>\n            <p class=\"text-sm text-slate-500 dark:text-slate-400 leading-relaxed\">${item.description}</p>\n            <p class=\"mt-2 text-xs text-slate-400\">Guidance: ${item.guidance}</p>\n            <p class=\"text-[10px] text-slate-400 mt-1\">Source: ${item.source}</p>\n          </div>\n        </div>`;
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

export const renderDictionary = (elements, query, activeCategory) => {
  if (!elements.dictionaryResults) return;
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

export const updateDictionaryFilter = (elements, category) => {
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
};

export const showConsent = (modal, hasConsent) => {
  if (!modal) return;
  if (hasConsent) return;
  modal.classList.remove("hidden");
};

export const hideConsent = (modal) => {
  if (!modal) return;
  modal.classList.add("hidden");
};

export const showToast = (message) => {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className =
      "fixed left-1/2 top-6 z-[999] -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white shadow-lg";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toast.dataset.timeoutId);
  const timeoutId = setTimeout(() => toast.classList.add("hidden"), 2400);
  toast.dataset.timeoutId = timeoutId;
};
