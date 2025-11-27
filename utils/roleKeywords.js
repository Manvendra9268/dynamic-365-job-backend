/**
 * ROLE KEYWORD DICTIONARIES (Balanced Strictness)
 * ------------------------------------------------------------
 * - Clean, non-overlapping keyword sets
 * - Strong → Medium signals only (no weak/noisy matches)
 * - Fully aligned with FieldMapping.pdf priority rules
 * - Optimized for detectRoles() using title → ai_keywords → secondary → fallback
 * - Case-insensitive matching
 */

module.exports = {
  // ------------------------------------------------------------
  // 1. DEVELOPER
  // ------------------------------------------------------------
  developer: [
    "developer",
    "software developer",
    "software engineer",
    "d365 developer",
    "dynamics developer",
    "ce developer",
    "crm developer",
    "fo developer",
    "f&o developer",
    "ax developer",
    "x++ developer",
    "xpp developer",
    "bc developer",
    "business central developer",
    "al developer",
    "power apps developer",
    "powerapps developer",
    "power automate developer",
    "frontend developer",
    "backend developer",
    "full stack developer",
    "integration developer",
    "azure developer",
    "logic apps developer",
  ],

  // ------------------------------------------------------------
  // 2. TECHNICAL CONSULTANT
  // ------------------------------------------------------------
  technicalConsultant: [
    "technical consultant",
    "d365 technical consultant",
    "crm technical consultant",
    "ce technical consultant",
    "fo technical consultant",
    "f&o technical consultant",
    "ax technical consultant",
    "integration consultant",
    "technical implementation consultant",
    "technical solution consultant",
  ],

  // ------------------------------------------------------------
  // 3. FUNCTIONAL CONSULTANT
  // ------------------------------------------------------------
  functionalConsultant: [
    "functional consultant",
    "fo functional consultant",
    "f&o functional consultant",
    "d365 functional consultant",
    "crm functional consultant",
    "ce functional consultant",
    "bc functional consultant",
    "business central functional consultant",
    "ax functional consultant",
    "erp functional consultant",
    "business process consultant",
  ],

  // ------------------------------------------------------------
  // 4. SOLUTION ARCHITECT
  // ------------------------------------------------------------
  solutionArchitect: [
    "solution architect",
    "solutions architect",
    "d365 architect",
    "crm architect",
    "ce architect",
    "fo architect",
    "f&o architect",
    "bc architect",
    "business central architect",
    "enterprise architect",
    "lead architect",
  ],

  // ------------------------------------------------------------
  // 5. TECHNICAL ARCHITECT
  // ------------------------------------------------------------
  technicalArchitect: [
    "technical architect",
    "d365 technical architect",
    "crm technical architect",
    "fo technical architect",
    "f&o technical architect",
    "integration architect",
    "azure architect",
  ],

  // ------------------------------------------------------------
  // 6. PROJECT MANAGER
  // ------------------------------------------------------------
  projectManager: [
    "project manager",
    "it project manager",
    "d365 project manager",
    "delivery manager",
    "implementation manager",
    "project lead",
    "scrum master",
    "agile project manager",
  ],

  // ------------------------------------------------------------
  // 7. PROGRAM MANAGER
  // ------------------------------------------------------------
  programManager: [
    "program manager",
    "senior program manager",
    "portfolio manager",
    "engagement manager",
  ],

  // ------------------------------------------------------------
  // 8. BUSINESS ANALYST
  // ------------------------------------------------------------
  businessAnalyst: [
    "business analyst",
    "d365 business analyst",
    "crm business analyst",
    "ce business analyst",
    "systems analyst",
    "requirements analyst",
    "functional analyst",      // Balanced → safe
    "product analyst",
  ],

  // ------------------------------------------------------------
  // 9. QA / TESTER
  // ------------------------------------------------------------
  qaTester: [
    "qa tester",
    "quality analyst",
    "test engineer",
    "qa engineer",
    "manual tester",
    "automation tester",
    "test analyst",
  ],

  // ------------------------------------------------------------
  // 10. SUPPORT ENGINEER
  // ------------------------------------------------------------
  supportEngineer: [
    "support engineer",
    "technical support engineer",
    "application support",
    "crm support engineer",
    "d365 support engineer",
    "it support engineer",
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
  // 12. DATA ENGINEER
  // ------------------------------------------------------------
  dataEngineer: [
    "data engineer",
    "data consultant",
    "etl engineer",
    "data migration engineer",
    "azure data engineer",
    "data pipelines",
  ],

  // ------------------------------------------------------------
  // 13. INTEGRATION ENGINEER
  // ------------------------------------------------------------
  integrationEngineer: [
    "integration engineer",
    "integration specialist",
    "api integration",
    "integration lead",
    "logic apps engineer",
    "service bus engineer",
    "integration developer",
  ],
};
