/**
 * APIFY → JobRequest Transformation Engine
 * -----------------------------------------
 * - Fully aligned with FieldMapping.pdf (pages 28–34)
 * - Uses: roleKeywords.js + productKeywords.js
 * - Medium-level comments: clean + production-grade
 * - Optimized for large datasets (200+ jobs)
 * - Implements W2 location logic (dedupe → detect worldwide only if >1 unique country)
 */

const ROLE_KEYWORDS = require("./roleKeywords");
const PRODUCT_KEYWORDS = require("./productKeywords");

/* ============================================================
   1. COUNTRY SET (flattened + embedded)
   ============================================================ */

const countryOptionsGrouped = {
  special: ["All Countries", "Worldwide"],
  emea: ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Oman", "Bahrain", "Turkey", "Israel"],
  apac: ["India", "Singapore", "Japan", "Malaysia", "Philippines", "Thailand", "Vietnam", "Indonesia", "Hong Kong", "Taiwan"],
  northAmerica: ["United States", "Canada", "Mexico"],
  europe: [
    "United Kingdom", "Germany", "France", "Netherlands", "Ireland", "Switzerland", "Italy", "Spain",
    "Sweden", "Norway", "Denmark", "Finland", "Belgium", "Austria", "Poland", "Czech Republic", "Romania"
  ],
  latam: ["Brazil", "Argentina", "Chile", "Colombia", "Peru"],
  africa: ["Egypt", "Morocco", "South Africa", "Kenya", "Nigeria"],
  oceania: ["Australia", "New Zealand"],
};

const masterCountries = new Set(Object.values(countryOptionsGrouped).flat());

const normalize = (v) => (v ? v.toString().trim().toLowerCase() : "");

/* ============================================================
   2. ROLE DETECTION
   ============================================================ */

