/**
 * VetCRM Receptionist Module - Appointments Page
 *
 * @author Bartłomiej Król
 */

import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { appointmentsService, clientsService, petsService, doctorsService } from '../services/api';

interface Appointment {
  id: number;
  client_id: number;
  pet_id: number;
  doctor_id: number;
  client_name: string;
  pet_name: string;
  doctor_name: string;
  scheduled_at: string;
  reason: string;
  status: string;
  cancellationInfo?: {
    type: string;
    allowed: boolean;
    fee: number;
    message: string;
  };
}

interface Client {
  id: number;
  first_name: string;
  last_name: string;
}

interface Pet {
  id: number;
  name: string;
  client_id: number;
}

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialization: string;
}

function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    petId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  useEffect(() => {
    if (formData.clientId) {
      setFilteredPets(pets.filter(p => p.client_id === Number(formData.clientId)));
    } else {
      setFilteredPets([]);
    }
  }, [formData.clientId, pets]);

  // Load available time slots when doctor and date are selected
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (formData.doctorId && formData.date) {
        setLoadingSlots(true);
        try {
          const response = await doctorsService.getAvailability(
            Number(formData.doctorId),
            formData.date
          );
          setAvailableSlots(response.data || []);
          // Reset time when slots change
          setFormData(prev => ({ ...prev, time: '' }));
        } catch (error) {
          console.error('Error loading slots:', error);
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      } else {
        setAvailableSlots([]);
        setFormData(prev => ({ ...prev, time: '' }));
      }
    };

    loadAvailableSlots();
  }, [formData.doctorId, formData.date]);

  const loadData = async () => {
    try {
      const [clientsRes, petsRes, doctorsRes] = await Promise.all([
        clientsService.getAll(),
        petsService.getAll(),
        doctorsService.getAll()
      ]);
      setClients(clientsRes.data.data || []);
      setPets(petsRes.data.data || []);
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await appointmentsService.getAll({ date: selectedDate });
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      clientId: '',
      petId: '',
      doctorId: '',
      date: selectedDate,
      time: '',
      reason: ''
    });
    setAvailableSlots([]);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointmentsService.create({
        clientId: Number(formData.clientId),
        petId: Number(formData.petId),
        doctorId: Number(formData.doctorId),
        scheduledAt: `${formData.date} ${formData.time}`,
        reason: formData.reason || undefined
      });
      setShowModal(false);
      loadAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleCancelClick = async (appointment: Appointment) => {
    try {
      const response = await appointmentsService.getById(appointment.id);
      const appointmentData = response.data;

      // Backend zwraca 'cancellation', frontend oczekuje 'cancellationInfo'
      setSelectedAppointment({
        ...appointmentData,
        cancellationInfo: appointmentData.cancellation
      });
      setShowCancelModal(true);
    } catch (error) {
      console.error('Error loading appointment details:', error);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    try {
      await appointmentsService.cancel(selectedAppointment.id);
      setShowCancelModal(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || 'Nie można anulować wizyty');
    }
  };

  const getCancellationTypeColor = (type: string) => {
    switch (type) {
      case 'free':
        return '#27ae60';
      case 'warning':
        return '#f39c12';
      case 'fee':
        return '#e67e22';
      case 'blocked':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Wizyty</h1>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <label>Data:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '200px' }}
            />
          </div>
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <Plus size={18} /> Nowa wizyta
          </button>
        </div>

        {appointments.length === 0 ? (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px' }}>
            Brak wizyt na wybrany dzień
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Godzina</th>
                <th>Klient</th>
                <th>Zwierzę</th>
                <th>Lekarz</th>
                <th>Powód</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td>{apt.scheduled_at.slice(11, 16)}</td>
                  <td>{apt.client_name}</td>
                  <td>{apt.pet_name}</td>
                  <td>{apt.doctor_name}</td>
                  <td>{apt.reason || '-'}</td>
                  <td>
                    <span className={`badge badge-${apt.status === 'scheduled' ? 'info' : apt.status === 'cancelled' ? 'danger' : 'success'}`}>
                      {apt.status === 'scheduled' ? 'Zaplanowana' : apt.status === 'cancelled' ? 'Anulowana' : apt.status}
                    </span>
                  </td>
                  <td>
                    {apt.status === 'scheduled' && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px' }}
                        onClick={() => handleCancelClick(apt)}
                        title="Anuluj wizytę"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Nowa wizyta</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Klient *</label>
                <select
                  className="form-control"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value, petId: '' })}
                  required
                >
                  <option value="">Wybierz klienta</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Zwierzę *</label>
                <select
                  className="form-control"
                  value={formData.petId}
                  onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                  required
                  disabled={!formData.clientId}
                >
                  <option value="">Wybierz zwierzę</option>
                  {filteredPets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Lekarz *</label>
                <select
                  className="form-control"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  required
                >
                  <option value="">Wybierz lekarza</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.first_name} {doctor.last_name} ({doctor.specialization})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Data *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Godzina *</label>
                <select
                  className="form-control"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  disabled={!formData.doctorId || !formData.date || loadingSlots}
                >
                  <option value="">
                    {loadingSlots
                      ? 'Ładowanie dostępnych godzin...'
                      : !formData.doctorId || !formData.date
                      ? 'Najpierw wybierz lekarza i datę'
                      : availableSlots.length === 0
                      ? 'Brak dostępnych terminów'
                      : 'Wybierz godzinę'}
                  </option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {formData.doctorId && formData.date && availableSlots.length === 0 && !loadingSlots && (
                  <small style={{ color: '#e74c3c', display: 'block', marginTop: '5px' }}>
                    Lekarz nie pracuje w wybranym dniu lub wszystkie terminy są zajęte
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Powód wizyty</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="np. Kontrola, Szczepienie..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Anuluj
                </button>
                <button type="submit" className="btn btn-primary">
                  Utwórz wizytę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Anuluj wizytę</h2>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p><strong>Klient:</strong> {selectedAppointment.client_name}</p>
              <p><strong>Zwierzę:</strong> {selectedAppointment.pet_name}</p>
              <p><strong>Data:</strong> {selectedAppointment.scheduled_at}</p>
            </div>

            {selectedAppointment.cancellationInfo && (
              <div
                style={{
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: getCancellationTypeColor(selectedAppointment.cancellationInfo.type) + '20',
                  border: `1px solid ${getCancellationTypeColor(selectedAppointment.cancellationInfo.type)}`,
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <AlertTriangle size={20} color={getCancellationTypeColor(selectedAppointment.cancellationInfo.type)} />
                  <strong>{selectedAppointment.cancellationInfo.message}</strong>
                </div>
                {selectedAppointment.cancellationInfo.fee > 0 && (
                  <p style={{ margin: 0 }}>
                    Opłata za późne anulowanie: <strong>{selectedAppointment.cancellationInfo.fee} zł</strong>
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Zamknij
              </button>
              {selectedAppointment.cancellationInfo?.allowed && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmCancel}
                >
                  Potwierdź anulowanie
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
