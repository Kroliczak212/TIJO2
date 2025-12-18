/**
 * Medication Dosage Calculator
 *
 * Calculates medication dosage based on pet weight
 *
 * Features:
 * - Dose calculation based on weight (mg/kg)
 * - Maximum dose validation
 * - Minimum weight validation
 * - Species compatibility check
 * - Rounding to practical values
 * - Warning generation
 *
 * @author Bartłomiej Król
 */

/**
 * Dosage warning levels
 */
const WARNING_LEVEL = {
  INFO: 'info',
  WARNING: 'warning',
  DANGER: 'danger'
};

/**
 * Calculate medication dose
 * @param {Object} medication - Medication info
 * @param {number} weight - Pet weight in kg
 * @param {string} species - Pet species
 * @returns {Object} Dosage calculation result
 */
function calculateDose(medication, weight, species = 'all') {
  // Validate inputs
  if (!medication) {
    return {
      success: false,
      error: 'Nie podano informacji o leku'
    };
  }

  if (!weight || weight <= 0) {
    return {
      success: false,
      error: 'Nieprawidłowa waga zwierzęcia'
    };
  }

  // Check species compatibility
  if (medication.species && medication.species !== 'all' && medication.species !== species) {
    return {
      success: false,
      error: `Lek ${medication.name} nie jest przeznaczony dla gatunku: ${species}`
    };
  }

  // Check minimum weight
  if (medication.min_weight && weight < medication.min_weight) {
    return {
      success: false,
      error: `Minimalna waga dla leku ${medication.name} to ${medication.min_weight} kg`
    };
  }

  // Calculate base dose
  const baseDose = weight * medication.dose_per_kg;

  // Check maximum dose
  const warnings = [];
  let finalDose = baseDose;
  let wasLimited = false;

  if (medication.max_dose && baseDose > medication.max_dose) {
    finalDose = medication.max_dose;
    wasLimited = true;
    warnings.push({
      level: WARNING_LEVEL.WARNING,
      message: `Dawka ograniczona do maksymalnej: ${medication.max_dose} ${medication.unit}`
    });
  }

  // Round dose to practical value
  const roundedDose = roundDose(finalDose, medication.unit);

  // Add info warnings
  if (weight < 5) {
    warnings.push({
      level: WARNING_LEVEL.INFO,
      message: 'Małe zwierzę - zalecana szczególna ostrożność przy dawkowaniu'
    });
  }

  return {
    success: true,
    medication: medication.name,
    petWeight: weight,
    calculatedDose: Math.round(baseDose * 100) / 100,
    finalDose: roundedDose,
    unit: medication.unit,
    wasLimited,
    warnings,
    formula: `${weight} kg × ${medication.dose_per_kg} ${medication.unit}/kg = ${baseDose.toFixed(2)} ${medication.unit}`
  };
}

/**
 * Round dose to practical value
 * @param {number} dose - Calculated dose
 * @param {string} unit - Dose unit
 * @returns {number} Rounded dose
 */
function roundDose(dose, unit = 'mg') {
  if (dose <= 0) return 0;

  // Different rounding based on unit
  if (unit === 'mg') {
    if (dose < 1) {
      // Round to 0.1 mg
      return Math.round(dose * 10) / 10;
    } else if (dose < 10) {
      // Round to 0.5 mg
      return Math.round(dose * 2) / 2;
    } else if (dose < 100) {
      // Round to 5 mg
      return Math.round(dose / 5) * 5;
    } else {
      // Round to 10 mg
      return Math.round(dose / 10) * 10;
    }
  }

  if (unit === 'ml') {
    if (dose < 1) {
      return Math.round(dose * 10) / 10;
    } else {
      return Math.round(dose * 2) / 2;
    }
  }

  // Default: round to 2 decimal places
  return Math.round(dose * 100) / 100;
}

/**
 * Calculate number of tablets needed
 * @param {number} dose - Required dose in mg
 * @param {number} tabletStrength - Strength of one tablet in mg
 * @returns {Object} Tablet calculation result
 */
function calculateTablets(dose, tabletStrength) {
  if (!dose || dose <= 0) {
    return {
      success: false,
      error: 'Nieprawidłowa dawka'
    };
  }

  if (!tabletStrength || tabletStrength <= 0) {
    return {
      success: false,
      error: 'Nieprawidłowa moc tabletki'
    };
  }

  const exactTablets = dose / tabletStrength;
  const roundedTablets = Math.round(exactTablets * 2) / 2; // Round to 0.5

  const warnings = [];
  const difference = Math.abs(roundedTablets - exactTablets) / exactTablets * 100;

  if (difference > 10) {
    warnings.push({
      level: WARNING_LEVEL.WARNING,
      message: `Zaokrąglenie różni się o ${difference.toFixed(1)}% od obliczonej dawki`
    });
  }

  return {
    success: true,
    requiredDose: dose,
    tabletStrength,
    exactTablets: Math.round(exactTablets * 100) / 100,
    recommendedTablets: roundedTablets,
    actualDose: roundedTablets * tabletStrength,
    warnings
  };
}