function detectRoles(job) {
  const text = [
    job.title,
    job.description_text,
    job.ai_core_responsibilities,
    job.ai_requirements_summary,
    ...(job.ai_keywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matched = [];

  for (const [roleKey, keywords] of Object.entries(ROLE_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        matched.push(formatRoleName(roleKey));
        break;
      }
    }
  }

  return [...new Set(matched)];
}

function formatRoleName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/* ============================================================
   3. PRODUCT TAG DETECTION
   ============================================================ */

function detectProductTags(job) {
  const text = [
    job.title,
    job.description_text,
    job.ai_core_responsibilities,
    job.ai_requirements_summary,
    ...(job.ai_keywords || []),
    ...(job.ai_key_skills || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matched = [];

  for (const [productKey, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        matched.push(formatProductName(productKey));
        break;
      }
    }
  }

  return [...new Set(matched)];
}

function formatProductName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/* ============================================================
   4. SKILLS
   ============================================================ */

function buildSkillChips(job) {
  const raw = [
    ...(job.ai_key_skills || []),
    ...(job.ai_keywords || []),
  ];
  return [...new Set(raw.map((x) => x.trim()))];
}

/* ============================================================
   5. RESPONSIBILITIES
   ============================================================ */

function extractResponsibilities(job) {
  if (job.ai_core_responsibilities) {
    return job.ai_core_responsibilities
      .split(/\n|•|- /g)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (job.description_text) {
    return job.description_text
      .split("\n")
      .filter(
        (l) =>
          l.includes("respons") ||
          l.trim().startsWith("•") ||
          l.trim().startsWith("-")
      )
      .map((line) => line.replace(/^[•-]/, "").trim());
  }

  return [];
}

/* ============================================================
   6. REQUIREMENTS
   ============================================================ */

function buildRequirements(job) {
  const reqs = [];

  if (job.ai_requirements_summary) {
    reqs.push(
      ...job.ai_requirements_summary
        .split(/\n|•|- /g)
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }

  if (Array.isArray(job.ai_education_requirements)) {
    reqs.push(...job.ai_education_requirements.map((e) => e.trim()));
  }

  if (job.ai_experience_level) {
    reqs.push(`Experience required: ${job.ai_experience_level} years`);
  }

  return [...new Set(reqs)];
}

/* ============================================================
   7. EXPERIENCE LEVEL
   ============================================================ */

function mapExperienceLevel(job) {
  const lvl = job.ai_experience_level;
  if (!lvl) return null;

  const match = lvl.match(/(\d+)-?(\d+)?/);
  if (!match) return null;

  const min = parseInt(match[1], 10);
  const max = match[2] ? parseInt(match[2], 10) : null;

  if (max !== null) {
    if (max <= 2) return "Junior Level";
    if (max <= 5) return "Mid-Level";
    return "Senior Level";
  }

  if (min <= 2) return "Junior Level";
  if (min <= 5) return "Mid-Level";
  return "Senior Level";
}

/* ============================================================
   8. WORK MODE
   ============================================================ */

function mapWorkMode(job) {
  const arr = job.employment_type || job.ai_employment_type || [];
  const v = normalize(arr[0] || "");

  if (v.includes("part")) return "Part-Time";
  if (v.includes("contract")) return "Contract";
  return "Full-Time";
}

/* ============================================================
   9. JOB TYPE
   ============================================================ */

function mapJobType(job) {
  const w = normalize(job.ai_work_arrangement);

  if (w.includes("remote solely") || w.includes("remote ok")) return "Remote";
  if (job.remote_derived === true) return "Remote";
  if (job.location_type === "TELECOMMUTE") return "Remote";
  if (w.includes("hybrid")) return "Hybrid";

  return "Onsite";
}

/* ============================================================
   10. LOCATION ENGINE (W2 Logic)
   ============================================================ */

function determineJobLocationType(job) {
  const countries = (job.countries_derived || []).map((c) => c.trim());
  const unique = [...new Set(countries)];

  // Rule W2: duplicates still = single country
  if (unique.length === 1) {
    const c = unique[0];
    return masterCountries.has(c) ? c : "Worldwide";
  }

  if (unique.length > 1) return "Worldwide";

  // No country; use keyword-based Worldwide
  const text = [
    job.title,
    job.description_text,
    ...(job.locations_raw || []),
    ...(job.locations_derived || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const worldKeywords = ["worldwide", "global", "anywhere", "emea", "apac", "europe"];

  if (worldKeywords.some((kw) => text.includes(kw))) {
    return "Worldwide";
  }

  if (job.remote_derived === true) return "Worldwide";

  return "Worldwide";
}

/* ============================================================
   11. SALARY
   ============================================================ */

function getLowerCompensation(job) {
  return job.ai_salary_minvalue || null;
}

function getUpperCompensation(job) {
  return job.ai_salary_maxvalue || null;
}

function formatSalary(job) {
  const min = job.ai_salary_minvalue;
  const max = job.ai_salary_maxvalue;
  const currency = job.ai_salary_currency || "";
  const unit = job.ai_salary_unittext || "";

  if (min && max) return `${currency}${min} - ${currency}${max} ${unit}`;
  if (min) return `${currency}${min} ${unit}`;
  if (max) return `${currency}${max} ${unit}`;
  return null;
}

/* ============================================================
   12. MAIN TRANSFORM FUNCTION
   ============================================================ */

function transformApifyJobToJobRequest(job) {
  return {
    apifyJobId: job.id || job._id || null,
    jobTitle: job.title || null,
    jobRole: detectRoles(job),
    otherRole: null,

    companyHomePage: job.organization_url
      ? job.organization_url
      : job.domain_derived
      ? `https://${job.domain_derived}`
      : null,

    companyLinkedInPage: job.linkedin_org_url || null,
    applyLink: job.url || null,

    roleDescription:
      job.description_text ||
      `${job.ai_core_responsibilities || ""}\n${job.ai_requirements_summary || ""}`.trim(),

    keyResponsibilities: extractResponsibilities(job),
    requirements: buildRequirements(job),
    skills: buildSkillChips(job),

    country: determineJobLocationType(job),
    jobType: mapJobType(job),
    workMode: mapWorkMode(job),
    roleLevel: mapExperienceLevel(job),

    lowerCompensation: getLowerCompensation(job),
    upperCompensation: getUpperCompensation(job),
    salary: formatSalary(job),

    organization: job.organization || null,
    date_posted: job.date_posted || job.date_created || null,
    organization_logo: job.organization_logo || null,

    linkedin_org_industry:
      job.linkedin_org_industry ||
      (Array.isArray(job.ai_taxonomies_a) ? job.ai_taxonomies_a[0] : null),

    linkedin_org_size: job.linkedin_org_size || null,
    linkedin_org_foundeddate: job.linkedin_org_foundeddate || null,
    linkedin_org_headquarters:
      job.linkedin_org_headquarters ||
      (job.linkedin_org_locations ? job.linkedin_org_locations[0] : null),

    domain_derived: job.domain_derived || null,

    product_tags: detectProductTags(job),
  };
}

/* ============================================================
   EXPORTS
   ============================================================ */

module.exports = {
  transformApifyJobToJobRequest,
  detectRoles,
  detectProductTags,
  determineJobLocationType,
  mapJobType,
  mapWorkMode,
  mapExperienceLevel,
  buildSkillChips,
  buildRequirements,
  extractResponsibilities,
  formatSalary,
};
