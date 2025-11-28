/**
 * APIFY → JobRequest Transformation Engine (FINAL VERSION)
 * ---------------------------------------------------------
 * - Fully aligned with FieldMapping.pdf (pp. 28–34)
 * - NEW PDF priority role & product detection
 * - Uses balanced roleKeywords.js + productKeywords.js
 * - Human-readable product tags (Option B)
 * - Clean, accurate, production-grade
 */

const ROLE_KEYWORDS = require("./roleKeywords");
const PRODUCT_KEYWORDS = require("./productKeywords");

/* ============================================================
   0. UTILITIES
   ============================================================ */

const normalize = (v) => (v ? v.toString().trim().toLowerCase() : "");

/* ============================================================
   1. COUNTRY SET (Your frontend country groups)
   ============================================================ */

const countryOptionsGrouped = {
  special: ["All Countries", "Worldwide"],
  emea: ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Oman", "Bahrain", "Turkey", "Israel"],
  apac: ["India", "Singapore", "Japan", "Malaysia", "Philippines", "Thailand", "Vietnam", "Indonesia", "Hong Kong", "Taiwan"],
  northAmerica: ["United States", "Canada", "Mexico"],
  europe: [
    "United Kingdom", "Germany", "France", "Netherlands", "Ireland", "Switzerland", "Italy", "Spain",
    "Sweden", "Norway", "Denmark", "Finland", "Belgium", "Austria", "Poland", "Czech Republic", "Romania",
  ],
  latam: ["Brazil", "Argentina", "Chile", "Colombia", "Peru"],
  africa: ["Egypt", "Morocco", "South Africa", "Kenya", "Nigeria"],
  oceania: ["Australia", "New Zealand"],
};

const masterCountries = new Set(Object.values(countryOptionsGrouped).flat());

/* ============================================================
   2. ROLE DETECTION (PDF PRIORITY)
   ============================================================ */

// PRIORITY: title → ai_keywords → core_responsibilities → requirements → description_text
function detectRoles(job) {
  const priorityChunks = {
    strong: [
      job.title || "",
      ...(job.ai_keywords || []),
    ],
    medium: [
      job.ai_core_responsibilities || "",
      job.ai_requirements_summary || "",
    ],
    weak: [
      job.description_text || "",
    ],
  };

  const detected = new Set();

  // STRONG PHASE
  for (const [roleKey, keywords] of Object.entries(ROLE_KEYWORDS)) {
    for (const kw of keywords) {
      if (priorityChunks.strong.some((txt) => txt?.toLowerCase().includes(kw))) {
        detected.add(formatRoleName(roleKey));
      }
    }
  }
  if (detected.size > 0) return [...detected];

  // MEDIUM PHASE
  for (const [roleKey, keywords] of Object.entries(ROLE_KEYWORDS)) {
    for (const kw of keywords) {
      if (priorityChunks.medium.some((txt) => txt?.toLowerCase().includes(kw))) {
        detected.add(formatRoleName(roleKey));
      }
    }
  }
  if (detected.size > 0) return [...detected];

  // WEAK (FALLBACK)
  for (const [roleKey, keywords] of Object.entries(ROLE_KEYWORDS)) {
    for (const kw of keywords) {
      if (priorityChunks.weak.some((txt) => txt?.toLowerCase().includes(kw))) {
        detected.add(formatRoleName(roleKey));
      }
    }
  }

  return [...detected];
}

function formatRoleName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/* ============================================================
   3. PRODUCT TAG DETECTION (PDF PRIORITY + Human-Readable)
   ============================================================ */

// HUMAN-READABLE PRODUCT NAMES (Option B)
const PRODUCT_NAME_MAP = {
  d365FO: "D365 F&O",
  d365CE: "D365 CE",
  businessCentral: "Business Central",
  powerPlatform: "Power Platform",
  powerApps: "Power Apps",
  powerAutomate: "Power Automate",
  powerBI: "Power BI",
  copilotAI: "Copilot / AI",
  azure: "Azure",
  commerce: "Commerce",
  projectOperations: "Project Operations",
  humanResources: "HR",
  financeSCMModules: "Finance & SCM Modules",
  miscMicrosoft: "Microsoft Cloud Tools",
};

// PRIORITY: ai_key_skills → ai_keywords → title → description
function detectProductTags(job) {
  const priorityChunks = {
    strong: [
      ...(job.ai_key_skills || []),
    ],
    medium: [
      ...(job.ai_keywords || []),
    ],
    weak: [
      job.title || "",
      job.description_text || "",
    ],
  };

  const detected = new Set();

  const detectFromChunk = (chunk, addModules = true) => {
    for (const [productKey, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
      for (const kw of keywords) {
        if (chunk.some((txt) => txt?.toLowerCase().includes(kw))) {
          detected.add(PRODUCT_NAME_MAP[productKey]);
          break;
        }
      }
    }
  };

  // STRONG
  detectFromChunk(priorityChunks.strong);
  if (detected.size > 0) return [...detected];

  // MEDIUM
  detectFromChunk(priorityChunks.medium);
  if (detected.size > 0) return [...detected];

  // WEAK
  detectFromChunk(priorityChunks.weak);

  return [...detected];
}

/* ============================================================
   4. SKILLS
   ============================================================ */

function buildSkillChips(job) {
  const raw = [...(job.ai_key_skills || []), ...(job.ai_keywords || [])];
  return [...new Set(raw.map((s) => s.trim()))];
}

/* ============================================================
   5. RESPONSIBILITIES
   ============================================================ */

function extractResponsibilities(job) {
  const txt = job.ai_core_responsibilities || job.description_text || "";
  return txt
    .split(/\n|•|- /g)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ============================================================
   6. REQUIREMENTS
   ============================================================ */

function buildRequirements(job) {
  const out = [];

  if (job.ai_requirements_summary) {
    out.push(
      ...job.ai_requirements_summary
        .split(/\n|•|- /g)
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }

  if (Array.isArray(job.ai_education_requirements)) {
    out.push(...job.ai_education_requirements.map((e) => e.trim()));
  }

  if (job.ai_experience_level) {
    out.push(`Experience required: ${job.ai_experience_level} years`);
  }

  return [...new Set(out)];
}

/* ============================================================
   7. EXPERIENCE LEVEL
   ============================================================ */

function mapExperienceLevel(job) {
  const lvl = job.ai_experience_level;
  if (!lvl) return null;

  const m = lvl.match(/(\d+)-?(\d+)?/);
  if (!m) return null;

  const min = +m[1];
  const max = m[2] ? +m[2] : null;

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
  const uniq = [...new Set(countries)];

  if (uniq.length === 1) return masterCountries.has(uniq[0]) ? uniq[0] : "Worldwide";
  if (uniq.length > 1) return "Worldwide";

  const text = (job.title || "") + " " + (job.description_text || "");
  const lowered = text.toLowerCase();

  const worldTerms = ["worldwide", "global", "anywhere", "emea", "apac", "europe"];
  if (worldTerms.some((kw) => lowered.includes(kw))) return "Worldwide";

  if (job.remote_derived) return "Worldwide";

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
  const cur = job.ai_salary_currency || "";
  const unit = job.ai_salary_unittext || "";

  if (min && max) return `${cur}${min} - ${cur}${max} ${unit}`;
  if (min) return `${cur}${min} ${unit}`;
  if (max) return `${cur}${max} ${unit}`;
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
    status: "Active",

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
