const path = require('path');
const fs = require('fs');

const STANDARDS_DIR = path.join(__dirname, '../standards');

// Grade band normalization: maps individual grades to their band(s)
const GRADE_BANDS = {
  '6': ['6-8', '6'],
  '7': ['6-8', '7'],
  '8': ['6-8', '8'],
  '9': ['9-10', '9-12', '9'],
  '10': ['9-10', '9-12', '10'],
  '11': ['11-12', '9-12', '11'],
  '12': ['11-12', '9-12', '12'],
};

// Cache loaded standards files
const cache = new Map();

function loadStandardsFile(type) {
  if (cache.has(type)) return cache.get(type);

  const filePath = path.join(STANDARDS_DIR, `${type}.json`);
  if (!fs.existsSync(filePath)) return null;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  cache.set(type, data);
  return data;
}

function gradeMatches(standardGrade, queryGrade) {
  if (!queryGrade) return true;
  if (standardGrade === queryGrade) return true;

  // Check grade bands
  const bands = GRADE_BANDS[queryGrade] || [];
  return bands.some((band) => standardGrade === band);
}

/**
 * Query standards with optional filters.
 * @param {object} options
 * @param {string} [options.type]  - standards type key (e.g. 'ccss-ela')
 * @param {string} [options.grade] - grade level (K, 1-12)
 * @param {string} [options.q]     - fuzzy search string (matches code + description)
 */
function queryStandards({ type, grade, q } = {}) {
  const validTypes = ['ccss-ela', 'ccss-math', 'ngss', 'hss', 'vapa', 'pe', 'cte'];
  const typesToSearch = type && validTypes.includes(type) ? [type] : validTypes;

  const results = [];

  for (const t of typesToSearch) {
    const data = loadStandardsFile(t);
    if (!data) continue;

    for (const standard of data.standards) {
      if (!gradeMatches(standard.grade, grade)) continue;

      if (q) {
        const needle = q.toLowerCase();
        const inCode = standard.code.toLowerCase().includes(needle);
        const inDesc = standard.description.toLowerCase().includes(needle);
        const inDomain = standard.domain.toLowerCase().includes(needle);
        if (!inCode && !inDesc && !inDomain) continue;
      }

      results.push({
        ...standard,
        standards_type: t,
        standards_type_name: data.name,
      });
    }
  }

  // Sort: exact code prefix matches first, then alphabetical by code
  if (q) {
    const needle = q.toLowerCase();
    results.sort((a, b) => {
      const aCode = a.code.toLowerCase().startsWith(needle) ? 0 : 1;
      const bCode = b.code.toLowerCase().startsWith(needle) ? 0 : 1;
      return aCode - bCode || a.code.localeCompare(b.code);
    });
  }

  return results;
}

/**
 * Look up a single standard by exact code (case-insensitive).
 */
function getStandardByCode(code) {
  const validTypes = ['ccss-ela', 'ccss-math', 'ngss', 'hss', 'vapa', 'pe', 'cte'];
  const normalized = code.trim().toUpperCase();

  for (const t of validTypes) {
    const data = loadStandardsFile(t);
    if (!data) continue;

    const found = data.standards.find(
      (s) => s.code.toUpperCase() === normalized
    );
    if (found) return { ...found, standards_type: t, standards_type_name: data.name };
  }
  return null;
}

/**
 * Get all available standards types with metadata.
 */
function getStandardsTypes() {
  return [
    { key: 'ccss-ela', label: 'CCSS English Language Arts', grades: 'K-12' },
    { key: 'ccss-math', label: 'CCSS Mathematics', grades: 'K-12' },
    { key: 'ngss', label: 'Next Generation Science Standards', grades: 'K-12' },
    { key: 'hss', label: 'CA History-Social Science Framework', grades: 'K-12' },
    { key: 'vapa', label: 'Visual & Performing Arts', grades: 'K-12' },
    { key: 'pe', label: 'California PE Standards', grades: 'K-12' },
    { key: 'cte', label: 'CTE Pathways', grades: '9-12' },
  ];
}

module.exports = { queryStandards, getStandardByCode, getStandardsTypes };
