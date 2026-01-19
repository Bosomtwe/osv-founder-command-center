import React, { useState } from 'react';
import api from '../api';

function ClientManager({ clients, onRefresh, searchQuery }) {  // ← Added searchQuery prop
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);

  const ClientForm = ({ client, onClose, onSuccess }) => {
    const [name, setName] = useState(client?.name || '');
    const [contactEmail, setContactEmail] = useState(client?.contact_email || '');
    const [phone, setPhone] = useState(client?.phone || '');
    const [notes, setNotes] = useState(client?.notes || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        if (client) {
          await api.patch(`clients/${client.id}/`, { name, contact_email: contactEmail, phone, notes });
        } else {
          await api.post('clients/', { name, contact_email: contactEmail, phone, notes });
        }
        onSuccess();
        onRefresh();
      } catch (err) {
        alert('Failed to save client');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '500px', maxWidth: '90vw' }}>
          <h2>{client ? 'Edit' : 'Create'} Client</h2>
          <form onSubmit={handleSubmit}>
            <input required placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input placeholder="Email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '12px 24px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px' }}>Cancel</button>
              <button type="submit" disabled={loading || !name.trim()} style={{ padding: '12px 24px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '8px' }}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Filter clients based on searchQuery
  const filteredClients = clients.filter(client =>
    searchQuery === '' ||
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.contact_email && client.contact_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.phone && client.phone.includes(searchQuery)) ||
    (client.notes && client.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Clients</h2>
        <button onClick={() => setShowCreate(true)} style={{ padding: '12px 24px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '8px' }}>
          + Add Client
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '15px' }}>Email</th>
            <th style={{ padding: '15px' }}>Phone</th>
            <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                {searchQuery ? 'No clients match your search.' : 'No clients yet'}
              </td>
            </tr>
          ) : (
            filteredClients.map(client => (
              <tr key={client.id}>
                <td style={{ padding: '15px' }}>{client.name}</td>
                <td style={{ padding: '15px' }}>{client.contact_email || '-'}</td>
                <td style={{ padding: '15px' }}>{client.phone || '-'}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <button onClick={() => { setEditingClient(client); setShowEdit(true); }} style={{ marginRight: '8px', color: '#1976d2' }}>Edit</button>
                  <button onClick={() => setDeletingClient(client)} style={{ color: '#d32f2f' }}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {(showCreate || showEdit) && (
        <ClientForm
          client={showEdit ? editingClient : null}
          onClose={() => { setShowCreate(false); setShowEdit(false); }}
          onSuccess={() => { setShowCreate(false); setShowEdit(false); }}
        />
      )}

      {deletingClient && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
            <h3>Delete {deletingClient.name}?</h3>
            <p>This cannot be undone.</p>
            <button onClick={async () => {
              await api.delete(`clients/${deletingClient.id}/`);
              onRefresh();
              setDeletingClient(null);
            }} style={{ padding: '12px 24px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', marginRight: '12px' }}>
              Delete
            </button>
            <button onClick={() => setDeletingClient(null)} style={{ padding: '12px 24px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientManager;