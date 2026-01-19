import React, { useState } from 'react';
import api from '../api';

function WorkerManager({ workers, onRefresh, searchQuery }) {  // ← Added searchQuery prop
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [deletingWorker, setDeletingWorker] = useState(null);

  const WorkerForm = ({ worker, onClose, onSuccess }) => {
    const [name, setName] = useState(worker?.name || '');
    const [skills, setSkills] = useState(worker?.skills || '');
    const [availability, setAvailability] = useState(worker?.availability || '');
    const [contactEmail, setContactEmail] = useState(worker?.contact_email || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        if (worker) {
          await api.patch(`workers/${worker.id}/`, { name, skills, availability, contact_email: contactEmail });
        } else {
          await api.post('workers/', { name, skills, availability, contact_email: contactEmail });
        }
        onSuccess();
        onRefresh();
      } catch (err) {
        alert('Failed to save worker');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '500px', maxWidth: '90vw' }}>
          <h2>{worker ? 'Edit' : 'Create'} Worker</h2>
          <form onSubmit={handleSubmit}>
            <input required placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input placeholder="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input placeholder="Availability" value={availability} onChange={e => setAvailability(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input placeholder="Email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px', border: '1px solid #ccc' }} />
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

  // Filter workers based on searchQuery
  const filteredWorkers = workers.filter(worker =>
    searchQuery === '' ||
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (worker.skills && worker.skills.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (worker.availability && worker.availability.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (worker.contact_email && worker.contact_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Workers</h2>
        <button onClick={() => setShowCreate(true)} style={{ padding: '12px 24px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '8px' }}>
          + Add Worker
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '15px' }}>Skills</th>
            <th style={{ padding: '15px' }}>Availability</th>
            <th style={{ padding: '15px' }}>Email</th>
            <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredWorkers.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                {searchQuery ? 'No workers match your search.' : 'No workers yet'}
              </td>
            </tr>
          ) : (
            filteredWorkers.map(worker => (
              <tr key={worker.id}>
                <td style={{ padding: '15px' }}>{worker.name}</td>
                <td style={{ padding: '15px' }}>{worker.skills || '-'}</td>
                <td style={{ padding: '15px' }}>{worker.availability || '-'}</td>
                <td style={{ padding: '15px' }}>{worker.contact_email || '-'}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <button onClick={() => { setEditingWorker(worker); setShowEdit(true); }} style={{ marginRight: '8px', color: '#1976d2' }}>Edit</button>
                  <button onClick={() => setDeletingWorker(worker)} style={{ color: '#d32f2f' }}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {(showCreate || showEdit) && (
        <WorkerForm
          worker={showEdit ? editingWorker : null}
          onClose={() => { setShowCreate(false); setShowEdit(false); }}
          onSuccess={() => { setShowCreate(false); setShowEdit(false); }}
        />
      )}

      {deletingWorker && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
            <h3>Delete {deletingWorker.name}?</h3>
            <p>This cannot be undone.</p>
            <button onClick={async () => {
              await api.delete(`workers/${deletingWorker.id}/`);
              onRefresh();
              setDeletingWorker(null);
            }} style={{ padding: '12px 24px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', marginRight: '12px' }}>
              Delete
            </button>
            <button onClick={() => setDeletingWorker(null)} style={{ padding: '12px 24px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerManager;