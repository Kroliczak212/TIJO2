/**
 * Pet BMI / Body Condition Score Calculator
 *
 * Calculates Body Condition Score (BCS) for pets
 *
 * BCS Scale (1-9):
 * 1-3: Underweight (niedowaga)
 * 4-5: Ideal weight (idealna waga)
 * 6-7: Overweight (nadwaga)
 * 8-9: Obese (otyłość)
 *
 * @author Bartłomiej Król
 */

/**
 * BCS Categories
 */
const BCS_CATEGORY = {
  SEVERELY_UNDERWEIGHT: 'severely_underweight', // BCS 1
  UNDERWEIGHT: 'underweight',                   // BCS 2-3
  IDEAL: 'ideal',                               // BCS 4-5
  OVERWEIGHT: 'overweight',                     // BCS 6-7
  OBESE: 'obese'                                // BCS 8-9
};

/**
 * Default breed weights when breed is not found
 */
const DEFAULT_WEIGHTS = {
  dog: {
    small: { min: 3, ideal: 5, max: 8 },
    medium: { min: 10, ideal: 15, max: 20 },
    large: { min: 25, ideal: 32, max: 40 }
  },
  cat: {
    small: { min: 2.5, ideal: 3.5, max: 4.5 },
    medium: { min: 3.5, ideal: 4.5, max: 6 },
    large: { min: 5, ideal: 7, max: 9 }
  }
};

/**
 * Get BCS category from score
 * @param {number} bcs - Body Condition Score (1-9)
 * @returns {string} BCS category
 */
function getBcsCategory(bcs) {
  if (bcs === null || bcs === undefined) {
    return null;
  }

  if (bcs < 1 || bcs > 9) {
    return null;
  }

  if (bcs === 1) return BCS_CATEGORY.SEVERELY_UNDERWEIGHT;
  if (bcs <= 3) return BCS_CATEGORY.UNDERWEIGHT;
  if (bcs <= 5) return BCS_CATEGORY.IDEAL;
  if (bcs <= 7) return BCS_CATEGORY.OVERWEIGHT;
  return BCS_CATEGORY.OBESE;
}

/**
 * Get Polish description for BCS category
 * @param {string} category - BCS category
 * @returns {string} Polish description
 */
function getBcsCategoryDescription(category) {
  const descriptions = {
    [BCS_CATEGORY.SEVERELY_UNDERWEIGHT]: 'Poważna niedowaga',
    [BCS_CATEGORY.UNDERWEIGHT]: 'Niedowaga',
    [BCS_CATEGORY.IDEAL]: 'Idealna waga',
    [BCS_CATEGORY.OVERWEIGHT]: 'Nadwaga',
    [BCS_CATEGORY.OBESE]: 'Otyłość'
  };

  return descriptions[category] || 'Nieznana';
}

/**
 * Calculate Body Condition Score based on current weight vs ideal
 * @param {number} currentWeight - Current weight in kg
 * @param {number} idealWeight - Ideal weight for breed in kg
 * @returns {number} BCS score (1-9)
 */
function calculateBcsFromWeight(currentWeight, idealWeight) {
  if (!currentWeight || currentWeight <= 0 || !idealWeight || idealWeight <= 0) {
    return null;
  }

  const ratio = currentWeight / idealWeight;

  // Map ratio to BCS (1-9)
  // < 0.7 = 1 (severely underweight)
  // 0.7-0.8 = 2
  // 0.8-0.9 = 3
  // 0.9-0.95 = 4
  // 0.95-1.05 = 5 (ideal)
  // 1.05-1.15 = 6
  // 1.15-1.25 = 7
  // 1.25-1.4 = 8
  // > 1.4 = 9 (obese)

  if (ratio < 0.7) return 1;
  if (ratio < 0.8) return 2;
  if (ratio < 0.9) return 3;
  if (ratio < 0.95) return 4;
  if (ratio <= 1.05) return 5;
  if (ratio <= 1.15) return 6;
  if (ratio <= 1.25) return 7;
  if (ratio <= 1.4) return 8;
  return 9;
}

/**
 * Calculate weight difference from ideal
 * @param {number} currentWeight - Current weight in kg
 * @param {number} idealWeight - Ideal weight in kg
 * @returns {Object} Weight difference info
 */