/**
 * Validate if dose is within safe range
 * @param {number} dose - Calculated dose
 * @param {Object} medication - Medication info
 * @param {number} weight - Pet weight
 * @returns {Object} Validation result
 */
function validateDosage(dose, medication, weight) {
  const issues = [];

  if (dose <= 0) {
    issues.push({
      level: WARNING_LEVEL.DANGER,
      message: 'Dawka musi być większa od 0'
    });
  }

  if (medication.max_dose && dose > medication.max_dose) {
    issues.push({
      level: WARNING_LEVEL.DANGER,
      message: `Dawka przekracza maksymalną dozwoloną: ${medication.max_dose} ${medication.unit}`
    });
  }

  // Check if dose per kg is unusually high (more than 1.5x standard)
  const dosePerKg = dose / weight;
  if (dosePerKg > medication.dose_per_kg * 1.5) {
    issues.push({
      level: WARNING_LEVEL.WARNING,
      message: 'Dawka na kg masy ciała jest wyższa niż zalecana'
    });
  }

  // Check if dose per kg is unusually low (less than 0.5x standard)
  if (dosePerKg < medication.dose_per_kg * 0.5) {
    issues.push({
      level: WARNING_LEVEL.INFO,
      message: 'Dawka na kg masy ciała jest niższa niż standardowa'
    });
  }

  return {
    isValid: issues.filter(i => i.level === WARNING_LEVEL.DANGER).length === 0,
    issues
  };
}

/**
 * Get dosage warnings based on pet and medication
 * @param {Object} medication - Medication info
 * @param {number} weight - Pet weight
 * @param {string} species - Pet species
 * @param {number} age - Pet age in years (optional)
 * @returns {Array} List of warnings
 */
function getDosageWarnings(medication, weight, species, age = null) {
  const warnings = [];

  // Weight-based warnings
  if (weight < 2) {
    warnings.push({
      level: WARNING_LEVEL.WARNING,
      message: 'Bardzo małe zwierzę - wymagana szczególna ostrożność'
    });
  }

  if (weight > 50) {
    warnings.push({
      level: WARNING_LEVEL.INFO,
      message: 'Duże zwierzę - sprawdź czy dawka nie przekracza maksymalnej'
    });
  }

  // Age-based warnings
  if (age !== null) {
    if (age < 0.5) {
      warnings.push({
        level: WARNING_LEVEL.WARNING,
        message: 'Młode zwierzę - niektóre leki mogą być przeciwwskazane'
      });
    }

    if (species === 'dog' && age > 10) {
      warnings.push({
        level: WARNING_LEVEL.INFO,
        message: 'Senior - rozważ dostosowanie dawki dla starszego zwierzęcia'
      });
    }

    if (species === 'cat' && age > 12) {
      warnings.push({
        level: WARNING_LEVEL.INFO,
        message: 'Senior - rozważ dostosowanie dawki dla starszego kota'
      });
    }
  }

  // Medication-specific warnings
  if (medication.notes) {
    warnings.push({
      level: WARNING_LEVEL.INFO,
      message: medication.notes
    });
  }

  return warnings;
}

/**
 * Calculate daily dosing schedule
 * @param {number} totalDailyDose - Total daily dose in mg
 * @param {number} frequency - Times per day
 * @returns {Object} Dosing schedule
 */
function calculateDosingSchedule(totalDailyDose, frequency) {
  if (!totalDailyDose || totalDailyDose <= 0) {
    return {
      success: false,
      error: 'Nieprawidłowa dawka dzienna'
    };
  }

  if (!frequency || frequency <= 0 || frequency > 6) {
    return {
      success: false,
      error: 'Częstotliwość musi być między 1 a 6 razy dziennie'
    };
  }

  const dosePerAdministration = totalDailyDose / frequency;
  const roundedDose = roundDose(dosePerAdministration, 'mg');

  // Generate schedule times
  const scheduleHours = [];
  const intervalHours = 24 / frequency;

  for (let i = 0; i < frequency; i++) {
    const hour = 8 + (i * intervalHours); // Start at 8:00
    const adjustedHour = hour >= 24 ? hour - 24 : hour;
    scheduleHours.push(
      `${Math.floor(adjustedHour).toString().padStart(2, '0')}:00`
    );
  }

  return {
    success: true,
    totalDailyDose,
    frequency,
    dosePerAdministration: roundedDose,
    intervalHours,
    schedule: scheduleHours
  };
}

module.exports = {
  WARNING_LEVEL,
  calculateDose,
  roundDose,
  calculateTablets,
  validateDosage,
  getDosageWarnings,
  calculateDosingSchedule
};
