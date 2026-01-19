import React, { useState } from 'react';
import api from '../api';

function EditTaskModal({ task, clients, workers, onClose, onSuccess }) {
  const [description, setDescription] = useState(task.description);
  const [clientId, setClientId] = useState(task.client?.id || '');
  const [workerId, setWorkerId] = useState(task.assigned_worker?.id || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.patch(`tasks/${task.id}/`, {
        description,
        client_id: clientId || null,
        assigned_worker_id: workerId || null,
        due_date: dueDate || null,
        status,
      });

      onSuccess(response.data);
    } catch (err) {
      setError('Failed to update task. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        width: '600px',
        maxWidth: '90vw',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ margin: '0 0 30px 0', fontSize: '24px' }}>Edit Task</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Description <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '16px',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
              >
                <option value="">None</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Assign To</label>
              <select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
              >
                <option value="">Unassigned</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {error && <p style={{ color: '#d32f2f', marginBottom: '20px' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '12px 24px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px' }}
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
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;