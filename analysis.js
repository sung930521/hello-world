export const ingredientCatalog = [
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

const normalizeName = (name) => name.toLowerCase();

export const parseIngredientText = (text) =>
  text
    .split(/[,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const findIngredientMatch = (name) =>
  ingredientCatalog.find((entry) => normalizeName(entry.name) === normalizeName(name));

export const analyzeIngredients = (ingredients) => {
  if (!ingredients.length) {
    return {
      overall: "Review",
      findings: [
        {
          name: "Unknown Ingredient",
          original: "Unknown Ingredient",
          category: "Unknown",
          risk: "review",
          label: "Review",
          description: "No ingredients detected. Please rescan or enter ingredients manually.",
          guidance: "Capture a clearer label or paste ingredients.",
          source: "Manual review",
        },
      ],
      score: 0,
    };
  }

  const findings = ingredients.map((ingredient) => {
    const match = findIngredientMatch(ingredient);
    if (match) {
      return { ...match, original: ingredient };
    }
    return {
      name: ingredient,
      original: ingredient,
      category: "Unknown",
      risk: "review",
      label: "Review",
      description: "No direct data match. Review with a clinician or trusted source.",
      guidance: "Provide ingredient label to a professional.",
      source: "Manual review",
    };
  });

  const riskScore = findings.reduce((score, item) => {
    if (item.risk === "avoid") return score + 3;
    if (item.risk === "caution" || item.risk === "limit") return score + 2;
    if (item.risk === "review") return score + 2;
    return score + 1;
  }, 0);

  const overall =
    findings.some((item) => item.risk === "avoid")
      ? "Avoid"
      : findings.some((item) => item.risk === "caution" || item.risk === "limit")
        ? "Caution"
        : findings.some((item) => item.risk === "review")
          ? "Review"
          : "Safe";

  return {
    overall,
    findings,
    score: riskScore,
  };
};

export const buildAnalysis = ({ productName, mode, ingredients, image }) => {
  const analysis = analyzeIngredients(ingredients);
  const summary =
    analysis.overall === "Safe"
      ? "No high-risk ingredients detected. Safe to proceed with normal use."
      : analysis.overall === "Caution"
        ? "Some ingredients require limits or caution. Review usage amount."
        : analysis.overall === "Avoid"
          ? "High-risk ingredients detected. Avoid during pregnancy or nursing."
          : "Unable to verify ingredients. Rescan or enter ingredients manually.";

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
