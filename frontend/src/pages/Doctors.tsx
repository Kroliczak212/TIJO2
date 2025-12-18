/**
 * VetCRM Receptionist Module - Doctors Page
 *
 * @author Bartłomiej Król
 */

import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { doctorsService } from '../services/api';

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  email: string;
  phone: string;
}

interface WorkingHours {
  [key: string]: {
    start_time: string;
    end_time: string;
  } | null;
}

interface Slot {
  time: string;
  available: boolean;
}

function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({});
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await doctorsService.getAll();
      setDoctors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSchedule = async (doctor: Doctor) => {
    try {
      const response = await doctorsService.getSchedule(doctor.id);
      setSelectedDoctor(doctor);

      // Transform array from backend to map expected by frontend
      // Backend returns { workingHours: [{day_of_week, start_time, end_time}, ...] }
      const hoursMap: WorkingHours = {};
      const sourceData = response.data.workingHours || response.data.schedule || [];

      if (Array.isArray(sourceData)) {
        sourceData.forEach((item: any) => {
          if (item && item.day_of_week) {
            hoursMap[item.day_of_week] = {
              start_time: item.start_time,
              end_time: item.end_time
            };
          }
        });
      } else {
        // Fallback if it's already a map
        Object.assign(hoursMap, sourceData);
      }

      setWorkingHours(hoursMap);
      setShowScheduleModal(true);
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  const handleCheckAvailability = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowAvailabilityModal(true);
    loadAvailability(doctor.id, selectedDate);
  };

  const loadAvailability = async (doctorId: number, date: string) => {
    try {
      const response = await doctorsService.getAvailability(doctorId, date);
      // Backend returns ["08:00", "08:30", ...]
      const data = response.data;

      let slots: Slot[] = [];
      if (Array.isArray(data)) {
        // If it's a simple array of strings, map to Slot objects
        slots = data.map((time: string) => ({
          time,
          available: true
        }));
      } else if (data.availableSlots) {
        // Fallback to previous expected format
        slots = data.availableSlots;
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedDoctor) {
      loadAvailability(selectedDoctor.id, date);
    }
  };

  const getDayName = (day: string): string => {
    const names: { [key: string]: string } = {
      monday: 'Poniedziałek',
      tuesday: 'Wtorek',
      wednesday: 'Środa',
      thursday: 'Czwartek',
      friday: 'Piątek',
      saturday: 'Sobota',
      sunday: 'Niedziela'
    };
    return names[day] || day;
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Lekarze</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Lista lekarzy</h2>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Imię i nazwisko</th>
              <th>Specjalizacja</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.first_name} {doctor.last_name}</td>
                <td>{doctor.specialization || '-'}</td>
                <td>{doctor.email || '-'}</td>
                <td>{doctor.phone || '-'}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', marginRight: '5px' }}
                    onClick={() => handleViewSchedule(doctor)}
                    title="Harmonogram"
                  >
                    <Calendar size={16} />
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '5px 10px' }}
                    onClick={() => handleCheckAvailability(doctor)}
                    title="Dostępność"
                  >
                    <Clock size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Working Hours Modal */}
      {showScheduleModal && selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Harmonogram - {selectedDoctor.first_name} {selectedDoctor.last_name}</h2>
              <button className="modal-close" onClick={() => setShowScheduleModal(false)}>
                &times;
              </button>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Dzień</th>
                  <th>Godziny pracy</th>
                </tr>
              </thead>
              <tbody>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <tr key={day}>
                    <td>{getDayName(day)}</td>
                    <td>
                      {workingHours[day]
                        ? `${workingHours[day]!.start_time} - ${workingHours[day]!.end_time}`
                        : <span style={{ color: '#7f8c8d' }}>Dzień wolny</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailabilityModal && selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Dostępność - {selectedDoctor.first_name} {selectedDoctor.last_name}</h2>
              <button className="modal-close" onClick={() => setShowAvailabilityModal(false)}>
                &times;
              </button>
            </div>

            <div className="form-group">
              <label>Wybierz datę:</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>Dostępne sloty:</h3>
              {availableSlots.length === 0 ? (
                <p style={{ color: '#7f8c8d' }}>Brak dostępnych slotów w tym dniu</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {availableSlots.map((slot, index) => (
                    <span
                      key={index}
                      className={`badge ${slot.available ? 'badge-success' : 'badge-danger'}`}
                      style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                    >
                      {slot.time}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctors;
