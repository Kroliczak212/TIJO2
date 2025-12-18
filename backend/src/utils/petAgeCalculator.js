/**
 * Pet Age Calculator
 *
 * Calculates pet age in "human years" based on species and size
 *
 * DOG aging (varies by size):
 * - Small (<10kg): First year = 15, second = 9, then 4 per year
 * - Medium (10-25kg): First year = 15, second = 9, then 5 per year
 * - Large (>25kg): First year = 15, second = 9, then 6 per year
 *
 * CAT aging:
 * - First year = 15 human years
 * - Second year = +9 (total 24)
 * - Each year after = +4
 *
 * @author Bartłomiej Król
 */

/**
 * Size categories for dogs based on weight
 */
const DOG_SIZE = {
  SMALL: 'small',       // < 10 kg
  MEDIUM: 'medium',     // 10-25 kg
  LARGE: 'large'        // > 25 kg
};

/**
 * Life stages for pets
 */
const LIFE_STAGE = {
  PUPPY: 'puppy',       // Young
  JUNIOR: 'junior',     // Adolescent
  ADULT: 'adult',       // Adult
  SENIOR: 'senior',     // Senior
  GERIATRIC: 'geriatric' // Very old
};

/**
 * Determine dog size category based on weight
 * @param {number} weight - Weight in kg
 * @returns {string} Size category
 */
function getDogSizeCategory(weight) {
  if (weight === null || weight === undefined) {
    return DOG_SIZE.MEDIUM; // Default
  }

  if (weight < 10) {
    return DOG_SIZE.SMALL;
  } else if (weight <= 25) {
    return DOG_SIZE.MEDIUM;
  } else {
    return DOG_SIZE.LARGE;
  }
}

/**
 * Calculate age in years from date of birth
 * @param {Date|string} dateOfBirth - Date of birth
 * @returns {number} Age in years (with decimals)
 */
function calculateAgeInYears(dateOfBirth) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);
  const now = new Date();

  if (isNaN(birthDate.getTime())) {
    return null;
  }

  const diffMs = now.getTime() - birthDate.getTime();
  const ageInYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  return Math.max(0, ageInYears);
}

/**
 * Calculate dog age in human years
 * @param {number} ageInYears - Dog's actual age in years
 * @param {string} sizeCategory - Size category (small/medium/large)
 * @returns {number} Age in human years
 */
