import React, { useState, useEffect } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import api from '../api';

function EditTaskModal({ task, clients, workers, onClose, onSuccess }) {
  const [clientId, setClientId] = useState(task.client?.id || '');
  const [workerId, setWorkerId] = useState(task.assigned_worker?.id || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize BlockNote with existing JSON content (or fallback to plain text)
  const initialContent = (() => {
    if (typeof task.description === 'string') {
      try {
        return JSON.parse(task.description);
      } catch (e) {
        // Fallback: convert old plain text to single paragraph block
        return [{ type: "paragraph", content: task.description }];
      }
    }
    return task.description || [{ type: "paragraph", content: "" }];
  })();

  const editor = useCreateBlockNote({
    initialContent,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Get current rich content as JSON
    const richDescription = editor.document;

    try {
      const response = await api.patch(`tasks/${task.id}/`, {
        description: richDescription,           // send JSON directly
        client_id: clientId || null,
        assigned_worker_id: workerId || null,
        due_date: dueDate || null,
        status,
      });

      onSuccess(response.data);
      onClose();
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
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: isMobile ? '20px 16px' : '0',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'white',
        padding: isMobile ? '24px 20px' : '40px',
        borderRadius: '12px',
        width: isMobile ? '100%' : 'min(600px, 90vw)',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        marginTop: isMobile ? '20px' : '0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: isMobile ? '20px' : '24px',
            color: '#333'
          }}>
            Edit Task
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              fontSize: isMobile ? '15px' : '14px'
            }}>
              Description <span style={{ color: 'red' }}>*</span>
            </label>
            <div style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              minHeight: isMobile ? '140px' : '180px',
              background: '#fff',
              overflow: 'hidden',
            }}>
              <BlockNoteView editor={editor} />
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: isMobile ? '16px' : '20px', 
            marginBottom: '24px' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                fontSize: isMobile ? '15px' : '14px'
              }}>
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: isMobile ? '14px' : '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #ccc', 
                  fontSize: isMobile ? '16px' : '14px',
                  backgroundColor: '#fafafa'
                }}
              >
                <option value="">None</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                fontSize: isMobile ? '15px' : '14px'
              }}>
                Assign To
              </label>
              <select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: isMobile ? '14px' : '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #ccc', 
                  fontSize: isMobile ? '16px' : '14px',
                  backgroundColor: '#fafafa'
                }}
              >
                <option value="">Unassigned</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: isMobile ? '16px' : '20px', 
            marginBottom: '30px' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                fontSize: isMobile ? '15px' : '14px'
              }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: isMobile ? '14px' : '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #ccc', 
                  fontSize: isMobile ? '16px' : '14px',
                  backgroundColor: '#fafafa'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                fontSize: isMobile ? '15px' : '14px'
              }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: isMobile ? '14px' : '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #ccc', 
                  fontSize: isMobile ? '16px' : '14px',
                  backgroundColor: '#fafafa'
                }}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>

          {error && (
            <p style={{ 
              color: '#d32f2f', 
              marginBottom: '20px',
              padding: '12px',
              background: '#ffebee',
              borderRadius: '6px',
              fontSize: isMobile ? '15px' : '14px',
              textAlign: 'center'
            }}>
              {error}
            </p>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ 
                padding: isMobile ? '14px 20px' : '12px 24px', 
                background: '#f5f5f5', 
                border: '1px solid #ccc', 
                borderRadius: '8px',
                fontSize: isMobile ? '15px' : '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                minWidth: isMobile ? '100px' : 'auto'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: isMobile ? '14px 20px' : '12px 24px',
                background: loading ? '#9ca3af' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '15px' : '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                minWidth: isMobile ? '140px' : 'auto'
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