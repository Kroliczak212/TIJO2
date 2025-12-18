/**
 * VetCRM Receptionist Module - Clients Page
 *
 * @author Bartłomiej Król
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { clientsService } from '../services/api';

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async (search?: string) => {
    try {
      const response = await clientsService.getAll(search ? { search } : undefined);
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadClients(searchTerm);
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email || '',
        phone: client.phone,
        address: client.address || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', address: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientsService.update(editingClient.id, formData);
      } else {
        await clientsService.create(formData);
      }
      setShowModal(false);
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego klienta?')) {
      try {
        await clientsService.delete(id);
        loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Klienci</h1>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Szukaj klienta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '300px' }}
            />
            <button className="btn btn-secondary" onClick={handleSearch}>
              <Search size={18} />
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Dodaj klienta
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Imię i nazwisko</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Adres</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.first_name} {client.last_name}</td>
                <td>{client.email || '-'}</td>
                <td>{client.phone}</td>
                <td>{client.address || '-'}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', marginRight: '5px' }}
                    onClick={() => handleOpenModal(client)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '5px 10px' }}
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingClient ? 'Edytuj klienta' : 'Dodaj klienta'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Imię *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nazwisko *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Telefon *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[\d\s+\-()]*$/.test(val)) {
                      setFormData({ ...formData, phone: val });
                    }
                  }}
                  pattern="[\d\s\+\-\(\)]*"
                  title="Numer telefonu może zawierać tylko cyfry, spacje i znaki: + - ( )"
                  required
                />
              </div>
              <div className="form-group">
                <label>Adres</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Anuluj
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Zapisz' : 'Dodaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;
