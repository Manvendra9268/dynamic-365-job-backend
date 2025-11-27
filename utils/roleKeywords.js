/**
 * ROLE KEYWORD DICTIONARIES
 * ------------------------------------------------------------
 * This dictionary is used by detectRoles() inside the transform engine.
 * It contains ALL major Dynamics 365 / Power Platform role categories
 * from the PDF + additional real-world synonyms commonly found in job posts.
 *
 * Matching is ALWAYS case-insensitive.
 *
 * IMPORTANT:
 * - Keep keywords lowercased.
 * - Avoid duplicates (performance).
 * - Add only STRONG indicators (not weak or vague words).
 */

module.exports = {
  // ------------------------------------------------------------
  // 1. DEVELOPER
  // ------------------------------------------------------------
  developer: [
    "developer",
    "software engineer",
    "development engineer",
    "programmer",
    "backend developer",
    "backend engineer",
    "frontend developer",
    "full stack developer",
    "full-stack developer",
    "application developer",
    "technical developer",
    "integration developer",
    "d365 developer",
    "dynamics developer",
    "ax developer",
    "ax 2012 developer",
    "ax2012",
    "x++ developer",
    "xpp developer",
    "plugin developer",
    "power apps developer",
    "power automate developer",
    "customization engineer",
    "customization developer",
    "customizations",
    "extensions developer",
    "javascript developer",
    "react developer",
    "typescript developer",
    "logic apps developer",
    "azure functions developer",
    "web developer",
    "api developer",
    "crm developer",
    "ce developer",
    "f&o developer",
    "finance & operations developer",
    "business central developer",
    "bc developer",
    "al developer",
    "extensions developer",
    "solution developer",
    "technical engineer",
  ],

  // ------------------------------------------------------------
  // 2. TECHNICAL CONSULTANT
  // ------------------------------------------------------------
  technicalConsultant: [
    "technical consultant",
    "tech consultant",
    "technical specialist",
    "d365 technical",
    "dynamics technical",
    "crm technical consultant",
    "ce technical consultant",
    "f&o technical consultant",
    "fo technical consultant",
    "finance & operations technical consultant",
    "ax technical consultant",
    "integration consultant",
    "solution technical consultant",
    "implementation technical consultant",
    "technical lead consultant",
    "technical implementation engineer",
  ],

  // ------------------------------------------------------------
  // 3. FUNCTIONAL CONSULTANT
  // ------------------------------------------------------------
  functionalConsultant: [
    "functional consultant",
    "functional specialist",
    "d365 functional",
    "dynamics functional",
    "crm functional consultant",
    "ce functional consultant",
    "fo functional consultant",
    "f&o functional consultant",
    "finance & operations functional consultant",
    "business central functional consultant",
    "bc functional consultant",
    "ax functional consultant",
    "erp functional consultant",
    "business process consultant",
    "business systems consultant",
    "functional analyst",
    "functional lead",
    "solution functional consultant",
    "implementation consultant",
    "requirements gathering",
    "gap-fit consultant",
  ],

  // ------------------------------------------------------------
  // 4. SOLUTION ARCHITECT
  // ------------------------------------------------------------
  solutionArchitect: [
    "solution architect",
    "solutions architect",
    "d365 architect",
    "dynamics architect",
    "crm architect",
    "f&o architect",
    "fo architect",
    "ce architect",
    "enterprise architect",
    "technical architect",
    "lead architect",
    "azure architect",
    "cloud architect",
    "integration architect",
  ],

  // ------------------------------------------------------------
  // 5. TECHNICAL ARCHITECT
  // ------------------------------------------------------------
  technicalArchitect: [
    "technical architect",
    "lead technical architect",
    "d365 technical architect",
    "crm technical architect",
    "ce technical architect",
    "ax technical architect",
    "f&o technical architect",
    "integration architect",
    "azure solutions architect",
    "azure integration architect",
  ],

  // ------------------------------------------------------------
  // 6. PROJECT MANAGER
  // ------------------------------------------------------------
  projectManager: [
    "project manager",
    "it project manager",
    "program manager",
    "scrum master",
    "delivery manager",
    "implementation manager",
    "project lead",
    "agile project manager",
    "technical project manager",
    "project coordinator",
    "engagement manager",
  ],

  // ------------------------------------------------------------
  // 7. PROGRAM MANAGER
  // ------------------------------------------------------------
  programManager: [
    "program manager",
    "senior program manager",
    "delivery manager",
    "portfolio manager",
    "engagement manager",
  ],

  // ------------------------------------------------------------
  // 8. BUSINESS ANALYST
  // ------------------------------------------------------------
  businessAnalyst: [
    "business analyst",
    "ba",
    "crm business analyst",
    "d365 business analyst",
    "functional analyst",
    "requirements analyst",
    "systems analyst",
    "product analyst",
    "process analyst",
  ],

  // ------------------------------------------------------------
  // 9. QA / TESTER
  // ------------------------------------------------------------
  qaTester: [
    "qa tester",
    "quality analyst",
    "test engineer",
    "automation tester",
    "manual tester",
    "qa engineer",
    "test analyst",
    "test automation engineer",
  ],

  // ------------------------------------------------------------
  // 10. SUPPORT ENGINEER
  // ------------------------------------------------------------
  supportEngineer: [
    "support engineer",
    "technical support engineer",
    "application support",
    "l1 support",
    "l2 support",
    "l3 support",
    "crm support engineer",
    "d365 support engineer",
    "helpdesk engineer",
  ],

  // ------------------------------------------------------------
  // 11. PRE-SALES / SOLUTION CONSULTANT
  // ------------------------------------------------------------
  preSales: [
    "pre sales",
    "pre-sales",
    "presales",
    "solution consultant",
    "solution advisor",
    "sales engineer",
    "demo specialist",
    "product specialist",
  ],

  // ------------------------------------------------------------
  // 12. DATA / INTEGRATION ENGINEER
  // ------------------------------------------------------------
  dataEngineer: [
    "data engineer",
    "data specialist",
    "data consultant",
    "etl developer",
    "pipeline engineer",
    "azure data engineer",
    "data warehousing",
    "data migration",
  ],

  integrationEngineer: [
    "integration engineer",
    "integration specialist",
    "integration developer",
    "azure integration",
    "logic apps",
    "service bus",
    "dataflows",
    "api integration",
  ],
};
