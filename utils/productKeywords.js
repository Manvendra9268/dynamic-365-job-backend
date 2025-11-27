/**
 * PRODUCT KEYWORD DICTIONARIES (Balanced Strictness)
 * ------------------------------------------------------------
 * - Product families (F&O, CE, BC, Power Platform, Azure, etc.)
 * - Module families (Finance, SCM, HR, Commerce, Project Ops)
 * - Only strong product identifiers (NO generic functional terms)
 * - No overlapping / no noisy terms
 * - Fully aligned with PDF product-tag logic
 */

module.exports = {
  // ------------------------------------------------------------
  // 1. D365 FINANCE & OPERATIONS (F&O / AX / FinOps)
  // ------------------------------------------------------------
  d365FO: [
    "d365 f&o",
    "d365 fo",
    "d365 finance",
    "d365 operations",
    "d365 finance and operations",
    "finance & operations",
    "finops",
    "ax",
    "axapta",
    "ax 2012",
    "ax2012",
    "ax 2009",
    "ax2009",
    "dynamics 365 finance",
    "dynamics 365 operations",
    "x++",
    "xpp",
  ],

  // ------------------------------------------------------------
  // 2. D365 CUSTOMER ENGAGEMENT (CE / CRM)
  // ------------------------------------------------------------
  d365CE: [
    "d365 ce",
    "d365 crm",
    "dynamics 365 ce",
    "dynamics 365 customer engagement",
    "microsoft crm",
    "dynamics crm",
    "customer engagement",
  ],

  // ------------------------------------------------------------
  // 3. BUSINESS CENTRAL (BC / NAV)
  // ------------------------------------------------------------
  businessCentral: [
    "business central",
    "d365 bc",
    "dynamics 365 bc",
    "dynamics bc",
    "nav",
    "navision",
    "dynamics nav",
    "al language",
    "al programmer",
    "al developer",
  ],

  // ------------------------------------------------------------
  // 4. POWER PLATFORM (High-Level)
  // ------------------------------------------------------------
  powerPlatform: [
    "power platform",
    "microsoft power platform",
    "dataverse",
    "low code",
    "low-code",
    "no code",
    "no-code",
    "powerfx",
  ],

  // ------------------------------------------------------------
  // 5. POWER APPS (Sub-family)
  // ------------------------------------------------------------
  powerApps: [
    "power apps",
    "powerapps",
    "canvas apps",
    "model-driven app",
    "model driven app",
    "canvas app development",
    "model-driven development",
  ],

  // ------------------------------------------------------------
  // 6. POWER AUTOMATE (Sub-family)
  // ------------------------------------------------------------
  powerAutomate: [
    "power automate",
    "powerautomate",
    "power automate flows",
    "automated flows",
    "cloud flows",
    "desktop flows",
    "rpa",
  ],

  // ------------------------------------------------------------
  // 7. POWER BI
  // ------------------------------------------------------------
  powerBI: [
    "power bi",
    "powerbi",
    "dax",
    "power query",
    "bi dashboards",
    "business intelligence",
  ],

  // ------------------------------------------------------------
  // 8. COPILOT / AI
  // ------------------------------------------------------------
  copilotAI: [
    "copilot",
    "microsoft copilot",
    "dynamics copilot",
    "power platform copilot",
    "azure openai",
    "ai",
    "artificial intelligence",
    "machine learning",
    "ml",
    "llm",
    "gpt",
    "gen ai",
    "generative ai",
  ],

  // ------------------------------------------------------------
  // 9. AZURE (Cloud + Integration)
  // ------------------------------------------------------------
  azure: [
    "azure",
    "azure functions",
    "logic apps",
    "azure logic apps",
    "azure devops",
    "api management",
    "apim",
    "azure service bus",
    "azure synapse",
    "azure data factory",
    "adf",
    "event grid",
    "event hub",
    "azure integration",
  ],

  // ------------------------------------------------------------
  // 10. COMMERCE / RETAIL (D365 Commerce)
  // ------------------------------------------------------------
  commerce: [
    "d365 commerce",
    "commerce",
    "retail",
    "retail pos",
    "pos",
    "mpo",
    "commerce scale unit",
    "csu",
    "ecommerce",
    "e-commerce",
  ],

  // ------------------------------------------------------------
  // 11. PROJECT OPERATIONS
  // ------------------------------------------------------------
  projectOperations: [
    "d365 project operations",
    "project operations",
    "project ops",
    "pro",
  ],

  // ------------------------------------------------------------
  // 12. HR (D365 Talent / HR)
  // ------------------------------------------------------------
  humanResources: [
    "d365 hr",
    "d365 human resources",
    "dynamics talent",
    "talent mgmt",
  ],

  // ------------------------------------------------------------
  // 13. FINANCE & SUPPLY CHAIN MODULES
  // ------------------------------------------------------------
  financeSCMModules: [
    "finance module",
    "general ledger",
    "gl module",
    "accounts payable",
    "accounts receivable",
    "ap module",
    "ar module",
    "inventory management",
    "warehouse management",
    "supply chain management",
    "scm module",
  ],

  // ------------------------------------------------------------
  // 14. MISC MICROSOFT CLOUD TOOLS (Optional)
  // ------------------------------------------------------------
  miscMicrosoft: [
    "sharepoint",
    "teams",
    "office 365",
    "o365",
    "microsoft 365",
    "azure ad",
  ],
};