function calculateWeightDifference(currentWeight, idealWeight) {
  if (!currentWeight || !idealWeight) {
    return null;
  }

  const difference = currentWeight - idealWeight;
  const percentDifference = (difference / idealWeight) * 100;

  return {
    absoluteDifference: Math.round(difference * 10) / 10,
    percentDifference: Math.round(percentDifference * 10) / 10,
    isOverweight: difference > 0,
    isUnderweight: difference < 0,
    targetWeight: idealWeight,
    weightToLose: difference > 0 ? Math.round(difference * 10) / 10 : 0,
    weightToGain: difference < 0 ? Math.round(Math.abs(difference) * 10) / 10 : 0
  };
}

/**
 * Get health recommendations based on BCS
 * @param {number} bcs - Body Condition Score
 * @param {string} species - Pet species
 * @returns {Object} Health recommendations
 */
function getHealthRecommendations(bcs, species = 'dog') {
  if (bcs === null || bcs === undefined || bcs < 1 || bcs > 9) {
    return {
      summary: 'Nie można określić zaleceń',
      diet: null,
      exercise: null,
      veterinaryAdvice: null
    };
  }

  const recommendations = {
    1: {
      summary: 'Wymagana natychmiastowa interwencja weterynaryjna',
      diet: 'Wysokokaloryczna dieta pod nadzorem weterynarza',
      exercise: 'Ograniczona aktywność do czasu przybrania masy',
      veterinaryAdvice: 'PILNE: Skonsultuj się z weterynarzem jak najszybciej',
      urgency: 'critical'
    },
    2: {
      summary: 'Niedowaga wymagająca uwagi',
      diet: 'Zwiększenie kaloryczności posiłków, częstsze karmienie',
      exercise: 'Umiarkowana aktywność',
      veterinaryAdvice: 'Zalecana konsultacja weterynaryjna',
      urgency: 'high'
    },
    3: {
      summary: 'Lekka niedowaga',
      diet: 'Rozważ zwiększenie porcji lub przejście na bardziej kaloryczną karmę',
      exercise: 'Normalna aktywność',
      veterinaryAdvice: 'Warto skonsultować przy kolejnej wizycie',
      urgency: 'medium'
    },
    4: {
      summary: 'Waga w dolnej granicy normy',
      diet: 'Kontynuuj obecną dietę, rozważ lekkie zwiększenie porcji',
      exercise: 'Normalna aktywność fizyczna',
      veterinaryAdvice: 'Brak specjalnych zaleceń',
      urgency: 'low'
    },
    5: {
      summary: 'Idealna waga - gratulacje!',
      diet: 'Kontynuuj obecną dietę',
      exercise: 'Utrzymuj regularną aktywność fizyczną',
      veterinaryAdvice: 'Regularne kontrole profilaktyczne',
      urgency: 'none'
    },
    6: {
      summary: 'Lekka nadwaga',
      diet: 'Zmniejsz porcje o 10-15%, ogranicz przekąski',
      exercise: 'Zwiększ aktywność o 15-20 minut dziennie',
      veterinaryAdvice: 'Warto skonsultować przy kolejnej wizycie',
      urgency: 'low'
    },
    7: {
      summary: 'Nadwaga wymagająca działania',
      diet: 'Zmniejsz porcje o 15-20%, przejdź na karmę light',
      exercise: 'Zwiększ aktywność o 20-30 minut dziennie',
      veterinaryAdvice: 'Zalecana konsultacja dietetyczna',
      urgency: 'medium'
    },
    8: {
      summary: 'Otyłość - ryzyko zdrowotne',
      diet: 'Dieta redukcyjna pod nadzorem weterynarza',
      exercise: 'Stopniowe zwiększanie aktywności (unikaj nadmiernego wysiłku)',
      veterinaryAdvice: 'Wymagana konsultacja weterynaryjna',
      urgency: 'high'
    },
    9: {
      summary: 'Poważna otyłość - zagrożenie zdrowia',
      diet: 'PILNE: Dieta redukcyjna pod ścisłym nadzorem weterynarza',
      exercise: 'Lekka aktywność, stopniowo zwiększana',
      veterinaryAdvice: 'PILNE: Skonsultuj się z weterynarzem jak najszybciej',
      urgency: 'critical'
    }
  };

  return recommendations[bcs];
}

