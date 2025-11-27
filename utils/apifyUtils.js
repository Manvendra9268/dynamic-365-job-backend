function extractResponsibilities(ai_core_responsibilities, description_text) {
  // ---------- CASE 1: ai_core_responsibilities exists ----------
  if (ai_core_responsibilities && ai_core_responsibilities.trim() !== "") {
    return ai_core_responsibilities
      .split(".")
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  // ---------- CASE 2: extract from description ----------
  if (!description_text || description_text.trim() === "") return [];

  // Convert to uniform text
  const text = description_text.replace(/\r/g, "");

  // Step 1: Try to extract specific responsibility sections
  const sectionRegex = /(Responsibilities|What you’ll do|What you will do|Role|Mandatory Skills|Requirements)/i;
  const match = text.split(sectionRegex);

  let relevantText = "";
  if (match.length > 1) {
    // section exists → take the text AFTER that section
    relevantText = match[match.length - 1];
  } else {
    // fallback → full description
    relevantText = text;
  }

  // Step 2: Split intelligently using bullets, newlines, and punctuation
  let lines = relevantText
    .split(/\n|•|-|\u2022|\*/g) // split by bullets, *, hyphens, etc.
    .map(item => item.trim())
    .filter(item => item.length > 5); // remove noise lines

  // Step 3: If still too few lines, fallback to splitting by sentences
  if (lines.length < 2) {
    lines = relevantText
      .split(".")
      .map(item => item.trim())
      .filter(item => item.length > 5);
  }

  return lines;
}

function buildRequirements(
  ai_requirements_summary,
  ai_education_requirements,
  ai_experience_level,
  description_text
) {
  let bullets = [];

  // ------------------------------
  // CASE 1: AI FIELDS AVAILABLE
  // ------------------------------
  const hasAI =
    (ai_requirements_summary && ai_requirements_summary.trim() !== "") ||
    (Array.isArray(ai_education_requirements) &&
      ai_education_requirements.length > 0) ||
    (ai_experience_level && ai_experience_level.trim() !== "");

  if (hasAI) {
    // --- Split requirement summary into bullets ---
    if (ai_requirements_summary && ai_requirements_summary.trim() !== "") {
      const summaryBullets = ai_requirements_summary
        .split(".")
        .map(b => b.trim())
        .filter(b => b.length > 0);

      bullets.push(...summaryBullets);
    }

    // --- Add education requirement ---
    if (
      Array.isArray(ai_education_requirements) &&
      ai_education_requirements.length > 0
    ) {
      ai_education_requirements.forEach(ed => {
        bullets.push(`Education required: ${ed}`);
      });
    }

    // --- Add experience requirement ---
    if (ai_experience_level && ai_experience_level.trim() !== "") {
      bullets.push(`Experience required: ${ai_experience_level} years`);
    }

    return bullets;
  }

  // ------------------------------
  // CASE 2: FALLBACK TO DESCRIPTION TEXT
  // Extract Requirements / Qualifications section
  // ------------------------------
  if (!description_text) return [];

  const text = description_text.replace(/\r/g, "");

  // Look for a section like Requirements / Qualifications
  const sectionRegex = /(Requirements|Qualifications|Skills|Prerequisites)/i;
  const parts = text.split(sectionRegex);

  let relevant = "";
  if (parts.length > 1) {
    // take the section *after* the matched keyword
    relevant = parts[parts.length - 1];
  } else {
    // fallback: use entire description
    relevant = text;
  }

  // Split by bullet-like patterns
  let lines = relevant
    .split(/\n|•|-|\*/g)
    .map(l => l.trim())
    .filter(l => l.length > 5);

  // If the text is paragraph style, fallback to sentence split
  if (lines.length < 2) {
    lines = relevant
      .split(".")
      .map(l => l.trim())
      .filter(l => l.length > 5);
  }

  return lines;
}

function buildSkillChips(ai_key_skills, ai_keywords, N = 8) {
  // Ensure arrays
  const primary = Array.isArray(ai_key_skills) ? [...ai_key_skills] : [];
  const keywords = Array.isArray(ai_keywords) ? ai_keywords : [];

  // Use a Set to enforce uniqueness
  const result = new Set(primary);

  // If primary already >= N → return first N
  if (result.size >= N) {
    return Array.from(result).slice(0, N);
  }

  // Otherwise top-up with distinct skills from ai_keywords
  for (const kw of keywords) {
    if (result.size >= N) break;
    result.add(kw);
  }

  return Array.from(result).slice(0, N);
}

function determineExperienceLevel(ai_experience_level, ai_requirements_summary, description_text) {
  // Helper: map range to labels
  const mapRangeToLevel = (range) => {
    if (!range) return null;
    const r = range.trim();

    if (r === "0-2") return "Junior Level";
    if (r === "2-5") return "Mid-Level";
    if (r === "5-10" || r === "10+") return "Senior Level";

    return null;
  };

  // 1. Direct mapping from ai_experience_level
  const direct = mapRangeToLevel(ai_experience_level);
  if (direct) return direct;

  // 2. Try inference from text
  const combined = `${ai_requirements_summary || ""} ${description_text || ""}`;

  // Pattern examples: "5+ years", "6 - 10 years", "7 years"
  const match = combined.match(/(\d+)\s*\+?\s*(?:-|to)?\s*(\d+)?\s*years?/i);

  if (match) {
    const first = parseInt(match[1], 10);
    const second = match[2] ? parseInt(match[2], 10) : null;

    // If range like 6–10 → Senior Level
    if (second && (second >= 5 || first >= 5)) {
      return "Senior Level";
    }

    // Single values
    if (first < 2) return "Junior Level";
    if (first >= 2 && first < 5) return "Mid-Level";
    if (first >= 5) return "Senior Level";
  }

  // 3. Default fallback if absolutely nothing found
  return "Mid-Level"; 
}

const countryOptionsGrouped = {
  special: ["All Countries", "Worldwide"],
  emea: [
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Oman",
    "Bahrain",
    "Turkey",
    "Israel",
  ],
  apac: [
    "India",
    "Singapore",
    "Japan",
    "Malaysia",
    "Philippines",
    "Thailand",
    "Vietnam",
    "Indonesia",
    "Hong Kong",
    "Taiwan",
  ],
  northAmerica: ["United States", "Canada", "Mexico"],
  europe: [
    "United Kingdom",
    "Germany",
    "France",
    "Netherlands",
    "Ireland",
    "Switzerland",
    "Italy",
    "Spain",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Belgium",
    "Austria",
    "Poland",
    "Czech Republic",
    "Romania",
  ],
  latam: ["Brazil", "Argentina", "Chile", "Colombia", "Peru"],
  africa: ["Egypt", "Morocco", "South Africa", "Kenya", "Nigeria"],
  oceania: ["Australia", "New Zealand"],
};

// Flatten and remove special group like "All Countries"
const masterCountries = Object.values(countryOptionsGrouped)
  .flat()
  .filter(c => !["All Countries", "Worldwide"].includes(c));


  function extractCountryFromLocationString(str, masterCountries) {
  if (!str) return null;
  const lower = str.toLowerCase();

  // Worldwide / Global
  const worldwideTerms = [
    "worldwide", "world wide", "global", "anywhere",
    "multiple locations", "various locations"
  ];
  if (worldwideTerms.some(t => lower.includes(t))) {
    return "WORLDWIDE_FLAG";
  }

  // Region-only
  const regionTerms = ["europe", "emea", "apac", "asia", "north america"];
  if (regionTerms.some(t => lower.includes(t))) {
    return "WORLDWIDE_FLAG";
  }

  // Match country from master list
  for (const c of masterCountries) {
    if (lower.includes(c.toLowerCase())) return c;
  }

  return null;
}


function getJobCountries(data, masterCountries) {
  const {
    countries_derived,
    ai_remote_location_derived,
    locations_derived,
    locations_raw,
    linkedin_org_headquarters
  } = data;

  let jobCountries = new Set();

  // STEP 1: primary country list
  if (Array.isArray(countries_derived)) {
    countries_derived.filter(Boolean).forEach(c => jobCountries.add(c));
  }

  // STEP 2: remote-only hints
  if (Array.isArray(ai_remote_location_derived)) {
    for (const loc of ai_remote_location_derived) {
      const c = extractCountryFromLocationString(loc, masterCountries);
      if (c && c !== "WORLDWIDE_FLAG") jobCountries.add(c);
    }
  }

  // STEP 3: fallback to locations_derived + raw
  if (jobCountries.size === 0) {
    if (Array.isArray(locations_derived)) {
      for (const loc of locations_derived) {
        const c = extractCountryFromLocationString(loc, masterCountries);
        if (c && c !== "WORLDWIDE_FLAG") jobCountries.add(c);
      }
    }

    if (Array.isArray(locations_raw)) {
      for (const loc of locations_raw) {
        const c = loc?.address?.addressCountry?.name;
        if (c && masterCountries.includes(c)) jobCountries.add(c);
      }
    }
  }

  // STEP 4: fallback to HQ
  if (jobCountries.size === 0 && linkedin_org_headquarters) {
    const c = extractCountryFromLocationString(linkedin_org_headquarters, masterCountries);
    if (c && c !== "WORLDWIDE_FLAG") jobCountries.add(c);
  }

  return jobCountries;
}


function determineJobLocationType(data, masterCountries) {
  const {
    locations_derived,
    ai_remote_location_derived,
    locations_raw,
    remote_derived
  } = data;

  const jobCountries = getJobCountries(data, masterCountries);

  // COMBINED string for worldwide detection
  const pools = [
    ...(locations_derived || []),
    ...(ai_remote_location_derived || []),
    ...(locations_raw || []).map(r => r?.address?.name).filter(Boolean)
  ];

  const combined = pools.join(" ").toLowerCase();

  const worldwideTerms = [
    "worldwide", "world wide", "global", "anywhere",
    "multiple locations", "various locations",
    "europe", "emea", "apac", "north america", "asia"
  ];

  const hasWorldwideTerm = worldwideTerms.some(t => combined.includes(t));

  // Condition A — explicit worldwide terms
  if (hasWorldwideTerm && jobCountries.size === 0) {
    return { jobLocationType: "Worldwide", jobCountries };
  }

  // Condition B — multiple countries
  if (jobCountries.size >= 2) {
    return { jobLocationType: "Worldwide", jobCountries };
  }

  // Condition C — remote + unknown country
  if (remote_derived === true && jobCountries.size === 0) {
    return { jobLocationType: "Worldwide", jobCountries };
  }

  // Default: single country
  if (jobCountries.size === 1) {
    return { jobLocationType: Array.from(jobCountries)[0], jobCountries };
  }

  // Total fallback
  return { jobLocationType: "Worldwide", jobCountries };
}

function formatSalary(data) {
  const {
    ai_salary_currency,
    ai_salary_value,
    ai_salary_minvalue,
    ai_salary_maxvalue,
    ai_salary_unittext,
    salary_raw
  } = data;

  // Currency symbol map
  const currencyMap = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
  };

  // Helper → format number to "120k"
  const formatNum = (num) => {
    if (num === null || num === undefined) return null;
    if (num >= 1000) return Math.round(num / 1000) + "k";
    return num.toString();
  };

  const symbol = currencyMap[ai_salary_currency] || (ai_salary_currency ? ai_salary_currency + " " : "");

  // ----------------------------------------
  // CASE 1: min + max → salary range
  // ----------------------------------------
  if (ai_salary_minvalue != null && ai_salary_maxvalue != null) {
    const min = formatNum(ai_salary_minvalue);
    const max = formatNum(ai_salary_maxvalue);
    const unit = ai_salary_unittext || "";
    return `${symbol}${min}–${symbol}${max} · ${unit}`;
  }

  // ----------------------------------------
  // CASE 2: single salary value
  // ----------------------------------------
  if (ai_salary_value != null) {
    const val = formatNum(ai_salary_value);
    const unit = ai_salary_unittext || "";
    return `${symbol}${val} · ${unit}`;
  }

  // ----------------------------------------
  // CASE 3: salary_raw fallback
  // Try to extract a number pattern
  // ----------------------------------------
  if (salary_raw) {
    const raw = salary_raw.toLowerCase();

    // examples: "$120k", "120000", "£90,000", "90k"
    const match = raw.match(/([\$€£₹]?\s*\d+[kK]?)/);
    if (match) {
      return match[1];
    }
  }

  // ----------------------------------------
  // CASE 4: everything empty → hide salary
  // ----------------------------------------
  return null;
}

