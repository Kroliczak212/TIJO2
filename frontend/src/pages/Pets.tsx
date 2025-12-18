/**
 * VetCRM Receptionist Module - Pets Page
 *
 * @author Bartłomiej Król
 */

import { useState, useEffect } from 'react';
import { Plus, Syringe, Edit } from 'lucide-react';
import { petsService, clientsService } from '../services/api';

interface Pet {
  id: number;
  client_id: number;
  name: string;
  species: string;
  breed: string;
  date_of_birth: string;
  weight: number;
  sex: string;
  color?: string;
  microchip_id?: string;
  notes?: string;
  owner_name?: string;
  ageInfo?: {
    years: number;
    months: number;
    humanYears: number;
  };
}

interface Client {
  id: number;
  first_name: string;
  last_name: string;
}

interface Vaccination {
  id: number;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string;
  status: string;
}

function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showVaccinations, setShowVaccinations] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    species: 'dog',
    breed: '',
    dateOfBirth: '',
    weight: '',
    sex: 'male',
    color: '',
    microchipId: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [petsRes, clientsRes] = await Promise.all([
        petsService.getAll(),
        clientsService.getAll()
      ]);
      setPets(petsRes.data.data || []);
      setClients(clientsRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsEditing(false);
    setEditingPetId(null);
    setFormData({
      clientId: '',
      name: '',
      species: 'dog',
      breed: '',
      dateOfBirth: '',
      weight: '',
      sex: 'male',
      color: '',
      microchipId: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleEditPet = (pet: Pet) => {
    setIsEditing(true);
    setEditingPetId(pet.id);
    setFormData({
      clientId: String(pet.client_id),
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      dateOfBirth: pet.date_of_birth || '',
      weight: pet.weight ? String(pet.weight) : '',
      sex: pet.sex || 'male',
      color: pet.color || '',
      microchipId: pet.microchip_id || '',
      notes: pet.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const petData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        sex: formData.sex,
        color: formData.color || undefined,
        microchipId: formData.microchipId || undefined,
        notes: formData.notes || undefined
      };

      if (isEditing && editingPetId) {
        await petsService.update(editingPetId, petData);
      } else {
        await petsService.create({
          clientId: Number(formData.clientId),
          ...petData
        });
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving pet:', error);
    }
  };

  const handleViewVaccinations = async (pet: Pet) => {
    try {
      const response = await petsService.getVaccinations(pet.id);
      setVaccinations(response.data.vaccinations || []);
      setSelectedPet(pet);
      setShowVaccinations(true);
    } catch (error) {
      console.error('Error loading vaccinations:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'current':
        return 'badge-success';
      case 'due_soon':
        return 'badge-warning';
      case 'overdue':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'current':
        return 'Aktualne';
      case 'due_soon':
        return 'Wkrótce';
      case 'overdue':
        return 'Przeterminowane';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Zwierzęta</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Lista zwierząt</h2>
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <Plus size={18} /> Dodaj zwierzę
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Gatunek</th>
              <th>Rasa</th>
              <th>Właściciel</th>
              <th>Waga</th>
              <th>Wiek</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => (
              <tr key={pet.id}>
                <td>{pet.name}</td>
                <td>{pet.species === 'dog' ? 'Pies' : pet.species === 'cat' ? 'Kot' : pet.species}</td>
                <td>{pet.breed || '-'}</td>
                <td>{pet.owner_name || '-'}</td>
                <td>{pet.weight ? `${pet.weight} kg` : '-'}</td>
                <td>
                  {pet.ageInfo
                    ? `${pet.ageInfo.years}l ${pet.ageInfo.months}m (${pet.ageInfo.humanYears} ludzkich lat)`
                    : '-'}
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', marginRight: '5px' }}
                    onClick={() => handleEditPet(pet)}
                    title="Edytuj"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', marginRight: '5px' }}
                    onClick={() => handleViewVaccinations(pet)}
                    title="Szczepienia"
                  >
                    <Syringe size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Pet Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Edytuj zwierzę' : 'Dodaj zwierzę'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Właściciel *</label>
                <select
                  className="form-control"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                  disabled={isEditing}
                >
                  <option value="">Wybierz właściciela</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Imię zwierzęcia *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gatunek *</label>
                <select
                  className="form-control"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
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
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Data urodzenia</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Waga (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Płeć</label>
                <select
                  className="form-control"
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                >
                  <option value="male">Samiec</option>
                  <option value="female">Samica</option>
                </select>
              </div>
              <div className="form-group">
                <label>Kolor</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Numer mikrochipu</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.microchipId}
                  onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Notatki</label>
                <textarea
                  className="form-control"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Anuluj
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Zapisz' : 'Dodaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vaccinations Modal */}
      {showVaccinations && selectedPet && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Szczepienia - {selectedPet.name}</h2>
              <button className="modal-close" onClick={() => setShowVaccinations(false)}>
                &times;
              </button>
            </div>
            {vaccinations.length === 0 ? (
              <p style={{ color: '#7f8c8d' }}>Brak szczepień w historii</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Szczepionka</th>
                    <th>Data</th>
                    <th>Następne</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map((vac) => (
                    <tr key={vac.id}>
                      <td>{vac.vaccine_name}</td>
                      <td>{vac.vaccination_date}</td>
                      <td>{vac.next_due_date || '-'}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(vac.status)}`}>
                          {getStatusLabel(vac.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Pets;