function calculateDogHumanAge(ageInYears, sizeCategory = DOG_SIZE.MEDIUM) {
  if (ageInYears === null || ageInYears === undefined || ageInYears < 0) {
    return null;
  }

  if (ageInYears === 0) {
    return 0;
  }

  // Yearly increment after first 2 years based on size
  const yearlyIncrement = {
    [DOG_SIZE.SMALL]: 4,
    [DOG_SIZE.MEDIUM]: 5,
    [DOG_SIZE.LARGE]: 6
  };

  let humanAge = 0;

  if (ageInYears <= 1) {
    // First year: 0-1 dog year = 0-15 human years
    humanAge = ageInYears * 15;
  } else if (ageInYears <= 2) {
    // Second year: 1-2 dog years = 15-24 human years
    humanAge = 15 + (ageInYears - 1) * 9;
  } else {
    // After 2 years: base 24 + increment per year
    humanAge = 24 + (ageInYears - 2) * yearlyIncrement[sizeCategory];
  }

  return Math.round(humanAge * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate cat age in human years
 * @param {number} ageInYears - Cat's actual age in years
 * @returns {number} Age in human years
 */
function calculateCatHumanAge(ageInYears) {
  if (ageInYears === null || ageInYears === undefined || ageInYears < 0) {
    return null;
  }

  if (ageInYears === 0) {
    return 0;
  }

  let humanAge = 0;

  if (ageInYears <= 1) {
    // First year: 0-1 cat year = 0-15 human years
    humanAge = ageInYears * 15;
  } else if (ageInYears <= 2) {
    // Second year: 1-2 cat years = 15-24 human years
    humanAge = 15 + (ageInYears - 1) * 9;
  } else {
    // After 2 years: base 24 + 4 per year
    humanAge = 24 + (ageInYears - 2) * 4;
  }

  return Math.round(humanAge * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate human age for any pet
 * @param {string} species - Species (dog/cat)
 * @param {number} ageInYears - Pet's actual age in years
 * @param {number|null} weight - Weight in kg (for dogs)
 * @returns {number|null} Age in human years
 */
function calculateHumanAge(species, ageInYears, weight = null) {
  if (species === 'dog') {
    const sizeCategory = getDogSizeCategory(weight);
    return calculateDogHumanAge(ageInYears, sizeCategory);
  } else if (species === 'cat') {
    return calculateCatHumanAge(ageInYears);
  }

  // For other species, simple approximation
  return ageInYears * 7;
}

/**
 * Get life stage of a pet
 * @param {string} species - Species (dog/cat)
 * @param {number} ageInYears - Pet's actual age in years
 * @param {string|null} sizeCategory - Size category for dogs
 * @returns {string} Life stage
 */
function getLifeStage(species, ageInYears, sizeCategory = null) {
  if (ageInYears === null || ageInYears === undefined) {
    return null;
  }

  if (species === 'dog') {
    // Dog life stages vary by size
    const seniorAge = sizeCategory === DOG_SIZE.LARGE ? 6 : (sizeCategory === DOG_SIZE.SMALL ? 10 : 8);
    const geriatricAge = sizeCategory === DOG_SIZE.LARGE ? 10 : (sizeCategory === DOG_SIZE.SMALL ? 14 : 12);

    if (ageInYears < 0.5) return LIFE_STAGE.PUPPY;
    if (ageInYears < 2) return LIFE_STAGE.JUNIOR;
    if (ageInYears < seniorAge) return LIFE_STAGE.ADULT;
    if (ageInYears < geriatricAge) return LIFE_STAGE.SENIOR;
    return LIFE_STAGE.GERIATRIC;
  }

  if (species === 'cat') {
    if (ageInYears < 0.5) return LIFE_STAGE.PUPPY; // Kitten
    if (ageInYears < 2) return LIFE_STAGE.JUNIOR;
    if (ageInYears < 10) return LIFE_STAGE.ADULT;
    if (ageInYears < 15) return LIFE_STAGE.SENIOR;
    return LIFE_STAGE.GERIATRIC;
  }

  // Default for other species
  if (ageInYears < 1) return LIFE_STAGE.PUPPY;
  if (ageInYears < 3) return LIFE_STAGE.ADULT;
  return LIFE_STAGE.SENIOR;
}

/**
 * Get life stage description in Polish
 * @param {string} lifeStage - Life stage constant
 * @param {string} species - Species for proper naming
 * @returns {string} Polish description
 */
function getLifeStageDescription(lifeStage, species = 'dog') {
  const descriptions = {
    [LIFE_STAGE.PUPPY]: species === 'cat' ? 'Kocię' : 'Szczenię',
    [LIFE_STAGE.JUNIOR]: 'Młody',
    [LIFE_STAGE.ADULT]: 'Dorosły',
    [LIFE_STAGE.SENIOR]: 'Senior',
    [LIFE_STAGE.GERIATRIC]: 'Wiek podeszły'
  };

  return descriptions[lifeStage] || 'Nieznany';
}

/**
 * Get complete pet age information
 * @param {string} species - Species (dog/cat)
 * @param {Date|string} dateOfBirth - Date of birth
 * @param {number|null} weight - Weight in kg
 * @returns {Object} Complete age info
 */
function getPetAgeInfo(species, dateOfBirth, weight = null) {
  const ageInYears = calculateAgeInYears(dateOfBirth);

  if (ageInYears === null) {
    return {
      years: null,
      months: null,
      humanYears: null,
      ageInYears: null,
      humanAge: null,
      lifeStage: null,
      lifeStageDescription: null,
      sizeCategory: null
    };
  }

  const sizeCategory = species === 'dog' ? getDogSizeCategory(weight) : null;
  const humanAge = calculateHumanAge(species, ageInYears, weight);
  const lifeStage = getLifeStage(species, ageInYears, sizeCategory);

  const years = Math.floor(ageInYears);
  const months = Math.round((ageInYears - years) * 12);

  return {
    years,
    months,
    humanYears: Math.round(humanAge),
    ageInYears: Math.round(ageInYears * 10) / 10,
    humanAge,
    lifeStage,
    lifeStageDescription: getLifeStageDescription(lifeStage, species),
    sizeCategory
  };
}

module.exports = {
  DOG_SIZE,
  LIFE_STAGE,
  getDogSizeCategory,
  calculateAgeInYears,
  calculateDogHumanAge,
  calculateCatHumanAge,
  calculateHumanAge,
  getLifeStage,
  getLifeStageDescription,
  getPetAgeInfo
};