/**
 * Calculate complete BMI/BCS info for a pet
 * @param {string} species - Pet species (dog/cat)
 * @param {string} breed - Pet breed
 * @param {number} currentWeight - Current weight in kg
 * @param {Object} breedData - Breed weight data (optional, from database)
 * @returns {Object} Complete BCS info
 */
function calculatePetBcs(species, breed, currentWeight, breedData = null) {
  // Validate inputs
  if (!species || !currentWeight || currentWeight <= 0) {
    return {
      success: false,
      error: 'Nieprawidłowe dane wejściowe'
    };
  }

  // Get ideal weight
  let idealWeight;
  let weightRange;

  if (breedData) {
    idealWeight = breedData.ideal_weight;
    weightRange = {
      min: breedData.min_weight,
      ideal: breedData.ideal_weight,
      max: breedData.max_weight
    };
  } else {
    // Use defaults based on current weight to estimate size category
    const sizeCategory = estimateSizeCategory(species, currentWeight);
    const defaults = DEFAULT_WEIGHTS[species]?.[sizeCategory] || DEFAULT_WEIGHTS.dog.medium;
    idealWeight = defaults.ideal;
    weightRange = defaults;
  }

  // Calculate BCS
  const bcs = calculateBcsFromWeight(currentWeight, idealWeight);
  const category = getBcsCategory(bcs);

  // Calculate weight difference
  const weightDiff = calculateWeightDifference(currentWeight, idealWeight);

  // Get recommendations
  const recommendations = getHealthRecommendations(bcs, species);

  return {
    success: true,
    species,
    breed: breed || 'Nieznana',
    currentWeight,
    idealWeight,
    weightRange,
    bcs,
    category,
    categoryDescription: getBcsCategoryDescription(category),
    weightDifference: weightDiff,
    recommendations
  };
}

/**
 * Estimate size category based on current weight
 * @param {string} species - Pet species
 * @param {number} weight - Current weight in kg
 * @returns {string} Size category (small/medium/large)
 */
function estimateSizeCategory(species, weight) {
  if (species === 'cat') {
    if (weight < 3.5) return 'small';
    if (weight < 6) return 'medium';
    return 'large';
  }

  // Default: dog
  if (weight < 10) return 'small';
  if (weight < 25) return 'medium';
  return 'large';
}

/**
 * Calculate target weight for desired BCS
 * @param {number} currentWeight - Current weight in kg
 * @param {number} idealWeight - Ideal weight in kg
 * @param {number} targetBcs - Target BCS (default: 5)
 * @returns {number} Target weight in kg
 */
function calculateTargetWeight(currentWeight, idealWeight, targetBcs = 5) {
  if (!idealWeight || idealWeight <= 0) {
    return null;
  }

  // BCS 5 = ratio of 1.0
  // Each BCS point = approximately 10% difference
  const targetRatio = 1 + (targetBcs - 5) * 0.1;

  return Math.round(idealWeight * targetRatio * 10) / 10;
}

/**
 * Estimate time to reach target weight
 * @param {number} currentWeight - Current weight in kg
 * @param {number} targetWeight - Target weight in kg
 * @param {string} species - Pet species
 * @returns {Object} Time estimate
 */
function estimateWeightChangeTime(currentWeight, targetWeight, species = 'dog') {
  if (!currentWeight || !targetWeight) {
    return null;
  }

  const difference = Math.abs(targetWeight - currentWeight);
  const isLosingWeight = currentWeight > targetWeight;

  // Safe weight change rate: 1-2% per week for weight loss
  // Weight gain: 0.5-1% per week
  const weeklyRate = isLosingWeight
    ? currentWeight * 0.015 // 1.5% per week for loss
    : currentWeight * 0.0075; // 0.75% per week for gain

  const weeksNeeded = Math.ceil(difference / weeklyRate);

  return {
    currentWeight,
    targetWeight,
    difference: Math.round(difference * 10) / 10,
    isLosingWeight,
    weeksNeeded,
    monthsNeeded: Math.ceil(weeksNeeded / 4),
    safeWeeklyChange: Math.round(weeklyRate * 100) / 100
  };
}

module.exports = {
  BCS_CATEGORY,
  DEFAULT_WEIGHTS,
  getBcsCategory,
  getBcsCategoryDescription,
  calculateBcsFromWeight,
  calculateWeightDifference,
  getHealthRecommendations,
  calculatePetBcs,
  estimateSizeCategory,
  calculateTargetWeight,
  estimateWeightChangeTime
};