function deriveIndustry(linkedin_org_industry, ai_taxonomies_a) {
  // 1. use LinkedIn industry if available
  if (linkedin_org_industry && linkedin_org_industry.trim() !== "") {
    return linkedin_org_industry.trim();
  }

  // 2. fallback to first business-relevant taxonomy
  if (Array.isArray(ai_taxonomies_a) && ai_taxonomies_a.length > 0) {
    return ai_taxonomies_a[0]; // first taxonomy
  }

  // 3. if nothing exists → hide industry chip
  return null;
}

function deriveHeadquarters(
  linkedin_org_headquarters,
  linkedin_org_locations,
  countries_derived
) {
  // 1. Use headquarters if present
  if (linkedin_org_headquarters && linkedin_org_headquarters.trim() !== "") {
    return linkedin_org_headquarters.trim();
  }

  // 2. Use first org location if HQ missing
  if (
    Array.isArray(linkedin_org_locations) &&
    linkedin_org_locations.length > 0
  ) {
    return linkedin_org_locations[0].trim();
  }

  // 3. Fallback to country-based label
  if (
    Array.isArray(countries_derived) &&
    countries_derived.length > 0
  ) {
    // optionally can map to region, but simplest:
    return countries_derived[0];
  }

  // 4. All missing → hide card
  return null;
}

function deriveOrganizationUrl(organization_url, domain_derived) {
  // 1. Use organization_url directly if present
  if (organization_url && organization_url.trim() !== "") {
    return organization_url.trim();
  }

  // 2. Build from domain_derived
  if (domain_derived && domain_derived.trim() !== "") {
    return `https://${domain_derived.trim()}`;
  }

  // 3. Hide if both missing
  return null;
}



module.exports = { 
    extractResponsibilities,
    buildRequirements,
    buildSkillChips,
    determineExperienceLevel,
    determineJobLocationType,
    masterCountries,
    formatSalary,
    deriveIndustry,
    deriveHeadquarters,
    deriveOrganizationUrl
}