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
    "f&o",
    "fn o",
    "finance and operations",
    "f&sc",
    "f&scm",
    "finance and supplychain management",
    "general ledger",
    "ap/ar",
    "budgeting",
    "x++",
    "ax 2012",
    "trade & logistics",
    "supply chain",
    "procurement",
    "warehouse",
    "inventory",
    "product information",
    "production control",
    "d365 fo",
    "fno",
    "finops",
    "finance operations",
    "dynamics 365 fo",
    "dynamics 365 f&o",
    "operations consultant",
    "master planning",
    "mrp",
    "demand planning",
    "forecasting",
    "cost management",
    "costing",
    "sales and distribution",
    "d365 scm",
    "supply chain management",
    "fixed assets",
    "bank management",
    "project accounting",
    "dmf",
    "data management framework",
    "dual write",
    "inventory valuation",
    "standard cost",
    "fifo",
    "weighted avg",
    "d365 operations",
  ],

  // ------------------------------------------------------------
  // 2. D365 CUSTOMER ENGAGEMENT (CE / CRM)
  // ------------------------------------------------------------
  d365CE: [
    "dynamics 365 sales",
    "sales hub",
    "opportunity management",
    "lead tracking",
    "pipeline",
    "crm sales",
    "relationship sales",
    "sales insights",
    "quote to cash",
    "q2c",
    "forecasting",
    "sales pipeline management",
    "prospecting tools",
    "sequences",
    "customer service workspace",
    "customer service hub",
    "sla",
    "entitlements",
    "unified routing",
    "queues",
    "queue management",
    "voice channel",
    "digital contact center",
    "cs insights",
    "dynamics 365 marketing",
    "campaign",
    "email marketing",
    "customer journey",
    "real-time marketing",
    "journey orchestration",
    "customer insights",
    "ci",
    "customer data platform",
    "cdp",
    "event management",
    "rtm",
    "field service",
    "work orders",
    "onsite",
    "mobile technician",
    "resource scheduling",
    "connected field service",
    "fs mobile",
    "mobile app",
    "bookable resources",
    "resource scheduling optimization",
    "rso",
    "asset management",
    "service account",
    "incident type",
    "project operations",
    "psa",
    "project accounting",
    "project profitability",
    "projops",
    "d365 po",
    "resource management",
    "time & expense",
    "t&e",
    "project contracts",
    "billing setup",
    "crm dynamics",
    "ms crm",
    "crm sdk",
    "xrm",
    "crm 2011",
    "crm 2013",
    "crm 2015",
    "crm 2016",
  ],

  // ------------------------------------------------------------
  // 3. BUSINESS CENTRAL (BC / NAV)
  // ------------------------------------------------------------
  businessCentral: [
    "business central",
    "d365 bc",
    "navision",
    "nav",
    "al language",
    "c/al",
    "extensions",
    "small business erp",
    "smb erp",
    "bc developer",
    "bc consultant",
    "dynamics nav developer",
    "nav consultant",
    "al developer",
    "extension development",
    "rapidstart",
    "business central online",
    "bc online",
    "jet reports",
    "jet analytics",
    "ls central",
    "bc functional",
    "bc technical",
  ],

  // ------------------------------------------------------------
  // 4. POWER PLATFORM (High-Level)
  // ------------------------------------------------------------
  powerPlatform: [
    "power platform",
    "dataverse",
    "common data service",
    "low-code",
    "pro developer",
    "maker tools",
    "maker experience",
    "solution layers",
    "solutions",
    "environment strategy",
    "tenant strategy",
    "power platform admin center",
    "power platform coe",
    "center of excellence",
    "coe starter kit",
    "connector",
    "custom connector",
    "power apps",
    "canvas app",
    "model driven app",
    "pcf",
    "maker portal",
    "canvas",
    "model-driven",
    "commanding",
    "command bar",
    "power fx",
    "custom pages",
    "ai builder",
    "dataverse tables",
    "forms",
    "views",
    "security roles",
    "power pages",
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
    "flow",
    "workflow automation",
    "rpa",
    "process automation",
    "cloud flows",
    "desktop flows",
    "ui automation",
    "process mining",
    "process advisor",
    "triggers",
    "connectors",
    "actions",
    "approvals",
    "logic app",
  ],

  // ------------------------------------------------------------
  // 7. POWER BI
  // ------------------------------------------------------------
  powerBI: [
    "power bi",
    "dax",
    "data model",
    "visualization",
    "dashboard",
    "report builder",
    "paginated reports",
    "powerbi",
    "ssas",
    "tabular model",
    "power query",
    "m language",
    "row level security",
    "rls",
    "kpis",
    "measure",
    "calculated columns",
    "dataflows",
    "fabric",
  ],

  // ------------------------------------------------------------
  // 8. COPILOT / AI
  // ------------------------------------------------------------
  copilotAI: [
    "copilot",
    "copilot studio",
    "ai builder",
    "openai",
    "prompt engineering",
    "chatbot",
    "generative ai",
    "chatgpt",
    "semantic search",
    "nlp",
    "copilot agent",
    "agent",
    "microsoft agent 365",
    "rag",
    "retrieval augmented generation",
    "vector search",
    "embeddings",
    "azure openai",
    "oai",
    "aoai",
    "llm",
    "large language model",
    "custom copilot",
    "microsoft fabric ai features",
    "ai infused apps",
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
    "dynamics365 commerce",
    "omnichannel retail",
    "point of sale",
    "pos",
    "retail",
    "ecommerce",
    "d365 commerce",
    "commerce scale unit",
    "csu",
    "mpo",
    "modern pos",
    "cloud pos",
    "store commerce",
    "retail server",
    "retail channel",
    "call center",
    "commerce headquarters",
    "commerce hq",
    "loyalty programs",
    "merchandising",
    "product assortments",
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
