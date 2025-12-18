/**
 * VetCRM Receptionist Module - Calculators Page
 *
 * @author Bartłomiej Król
 */

import { useState, useEffect } from 'react';
import { Calculator, Pill, Scale } from 'lucide-react';
import { calculatorsService } from '../services/api';

interface Medication {
  id: number;
  name: string;
  dose_per_kg: number;
  unit: string;
  species: string;
  notes: string;
}

interface AgeResult {
  humanYears: number;
  lifeStage: string;
  description: string;
}

interface DosageResult {
  calculatedDose: number;
  unit: string;
  medication: string;
  warning?: string;
}

interface BmiResult {
  bcs: number;
  category: string;
  categoryDescription: string;
  idealWeight: number;
  weightDifference: number;
  recommendations: {
    diet: string;
    exercise: string;
    summary: string;
  };
}

function Calculators() {
  const [activeTab, setActiveTab] = useState('age');
  const [medications, setMedications] = useState<Medication[]>([]);

  // Age calculator state
  const [ageForm, setAgeForm] = useState({
    species: 'dog',
    ageYears: '',
    ageMonths: '',
    weight: ''
  });
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);

  // Dosage calculator state
  const [dosageForm, setDosageForm] = useState({
    medicationId: '',
    weight: '',
    species: 'dog'
  });
  const [dosageResult, setDosageResult] = useState<DosageResult | null>(null);

  // BMI calculator state
  const [bmiForm, setBmiForm] = useState({
    species: 'dog',
    breed: '',
    weight: ''
  });
  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const response = await calculatorsService.getMedications();
      // Backend returns array directly or { medications: [...] } depending on impl.
      // Current backend implementation returns array directly.
      const meds = Array.isArray(response.data) ? response.data : response.data.medications;
      setMedications(meds || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const handleCalculateAge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await calculatorsService.calculatePetAge({
        species: ageForm.species,
        ageYears: Number(ageForm.ageYears),
        ageMonths: ageForm.ageMonths ? Number(ageForm.ageMonths) : undefined,
        weight: ageForm.weight ? Number(ageForm.weight) : undefined
      });
      setAgeResult(response.data);
    } catch (error) {
      console.error('Error calculating age:', error);
    }
  };

  const handleCalculateDosage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await calculatorsService.calculateDosage({
        medicationId: Number(dosageForm.medicationId),
        weight: Number(dosageForm.weight),
        species: dosageForm.species
      });
      setDosageResult(response.data);
    } catch (error) {
      console.error('Error calculating dosage:', error);
    }
  };

  const handleCalculateBmi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await calculatorsService.calculateBmi({
        species: bmiForm.species,
        breed: bmiForm.breed || undefined,
        weight: Number(bmiForm.weight)
      });
      setBmiResult(response.data);
    } catch (error) {
      console.error('Error calculating BMI:', error);
    }
  };

  const getBcsColor = (bcs: number) => {
    if (bcs <= 2) return '#e74c3c';
    if (bcs <= 3) return '#f39c12';
    if (bcs <= 5) return '#27ae60';
    if (bcs <= 7) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Kalkulatory weterynaryjne</h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`btn ${activeTab === 'age' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('age')}
        >
          <Calculator size={18} /> Wiek zwierzęcia
        </button>
        <button
          className={`btn ${activeTab === 'dosage' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('dosage')}
        >
          <Pill size={18} /> Dawkowanie leków
        </button>
        <button
          className={`btn ${activeTab === 'bmi' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('bmi')}
        >
          <Scale size={18} /> BCS (Kondycja)
        </button>
      </div>

      {/* Age Calculator */}
      {activeTab === 'age' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Kalkulator wieku zwierzęcia</h2>
          </div>
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
            Przelicz wiek zwierzęcia na lata ludzkie i określ etap życia.
          </p>

          <form onSubmit={handleCalculateAge}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div className="form-group">
                <label>Gatunek *</label>
                <select
                  className="form-control"
                  value={ageForm.species}
                  onChange={(e) => setAgeForm({ ...ageForm, species: e.target.value })}
                >
                  <option value="dog">Pies</option>
                  <option value="cat">Kot</option>
                </select>
              </div>
              <div className="form-group">
                <label>Lata *</label>
                <input
                  type="number"
                  className="form-control"
                  value={ageForm.ageYears}
                  onChange={(e) => setAgeForm({ ...ageForm, ageYears: e.target.value })}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Miesiące</label>
                <input
                  type="number"
                  className="form-control"
                  value={ageForm.ageMonths}
                  onChange={(e) => setAgeForm({ ...ageForm, ageMonths: e.target.value })}
                  min="0"
                  max="11"
                />
              </div>
              <div className="form-group">
                <label>Waga (kg) - dla psów</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={ageForm.weight}
                  onChange={(e) => setAgeForm({ ...ageForm, weight: e.target.value })}
                  placeholder="Opcjonalne"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
              Oblicz
            </button>
          </form>

          {ageResult && (
            <div className="calculator-result">
              <h3>Wynik</h3>
              <div className="result-item">
                <span className="result-label">Wiek w latach ludzkich:</span>
                <span className="result-value">{ageResult.humanYears} lat</span>
              </div>
              <div className="result-item">
                <span className="result-label">Etap życia:</span>
                <span className="result-value">{ageResult.lifeStage}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Opis:</span>
                <span className="result-value">{ageResult.description}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dosage Calculator */}
      {activeTab === 'dosage' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Kalkulator dawkowania leków</h2>
          </div>
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
            Oblicz odpowiednią dawkę leku na podstawie wagi zwierzęcia.
          </p>

          <form onSubmit={handleCalculateDosage}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div className="form-group">
                <label>Lek *</label>
                <select
                  className="form-control"
                  value={dosageForm.medicationId}
                  onChange={(e) => setDosageForm({ ...dosageForm, medicationId: e.target.value })}
                  required
                >
                  <option value="">Wybierz lek</option>
                  {medications.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} ({med.dose_per_kg} {med.unit}/kg)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Gatunek *</label>
                <select
                  className="form-control"
                  value={dosageForm.species}
                  onChange={(e) => setDosageForm({ ...dosageForm, species: e.target.value })}
                >
                  <option value="dog">Pies</option>
                  <option value="cat">Kot</option>
                </select>
              </div>
              <div className="form-group">
                <label>Waga (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={dosageForm.weight}
                  onChange={(e) => setDosageForm({ ...dosageForm, weight: e.target.value })}
                  min="0.1"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
              Oblicz dawkę
            </button>
          </form>

          {dosageResult && (
            <div className="calculator-result">
              <h3>Wynik</h3>
              <div className="result-item">
                <span className="result-label">Lek:</span>
                <span className="result-value">{dosageResult.medication}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Obliczona dawka:</span>
                <span className="result-value" style={{ fontSize: '1.2rem', color: '#27ae60' }}>
                  {dosageResult.calculatedDose} {dosageResult.unit}
                </span>
              </div>
              {dosageResult.warning && (
                <div className="alert alert-error" style={{ marginTop: '15px' }}>
                  {dosageResult.warning}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BMI/BCS Calculator */}
      {activeTab === 'bmi' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Kalkulator BCS (Body Condition Score)</h2>
          </div>
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
            Oceń kondycję ciała zwierzęcia w skali 1-9 i uzyskaj zalecenia.
          </p>

          <form onSubmit={handleCalculateBmi}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div className="form-group">
                <label>Gatunek *</label>
                <select
                  className="form-control"
                  value={bmiForm.species}
                  onChange={(e) => setBmiForm({ ...bmiForm, species: e.target.value })}
                >
                  <option value="dog">Pies</option>
                  <option value="cat">Kot</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rasa</label>
                <input
                  type="text"
                  className="form-control"
                  value={bmiForm.breed}
                  onChange={(e) => setBmiForm({ ...bmiForm, breed: e.target.value })}
                  placeholder="np. Labrador"
                />
              </div>
              <div className="form-group">
                <label>Aktualna waga (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={bmiForm.weight}
                  onChange={(e) => setBmiForm({ ...bmiForm, weight: e.target.value })}
                  min="0.1"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
              Oceń kondycję
            </button>
          </form>

          {bmiResult && (
            <div className="calculator-result">
              <h3>Wynik</h3>

              {/* BCS Score Display */}
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div
                  style={{
                    display: 'inline-block',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: getBcsColor(bmiResult.bcs),
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    lineHeight: '80px'
                  }}
                >
                  {bmiResult.bcs}
                </div>
                <p style={{ marginTop: '10px', fontSize: '1.2rem', fontWeight: '600' }}>
                  {bmiResult.categoryDescription}
                </p>
              </div>

              <div className="result-item">
                <span className="result-label">Idealna waga:</span>
                <span className="result-value">{bmiResult.idealWeight} kg</span>
              </div>
              <div className="result-item">
                <span className="result-label">Różnica:</span>
                <span className="result-value" style={{ color: bmiResult.weightDifference > 0 ? '#e74c3c' : bmiResult.weightDifference < 0 ? '#f39c12' : '#27ae60' }}>
                  {bmiResult.weightDifference > 0 ? '+' : ''}{bmiResult.weightDifference.toFixed(1)} kg
                </span>
              </div>

              {bmiResult.recommendations && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Zalecenia:</h4>
                  <p><strong>Ogólnie:</strong> {bmiResult.recommendations.summary}</p>
                  <p><strong>Dieta:</strong> {bmiResult.recommendations.diet}</p>
                  <p><strong>Aktywność:</strong> {bmiResult.recommendations.exercise}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Calculators;
