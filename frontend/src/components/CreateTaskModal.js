import React, { useState } from 'react';
import api from '../api';

function CreateTaskModal({ clients, workers, onClose, onSuccess }) {
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('tasks/', {
        description,
        client_id: clientId || null,
        assigned_worker_id: workerId || null,
        due_date: dueDate || null,
        status: 'TODO',
      });

      onSuccess(response.data);
    } catch (err) {
      setError('Failed to create task. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '500px',
        maxWidth: '90vw',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description *</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
              placeholder="What needs to be done?"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
              >
                <option value="">None</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Assign To</label>
              <select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
              >
                <option value="">Unassigned</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '12px 24px', border: '1px solid #ccc', borderRadius: '8px', background: 'white' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              style={{
                padding: '12px 24px',
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;