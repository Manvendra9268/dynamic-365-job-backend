/**
 * PRODUCT KEYWORD DICTIONARIES
 * ------------------------------------------------------------
 * These dictionaries map job text (title, description, ai fields)
 * to product families:
 *
 * - D365 F&O (Finance & Operations / AX)
 * - D365 CE (Customer Engagement / CRM)
 * - Business Central (BC / NAV)
 * - Power Platform
 * - Power Apps
 * - Power Automate
 * - Power BI
 * - Copilot / AI
 * - Azure / Integrations
 * - Commerce / Retail
 * - Other MS Cloud Words
 *
 * Matching is always CASE-INSENSITIVE.
 * Keep all keywords LOWERCASE.
 */

module.exports = {
  // ------------------------------------------------------------
  // 1. D365 FINANCE & OPERATIONS (F&O / AX / FinOps)
  // ------------------------------------------------------------
  d365FO: [
    "d365 finance",
    "d365 f&o",
    "d365 fo",
    "d365 finance and operations",
    "finance & operations",
    "finance and operations",
    "finops",
    "f&o",
    "fo",
    "dynamics 365 finance",
    "dynamics 365 operations",
    "dynamics 365 f&o",
    "d365 erp",
    "erp finance",
    "ax",
    "ax 2009",
    "ax2009",
    "ax 2012",
    "ax2012",
    "axapta",
    "x++",
    "xpp",
    "fo developer",
    "fo consultant",
    "f&o developer",
    "f&o functional",
    "trade & logistics",
    "supply chain management",
    "scm",
    "project operations",
    "finance module",
    "general ledger",
    "accounts payable",
    "accounts receivable",
    "fixed assets",
    "procurement & sourcing",
  ],

  // ------------------------------------------------------------
  // 2. D365 CUSTOMER ENGAGEMENT (CE / CRM)
  // ------------------------------------------------------------
  d365CE: [
    "d365 ce",
    "d365crm",
    "d365 crm",
    "dynamics 365 ce",
    "dynamics 365 customer engagement",
    "crm",
    "microsoft crm",
    "dynamics crm",
    "customer engagement",
    "ce developer",
    "ce consultant",
    "sales module",
    "marketing module",
    "customer service module",
    "field service",
    "project service automation",
    "psa",
    "plugins",
    "workflows",
    "power automate flows",
    "model-driven app",
    "canvas app + crm",
  ],

  // ------------------------------------------------------------
  // 3. BUSINESS CENTRAL (BC / NAV)
  // ------------------------------------------------------------
  businessCentral: [
    "business central",
    "bc",
    "d365 bc",
    "dynamics 365 bc",
    "dynamics bc",
    "nav",
    "navision",
    "dynamics nav",
    "al language",
    "al developer",
    "extensions",
    "bc consultant",
    "bc developer",
  ],

  // ------------------------------------------------------------
  // 4. POWER PLATFORM (High-Level)
  // ------------------------------------------------------------
  powerPlatform: [
    "power platform",
    "microsoft power platform",
    "pp",
    "dataverse",
    "power apps",
    "power automate",
    "power bi",
    "power virtual agents",
    "pva",
    "rpa",
    "low code",
    "low-code",
    "no code",
    "no-code",
    "canvas app",
    "model-driven app",
    "solution layering",
    "powerfx",
  ],

  // ------------------------------------------------------------
  // 5. POWER APPS
  // ------------------------------------------------------------
  powerApps: [
    "power apps",
    "powerapps",
    "canvas apps",
    "model-driven apps",
    "model driven apps",
    "model driven",
    "canvas app development",
    "model-driven app development",
  ],

  // ------------------------------------------------------------
  // 6. POWER AUTOMATE
  // ------------------------------------------------------------
  powerAutomate: [
    "power automate",
    "powerautomate",
    "flows",
    "power automate flows",
    "automated flows",
    "cloud flows",
    "desktop flows",
    "rpa",
    "process automation",
  ],

  // ------------------------------------------------------------
  // 7. POWER BI
  // ------------------------------------------------------------
  powerBI: [
    "power bi",
    "powerbi",
    "dax",
    "power query",
    "bi developer",
    "business intelligence",
    "data visualization",
    "reporting",
    "dashboards",
  ],

  // ------------------------------------------------------------
  // 8. COPILOT / AI
  // ------------------------------------------------------------
  copilotAI: [
    "copilot",
    "microsoft copilot",
    "power platform copilot",
    "dynamics copilot",
    "ai",
    "artificial intelligence",
    "machine learning",
    "ml",
    "llm",
    "gpt",
    "gen ai",
    "generative ai",
    "chatgpt",
    "azure openai",
  ],

  // ------------------------------------------------------------
  // 9. AZURE (Cloud + Integration)
  // ------------------------------------------------------------
  azure: [
    "azure",
    "azure devops",
    "azure functions",
    "logic apps",
    "azure logic apps",
    "azure service bus",
    "api management",
    "apim",
    "azure data factory",
    "adf",
    "azure synapse",
    "azure data lake",
    "event grid",
    "event hub",
    "cloud engineer",
    "cloud integration",
    "azure integration",
  ],

  // ------------------------------------------------------------
  // 10. COMMERCE / RETAIL
  // ------------------------------------------------------------
  commerce: [
    "commerce",
    "d365 commerce",
    "retail",
    "dynamics retail",
    "pos",
    "retail pos",
    "mpo",
    "e-commerce",
    "ecommerce",
    "commerce scale unit",
    "csu",
  ],

  // ------------------------------------------------------------
  // 11. PROJECT OPERATIONS (optional)
  // ------------------------------------------------------------
  projectOperations: [
    "project operations",
    "d365 project operations",
    "pro",
    "project ops",
  ],

  // ------------------------------------------------------------
  // 12. HR MODULE (F&O)
  // ------------------------------------------------------------
  humanResources: [
    "d365 hr",
    "human resources",
    "talent",
    "dynamics talent",
  ],

  // ------------------------------------------------------------
  // 13. FINANCE / SUPPLY CHAIN (explicit modules)
  // ------------------------------------------------------------
  financeSCMModules: [
    "finance module",
    "general ledger",
    "gl module",
    "accounts payable",
    "ap module",
    "accounts receivable",
    "ar module",
    "procurement",
    "inventory management",
    "warehouse management",
    "supply chain management",
    "scm",
  ],

  // ------------------------------------------------------------
  // 14. OTHER MISC MICROSOFT CLOUD TOOLS
  // ------------------------------------------------------------
  miscMicrosoft: [
    "sharepoint",
    "teams",
    "azure ad",
    "microsoft 365",
    "office 365",
    "o365",
  ],
};
