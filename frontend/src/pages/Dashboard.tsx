/**
 * VetCRM Receptionist Module - Dashboard Page
 *
 * @author Bartłomiej Król
 */

import { useState, useEffect } from 'react';
import { Calendar, Users, PawPrint, Clock } from 'lucide-react';
import { clientsService, petsService, appointmentsService } from '../services/api';

interface Stats {
  totalClients: number;
  totalPets: number;
  todayAppointments: number;
  upcomingAppointments: number;
}

interface Appointment {
  id: number;
  client_name: string;
  pet_name: string;
  doctor_name: string;
  scheduled_at: string;
  reason: string;
  status: string;
}

function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalPets: 0,
    todayAppointments: 0,
    upcomingAppointments: 0
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);

      const [clientsRes, petsRes, appointmentsRes] = await Promise.all([
        clientsService.getAll(),
        petsService.getAll(),
        appointmentsService.getAll({ date: today })
      ]);

      setStats({
        totalClients: clientsRes.data.data?.length || 0,
        totalPets: petsRes.data.data?.length || 0,
        todayAppointments: appointmentsRes.data.data?.length || 0,
        upcomingAppointments: appointmentsRes.data.data?.filter(
          (a: Appointment) => a.status === 'scheduled'
        ).length || 0
      });

      setTodayAppointments(appointmentsRes.data.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <Users size={24} color="#3498db" />
          <h3>{stats.totalClients}</h3>
          <p>Klientów</p>
        </div>
        <div className="stat-card">
          <PawPrint size={24} color="#27ae60" />
          <h3>{stats.totalPets}</h3>
          <p>Zwierząt</p>
        </div>
        <div className="stat-card">
          <Calendar size={24} color="#e74c3c" />
          <h3>{stats.todayAppointments}</h3>
          <p>Wizyt dzisiaj</p>
        </div>
        <div className="stat-card">
          <Clock size={24} color="#9b59b6" />
          <h3>{stats.upcomingAppointments}</h3>
          <p>Oczekujących</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Dzisiejsze wizyty</h2>
        </div>
        {todayAppointments.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>Brak wizyt na dzisiaj</p>
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
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>{apt.scheduled_at.slice(11, 16)}</td>
                  <td>{apt.client_name}</td>
                  <td>{apt.pet_name}</td>
                  <td>{apt.doctor_name}</td>
                  <td>{apt.reason || '-'}</td>
                  <td>
                    <span className={`badge badge-${apt.status === 'scheduled' ? 'info' : 'success'}`}>
                      {apt.status === 'scheduled' ? 'Zaplanowana' : apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
